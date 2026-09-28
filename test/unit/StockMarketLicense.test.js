/**
 * Stock Market License Gate Tests
 * Verifies buy/sell are gated behind Series 7/63 licenses,
 * with an ethics-based criminal bypass on the buy path only.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StockMarket } from '../../src/js/game/StockMarket.js';

function makeMarket({ hasLicense, ethics, money = 100000 } = {}) {
    const gameState = {
        money,
        legalSystem: { hasLicense: vi.fn(hasLicense) },
        characterStats: { ethics }
    };
    const market = new StockMarket(gameState);
    // Pre-populate a portfolio holding for sell tests
    market.portfolio.holdings['ggl'] = 10;
    return market;
}

describe('StockMarket license gate', () => {
    it('blocks buy without license when ethics is normal', () => {
        const market = makeMarket({ hasLicense: () => false, ethics: 0 });
        const result = market.buyStock('ggl', 1);
        expect(result.success).toBe(false);
        expect(result.reason).toMatch(/Series 7/i);
        expect(market.gameState.money).toBe(100000);
        expect(market.portfolio.holdings['ggl']).toBeUndefined();
    });

    it('allows buy with series_7 or series_63 license', () => {
        for (const license of ['series_7', 'series_63']) {
            const market = makeMarket({
                hasLicense: (l) => l === license,
                ethics: 0
            });
            const result = market.buyStock('ggl', 1);
            expect(result.success).toBe(true);
            expect(market.gameState.money).toBe(100000 - 150);
            expect(market.portfolio.holdings['ggl']).toBe(1);
        }
    });

    it('bypasses license check on buy only when ethics < -20', () => {
        // -19: still blocked
        const blocked = makeMarket({ hasLicense: () => false, ethics: -19 });
        expect(blocked.buyStock('ggl', 1).success).toBe(false);

        // -21: bypasses the gate
        const bypassed = makeMarket({ hasLicense: () => false, ethics: -21 });
        expect(bypassed.buyStock('ggl', 1).success).toBe(true);
    });

    it('sell gate checks only series_7, not series_63', () => {
        // series_63 alone: buy allowed, sell blocked (intentionally different)
        const market = makeMarket({
            hasLicense: (l) => l === 'series_63',
            ethics: 0
        });
        expect(market.buyStock('ggl', 1).success).toBe(true);
        const sellResult = market.sellStock('ggl', 1);
        expect(sellResult.success).toBe(false);
        expect(sellResult.reason).toMatch(/Series 7/i);
        expect(market.gameState.money).toBe(100000 - 150);
        expect(market.portfolio.holdings['ggl']).toBe(1);
    });

    it('sell with series_7 proceeds and low ethics bypasses sell gate', () => {
        const licensed = makeMarket({
            hasLicense: (l) => l === 'series_7',
            ethics: 0
        });
        const sell = licensed.sellStock('ggl', 5);
        expect(sell.success).toBe(true);
        expect(licensed.portfolio.holdings['ggl']).toBe(5);

        const criminal = makeMarket({ hasLicense: () => false, ethics: -21 });
        expect(criminal.sellStock('ggl', 2).success).toBe(true);
    });

    it('trade passing legal gate but failing money check leaves state untouched', () => {
        const market = makeMarket({
            hasLicense: (l) => l === 'series_7',
            ethics: 0,
            money: 100 // ggl costs 150
        });
        const result = market.buyStock('ggl', 1);
        expect(result).toEqual({ success: false, reason: 'Not enough money' });
        expect(market.gameState.money).toBe(100);
        expect(market.portfolio.holdings['ggl']).toBeUndefined();
    });

    it('sell with insufficient shares returns failure and leaves state untouched', () => {
        const market = makeMarket({
            hasLicense: (l) => l === 'series_7',
            ethics: 0
        });
        const result = market.sellStock('ggl', 999);
        expect(result).toEqual({ success: false, reason: 'Not enough shares' });
        expect(market.gameState.money).toBe(100000);
        expect(market.portfolio.holdings['ggl']).toBe(10);
    });
});
