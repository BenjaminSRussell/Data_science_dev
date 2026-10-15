import { describe, it, expect, vi, afterEach } from 'vitest';
import { MapAssetPlacer } from '../../src/js/game/MapAssetPlacer.js';
import { MapEnvironmentSystem } from '../../src/js/game/MapEnvironmentSystem.js';
import { MapGridSystem } from '../../src/js/game/MapGridSystem.js';
import { MapRenderer } from '../../src/js/game/MapRenderer.js';
import { MapZoneSystem } from '../../src/js/game/MapZoneSystem.js';

const grid = {
    isValidGridCoord: (x, y) => x >= 0 && y >= 0 && x < 30 && y < 30,
    getGridKey: (x, y) => `${x},${y}`,
};
const roads = (fn = () => false) => ({ isRoad: fn });

function makeEnv({ isRoad = () => false, zones = {} } = {}) {
    const road = roads(isRoad);
    const placer = new MapAssetPlacer(grid, road, { getBuildingAt: () => null });
    const zoneSystem = { getZonesByType: (type) => zones[type] || [] };
    return { env: new MapEnvironmentSystem(grid, road, zoneSystem, placer), placer };
}

afterEach(() => vi.restoreAllMocks());

describe('MapEnvironmentSystem.clear / re-initialize (#1567)', () => {
    it('initialize() twice does not duplicate elements or leave stale cells', () => {
        const zones = { park: [{ id: 'p', bounds: { minX: 0, maxX: 5, minY: 0, maxY: 5 } }] };
        const { env, placer } = makeEnv({ zones });
        env.initialize();
        const first = env.getAllElements().length;
        expect(first).toBe(9); // 36 cells / 4
        env.initialize();
        expect(env.getAllElements()).toHaveLength(first);
        expect(placer.assets).toHaveLength(first);
        env.clear();
        expect(env.getAllElements()).toHaveLength(0);
        expect(placer.assetGrid.size).toBe(0);
    });
});

describe('placement stats (#1564)', () => {
    it('reports requested vs placed per zone, including shortfalls', () => {
        const { env } = makeEnv();
        const zone = { id: 'p', bounds: { minX: 0, maxX: 3, minY: 0, maxY: 3 } };
        expect(env.addParkElements(zone)).toEqual({ requested: 4, placed: 4 });
        // A zone that is all road can't hold anything: shortfall is reported
        const { env: roadEnv } = makeEnv({ isRoad: () => true });
        expect(roadEnv.addCommercialDecorations({ id: 'c', bounds: { minX: 0, maxX: 7, minY: 0, maxY: 7 } }))
            .toEqual({ requested: 8, placed: 0 });
        expect(roadEnv.placementStats.get('c')).toEqual({ kind: 'decoration', requested: 8, placed: 0 });
    });
});

describe('park vs street trees are distinguishable (#1563)', () => {
    it('tags subtype and getElementsByType matches either level', () => {
        const isRoad = (x) => x === 0;
        const zones = {
            park: [{ id: 'p', bounds: { minX: 10, maxX: 13, minY: 10, maxY: 13 } }],
            residential: [{ id: 'r', bounds: { minX: 1, maxX: 6, minY: 1, maxY: 6 } }],
        };
        const { env } = makeEnv({ isRoad, zones });
        // Placement picks random tiles; pin it to each zone's min corner so
        // the road-adjacent street tree (x=1) always gets placed (was flaky)
        const random = vi.spyOn(Math, 'random').mockReturnValue(0);
        try {
            env.initialize();
        } finally {
            random.mockRestore();
        }
        const park = env.getElementsByType('park-tree');
        const street = env.getElementsByType('street-tree');
        expect(park.length).toBeGreaterThan(0);
        expect(street.length).toBeGreaterThan(0);
        expect(park.every(t => t.zoneId === 'p')).toBe(true);
        expect(street.every(t => t.zoneId === 'r' && t.x === 1)).toBe(true);
        expect(env.getElementsByType('tree')).toHaveLength(park.length + street.length);
    });
});

