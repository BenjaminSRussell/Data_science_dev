import { describe, it, expect, vi } from 'vitest';
import { DetailedMapSystem } from '../../src/js/game/map/DetailedMapSystem.js';
import { MapNavigationSystem } from '../../src/js/game/MapNavigationSystem.js';
import { MapZoneSystem } from '../../src/js/game/MapZoneSystem.js';
import { MapGridSystem } from '../../src/js/game/MapGridSystem.js';
import { getAllZones } from '../../src/js/data/mapZones.js';
import { MapCoordinateSystem } from '../../src/js/game/MapCoordinateSystem.js';

describe('DetailedMapSystem road grid (#369)', () => {
    const m = new DetailedMapSystem({});

    it('builds 10+10 main streets and 20+20 side streets', () => {
        expect(m.roads).toHaveLength(60);
        const main = m.roads.filter(r => r.type === 'main');
        const side = m.roads.filter(r => r.type === 'side');
        expect(main).toHaveLength(20);
        expect(side).toHaveLength(40);
    });

    it('main streets are 10 apart and 3 wide', () => {
        for (let i = 0; i < 10; i++) {
            expect(m.roads.find(r => r.id === `street_h_${i}`)).toEqual({ id: `street_h_${i}`, type: 'main', direction: 'horizontal', y: i * 10, width: 3 });
            expect(m.roads.find(r => r.id === `street_v_${i}`)).toEqual({ id: `street_v_${i}`, type: 'main', direction: 'vertical', x: i * 10, width: 3 });
        }
    });

    it('side streets run both ways, 5 apart and 1 wide', () => {
        for (let i = 0; i < 20; i++) {
            expect(m.roads.find(r => r.id === `side_h_${i}`)).toMatchObject({ direction: 'horizontal', y: i * 5, width: 1 });
            expect(m.roads.find(r => r.id === `side_v_${i}`)).toMatchObject({ direction: 'vertical', x: i * 5, width: 1 });
        }
        expect(new Set(m.roads.map(r => r.id)).size).toBe(60);
    });
});

describe('DetailedMapSystem buildings (#370)', () => {
    it('adds buildings with generated or explicit ids', () => {
        const m = new DetailedMapSystem({});
        const b = { name: 'Test Tower' };
        expect(m.addBuilding('downtown', b)).toBe(true);
        expect(b.id).toMatch(/^building_\d+_\d+$/);
        expect(m.districts.get('downtown').buildings).toContain(b.id);
        const x = { id: 'my_building', name: 'X' };
        m.addBuilding('downtown', x);
        expect(x.id).toBe('my_building');
        expect(x.district).toBe('downtown');
    });

    it('generated ids are unique within the same millisecond', () => {
        vi.spyOn(Date, 'now').mockReturnValue(7);
        const m = new DetailedMapSystem({});
        const a = {}; const b = {};
        m.addBuilding('downtown', a);
        m.addBuilding('downtown', b);
        expect(a.id).not.toBe(b.id);
        vi.restoreAllMocks();
    });

    it('rejects unknown districts without changing anything', () => {
        const m = new DetailedMapSystem({});
        const before = m.buildings.size;
        expect(m.addBuilding('nonexistent_district', { name: 'Nope' })).toBe(false);
        expect(m.buildings.size).toBe(before);
    });

    it('getDistrictBuildings returns full objects, [] for unknown districts', () => {
        const m = new DetailedMapSystem({});
        const b = { id: 'b1', name: 'One' };
        m.addBuilding('downtown', b);
        expect(m.getDistrictBuildings('downtown')).toEqual([b]);
        expect(m.getDistrictBuildings('nonexistent_district')).toEqual([]);
    });

    it('re-adding an id moves it instead of duplicating', () => {
        const m = new DetailedMapSystem({});
        const otherDistrict = [...m.districts.keys()].find(k => k !== 'downtown');
        m.addBuilding('downtown', { id: 'b1' });
        m.addBuilding('downtown', { id: 'b1' });
        expect(m.districts.get('downtown').buildings).toEqual(['b1']);
        m.addBuilding(otherDistrict, { id: 'b1' });
        expect(m.districts.get('downtown').buildings).toEqual([]);
        expect(m.getDistrictBuildings(otherDistrict).map(b => b.id)).toEqual(['b1']);
    });
});

