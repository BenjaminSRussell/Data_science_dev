import { InputManager } from '../InputManager.js';
import { Game } from '../Game.js';
import { UIUpdater } from '../UIUpdater.js';
import { BankSystem } from '../bank/BankSystem.js';
import { SaveSlotManager } from '../SaveSlotManager.js';
import { SaveManager } from '../SaveManager.js';

jest.mock('../Game.js');
jest.mock('../UIUpdater.js');
jest.mock('../bank/BankSystem.js');
jest.mock('../SaveSlotManager.js');
jest.mock('../SaveManager.js');

describe('InputManager', () => {
    let inputManager;
    let game;
    let uiUpdater;
    let bankSystem;
    let saveSlotManager;
    let saveManager;

    beforeEach(() => {
        game = new Game();
        uiUpdater = new UIUpdater();
        bankSystem = new BankSystem();
        saveSlotManager = new SaveSlotManager();
        saveManager = new SaveManager();

        inputManager = new InputManager(game, uiUpdater, bankSystem, saveSlotManager, saveManager);
    });

    describe('Setup All', () => {
        it('should setup all event listeners', () => {
            inputManager.setupAll();
            expect(inputManager.listeners.length).toBeGreaterThan(0);
        });
    });

    describe('btn-new-game vs btn-continue', () => {
        const mockButtons = [
            { id: 'btn-new-game' },
            { id: 'btn-continue' }
        ];

        beforeEach(() => {
            mockButtons.forEach(button => document.body.appendChild(button));
            jest.spyOn(game, 'handleSlotSelection');
            jest.spyOn(game, 'continueGame');
        });

        afterEach(() => {
            mockButtons.forEach(button => document.body.removeChild(button));
        });

        describe('btn-new-game', () => {
            it('should select a free slot when available', () => {
                saveSlotManager.isSlotFree.mockReturnValue(true);
                saveSlotManager.getMostRecentSlot.mockReturnValue(null);
                inputManager.handleNewGame();
                expect(game.handleSlotSelection).toHaveBeenCalledWith(0, true);
            });

            it('should fall back to slot 0 when all slots are full', () => {
                saveSlotManager.isSlotFree.mockReturnValue(false);
                saveSlotManager.getMostRecentSlot.mockReturnValue(null);
                inputManager.handleNewGame();
                expect(game.handleSlotSelection).toHaveBeenCalledWith(0, true);
            });
        });

        describe('btn-continue', () => {
            it('should continue game with the most recent slot', () => {
                const mockIndex = 1;
                saveSlotManager.getMostRecentSlot.mockReturnValue(mockIndex);
                inputManager.handleContinueGame();
                expect(game.continueGame).toHaveBeenCalledWith(mockIndex);
            });

            it('should do nothing when no save is available', () => {
                saveSlotManager.getMostRecentSlot.mockReturnValue(null);
                inputManager.handleContinueGame();
                expect(game.continueGame).not.toHaveBeenCalled();
            });
        });
    });

    describe('bank-action validator', () => {
        const mockInputs = [
            { id: 'bank-deposit', value: '100' },
            { id: 'bank-withdraw', value: '50' },
            { id: 'bank-loan', value: '200' },
            { id: 'bank-repay', value: '150' }
        ];

        beforeEach(() => {
            mockInputs.forEach(input => document.body.appendChild(input));
            jest.spyOn(bankSystem, 'deposit');
            jest.spyOn(bankSystem, 'withdraw');
            jest.spyOn(bankSystem, 'loan');
            jest.spyOn(bankSystem, 'repay');
            jest.spyOn(uiUpdater, 'updateAllUI');
        });

        afterEach(() => {
            mockInputs.forEach(input => document.body.removeChild(input));
        });

        describe('successful bank actions', () => {
            it('should handle deposit', () => {
                const input = document.getElementById('bank-deposit');
                inputManager.handleBankAction(input);
                expect(bankSystem.deposit).toHaveBeenCalledWith(100);
                expect(uiUpdater.updateAllUI).toHaveBeenCalled();
            });

            it('should handle withdraw', () => {
                const input = document.getElementById('bank-withdraw');
                inputManager.handleBankAction(input);
                expect(bankSystem.withdraw).toHaveBeenCalledWith(50);
                expect(uiUpdater.updateAllUI).toHaveBeenCalled();
            });

            it('should handle loan', () => {
                const input = document.getElementById('bank-loan');
                inputManager.handleBankAction(input);
                expect(bankSystem.loan).toHaveBeenCalledWith(200);
                expect(uiUpdater.updateAllUI).toHaveBeenCalled();
            });

            it('should handle repay', () => {
                const input = document.getElementById('bank-repay');
                inputManager.handleBankAction(input);
                expect(bankSystem.repay).toHaveBeenCalledWith(150);
                expect(uiUpdater.updateAllUI).toHaveBeenCalled();
            });
        });

        describe('failed bank actions', () => {
            it('should handle invalid deposit', () => {
                const input = document.getElementById('bank-deposit');
                input.value = '-100';
                inputManager.handleBankAction(input);
                expect(bankSystem.deposit).not.toHaveBeenCalled();
                expect(uiUpdater.updateAllUI).toHaveBeenCalled();
            });

            it('should handle invalid withdraw', () => {
                const input = document.getElementById('bank-withdraw');
                input.value = 'abc';
                inputManager.handleBankAction(input);
                expect(bankSystem.withdraw).not.toHaveBeenCalled();
                expect(uiUpdater.updateAllUI).toHaveBeenCalled();
            });

            it('should handle invalid loan', () => {
                const input = document.getElementById('bank-loan');
                input.value = '0';
                inputManager.handleBankAction(input);
                expect(bankSystem.loan).not.toHaveBeenCalled();
                expect(uiUpdater.updateAllUI).toHaveBeenCalled();
            });

            it('should handle invalid repay', () => {
                const input = document.getElementById('bank-repay');
                input.value = '';
                inputManager.handleBankAction(input);
                expect(bankSystem.repay).not.toHaveBeenCalled();
                expect(uiUpdater.updateAllUI).toHaveBeenCalled();
            });
        });
    });

    describe('visibilitychange auto-save', () => {
        it('should trigger auto-save on visibility change', () => {
            document.dispatchEvent(new Event('visibilitychange'));
            expect(game.save).toHaveBeenCalled();
        });
    });

    describe('window promotion listener', () => {
        it('should trigger promotion on window focus', () => {
            window.dispatchEvent(new Event('focus'));
            expect(game.handlePromotion).toHaveBeenCalled();
        });
    });
});