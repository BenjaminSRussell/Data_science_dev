/**
 * Unit tests for GameEndingModal.createGameEndingModal()
 *
 * Tests the real showGameEnding implementation extracted to GameEndingModal.js.
 * This tests the actual production code (not a copy), so future regressions
 * to the real method will be caught.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createGameEndingModal } from '../../src/js/ui/GameEndingModal.js';

describe('MainGame.showGameEnding() via GameEndingModal.createGameEndingModal()', () => {
    let mockGameEndingSystem;
    let mockContext;

    beforeEach(() => {
        // Clear DOM
        document.body.innerHTML = '';

        // Create minimal mock for gameState.gameEndingSystem
        mockGameEndingSystem = {
            getEndingStats: vi.fn(() => ({
                rankTitle: 'Senior Developer',
                days: 365,
                money: 500000,
                reputation: 95,
                tasksCompleted: 150,
                perfectScores: 45,
                contractsCompleted: 30,
                projectsCompleted: 20
            }))
        };

        // Create a mock context object that simulates the MainGame instance
        mockContext = {
            gameState: {
                gameEndingSystem: mockGameEndingSystem
            },
            startNewGame: vi.fn(),
            audioManager: { play: vi.fn() }
        };
    });

    afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    describe('basic functionality', () => {
        it('should append modal to document.body with id "game-ending-modal"', () => {
            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            expect(modal).not.toBeNull();
            expect(modal.parentElement).toBe(document.body);
        });

        it('should return early when called with null', () => {
            createGameEndingModal(null, mockContext);
            expect(document.getElementById('game-ending-modal')).toBeNull();
        });

        it('should return early when called with undefined', () => {
            createGameEndingModal(undefined, mockContext);
            expect(document.getElementById('game-ending-modal')).toBeNull();
        });
    });

    describe('title and message fallbacks', () => {
        it('should use "Victory!" as fallback when title is falsy', () => {
            const endingData = {
                title: null,
                message: 'You completed the game!'
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            expect(modal.innerHTML).toContain('Victory!');
        });

        it('should use "Congratulations on completing your journey!" as fallback when message is falsy', () => {
            const endingData = {
                title: 'You Won!',
                message: null
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            expect(modal.innerHTML).toContain('Congratulations on completing your journey!');
        });

        it('should use both fallbacks when both title and message are falsy', () => {
            const endingData = {
                title: '',
                message: ''
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            expect(modal.innerHTML).toContain('Victory!');
            expect(modal.innerHTML).toContain('Congratulations on completing your journey!');
        });

        it('should use provided title and message when both are truthy', () => {
            const endingData = {
                title: 'Custom Title',
                message: 'Custom Message'
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            expect(modal.innerHTML).toContain('Custom Title');
            expect(modal.innerHTML).toContain('Custom Message');
        });
    });

    describe('stats grid fallbacks', () => {
        it('should display stats from gameEndingSystem.getEndingStats() when available', () => {
            mockGameEndingSystem.getEndingStats.mockReturnValue({
                rankTitle: 'Senior Developer',
                days: 365,
                money: 500000,
                reputation: 95,
                tasksCompleted: 150,
                perfectScores: 45,
                contractsCompleted: 30,
                projectsCompleted: 20
            });

            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            expect(modal.innerHTML).toContain('Senior Developer');
            expect(modal.innerHTML).toContain('365');
            // The money gets formatted with commas via toLocaleString()
            expect(modal.innerHTML).toContain('500,000');
            expect(modal.innerHTML).toContain('95');
        });

        it('should fall back to 0 for missing numeric stats', () => {
            mockGameEndingSystem.getEndingStats.mockReturnValue({
                rankTitle: 'Developer'
                // Missing days, money, reputation, etc.
            });

            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            // Should contain 0 for missing numeric fields
            expect(modal.innerHTML).toContain('0');
        });

        it('should fall back to "Unknown" for missing rankTitle when gameEndingSystem is undefined', () => {
            mockContext.gameState.gameEndingSystem = undefined;

            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            // Should contain Unknown for missing rankTitle
            expect(modal.innerHTML).toContain('Unknown');
        });

        it('should use empty object stats when gameEndingSystem is undefined', () => {
            mockContext.gameState.gameEndingSystem = undefined;

            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            // All numeric stats should default to 0
            const contentArray = modal.innerHTML.split('Days Played</strong>: ');
            if (contentArray.length > 1) {
                expect(contentArray[1]).toContain('0');
            }
        });
    });

    describe('button interactions', () => {
        it('should call startNewGame() and remove modal when "New Game" button is clicked and confirm is accepted', () => {
            vi.spyOn(window, 'confirm').mockReturnValue(true);

            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            const newGameButton = document.getElementById('btn-ending-new-game');
            expect(newGameButton).not.toBeNull();

            newGameButton.click();

            expect(window.confirm).toHaveBeenCalledWith('Start a new game? Your current progress will be lost.');
            expect(mockContext.startNewGame).toHaveBeenCalled();
            expect(document.getElementById('game-ending-modal')).toBeNull();
        });

        it('should leave modal in DOM when "New Game" confirm is declined', () => {
            vi.spyOn(window, 'confirm').mockReturnValue(false);

            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            const newGameButton = document.getElementById('btn-ending-new-game');
            newGameButton.click();

            expect(window.confirm).toHaveBeenCalled();
            expect(mockContext.startNewGame).not.toHaveBeenCalled();
            expect(document.getElementById('game-ending-modal')).not.toBeNull();
        });

        it('should remove modal without calling startNewGame when "Continue Playing" button is clicked', () => {
            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            const continueButton = document.getElementById('btn-ending-continue');
            expect(continueButton).not.toBeNull();

            continueButton.click();

            expect(mockContext.startNewGame).not.toHaveBeenCalled();
            expect(document.getElementById('game-ending-modal')).toBeNull();
        });
    });

    describe('audio playback', () => {
        it('should play kaching sound if audioManager is available', () => {
            mockContext.audioManager = { play: vi.fn() };

            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            expect(mockContext.audioManager.play).toHaveBeenCalledWith('kaching');
        });

        it('should handle missing audioManager gracefully', () => {
            mockContext.audioManager = undefined;

            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            expect(() => {
                createGameEndingModal(endingData, mockContext);
            }).not.toThrow();

            expect(document.getElementById('game-ending-modal')).not.toBeNull();
        });
    });

    describe('modal styling', () => {
        it('should create modal with correct CSS styling attributes', () => {
            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            expect(modal.style.position).toBe('fixed');
            expect(modal.style.width).toBe('100%');
            expect(modal.style.height).toBe('100%');
            expect(modal.style.zIndex).toBe('10000');
            expect(modal.style.display).toBe('flex');
        });

        it('should apply "modal active" className', () => {
            const endingData = {
                title: 'Victory!',
                message: 'You won!'
            };

            createGameEndingModal(endingData, mockContext);

            const modal = document.getElementById('game-ending-modal');
            expect(modal.className).toContain('modal');
            expect(modal.className).toContain('active');
        });
    });
});
