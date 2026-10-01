import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';

describe('UIUpdater', () => {
  describe('updateBankScreen', () => {
    let uiUpdater;
    let mockGame;

    beforeEach(() => {
      // Mock the game object with minimal setup
      mockGame = {
        gameState: {},
        gameStore: null
      };

      // Mock LitUIManager since it might require DOM elements
      vi.mock('../../src/js/ui/LitUIManager.js', () => ({
        LitUIManager: class {
          constructor() {}
          initialize() {}
        }
      }));

      // Setup required DOM elements for UIUpdater constructor
      document.body.innerHTML = `
        <div id="top-bar-container"></div>
        <div id="rank-progress-container"></div>
        <div id="bank-savings-balance"></div>
        <div id="bank-loan-balance"></div>
        <div id="bank-credit-score"></div>
        <div id="bank-loan-limit"></div>
        <div id="bank-net-worth"></div>
      `;

      uiUpdater = new UIUpdater(mockGame);
    });

    it('should return immediately if gameState.bank is missing', () => {
      mockGame.gameState.bank = undefined;
      mockGame.gameState.money = 100;
      mockGame.gameState.reputation = 10;

      // Call the method
      uiUpdater.updateBankScreen();

      // Verify no DOM elements were updated
      const savingsEl = document.getElementById('bank-savings-balance');
      const loanEl = document.getElementById('bank-loan-balance');
      const creditScoreEl = document.getElementById('bank-credit-score');
      const loanLimitEl = document.getElementById('bank-loan-limit');
      const netWorthEl = document.getElementById('bank-net-worth');

      expect(savingsEl.textContent).toBe('');
      expect(loanEl.textContent).toBe('');
      expect(creditScoreEl.textContent).toBe('');
      expect(loanLimitEl.textContent).toBe('');
      expect(netWorthEl.textContent).toBe('');
    });

    it('should default creditScore to 500 when missing, resulting in creditMultiplier of 1', () => {
      mockGame.gameState.bank = {
        savings: 100,
        loan: 50,
        creditScore: undefined
      };
      mockGame.gameState.money = 200;
      mockGame.gameState.reputation = 0;

      uiUpdater.updateBankScreen();

      const creditScoreEl = document.getElementById('bank-credit-score');
      const loanLimitEl = document.getElementById('bank-loan-limit');

      // creditScore should be 500
      expect(creditScoreEl.textContent).toBe('500');

      // maxLoan = floor((1000 + 0 * 100) * (500 / 500)) = floor(1000 * 1) = 1000
      expect(loanLimitEl.textContent).toBe('$1,000');
    });

    it('should calculate maxLoan correctly with reputation 10 and creditScore 1000', () => {
      mockGame.gameState.bank = {
        savings: 50,
        loan: 0,
        creditScore: 1000
      };
      mockGame.gameState.money = 0;
      mockGame.gameState.reputation = 10;

      uiUpdater.updateBankScreen();

      const loanLimitEl = document.getElementById('bank-loan-limit');
      const creditScoreEl = document.getElementById('bank-credit-score');

      // limit = 1000 + (10 * 100) = 2000
      // creditMultiplier = 1000 / 500 = 2
      // maxLoan = floor(2000 * 2) = 4000
      expect(creditScoreEl.textContent).toBe('1000');
      expect(loanLimitEl.textContent).toBe('$4,000');
    });

    it('should calculate negative netWorth correctly', () => {
      mockGame.gameState.bank = {
        savings: 50,
        loan: 200,
        creditScore: 500
      };
      mockGame.gameState.money = 100;
      mockGame.gameState.reputation = 0;

      uiUpdater.updateBankScreen();

      const netWorthEl = document.getElementById('bank-net-worth');

      // netWorth = 100 + 50 - 200 = -50
      expect(netWorthEl.textContent).toBe('$-50');
    });

    it('should render zero values correctly as "$0" not blank or NaN', () => {
      mockGame.gameState.bank = {
        savings: 0,
        loan: 0,
        creditScore: 500
      };
      mockGame.gameState.money = 0;
      mockGame.gameState.reputation = 0;

      uiUpdater.updateBankScreen();

      const savingsEl = document.getElementById('bank-savings-balance');
      const loanEl = document.getElementById('bank-loan-balance');
      const netWorthEl = document.getElementById('bank-net-worth');

      // All zero values should render as "$0"
      expect(savingsEl.textContent).toBe('$0');
      expect(loanEl.textContent).toBe('$0');
      expect(netWorthEl.textContent).toBe('$0');

      // Check that they're not NaN or blank
      expect(savingsEl.textContent).not.toBe('NaN');
      expect(savingsEl.textContent).not.toBe('');
      expect(loanEl.textContent).not.toBe('NaN');
      expect(loanEl.textContent).not.toBe('');
      expect(netWorthEl.textContent).not.toBe('NaN');
      expect(netWorthEl.textContent).not.toBe('');
    });

    it('should handle all DOM elements being present and update them correctly', () => {
      mockGame.gameState.bank = {
        savings: 1000,
        loan: 500,
        creditScore: 750
      };
      mockGame.gameState.money = 5000;
      mockGame.gameState.reputation = 5;

      uiUpdater.updateBankScreen();

      const savingsEl = document.getElementById('bank-savings-balance');
      const loanEl = document.getElementById('bank-loan-balance');
      const creditScoreEl = document.getElementById('bank-credit-score');
      const loanLimitEl = document.getElementById('bank-loan-limit');
      const netWorthEl = document.getElementById('bank-net-worth');

      // Verify all elements are updated
      expect(savingsEl.textContent).toBe('$1,000');
      expect(loanEl.textContent).toBe('$500');
      expect(creditScoreEl.textContent).toBe('750');
      // limit = 1000 + (5 * 100) = 1500
      // creditMultiplier = 750 / 500 = 1.5
      // maxLoan = floor(1500 * 1.5) = 2250
      expect(loanLimitEl.textContent).toBe('$2,250');
      // netWorth = 5000 + 1000 - 500 = 5500
      expect(netWorthEl.textContent).toBe('$5,500');
    });

    it('should use optional chaining and defaults for bank properties', () => {
      mockGame.gameState.bank = {
        savings: undefined,
        loan: undefined,
        creditScore: undefined
      };
      mockGame.gameState.money = 100;
      mockGame.gameState.reputation = 0;

      uiUpdater.updateBankScreen();

      const savingsEl = document.getElementById('bank-savings-balance');
      const loanEl = document.getElementById('bank-loan-balance');

      // Undefined values should default to 0
      expect(savingsEl.textContent).toBe('$0');
      expect(loanEl.textContent).toBe('$0');
    });
  });
});