describe('known zones use MapZoneSystem.isInZone (#1928)', () => {
    it('addParkElements asks the zone system instead of only the local bounds helper', () => {
        const zoneSystem = new MapZoneSystem(new MapGridSystem());
        const spy = vi.spyOn(zoneSystem, 'isInZone');
        const road = roads();
        const placer = new MapAssetPlacer(grid, road, { getBuildingAt: () => null });
        const env = new MapEnvironmentSystem(grid, road, zoneSystem, placer);
        const random = vi.spyOn(Math, 'random').mockReturnValue(0);
        try {
            env.addParkElements(zoneSystem.getZoneById('park_central'));
        } finally {
            random.mockRestore();
        }
        expect(spy).toHaveBeenCalled();
        expect(env.getAllElements().length).toBeGreaterThan(0);
        expect(env.getAllElements().every(el => el.zoneId === 'park_central')).toBe(true);
    });
});

describe('MapRenderer reads the location-to-zone map (#1928)', () => {
    it('renderZones paints overlapping zones and the locations assigned to them', () => {
        const container = document.createElement('div');
        const renderer = Object.create(MapRenderer.prototype);
        renderer.container = container;
        const finance = {
            id: 'finance_district',
            type: 'finance',
            name: 'Financial District',
            bounds: { minX: 9, maxX: 19, minY: 5, maxY: 9 },
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderColor: 'rgba(0,0,0,0.3)'
        };
        const offMap = {
            id: 'off_map',
            type: 'park',
            name: 'Off',
            bounds: { minX: 100, maxX: 110, minY: 100, maxY: 110 },
            backgroundColor: 'red',
            borderColor: 'red'
        };
        renderer.mapManager = {
            getZoneSystem: () => ({
                getZoneData: () => ({
                    zones: [finance, offMap],
                    locationZoneMap: [['bank', 'finance_district'], ['atm', 'finance_district']]
                }),
                getZonesInRect: (minX, minY, maxX, maxY) => [finance, offMap].filter(z =>
                    !(z.bounds.maxX < minX || z.bounds.minX > maxX || z.bounds.maxY < minY || z.bounds.minY > maxY))
            }),
            getGridSystem: () => ({
                totalWidth: 600,
                totalHeight: 600,
                bounds: { maxX: 29, maxY: 29 },
                gridToPixel: (x, y) => ({ x: x * 20, y: y * 20 })
            })
        };
        renderer.renderZones();
        const painted = container.querySelector('[data-zone-id="finance_district"]');
        expect(painted).not.toBeNull();
        expect(painted.dataset.locations).toBe('bank,atm');
        expect(container.querySelector('[data-zone-id="off_map"]')).toBeNull();
    });

    it('renderLocations stamps the zone assigned to the location', () => {
        const container = document.createElement('div');
        const renderer = Object.create(MapRenderer.prototype);
        renderer.container = container;
        renderer.renderPlayerMarker = () => {};
        renderer.game = {
            worldMap: {
                currentLocation: 'bank',
                getAccessibleLocations: () => [{ id: 'bank', name: 'Bank', position: { x: 10, y: 6 }, icon: 'B' }]
            }
        };
        renderer.mapManager = {
            getZoneSystem: () => ({
                getZoneForLocation: (id) => (id === 'bank' ? { id: 'finance_district' } : null)
            }),
            getGridSystem: () => ({
                totalWidth: 600,
                totalHeight: 600,
                positionToPercent: () => ({ x: 30, y: 20 })
            })
        };
        renderer.renderLocations();
        expect(container.querySelector('[data-location="bank"]').dataset.zone).toBe('finance_district');
    });
});

describe('MapRenderer.renderEnvironment draws decorations (#1452)', () => {
    it('renders trees and decorations with distinct classes', () => {
        const container = document.createElement('div');
        const renderer = Object.create(MapRenderer.prototype);
        renderer.container = container;
        renderer.mapManager = {
            environmentSystem: {
                getAllElements: () => [
                    { id: 't1', type: 'tree', subtype: 'park-tree', x: 1, y: 1 },
                    { id: 't2', type: 'tree', subtype: 'street-tree', x: 2, y: 2 },
                    { id: 'd1', type: 'decoration', x: 3, y: 3 },
                    { id: 'x', type: 'unknown', x: 4, y: 4 },
                ],
            },
            getGridSystem: () => ({ totalWidth: 300, totalHeight: 300, gridToPixel: (x, y) => ({ x: x * 10, y: y * 10 }) }),
        };
        renderer.renderEnvironment();
        expect(container.querySelectorAll('.map-tree')).toHaveLength(2);
        expect(container.querySelectorAll('.map-tree--street')).toHaveLength(1);
        expect(container.querySelectorAll('.map-decoration')).toHaveLength(1);
        expect(container.querySelector('[data-env-type="unknown"]')).toBeNull();
    });
});
