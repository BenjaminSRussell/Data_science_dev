/**
 * Hardware Systems Manager
 * Manages hardware parts and their statistics.
 */

class HardwareManager {
    constructor() {
        this.ownedParts = {
            cpu: [],
            gpu: [],
            ssd: [],
            case: [],
            powerSupply: []
        };
        this.equippedParts = {
            cpu: null,
            gpu: null,
            ssd: null,
            case: null,
            powerSupply: null
        };
        this.partPrices = {
            cpu: 100,
            gpu: 200,
            ssd: 150,
            case: 50,
            powerSupply: 75
        };
    }

    getTotalStats() {
        const totalStats = {
            cooling: 0,
            noise: 0,
            compute: 0,
            aesthetics: 0,
            productivity: 0
        };

        for (const type in this.ownedParts) {
            for (const part of this.ownedParts[type]) {
                totalStats.cooling += part.stats.cooling;
                totalStats.noise += part.stats.noise;
                totalStats.compute += part.stats.compute;
                totalStats.aesthetics += part.stats.aesthetics;
                totalStats.productivity = Math.max(totalStats.productivity, part.stats.productivity);
            }
        }

        return totalStats;
    }

    buyPart(type, partId) {
        if (this.ownedParts[type].some(part => part.id === partId)) {
            return { success: false, message: "Already owned" };
        }

        if (this.partPrices[type] > 0 && this.money < this.partPrices[type]) {
            return { success: false, message: "Not enough money" };
        }

        // Simulate part purchase
        const newPart = {
            id: partId,
            type: type,
            stats: {
                cooling: Math.random() * 10,
                noise: Math.random() * 10,
                compute: Math.random() * 10,
                aesthetics: Math.random() * 10,
                productivity: Math.random()
            }
        };

        this.ownedParts[type].push(newPart);
        this.equipPart(type, partId);
        this.money -= this.partPrices[type];

        return { success: true, message: "Part purchased and equipped" };
    }

    equipPart(type, partId) {
        const part = this.ownedParts[type].find(p => p.id === partId);
        if (!part) {
            return { success: false, message: "Part not found" };
        }

        this.equippedParts[type] = part;
        return { success: true, message: "Part equipped" };
    }

    toJSON() {
        return {
            ownedParts: this.ownedParts,
            equippedParts: this.equippedParts,
            money: this.money
        };
    }

    fromJSON(data) {
        this.ownedParts = data.ownedParts;
        this.equippedParts = data.equippedParts;
        this.money = data.money;
    }
}

export default HardwareManager;