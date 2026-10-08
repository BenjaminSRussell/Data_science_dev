/**
 * MapNavigationSystem.js
 * Map navigation system with pathfinding using roads
 * Calculates travel time and shows visual path indicators
 */

export class MapNavigationSystem {
    constructor(gridSystem, roadSystem) {
        this.gridSystem = gridSystem;
        this.roadSystem = roadSystem;
        this.pathCache = new Map();
    }

    /**
     * Find path between two grid coordinates using roads
     * Uses A* pathfinding algorithm
     */
    findPath(startX, startY, endX, endY) {
        const cacheKey = `${startX},${startY}-${endX},${endY}`;
        if (this.pathCache.has(cacheKey)) {
            // Hand out a copy so a caller can't corrupt the cached path
            return this.pathCache.get(cacheKey).slice();
        }
        
        const path = this.aStarPathfinding(startX, startY, endX, endY);
        this.pathCache.set(cacheKey, path);
        return path.slice();
    }

    /**
     * A* pathfinding algorithm
     */
    aStarPathfinding(startX, startY, endX, endY) {
        const startH = this.heuristic(startX, startY, endX, endY);
        const openSet = [{ x: startX, y: startY, g: 0, h: startH, f: startH, parent: null }];
        const closedSet = new Set();
        const openMap = new Map();
        openMap.set(`${startX},${startY}`, openSet[0]);
        
        while (openSet.length > 0) {
            // Get node with lowest f score
            openSet.sort((a, b) => (a.f ?? (a.g + a.h)) - (b.f ?? (b.g + b.h)));
            const current = openSet.shift();
            openMap.delete(`${current.x},${current.y}`);
            
            // Check if reached goal
            if (current.x === endX && current.y === endY) {
                // Reconstruct path
                const path = [];
                let node = current;
                while (node) {
                    path.unshift({ x: node.x, y: node.y });
                    node = node.parent;
                }
                return path;
            }
            
            closedSet.add(`${current.x},${current.y}`);
            
            // Check neighbors
            const neighbors = this.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                
                if (closedSet.has(key)) continue;
                
                const g = current.g + 1;
                const h = this.heuristic(neighbor.x, neighbor.y, endX, endY);
                const f = g + h;
                
                const existing = openMap.get(key);
                if (existing) {
                    if (g < existing.g) {
                        existing.g = g;
                        existing.h = h;
                        existing.f = f;
                        existing.parent = current;
                    }
                } else {
                    const newNode = { x: neighbor.x, y: neighbor.y, g, h, f, parent: current };
                    openSet.push(newNode);
                    openMap.set(key, newNode);
                }
            }
        }
        
        // No path found
        return [];
    }

    /**
     * Get valid neighbors (must be on roads or adjacent to roads)
     */
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -1 }, // up
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }  // left
        ];
        
        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            
            if (this.gridSystem.isValidGridCoord(nx, ny)) {
                // Allow movement on roads or adjacent to roads
                if (this.roadSystem.isRoad(nx, ny) || 
                    this.roadSystem.isRoad(x, y) ||
                    this.isAdjacentToRoad(nx, ny)) {
                    neighbors.push({ x: nx, y: ny });
                }
            }
        }
        
        return neighbors;
    }

    /**
     * Check if coordinate is adjacent to a road
     */
    isAdjacentToRoad(x, y) {
        return this.roadSystem.isRoad(x - 1, y) ||
               this.roadSystem.isRoad(x + 1, y) ||
               this.roadSystem.isRoad(x, y - 1) ||
               this.roadSystem.isRoad(x, y + 1);
    }

    /**
     * Heuristic function (Manhattan distance)
     */
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    /**
     * Calculate travel time based on path and vehicle speed
     */
    calculateTravelTime(path, vehicleSpeed = 1) {
        if (!Array.isArray(path) || path.length === 0) return 0;
        // A zero/negative/invalid speed would give Infinity or a negative time
        if (!(Number(vehicleSpeed) > 0)) vehicleSpeed = 1;
        
        // Base time is path length
        const baseTime = path.length;
        
        // Adjust for vehicle speed (higher speed = less time)
        const adjustedTime = Math.max(1, Math.ceil(baseTime / vehicleSpeed));
        
        return adjustedTime;
    }

    /**
     * Get visual path data for rendering
     */
    getPathVisualData(path) {
        if (!Array.isArray(path) || path.length < 2) return [];
        
        const segments = [];
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            
            segments.push({
                start: this.gridSystem.gridToPixel(start.x, start.y),
                end: this.gridSystem.gridToPixel(end.x, end.y)
            });
        }
        
        return segments;
    }

    /**
     * Clear path cache
     */
    clearCache() {
        this.pathCache.clear();
    }
}
