/**
 * MapBuildingSystem.js
 * Building placement system for the city map
 * Handles building sizes, placement rules, and rendering
 */

export class MapBuildingSystem {
    constructor(gridSystem, roadSystem, blockSystem, zoneSystem = null, assetPlacer = null) {
        this.gridSystem = gridSystem;
        this.roadSystem = roadSystem;
        this.blockSystem = blockSystem;
        this.zoneSystem = zoneSystem;
        this.assetPlacer = assetPlacer;
        this.buildings = [];
        this.buildingGrid = new Map(); // Track occupied grid cells
    }

    /**
     * Building size definitions
     */
    buildingSizes = {
        SMALL: { width: 1, height: 1 },      // 1x1 block
        MEDIUM: { width: 2, height: 2 },     // 2x2 blocks
        LARGE: { width: 3, height: 3 },       // 3x3 blocks
        XLARGE: { width: 4, height: 4 }      // 4x4 blocks
    };

    /**
     * Building type to size mapping
     */
    buildingTypeSizes = {
        'residence': 'SMALL',
        'work': 'MEDIUM',
        'education': 'LARGE',
        'finance': 'MEDIUM',
        'government': 'LARGE',
        'shop': 'SMALL',
        'social': 'MEDIUM',
        'training': 'MEDIUM',
        'business': 'LARGE',
        'elite': 'XLARGE',
        'investment': 'MEDIUM',
        'shopping': 'LARGE'
    };

    /**
     * Place a building for a location
     */
    placeBuilding(location) {
        // Get appropriate building size
        const sizeKey = this.buildingTypeSizes[location.type] || 'SMALL';
        const size = this.buildingSizes[sizeKey];
        
        // Get block for location
        let block = this.blockSystem.getBlockForLocation(location.id);
        if (!block) {
            // Try to find an available block using zone system
            const zoneSystem = this.zoneSystem || this.blockSystem.zoneSystem;
            if (zoneSystem) {
                const zone = zoneSystem.findZoneForLocationType(location.type);
                if (zone) {
                    const availableBlock = this.blockSystem.findAvailableBlock(zone.type, size.width);
                    if (availableBlock) {
                        this.blockSystem.assignLocationToBlock(location.id, availableBlock.id);
                        block = availableBlock;
                    }
                }
            }
            if (!block) {
                // Last resort: find any block near the location's grid position
                if (location.position && location.position.x > 100) {
                    // Grid coordinates
                    const nearbyBlock = this.blockSystem.getBlockAt(location.position.x, location.position.y);
                    if (nearbyBlock) {
                        this.blockSystem.assignLocationToBlock(location.id, nearbyBlock.id);
                        block = nearbyBlock;
                    }
                }
            }
            if (!block) return null;
        }
        
        return this.placeBuildingInBlock(location, block, size);
    }

    /**
     * Place building in a specific block
     */
    placeBuildingInBlock(location, block, size) {
        // Find position within block (center it)
        const blockWidth = block.bounds.width;
        const blockHeight = block.bounds.height;
        
        // Calculate position to center building in block
        const startX = block.bounds.x + Math.floor((blockWidth - size.width) / 2);
        const startY = block.bounds.y + Math.floor((blockHeight - size.height) / 2);
        
        // Ensure building doesn't overlap roads
        if (this.canPlaceBuilding(startX, startY, size.width, size.height)) {
            const building = {
                id: `building-${location.id}`,
                locationId: location.id,
                position: {
                    x: startX,
                    y: startY
                },
                size: {
                    width: size.width,
                    height: size.height
                },
                type: location.type,
                zone: block.zone
            };
            
            this.buildings.push(building);
            this.markBuildingCells(building);
            
            return building;
        }
        
        // Fallback: try adjacent positions
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            for (let offsetY = -1; offsetY <= 1; offsetY++) {
                const testX = startX + offsetX;
                const testY = startY + offsetY;
                
                if (this.canPlaceBuilding(testX, testY, size.width, size.height)) {
                    const building = {
                        id: `building-${location.id}`,
                        locationId: location.id,
                        position: {
                            x: testX,
                            y: testY
                        },
                        size: {
                            width: size.width,
                            height: size.height
                        },
                        type: location.type,
                        zone: block.zone
                    };
                    
                    this.buildings.push(building);
                    this.markBuildingCells(building);
                    
                    return building;
                }
            }
        }
        
        return null;
    }

    /**
     * Check if building can be placed at coordinates
     */
    canPlaceBuilding(startX, startY, width, height) {
        // Check all cells the building would occupy
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                // Check bounds
                if (!this.gridSystem.isValidGridCoord(x, y)) {
                    return false;
                }
                
                // Check if road
                if (this.roadSystem.isRoad(x, y)) {
                    return false;
                }
                
                // Check if already occupied
                const key = this.gridSystem.getGridKey(x, y);
                if (this.buildingGrid.has(key)) {
                    return false;
                }
                
                // Check if an asset occupies this cell
                if (this.assetPlacer) {
                    const asset = this.assetPlacer.getAssetAt(x, y);
                    if (asset) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    /**
     * Mark grid cells as occupied by building
     */
    markBuildingCells(building) {
        for (let y = building.position.y; y < building.position.y + building.size.height; y++) {
            for (let x = building.position.x; x < building.position.x + building.size.width; x++) {
                const key = this.gridSystem.getGridKey(x, y);
                this.buildingGrid.set(key, building.id);
            }
        }
    }

    /**
     * Get building for location
     */
    getBuildingForLocation(locationId) {
        return this.buildings.find(b => b.locationId === locationId);
    }

    /**
     * Get all buildings
     */
    getAllBuildings() {
        return this.buildings;
    }

    /**
     * Get buildings in zone
     */
    getBuildingsInZone(zoneId) {
        return this.buildings.filter(b => b.zone === zoneId);
    }

    /**
     * Get building at grid coordinates
     */
    getBuildingAt(x, y) {
        const key = this.gridSystem.getGridKey(x, y);
        const buildingId = this.buildingGrid.get(key);
        if (buildingId) {
            return this.buildings.find(b => b.id === buildingId);
        }
        return null;
    }

    /**
     * Get building data for rendering
     */
    getBuildingData() {
        return {
            buildings: this.buildings,
            buildingGrid: Array.from(this.buildingGrid.entries())
        };
    }
}
