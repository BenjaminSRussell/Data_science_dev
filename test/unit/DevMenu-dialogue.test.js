import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DevMenu } from '../../src/js/dev/DevMenu.js';

describe('DevMenu - Dialogue Testing Button Wiring', () => {
    let devMenu;
    let mockGame;
    let mockDialogueTester;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '';

        mockDialogueTester = {
            testAll: vi.fn(async () => ({
                total: 2,
                passed: 2,
                failed: 0,
                errors: [],
                dialogueCount: 2,
                optionCount: 0
            }))
        };

        mockGame = {
            gameState: {
                npcManager: {
                    getAllNPCs: vi.fn(() => [
                        { id: 'npc1', name: 'NPC 1' },
                        { id: 'npc2', name: 'NPC 2' }
                    ]),
                    startConversation: vi.fn(),
                    getCurrentDialogue: vi.fn(() => ({
                        text: 'Hello',
                        options: []
                    })),
                    selectOption: vi.fn()
                }
            },
            screenManager: null,
            showToast: vi.fn()
        };

        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: { hostname: 'localhost' },
            writable: true
        });

        // Set up window.devTools (this is what the real code does in DevTools.init())
        window.devTools = {
            dialogueTester: mockDialogueTester
        };

        devMenu = new DevMenu(mockGame);
    });

    it('should call DialogueTester.testAll() when Test All button is clicked', async () => {
        // Get the "Test All" button - it should be in the dialogue section
        const dialogueSection = document.getElementById('dev-dialogue');
        expect(dialogueSection).toBeTruthy();

        // Find the Test All button (should be a primary button in the dialogue section)
        const buttons = dialogueSection?.querySelectorAll('button.dev-btn.primary');
        let testAllButton = null;
        for (const btn of buttons) {
            if (btn.textContent === 'Test All') {
                testAllButton = btn;
                break;
            }
        }

        expect(testAllButton).toBeTruthy('Test All button should exist in dialogue section');

        // Click the button
        if (testAllButton) {
            testAllButton.click();
            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 200));

            // Verify DialogueTester.testAll() was called
            expect(mockDialogueTester.testAll).toHaveBeenCalled();
        }
    });

    it('should show toast with results from DialogueTester', async () => {
        // Get the Test All button
        const dialogueSection = document.getElementById('dev-dialogue');
        const buttons = dialogueSection?.querySelectorAll('button.dev-btn.primary');
        let testAllButton = null;
        for (const btn of buttons) {
            if (btn.textContent === 'Test All') {
                testAllButton = btn;
                break;
            }
        }

        if (testAllButton) {
            testAllButton.click();
            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 200));

            // Verify showToast was called with DialogueTester results
            expect(mockGame.showToast).toHaveBeenCalled();
            const calls = mockGame.showToast.mock.calls;
            // Look for a call with dialogue testing results
            const hasDialogueResults = calls.some(call =>
                call[0] && call[0].includes('Dialogues tested') && call[0].includes('2 passed')
            );
            expect(hasDialogueResults).toBe(true);
        }
    });
});
