/**
 * JealousySystem - Manages NPC relationships and jealousy
 */

export class JealousySystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.npcManager = gameState.npcManager;

        // Initialize jealousy system if not already present
        if (!this.gameState.jealousy) {
            this.gameState.jealousy = {
                relationships: {},
                relationshipChanges: 0
            };
        }
    }

    /**
     * Affect the relationship with an NPC
     * @param {string} npcId - NPC ID
     * @param {number} change - Amount to change the relationship
     */
    affectRelationship(npcId, change) {
        if (!this.npcManager) return;

        const current = this.getRelationship(npcId);
        const newRelationship = Math.max(0, current + change);

        this.setRelationship(npcId, newRelationship);
        this.gameState.jealousy.relationshipChanges++;
    }

    /**
     * Get the current relationship with an NPC
     * @param {string} npcId - NPC ID
     * @returns {number} - Current relationship level
     */
    getRelationship(npcId) {
        return this.gameState.jealousy.relationships[npcId] || 0;
    }

    /**
     * Set the relationship level with an NPC
     * @param {string} npcId - NPC ID
     * @param {number} level - New relationship level
     */
    setRelationship(npcId, level) {
        this.gameState.jealousy.relationships[npcId] = level;
    }

    /**
     * Stop talking to an NPC due to jealousy
     * @param {string} npcId - NPC ID
     */
    stopTalking(npcId) {
        const npc = this.npcManager.getNPCById(npcId);
        if (!npc) return;

        npc.willNotTalk = true;
        npc.jealousyMessage = this.generateJealousyMessage();
    }

    /**
     * Generate a random jealousy message
     * @returns {string} - Random jealousy message
     */
    generateJealousyMessage() {
        const messages = [
            "I don't want to talk to you right now.",
            "You're being too pushy!",
            "I'm not in the mood to chat.",
            "Leave me alone for a while."
        ];
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    }

    /**
     * Reduce the jealousy level of an NPC
     * @param {string} npcId - NPC ID
     * @param {number} amount - Amount to reduce jealousy (default 1)
     */
    reduceJealousy(npcId, amount = 1) {
        const npc = this.npcManager.getNPCById(npcId);
        if (!npc) return;

        npc.jealousyLevel = Math.max(0, npc.jealousyLevel - amount);
        if (npc.jealousyLevel < 50) {
            npc.willNotTalk = false;
        }
    }

    /**
     * Get the jealousy level of an NPC
     * @param {string} npcId - NPC ID
     * @returns {number} - Jealousy level
     */
    getJealousyLevel(npcId) {
        const npc = this.npcManager.getNPCById(npcId);
        return npc ? npc.jealousyLevel || 0 : 0;
    }
}