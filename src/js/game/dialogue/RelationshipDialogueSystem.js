class RelationshipDialogueSystem {
    constructor() {
        this.npcDialogueLoader = NPCDialogueLoader.getInstance();
    }

    async getDialogue(npcId, relationshipLevel, topic = null) {
        const dialogue = await this.npcDialogueLoader.loadNPCDialogue(npcId);
        if (!dialogue) return null;

        const stage = this.getRelationshipStage(relationshipLevel);
        const stageDialogue = dialogue.stages[stage];
        if (!stageDialogue) return null;

        const ageAppropriate = dialogue.ageAppropriate?.[stage];
        if (topic && stageDialogue.topics?.[topic]) {
            const topicDialogue = stageDialogue.topics[topic];
            return Array.isArray(topicDialogue) 
                ? topicDialogue[Math.floor(Math.random() * topicDialogue.length)]
                : topicDialogue;
        }

        const greetings = ageAppropriate?.greeting || stageDialogue.greeting || ["Hello."];
        return Array.isArray(greetings)
            ? greetings[Math.floor(Math.random() * greetings.length)]
            : greetings;
    }

    getRelationshipStage(relationshipLevel) {
        if (relationshipLevel >= 80) return 'close_friend';
        if (relationshipLevel >= 60) return 'friend';
        if (relationshipLevel >= 40) return 'acquaintance';
        if (relationshipLevel >= 20) return 'friendly';
        return 'stranger';
    }

    async getActionResponse(npcId, action) {
        const dialogue = await this.npcDialogueLoader.loadNPCDialogue(npcId);
        if (!dialogue) return null;
        
        return dialogue.actions?.[action] || null;
    }

    async getBreakdownDialogue(npcId, breakdownType) {
        const dialogue = await this.npcDialogueLoader.loadNPCDialogue(npcId);
        if (!dialogue) return null;
        
        const breakdown = dialogue.breakdowns?.[breakdownType];
        if (!breakdown) return null;
        
        const dialogues = breakdown.dialogue;
        return Array.isArray(dialogues)
            ? dialogues[Math.floor(Math.random() * dialogues.length)]
            : dialogues;
    }

    async getEmotionalResponse(npcId, trigger) {
        const dialogue = await this.npcDialogueLoader.loadNPCDialogue(npcId);
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

    checkTriggerCondition(condition, trigger) {
        return (
            (condition.playerSuccess && trigger.playerSuccess) ||
            (condition.betrayal && trigger.betrayal) ||
            (condition.rejection && trigger.rejection)
        );
    }

    async getAvailableTopics(npcId, relationshipLevel) {
        const dialogue = await this.npcDialogueLoader.loadNPCDialogue(npcId);
        if (!dialogue) return [];
        
        const stage = this.getRelationshipStage(relationshipLevel);
        const stageDialogue = dialogue.stages[stage];
        
        if (!stageDialogue || !stageDialogue.topics) return [];
        
        return Object.keys(stageDialogue.topics);
    }
}