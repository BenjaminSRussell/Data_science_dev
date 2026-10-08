/**
 * Map pipeline fixes: road width + spacing (#1919, #1925), zone-bounded
 * blocks (#1945), no stacking fallback (#1944), road-preferring A* (#1943,
 * #1942), integer grid cells (#1935), inclusive street-tree count (#1566),
 * renderRoad axes (#2314)
 */
import { describe, it, expect, vi } from 'vitest';
import { MapGridSystem } from '../../src/js/game/MapGridSystem.js';
import { MapRoadSystem } from '../../src/js/game/MapRoadSystem.js';
import { MapZoneSystem } from '../../src/js/game/MapZoneSystem.js';
import { MapBlockSystem } from '../../src/js/game/MapBlockSystem.js';
import { MapBuildingSystem } from '../../src/js/game/MapBuildingSystem.js';
import { MapAssetPlacer } from '../../src/js/game/MapAssetPlacer.js';
import { MapEnvironmentSystem } from '../../src/js/game/MapEnvironmentSystem.js';
import { MapNavigationSystem } from '../../src/js/game/MapNavigationSystem.js';
import { MapRoadRenderer } from '../../src/js/game/MapRoadRenderer.js';
import { getAllZones } from '../../src/js/data/mapZones.js';

function city() {
    const grid = new MapGridSystem({});
    const roads = new MapRoadSystem(grid);
    const zones = new MapZoneSystem(grid);
    const blocks = new MapBlockSystem(grid, roads, zones);
    const buildings = new MapBuildingSystem(grid, roads, blocks, zones);
    const placer = new MapAssetPlacer(grid, roads, buildings);
    return { grid, roads, zones, blocks, buildings, placer };
}

describe('MapRoadSystem width and spacing', () => {
    it('a road of width w marks exactly w cells across', () => {
        expect(MapRoadSystem.widthOffsets(1)).toEqual([0]);
        expect(MapRoadSystem.widthOffsets(2)).toEqual([0, 1]);
        expect(MapRoadSystem.widthOffsets(3)).toEqual([-1, 0, 1]);
        const { roads } = city();
        const secondary = roads.roads.find(r => r.type === 'SECONDARY' && r.direction === 'horizontal');
        const x = 0; // column 0 is not crossed by a vertical road
        const col = [-2, -1, 0, 1, 2].map(o => roads.isRoad(x, secondary.position + o));
        expect(col).toEqual([false, false, true, true, false]);
    });

    it('leaves real buildable space in every zone', () => {
        const { grid, roads } = city();
        let road = 0;
        for (let x = 0; x < grid.gridWidth; x++) for (let y = 0; y < grid.gridHeight; y++) if (roads.isRoad(x, y)) road++;
        expect(road / (grid.gridWidth * grid.gridHeight)).toBeLessThan(0.75);
        for (const zone of getAllZones()) {
            let free = 0;
            const b = zone.bounds;
            for (let x = b.minX; x <= b.maxX; x++) for (let y = b.minY; y <= b.maxY; y++) if (!roads.isRoad(x, y)) free++;
            expect(free, zone.id).toBeGreaterThan(0);
        }
    });

    it('MapEnvironmentSystem places elements and buildings can be placed (#1919, #1925)', () => {
        const c = city();
        const env = new MapEnvironmentSystem(c.grid, c.roads, c.zones, c.placer);
        env.initialize();
        expect(env.environmentElements.length).toBeGreaterThan(10);
        expect(c.blocks.blocks.length).toBeGreaterThan(10);
        const placed = c.buildings.placeBuilding({ id: 'test_shop', type: 'shop', name: 'Shop' });
        expect(placed).toBeTruthy();
    });
});

describe('MapBlockSystem', () => {
    it('no block straddles two zones (#1945)', () => {
        const { blocks, zones } = city();
        for (const block of blocks.blocks) {
            const ids = new Set();
            const { x, y, width, height } = block.bounds;
            for (let gx = x; gx < x + width; gx++) for (let gy = y; gy < y + height; gy++) {
                ids.add(zones.getZoneAt(gx, gy)?.id ?? null);
            }
            expect(ids.size, block.id).toBe(1);
        }
    });

    it('fallback shares the least-crowded big-enough block, never a too-small one (#1944)', () => {
        const { blocks } = city();
        const big1 = { id: 'b1', bounds: { width: 4, height: 4 }, locations: ['a', 'b'] };
        const big2 = { id: 'b2', bounds: { width: 4, height: 4 }, locations: ['c'] };
        const tiny = { id: 't', bounds: { width: 1, height: 1 }, locations: [] };
        blocks.getBlocksByZoneType = () => [big1, tiny, big2];
        expect(blocks.findAvailableBlock('x', 3)).toBe(big2);
        blocks.getBlocksByZoneType = () => [tiny];
        expect(blocks.findAvailableBlock('x', 3)).toBeNull();
    });
});

