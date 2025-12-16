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
        this.dialogueCache = new Map();
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
        const stageDialogue = dialogue.stages[stage];
        
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
            const topicDialogue = stageDialogue.topics[topic];
            return Array.isArray(topicDialogue) 
                ? topicDialogue[Math.floor(Math.random() * topicDialogue.length)]
                : topicDialogue;
        }
        
        // Return greeting
        const greetings = ageAppropriate?.greeting || stageDialogue.greeting || ["Hello."];
        return Array.isArray(greetings)
            ? greetings[Math.floor(Math.random() * greetings.length)]
            : greetings;
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
        const stageDialogue = dialogue.stages[stage];
        
        if (!stageDialogue || !stageDialogue.topics) return [];
        
        return Object.keys(stageDialogue.topics);
    }
}

