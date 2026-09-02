class RelationshipDialogueSystem {
    constructor() {
        this.npcDialogueData = {
            // This is a placeholder for the actual NPC dialogue data
            // It should be loaded from the individual NPC dialogue files
            // For example, alex_rivera.js, emma_bloom.js, etc.
        };
    }

    checkTriggerCondition(condition, trigger) {
        if (condition.playerSuccess && trigger.playerSuccess) return true;
        if (condition.betrayal && trigger.betrayal) return true;
        if (condition.rejection && trigger.rejection) return true;
        if (condition.mentionPast && trigger.mentionPast) return true;
        if (condition.judgment && trigger.judgment) return true;
        if (condition.playerSupports && trigger.playerSupports) return true;
        if (condition.playerInterrupts && trigger.playerInterrupts) return true;
        if (condition.playerListens && trigger.playerListens) return true;
        if (condition.mentionKids && trigger.mentionKids) return true;
        return false;
    }

    getEmotionalTrigger(npcId, trigger) {
        const npcData = this.npcDialogueData[npcId];
        if (!npcData || !npcData.emotionalTriggers) return null;

        for (const triggerEntry of npcData.emotionalTriggers) {
            if (this.checkTriggerCondition(triggerEntry.condition, trigger)) {
                return triggerEntry;
            }
        }

        return null;
    }

    // Other methods and logic for the dialogue system
}

export default RelationshipDialogueSystem;