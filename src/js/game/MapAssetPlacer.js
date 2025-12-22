/**
 * MapAssetPlacer.js
 * Asset placement logic with collision detection
 * Handles placement of buildings, NPCs, decorations, etc.
 */

export class MapAssetPlacer {
    constructor(gridSystem, roadSystem, buildingSystem) {
        this.gridSystem = gridSystem;
        this.roadSystem = roadSystem;
        this.buildingSystem = buildingSystem;
        this.assetGrid = new Map(); // Track all assets
        this.assets = [];
    }

    /**
     * Place an asset with collision detection
     */
    placeAsset(asset) {
        const { x, y, width = 1, height = 1, type } = asset;
        
        // Check if placement is valid
        if (!this.canPlaceAsset(x, y, width, height, asset.id)) {
            return false;
        }
        
        // Mark cells as occupied
        this.markAssetCells(asset);
        
        // Store asset
        this.assets.push(asset);
        
        return true;
    }

    /**
     * Check if asset can be placed
     */
    canPlaceAsset(x, y, width, height, excludeId = null) {
        // Check all cells the asset would occupy
        for (let checkY = y; checkY < y + height; checkY++) {
            for (let checkX = x; checkX < x + width; checkX++) {
                // Check bounds
                if (!this.gridSystem.isValidGridCoord(checkX, checkY)) {
                    return false;
                }
                
                // Check if road
                if (this.roadSystem.isRoad(checkX, checkY)) {
                    return false;
                }
                
                // Check if building
                const building = this.buildingSystem.getBuildingAt(checkX, checkY);
                if (building) {
                    return false;
                }
                
                // Check if other asset (excluding self)
                const key = this.gridSystem.getGridKey(checkX, checkY);
                const existingAsset = this.assetGrid.get(key);
                if (existingAsset && existingAsset !== excludeId) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Mark grid cells as occupied by asset
     */
    markAssetCells(asset) {
        const { x, y, width = 1, height = 1, id } = asset;
        
        for (let checkY = y; checkY < y + height; checkY++) {
            for (let checkX = x; checkX < x + width; checkX++) {
                const key = this.gridSystem.getGridKey(checkX, checkY);
                this.assetGrid.set(key, id);
            }
        }
    }

    /**
     * Find available position for asset
     */
    findAvailablePosition(preferredX, preferredY, width = 1, height = 1, maxRadius = 5) {
        // Try preferred position first
        if (this.canPlaceAsset(preferredX, preferredY, width, height)) {
            return { x: preferredX, y: preferredY };
        }
        
        // Spiral search
        for (let radius = 1; radius <= maxRadius; radius++) {
            for (let angle = 0; angle < 360; angle += 15) {
                const rad = (angle * Math.PI) / 180;
                const testX = Math.round(preferredX + radius * Math.cos(rad));
                const testY = Math.round(preferredY + radius * Math.sin(rad));
                
                if (this.gridSystem.isValidGridCoord(testX, testY) &&
                    this.canPlaceAsset(testX, testY, width, height)) {
                    return { x: testX, y: testY };
                }
            }
        }
        
        return null;
    }

    /**
     * Remove asset
     */
    removeAsset(assetId) {
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) return false;
        
        // Unmark cells
        const { x, y, width = 1, height = 1 } = asset;
        for (let checkY = y; checkY < y + height; checkY++) {
            for (let checkX = x; checkX < x + width; checkX++) {
                const key = this.gridSystem.getGridKey(checkX, checkY);
                this.assetGrid.delete(key);
            }
        }
        
        // Remove from assets
        const index = this.assets.findIndex(a => a.id === assetId);
        if (index !== -1) {
            this.assets.splice(index, 1);
        }
        
        return true;
    }

    /**
     * Get asset at coordinates
     */
    getAssetAt(x, y) {
        const key = this.gridSystem.getGridKey(x, y);
        const assetId = this.assetGrid.get(key);
        if (assetId) {
            return this.assets.find(a => a.id === assetId);
        }
        return null;
    }

    /**
     * Get all assets
     */
    getAllAssets() {
        return this.assets;
    }

    /**
     * Clear all assets
     */
    clear() {
        this.assets = [];
        this.assetGrid.clear();
    }
}
