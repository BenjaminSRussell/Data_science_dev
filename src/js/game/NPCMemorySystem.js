/**
 * NPCMemorySystem.js
 * Makes NPCs remember player choices and react accordingly
 * Priority 3: Make Choices Matter
 */

export class NPCMemorySystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.npcMemories = {}; // { npcId: { decisions: [], reactions: [] } }
    }

    /**
     * Initialize NPC memory system
     */
    initialize() {
        // Load saved memories
        if (this.gameState.npcMemories) {
            this.npcMemories = this.gameState.npcMemories;
        }
    }

    /**
     * Record a decision that an NPC would remember
     */
    recordDecision(decisionId, choice, npcIds = null) {
        const storylineManager = this.gameState.storylineManager;
        if (!storylineManager) return;

        const decision = storylineManager.getDecision(decisionId);
        if (!decision) return;

        // If no specific NPCs, find NPCs who would care about this decision
        const relevantNPCs = npcIds || this.findRelevantNPCs(decisionId, choice);

        relevantNPCs.forEach(npcId => {
            if (!this.npcMemories[npcId]) {
                this.npcMemories[npcId] = { decisions: [], reactions: [] };
            }

            this.npcMemories[npcId].decisions.push({
                decisionId,
                choice,
                timestamp: Date.now(),
                week: Math.floor((this.gameState.timeManager?.totalDays || 0) / 7)
            });
        });

        // Save to game state
        this.gameState.npcMemories = this.npcMemories;
    }

    /**
     * Find NPCs who would care about a decision
     */
    findRelevantNPCs(decisionId, choice) {
        const npcManager = this.gameState.npcManager;
        if (!npcManager) return [];

        const relevantNPCs = [];

        // Decision-specific NPC relevance
        const decisionNPCs = {
            'first_job_offer': ['professor_higgins', 'sarah_martinez'], // Mentors care about career choices
            'whistleblower': ['professor_higgins', 'sarah_martinez', 'mike_johnson'], // Professional contacts
            'criminal_opportunity': ['vinnie', 'the_broker'] // Criminal contacts
        };

        if (decisionNPCs[decisionId]) {
            decisionNPCs[decisionId].forEach(npcId => {
                if (npcManager.getNPC(npcId)) {
                    relevantNPCs.push(npcId);
                }
            });
        }

        // Ethics-based: Ethical NPCs react to unethical choices
        if (choice === 'accept' && decisionId === 'criminal_opportunity') {
            const ethicalNPCs = ['professor_higgins', 'emma_bloom'];
            ethicalNPCs.forEach(npcId => {
                if (npcManager.getNPC(npcId) && !relevantNPCs.includes(npcId)) {
                    relevantNPCs.push(npcId);
                }
            });
        }

        return relevantNPCs;
    }

    /**
     * Get NPC's memory of player decisions
     */
    getNPCMemory(npcId) {
        return this.npcMemories[npcId] || { decisions: [], reactions: [] };
    }

    /**
     * Get dialogue that references player's choices
     */
    getMemoryDialogue(npcId, relationship) {
        const memory = this.getNPCMemory(npcId);
        if (memory.decisions.length === 0) return null;

        const npc = this.gameState.npcManager?.getNPC(npcId);
        if (!npc) return null;

        // Get most recent relevant decision
        const recentDecision = memory.decisions[memory.decisions.length - 1];
        const storylineManager = this.gameState.storylineManager;
        const decisionData = storylineManager?.getDecision?.(recentDecision.decisionId);

        if (!decisionData) return null;

        // Generate reaction based on NPC personality and decision
        return this.generateReaction(npc, recentDecision, decisionData, relationship);
    }

    /**
     * Generate NPC reaction to player's decision
     */
    generateReaction(npc, decision, decisionData, relationship) {
        const npcPersonality = npc.personality || 'neutral';
        const choice = decision.choice;

        // Ethical NPCs react to unethical choices
        if (npcPersonality === 'generous' || npcPersonality === 'ethical') {
            if (decisionData.id === 'criminal_opportunity' && choice === 'accept') {
                return {
                    text: "I heard about... what happened. I'm disappointed. I thought you were better than that.",
                    relationshipChange: -10,
                    tone: 'disappointed'
                };
            }
            if (decisionData.id === 'whistleblower' && choice === 'expose') {
                return {
                    text: "I heard what you did. That took courage. I respect you for standing up for what's right.",
                    relationshipChange: 15,
                    tone: 'admiring'
                };
            }
        }

        // Professional NPCs react to career choices
        if (npcPersonality === 'professional') {
            if (decisionData.id === 'first_job_offer' && choice === 'negotiate') {
                return {
                    text: "I heard you negotiated for ethical practices. Smart move. Shows you have principles.",
                    relationshipChange: 5,
                    tone: 'approving'
                };
            }
        }

        // Criminal NPCs react to criminal choices
        if (npc.type === 'criminal') {
            if (decisionData.id === 'criminal_opportunity' && choice === 'accept') {
                return {
                    text: "Heard you're getting into the game. Smart. Money talks, right?",
                    relationshipChange: 10,
                    tone: 'approving'
                };
            }
            if (decisionData.id === 'criminal_opportunity' && choice === 'reject') {
                return {
                    text: "You walked away? That's... interesting. Not everyone has the stomach for it.",
                    relationshipChange: -5,
                    tone: 'dismissive'
                };
            }
        }

        return null;
    }

    /**
     * Check if NPC should reference a decision in dialogue
     */
    shouldReferenceDecision(npcId, decisionId) {
        const memory = this.getNPCMemory(npcId);
        const hasDecision = memory.decisions.some(d => d.decisionId === decisionId);
        
        if (!hasDecision) return false;

        // Only reference if decision was recent (within last 4 weeks)
        const decision = memory.decisions.find(d => d.decisionId === decisionId);
        const timeManager = this.gameState.timeManager;
        const currentWeek = timeManager ? Math.floor((timeManager.totalDays || 0) / 7) : 0;
        const decisionWeek = decision.week || 0;

        return currentWeek - decisionWeek <= 4;
    }
}
