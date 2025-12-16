/**
 * MapCoordinateSystem.js
 * Prevents overlapping by managing coordinates systematically
 */

export class MapCoordinateSystem {
    constructor() {
        this.occupiedCoords = new Set();
        this.gridSize = 5; // Minimum distance between points (percentage)
        this.bounds = { minX: 5, maxX: 95, minY: 5, maxY: 95 };
    }

    /**
     * Find nearest available coordinate
     */
    findAvailableCoord(preferredX, preferredY, type = 'location') {
        // Try preferred location first
        if (this.isAvailable(preferredX, preferredY)) {
            this.occupyCoord(preferredX, preferredY, type);
            return { x: preferredX, y: preferredY };
        }

        // Spiral search outward
        let radius = this.gridSize;
        const maxRadius = 50;
        
        while (radius <= maxRadius) {
            for (let angle = 0; angle < 360; angle += 15) {
                const rad = (angle * Math.PI) / 180;
                const x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, 
                    preferredX + radius * Math.cos(rad)));
                const y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, 
                    preferredY + radius * Math.sin(rad)));
                
                if (this.isAvailable(x, y)) {
                    this.occupyCoord(x, y, type);
                    return { x, y };
                }
            }
            radius += this.gridSize;
        }

        // Fallback: random position
        return this.findRandomAvailable();
    }

    /**
     * Check if coordinate is available
     */
    isAvailable(x, y) {
        const key = this.getCoordKey(x, y);
        if (this.occupiedCoords.has(key)) return false;

        // Check distance from all occupied coords
        for (const occupiedKey of this.occupiedCoords) {
            const [ox, oy] = this.parseCoordKey(occupiedKey);
            const distance = Math.sqrt(Math.pow(x - ox, 2) + Math.pow(y - oy, 2));
            if (distance < this.gridSize) return false;
        }

        return true;
    }

    /**
     * Occupy a coordinate
     */
    occupyCoord(x, y, type) {
        const key = this.getCoordKey(x, y);
        this.occupiedCoords.add(key);
    }

    /**
     * Release a coordinate
     */
    releaseCoord(x, y) {
        const key = this.getCoordKey(x, y);
        this.occupiedCoords.delete(key);
    }

    /**
     * Get coordinate key for Set
     */
    getCoordKey(x, y) {
        // Round to grid
        const gridX = Math.round(x / this.gridSize) * this.gridSize;
        const gridY = Math.round(y / this.gridSize) * this.gridSize;
        return `${gridX},${gridY}`;
    }

    /**
     * Parse coordinate key
     */
    parseCoordKey(key) {
        return key.split(',').map(Number);
    }

    /**
     * Find random available coordinate
     */
    findRandomAvailable() {
        for (let attempts = 0; attempts < 100; attempts++) {
            const x = this.bounds.minX + Math.random() * (this.bounds.maxX - this.bounds.minX);
            const y = this.bounds.minY + Math.random() * (this.bounds.maxY - this.bounds.minY);
            
            if (this.isAvailable(x, y)) {
                this.occupyCoord(x, y, 'random');
                return { x, y };
            }
        }
        
        // Last resort: use grid system
        return { x: 50, y: 50 };
    }

    /**
     * Reserve area for NPC house near location
     */
    findNPCHouseCoord(locationX, locationY) {
        // Place house 8-12% away from location
        const distance = 8 + Math.random() * 4;
        const angle = Math.random() * 360;
        const rad = (angle * Math.PI) / 180;
        
        const x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX,
            locationX + distance * Math.cos(rad)));
        const y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY,
            locationY + distance * Math.sin(rad)));
        
        const coord = this.findAvailableCoord(x, y, 'npc_house');
        return coord;
    }

    /**
     * Clear all coordinates
     */
    clear() {
        this.occupiedCoords.clear();
    }

    /**
     * Initialize with existing locations
     */
    initializeWithLocations(locations) {
        this.clear();
        locations.forEach(loc => {
            if (loc.position) {
                this.occupyCoord(loc.position.x, loc.position.y, 'location');
            }
        });
    }
}




