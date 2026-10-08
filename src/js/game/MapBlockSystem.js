/**
 * MapBlockSystem.js
 * Block structure system - defines blocks within zones
 * Blocks are areas bounded by roads where buildings can be placed
 */

export class MapBlockSystem {
    constructor(gridSystem, roadSystem, zoneSystem) {
        this.gridSystem = gridSystem;
        this.roadSystem = roadSystem;
        this.zoneSystem = zoneSystem;
        this.blocks = [];
        this.blockGrid = new Map(); // Map grid key to block ID
        
        this.generateBlocks();
    }

    /**
     * Generate blocks from road network
     * Blocks are rectangular areas bounded by roads
     */
    generateBlocks() {
        const gridWidth = this.gridSystem.gridWidth;
        const gridHeight = this.gridSystem.gridHeight;
        
        // Find block boundaries (areas between roads)
        const visited = new Set();
        
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const key = this.gridSystem.getGridKey(x, y);
                
                // Skip if already part of a block or is a road
                if (visited.has(key) || this.roadSystem.isRoad(x, y)) {
                    continue;
                }
                
                // Find the block boundaries
                const block = this.findBlockBoundaries(x, y, visited);
                if (block) {
                    this.blocks.push(block);
                    
                    // Mark all cells in block as visited
                    const blockCoords = this.gridSystem.getGridRect(
                        block.bounds.x,
                        block.bounds.y,
                        block.bounds.width,
                        block.bounds.height
                    );
                    
                    for (const coord of blockCoords) {
                        const coordKey = this.gridSystem.getGridKey(coord.x, coord.y);
                        visited.add(coordKey);
                        this.blockGrid.set(coordKey, block.id);
                    }
                }
            }
        }
        
        // Assign blocks to zones
        this.assignBlocksToZones();
    }

    /**
     * Zone id at a cell, or null outside every zone / without a zone system
     */
    zoneIdAt(x, y) {
        return this.zoneSystem?.getZoneAt?.(x, y)?.id ?? null;
    }

    /**
     * Find block boundaries starting from a seed coordinate
     */
    findBlockBoundaries(startX, startY, visited) {
        // Find the top-left corner of the block
        let minX = startX;
        let minY = startY;

        // A block never straddles two zones: growth stops where the zone
        // changes, so the zone assigned from its centre covers every cell (#1945)
        const startZone = this.zoneIdAt(startX, startY);
        const blocked = (x, y) => this.roadSystem.isRoad(x, y) ||
            visited.has(this.gridSystem.getGridKey(x, y)) ||
            this.zoneIdAt(x, y) !== startZone;

        // Expand right to find width
        let maxX = startX;
        while (maxX < this.gridSystem.gridWidth - 1 && !blocked(maxX + 1, startY)) {
            maxX++;
        }
        
        // Expand down to find height
        let maxY = startY;
        let isValid = true;
        while (isValid && maxY < this.gridSystem.gridHeight - 1) {
            // Check if entire row is valid
            for (let x = minX; x <= maxX; x++) {
                if (blocked(x, maxY + 1)) {
                    isValid = false;
                    break;
                }
            }
            if (isValid) {
                maxY++;
            }
        }
        
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        
        // Only create block if it's at least 1x1
        if (width > 0 && height > 0) {
            const blockId = `block-${minX}-${minY}`;
            return {
                id: blockId,
                bounds: {
                    x: minX,
                    y: minY,
                    width,
                    height
                },
                center: {
                    x: minX + Math.floor(width / 2),
                    y: minY + Math.floor(height / 2)
                },
                zone: null,
                locations: [],
                buildings: []
            };
        }
        
        return null;
    }

    /**
     * Assign blocks to zones based on their center coordinates
     */
    assignBlocksToZones() {
        for (const block of this.blocks) {
            const zone = this.zoneSystem.getZoneAt(block.center.x, block.center.y);
            if (zone) {
                block.zone = zone.id;
            }
        }
    }

    /**
     * Get block at grid coordinates
     */
    getBlockAt(x, y) {
        const key = this.gridSystem.getGridKey(x, y);
        const blockId = this.blockGrid.get(key);
        if (blockId) {
            return this.blocks.find(b => b.id === blockId);
        }
        return null;
    }

    /**
     * Get blocks in a zone
     */
    getBlocksInZone(zoneId) {
        return this.blocks.filter(block => block.zone === zoneId);
    }

    /**
     * Get blocks by zone type
     */
    getBlocksByZoneType(zoneType) {
        const zones = this.zoneSystem.getZonesByType(zoneType);
        const zoneIds = zones.map(z => z.id);
        return this.blocks.filter(block => zoneIds.includes(block.zone));
    }

    /**
     * Assign location to block
     */
    assignLocationToBlock(locationId, blockId) {
        const block = this.blocks.find(b => b.id === blockId);
        if (block && !block.locations.includes(locationId)) {
            block.locations.push(locationId);
        }
    }

    /**
     * Get block for location
     */
    getBlockForLocation(locationId) {
        return this.blocks.find(block => block.locations.includes(locationId));
    }

    /**
     * Find available block for location placement
     */
    findAvailableBlock(zoneType, minDimensions = { width: 1, height: 1 }) {
        const blocks = this.getBlocksByZoneType(zoneType);

        // Handle both legacy single parameter and new object parameter
        const minWidth = minDimensions.width || minDimensions;
        const minHeight = minDimensions.height || minDimensions;

        // Filter by size and availability
        const available = blocks.filter(block =>
            block.bounds.width >= minWidth &&
            block.bounds.height >= minHeight &&
            block.locations.length === 0 // No locations yet
        );
        
        if (available.length > 0) {
            // Return largest available block
            return available.sort((a, b) => {
                const aSize = a.bounds.width * a.bounds.height;
                const bSize = b.bounds.width * b.bounds.height;
                return bSize - aSize;
            })[0];
        }
        
        // No empty block fits: share the least-crowded block that is big
        // enough instead of always piling onto blocks[0] (#1944). Blocks that
        // are too small are never returned.
        const bigEnough = blocks.filter(block =>
            block.bounds.width >= minWidth && block.bounds.height >= minHeight
        );
        if (bigEnough.length > 0) {
            return bigEnough.reduce((best, block) =>
                block.locations.length < best.locations.length ? block : best
            );
        }

        return null;
    }

    /**
     * Get all blocks
     */
    getAllBlocks() {
        return this.blocks;
    }

    /**
     * Get block data for rendering
     */
    getBlockData() {
        return {
            blocks: this.blocks,
            blockGrid: Array.from(this.blockGrid.entries())
        };
    }
}
