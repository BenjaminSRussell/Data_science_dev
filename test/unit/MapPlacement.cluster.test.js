import { describe, it, expect, vi } from 'vitest';
import { MapAssetPlacer } from '../../src/js/game/MapAssetPlacer.js';
import { MapBuildingSystem } from '../../src/js/game/MapBuildingSystem.js';
import { MapEnvironmentSystem } from '../../src/js/game/MapEnvironmentSystem.js';

function makeGrid(size = 10) {
    return {
        isValidGridCoord: (x, y) => x >= 0 && y >= 0 && x < size && y < size,
        getGridKey: (x, y) => `${x},${y}`,
    };
}

function makePlacer({ roads = new Set(), buildings = new Set() } = {}) {
    const grid = makeGrid();
    const road = { isRoad: (x, y) => roads.has(`${x},${y}`) };
    const building = { getBuildingAt: (x, y) => (buildings.has(`${x},${y}`) ? {} : null) };
    return new MapAssetPlacer(grid, road, building);
}

describe('MapAssetPlacer footprint validation (#1949)', () => {
    it('rejects zero, negative and fractional sizes and coordinates', () => {
        const placer = makePlacer();
        expect(placer.placeAsset({ id: 'a', x: 1, y: 1, width: 0 })).toBe(false);
        expect(placer.placeAsset({ id: 'b', x: 1, y: 1, height: -2 })).toBe(false);
        expect(placer.placeAsset({ id: 'c', x: 1.5, y: 1 })).toBe(false);
        expect(placer.canPlaceAsset(1, 1, 0, 1)).toBe(false);
        expect(placer.assets).toHaveLength(0);
        expect(placer.assetGrid.size).toBe(0);
    });

    it('still accepts default 1x1 and explicit multi-cell assets', () => {
        const placer = makePlacer();
        expect(placer.placeAsset({ id: 'a', x: 0, y: 0 })).toBe(true);
        expect(placer.placeAsset({ id: 'b', x: 2, y: 2, width: 2, height: 2 })).toBe(true);
        expect(placer.assetGrid.size).toBe(5);
    });
});

describe('MapAssetPlacer removal and re-placement (#1948)', () => {
    it('removeAsset frees the cells it was placed on even if the object was mutated', () => {
        const placer = makePlacer();
        const tree = { id: 't', x: 1, y: 1 };
        placer.placeAsset(tree);
        tree.x = 5; // caller moves the object without telling the placer
        expect(placer.removeAsset('t')).toBe(true);
        expect(placer.assetGrid.has('1,1')).toBe(false);
        expect(placer.canPlaceAsset(1, 1, 1, 1)).toBe(true);
    });

    it('re-placing the same id moves it: old cells freed, one list entry', () => {
        const placer = makePlacer();
        placer.placeAsset({ id: 't', x: 1, y: 1 });
        expect(placer.placeAsset({ id: 't', x: 3, y: 3 })).toBe(true);
        expect(placer.assets).toHaveLength(1);
        expect(placer.assetGrid.has('1,1')).toBe(false);
        expect(placer.getAssetAt(3, 3).id).toBe('t');
    });

    it('removing one asset does not free cells owned by another', () => {
        const placer = makePlacer();
        const a = { id: 'a', x: 1, y: 1 };
        placer.placeAsset(a);
        placer.placeAsset({ id: 'b', x: 2, y: 1 });
        a.x = 2;
        placer.removeAsset('a');
        expect(placer.getAssetAt(2, 1).id).toBe('b');
    });
});

describe('MapAssetPlacer.findAvailablePosition (#1950)', () => {
    it('returns the nearest free cell, honouring an accept predicate', () => {
        const placer = makePlacer();
        placer.placeAsset({ id: 'x', x: 5, y: 5 });
        const pos = placer.findAvailablePosition(5, 5, 1, 1, 2);
        expect(Math.max(Math.abs(pos.x - 5), Math.abs(pos.y - 5))).toBe(1);
        expect(placer.findAvailablePosition(5, 5, 1, 1, 2, (x) => x >= 7)).toEqual({ x: 7, y: 5 });
    });

    it('checks every cell of a ring (no gaps at larger radii) and full footprints', () => {
        const placer = makePlacer();
        // Block everything within radius 2 of (5,5) except a single cell.
        let n = 0;
        for (let y = 3; y <= 7; y++) {
            for (let x = 3; x <= 7; x++) {
                if (!(x === 7 && y === 4)) placer.placeAsset({ id: `b${n++}`, x, y });
            }
        }
        expect(placer.findAvailablePosition(5, 5, 1, 1, 2)).toEqual({ x: 7, y: 4 });
        const pos2 = placer.findAvailablePosition(5, 5, 2, 2, 4);
        expect(placer.canPlaceAsset(pos2.x, pos2.y, 2, 2)).toBe(true);
    });

    it('MapEnvironmentSystem retries collisions instead of dropping the asset', () => {
        const placer = makePlacer();
        const env = new MapEnvironmentSystem(makeGrid(), { isRoad: () => false }, {}, placer);
        placer.placeAsset({ id: 'blocker', x: 4, y: 4 });
        const tree = { id: 'tree', type: 'tree', x: 4, y: 4, width: 1, height: 1 };
        const bounds = { minX: 3, maxX: 5, minY: 3, maxY: 5 };
        expect(env.placeWithRetry(tree, (x, y) => env.isInZone(bounds, x, y))).toBe(true);
        expect(env.isInZone(bounds, tree.x, tree.y)).toBe(true);
        expect(placer.getAssetAt(tree.x, tree.y).id).toBe('tree');
    });

    it('a dense park zone reaches its full target tree count', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0); // every tree wants the same corner cell
        try {
            const placer = makePlacer();
            const env = new MapEnvironmentSystem(makeGrid(), { isRoad: () => false }, {}, placer);
            env.addParkElements({ id: 'p', bounds: { minX: 0, maxX: 3, minY: 0, maxY: 3 } });
            expect(env.environmentElements).toHaveLength(4); // 16 cells / 4
            expect(new Set(env.environmentElements.map(t => `${t.x},${t.y}`)).size).toBe(4);
        } finally {
            vi.restoreAllMocks();
        }
    });
});

describe('MapBuildingSystem respects placed assets (#157)', () => {
    it('canPlaceBuilding refuses cells occupied by an asset', () => {
        const grid = makeGrid();
        const roads = { isRoad: () => false };
        const buildings = new MapBuildingSystem(grid, roads, {}, null);
        const placer = new MapAssetPlacer(grid, roads, buildings);
        buildings.setAssetPlacer(placer);
        expect(buildings.canPlaceBuilding(0, 0, 2, 2)).toBe(true);
        placer.placeAsset({ id: 'tree', x: 1, y: 1 });
        expect(buildings.canPlaceBuilding(0, 0, 2, 2)).toBe(false);
        expect(buildings.canPlaceBuilding(3, 3, 2, 2)).toBe(true);
    });
});
