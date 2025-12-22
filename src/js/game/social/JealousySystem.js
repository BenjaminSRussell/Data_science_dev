/**
 * JealousySystem.js
 * Handles jealousy when player succeeds
 * NPCs stop talking when jealous
 */

export class JealousySystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.jealousyLevels = new Map(); // NPC ID -> jealousy level (0-100)
        this.relationshipChanges = new Map(); // Track relationship changes
    }
    
    /**
     * Check for jealousy triggers
     */
    checkJealousy(playerSuccess) {
        if (!this.gameState.npcManager) return;
        
        const npcs = this.gameState.npcManager?.getAllNPCs() || [];
        
        npcs.forEach(npc => {
            if (this.shouldBeJealous(npc, playerSuccess)) {
                this.increaseJealousy(npc.id, playerSuccess.level || 10);
            }
        });
    }
    
    /**
     * Determine if NPC should be jealous
     */
    shouldBeJealous(npc, playerSuccess) {
        // Competitive NPCs are more likely to be jealous
        if (npc.personality === 'competitive') {
            return true;
        }
        
        // NPCs in similar field
        if (npc.type === 'business' || npc.type === 'mentor') {
            return playerSuccess.type === 'career' || playerSuccess.type === 'financial';
        }
        
        // Random chance for others
        return Math.random() < 0.3;
    }
    
    /**
     * Increase jealousy level
     */
    increaseJealousy(npcId, amount) {
        const current = this.jealousyLevels.get(npcId) || 0;
        const newLevel = Math.min(100, current + amount);
        this.jealousyLevels.set(npcId, newLevel);
        
        // If jealousy is high, reduce relationship
        if (newLevel > 50) {
            this.affectRelationship(npcId, -5);
        }
        
        // If jealousy is very high, NPC stops talking
        if (newLevel > 75) {
            this.stopTalking(npcId);
        }
    }
    
    /**
     * Affect relationship due to jealousy
     */
    affectRelationship(npcId, change) {
        if (!this.gameState.npcManager) return;
        
        const current = this.gameState.npcManager?.getRelationship(npcId) || 0;
        this.gameState.npcManager?.setRelationship(npcId, Math.max(0, current + change));
        
        // Track the change
        this.relationshipChanges.set(npcId, (this.relationshipChanges.get(npcId) || 0) + change);
    }
    
    /**
     * Stop talking to player
     */
    stopTalking(npcId) {
        const npc = this.gameState.npcManager?.getNPC(npcId);
        if (!npc) return;
        
        // Mark NPC as not talking
        npc.willNotTalk = true;
        npc.jealousyMessage = this.getJealousyMessage(npc);
    }
    
    /**
     * Get jealousy message
     */
    getJealousyMessage(npc) {
        const messages = [
            `${npc.name} seems distant and avoids eye contact.`,
            `${npc.name} gives you a cold shoulder.`,
            `${npc.name} makes excuses to avoid talking to you.`,
            `${npc.name} seems envious of your success.`
        ];
        
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    /**
     * Reduce jealousy over time
     */
    reduceJealousy(npcId, amount = 1) {
        const current = this.jealousyLevels.get(npcId) || 0;
        const newLevel = Math.max(0, current - amount);
        this.jealousyLevels.set(npcId, newLevel);
        
        // If jealousy drops, NPC might start talking again
        if (newLevel < 50) {
            const npc = this.gameState.npcManager?.getNPC(npcId);
            if (npc) {
                npc.willNotTalk = false;
            }
        }
    }
    
    /**
     * Get jealousy level
     */
    getJealousyLevel(npcId) {
        return this.jealousyLevels.get(npcId) || 0;
    }
}

