/**
 * MapAssetPlacer.js
 * Asset placement logic with collision detection
 * Handles placement of buildings, NPCs, decorations, etc.
 */

const isPositiveInt = (n) => Number.isInteger(n) && n > 0;

function isValidFootprint(x, y, width, height) {
    return Number.isInteger(x) && Number.isInteger(y) && isPositiveInt(width) && isPositiveInt(height);
}

export class MapAssetPlacer {
    constructor(gridSystem, roadSystem, buildingSystem) {
        this.gridSystem = gridSystem;
        this.roadSystem = roadSystem;
        this.buildingSystem = buildingSystem;
        this.assetGrid = new Map(); // Track all assets
        this.assets = [];
        this.placements = new Map(); // id -> footprint actually claimed
    }

    /**
     * Place an asset with collision detection.
     * Re-placing an asset that is already on the map (same id) moves it: its
     * old cells are released and the asset list keeps a single entry.
     */
    placeAsset(asset) {
        if (!asset) return false;
        const { x, y, width = 1, height = 1, type = 'generic' } = asset;
        if (!isValidFootprint(x, y, width, height)) {
            return false;
        }
        asset.type = type;

        // Check if placement is valid (the asset's own cells don't block it)
        if (!this.canPlaceAsset(x, y, width, height, asset.id)) {
            return false;
        }

        const hasId = asset.id !== undefined && asset.id !== null;
        if (hasId && this.placements.has(asset.id)) {
            this.unmarkAssetCells(asset.id);
        }

        // Remember the footprint actually claimed, so removal frees exactly
        // these cells even if the asset object is mutated later.
        const footprint = { x, y, width, height };
        if (hasId) this.placements.set(asset.id, footprint);
        this.markAssetCells({ ...footprint, id: asset.id });

        const index = hasId ? this.assets.findIndex(a => a.id === asset.id) : -1;
        if (index === -1) {
            this.assets.push(asset);
        } else {
            this.assets[index] = asset;
        }

        return true;
    }

    /**
     * Check if asset can be placed
     */
    canPlaceAsset(x, y, width, height, excludeId = null) {
        if (!isValidFootprint(x, y, width, height)) {
            return false;
        }

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
     * Release the cells recorded for an asset id (only cells it still owns).
     */
    unmarkAssetCells(assetId, footprint = this.placements.get(assetId)) {
        if (!footprint) return;
        const { x, y, width = 1, height = 1 } = footprint;
        for (let checkY = y; checkY < y + height; checkY++) {
            for (let checkX = x; checkX < x + width; checkX++) {
                const key = this.gridSystem.getGridKey(checkX, checkY);
                if (this.assetGrid.get(key) === assetId) {
                    this.assetGrid.delete(key);
                }
            }
        }
        this.placements.delete(assetId);
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
    findAvailablePosition(preferredX, preferredY, width = 1, height = 1, maxRadius = 5, accept = null) {
        const fits = (x, y) =>
            (!accept || accept(x, y)) && this.canPlaceAsset(x, y, width, height);

        // Try preferred position first
        if (fits(preferredX, preferredY)) {
            return { x: preferredX, y: preferredY };
        }
        
        // Ring search: check every cell at Chebyshev distance 1..maxRadius,
        // nearest (Euclidean) first, so no cell in a ring is skipped.
        for (let radius = 1; radius <= maxRadius; radius++) {
            const ring = [];
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) === radius) ring.push([dx, dy]);
                }
            }
            ring.sort((a, b) => (a[0] ** 2 + a[1] ** 2) - (b[0] ** 2 + b[1] ** 2));
            for (const [dx, dy] of ring) {
                const testX = preferredX + dx;
                const testY = preferredY + dy;
                if (this.gridSystem.isValidGridCoord(testX, testY) && fits(testX, testY)) {
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
        
        // Unmark the cells it was placed on (not wherever the object says now)
        const { x, y, width = 1, height = 1 } = asset;
        this.unmarkAssetCells(assetId, this.placements.get(assetId) ?? { x, y, width, height });
        
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
        this.placements.clear();
    }
}
