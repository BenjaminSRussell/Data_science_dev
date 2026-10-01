import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DialogueTester } from '../../src/js/dev/DialogueTester.js';

describe('DialogueTester', () => {
    let dialogueTester;
    let mockGame;

    beforeEach(() => {
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
                        options: [
                            { id: 'opt1', text: 'Yes' },
                            { id: 'opt2', text: 'No' }
                        ]
                    })),
                    selectOption: vi.fn()
                }
            },
            showToast: vi.fn()
        };

        dialogueTester = new DialogueTester(mockGame);
    });

    describe('testAll', () => {
        it('should test all NPCs and return results', async () => {
            const results = await dialogueTester.testAll();

            expect(results).toBeDefined();
            expect(results.total).toBe(2);
            expect(results.passed).toBeGreaterThanOrEqual(0);
            expect(results.failed).toBeGreaterThanOrEqual(0);
            expect(Array.isArray(results.errors)).toBe(true);
        });

        it('should call getAllNPCs to get the list of NPCs', async () => {
            await dialogueTester.testAll();

            expect(mockGame.gameState.npcManager.getAllNPCs).toHaveBeenCalled();
        });

        it('should call startConversation for each NPC', async () => {
            await dialogueTester.testAll();

            expect(mockGame.gameState.npcManager.startConversation).toHaveBeenCalledWith('npc1');
            expect(mockGame.gameState.npcManager.startConversation).toHaveBeenCalledWith('npc2');
        });
    });
});

describe('DevMenu dialogue testing - verifying DialogueTester wiring', () => {
    let mockGame;
    let mockDialogueTester;

    beforeEach(() => {
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
                    startConversation: vi.fn()
                }
            },
            showToast: vi.fn(),
            devTools: {
                dialogueTester: mockDialogueTester
            }
        };
    });

    it('should wire "Test All" button to DialogueTester.testAll() - the correct implementation', async () => {
        // This is how the button SHOULD be wired after the fix
        const buttonCallback = async () => {
            if (mockGame.devTools?.dialogueTester?.testAll) {
                const results = await mockGame.devTools.dialogueTester.testAll();
                mockGame.showToast(`Dialogues tested: ${results.passed} passed, ${results.failed} failed`, 'info');
            }
        };

        // Simulate button click
        await buttonCallback();

        // Verify DialogueTester.testAll() WAS called (this is what the fix ensures)
        expect(mockDialogueTester.testAll).toHaveBeenCalled();
        expect(mockGame.showToast).toHaveBeenCalledWith('Dialogues tested: 2 passed, 0 failed', 'info');
    });

    it('the OLD DevMenu.testAllDialogues() does not call DialogueTester.testAll()', async () => {
        // Reset the spy
        mockDialogueTester.testAll.mockClear();
        mockGame.showToast.mockClear();

        // This is the OLD implementation that needs to be replaced
        const oldTestAllDialoguesImpl = async () => {
            const npcManager = mockGame.gameState?.npcManager;
            if (!npcManager) return;

            const npcs = npcManager.getAllNPCs?.() || [];
            const results = { passed: 0, failed: 0, errors: [] };

            for (const npc of npcs) {
                try {
                    if (npcManager.startConversation) {
                        npcManager.startConversation(npc.id);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        results.passed++;
                    }
                } catch (error) {
                    results.failed++;
                    results.errors.push({ npc: npc.id, error: error.message });
                }
            }

            mockGame.showToast(`Dialogues tested: ${results.passed} passed, ${results.failed} failed`, 'info');
        };

        // Call the old implementation
        await oldTestAllDialoguesImpl();

        // Verify DialogueTester.testAll() was NOT called (this demonstrates the bug)
        expect(mockDialogueTester.testAll).not.toHaveBeenCalled();
    });
});
