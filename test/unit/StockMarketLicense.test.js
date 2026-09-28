/**
 * Stock Market License Gate Tests
 * Verifies buy/sell are gated behind the Series 7/63 licenses,
 * with an ethics-based criminal bypass.
 */

import { describe, it, expect } from 'vitest';
import { StockMarket } from '../../src/js/game/StockMarket.js';
import { LegalSystem } from '../../src/js/game/LegalSystem.js';
import { CharacterStats } from '../../src/js/game/CharacterStats.js';

const GGL_PRICE = 150; // opening price of 'ggl' in StockMarket.initStocks()

/**
 * Build a market around a real LegalSystem and CharacterStats.
 * `shares` is the number of 'ggl' shares already held (0 for the buy tests).
 */
function makeMarket({ licenses = [], ethics = 0, money = 100000, shares = 0 } = {}) {
    const gameState = { money };
    gameState.legalSystem = new LegalSystem(gameState);
    licenses.forEach(id => {
        gameState.legalSystem.licenses[id].acquired = true;
    });
    gameState.characterStats = new CharacterStats();
    gameState.characterStats.ethics = ethics;

    const market = new StockMarket(gameState);
    if (shares > 0) {
        market.portfolio.buy('ggl', shares, GGL_PRICE);
    }
    return market;
}

describe('StockMarket license gate', () => {
    it('blocks buy without license when ethics is normal', () => {
        for (const ethics of [0, 50]) {
            const market = makeMarket({ ethics });
            const result = market.buyStock('ggl', 1);
            expect(result.success).toBe(false);
            expect(result.reason).toMatch(/Series 7/i);
            expect(market.gameState.money).toBe(100000);
            expect(market.portfolio.holdings['ggl']).toBeUndefined();
            expect(market.portfolio.holdings).toEqual({});
        }
    });

    it('allows buy with series_7 or series_63 license', () => {
        for (const license of ['series_7', 'series_63']) {
            const market = makeMarket({ licenses: [license] });
            const result = market.buyStock('ggl', 1);
            expect(result.success).toBe(true);
            expect(result.cost).toBe(GGL_PRICE);
            expect(market.gameState.money).toBe(100000 - 150);
            expect(market.portfolio.holdings['ggl']).toBe(1);
        }
    });

    it('adds bought shares to an existing holding', () => {
        const market = makeMarket({ licenses: ['series_7'], shares: 10 });
        const result = market.buyStock('ggl', 2);
        expect(result.success).toBe(true);
        expect(market.gameState.money).toBe(100000 - 300);
        expect(market.portfolio.holdings['ggl']).toBe(12);
    });

    it('blocks buy at ethics -19 and bypasses the license check at -21', () => {
        // -19: still blocked
        const blocked = makeMarket({ ethics: -19 });
        expect(blocked.buyStock('ggl', 1).success).toBe(false);
        expect(blocked.gameState.money).toBe(100000);
        expect(blocked.portfolio.holdings).toEqual({});

        // -21: bypasses the gate
        const bypassed = makeMarket({ ethics: -21 });
        expect(bypassed.buyStock('ggl', 1).success).toBe(true);
        expect(bypassed.gameState.money).toBe(100000 - 150);
        expect(bypassed.portfolio.holdings['ggl']).toBe(1);
    });

    it('blocks sell without license when ethics is normal', () => {
        const market = makeMarket({ shares: 10 });
        const result = market.sellStock('ggl', 1);
        expect(result.success).toBe(false);
        expect(result.reason).toMatch(/Series 7/i);
        expect(market.gameState.money).toBe(100000);
        expect(market.portfolio.holdings['ggl']).toBe(10);
    });

    it('sell with series_7 proceeds and low ethics bypasses sell gate', () => {
        const licensed = makeMarket({ licenses: ['series_7'], shares: 10 });
        const sell = licensed.sellStock('ggl', 5);
        expect(sell.success).toBe(true);
        expect(sell.revenue).toBe(750);
        expect(licensed.gameState.money).toBe(100000 + 750);
        expect(licensed.portfolio.holdings['ggl']).toBe(5);

        const blocked = makeMarket({ ethics: -19, shares: 10 });
        expect(blocked.sellStock('ggl', 2).success).toBe(false);
        expect(blocked.portfolio.holdings['ggl']).toBe(10);

        const criminal = makeMarket({ ethics: -21, shares: 10 });
        expect(criminal.sellStock('ggl', 2).success).toBe(true);
        expect(criminal.gameState.money).toBe(100000 + 300);
        expect(criminal.portfolio.holdings['ggl']).toBe(8);
    });

    it('trade passing legal gate but failing money check leaves state untouched', () => {
        const market = makeMarket({
            licenses: ['series_7'],
            money: 100 // ggl costs 150
        });
        const result = market.buyStock('ggl', 1);
        expect(result).toEqual({ success: false, reason: 'Not enough money' });
        expect(market.gameState.money).toBe(100);
        expect(market.portfolio.holdings['ggl']).toBeUndefined();
    });

    it('trade passing legal gate for an unknown stock is rejected', () => {
        const market = makeMarket({ licenses: ['series_7'], shares: 10 });
        expect(market.buyStock('no-such-stock', 1)).toEqual({ success: false, reason: 'Stock not found' });
        expect(market.sellStock('no-such-stock', 1)).toEqual({ success: false, reason: 'Stock not found' });
        expect(market.gameState.money).toBe(100000);
        expect(market.portfolio.holdings).toEqual({ ggl: 10 });
    });

    it('sell with insufficient shares returns failure and leaves state untouched', () => {
        const market = makeMarket({ licenses: ['series_7'], shares: 10 });
        const result = market.sellStock('ggl', 999);
        expect(result).toEqual({ success: false, reason: 'Not enough shares' });
        expect(market.gameState.money).toBe(100000);
        expect(market.portfolio.holdings['ggl']).toBe(10);
    });
});
