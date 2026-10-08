/**
 * Reputation/money gates fail closed when the values are missing (#1430)
 */
import { describe, it, expect } from 'vitest';
import { WorldMap } from '../../src/js/game/WorldMap.js';

describe('WorldMap unlock gates with missing values', () => {
    it('undefined or NaN money/reputation do not unlock gated locations', () => {
        for (const bad of [undefined, NaN, null, 'lots']) {
            const gs = { money: bad, reputation: bad, characterStats: { stats: {}, getStat: () => 0 } };
            const wm = new WorldMap(gs);
            wm.ownedVehicles.add('luxury_car');
            wm.currentVehicle = 'luxury_car';
            wm._invalidateCache();
            const ids = wm.getAccessibleLocations().map(l => l.id);
            expect(ids).not.toContain('bank'); // money >= 1000
            expect(ids).not.toContain('downtown'); // reputation >= 500
            expect(ids).not.toContain('real_estate'); // money >= 50000
        }
    });

    it('real values still unlock them', () => {
        const gs = { money: 100000, reputation: 600, characterStats: { stats: {}, getStat: () => 0 } };
        const wm = new WorldMap(gs);
        wm.ownedVehicles.add('luxury_car');
        wm.currentVehicle = 'luxury_car';
        wm._invalidateCache();
        expect(wm.getAccessibleLocations().map(l => l.id)).toEqual(expect.arrayContaining(['bank', 'downtown', 'real_estate']));
    });
});