describe('DetailedMapSystem unlocks and appearance (#371)', () => {
    it('starting locations are unlocked, others are not', () => {
        const m = new DetailedMapSystem({});
        for (const id of ['home', 'coffee_shop', 'office']) expect(m.isLocationUnlocked(id)).toBe(true);
        expect(m.isLocationUnlocked('gym')).toBe(false);
    });

    it('unlockLocation actually unlocks, and rejects bad ids', () => {
        const m = new DetailedMapSystem({});
        expect(m.unlockLocation('gym')).toBe(true);
        expect(m.isLocationUnlocked('gym')).toBe(true);
        expect(m.unlockLocation('')).toBe(false);
        expect(m.unlockLocation(null)).toBe(false);
    });

    it('unlocks survive save/load and the starting set is always kept', () => {
        const a = new DetailedMapSystem({});
        a.unlockLocation('gym');
        const b = new DetailedMapSystem({});
        b.fromJSON(JSON.parse(JSON.stringify(a.toJSON())));
        expect(b.isLocationUnlocked('gym')).toBe(true);
        b.fromJSON({ unlockedLocations: [] });
        expect(b.isLocationUnlocked('home')).toBe(true);
        expect(() => b.fromJSON(null)).not.toThrow();
    });

    it('getCityAppearance reflects known NPCs', () => {
        expect(new DetailedMapSystem({}).getCityAppearance()).toEqual({ population: 0, buildings: 0, active: false, empty: true });
        const m = new DetailedMapSystem({ npcManager: { getMetNPCs: () => [{}, {}] } });
        expect(m.getCityAppearance()).toMatchObject({ population: 2, active: true, empty: false });
    });
});

function navOn(roadSet, size = 10) {
    const grid = {
        isValidGridCoord: (x, y) => x >= 0 && y >= 0 && x < size && y < size,
        gridToPixel: (x, y) => ({ x: x * 20, y: y * 20 })
    };
    const roads = { isRoad: (x, y) => roadSet.has(`${x},${y}`) };
    return new MapNavigationSystem(grid, roads);
}
const row = (y, from, to) => Array.from({ length: to - from + 1 }, (_, i) => `${from + i},${y}`);

