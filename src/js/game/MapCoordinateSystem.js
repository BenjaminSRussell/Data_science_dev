/**
 * MapCoordinateSystem.js - Optimized for linear time complexity
 * Uses spatial grid for O(1) coordinate checks
 * All coordinates use grid system (0-30)
 */

import { MapGridSystem } from './MapGridSystem.js';

export class MapCoordinateSystem {
    constructor(gridSystem = null) {
        // Use provided grid system or create default
        this.gridSystem = gridSystem || new MapGridSystem();
        
        // Grid cells: Map<gridKey, Set<type>>
        this.grid = new Map();
        
        // Reverse index: type -> Set<gridKey> for fast cleanup
        this.typeIndex = new Map();
    }

    /**
     * Get grid key for coordinate - O(1)
     * All coordinates are grid coordinates (0-30)
     */
    getGridKey(x, y) {
        return this.gridSystem.getGridKey(x, y);
    }

    /**
     * Get all grid keys within radius - O(1) for small radius
     * All coordinates are grid coordinates (0-30)
     */
    getGridKeysInRadius(x, y, radius) {
        const coords = this.gridSystem.getGridCircle(x, y, radius);
        return coords.map(coord => this.gridSystem.getGridKey(coord.x, coord.y));
    }

    /**
     * Check if coordinate is available - O(1) with grid lookup
     * All coordinates are grid coordinates (0-30)
     */
    isAvailable(x, y, radius = 1) {
        // Clamp to bounds
        const clamped = this.gridSystem.clampGridCoord(x, y);
        const gridX = clamped.x;
        const gridY = clamped.y;
        
        // Check all grid cells within radius
        const keys = this.getGridKeysInRadius(gridX, gridY, radius);
        
        // If any nearby cell is occupied, coordinate is not available
        for (const key of keys) {
            if (this.grid.has(key)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Occupy a coordinate - O(1)
     * All coordinates are grid coordinates (0-30)
     */
    occupyCoord(x, y, type) {
        // Clamp to bounds
        const clamped = this.gridSystem.clampGridCoord(x, y);
        const gridX = clamped.x;
        const gridY = clamped.y;
        
        const key = this.gridSystem.getGridKey(gridX, gridY);
        
        // Add to grid
        if (!this.grid.has(key)) {
            this.grid.set(key, new Set());
        }
        this.grid.get(key).add(type);
        
        // Add to type index for fast cleanup
        if (!this.typeIndex.has(type)) {
            this.typeIndex.set(type, new Set());
        }
        this.typeIndex.get(type).add(key);
    }

    /**
     * Release a coordinate - O(1)
     * All coordinates are grid coordinates (0-30)
     */
    releaseCoord(x, y, type) {
        // Clamp to bounds
        const clamped = this.gridSystem.clampGridCoord(x, y);
        const key = this.gridSystem.getGridKey(clamped.x, clamped.y);
        const cell = this.grid.get(key);
        
        if (cell) {
            cell.delete(type);
            if (cell.size === 0) {
                this.grid.delete(key);
            }
        }
        
        // Remove from type index
        const typeKeys = this.typeIndex.get(type);
        if (typeKeys) {
            typeKeys.delete(key);
            if (typeKeys.size === 0) {
                this.typeIndex.delete(type);
            }
        }
    }

    /**
     * Find nearest available coordinate - O(k) where k is search radius
     * Returns grid coordinates
     */
    findAvailableCoord(preferredX, preferredY, type = 'location') {
        // All coordinates are grid coordinates (0-30)
        const gridX = preferredX;
        const gridY = preferredY;
        
        // Try preferred location first - O(1)
        if (this.isAvailable(gridX, gridY)) {
            this.occupyCoord(gridX, gridY, type);
            return { x: gridX, y: gridY };
        }

        // Spiral search outward - O(k) where k is number of cells checked
        let radius = 1;
        const maxRadius = 10;
        
        while (radius <= maxRadius) {
            // Check points in spiral pattern
            const angleStep = 15;
            for (let angle = 0; angle < 360; angle += angleStep) {
                const rad = (angle * Math.PI) / 180;
                const testX = Math.round(gridX + radius * Math.cos(rad));
                const testY = Math.round(gridY + radius * Math.sin(rad));
                
                if (this.gridSystem.isValidGridCoord(testX, testY) && this.isAvailable(testX, testY)) {
                    this.occupyCoord(testX, testY, type);
                    return { x: testX, y: testY };
                }
            }
            radius += 1;
        }

        // Fallback: find any available spot
        return this.findRandomAvailable(type);
    }

    /**
     * Find random available coordinate - O(k) worst case
     * Returns grid coordinates
     */
    findRandomAvailable(type = 'random') {
        const bounds = this.gridSystem.bounds;
        
        // Try random positions
        for (let attempts = 0; attempts < 100; attempts++) {
            const gridX = Math.floor(Math.random() * (bounds.maxX - bounds.minX + 1)) + bounds.minX;
            const gridY = Math.floor(Math.random() * (bounds.maxY - bounds.minY + 1)) + bounds.minY;
            
            if (this.isAvailable(gridX, gridY)) {
                this.occupyCoord(gridX, gridY, type);
                return { x: gridX, y: gridY };
            }
        }
        
        // Last resort: use center
        const centerX = Math.floor(this.gridSystem.gridWidth / 2);
        const centerY = Math.floor(this.gridSystem.gridHeight / 2);
        this.occupyCoord(centerX, centerY, type);
        return { x: centerX, y: centerY };
    }

    /**
     * Reserve area for NPC house near location - O(1)
     * Returns grid coordinates
     */
    findNPCHouseCoord(locationX, locationY) {
        // All coordinates are grid coordinates (0-30)
        const gridX = locationX;
        const gridY = locationY;
        
        // Place house 2-4 tiles away from location
        const distance = 2 + Math.random() * 2;
        const angle = Math.random() * 360;
        const rad = (angle * Math.PI) / 180;
        
        const offsetX = Math.round(distance * Math.cos(rad));
        const offsetY = Math.round(distance * Math.sin(rad));
        
        const testX = gridX + offsetX;
        const testY = gridY + offsetY;
        
        const clamped = this.gridSystem.clampGridCoord(testX, testY);
        const coord = this.findAvailableCoord(clamped.x, clamped.y, 'npc_house');
        return coord;
    }

    /**
     * Clear all coordinates - O(n) where n is number of occupied cells
     */
    clear() {
        this.grid.clear();
        this.typeIndex.clear();
    }

    /**
     * Clear coordinates of specific type - O(k) where k is cells of that type
     */
    clearType(type) {
        const typeKeys = this.typeIndex.get(type);
        if (!typeKeys) return;
        
        for (const key of typeKeys) {
            const cell = this.grid.get(key);
            if (cell) {
                cell.delete(type);
                if (cell.size === 0) {
                    this.grid.delete(key);
                }
            }
        }
        this.typeIndex.delete(type);
    }

    /**
     * Initialize with existing locations - O(n) where n is location count
     */
    initializeWithLocations(locations) {
        this.clear();
        for (const loc of locations) {
            if (loc.position) {
                this.occupyCoord(loc.position.x, loc.position.y, 'location');
            }
        }
    }
}
