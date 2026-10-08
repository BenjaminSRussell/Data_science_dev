/**
 * RelationshipDialogueSystem.js
 * Manages age-appropriate, relationship-stage dialogue
 * Loads individual NPC dialogue files
 * Minimal dialogue - story tells itself
 */

import { npcDialogueLoader } from './NPCDialogueLoader.js';

export class RelationshipDialogueSystem {
    constructor(gameState) {
        this.gameState = gameState;
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
        
        // Get age-appropriate dialogue
        const npc = this.gameState.npcManager?.getNPC(npcId);
        const ageAppropriate = npcDialogueLoader.getAgeAppropriateDialogue(
            npcId,
            npc?.age || 30,
            relationshipLevel
        );
        
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
        if (relationshipLevel >= 80) return 'close_friend';
        if (relationshipLevel >= 60) return 'friend';
        if (relationshipLevel >= 40) return 'acquaintance';
        if (relationshipLevel >= 20) return 'friendly';
        return 'stranger';
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
        // Simple condition checking
        // Can be expanded for complex conditions
        if (!condition || !trigger) return false;
        if (condition.playerSuccess && trigger.playerSuccess) return true;
        if (condition.betrayal && trigger.betrayal) return true;
        if (condition.rejection && trigger.rejection) return true;
        return false;
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

