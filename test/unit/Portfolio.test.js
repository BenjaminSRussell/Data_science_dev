import { describe, it, expect } from 'vitest';
import { Portfolio } from '../../src/js/game/StockMarket.js';

describe('StockMarket Portfolio (#242)', () => {
    it('first buy sets holdings and invested capital', () => {
        const p = new Portfolio();
        expect(p.buy('ACME', 10, 5)).toBe(true);
        expect(p.holdings.ACME).toBe(10);
        expect(p.totalInvested).toBe(50);
        expect(p.getQuantity('ACME')).toBe(10);
    });

    it('repeat buys accumulate shares and cost basis', () => {
        const p = new Portfolio();
        p.buy('ACME', 10, 5);
        p.buy('ACME', 5, 8);
        expect(p.holdings.ACME).toBe(15);
        expect(p.costBasis.ACME).toBe(90);
        expect(p.totalInvested).toBe(90);
    });

    it('selling uses average cost and returns proceeds at the sell price', () => {
        const p = new Portfolio();
        p.buy('ACME', 10, 5);
        p.buy('ACME', 10, 15); // basis 200, avg 10
        expect(p.sell('ACME', 5, 20)).toBe(100);
        expect(p.holdings.ACME).toBe(15);
        expect(p.costBasis.ACME).toBeCloseTo(150);
        expect(p.totalInvested).toBeCloseTo(150);
    });

    it('selling everything removes the holding', () => {
        const p = new Portfolio();
        p.buy('ACME', 3, 10);
        expect(p.sell('ACME', 3, 12)).toBe(36);
        expect(p.holdings.ACME).toBeUndefined();
        expect(p.costBasis.ACME).toBeUndefined();
        expect(p.totalInvested).toBe(0);
        expect(p.getQuantity('ACME')).toBe(0);
    });

    it('rejects overselling and unknown stocks', () => {
        const p = new Portfolio();
        p.buy('ACME', 2, 10);
        expect(p.sell('ACME', 3, 10)).toBe(0);
        expect(p.sell('NOPE', 1, 10)).toBe(0);
        expect(p.holdings.ACME).toBe(2);
    });

    it('rejects fractional, zero, negative quantities and non-positive prices', () => {
        const p = new Portfolio();
        for (const q of [0, -1, 1.5, NaN, '2']) expect(p.buy('ACME', q, 10)).toBe(false);
        expect(p.buy('ACME', 1, 0)).toBe(false);
        expect(p.buy('ACME', 1, -3)).toBe(false);
        p.buy('ACME', 2, 10);
        expect(p.sell('ACME', 0.5, 10)).toBe(0);
        expect(p.totalInvested).toBe(20);
    });

    it('tracks stocks independently', () => {
        const p = new Portfolio();
        p.buy('A', 1, 100);
        p.buy('B', 2, 10);
        p.sell('A', 1, 50);
        expect(p.holdings).toEqual({ B: 2 });
        expect(p.totalInvested).toBe(20);
    });
});
