/**
 * NPCMemorySystem.js
 * Makes NPCs remember player choices and react accordingly
 * Priority 3: Make Choices Matter
 */

import { pickState, applyState } from '../utils/StateSerializer.js';

export class NPCMemorySystem {
    /** Weeks an NPC keeps bringing up a decision */
    static MEMORY_WEEKS = 4;

    /** NPCs who care about each decision; ids match NPCManager's roster (#1996) */
    static DECISION_NPCS = {
        first_job_offer: ['professor_higgins', 'sarah_martinez'],
        whistleblower: ['professor_higgins', 'sarah_martinez', 'mike_johnson'],
        criminal_opportunity: ['vinnie_shark', 'the_broker'],
        model_audit: ['professor_higgins', 'sarah_martinez']
    };

    /** NPCs who react to unethical choices */
    static ETHICAL_NPCS = ['professor_higgins', 'emma_bloom'];

    static UNETHICAL_CHOICES = {
        criminal_opportunity: ['accept'],
        whistleblower: ['stay_quiet'],
        model_audit: ['bury']
    };

    /** First matching rule wins; `who` is a group from matchesGroup() */
    static REACTIONS = [
        { decision: 'criminal_opportunity', choice: 'accept', who: 'criminal', change: 10, tone: 'approving',
            text: "Heard you're getting into the game. Smart. Money talks, right?" },
        { decision: 'criminal_opportunity', choice: 'accept', who: 'ethical', change: -10, tone: 'disappointed',
            text: "I heard about... what happened. I'm disappointed. I thought you were better than that." },
        { decision: 'criminal_opportunity', choice: 'reject', who: 'criminal', change: -5, tone: 'dismissive',
            text: "You walked away? That's... interesting. Not everyone has the stomach for it." },
        { decision: 'whistleblower', choice: 'expose', who: 'ethical', change: 15, tone: 'admiring',
            text: "I heard what you did. That took courage. I respect you for standing up for what's right." },
        { decision: 'whistleblower', choice: 'expose', who: 'professional', change: 5, tone: 'respectful',
            text: "Going public was a big career risk. I wouldn't have done it, but I respect it." },
        { decision: 'whistleblower', choice: 'internal_report', who: 'professional', change: 5, tone: 'approving',
            text: "Reporting it through the proper channels was the professional call." },
        { decision: 'whistleblower', choice: 'stay_quiet', who: 'ethical', change: -5, tone: 'disappointed',
            text: "I heard you knew what was going on and said nothing. That's not like you." },
        { decision: 'first_job_offer', choice: 'negotiate', who: 'professional', change: 5, tone: 'approving',
            text: "I heard you negotiated for ethical practices. Smart move. Shows you have principles." },
        { decision: 'first_job_offer', choice: 'negotiate', who: 'ethical', change: 5, tone: 'approving',
            text: "You stood up for your principles before you even started. I'm proud of you." },
        { decision: 'model_audit', choice: 'disclose', who: 'ethical', change: 10, tone: 'admiring',
            text: "You disclosed the model's problems. That's exactly the right thing to do." },
        { decision: 'model_audit', choice: 'bury', who: 'ethical', change: -10, tone: 'disappointed',
            text: "Burying that audit could hurt real people. I expected more from you." }
    ];

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
        const add = (npcId) => {
            if (npcManager.getNPC(npcId) && !relevantNPCs.includes(npcId)) relevantNPCs.push(npcId);
        };

        (NPCMemorySystem.DECISION_NPCS[decisionId] || []).forEach(add);

        // Ethical NPCs hear about unethical choices
        if (NPCMemorySystem.UNETHICAL_CHOICES[decisionId]?.includes(choice)) {
            NPCMemorySystem.ETHICAL_NPCS.forEach(add);
        }

