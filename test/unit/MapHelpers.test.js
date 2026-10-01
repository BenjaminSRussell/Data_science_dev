/**
 * Unit tests for MapHelpers
 * Tests location action handling including previously missing actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies before importing handleLocationAction
vi.mock('../../src/js/game/NPCManager.js', () => ({
    NPCs: {}
}));

vi.mock('../../src/js/helpers/MapIconRenderer.js', () => ({
    updateMapLocationIcons: vi.fn(),
    updateLockBadges: vi.fn()
}));

vi.mock('../../src/js/game/MapSystemInitializer.js', () => ({
    initializeMapRenderer: vi.fn()
}));

vi.mock('../../src/js/utils/DOMUtils.js', () => ({
    DOMUtils: {}
}));

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
            // Create a mock game object with all required properties
            mockGame = {
                gameState: {
                    money: 100
                },
                timeManager: {
                    gainEnergy: vi.fn()
                },
                uiUpdater: {
                    updateAllUI: vi.fn()
                },
                showError: vi.fn(),
                showToast: vi.fn(),
                audioManager: {
                    play: vi.fn()
                }
            };
        });

        it('should handle eat_bagel action', () => {
            const initialMoney = mockGame.gameState.money;

            handleLocationAction(mockGame, 'eat_bagel');

            // eat_bagel costs 5, so money should decrease by 5
            expect(mockGame.gameState.money).toBe(initialMoney - 5);
            // Should gain 12 energy
            expect(mockGame.timeManager.gainEnergy).toHaveBeenCalledWith(12);
            // Should show success toast
            expect(mockGame.showToast).toHaveBeenCalledWith('Yum!', 'success');
            // Should play sound
            expect(mockGame.audioManager.play).toHaveBeenCalledWith('kaching');
        });

        it('should handle coffee_network action', () => {
            const initialMoney = mockGame.gameState.money;

            handleLocationAction(mockGame, 'coffee_network');

            // coffee_network costs 0, so money should not change
            expect(mockGame.gameState.money).toBe(initialMoney);
            // Should gain 10 energy
            expect(mockGame.timeManager.gainEnergy).toHaveBeenCalledWith(10);
            // Should show success toast
            expect(mockGame.showToast).toHaveBeenCalledWith('Great connections! +10 Energy', 'success');
            // Should play sound
            expect(mockGame.audioManager.play).toHaveBeenCalledWith('kaching');
        });

        it('should handle buy_bagel action (existing action for comparison)', () => {
            const initialMoney = mockGame.gameState.money;

            handleLocationAction(mockGame, 'buy_bagel');

            // buy_bagel costs 6, so money should decrease by 6
            expect(mockGame.gameState.money).toBe(initialMoney - 6);
            // Should gain 12 energy
            expect(mockGame.timeManager.gainEnergy).toHaveBeenCalledWith(12);
            // Should show success toast
            expect(mockGame.showToast).toHaveBeenCalledWith('Tasty bagel! +12 Energy', 'success');
            // Should play sound
            expect(mockGame.audioManager.play).toHaveBeenCalledWith('kaching');
        });

        it('should reject eat_bagel action if insufficient funds', () => {
            // eat_bagel costs 5, so this should trigger the error
            mockGame.gameState.money = 2;

            handleLocationAction(mockGame, 'eat_bagel');

            // Should show error
            expect(mockGame.showError).toHaveBeenCalledWith('Not enough money!');
            // Should not gain energy
            expect(mockGame.timeManager.gainEnergy).not.toHaveBeenCalled();
            // Money should not change
            expect(mockGame.gameState.money).toBe(2);
        });

        it('should reject action if insufficient funds for coffee_network would cost money', () => {
            // Note: coffee_network costs 0, so this shouldn't trigger the error
            mockGame.gameState.money = 0;

            handleLocationAction(mockGame, 'coffee_network');

            // Should still work because cost is 0
            expect(mockGame.timeManager.gainEnergy).toHaveBeenCalledWith(10);
            expect(mockGame.showError).not.toHaveBeenCalled();
        });

        it('should reject action if insufficient funds for a paid action', () => {
            mockGame.gameState.money = 2; // Less than cost of buy_bagel (6)

            handleLocationAction(mockGame, 'buy_bagel');

            // Should show error
            expect(mockGame.showError).toHaveBeenCalledWith('Not enough money!');
            // Should not gain energy
            expect(mockGame.timeManager.gainEnergy).not.toHaveBeenCalled();
            // Money should not change
            expect(mockGame.gameState.money).toBe(2);
        });
    });
});
