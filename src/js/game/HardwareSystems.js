class HardwareManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.ownedParts = {
            [HARDWARE_TYPES.COOLING]: ['stock_cooler'],
            [HARDWARE_TYPES.CASE]: ['beige_box'],
            [HARDWARE_TYPES.MONITOR]: ['crt_monitor'],
            [HARDWARE_TYPES.GPU]: ['gpu_integrated'],
            [HARDWARE_TYPES.CPU]: ['cpu_generic'],
            [HARDWARE_TYPES.RAM]: ['ram_4gb'],
            [HARDWARE_TYPES.STORAGE]: ['hdd_500gb']
        };
        this.equippedParts = {
            [HARDWARE_TYPES.COOLING]: 'stock_cooler',
            [HARDWARE_TYPES.CASE]: 'beige_box',
            [HARDWARE_TYPES.MONITOR]: 'crt_monitor',
            [HARDWARE_TYPES.GPU]: 'gpu_integrated',
            [HARDWARE_TYPES.CPU]: 'cpu_generic',
            [HARDWARE_TYPES.RAM]: 'ram_4gb',
            [HARDWARE_TYPES.STORAGE]: 'hdd_500gb'
        };
    }

    getTotalStats() {
        let stats = {
            cooling: 0,
            noise: 0,
            aesthetics: 0,
            compute: 0,
            productivity: 1.0,
            reliability: 1.0
        };

        for (const [type, partId] of Object.entries(this.equippedParts)) {
            const part = HARDWARE_PARTS[type].find(p => p.id === partId);
            if (part && part.stats) {
                if (part.stats.cooling) stats.cooling += part.stats.cooling;
                if (part.stats.noise) stats.noise += part.stats.noise;
                if (part.stats.style) stats.aesthetics += part.stats.style;
                if (part.stats.compute) stats.compute += part.stats.compute;
                if (part.stats.productivity) stats.productivity = Math.max(stats.productivity, part.stats.productivity); // Max, not add
                if (part.stats.reliability) stats.reliability *= part.stats.reliability; // Multiply for reliability
            }
        }
        return stats;
    }

    buyPart(type, partId) {
        if (this.ownedParts[type].includes(partId)) return { success: false, message: "Already owned" };

        const part = HARDWARE_PARTS[type].find(p => p.id === partId);
        if (!part) return { success: false, message: "Part not found" };

        if (this.gameState.money < part.price) return { success: false, message: "Not enough money" };

        this.gameState.money -= part.price;
        this.ownedParts[type].push(partId);
        this.equippedParts[type] = partId; // Auto-equip

        return { success: true, message: `Purchased ${part.name}!` };
    }

    equipPart(type, partId) {
        if (!this.ownedParts[type].includes(partId)) return { success: false, message: "Part not owned" };
        this.equippedParts[type] = partId;
        return { success: true, message: "Equipped" };
    }

    toJSON() {
        return {
            ownedParts: this.ownedParts,
            equippedParts: this.equippedParts
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.ownedParts = data.ownedParts || this.ownedParts;
        this.equippedParts = data.equippedParts || this.equippedParts;
    }
}