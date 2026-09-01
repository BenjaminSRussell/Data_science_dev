import { PERSONALITY_TRAITS } from './NPCConstants.js';
import { DIALOGUE_TEMPLATES, DIALOGUE_CHOICES, DIALOGUE_TREES } from './DialogueTemplates.js';
import { NPCState } from './NPCState.js';

export class NPCManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.npcs = [];
        this.relationships = {};
        this.metNPCs = [];
        this.currentConversation = null;
    }

    // Other methods...

    modifyRelationship(npcId, amount) {
        const npc = this.getNPC(npcId);
        if (!npc) return;
        const personality = PERSONALITY_TRAITS[npc.personality] || PERSONALITY_TRAITS['friendly']; // Fallback to friendly
        const adjustedAmount = Math.floor(amount * personality.relationshipGain);
        this.relationships[npcId] = Math.max(0, (this.relationships[npcId] || 0) + adjustedAmount);
    }

    // Other methods...
}