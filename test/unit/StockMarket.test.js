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

        it('should record the 3% move as lastChangePct/lastChange on tech stocks', () => {
            const techStocks = stockMarket.stocks.filter(s => s.sector === 'Tech');
            expect(techStocks.length).toBeGreaterThan(0);
            const originalPrices = techStocks.map(s => s.price);

            stockMarket.triggerBoom();

            techStocks.forEach((stock, index) => {
                expect(stock.lastChangePct).toBeCloseTo(0.03, 10);
                expect(stock.lastChange).toBeCloseTo(originalPrices[index] * 0.03, 5);
            });
        });

        it('should cap tech stock history at 100 entries', () => {
            const techStocks = stockMarket.stocks.filter(s => s.sector === 'Tech');
            techStocks.forEach(stock => {
                stock.history = Array.from({ length: 100 }, (_, i) => i + 1);
            });

            stockMarket.triggerBoom();

            techStocks.forEach(stock => {
                expect(stock.history.length).toBe(100);
                expect(stock.history[0]).toBe(2); // oldest entry dropped
                expect(stock.history[99]).toBeCloseTo(stock.price, 10);
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
