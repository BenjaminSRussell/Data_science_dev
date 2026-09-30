/**
 * Unit tests for MapHelpers - handleLocationAction function
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger } from '../../src/js/utils/Logger.js';

// Mock CameraSystem with a factory function to provide a class
vi.mock('../../src/js/camera/CameraSystem.js', () => ({
    CameraSystem: vi.fn(function(container) {
        this.container = container;
    })
}));

vi.mock('../../src/js/game/NPCManager.js');
vi.mock('../../src/js/helpers/MapIconRenderer.js');
vi.mock('../../src/js/game/MapSystemInitializer.js');
vi.mock('../../src/js/utils/DOMUtils.js', () => ({
    DOMUtils: {
        updateElement: vi.fn(),
        clear: vi.fn(),
        createElement: vi.fn(),
        queryAll: vi.fn(() => []),
        toggleClass: vi.fn(),
        batch: vi.fn()
    }
}));

// Mock the logger
vi.mock('../../src/js/utils/Logger.js', () => ({
    logger: {
        warn: vi.fn()
    }
}));

import { handleLocationAction } from '../../src/js/helpers/MapHelpers.js';

describe('MapHelpers', () => {
    describe('handleLocationAction', () => {
        let mockGame;

        beforeEach(() => {
            // Create a minimal mock game object
            mockGame = {
                gameState: {
                    money: 100 // Start with sufficient funds for most tests
                },
                timeManager: {
                    restoreEnergy: vi.fn(),
                    gainEnergy: vi.fn() // Current code calls gainEnergy (the bug)
                },
                uiUpdater: {
                    updateAllUI: vi.fn()
                },
                audioManager: {
                    play: vi.fn()
                },
                showToast: vi.fn(),
                showError: vi.fn()
            };
        });

        it('should log warning and do nothing for unknown action id', () => {
            handleLocationAction(mockGame, 'not_a_real_action');

            expect(logger.warn).toHaveBeenCalledWith('Unknown action:', 'not_a_real_action');
            expect(mockGame.gameState.money).toBe(100); // Money unchanged
            expect(mockGame.timeManager.gainEnergy).not.toHaveBeenCalled();
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should call showError and not deduct money for insufficient funds', () => {
            mockGame.gameState.money = 3; // Less than donut cost (5)

            handleLocationAction(mockGame, 'buy_donut');

            expect(mockGame.showError).toHaveBeenCalledWith('Not enough money!');
            expect(mockGame.gameState.money).toBe(3); // Money unchanged
            expect(mockGame.timeManager.gainEnergy).not.toHaveBeenCalled();
            expect(mockGame.uiUpdater.updateAllUI).not.toHaveBeenCalled();
        });

        it('should deduct money and call gainEnergy for successful purchase with energyGain > 0', () => {
            mockGame.gameState.money = 50;

            handleLocationAction(mockGame, 'buy_donut');

            expect(mockGame.gameState.money).toBe(45); // Deducted cost of 5
            // NOTE: Current code calls gainEnergy (the bug). This test verifies current behavior.
            // Once the separate gainEnergy → restoreEnergy fix lands, this should assert restoreEnergy
            expect(mockGame.timeManager.gainEnergy).toHaveBeenCalledWith(10); // energyGain is 10 for donut
            expect(mockGame.uiUpdater.updateAllUI).toHaveBeenCalled();
            expect(mockGame.audioManager.play).toHaveBeenCalledWith('kaching');
            expect(mockGame.showToast).toHaveBeenCalledWith('Yummy donut! +10 Energy', 'success');
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should deduct money but not call gainEnergy for purchase with energyGain === 0', () => {
            mockGame.gameState.money = 50;

            handleLocationAction(mockGame, 'buy_flowers');

            expect(mockGame.gameState.money).toBe(35); // Deducted cost of 15
            expect(mockGame.timeManager.gainEnergy).not.toHaveBeenCalled(); // energyGain is 0
            expect(mockGame.uiUpdater.updateAllUI).toHaveBeenCalled();
            expect(mockGame.audioManager.play).toHaveBeenCalledWith('kaching');
            expect(mockGame.showToast).toHaveBeenCalledWith('Smells nice! You feel happier.', 'success');
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should handle bagel purchase correctly', () => {
            mockGame.gameState.money = 100;

            handleLocationAction(mockGame, 'buy_bagel');

            // Bagel: cost 6, energyGain 12
            expect(mockGame.gameState.money).toBe(94);
            expect(mockGame.timeManager.gainEnergy).toHaveBeenCalledWith(12);
            expect(mockGame.showToast).toHaveBeenCalledWith('Tasty bagel! +12 Energy', 'success');
        });

        it('should handle plant purchase (zero energy gain)', () => {
            mockGame.gameState.money = 50;

            handleLocationAction(mockGame, 'buy_plant');

            expect(mockGame.gameState.money).toBe(25); // Cost is 25
            expect(mockGame.timeManager.gainEnergy).not.toHaveBeenCalled();
            expect(mockGame.showToast).toHaveBeenCalledWith('A nice plant for your office. (Visual only for now)', 'success');
        });
    });
});
