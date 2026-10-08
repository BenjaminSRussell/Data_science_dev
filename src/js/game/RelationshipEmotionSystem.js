/**
 * RelationshipEmotionSystem.js
 * Deep emotional relationship system that reacts to all player actions
 */

import { pickState, applyState } from '../utils/StateSerializer.js';

const DEFAULT_EMOTIONS = { trust: 50, affection: 50, respect: 50, anger: 0, fear: 0 };

/** Max relationship lost to neglect in one day (#1548) */
const MAX_NEGLECT_PENALTY = 10;

export class RelationshipEmotionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.relationshipHistory = {};
        this.emotionalStates = {};
        // Every breakup rule reads its limit from here (#1847, #2054, #1849)
        this.breakupThresholds = {
            ethics: -30,              // fallback when the NPC has no minEthics
            neglectAffection: 20,     // affection below this...
            neglectRelationship: 30,  // ...and relationship below this
            betrayalTrust: 15,        // trust below this
            moneyDebt: -5000,         // cash below this...
            moneyRelationship: 40     // ...and relationship below this
        };
    }

    getToday() {
        return this.gameState.timeManager?.totalDays || 0;
    }

    /**
     * Remember that the player spent time with an NPC (talk, gift, date) so
     * neglect is measured from the last real interaction (#1548)
     */
    recordInteraction(npcId) {
        if (!npcId) return;
        const entry = this.relationshipHistory[npcId] || (this.relationshipHistory[npcId] = {});
        entry.lastInteraction = this.getToday();
    }

    /**
     * Update relationship based on action
     */
    updateRelationship(npcId, action, context = {}) {
        const npc = this.gameState.npcManager?.getNPC(npcId);
        if (!npc) return;

        const currentRel = this.gameState.npcManager?.getRelationship(npcId) || 0;
        const ethics = this.gameState.characterStats?.ethics || 0;

        // Track emotional state
        this.updateEmotionalState(npcId, action, context);

        // Calculate relationship change, coloured by how the NPC feels (#111, #1551, #1549)
        const base = this.calculateRelationshipChange(action, npc, ethics, currentRel, context);
        const change = this.applyEmotionalModifier(base, this.getRelationshipState(npcId));

        // Apply change
        if (change !== 0 && this.gameState.npcManager) {
            this.gameState.npcManager?.modifyRelationship(npcId, change);
        }

        // Check for relationship events (breakup, etc.)
        const event = this.checkRelationshipEvents(npcId, npc, ethics);

        return {
            change,
            newRelationship: this.gameState.npcManager?.getRelationship(npcId) || 0,
            emotionalState: this.emotionalStates[npcId],
            breakup: event?.happened ? event : null
        };
    }

    /**
     * Trust makes kindness land harder and fear blunts it; anger makes every
     * slight hurt more.
     */
    applyEmotionalModifier(change, state) {
        if (!change) return 0;
        if (change > 0) {
            const factor = (0.5 + state.trust / 100) * (1 - state.fear / 200);
            return Math.round(change * factor * 10) / 10;
        }
        return Math.round(change * (1 + state.anger / 100) * 10) / 10;
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

        // Neglect (not talking to NPCs); capped so one day can't wipe a relationship (#1548)
        if (action === 'neglect') {
            const daysSinceLastTalk = context.daysSinceLastTalk || 0;
            if (daysSinceLastTalk > 7 && npc.type === 'romance') {
                change = -Math.min(MAX_NEGLECT_PENALTY, 5 * (daysSinceLastTalk - 7)); // Accelerating penalty
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
    updateEmotionalState(npcId, action, context = {}) {
        if (!this.emotionalStates[npcId]) {
            this.emotionalStates[npcId] = { ...DEFAULT_EMOTIONS };
        }

        const state = this.emotionalStates[npcId];

        // Update based on action
        if (action === 'betrayal') {
            state.trust -= 20;
            state.anger += 15;
            state.fear += 5;
        }
        if (action === 'unethical_choice') {
            state.respect -= 10;
            state.trust -= 5;
            state.fear += 3;
        }
        if (action === 'gift' && context.liked) {
            state.affection += 5;
        }
        if (action === 'help' || action === 'support') {
            state.trust += 3;
            state.anger -= 5;
            state.fear -= 3;
        }
        if (action === 'neglect') {
            // Longer absences sting more, so affection can reach the
            // neglect-breakup limit on a similar timescale to relationship (#1849)
            const days = Number(context.daysSinceLastTalk) || 0;
            state.affection -= Math.min(10, Math.max(2, days - 7));
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
        return this.emotionalStates[npcId] || { ...DEFAULT_EMOTIONS };
    }

    /**
     * Check for relationship events (breakups, etc.)
     */
    checkRelationshipEvents(npcId, npc, ethics) {
        if (npc.type !== 'romance') return null;

        const relationship = this.gameState.npcManager?.getRelationship(npcId) || 0;
        const state = this.getRelationshipState(npcId);
        const romanceSystem = this.gameState.romanceSystem;
        const t = this.breakupThresholds;

        // Check if player has a romantic partner
        if (romanceSystem?.partnerId !== npcId) return null;

        // Ethics-based breakup: the NPC's own minEthics decides, not a
        // global cutoff layered on top of it (#1547)
        const minEthics = typeof npc.romanceOptions?.minEthics === 'number' ? npc.romanceOptions.minEthics : t.ethics;
        if (ethics < minEthics) {
            return this.triggerBreakup(npcId, 'ethics');
        }

        // Neglect-based breakup
        if (state.affection < t.neglectAffection && relationship < t.neglectRelationship) {
            return this.triggerBreakup(npcId, 'neglect');
        }

        // Trust-based breakup
        if (state.trust < t.betrayalTrust) {
            return this.triggerBreakup(npcId, 'betrayal');
        }

        // Financial stress breakup
        if ((Number(this.gameState.money) || 0) < t.moneyDebt && relationship < t.moneyRelationship) {
            return this.triggerBreakup(npcId, 'money');
        }
        return null;
    }

    /**
     * Trigger breakup
     */
    triggerBreakup(npcId, reason) {
        const npc = this.gameState.npcManager?.getNPC(npcId);
        const romanceSystem = this.gameState.romanceSystem;
        const relationship = this.gameState.npcManager?.getRelationship(npcId) || 0;

        if (romanceSystem?.partnerId === npcId) {
            // RomanceSystem owns the breakup (divorce costs, house, family) (#2053, #1077)
            const ended = typeof romanceSystem.breakUp === 'function'
                ? romanceSystem.breakUp(reason)
                : (() => {
                    const wasStatus = romanceSystem.relationshipStatus;
                    romanceSystem.partnerId = null;
                    romanceSystem.relationshipStatus = 'single';
                    romanceSystem.relationshipScore = 0;
                    return { previousStatus: wasStatus };
                })();

            // Generate breakup dialogue - use the already-initialized dialogue system from gameState
            const dialogueSystem = this.gameState.realisticDialogueSystem || { generateBreakupDialogue: () => 'It\'s over between us.' };
            const dialogue = dialogueSystem.generateBreakupDialogue(relationship, reason);

            // NPC might turn evil if player is very unethical
            if (reason === 'ethics' && this.gameState.characterStats?.ethics < -40) {
                // NPC becomes antagonist
                this.makeNPCAntagonist(npcId);
            } else {
                // Otherwise the history resets: no lingering romance-level
                // relationship or feelings (#1553)
                this.emotionalStates[npcId] = { trust: 30, affection: 10, respect: 40, anger: 20, fear: 0 };
                if (relationship > 20) this.gameState.npcManager?.setRelationship?.(npcId, 20);
                this.relationshipHistory[npcId] = { lastInteraction: this.getToday(), brokeUp: this.getToday(), reason };
            }

            return {
                happened: true,
                reason,
                dialogue,
                npc,
                ...ended
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
            this.gameState.npcManager?.modifyRelationship(npcId, -50);
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
     * Process daily relationship updates (neglect, etc.). Called on new_day (#1076)
     * @returns {Array} breakups that happened today
     */
    processDailyUpdates() {
        const metNPCs = this.gameState.npcManager?.getMetNPCs() || [];
        const currentDay = this.getToday();
        const breakups = [];

        metNPCs?.forEach(npc => {
            if (!npc?.id) return;
            // First time we see an NPC, start their clock today instead of
            // treating them as neglected since day zero (#1548)
            if (this.relationshipHistory[npc.id]?.lastInteraction === undefined) {
                this.recordInteraction(npc.id);
                return;
            }
            const daysSince = currentDay - this.relationshipHistory[npc.id].lastInteraction;

            let result = null;
            if (daysSince > 7 && npc.type === 'romance') {
                // Romantic partners need attention
                result = this.updateRelationship(npc.id, 'neglect', { daysSinceLastTalk: daysSince });
            } else if (daysSince > 30) {
                // All relationships decay if neglected
                result = this.updateRelationship(npc.id, 'neglect', { daysSinceLastTalk: daysSince });
            }
            if (result?.breakup) breakups.push(result.breakup);
        });
        return breakups;
    }

    /**
     * Serialize player-visible state for saving
     */
    toJSON() {
        return pickState(this, ['relationshipHistory', 'emotionalStates']);
    }

    /**
     * Restore state from a save (missing fields keep constructor defaults)
     */
    fromJSON(data) {
        if (!data) return;
        applyState(this, data, ['relationshipHistory', 'emotionalStates']);
    }
}
