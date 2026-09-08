class RomanceSystem {
    constructor(player, npcs) {
        this.player = player;
        this.npcs = npcs;
        this.relationships = {};
    }

    askOnDate(npcId) {
        const npc = this.npcs.find(npc => npc.id === npcId);
        if (!npc || !npc.romanceOptions || this.relationships[npcId] && this.relationships[npcId].status !== 'single') {
            return { success: false, message: 'No romance options or existing partner.' };
        }
        if (this.player.relationship < 30 || this.player.ethics < npc.minEthics || this.player.ethics > npc.maxEthics) {
            return { success: false, message: 'Relationship or ethics requirements not met.' };
        }
        this.relationships[npcId] = { partnerId: npcId, status: 'dating', score: 50 };
        return { success: true };
    }

    goOnDate(type) {
        if (!this.player.partnerId) {
            return { success: false, message: 'No partner to go on a date with.' };
        }
        const dateCosts = { coffee: 20, dinner: 100, fancy_dinner: 500, vacation: 2000 };
        const happinessGains = { coffee: 5, dinner: 10, fancy_dinner: 20, vacation: 50 };
        const cost = dateCosts[type] || 0;
        const happinessGain = happinessGains[type] || 0;
        if (this.player.money < cost) {
            return { success: false, message: "Can't afford the date." };
        }
        this.player.money -= cost;
        this.modifyHappiness(happinessGain);
        return { success: true };
    }

    modifyHappiness(amount) {
        this.player.score = Math.max(0, Math.min(100, this.player.score + amount));
    }

    propose() {
        if (!this.player.partnerId || this.relationships[this.player.partnerId].status !== 'dating') {
            return { success: false, message: 'Not in a dating relationship.' };
        }
        if (this.player.score < 80) {
            this.modifyHappiness(-20);
            return { success: false, message: 'Score too low for proposal.' };
        }
        if (this.player.money < 5000) {
            return { success: false, message: "Can't afford the ring." };
        }
        this.player.money -= 5000;
        this.modifyHappiness(20);
        this.relationships[this.player.partnerId].status = 'engaged';
        return { success: true };
    }

    getMarried() {
        if (this.relationships[this.player.partnerId].status !== 'engaged' || this.player.money < 20000) {
            return { success: false, message: 'Not engaged or insufficient funds.' };
        }
        this.player.money -= 20000;
        this.modifyHappiness(100);
        this.relationships[this.player.partnerId].status = 'married';
        return { success: true };
    }

    toJSON() {
        return JSON.stringify({
            relationships: this.relationships,
            playerScore: this.player.score,
            playerMoney: this.player.money,
            playerPartnerId: this.player.partnerId,
            playerChildren: this.player.children || [],
            playerHouseLevel: this.player.houseLevel || 0
        });
    }

    fromJSON(data) {
        if (!data) return;
        const parsedData = JSON.parse(data);
        this.relationships = parsedData.relationships;
        this.player.score = parsedData.playerScore;
        this.player.money = parsedData.playerMoney;
        this.player.partnerId = parsedData.playerPartnerId;
        this.player.children = parsedData.playerChildren || [];
        this.player.houseLevel = parsedData.playerHouseLevel || 0;
    }
}

export default RomanceSystem;