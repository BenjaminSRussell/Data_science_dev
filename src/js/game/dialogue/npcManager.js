/**
 * NPC Manager
 * Manages NPC relationships, dialogue, and interactions
 */

class NPCManager {
    constructor() {
        this.npcs = {};
        this.relationships = {};
    }

    addNPC(npcData) {
        this.npcs[npcData.npcId] = npcData;
        this.relationships[npcData.npcId] = 0;
    }

    getRelationshipTier(npcId) {
        const relationship = this.relationships[npcId];

        if (relationship < 20) {
            return 'Stranger';
        } else if (relationship < 40) {
            return 'Friendly';
        } else if (relationship < 60) {
            return 'Acquaintance';
        } else if (relationship < 80) {
            return 'Friend';
        } else {
            return 'Close Friend';
        }
    }

    updateRelationship(npcId, amount) {
        this.relationships[npcId] = Math.min(100, Math.max(0, this.relationships[npcId] + amount));
    }

    getNPCDialogue(npcId, relationship) {
        const npcData = this.npcs[npcId];
        let stage;

        if (relationship < 20) {
            stage = 'stranger';
        } else if (relationship < 40) {
            stage = 'friendly';
        } else if (relationship < 60) {
            stage = 'acquaintance';
        } else if (relationship < 80) {
            stage = 'friend';
        } else {
            stage = 'close_friend';
        }

        return npcData.stages[stage];
    }

    handleDialogueTrigger(npcId, trigger) {
        const npcData = this.npcs[npcId];
        const breakdown = npcData.breakdowns[trigger];

        if (breakdown) {
            this.updateRelationship(npcId, breakdown.emotion === 'hurt' ? -10 : 10);
            return breakdown.dialogue;
        }

        return null;
    }

    handleEmotionalTrigger(npcId, conditions) {
        const npcData = this.npcs[npcId];
        const emotionalTrigger = npcData.emotionalTriggers.find(trigger => 
            Object.keys(conditions).every(key => conditions[key] === trigger.condition[key])
        );

        if (emotionalTrigger) {
            return emotionalTrigger.dialogue;
        }

        return null;
    }

    handleAction(npcId, action) {
        const npcData = this.npcs[npcId];
        return npcData.actions[action] || 'No response';
    }
}

export default new NPCManager();