/**
 * DevMenu Unit Tests
 * Verifies dev menu functionality including the ending screen preview button
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DevMenu } from '../../src/js/dev/DevMenu.js';
import { GameState } from '../../src/js/game/GameState.js';
import { GameEndingSystem } from '../../src/js/game/GameEndingSystem.js';

describe('DevMenu', () => {
    let devMenu;
    let mockGame;
    let mockGameEndingSystem;

    beforeEach(() => {
        // Mock the game object
        mockGameEndingSystem = {
            triggerEnding: vi.fn()
        };

        mockGame = {
            gameState: {
                gameEndingSystem: mockGameEndingSystem
            },
            showToast: vi.fn(),
            showError: vi.fn(),
            screenManager: null
        };

        // Mock window location
        Object.defineProperty(window, 'location', {
            value: {
                hostname: 'localhost'
            },
            writable: true
        });

        // Create DevMenu instance
        devMenu = new DevMenu(mockGame);
    });

    describe('testEndingScreen', () => {
        let gameState;
        let endingSystem;

        beforeEach(() => {
            gameState = new GameState();
            endingSystem = new GameEndingSystem(gameState);
            gameState.gameEndingSystem = endingSystem;
            mockGame.gameState = gameState;
            mockGame.showGameEnding = vi.fn();
        });

        it('should show the ending modal with the preview data', () => {
            devMenu.testEndingScreen();

            expect(mockGame.showGameEnding).toHaveBeenCalledWith({
                type: 'debug_preview',
                title: 'Debug: Ending Preview',
                message: 'This is a dev-menu preview.',
                showEnding: true
            });
            expect(mockGame.showToast).toHaveBeenCalledWith('Ending screen preview shown', 'success');
        });

        it('should not mutate persisted ending state', () => {
            devMenu.testEndingScreen();

            expect(endingSystem.endingTriggered).toBe(false);
            expect(gameState.gameEnding).toBeNull();
            expect(endingSystem.toJSON().endingTriggered).toBe(false);
            expect(gameState.toJSON().gameEnding ?? null).toBeNull();
        });

        it('should show error when the ending screen is not available', () => {
            delete mockGame.showGameEnding;
            devMenu.testEndingScreen();

            expect(mockGame.showError).toHaveBeenCalledWith('Ending screen not available');
        });

        it('should handle errors gracefully', () => {
            mockGame.showGameEnding.mockImplementation(() => {
                throw new Error('Test error');
            });

            devMenu.testEndingScreen();

            expect(mockGame.showError).toHaveBeenCalledWith('Error: Test error');
        });
    });

    describe('populateTesting', () => {
        beforeEach(() => {
            // Create a mock container element
            const container = document.createElement('div');
            container.id = 'dev-testing';
            document.body.appendChild(container);
        });

        afterEach(() => {
            const container = document.getElementById('dev-testing');
            if (container) {
                container.remove();
            }
        });

        it('should add Test Ending Screen button to testing section', () => {
            devMenu.populateTesting();

            const buttons = document.querySelectorAll('#dev-testing .dev-btn');
            const endingButton = Array.from(buttons).find(btn =>
                btn.textContent.includes('Test Ending Screen')
            );

            expect(endingButton).toBeTruthy();
        });

        it('should preview the ending screen when button is clicked', () => {
            mockGame.showGameEnding = vi.fn();
            devMenu.populateTesting();

            const buttons = document.querySelectorAll('#dev-testing .dev-btn');
            const endingButton = Array.from(buttons).find(btn =>
                btn.textContent.includes('Test Ending Screen')
            );

            expect(endingButton).toBeDefined();
            if (endingButton) {
                endingButton.click();

                expect(mockGameEndingSystem.triggerEnding).not.toHaveBeenCalled();
                expect(mockGame.showGameEnding).toHaveBeenCalledWith({
                    type: 'debug_preview',
                    title: 'Debug: Ending Preview',
                    message: 'This is a dev-menu preview.',
                    showEnding: true
                });
            }
        });
    });
});
