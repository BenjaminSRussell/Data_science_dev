/**
 * WorldMap accessibility gating, caching, travel and save (#423)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { WorldMap, LOCATIONS, VEHICLES_MAP } from '../../src/js/game/WorldMap.js';

function makeState(extra = {}) {
    const stats = { analytics: 0, charisma: 0 };
    return {
        money: 0, reputation: 0,
        characterStats: { stats, getStat: (k) => stats[k] || 0 },
        ...extra
    };
}
const ids = (wm) => wm.getAccessibleLocations().map(l => l.id);

describe('WorldMap coverage', () => {
    let gs, wm;
    beforeEach(() => { gs = makeState(); wm = new WorldMap(gs); });

    it('returns the cached array until something changes', () => {
        const first = wm.getAccessibleLocations();
        expect(wm.getAccessibleLocations()).toBe(first);
        wm._invalidateCache();
        expect(wm.getAccessibleLocations()).not.toBe(first);
    });

    it('walking excludes bus/car/luxury gated locations', () => {
        const access = ids(wm);
        for (const loc of LOCATIONS.filter(l => l.requiresVehicle && l.requiresVehicle !== false)) {
            expect(access).not.toContain(loc.id);
        }
        expect(access).toContain('home');
    });

    it('a car (level 2) opens car- and bus-gated locations but not luxury ones', () => {
        gs.money = 1e6; gs.reputation = 1e6;
        gs.characterStats.stats.analytics = 100;
        gs.characterStats.stats.charisma = 100;
        expect(wm.buyVehicle('used_car').success).toBe(true);
        expect(VEHICLES_MAP.get('used_car').accessLevel).toBe(2);
        const access = ids(wm);
        expect(access).toContain('downtown');
        expect(access).toContain('bank');
        expect(access).not.toContain('luxury_district');
        wm.buyVehicle('luxury_car');
        expect(ids(wm)).toContain('luxury_district');
    });

    it('stat, reputation and money requirements gate access', () => {
        gs.money = 1e6;
        wm.buyVehicle('sedan');
        gs.money = 0;
        wm._invalidateCache();
        expect(ids(wm)).not.toContain('stock_exchange'); // analytics >= 25
        expect(ids(wm)).not.toContain('downtown'); // reputation >= 500 (car)
        expect(ids(wm)).not.toContain('bank'); // money >= 1000
        gs.characterStats.stats.analytics = 25;
        gs.reputation = 500;
        gs.money = 1000;
        wm._invalidateCache();
        expect(ids(wm)).toEqual(expect.arrayContaining(['stock_exchange', 'downtown', 'bank']));
    });

    it('travelTo charges ceil(travelTime / speed) and refuses inaccessible places', () => {
        const target = LOCATIONS.find(l => !l.requiresVehicle && !l.unlockRequirement && l.id !== 'home');
        const r = wm.travelTo(target.id);
        expect(r.success).toBe(true);
        expect(r.timeCost).toBe(Math.max(0, Math.ceil(target.travelTime / VEHICLES_MAP.get('walking').travelSpeed)));
        expect(wm.currentLocation).toBe(target.id);
        expect(wm.visitedLocations.has(target.id)).toBe(true);

        const locked = wm.travelTo('luxury_district');
        expect(locked.can).toBe(false);
        expect(wm.currentLocation).toBe(target.id);
        expect(wm.travelTo('atlantis').reason).toBe('Unknown location');
    });

    it('buyVehicle: money, ownership, price and reputation', () => {
        expect(wm.buyVehicle('used_car')).toMatchObject({ success: false, reason: 'Not enough money' });
        gs.money = 6000;
        const r = wm.buyVehicle('used_car');
        expect(r.success).toBe(true);
        expect(gs.money).toBe(6000 - VEHICLES_MAP.get('used_car').price);
        expect(gs.reputation).toBe(VEHICLES_MAP.get('used_car').reputation);
        expect(wm.currentVehicle).toBe('used_car');
        expect(wm.buyVehicle('used_car').reason).toBe('Already own this vehicle');
        expect(wm.buyVehicle('hovercraft').reason).toBe('Unknown vehicle');
    });

    it('toJSON/fromJSON round-trips sets and defaults missing fields', () => {
        gs.money = 1e6;
        wm.buyVehicle('sedan');
        wm.travelTo('library');
        const restored = new WorldMap(makeState());
        restored.fromJSON(JSON.parse(JSON.stringify(wm.toJSON())));
        expect(restored.ownedVehicles).toBeInstanceOf(Set);
        expect([...restored.ownedVehicles]).toEqual(expect.arrayContaining(['walking', 'sedan']));
        expect(restored.currentVehicle).toBe('sedan');
        expect(restored.visitedLocations.has('library')).toBe(true);

        const empty = new WorldMap(makeState());
        empty.fromJSON({});
        expect([...empty.ownedVehicles]).toEqual(['walking']);
        expect([...empty.visitedLocations]).toEqual(['home']);
        expect(empty.currentLocation).toBe('home');
        expect(() => empty.fromJSON(null)).not.toThrow();
        expect(() => empty.fromJSON(undefined)).not.toThrow();
    });
});
