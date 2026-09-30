/**
 * DevMenu Unit Tests
 * Verifies dev menu functionality including the ending screen preview button
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DevMenu } from '../../src/js/dev/DevMenu.js';

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
        it('should trigger ending with correct parameters', () => {
            devMenu.testEndingScreen();

            expect(mockGameEndingSystem.triggerEnding).toHaveBeenCalledWith({
                type: 'debug_preview',
                title: 'Debug: Ending Preview',
                message: 'This is a dev-menu preview.',
                showEnding: true
            });
        });

        it('should show success toast when ending screen is triggered', () => {
            devMenu.testEndingScreen();

            expect(mockGame.showToast).toHaveBeenCalledWith('Ending screen triggered', 'success');
        });

        it('should show error when GameEndingSystem is not available', () => {
            devMenu.game.gameState.gameEndingSystem = null;
            devMenu.testEndingScreen();

            expect(mockGame.showError).toHaveBeenCalledWith('GameEndingSystem not available');
        });

        it('should handle errors gracefully', () => {
            mockGameEndingSystem.triggerEnding.mockImplementation(() => {
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

        it('should trigger ending screen when button is clicked', () => {
            devMenu.populateTesting();

            const buttons = document.querySelectorAll('#dev-testing .dev-btn');
            const endingButton = Array.from(buttons).find(btn =>
                btn.textContent.includes('Test Ending Screen')
            );

            if (endingButton) {
                endingButton.click();

                expect(mockGameEndingSystem.triggerEnding).toHaveBeenCalledWith({
                    type: 'debug_preview',
                    title: 'Debug: Ending Preview',
                    message: 'This is a dev-menu preview.',
                    showEnding: true
                });
            }
        });
    });
});