        return relevantNPCs;
    }

    /**
     * Get NPC's memory of player decisions
     */
    getNPCMemory(npcId) {
        const memory = this.npcMemories[npcId] || { decisions: [], reactions: [] };
        if (!Array.isArray(memory.decisions)) memory.decisions = [];
        if (!Array.isArray(memory.reactions)) memory.reactions = [];
        return memory;
    }

    currentWeek() {
        return Math.floor((this.gameState.timeManager?.totalDays || 0) / 7);
    }

    /**
     * Whether this NPC already reacted to a decision (#2419)
     */
    hasReacted(npcId, decisionId) {
        return this.getNPCMemory(npcId).reactions.some(r => r.decisionId === decisionId);
    }

    /**
     * Get dialogue that references player's choices.
     * Walks decisions newest first (#1997), skips ones older than the memory
     * window (#1998) and ones this NPC already reacted to (#2419). With
     * consume (the default) the reaction is recorded in memory.reactions
     * (#2420) so its relationship change is applied only once.
     */
    getMemoryDialogue(npcId, relationship, { consume = true } = {}) {
        const memory = this.getNPCMemory(npcId);
        if (memory.decisions.length === 0) return null;

        const npc = this.gameState.npcManager?.getNPC(npcId);
        if (!npc) return null;
        const storylineManager = this.gameState.storylineManager;

        for (let i = memory.decisions.length - 1; i >= 0; i--) {
            const decision = memory.decisions[i];
            if (this.hasReacted(npcId, decision.decisionId)) continue;
            if (!this.shouldReferenceDecision(npcId, decision.decisionId)) continue;
            const decisionData = storylineManager?.getDecision?.(decision.decisionId)
                || { id: decision.decisionId };
            const reaction = this.generateReaction(npc, decision, decisionData, relationship);
            if (!reaction) continue;
            const result = { ...reaction, decisionId: decision.decisionId };
            if (consume) {
                this.npcMemories[npcId] = memory;
                memory.reactions.push({
                    decisionId: decision.decisionId,
                    tone: result.tone,
                    relationshipChange: result.relationshipChange,
                    week: this.currentWeek()
                });
                this.gameState.npcMemories = this.npcMemories;
            }
            return result;
        }
        return null;
    }

    /**
     * Generate NPC reaction to player's decision
     */
    generateReaction(npc, decision, decisionData, relationship) {
        if (!npc || !decision) return null;
        const decisionId = decisionData?.id || decision.decisionId;
        const choice = decision.choice;
        for (const rule of NPCMemorySystem.REACTIONS) {
            if (rule.decision !== decisionId || rule.choice !== choice) continue;
            if (!NPCMemorySystem.matchesGroup(npc, rule.who)) continue;
            return { text: rule.text, relationshipChange: rule.change, tone: rule.tone };
        }
        return null;
    }

    /**
     * Personality/type groups the reaction table uses, matched against the
     * real NPC roster (#1996)
     */
    static matchesGroup(npc, group) {
        const personality = npc.personality || 'neutral';
        switch (group) {
            case 'ethical':
                return ['generous', 'ethical', 'friendly', 'kind'].includes(personality)
                    || NPCMemorySystem.ETHICAL_NPCS.includes(npc.id);
            case 'professional':
                return personality === 'professional' || ['mentor', 'business'].includes(npc.type);
            case 'criminal':
                return npc.type === 'criminal';
            default:
                return false;
        }
    }

    /**
     * Check if NPC should reference a decision in dialogue
     */
    shouldReferenceDecision(npcId, decisionId) {
        const memory = this.getNPCMemory(npcId);
        // Latest record of this decision (#1998)
        const decision = [...memory.decisions].reverse().find(d => d.decisionId === decisionId);
        if (!decision) return false;

        // Only reference if decision was recent (within the memory window)
        const decisionWeek = decision.week || 0;
        return this.currentWeek() - decisionWeek <= NPCMemorySystem.MEMORY_WEEKS;
    }

    /**
     * Serialize player-visible state for saving
     */
    toJSON() {
        return pickState(this, ['npcMemories']);
    }

    /**
     * Restore state from a save (missing fields keep constructor defaults)
     */
    fromJSON(data) {
        if (!data) return;
        applyState(this, data, ['npcMemories']);
        this.gameState && (this.gameState.npcMemories = this.npcMemories);
    }
}
