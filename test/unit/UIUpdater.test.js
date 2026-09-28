import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { GameState } from '../../src/js/game/GameState.js';

const BANK_ELEMENT_IDS = [
    'bank-savings-balance',
    'bank-loan-balance',
    'bank-credit-score',
    'bank-loan-limit',
    'bank-net-worth'
];

describe('UIUpdater', () => {
    let uiUpdater;
    let gameState;
    let elements;

    beforeEach(() => {
        // A fresh GameState starts with money 100, reputation 0 and no bank
        gameState = new GameState();

        elements = {};
        BANK_ELEMENT_IDS.forEach(id => {
            const element = document.createElement('div');
            element.id = id;
            document.body.appendChild(element);
            elements[id] = element;
        });

        uiUpdater = new UIUpdater({ gameState });
    });

    afterEach(() => {
        BANK_ELEMENT_IDS.forEach(id => {
            document.body.removeChild(elements[id]);
        });
    });

    it('should return immediately if no gameState.bank', () => {
        BANK_ELEMENT_IDS.forEach(id => {
            elements[id].textContent = 'untouched';
        });
        expect(gameState.bank).toBe(null);

        uiUpdater.updateBankScreen();

        BANK_ELEMENT_IDS.forEach(id => {
            expect(elements[id].textContent).toBe('untouched');
        });
    });

    it('should default creditScore to 500 if missing', () => {
        gameState.bank = { savings: 50, loan: 200 };
        gameState.reputation = 10;
        gameState.money = 100;

        uiUpdater.updateBankScreen();

        expect(elements['bank-credit-score'].textContent).toBe('500');
        // limit = 1000 + 10 * 100 = 2000, multiplier = 500 / 500 = 1
        expect(elements['bank-loan-limit'].textContent).toBe(`$${(2000).toLocaleString()}`);
        expect(elements['bank-net-worth'].textContent).toBe('$-50');
    });

    it('should calculate maxLoan with creditMultiplier exactly 1', () => {
        gameState.bank = { creditScore: 500, savings: 50, loan: 200 };
        gameState.reputation = 10;
        gameState.money = 100;

        uiUpdater.updateBankScreen();

        expect(elements['bank-credit-score'].textContent).toBe('500');
        expect(elements['bank-loan-limit'].textContent).toBe(`$${(2000).toLocaleString()}`);
        expect(elements['bank-net-worth'].textContent).toBe('$-50');
    });

    it('should scale maxLoan by creditScore / 500 and round it down', () => {
        gameState.bank = { creditScore: 1000, savings: 0, loan: 0 };
        gameState.reputation = 10;

        uiUpdater.updateBankScreen();

        // (1000 + 10 * 100) * (1000 / 500) = 4000
        expect(elements['bank-credit-score'].textContent).toBe('1000');
        expect(elements['bank-loan-limit'].textContent).toBe(`$${(4000).toLocaleString()}`);

        gameState.bank.creditScore = 333;
        gameState.reputation = 1;

        uiUpdater.updateBankScreen();

        // (1000 + 1 * 100) * (333 / 500) = 732.6, floored to 732
        expect(elements['bank-loan-limit'].textContent).toBe('$732');
    });

    it('should handle negative netWorth', () => {
        gameState.bank = { creditScore: 500, savings: 50, loan: 200 };
        gameState.reputation = 10;
        gameState.money = 100;

        uiUpdater.updateBankScreen();

        // 100 + 50 - 200 = -50
        expect(elements['bank-net-worth'].textContent).toBe('$-50');
        expect(elements['bank-savings-balance'].textContent).toBe('$50');
        expect(elements['bank-loan-balance'].textContent).toBe('$200');
    });

    it('should render bank savings and loan as $0 when both are 0', () => {
        gameState.bank = { creditScore: 500, savings: 0, loan: 0 };
        gameState.reputation = 10;
        gameState.money = 100;

        uiUpdater.updateBankScreen();

        expect(elements['bank-savings-balance'].textContent).toBe('$0');
        expect(elements['bank-loan-balance'].textContent).toBe('$0');
        expect(elements['bank-net-worth'].textContent).toBe('$100');
    });
});
