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
        
        const npcs = this.gameState.npcManager?.getMetNPCs() || [];
        
        npcs.forEach(npc => {
            if (this.shouldBeJealous(npc, playerSuccess)) {
                this.increaseJealousy(npc.id, playerSuccess.level || 10);
            }
        });
    }
    
    /**
     * Determine if NPC should be jealous
     */
    shouldBeJealous(npc, playerSuccess = {}) {
        // Only NPCs the player actually knows can resent their success
        const npcManager = this.gameState.npcManager;
        if (npcManager?.metNPCs && !npcManager.metNPCs.includes(npc.id)) return false;

        const relevant = playerSuccess.type === 'career' || playerSuccess.type === 'financial';

        // Competitive NPCs resent career/financial wins
        if (npc.personality === 'competitive') {
            return relevant;
        }

        // NPCs in similar field
        if (npc.type === 'business' || npc.type === 'mentor') {
            return relevant;
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
        const npcManager = this.gameState.npcManager;
        const npc = npcManager?.getNPC(npcId);
        if (!npc) return;

        // Store on per-save NPC state (saved with the game), never on the
        // shared static NPC definition
        const flags = npcManager.getNPCFlags?.(npcId);
        if (!flags) return;
        flags.willNotTalk = true;
        flags.jealousyMessage = this.getJealousyMessage(npc);
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
            const flags = this.gameState.npcManager?.getNPCFlags?.(npcId);
            if (flags) {
                flags.willNotTalk = false;
                delete flags.jealousyMessage;
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

