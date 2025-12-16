/**
 * RelationshipEmotionSystem.js
 * Deep emotional relationship system that reacts to all player actions
 */

export class RelationshipEmotionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.relationshipHistory = {};
        this.emotionalStates = {};
        this.breakupThresholds = {
            ethics: -30,
            neglect: -40,
            money: -50,
            betrayal: -60
        };
    }

    /**
     * Update relationship based on action
     */
    updateRelationship(npcId, action, context = {}) {
        const npc = this.gameState.npcManager?.getNPC(npcId);
        if (!npc) return;

        const currentRel = this.gameState.npcManager?.getRelationship(npcId) || 0;
        const ethics = this.gameState.characterStats?.getStat('ethics') || 0;
        const relationship = this.getRelationshipState(npcId);

        // Track emotional state
        this.updateEmotionalState(npcId, action, context);

        // Calculate relationship change
        let change = this.calculateRelationshipChange(action, npc, ethics, currentRel, context);

        // Apply change
        if (this.gameState.npcManager) {
            this.gameState.npcManager.modifyRelationship(npcId, change);
        }

        // Check for relationship events (breakup, etc.)
        this.checkRelationshipEvents(npcId, npc, ethics);

        return {
            change,
            newRelationship: this.gameState.npcManager?.getRelationship(npcId) || 0,
            emotionalState: this.emotionalStates[npcId]
        };
    }

    /**
     * Calculate relationship change based on action
     */
    calculateRelationshipChange(action, npc, ethics, currentRel, context) {
        let change = 0;

        // Ethics-based actions
        if (action === 'unethical_choice') {
            if (npc.type === 'romance' && npc.romanceOptions?.minEthics > ethics) {
                change = -15; // Romantic partner leaves if ethics drop
            } else if (npc.personality === 'professional') {
                change = -10;
            } else {
                change = -5;
            }
        }

        // Neglect (not talking to NPCs)
        if (action === 'neglect') {
            const daysSinceLastTalk = context.daysSinceLastTalk || 0;
            if (daysSinceLastTalk > 7 && npc.type === 'romance') {
                change = -5 * (daysSinceLastTalk - 7); // Accelerating penalty
            } else if (daysSinceLastTalk > 14) {
                change = -2;
            }
        }

        // Betrayal
        if (action === 'betrayal') {
            if (currentRel > 60) {
                change = -30; // High relationship = bigger betrayal
            } else {
                change = -15;
            }
        }

        // Positive actions
        if (action === 'gift') {
            change = context.liked ? 10 : 3;
        }
        if (action === 'help') {
            change = 8;
        }
        if (action === 'support') {
            change = 12;
        }

        // Money issues (for romantic partners)
        if (action === 'financial_stress' && npc.type === 'romance') {
            const debt = context.debt || 0;
            if (debt > 5000) {
                change = -5; // Financial stress affects relationship
            }
        }

        return change;
    }

    /**
     * Update emotional state
     */
    updateEmotionalState(npcId, action, context) {
        if (!this.emotionalStates[npcId]) {
            this.emotionalStates[npcId] = {
                trust: 50,
                affection: 50,
                respect: 50,
                anger: 0,
                fear: 0
            };
        }

        const state = this.emotionalStates[npcId];

        // Update based on action
        if (action === 'betrayal') {
            state.trust -= 20;
            state.anger += 15;
        }
        if (action === 'unethical_choice') {
            state.respect -= 10;
            state.trust -= 5;
        }
        if (action === 'gift' && context.liked) {
            state.affection += 5;
        }
        if (action === 'neglect') {
            state.affection -= 2;
            state.anger += 1;
        }

        // Clamp values
        Object.keys(state).forEach(key => {
            state[key] = Math.max(0, Math.min(100, state[key]));
        });
    }

    /**
     * Get relationship state
     */
    getRelationshipState(npcId) {
        return this.emotionalStates[npcId] || {
            trust: 50,
            affection: 50,
            respect: 50,
            anger: 0,
            fear: 0
        };
    }

    /**
     * Check for relationship events (breakups, etc.)
     */
    checkRelationshipEvents(npcId, npc, ethics) {
        if (npc.type !== 'romance') return;

        const relationship = this.gameState.npcManager?.getRelationship(npcId) || 0;
        const state = this.getRelationshipState(npcId);
        const romanceSystem = this.gameState.romanceSystem;

        // Check if player has a romantic partner
        if (romanceSystem?.partnerId !== npcId) return;

        // Ethics-based breakup
        if (ethics < this.breakupThresholds.ethics && npc.romanceOptions?.minEthics) {
            if (ethics < npc.romanceOptions.minEthics) {
                this.triggerBreakup(npcId, 'ethics');
                return;
            }
        }

        // Neglect-based breakup
        if (state.affection < 20 && relationship < 30) {
            this.triggerBreakup(npcId, 'neglect');
            return;
        }

        // Trust-based breakup
        if (state.trust < 15) {
            this.triggerBreakup(npcId, 'betrayal');
            return;
        }

        // Financial stress breakup
        if (this.gameState.money < -5000 && relationship < 40) {
            this.triggerBreakup(npcId, 'money');
            return;
        }
    }

    /**
     * Trigger breakup
     */
    triggerBreakup(npcId, reason) {
        const npc = this.gameState.npcManager?.getNPC(npcId);
        const romanceSystem = this.gameState.romanceSystem;
        const relationship = this.gameState.npcManager?.getRelationship(npcId) || 0;

        if (romanceSystem?.partnerId === npcId) {
            // Breakup happens
            romanceSystem.partnerId = null;
            romanceSystem.relationshipStatus = 'single';
            romanceSystem.relationshipScore = 0;

            // Generate breakup dialogue - use the already-initialized dialogue system from gameState
            const dialogueSystem = this.gameState.realisticDialogueSystem || { generateBreakupDialogue: () => 'It\'s over between us.' };
            const dialogue = dialogueSystem.generateBreakupDialogue(relationship, reason);

            // NPC might turn evil if player is very unethical
            if (reason === 'ethics' && this.gameState.characterStats?.getStat('ethics') < -40) {
                // NPC becomes antagonist
                this.makeNPCAntagonist(npcId);
            }

            return {
                happened: true,
                reason,
                dialogue,
                npc
            };
        }

        return { happened: false };
    }

    /**
     * Make NPC an antagonist (they turn against player)
     */
    makeNPCAntagonist(npcId) {
        const npc = this.gameState.npcManager?.getNPC(npcId);
        if (!npc) return;

        // Mark as antagonist
        npc.isAntagonist = true;
        npc.originalPersonality = npc.personality;
        npc.personality = 'hostile';

        // Drop relationship significantly
        if (this.gameState.npcManager) {
            this.gameState.npcManager.modifyRelationship(npcId, -50);
        }

        // Update emotional state
        this.emotionalStates[npcId] = {
            trust: 0,
            affection: 0,
            respect: 0,
            anger: 100,
            fear: 0
        };
    }

    /**
     * Process daily relationship updates (neglect, etc.)
     */
    processDailyUpdates() {
        const metNPCs = this.gameState.npcManager?.getMetNPCs() || [];
        const currentDay = this.gameState.timeManager?.totalDays || 0;

        metNPCs.forEach(npc => {
            const lastInteraction = this.relationshipHistory[npc.id]?.lastInteraction || 0;
            const daysSince = currentDay - lastInteraction;

            if (daysSince > 7 && npc.type === 'romance') {
                // Romantic partners need attention
                this.updateRelationship(npc.id, 'neglect', { daysSinceLastTalk: daysSince });
            } else if (daysSince > 30) {
                // All relationships decay if neglected
                this.updateRelationship(npc.id, 'neglect', { daysSinceLastTalk: daysSince });
            }
        });
    }
}

