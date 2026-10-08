/**
 * Price-generation math for Stock.update() and StockMarket.update() (#903)
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { Stock, StockMarket } from '../../src/js/game/StockMarket.js';

const mkStock = (overrides = {}) => {
    const s = new Stock(overrides.id || 'aaa', 'AAA', 'Alpha', overrides.price ?? 100,
        overrides.volatility ?? 0.05, overrides.sector || 'tech', overrides.market || 'US', overrides.correlation || {});
    return s;
};

describe('Stock.update price math', () => {
    afterEach(() => vi.restoreAllMocks());

    it('zero trend and centred noise leaves the price unchanged', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const s = mkStock();
        s.update({ US: 0 });
        expect(s.price).toBe(100);
        expect(s.lastChange).toBe(0);
        expect(s.lastChangePct).toBe(0);
    });

    it('applies the market trend as a percentage', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const s = mkStock();
        s.update({ US: 0.05 });
        expect(s.price).toBeCloseTo(105, 10);
        expect(s.lastChangePct).toBeCloseTo(0.05, 12);
        expect(s.lastChange).toBeCloseTo(5, 10);
    });

    it('clamps at the $0.01 floor and never goes negative', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const s = mkStock({ price: 0.02, volatility: 0.1 });
        expect(() => s.update({ US: -0.9 })).not.toThrow();
        expect(s.price).toBe(0.01);
        expect(() => s.update({ US: -5 })).not.toThrow();
        expect(s.price).toBe(0.01);
    });

    it('keeps at most 100 history points, the last always the current price', () => {
        const s = mkStock();
        for (let i = 0; i < 250; i++) {
            s.update({ US: 0 });
            expect(s.history.length).toBeLessThanOrEqual(100);
            expect(s.history[s.history.length - 1]).toBe(s.price);
        }
        expect(s.history).toHaveLength(100);
    });

    it('adds a same-sector correlation term of otherChange * correlation * 0.3', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const a = mkStock({ id: 'a', market: 'US', correlation: { b: 0.5 } });
        // Different market isolates the sector term from the market term
        const b = mkStock({ id: 'b', market: 'EU' });
        b.lastChangePct = 0.1;
        a.update({ US: 0, EU: 0 }, {}, [], [a, b]);
        expect(a.lastChangePct).toBeCloseTo(0.1 * 0.5 * 0.3, 12);
        expect(a.price).toBeCloseTo(100 * (1 + 0.015), 10);
    });

    it('defaults the sector correlation to 0.4 and adds the same-market term', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const a = mkStock({ id: 'a' });
        const b = mkStock({ id: 'b' });
        b.prevChangePct = 0.1;
        a.update({ US: 0 }, {}, [], [a, b]);
        expect(a.lastChangePct).toBeCloseTo(0.1 * 0.4 * 0.3 + 0.1 * 0.25 * 0.2, 12);
    });

    it('sums world-event impacts for matching market, sector and stock', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const s = mkStock({ id: 'x' });
        s.update({ US: 0 }, {}, [
            { affectsMarket: ['US'], marketImpact: -0.02 },
            { affectsSector: ['tech'], sectorImpact: 0.03 },
            { affectsStock: ['x'], stockImpact: 0.01 },
            { affectsMarket: ['EU'], marketImpact: -0.5 }
        ]);
        expect(s.lastChangePct).toBeCloseTo(0.02, 12);
    });
});

describe('StockMarket.update and manipulateStock', () => {
    afterEach(() => vi.restoreAllMocks());

    it('keeps exactly the active world events', () => {
        const sm = new StockMarket({ money: 0 });
        const live = { id: 'w1', type: 'tech_boom', active: true };
        sm.update([], [live, { id: 'w2', type: 'market_crash', active: false }, null]);
        expect(sm.activeWorldEvents).toEqual([live]);
    });

    it('updates every stock and appends to its history', () => {
        const sm = new StockMarket({ money: 0 });
        const lengths = sm.stocks.map(s => s.history.length);
        sm.update([], []);
        sm.stocks.forEach((s, i) => {
            expect(s.history.length).toBe(Math.min(100, lengths[i] + 1));
            expect(s.price).toBeGreaterThanOrEqual(0.01);
        });
    });

    it('pump multiplies the price by the magnitude and returns true', () => {
        const sm = new StockMarket({ money: 0 });
        const s = sm.stocks[0];
        const p0 = s.price;
        const v0 = s.volatility;
        expect(sm.manipulateStock(s.id, 'pump', 1.5)).toBe(true);
        expect(s.price).toBeCloseTo(p0 * 1.5, 10);
        expect(s.volatility).toBeCloseTo(v0 + 0.2, 12);
    });

    it('returns false for an unknown stock without throwing', () => {
        const sm = new StockMarket({ money: 0 });
        expect(() => sm.manipulateStock('nonexistent-id', 'pump', 1.5)).not.toThrow();
        expect(sm.manipulateStock('nonexistent-id', 'pump', 1.5)).toBe(false);
    });
});
