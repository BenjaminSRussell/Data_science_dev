/**
 * Unit tests for StockMarketHelpers
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

vi.mock('../../src/js/game/QuotronTicker.js', () => {
    return {
        QuotronTicker: vi.fn().mockImplementation(() => ({
            start: vi.fn(),
            refresh: vi.fn()
        }))
    };
});

import * as StockMarketHelpers from '../../src/js/helpers/StockMarketHelpers.js';

describe('StockMarketHelpers', () => {
    let mockGame;
    let promptSpy;
    let updateStockMarketScreenSpy;

    beforeEach(() => {
        mockGame = {
            stockMarket: {
                buyStock: vi.fn(),
                sellStock: vi.fn()
            },
            showToast: vi.fn(),
            showError: vi.fn(),
            uiUpdater: {
                updateAllUI: vi.fn(),
                updateHeatMeter: vi.fn() // added to UIUpdater by #2024
            }
        };

        promptSpy = vi.spyOn(window, 'prompt');
        updateStockMarketScreenSpy = vi.spyOn(StockMarketHelpers, 'updateStockMarketScreen').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('handleBuyStock', () => {
        it('should not call buyStock when user cancels (prompt returns null)', () => {
            promptSpy.mockReturnValue(null);

            StockMarketHelpers.handleBuyStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.buyStock).not.toHaveBeenCalled();
            expect(mockGame.showToast).not.toHaveBeenCalled();
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should not call buyStock when user enters empty string (prompt returns "")', () => {
            promptSpy.mockReturnValue('');

            StockMarketHelpers.handleBuyStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.buyStock).not.toHaveBeenCalled();
            expect(mockGame.showToast).not.toHaveBeenCalled();
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should not call buyStock when quantity is 0', () => {
            promptSpy.mockReturnValue('0');

            StockMarketHelpers.handleBuyStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.buyStock).not.toHaveBeenCalled();
            expect(mockGame.showToast).not.toHaveBeenCalled();
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should not call buyStock when quantity is negative', () => {
            promptSpy.mockReturnValue('-3');

            StockMarketHelpers.handleBuyStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.buyStock).not.toHaveBeenCalled();
            expect(mockGame.showToast).not.toHaveBeenCalled();
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should call buyStock with correct parameters and show toast on success', () => {
            promptSpy.mockReturnValue('10');
            mockGame.stockMarket.buyStock.mockReturnValue({
                success: true,
                stock: { ticker: 'AAPL' }
            });

            StockMarketHelpers.handleBuyStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.buyStock).toHaveBeenCalledWith('STOCK_ID', 10);
            expect(mockGame.showToast).toHaveBeenCalledWith('Bought 10 shares of AAPL', 'success');
            expect(mockGame.uiUpdater.updateAllUI).toHaveBeenCalled();
        });

        it('should call showError when buyStock fails', () => {
            promptSpy.mockReturnValue('10');
            mockGame.stockMarket.buyStock.mockReturnValue({
                success: false,
                reason: 'Insufficient funds'
            });

            StockMarketHelpers.handleBuyStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.buyStock).toHaveBeenCalledWith('STOCK_ID', 10);
            expect(mockGame.showError).toHaveBeenCalledWith('Insufficient funds');
            expect(mockGame.showToast).not.toHaveBeenCalled();
            expect(mockGame.uiUpdater.updateAllUI).not.toHaveBeenCalled();
        });
    });

    describe('handleSellStock', () => {
        it('should not call sellStock when user cancels (prompt returns null)', () => {
            promptSpy.mockReturnValue(null);

            StockMarketHelpers.handleSellStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.sellStock).not.toHaveBeenCalled();
            expect(mockGame.showToast).not.toHaveBeenCalled();
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should not call sellStock when user enters empty string (prompt returns "")', () => {
            promptSpy.mockReturnValue('');

            StockMarketHelpers.handleSellStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.sellStock).not.toHaveBeenCalled();
            expect(mockGame.showToast).not.toHaveBeenCalled();
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should not call sellStock when quantity is 0', () => {
            promptSpy.mockReturnValue('0');

            StockMarketHelpers.handleSellStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.sellStock).not.toHaveBeenCalled();
            expect(mockGame.showToast).not.toHaveBeenCalled();
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should not call sellStock when quantity is negative', () => {
            promptSpy.mockReturnValue('-3');

            StockMarketHelpers.handleSellStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.sellStock).not.toHaveBeenCalled();
            expect(mockGame.showToast).not.toHaveBeenCalled();
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should call sellStock with correct parameters and show toast on success', () => {
            promptSpy.mockReturnValue('10');
            mockGame.stockMarket.sellStock.mockReturnValue({
                success: true,
                stock: { ticker: 'AAPL' }
            });

            StockMarketHelpers.handleSellStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.sellStock).toHaveBeenCalledWith('STOCK_ID', 10);
            expect(mockGame.showToast).toHaveBeenCalledWith('Sold 10 shares of AAPL', 'success');
            expect(mockGame.uiUpdater.updateAllUI).toHaveBeenCalled();
        });

        it('should call showError when sellStock fails', () => {
            promptSpy.mockReturnValue('10');
            mockGame.stockMarket.sellStock.mockReturnValue({
                success: false,
                reason: 'Not enough shares'
            });

            StockMarketHelpers.handleSellStock(mockGame, 'STOCK_ID');

            expect(mockGame.stockMarket.sellStock).toHaveBeenCalledWith('STOCK_ID', 10);
            expect(mockGame.showError).toHaveBeenCalledWith('Not enough shares');
            expect(mockGame.showToast).not.toHaveBeenCalled();
            expect(mockGame.uiUpdater.updateAllUI).not.toHaveBeenCalled();
        });
    });
});
