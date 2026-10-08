/**
 * Stock trades move exact cents even though prices are unrounded floats (#254)
 */
import { describe, it, expect } from 'vitest';
import { StockMarket } from '../../src/js/game/StockMarket.js';

function market(money = 10000) {
    const gs = { money, legalSystem: { hasLicense: () => true } };
    const m = new StockMarket(gs);
    return { m, gs };
}

describe('StockMarket cents (#254)', () => {
    it('toCents rounds to two decimals', () => {
        expect(StockMarket.toCents(1234.5600000000002)).toBe(1234.56);
        expect(StockMarket.toCents(0.105)).toBeCloseTo(0.11, 10);
        expect(StockMarket.toCents(undefined)).toBe(0);
    });

    it('buy then sell at the same float price returns exactly the starting money', () => {
        const { m, gs } = market();
        const stock = m.stocks[0];
        stock.price = 150.123456789;
        const buy = m.buyStock(stock.id, 7);
        expect(buy.success).toBe(true);
        expect(Number.isInteger(Math.round(gs.money * 100))).toBe(true);
        expect(gs.money).toBe(StockMarket.toCents(10000 - StockMarket.toCents(150.123456789 * 7)));
        const sell = m.sellStock(stock.id, 7);
        expect(sell.success).toBe(true);
        expect(gs.money).toBe(10000);
    });
});
