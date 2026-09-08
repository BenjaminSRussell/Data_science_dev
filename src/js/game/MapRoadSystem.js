/**
 * MapRoadSystem.js
 * Road network architecture for blocky city map
 * Defines main roads, secondary roads, local roads, and intersections
 */

export class MapRoadSystem {
    constructor(gridSystem) {
        this.gridSystem = gridSystem;
        this.roads = [];
        this.intersections = [];
        this.roadGrid = new Map(); // Track which grid cells are roads
        
        // Road hierarchy - wider and more visible
        this.roadTypes = {
            MAIN: { width: 3, priority: 3, color: '#2a2a2a' },      // 3 tiles wide - major arteries
            SECONDARY: { width: 2, priority: 2, color: '#3a3a3a' }, // 2 tiles wide - secondary streets
            LOCAL: { width: 1, priority: 1, color: '#4a4a4a' }      // 1 tile wide - local roads
        };
        
        this.initializeRoadNetwork();
    }

    /**
     * Initialize the road network - Cleaner blocky city layout
     */
    initializeRoadNetwork() {
        const gridWidth = this.gridSystem.gridWidth;
        const gridHeight = this.gridSystem.gridHeight;
        
        // Main horizontal arteries (every 6 rows) - creates larger blocks
        for (let y = 6; y < gridHeight; y += 6) {
            this.addRoad('horizontal', y, 'MAIN', 0, gridWidth - 1);
        }
        
        // Main vertical arteries (every 6 columns)
        for (let x = 6; x < gridWidth; x += 6) {
            this.addRoad('vertical', x, 'MAIN', 0, gridHeight - 1);
        }
        
        // Secondary roads (every 3 rows/cols) - creates medium blocks
        for (let y = 3; y < gridHeight; y += 6) {
            if (y % 6 !== 0) { // Not a main road
                this.addRoad('horizontal', y, 'SECONDARY', 0, gridWidth - 1);
            }
        }
        
        for (let x = 3; x < gridWidth; x += 6) {
            if (x % 6 !== 0) { // Not a main road
                this.addRoad('vertical', x, 'SECONDARY', 0, gridHeight - 1);
            }
        }
        
        // Find and mark intersections
        this.findIntersections();
    }

    /**
     * Add a road segment
     * @param {string} direction - 'horizontal' or 'vertical'
     * @param {number} position - Row (for horizontal) or column (for vertical)
     * @param {string} type - 'MAIN', 'SECONDARY', or 'LOCAL'
     * @param {number} start - Start coordinate
     * @param {number} end - End coordinate
     */
    addRoad(direction, position, type, start, end) {
        const roadType = this.roadTypes[type];
        const road = {
            id: `road-${direction}-${position}-${type}`,
            direction,
            position,
            type,
            start,
            end,
            width: roadType.width,
            priority: roadType.priority,
            color: roadType.color
        };
        
        this.roads.push(road);
        
        // Mark grid cells as roads
        if (direction === 'horizontal') {
            for (let x = start; x <= end; x++) {
                // Mark center tile
                this.markRoadCell(x, position);
                // If road is wider than 1 tile, mark adjacent tiles
                if (roadType.width >= 2) {
                    const halfWidth = Math.floor(roadType.width / 2);
                    for (let offset = 1; offset <= halfWidth; offset++) {
                        if (position - offset >= 0) this.markRoadCell(x, position - offset);
                        if (position + offset < this.gridSystem.gridHeight) this.markRoadCell(x, position + offset);
                    }
                }
            }
        } else { // vertical
            for (let y = start; y <= end; y++) {
                // Mark center tile
                this.markRoadCell(position, y);
                // If road is wider than 1 tile, mark adjacent tiles
                if (roadType.width >= 2) {
                    const halfWidth = Math.floor(roadType.width / 2);
                    for (let offset = 1; offset <= halfWidth; offset++) {
                        if (position - offset >= 0) this.markRoadCell(position - offset, y);
                        if (position + offset < this.gridSystem.gridWidth) this.markRoadCell(position + offset, y);
                    }
                }
            }
        }
    }

    /**
     * Mark a grid cell as a road
     */
    markRoadCell(x, y) {
        const key = this.gridSystem.getGridKey(x, y);
        this.roadGrid.set(key, true);
    }

    /**
     * Check if a grid cell is a road
     */
    isRoad(x, y) {
        const key = this.gridSystem.getGridKey(x, y);
        return this.roadGrid.has(key);
    }

    /**
     * Find all intersections (where roads cross)
     */
    findIntersections() {
        const horizontalRoads = this.roads.filter(r => r.direction === 'horizontal');
        const verticalRoads = this.roads.filter(r => r.direction === 'vertical');
        
        for (const hRoad of horizontalRoads) {
            for (const vRoad of verticalRoads) {
                const x = vRoad.position;
                const y = hRoad.position;
                
                // Check if they actually intersect
                if (x >= hRoad.start && x <= hRoad.end && 
                    y >= vRoad.start && y <= vRoad.end) {
                    
                    const intersection = {
                        id: `intersection-${x}-${y}`,
                        x,
                        y,
                        horizontalRoad: hRoad,
                        verticalRoad: vRoad,
                        type: this.getIntersectionType(hRoad, vRoad)
                    };
                    
                    this.intersections.push(intersection);
                }
            }
        }
    }

    /**
     * Get intersection type (4-way, T-junction, dead-end, etc.)
     * Compares the road start/end coordinates against the intersection
     * coordinate to determine which arms of the intersection exist.
     */
    getIntersectionType(hRoad, vRoad) {
        const x = vRoad.position;
        const y = hRoad.position;

        // Horizontal arms: does the road extend left/right of the intersection?
        const west = x > hRoad.start;
        const east = x < hRoad.end;
        // Vertical arms: does the road extend up/down of the intersection?
        const north = y > vRoad.start;
        const south = y < vRoad.end;

        const arms = [west, east, north, south].filter(Boolean).length;

        if (arms === 4) return '4-way';
        if (arms === 3) return 'T-junction';
        if (arms === 2) return 'straight';
        if (arms === 1) return 'dead-end';
        return 'isolated';
    }

    /**
     * Get all roads
     */
    getRoads() {
        return this.roads;
    }

    /**
     * Get all intersections
     */
    getIntersections() {
        return this.intersections;
    }

    /**
     * Get roads at a specific grid coordinate
     */
    getRoadsAt(x, y) {
        return this.roads.filter(road => {
            if (road.direction === 'horizontal') {
                return road.position === y && x >= road.start && x <= road.end;
            } else {
                return road.position === x && y >= road.start && y <= road.end;
            }
        });
    }

    /**
     * Get intersection at a specific grid coordinate
     */
    getIntersectionAt(x, y) {
        return this.intersections.find(int => int.x === x && int.y === y);
    }

    /**
     * Check if a coordinate is on a road
     */
    isOnRoad(x, y) {
        return this.isRoad(x, y);
    }

    /**
     * Get road network data for rendering
     */
    getRoadNetworkData() {
        return {
            roads: this.roads,
            intersections: this.intersections,
            roadGrid: this.roadGrid
        };
    }
}
