/**
 * Dialogue Testing System
 * Tests all dialogue options and ensures they work correctly
 */

export class DialogueTester {
    constructor(game) {
        this.game = game;
        this.results = [];
        this.stepDelay = 100; // ms between choices; tests set 0
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

            // Start conversation (async; returns the dialogue payload)
            const dialogue = await npcManager.startConversation(npcId);
            if (!dialogue) {
                result.error = 'No dialogue returned';
                return result;
            }

            result.dialogueCount = 1;

            // Test every opening choice. Picking a choice advances the
            // conversation, so restart it before each one; otherwise choice N
            // would be made against whatever turn choice N-1 led to
            if (dialogue.choices && Array.isArray(dialogue.choices)) {
                for (let choiceIndex = 0; choiceIndex < dialogue.choices.length; choiceIndex++) {
                    result.optionCount++;

                    if (npcManager.makeChoice) {
                        try {
                            if (choiceIndex > 0) await npcManager.startConversation(npcId);
                            await npcManager.makeChoice(choiceIndex);
                            await this.wait(this.stepDelay);
                        } catch (optError) {
                            result.error = `Choice ${choiceIndex} failed: ${optError.message}`;
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
            // Start conversation (async; returns the dialogue payload)
            await npcManager.startConversation(npcId);
            await this.wait(this.stepDelay * 2);

            // Drive each turn by choice index into the current choices array
            for (const choiceIndex of optionPath) {
                await npcManager.makeChoice?.(choiceIndex);
                await this.wait(this.stepDelay * 2);
            }

            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    }

    validateDialogueLogic(dialogue) {
        const issues = [];
        if (!dialogue || typeof dialogue !== 'object') {
            return { valid: false, issues: ['Dialogue is null/undefined'] };
        }

        // Check dialogue structure
        if (!dialogue.text && !dialogue.message) {
            issues.push('Dialogue missing text/message');
        }

        // Check choices (real payloads use `choices` with `text`/`action`)
        if (dialogue.choices !== undefined && !Array.isArray(dialogue.choices)) {
            issues.push('Choices is not an array');
        } else if (dialogue.choices) {
            dialogue.choices.forEach((choice, index) => {
                if (!choice.text) {
                    issues.push(`Choice ${index} missing text`);
                }
                if (!choice.action) {
                    issues.push(`Choice ${index} missing action`);
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

