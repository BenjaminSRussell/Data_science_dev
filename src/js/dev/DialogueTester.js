/**
 * Dialogue Testing System
 * Tests all dialogue options and ensures they work correctly
 */

export class DialogueTester {
    constructor(game) {
        this.game = game;
        this.results = [];
    }

    async testAll() {
        const npcManager = this.game.gameState?.npcManager;
        if (!npcManager) {
            return { error: 'NPC Manager not found' };
        }

        const npcs = npcManager.getAllNPCs?.() || [];
        const results = {
            total: npcs.length,
            passed: 0,
            failed: 0,
            errors: [],
            dialogueCount: 0,
            optionCount: 0
        };

        for (const npc of npcs) {
            try {
                const npcResult = await this.testNPCDialogue(npc.id, npcManager);
                results.passed += npcResult.passed ? 1 : 0;
                results.failed += npcResult.passed ? 0 : 1;
                results.dialogueCount += npcResult.dialogueCount || 0;
                results.optionCount += npcResult.optionCount || 0;
                
                if (!npcResult.passed) {
                    results.errors.push({ npc: npc.id, error: npcResult.error });
                }
            } catch (error) {
                results.failed++;
                results.errors.push({ npc: npc.id, error: error.message });
            }
        }

        this.results = results;
        return results;
    }

    async testNPCDialogue(npcId, npcManager) {
        const result = {
            npcId,
            passed: false,
            dialogueCount: 0,
            optionCount: 0,
            error: null
        };

        try {
            // Start conversation
            if (!npcManager.startConversation) {
                result.error = 'startConversation method not found';
                return result;
            }

            npcManager.startConversation(npcId);
            await this.wait(200);

            // Get current dialogue
            const dialogue = npcManager.getCurrentDialogue?.();
            if (!dialogue) {
                result.error = 'No dialogue returned';
                return result;
            }

            result.dialogueCount = 1;

            // Test dialogue options
            if (dialogue.options && Array.isArray(dialogue.options)) {
                for (const option of dialogue.options) {
                    result.optionCount++;
                    
                    // Test option selection
                    if (npcManager.selectOption && typeof option.id === 'string') {
                        try {
                            npcManager.selectOption(option.id);
                            await this.wait(100);
                        } catch (optError) {
                            result.error = `Option ${option.id} failed: ${optError.message}`;
                            return result;
                        }
                    }
                }
            }

            result.passed = true;
        } catch (error) {
            result.error = error.message;
        }

        return result;
    }

    async testDialogueFlow(npcId, optionPath = []) {
        // Test a specific dialogue path
        const npcManager = this.game.gameState?.npcManager;
        if (!npcManager) return { error: 'NPC Manager not found' };

        try {
            npcManager.startConversation(npcId);
            await this.wait(200);

            for (const optionId of optionPath) {
                npcManager.selectOption?.(optionId);
                await this.wait(200);
            }

            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    }

    validateDialogueLogic(dialogue) {
        const issues = [];

        // Check dialogue structure
        if (!dialogue.text && !dialogue.message) {
            issues.push('Dialogue missing text/message');
        }

        // Check options
        if (dialogue.options) {
            dialogue.options.forEach((option, index) => {
                if (!option.id) {
                    issues.push(`Option ${index} missing ID`);
                }
                if (!option.text && !option.label) {
                    issues.push(`Option ${index} missing text`);
                }
            });
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

