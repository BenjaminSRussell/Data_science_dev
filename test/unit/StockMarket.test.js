import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StockMarket } from '../../src/js/game/StockMarket.js';

describe('StockMarket', () => {
    let mockGameState;
    let stockMarket;

    beforeEach(() => {
        mockGameState = {
            money: 10000,
            characterStats: {
                ethics: 50
            },
            legalSystem: {
                hasLicense: vi.fn().mockReturnValue(true)
            },
            timeManager: {
                totalDays: 0
            }
        };

        stockMarket = new StockMarket(mockGameState);
    });

    describe('triggerCrash', () => {
        it('should exist as a method', () => {
            expect(typeof stockMarket.triggerCrash).toBe('function');
        });

        it('should reduce market trends for all markets', () => {
            const originalTrends = { ...stockMarket.marketTrends };

            stockMarket.triggerCrash();

            Object.keys(stockMarket.marketTrends).forEach(market => {
                expect(stockMarket.marketTrends[market]).toBeLessThan(originalTrends[market]);
            });
        });

        it('should reduce market trends by 5%', () => {
            const originalTrends = { ...stockMarket.marketTrends };

            stockMarket.triggerCrash();

            Object.keys(stockMarket.marketTrends).forEach(market => {
                const expected = originalTrends[market] - 0.05;
                expect(stockMarket.marketTrends[market]).toBeCloseTo(expected, 5);
            });
        });

        it('should call updateIndices', () => {
            const spy = vi.spyOn(stockMarket, 'updateIndices');

            stockMarket.triggerCrash();

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('triggerBoom', () => {
        it('should exist as a method', () => {
            expect(typeof stockMarket.triggerBoom).toBe('function');
        });

        it('should increase US market trend', () => {
            const originalUSTrip = stockMarket.marketTrends['US'];

            stockMarket.triggerBoom();

            expect(stockMarket.marketTrends['US']).toBeGreaterThan(originalUSTrip);
        });

        it('should increase ASIA market trend', () => {
            const originalAsiaTrend = stockMarket.marketTrends['ASIA'];

            stockMarket.triggerBoom();

            expect(stockMarket.marketTrends['ASIA']).toBeGreaterThan(originalAsiaTrend);
        });

        it('should increase US trend by 2%', () => {
            const originalUSTrend = stockMarket.marketTrends['US'];

            stockMarket.triggerBoom();

            expect(stockMarket.marketTrends['US']).toBeCloseTo(originalUSTrend + 0.02, 5);
        });

        it('should increase ASIA trend by 1.5%', () => {
            const originalAsiaTrend = stockMarket.marketTrends['ASIA'];

            stockMarket.triggerBoom();

            expect(stockMarket.marketTrends['ASIA']).toBeCloseTo(originalAsiaTrend + 0.015, 5);
        });

        it('should boost tech stock prices by 3%', () => {
            const techStocks = stockMarket.stocks.filter(s => s.sector === 'Tech');
            const originalPrices = techStocks.map(s => s.price);

            stockMarket.triggerBoom();

            techStocks.forEach((stock, index) => {
                const expectedPrice = originalPrices[index] * 1.03;
                expect(stock.price).toBeCloseTo(expectedPrice, 5);
            });
        });

        it('should add tech stock prices to their history', () => {
            const techStocks = stockMarket.stocks.filter(s => s.sector === 'Tech');
            const originalHistoryLengths = techStocks.map(s => s.history.length);

            stockMarket.triggerBoom();

            techStocks.forEach((stock, index) => {
                expect(stock.history.length).toBe(originalHistoryLengths[index] + 1);
            });
        });

        it('should call updateIndices', () => {
            const spy = vi.spyOn(stockMarket, 'updateIndices');

            stockMarket.triggerBoom();

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('WorldEventManager integration', () => {
        it('triggerCrash should not throw when called by WorldEventManager', () => {
            expect(() => stockMarket.triggerCrash()).not.toThrow();
        });

        it('triggerBoom should not throw when called by WorldEventManager', () => {
            expect(() => stockMarket.triggerBoom()).not.toThrow();
        });
    });
});

describe('StockMarket manipulation unwinding', () => {
    it('a pump deflates back to the pre-manipulation price within 3 updates', () => {
        const market = new StockMarket({ money: 0, legalSystem: { hasLicense: () => true } });
        const stock = market.stocks[0];
        stock.update = () => {}; // isolate from the random walk
        market.stocks.forEach(s => { s.update = () => {}; });
        const base = stock.price;
        const baseVol = stock.volatility;

        market.manipulateStock(stock.id, 'pump', 1.5);
        expect(stock.price).toBeCloseTo(base * 1.5);
        // pumping again keeps the original base price
        market.manipulateStock(stock.id, 'pump', 1.5);
        expect(stock.manipulation.basePrice).toBe(base);

        market.update();
        market.update();
        market.update();
        expect(stock.price).toBeCloseTo(base);
        expect(stock.volatility).toBeCloseTo(baseVol);
        expect(stock.manipulation).toBeUndefined();
    });

    it('persists an in-progress manipulation through save/load', () => {
        const gs = { money: 0, legalSystem: { hasLicense: () => true } };
        const market = new StockMarket(gs);
        const id = market.stocks[0].id;
        market.manipulateStock(id, 'pump', 1.5);
        const restored = new StockMarket(gs);
        restored.fromJSON(JSON.parse(JSON.stringify(market.toJSON())));
        expect(restored.stocks[0].manipulation).toMatchObject({ daysLeft: 3 });
    });
});
