import { assert } from 'chai';

class DialogueTester {
    constructor(game) {
        this.game = game;
    }

    async testNPCDialogue(npcId, npcManager) {
        try {
            await npcManager.startConversation(npcId);
            await this.wait(200);

            const npcDialogue = this.game.gameState.npcDialogue;
            if (!npcDialogue) {
                return { success: false, error: 'NPC dialogue not found' };
            }

            const { valid, issues } = this.validateDialogueLogic(npcDialogue);
            if (!valid) {
                return { success: false, issues };
            }

            if (!npcDialogue.options) {
                return { success: true };
            }

            for (const option of npcDialogue.options) {
                if (!option.id) {
                    return { success: false, error: `Option missing ID: ${option}` };
                }
                try {
                    npcManager.selectOption(option.id);
                    await this.wait(200);
                } catch (error) {
                    return { success: false, error: `Error selecting option ${option.id}: ${error.message}` };
                }
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    validateDialogueLogic(dialogue) {
        const issues = [];

        if (!dialogue.text && !dialogue.message) {
            issues.push('Dialogue missing text/message');
        }

        if (dialogue.options) {
            dialogue.options.forEach((option, index) => {
                if (!option.id) {
                    issues.push(`Option ${index} missing ID`);
                }
                if (!option.text && !option.label) {
                    issues.push(`Option ${index} missing text/label`);
                }
            });
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    async testAll() {
        const npcManager = this.game.gameState.npcManager;
        const npcs = npcManager.npcs || [];
        const results = {
            passed: 0,
            failed: 0,
            dialogueCount: 0,
            optionCount: 0
        };

        for (const npc of npcs) {
            const npcId = npc.npcId;
            const result = await this.testNPCDialogue(npcId, npcManager);
            if (result.success) {
                results.passed++;
            } else {
                results.failed++;
                console.error(`Test failed for NPC ${npcId}: ${result.error}`);
            }

            const dialogue = this.game.gameState.npcDialogue;
            if (dialogue) {
                results.dialogueCount++;
                results.optionCount += dialogue.options ? dialogue.options.length : 0;
            }
        }

        return results;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default DialogueTester;