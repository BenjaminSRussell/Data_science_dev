/**
 * Unit tests for StockMarketHelpers
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateStockMarketScreen } from '../../src/js/helpers/StockMarketHelpers.js';

describe('StockMarketHelpers', () => {
    let mockGame;
    let mockStockMarket;

    beforeEach(() => {
        // Set up DOM structure
        document.body.innerHTML = `
            <div id="stock-grid"></div>
            <div id="portfolio-value"></div>
            <div id="liquid-cash"></div>
            <div id="market-indices"></div>
            <div id="market-summaries"></div>
            <div id="world-events-list"></div>
            <div id="quotron-ticker"></div>
            <div id="top-bar"></div>
        `;

        // Create mock stock market and game objects
        mockStockMarket = {
            stocks: [
                {
                    id: 'stock1',
                    ticker: 'TST1',
                    name: 'Test Stock 1',
                    market: 'US',
                    sector: 'Technology',
                    price: 100,
                    volume: 1000000,
                    history: [95, 100],
                    lastChangePct: 0.05,
                    lastChange: 5
                }
            ],
            portfolio: {
                getQuantity: vi.fn().mockReturnValue(10)
            },
            getPortfolioValue: vi.fn().mockReturnValue(1000),
            indices: {},
            activeWorldEvents: [],
            getAllMarketSummaries: vi.fn().mockReturnValue([]),
            getRecentChanges: vi.fn().mockReturnValue([]),
            // This is the key mock - returns a market summary with a small negative avgChange
            getMarketSummary: vi.fn()
        };

        mockGame = {
            stockMarket: mockStockMarket,
            gameState: {
                money: 5000
            },
            characterStats: {
                ethics: 5
            },
            showToast: vi.fn(),
            showError: vi.fn(),
            handleBuyStock: vi.fn(),
            handleSellStock: vi.fn(),
            handleCrime: vi.fn(),
            uiUpdater: {
                updateAllUI: vi.fn()
            }
        };
    });

    describe('updateStockMarketScreen - market trend formatting', () => {
        it('should display positive trend with + sign', () => {
            // Setup: market with positive avgChange
            mockStockMarket.getMarketSummary.mockReturnValue({
                avgChange: 0.005,  // 0.5%
                gainers: 5,
                losers: 2
            });

            updateStockMarketScreen(mockGame);

            const marketTrendElement = document.querySelector('.market-trend');
            expect(marketTrendElement).toBeTruthy();
            // Should contain +0.50% (with the + sign)
            expect(marketTrendElement.textContent).toContain('+0.50%');
            expect(marketTrendElement.textContent).not.toContain('+-');
        });

        it('should display negative trend with - sign (no +)', () => {
            // Setup: market with negative avgChange
            mockStockMarket.getMarketSummary.mockReturnValue({
                avgChange: -0.005,  // -0.5%
                gainers: 2,
                losers: 5
            });

            updateStockMarketScreen(mockGame);

            const marketTrendElement = document.querySelector('.market-trend');
            expect(marketTrendElement).toBeTruthy();
            // Should contain -0.50% (with the - sign, no + prefix)
            expect(marketTrendElement.textContent).toContain('-0.50%');
            expect(marketTrendElement.textContent).not.toContain('+-');
        });

        it('should not display +-0.00% for small negative values that round to -0.00', () => {
            // Setup: the bug scenario - very small negative number
            // -0.00001 * 100 = -0.001, toFixed(2) = "-0.00"
            // In JavaScript: Number("-0.00") = -0, and -0 >= 0 = true (BUG)
            mockStockMarket.getMarketSummary.mockReturnValue({
                avgChange: -0.00001,  // Very small negative
                gainers: 3,
                losers: 4
            });

            updateStockMarketScreen(mockGame);

            const marketTrendElement = document.querySelector('.market-trend');
            expect(marketTrendElement).toBeTruthy();
            const trendText = marketTrendElement.textContent;

            // The BUG would produce: +-0.00%
            // The FIX should produce: -0.00% (or just 0.00%, but -0.00% is correct)
            expect(trendText).not.toContain('+-0.00%');
            expect(trendText).toMatch(/^-?0\.00%$/);
        });

        it('should handle zero avgChange correctly', () => {
            // Setup: market with zero avgChange
            mockStockMarket.getMarketSummary.mockReturnValue({
                avgChange: 0,
                gainers: 3,
                losers: 3
            });

            updateStockMarketScreen(mockGame);

            const marketTrendElement = document.querySelector('.market-trend');
            expect(marketTrendElement).toBeTruthy();
            // Zero should display as +0.00% (since 0 >= 0 is true)
            expect(marketTrendElement.textContent).toContain('+0.00%');
            expect(marketTrendElement.textContent).not.toContain('+-');
        });

        it('should apply correct CSS class for small negative values', () => {
            // Setup: small negative avgChange
            mockStockMarket.getMarketSummary.mockReturnValue({
                avgChange: -0.00001,
                gainers: 3,
                losers: 4
            });

            updateStockMarketScreen(mockGame);

            const marketTrendElement = document.querySelector('.market-trend');
            expect(marketTrendElement).toBeTruthy();
            // trendClass is determined by avgChange, not the formatted string
            // So it should have the 'negative' class
            expect(marketTrendElement.classList.contains('negative')).toBe(true);
            expect(marketTrendElement.classList.contains('positive')).toBe(false);
        });
    });
});