describe('MapNavigationSystem', () => {
    // 5x3 grid: a road along row 0; row 1 is road-side
    const grid = { isValidGridCoord: (x, y) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < 5 && y >= 0 && y < 3 };
    const roadSystem = { isRoad: (x, y) => y === 0 && x >= 0 && x < 5 };

    it('prefers road tiles over equally long road-side routes (#1943)', () => {
        const nav = new MapNavigationSystem(grid, roadSystem);
        // (0,0) -> (4,0): the road row and the road-side row are both 4 steps;
        // only the road row is the cheap one
        const path = nav.aStarPathfinding(0, 0, 4, 0);
        expect(path.every(p => p.y === 0)).toBe(true);
        expect(nav.stepCost(2, 0)).toBe(1);
        expect(nav.stepCost(2, 1)).toBe(MapNavigationSystem.OFF_ROAD_COST);
    });

    it('neighbours are road or road-side tiles only (#1942)', () => {
        const nav = new MapNavigationSystem(grid, roadSystem);
        const from = nav.getNeighbors(2, 1).map(n => `${n.x},${n.y}`).sort();
        expect(from).toEqual(['1,1', '2,0', '3,1']); // (2,2) is two away from the road
    });
});

describe('MapGridSystem integer cells (#1935)', () => {
    it('rejects fractional coordinates and keys them by containing cell', () => {
        const grid = new MapGridSystem({});
        expect(grid.isValidGridCoord(12, 20)).toBe(true);
        expect(grid.isValidGridCoord(12.5, 20)).toBe(false);
        expect(grid.getGridKey(12.5, 20.9)).toBe(grid.getGridKey(12, 20));
        expect(grid.clampGridCoord(12.7, -3)).toEqual({ x: 12, y: grid.bounds.minY });
    });
});

describe('MapEnvironmentSystem street trees (#1566)', () => {
    it('counts zone bounds inclusively', () => {
        const c = city();
        const env = new MapEnvironmentSystem(c.grid, c.roads, c.zones, c.placer);
        const zone = { id: 'z', type: 'residential', bounds: { minX: 0, maxX: 2, minY: 0, maxY: 2 } };
        const attempts = vi.spyOn(env, 'placeWithRetry').mockReturnValue(false);
        env.addStreetTrees(zone);
        // (3 + 3) / 3 = 2 attempts; the exclusive formula gave (2 + 2) / 3 = 1
        expect(attempts).toHaveBeenCalledTimes(2);
        attempts.mockRestore();
    });
});

describe('MapRoadRenderer.roadTileRect (#2314)', () => {
    it('uses position as the row for horizontal roads and the column for vertical ones', () => {
        expect(MapRoadRenderer.roadTileRect({ direction: 'horizontal', position: 10, start: 0, end: 29, width: 3 }))
            .toEqual({ x: 0, y: 9, width: 30, height: 3 });
        expect(MapRoadRenderer.roadTileRect({ direction: 'vertical', position: 5, start: 0, end: 29, width: 2 }))
            .toEqual({ x: 5, y: 0, width: 2, height: 30 });
    });

    it('renders a vertical road at its own column, full height', () => {
        const container = document.createElement('div');
        const grid = new MapGridSystem({});
        const r = new MapRoadRenderer(grid, { getRoads: () => [], getIntersections: () => [] }, container);
        r.renderRoad({ id: 'v', type: 'MAIN', direction: 'vertical', position: 10, start: 0, end: grid.gridHeight - 1, width: 3, color: '#333' });
        const el = container.querySelector('[data-road-id="v"]');
        const pct = (prop) => parseFloat(el.style[prop]);
        expect(pct('left')).toBeCloseTo((9 * grid.tileSize / grid.totalWidth) * 100, 5);
        expect(pct('top')).toBeCloseTo(0, 5);
        expect(pct('height')).toBeCloseTo(100, 5);
    });
});
