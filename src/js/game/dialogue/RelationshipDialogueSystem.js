/**
 * RelationshipDialogueSystem.js
 * Manages age-appropriate, relationship-stage dialogue
 * Loads individual NPC dialogue files
 * Minimal dialogue - story tells itself
 */

import { npcDialogueLoader } from './NPCDialogueLoader.js';
import { relationshipStage } from '../../data/relationshipStages.js';

export const PLAYER_START_AGE = 22;

export class RelationshipDialogueSystem {
    constructor(gameState) {
        this.gameState = gameState;
        // Per-NPC position in the greeting → topics rotation (#2080)
        this.topicCursor = new Map();
    }

    /**
     * The player's age. The player starts as a 22-year-old new graduate and
     * ages with the in-game calendar. NPC dialogue ageGroups describe who
     * the NPC is talking to, so they key off this, not the NPC's own age (#2081, #2185)
     */
    getPlayerAge() {
        const explicit = Number(this.gameState?.playerAge);
        if (Number.isFinite(explicit) && explicit > 0) return explicit;
        const days = Number(this.gameState?.timeManager?.totalDays) || 1;
        return PLAYER_START_AGE + Math.floor(Math.max(0, days - 1) / 365);
    }
    
    /**
     * Get dialogue for NPC at current relationship stage
     */
    async getDialogue(npcId, relationshipLevel, topic = null) {
        // Load NPC dialogue file
        const dialogue = await npcDialogueLoader.loadNPCDialogue(npcId);
        if (!dialogue) return null;
        
        // Get relationship stage
        const stage = this.getRelationshipStage(relationshipLevel);
        // A dialogue file without stages has nothing for this level (#311)
        const stageDialogue = dialogue.stages?.[stage];
        
        if (!stageDialogue) return null;
        
        // Age-appropriate dialogue for the player the NPC is talking to (#2081)
        const ageAppropriate = npcDialogueLoader.getAgeAppropriateDialogue(
            npcId,
            this.getPlayerAge(),
            relationshipLevel
        );

        // 'next' rotates through the greeting and then each authored topic,
        // so topic dialogue is actually heard in conversation (#2080)
        if (topic === 'next') {
            const topics = Object.keys(stageDialogue.topics || {});
            const n = this.topicCursor.get(npcId) || 0;
            this.topicCursor.set(npcId, n + 1);
            const slot = n % (topics.length + 1);
            if (slot > 0) {
                const lines = stageDialogue.topics[topics[slot - 1]];
                const text = Array.isArray(lines) ? lines.filter(Boolean).join(' ') : lines;
                if (text) return text;
            }
        }
        
        // Get topic-specific dialogue or greeting
        if (topic && stageDialogue.topics?.[topic]) {
            const picked = this.pick(stageDialogue.topics[topic]);
            if (picked) return picked;
        }
        
        // Return greeting
        return this.pick(ageAppropriate?.greeting) || this.pick(stageDialogue.greeting) || 'Hello.';
    }

    /**
     * Random element of an array, or the value itself; null for empty
     */
    pick(value) {
        if (Array.isArray(value)) {
            return value.length ? value[Math.floor(Math.random() * value.length)] : null;
        }
        return value || null;
    }
    
    /**
     * Get relationship stage
     */
    getRelationshipStage(relationshipLevel) {
        // Shared scale with NPCManager and RoommateSystem (#916, #566)
        return relationshipStage(relationshipLevel).tier;
    }
    
    /**
     * Get action response
     */
    async getActionResponse(npcId, action) {
        const dialogue = await npcDialogueLoader.loadNPCDialogue(npcId);
        if (!dialogue) return null;
        
        return dialogue.actions?.[action] || null;
    }
    
    /**
     * Get breakdown dialogue
     * Note: Breakdown selection is caller-driven by design.
     * The caller must determine which breakdown to use based on game state.
     * This method returns the dialogue for a given breakdown type.
     */
    async getBreakdownDialogue(npcId, breakdownType) {
        const dialogue = await npcDialogueLoader.loadNPCDialogue(npcId);
        if (!dialogue) return null;

        const breakdown = dialogue.breakdowns?.[breakdownType];
        if (!breakdown) return null;

        const dialogues = breakdown.dialogue;
        return Array.isArray(dialogues)
            ? dialogues[Math.floor(Math.random() * dialogues.length)]
            : dialogues;
    }
    
    /**
     * Get emotional trigger response
     */
    async getEmotionalResponse(npcId, trigger) {
        const dialogue = await npcDialogueLoader.loadNPCDialogue(npcId);
        if (!dialogue) return null;
        
        const triggerData = dialogue.emotionalTriggers?.find(t => 
            this.checkTriggerCondition(t.condition, trigger)
        );
        
        if (!triggerData) return null;
        
        return {
            dialogue: triggerData.dialogue,
            subtext: triggerData.subtext,
            emotion: triggerData.emotion
        };
    }
    
    /**
     * Check trigger condition
     */
    checkTriggerCondition(condition, trigger) {
        // Every key in the condition must hold, whatever its name, so the
        // dialogue files' mentionPast/judgment/playerSupports/playerListens/
        // mentionKids/npcStruggling/... triggers can fire too (#117).
        // Comparison strings like relationship: '>40' are compared numerically.
        if (!condition || !trigger) return false;
        const keys = Object.keys(condition);
        if (!keys.length) return false;
        return keys.every(key => RelationshipDialogueSystem.conditionHolds(condition[key], trigger[key]));
    }

    static conditionHolds(expected, actual) {
        if (typeof expected === 'string') {
            const m = expected.match(/^\s*(>=|<=|>|<|==)\s*(-?\d+(?:\.\d+)?)\s*$/);
            if (m) {
                const value = Number(actual);
                if (!Number.isFinite(value)) return false;
                const limit = Number(m[2]);
                switch (m[1]) {
                    case '>': return value > limit;
                    case '>=': return value >= limit;
                    case '<': return value < limit;
                    case '<=': return value <= limit;
                    default: return value === limit;
                }
            }
        }
        if (expected === true) return Boolean(actual);
        return actual === expected;
    }
    
    /**
     * Get available topics for stage
     */
    async getAvailableTopics(npcId, relationshipLevel) {
        const dialogue = await npcDialogueLoader.loadNPCDialogue(npcId);
        if (!dialogue) return [];
        
        const stage = this.getRelationshipStage(relationshipLevel);
        const stageDialogue = dialogue.stages?.[stage];
        
        if (!stageDialogue || !stageDialogue.topics) return [];
        
        return Object.keys(stageDialogue.topics);
    }
}

