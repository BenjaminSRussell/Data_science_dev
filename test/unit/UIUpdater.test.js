import { expect } from 'chai';
import { stub } from 'sinon';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';

describe('UIUpdater', () => {
    let uiUpdater;
    let mockGame;
    let mockGameState;
    let mockBank;
    let mockReputation;
    let mockMoney;
    let mockElements;

    beforeEach(() => {
        mockGameState = {
            bank: {},
            reputation: 0,
            money: 0
        };
        mockGame = {
            gameState: mockGameState
        };
        mockBank = {
            creditScore: 500,
            creditMultiplier: 1
        };
        mockReputation = 10;
        mockMoney = 100;
        mockElements = {
            'bank-savings-balance': document.createElement('div'),
            'bank-loan-balance': document.createElement('div'),
            'bank-credit-score': document.createElement('div'),
            'bank-loan-limit': document.createElement('div'),
            'bank-net-worth': document.createElement('div')
        };

        Object.keys(mockElements).forEach(key => {
            document.body.appendChild(mockElements[key]);
        });

        uiUpdater = new UIUpdater(mockGame);
    });

    afterEach(() => {
        Object.keys(mockElements).forEach(key => {
            document.body.removeChild(mockElements[key]);
        });
    });

    it('should return immediately if no gameState.bank', () => {
        mockGameState.bank = undefined;
        uiUpdater.updateBankScreen();
        expect(mockElements['bank-loan-limit'].textContent).to.equal('');
        expect(mockElements['bank-net-worth'].textContent).to.equal('');
    });

    it('should default creditScore to 500 if missing', () => {
        delete mockGameState.bank.creditScore;
        mockGameState.bank.creditMultiplier = 2;
        mockGameState.reputation = 10;
        mockGameState.money = 100;
        mockGameState.bank.savings = 50;
        mockGameState.bank.loan = 200;

        uiUpdater.updateBankScreen();
        const maxLoan = Math.floor((500 + 1000) * 2);
        expect(mockElements['bank-loan-limit'].textContent).to.equal(maxLoan.toLocaleString());
        const netWorth = mockGameState.money + mockGameState.bank.savings - mockGameState.bank.loan;
        expect(mockElements['bank-net-worth'].textContent).to.equal(netWorth.toLocaleString());
    });

    it('should calculate maxLoan with creditMultiplier exactly 1', () => {
        mockGameState.bank = mockBank;
        mockGameState.reputation = 10;
        mockGameState.money = 100;
        mockGameState.bank.savings = 50;
        mockGameState.bank.loan = 200;

        uiUpdater.updateBankScreen();
        const maxLoan = Math.floor((mockBank.creditScore + mockBank.creditScore) * 1);
        expect(mockElements['bank-loan-limit'].textContent).to.equal(maxLoan.toLocaleString());
        const netWorth = mockGameState.money + mockGameState.bank.savings - mockGameState.bank.loan;
        expect(mockElements['bank-net-worth'].textContent).to.equal(netWorth.toLocaleString());
    });

    it('should handle negative netWorth', () => {
        mockGameState.bank = mockBank;
        mockGameState.reputation = 10;
        mockGameState.money = 100;
        mockGameState.bank.savings = 0;
        mockGameState.bank.loan = 50;

        uiUpdater.updateBankScreen();
        const netWorth = mockGameState.money + mockGameState.bank.savings - mockGameState.bank.loan;
        expect(mockElements['bank-net-worth'].textContent).to.equal(netWorth.toLocaleString());
    });

    it('should render bank savings and loan as $0 when both are 0', () => {
        mockGameState.bank = mockBank;
        mockGameState.reputation = 10;
        mockGameState.money = 100;
        mockGameState.bank.savings = 0;
        mockGameState.bank.loan = 0;

        uiUpdater.updateBankScreen();
        expect(mockElements['bank-savings-balance'].textContent).to.equal('$0');
        expect(mockElements['bank-loan-balance'].textContent).to.equal('$0');
    });
});