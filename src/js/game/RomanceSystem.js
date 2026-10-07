/**
 * RomanceSystem.js
 * Manages dating, marriage, and family mechanics
 */
export class RomanceSystem {
    constructor(gameState) {
        this.gameState = gameState;

        this.partnerId = null; // NPC ID of current partner
        this.relationshipStatus = 'single'; // single, dating, engaged, married
        this.relationshipScore = 0; // 0-100 measure of romantic happiness
        this.anniversary = null;

        // Family
        this.children = [];
        this.houseLevel = 0; // 0=Apartment, 1=Condo, 2=House, 3=Mansion
    }

    /**
     * Ask an NPC on a date
     */
    askOnDate(npcId) {
        const npcManager = this.gameState.npcManager;
        const npc = npcManager?.getNPC(npcId);

        if (!npc || !npc.romanceOptions) return { success: false, message: "They aren't interested." };

        if (this.partnerId && this.partnerId !== npcId) {
            this.modifyHappiness(-25); // Partner is upset about cheating attempt
            return { success: false, message: "You are already seeing someone! Cheater!" };
        }

        // Check requirements
        const rel = npcManager.getRelationship(npcId);
        if (rel < 30) return { success: false, message: "We don't know each other well enough." };

        // Check Compatibility/Ethics
        if (npc.romanceOptions.minEthics && this.gameState.characterStats?.ethics < npc.romanceOptions.minEthics) {
            return { success: false, message: "I don't date criminals." };
        }
        if (npc.romanceOptions.maxEthics && this.gameState.characterStats?.ethics > npc.romanceOptions.maxEthics) {
            return { success: false, message: "You're too much of a 'goody two-shoes' for me." };
        }
        const stats = this.gameState.characterStats;
        if (npc.romanceOptions.minIntelligence && (stats?.getStat?.('intelligence') || 0) < npc.romanceOptions.minIntelligence) {
            return { success: false, message: "I'm looking for someone I can talk shop with. Maybe once you've studied up." };
        }
        if (npc.romanceOptions.minCharisma && (stats?.getStat?.('charisma') || 0) < npc.romanceOptions.minCharisma) {
            return { success: false, message: "You're sweet, but I need someone a little more expressive." };
        }

        // Success
        this.partnerId = npcId;
        this.relationshipStatus = 'dating';
        this.relationshipScore = 50;

        return { success: true, message: `${npc.name} agreed to go on a date with you!` };
    }

    /**
     * Go on a date action
     */
    goOnDate(type) {
        if (!this.partnerId) return { success: false, message: "You are single." };

        // Cost, energy, time (in 2-hour slots) and effect per date type
        const DATE_TYPES = {
            coffee: { cost: 20, energy: 10, slots: 1, happiness: 5 },
            dinner: { cost: 100, energy: 15, slots: 1, happiness: 25 },
            fancy_dinner: { cost: 500, energy: 20, slots: 2, happiness: 125 },
            vacation: { cost: 2000, energy: 40, slots: 4, happiness: 500 }
        };
        const date = DATE_TYPES[type];
        if (!date) return { success: false, message: "That's not a kind of date." };

        if (this.gameState.money < date.cost) return { success: false, message: "You can't afford that." };

        const timeManager = this.gameState.timeManager;
        if (timeManager && typeof timeManager.energy === 'number' && timeManager.energy < date.energy) {
            return { success: false, message: "You're too tired for a date right now." };
        }

        this.gameState.money -= date.cost;
        timeManager?.useEnergy?.(date.energy);
        this.modifyHappiness(date.happiness);

        // Dates take time like any other activity
        if (this.gameState.mainGame?.handleTimeAdvance) {
            this.gameState.mainGame.handleTimeAdvance(date.slots);
        } else {
            timeManager?.advanceTime?.(date.slots);
        }

        return { success: true, message: "Date went great!", cost: date.cost, energy: date.energy };
    }

    modifyHappiness(amount) {
        this.relationshipScore = Math.max(0, Math.min(500, this.relationshipScore + amount));
    }

    propose() {
        if (this.relationshipStatus !== 'dating') return { success: false, message: "You need to be dating first." };

        if (this.relationshipScore < 80) {
            this.modifyHappiness(-20); // Ouch
            return { success: false, message: "I... I think we should wait. It's too soon." };
        }

        // Ring cost?
        if (this.gameState.money < 5000) return { success: false, message: "You can't afford a ring!" };
        this.gameState.money -= 5000;

        this.relationshipStatus = 'engaged';
        this.modifyHappiness(20);
        return { success: true, message: "YES! I will marry you!" };
    }

    getMarried() {
        if (this.relationshipStatus !== 'engaged') return { success: false, message: "Not engaged." };

        // Wedding cost
        if (this.gameState.money < 20000) return { success: false, message: "Weddings are expensive ($20k)." };

        this.gameState.money -= 20000;
        this.relationshipStatus = 'married';
        this.modifyHappiness(100); // Max happy

        return { success: true, message: "Just married! " };
    }

    toJSON() {
        return {
            partnerId: this.partnerId,
            relationshipStatus: this.relationshipStatus,
            relationshipScore: this.relationshipScore,
            children: this.children,
            houseLevel: this.houseLevel
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.partnerId = data.partnerId;
        this.relationshipStatus = data.relationshipStatus;
        this.relationshipScore = data.relationshipScore;
        this.children = data.children || [];
        this.houseLevel = data.houseLevel || 0;
    }
}
