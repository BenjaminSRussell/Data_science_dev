import { NPCManager, CharacterStats, RomanceSystem, TimeManager } from './imports'; // Stub imports

class RelationshipEmotionSystem {
    constructor() {
        this.npcManager = new NPCManager();
        this.characterStats = new CharacterStats();
        this.romanceSystem = new RomanceSystem();
        this.timeManager = new TimeManager();

        this.relationships = {};
        this.breakupThresholds = {
            neglect: 30,
            money: 20,
            betrayal: 15
        };
    }

    calculateRelationshipChange(action, npc, ethics, currentRel, context) {
        let change = 0;

        switch (action) {
            case 'unethical_choice':
                if (npc.romance + Math.min(ethics, 0) > ethics) {
                    change = -15;
                } else if (this.characterStats.getPersonality('professional')) {
                    change = -10;
                } else {
                    change = -5;
                }
                break;
            case 'neglect':
                const daysSinceLastTalk = context.daysSinceLastTalk || 0;
                if (npc.romance > 0 && daysSinceLastTalk >= 10) {
                    change = -5 * Math.min(daysSinceLastTalk - 7, 10);
                } else if (daysSinceLastTalk >= 20) {
                    change = -2;
                }
                break;
            case 'betrayal':
                if (currentRel >= 70) {
                    change = -30;
                } else if (currentRel >= 50) {
                    change = -15;
                }
                break;
            // Add more cases as needed
        }

        return change;
    }

    updateEmotionalState(npcId, action, context) {
        if (!this.relationships[npcId]) {
            this.relationships[npcId] = { trust: 50, affection: 50, respect: 50, anger: 0, fear: 0 };
        }

        const npc = this.npcManager.getNPC(npcId);
        const change = this.calculateRelationshipChange(action, npc, context.ethics, this.relationships[npcId].affection, context);

        this.relationships[npcId].affection = Math.min(100, Math.max(0, this.relationships[npcId].affection + change));
        // Apply changes to other emotional states if needed
    }

    checkRelationshipEvents(npcId, npc, ethics) {
        if (this.relationships[npcId].affection <= 0) {
            this.triggerBreakup(npcId, 'ethics');
            return true;
        }

        const daysSinceLastTalk = this.timeManager.totalDays - (npc.lastTalkDay || 0);
        if (daysSinceLastTalk >= this.breakupThresholds.neglect && npc.romance > 0) {
            this.triggerBreakup(npcId, 'neglect');
            return true;
        }

        if (daysSinceLastTalk >= this.breakupThresholds.money) {
            this.triggerBreakup(npcId, 'money');
            return true;
        }

        if (this.relationships[npcId].affection <= this.breakupThresholds.betrayal) {
            this.triggerBreakup(npcId, 'betrayal');
            return true;
        }

        return false;
    }

    triggerBreakup(npcId, reason) {
        const npc = this.npcManager.getNPC(npcId);
        npc.partnerId = null;
        npc.status = 'single';
        npc.romance = 0;

        if (reason === 'ethics' && ethics < -40) {
            this.makeNPCAntagonist(npcId);
        }
    }

    makeNPCAntagonist(npcId) {
        const npc = this.npcManager.getNPC(npcId);
        npc.isAntagonist = true;
    }

    processDailyUpdates() {
        const npcs = this.npcManager.getAllNPCs();
        npcs.forEach(npc => {
            if (npc.partnerId) {
                const daysSinceLastTalk = this.timeManager.totalDays - (npc.lastTalkDay || 0);
                if (npc.romance > 0 && daysSinceLastTalk >= 7) {
                    this.checkRelationshipEvents(npc.partnerId, npc, this.characterStats.getEthics(npc.partnerId));
                } else if (daysSinceLastTalk >= 30) {
                    this.checkRelationshipEvents(npc.partnerId, npc, this.characterStats.getEthics(npc.partnerId));
                }
            }
        });
    }
}

export default RelationshipEmotionSystem;