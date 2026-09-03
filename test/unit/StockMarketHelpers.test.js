import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/js/game/QuotronTicker.js', () => ({
  QuotronTicker: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    refresh: vi.fn(),
  })),
}));

import { handleBuyStock, handleSellStock } from '../../src/js/helpers/StockMarketHelpers.js';

describe('StockMarketHelpers prompt-driven quantity parsing', () => {
  let game;
  let promptSpy;

  beforeEach(() => {
    promptSpy = vi.spyOn(window, 'prompt');
    game = {
      stockMarket: {
        buyStock: vi.fn(),
        sellStock: vi.fn(),
      },
      showToast: vi.fn(),
      showError: vi.fn(),
      uiUpdater: { updateAllUI: vi.fn() },
    };
  });

  afterEach(() => {
    promptSpy.mockRestore();
  });

  describe('handleBuyStock', () => {
    it('does not call buyStock when prompt returns "" (user cancels)', () => {
      promptSpy.mockReturnValue('');
      handleBuyStock(game, 'stock-1');
      expect(game.stockMarket.buyStock).not.toHaveBeenCalled();
    });

    it('does not call buyStock when prompt returns null (user cancels)', () => {
      promptSpy.mockReturnValue(null);
      handleBuyStock(game, 'stock-1');
      expect(game.stockMarket.buyStock).not.toHaveBeenCalled();
    });

    it('does not call buyStock when prompt returns "0"', () => {
      promptSpy.mockReturnValue('0');
      handleBuyStock(game, 'stock-1');
      expect(game.stockMarket.buyStock).not.toHaveBeenCalled();
    });

    it('does not call buyStock when prompt returns "-3"', () => {
      promptSpy.mockReturnValue('-3');
      handleBuyStock(game, 'stock-1');
      expect(game.stockMarket.buyStock).not.toHaveBeenCalled();
    });

    it('calls buyStock with parsed quantity and shows success toast on success', () => {
      promptSpy.mockReturnValue('10');
      game.stockMarket.buyStock.mockReturnValue({ success: true, stock: { ticker: 'X' } });

      handleBuyStock(game, 'stock-1');

      expect(game.stockMarket.buyStock).toHaveBeenCalledWith('stock-1', 10);
      expect(game.showToast).toHaveBeenCalledWith('Bought 10 shares of X', 'success');
      expect(game.uiUpdater.updateAllUI).toHaveBeenCalled();
    });

    it('calls showError with reason when buyStock fails', () => {
      promptSpy.mockReturnValue('10');
      game.stockMarket.buyStock.mockReturnValue({ success: false, reason: 'Insufficient funds' });

      handleBuyStock(game, 'stock-1');

      expect(game.showError).toHaveBeenCalledWith('Insufficient funds');
      expect(game.showToast).not.toHaveBeenCalled();
      expect(game.uiUpdater.updateAllUI).not.toHaveBeenCalled();
    });
  });

  describe('handleSellStock', () => {
    it('does not call sellStock when prompt returns "" (user cancels)', () => {
      promptSpy.mockReturnValue('');
      handleSellStock(game, 'stock-1');
      expect(game.stockMarket.sellStock).not.toHaveBeenCalled();
    });

    it('does not call sellStock when prompt returns null (user cancels)', () => {
      promptSpy.mockReturnValue(null);
      handleSellStock(game, 'stock-1');
      expect(game.stockMarket.sellStock).not.toHaveBeenCalled();
    });

    it('does not call sellStock when prompt returns "0"', () => {
      promptSpy.mockReturnValue('0');
      handleSellStock(game, 'stock-1');
      expect(game.stockMarket.sellStock).not.toHaveBeenCalled();
    });

    it('does not call sellStock when prompt returns "-3"', () => {
      promptSpy.mockReturnValue('-3');
      handleSellStock(game, 'stock-1');
      expect(game.stockMarket.sellStock).not.toHaveBeenCalled();
    });

    it('calls sellStock with parsed quantity and shows success toast on success', () => {
      promptSpy.mockReturnValue('10');
      game.stockMarket.sellStock.mockReturnValue({ success: true, stock: { ticker: 'X' } });

      handleSellStock(game, 'stock-1');

      expect(game.stockMarket.sellStock).toHaveBeenCalledWith('stock-1', 10);
      expect(game.showToast).toHaveBeenCalledWith('Sold 10 shares of X', 'success');
      expect(game.uiUpdater.updateAllUI).toHaveBeenCalled();
    });

    it('calls showError with reason when sellStock fails', () => {
      promptSpy.mockReturnValue('10');
      game.stockMarket.sellStock.mockReturnValue({ success: false, reason: 'You do not own enough shares' });

      handleSellStock(game, 'stock-1');

      expect(game.showError).toHaveBeenCalledWith('You do not own enough shares');
      expect(game.showToast).not.toHaveBeenCalled();
      expect(game.uiUpdater.updateAllUI).not.toHaveBeenCalled();
    });
  });
});