describe('MapNavigationSystem (#415)', () => {
    it('finds an ordered start-to-end path along a road', () => {
        const nav = navOn(new Set(row(0, 0, 5)));
        const path = nav.findPath(0, 0, 5, 0);
        expect(path[0]).toEqual({ x: 0, y: 0 });
        expect(path[path.length - 1]).toEqual({ x: 5, y: 0 });
        expect(path).toHaveLength(6);
    });

    it('caches results and hands out copies', () => {
        const nav = navOn(new Set(row(0, 0, 5)));
        const spy = vi.spyOn(nav, 'aStarPathfinding');
        const p1 = nav.findPath(0, 0, 3, 0);
        p1.length = 0;
        const p2 = nav.findPath(0, 0, 3, 0);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(p2).toHaveLength(4);
        nav.clearCache();
        nav.findPath(0, 0, 3, 0);
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('returns [] when no coordinate is valid', () => {
        const nav = new MapNavigationSystem({ isValidGridCoord: () => false }, { isRoad: () => true });
        expect(nav.aStarPathfinding(0, 0, 3, 3)).toEqual([]);
    });

    it('picks the shorter of two routes', () => {
        // Long route around the top vs a short direct road
        const roads = new Set([...row(5, 0, 6)]);
        const nav = navOn(roads);
        const path = nav.findPath(0, 5, 6, 5);
        expect(path).toHaveLength(7);
    });

    it('getNeighbors allows road tiles, moves off a road, and road-adjacent tiles only', () => {
        const nav = navOn(new Set(['5,5']));
        const key = (a) => a.map(n => `${n.x},${n.y}`).sort();
        // From a road tile every valid neighbour is allowed
        expect(key(nav.getNeighbors(5, 5))).toEqual(['4,5', '5,4', '5,6', '6,5']);
        // Off-road: only the road itself or tiles next to a road
        expect(key(nav.getNeighbors(4, 4))).toEqual(['4,5', '5,4']);
        // Far from roads: nothing
        expect(nav.getNeighbors(0, 0)).toEqual([]);
        // Edge of the grid is excluded
        const edge = navOn(new Set(['0,0']));
        expect(key(edge.getNeighbors(0, 0))).toEqual(['0,1', '1,0']);
    });

    it('heuristic is Manhattan distance', () => {
        expect(navOn(new Set()).heuristic(0, 0, 3, 4)).toBe(7);
    });

    it('calculateTravelTime', () => {
        const nav = navOn(new Set());
        const p = new Array(10).fill({ x: 0, y: 0 });
        expect(nav.calculateTravelTime([])).toBe(0);
        expect(nav.calculateTravelTime(p)).toBe(10);
        expect(nav.calculateTravelTime(p, 3)).toBe(4);
        expect(nav.calculateTravelTime(p.slice(0, 1), 50)).toBe(1);
        expect(nav.calculateTravelTime(p, 0)).toBe(10);
        expect(nav.calculateTravelTime(null)).toBe(0);
    });

    it('getPathVisualData builds pixel segments', () => {
        const nav = navOn(new Set());
        expect(nav.getPathVisualData([{ x: 0, y: 0 }])).toEqual([]);
        expect(nav.getPathVisualData([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toEqual([{ start: { x: 0, y: 0 }, end: { x: 20, y: 0 } }]);
    });
});

describe('MapZoneSystem (#421)', () => {
    const zs = new MapZoneSystem(new MapGridSystem());

    it('getZoneAt finds a zone for in-bounds coordinates and null elsewhere', () => {
        for (const zone of getAllZones()) {
            const z = zs.getZoneAt(zone.bounds.minX, zone.bounds.minY);
            expect(z).not.toBeNull();
            expect(zs.isInZone(zone.bounds.minX, zone.bounds.minY, z.id)).toBe(true);
        }
        expect(zs.getZoneAt(-1, -1)).toBeNull();
        expect(zs.getZoneAt(30, 0)).toBeNull(); // zones partition 0..29 (#1927)
    });

    it('location assignments round-trip', () => {
        zs.assignLocationToZone('loc1', 'finance_district');
        expect(zs.getZoneForLocation('loc1').id).toBe('finance_district');
        expect(zs.getZoneForLocation('unassigned')).toBeNull();
    });

    it('findZoneForLocationType follows the type mapping with a mixed fallback', () => {
        expect(zs.findZoneForLocationType('residence').type).toBe('residential');
        for (const t of ['shop', 'social', 'business', 'shopping', 'work']) expect(zs.findZoneForLocationType(t).type).toBe('commercial');
        for (const t of ['elite', 'investment', 'finance']) expect(zs.findZoneForLocationType(t).type).toBe('finance');
        expect(zs.findZoneForLocationType('training').type).toBe('education');
        expect(zs.findZoneForLocationType('mystery').type).toBe('mixed');
    });

    it('isInZone checks bounds and rejects unknown zones', () => {
        expect(zs.isInZone(10, 10, 'nope')).toBe(false);
        expect(zs.isInZone(15, 8, 'finance_district')).toBe(true);
        expect(zs.isInZone(26, 12, 'finance_district')).toBe(false);
    });

    it('getZonesInRect includes overlapping zones and excludes outside ones', () => {
        const ids = zs.getZonesInRect(0, 10, 1, 11).map(z => z.id);
        expect(ids).toContain('mixed_west');
        expect(ids).not.toContain('education_campus');
        expect(zs.getZonesInRect(100, 100, 120, 120)).toEqual([]);
    });
});

describe('MapGridSystem position helpers (#158)', () => {
    const g = new MapGridSystem();

    it('bounds-checks grid positions instead of guessing with > 100', () => {
        expect(g.isGridPosition(15, 20)).toBe(true);
        expect(g.isGridPosition(30, 30)).toBe(true);
        expect(g.isGridPosition(31, 5)).toBe(false);
        expect(g.isGridPosition(-1, 5)).toBe(false);
        expect(g.isGridPosition(NaN, 5)).toBe(false);
    });

    it('positionToPercent maps grid cells like gridToPercent and passes legacy percents through', () => {
        expect(g.positionToPercent(15, 15, 600, 600)).toEqual(g.gridToPercent(15, 15, 600, 600));
        expect(g.positionToPercent(50, 75, 600, 600)).toEqual({ x: 50, y: 75 });
        expect(g.positionToPercent(300, 150, 600, 600)).toEqual({ x: 50, y: 25 });
    });

    it('positionToGrid', () => {
        expect(g.positionToGrid(15, 20)).toEqual({ x: 15, y: 20 });
        expect(g.positionToGrid(50, 50)).toEqual(g.percentToGrid(50, 50, g.totalWidth, g.totalHeight));
        expect(g.positionToGrid(305, 105)).toEqual(g.pixelToGrid(305, 105));
    });
});

describe('MapCoordinateSystem occupancy and search (#411)', () => {
    it('creates a default grid system', () => {
        expect(new MapCoordinateSystem().gridSystem).toBeInstanceOf(MapGridSystem);
    });

    it('occupy/release maintain both the grid and the type index', () => {
        const c = new MapCoordinateSystem();
        c.occupyCoord(5, 5, 'location');
        c.occupyCoord(5, 5, 'npc_house');
        expect([...c.grid.get('5,5')]).toEqual(['location', 'npc_house']);
        expect(c.typeIndex.get('location').has('5,5')).toBe(true);
        c.releaseCoord(5, 5, 'location');
        expect([...c.grid.get('5,5')]).toEqual(['npc_house']);
        expect(c.typeIndex.has('location')).toBe(false);
        c.releaseCoord(5, 5, 'npc_house');
        expect(c.grid.has('5,5')).toBe(false);
    });

    it('isAvailable checks the radius and rejects out-of-range input', () => {
        const c = new MapCoordinateSystem();
        c.occupyCoord(10, 10, 'x');
        expect(c.isAvailable(10, 10)).toBe(false);
        expect(c.isAvailable(11, 10)).toBe(false);
        expect(c.isAvailable(13, 10)).toBe(true);
        expect(c.isAvailable(13, 10, 3)).toBe(false);
        expect(c.occupyCoord(-50, -50, 'edge')).toBe(false);
        expect(c.grid.has('0,0')).toBe(false);
        expect(c.isAvailable(-50, -50)).toBe(false);
    });

    it('findAvailableCoord uses the preferred cell, clamped, when free', () => {
        const c = new MapCoordinateSystem();
        expect(c.findAvailableCoord(4, 4)).toEqual({ x: 4, y: 4 });
        const max = c.gridSystem.bounds.maxX;
        const out = c.findAvailableCoord(999, 3);
        expect(out).toEqual({ x: max, y: 3 });
        expect(c.grid.has(`${max},3`)).toBe(true);
    });

    it('findAvailableCoord spirals outward when the preferred cell is taken', () => {
        const c = new MapCoordinateSystem();
        c.occupyCoord(15, 15, 'location');
        const p = c.findAvailableCoord(15, 15);
        expect(p).not.toEqual({ x: 15, y: 15 });
        expect(Math.abs(p.x - 15) + Math.abs(p.y - 15)).toBeGreaterThan(0);
        expect(c.grid.has(`${p.x},${p.y}`)).toBe(true);
    });

    it('findRandomAvailable falls back to the centre when nothing is free', () => {
        const c = new MapCoordinateSystem();
        vi.spyOn(c, 'isAvailable').mockReturnValue(false);
        const p = c.findRandomAvailable('t');
        expect(p).toEqual({ x: 15, y: 15 });
        vi.restoreAllMocks();
    });

    it('clearType and initializeWithLocations', () => {
        const c = new MapCoordinateSystem();
        c.occupyCoord(1, 1, 'a');
        c.occupyCoord(2, 2, 'b');
        c.clearType('a');
        expect(c.grid.has('1,1')).toBe(false);
        expect(c.grid.has('2,2')).toBe(true);
        c.initializeWithLocations([{ position: { x: 3, y: 4 } }, {}]);
        expect([...c.grid.keys()]).toEqual(['3,4']);
    });

    it('findNPCHouseCoord treats grid positions as grid, not percent (#158)', () => {
        const c = new MapCoordinateSystem();
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const p = c.findNPCHouseCoord(20, 20);
        // 2 tiles to the right of (20,20); the old code read 20 as 20% and put it near (6,6)
        expect(p).toEqual({ x: 22, y: 20 });
        vi.restoreAllMocks();
    });
});
