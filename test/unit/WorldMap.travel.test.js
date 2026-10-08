import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorldMap, VEHICLES } from '../../src/js/game/WorldMap.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { WorldEventManager } from '../../src/js/game/WorldEventManager.js';
import { vehicleRequiresDealership, handleTravel } from '../../src/js/helpers/MapHelpers.js';

function makeState(extra = {}) {
    return { money: 0, reputation: 0, characterStats: { stats: {}, getStat: () => 0 }, ...extra };
}

describe('WorldMap travel & vehicles', () => {
    let gs, wm;
    beforeEach(() => { gs = makeState(); wm = new WorldMap(gs); });

    it('accessibility cache refreshes when money changes (#981, #2354)', () => {
        wm.ownedVehicles.add('bus_pass'); wm.switchVehicle('bus_pass');
        expect(wm.getAccessibleLocations().some(l => l.id === 'car_dealership')).toBe(false);
        gs.money = 6000;
        expect(wm.getAccessibleLocations().some(l => l.id === 'car_dealership')).toBe(true);
    });

    it('has getLocations()/setCurrentLocation() (#984, #2353)', () => {
        expect(wm.getLocations().length).toBeGreaterThan(10);
        expect(wm.setCurrentLocation('gym').success).toBe(true);
        expect(wm.currentLocation).toBe('gym');
        expect(wm.setCurrentLocation('nowhere').success).toBe(false);
    });

    it('canTravelTo reports the slots travelTo charges (#985)', () => {
        wm.ownedVehicles.add('bus_pass'); wm.switchVehicle('bus_pass');
        const check = wm.canTravelTo('office');
        const res = wm.travelTo('office');
        expect(check.travelTime).toBe(res.timeCost);
    });

    it('travelling to the current location is free (#1434, #2168)', () => {
        const res = wm.travelTo('home');
        expect(res.success).toBe(true);
        expect(res.timeCost).toBe(0);
        expect(res.alreadyHere).toBe(true);
    });

    it('handleTravel does not advance time when already there', () => {
        const game = { worldMap: wm, handleTimeAdvance: vi.fn(), showToast: vi.fn(), screenManager: { showScreen: vi.fn() } };
        handleTravel(game, 'home');
        expect(game.handleTimeAdvance).not.toHaveBeenCalled();
    });

    it('a stale vehicle id does not crash travel (#1431, #2167)', () => {
        wm.currentVehicle = 'hoverboard';
        expect(() => wm.travelTo('library')).not.toThrow();
        expect(wm.currentVehicle).toBe('walking');
    });

    it('fromJSON drops unknown vehicles and locations (#1431)', () => {
        wm.fromJSON({ currentVehicle: 'jetpack', ownedVehicles: ['jetpack', 'used_car'], currentLocation: 'atlantis' });
        expect(wm.currentVehicle).toBe('walking');
        expect([...wm.ownedVehicles].sort()).toEqual(['used_car', 'walking']);
        expect(wm.currentLocation).toBe('home');
    });

    it('re-buying an owned vehicle says so even when broke (#1432)', () => {
        wm.ownedVehicles.add('sedan');
        expect(wm.buyVehicle('sedan').reason).toBe('Already own this vehicle');
    });

    it('buying a cheaper vehicle keeps the faster one active (#2169)', () => {
        gs.money = 1e6;
        wm.buyVehicle('sports_car');
        const r = wm.buyVehicle('used_car');
        expect(r.success).toBe(true);
        expect(r.switched).toBe(false);
        expect(wm.currentVehicle).toBe('sports_car');
    });

    it('updateLocation re-skins a location and resetLocation undoes it (#1334)', () => {
        expect(wm.updateLocation('library', { name: 'Innovation Hub' })).toBe(true);
        expect(wm.getLocation('library').name).toBe('Innovation Hub');
        wm.resetLocation('library');
        expect(wm.getLocation('library').name).not.toBe('Innovation Hub');
    });

    it('tech_boom no longer throws and reverts after its duration (#1334)', () => {
        const state = makeState({ worldMap: wm, timeManager: { totalDays: 1 } });
        const wem = new WorldEventManager(state);
        expect(() => wem.triggerEvent(wem.eventPool.tech_boom)).not.toThrow();
        expect(wm.getLocation('library').name).toBe('Innovation Hub');
        state.timeManager.totalDays = 1 + wem.eventPool.tech_boom.duration;
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        wem.processDay();
        vi.restoreAllMocks();
        expect(wm.getLocation('library').name).not.toBe('Innovation Hub');
    });

    it('only cars require the dealership (#1703)', () => {
        const byId = Object.fromEntries(VEHICLES.map(v => [v.id, v]));
        expect(vehicleRequiresDealership(byId.bus_pass)).toBe(false);
        expect(vehicleRequiresDealership(byId.used_car)).toBe(true);
        expect(vehicleRequiresDealership(byId.luxury_car)).toBe(true);
    });
});

describe('EconomySystem.getTransportationCost (#1700)', () => {
    it('charges every car, with pricier cars costing more', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const wm = new WorldMap(makeState());
        const eco = new EconomySystem({ worldMap: wm });
        const cost = id => { wm.currentVehicle = id; return eco.getTransportationCost(); };
        expect(cost('walking')).toBe(0);
        expect(cost('bus_pass')).toBeGreaterThan(0);
        expect(cost('sedan')).toBeGreaterThan(0);
        expect(cost('luxury_car')).toBeGreaterThan(cost('used_car'));
        vi.restoreAllMocks();
    });
});
