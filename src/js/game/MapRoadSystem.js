/**
 * MapRoadSystem.js
 * Road network architecture for blocky city map
 * Defines main roads, secondary roads, local roads, and intersections
 */

export class MapRoadSystem {
    static MAIN_SPACING = 10;

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
        
        // Road spacing leaves real city blocks between bands. With a 3-wide
        // MAIN every 10 tiles and a 2-wide SECONDARY halfway between, about a
        // third of a 30x30 grid stays buildable; the old 3-tile spacing tiled
        // the grid with road (#1919, #1925).
        const MAIN_SPACING = MapRoadSystem.MAIN_SPACING;
        const half = Math.floor(MAIN_SPACING / 2);

        // Main arteries
        for (let y = MAIN_SPACING; y < gridHeight; y += MAIN_SPACING) {
            this.addRoad('horizontal', y, 'MAIN', 0, gridWidth - 1);
        }
        for (let x = MAIN_SPACING; x < gridWidth; x += MAIN_SPACING) {
            this.addRoad('vertical', x, 'MAIN', 0, gridHeight - 1);
        }

        // Secondary streets halfway between arteries
        for (let y = half; y < gridHeight; y += MAIN_SPACING) {
            this.addRoad('horizontal', y, 'SECONDARY', 0, gridWidth - 1);
        }
        for (let x = half; x < gridWidth; x += MAIN_SPACING) {
            this.addRoad('vertical', x, 'SECONDARY', 0, gridHeight - 1);
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
                for (const offset of MapRoadSystem.widthOffsets(roadType.width)) {
                    const y = position + offset;
                    if (y >= 0 && y < this.gridSystem.gridHeight) this.markRoadCell(x, y);
                }
            }
        } else { // vertical
            for (let y = start; y <= end; y++) {
                for (const offset of MapRoadSystem.widthOffsets(roadType.width)) {
                    const x = position + offset;
                    if (x >= 0 && x < this.gridSystem.gridWidth) this.markRoadCell(x, y);
                }
            }
        }
    }

    /**
     * Cross-axis offsets a road of `width` tiles covers around its centre
     * line: exactly `width` cells (1 -> [0], 2 -> [0, 1], 3 -> [-1, 0, 1]).
     * The old floor(width/2) on both sides made a 2-wide road 3 cells wide,
     * which tiled the 30x30 grid with road and starved every placement
     * system (#1919, #1925).
     */
    static widthOffsets(width) {
        const w = Math.max(1, Math.floor(Number(width) || 1));
        const before = Math.floor((w - 1) / 2);
        const offsets = [];
        for (let o = -before; o < w - before; o++) offsets.push(o + 0); // +0 normalises -0
        return offsets;
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
     * Get intersection type (4-way, T-junction, etc.)
     */
    getIntersectionType(hRoad, vRoad) {
        // Horizontal road runs along Y=hy spanning [hx0,hx1]; vertical along X=vx spanning [vy0,vy1].
        const hx0 = Math.min(hRoad.start.x, hRoad.end.x);
        const hx1 = Math.max(hRoad.start.x, hRoad.end.x);
        const hy = hRoad.start.y;
        const vx = vRoad.start.x;
        const vy0 = Math.min(vRoad.start.y, vRoad.end.y);
        const vy1 = Math.max(vRoad.start.y, vRoad.end.y);
        let arms = 0;
        if (hx0 < vx) arms++;
        if (hx1 > vx) arms++;
        if (vy0 < hy) arms++;
        if (vy1 > hy) arms++;
        if (arms <= 1) return 'dead-end';
        if (arms === 3) return 'T-junction';
        return '4-way';
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
