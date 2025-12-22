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
     * Find block boundaries starting from a seed coordinate
     */
    findBlockBoundaries(startX, startY, visited) {
        // Find the top-left corner of the block
        let minX = startX;
        let minY = startY;
        
        // Expand right to find width
        let maxX = startX;
        while (maxX < this.gridSystem.gridWidth - 1 && 
               !this.roadSystem.isRoad(maxX + 1, startY) &&
               !visited.has(this.gridSystem.getGridKey(maxX + 1, startY))) {
            maxX++;
        }
        
        // Expand down to find height
        let maxY = startY;
        let isValid = true;
        while (isValid && maxY < this.gridSystem.gridHeight - 1) {
            // Check if entire row is valid
            for (let x = minX; x <= maxX; x++) {
                if (this.roadSystem.isRoad(x, maxY + 1) ||
                    visited.has(this.gridSystem.getGridKey(x, maxY + 1))) {
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
    findAvailableBlock(zoneType, minSize = 1) {
        const blocks = this.getBlocksByZoneType(zoneType);
        
        // Filter by size and availability
        const available = blocks.filter(block => 
            block.bounds.width >= minSize &&
            block.bounds.height >= minSize &&
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
        
        // Fallback: return any block in zone
        if (blocks.length > 0) {
            return blocks[0];
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
