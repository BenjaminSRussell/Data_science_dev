/**
 * AISystem.js
 * Manages the player's AI Companion, hardware, and automation capabilities.
 */

export class AISystem {
    constructor(gameState) {
        this.gameState = gameState;

        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;

        // Core Stats
        this.intelligence = 1; // Reduces error rate / unlocks complex tasks
        this.speed = 1;        // Work multiplier
        this.creativity = 1;   // Bonus for Game Dev / Creative tasks

        // Hardware Inventory
        this.hardware = []; // [{ id: 'gpu_v100', name: 'NVIDIA V100', multiplier: 2.0 }]
        this.slots = 1;     // Max hardware slots (upgradeable)

        // State
        this.name = "Project Prometheus";
        this.isTraining = false;
    }

    /**
     * Calculate total processing power (Speed Multiplier)
     */
    get processingPower() {
        const hardwareBonus = this.hardware.reduce((sum, item) => sum + item.multiplier, 0);
        return (this.speed * 1.5) + (hardwareBonus * 2);
    }

    /**
     * Calculate intelligence rating (Quality Multiplier)
     */
    get intelligenceRating() {
        return this.intelligence + (this.level * 0.5);
    }

    /**
     * Train the AI
     * Consumes Data (from completed projects) or just Time?
     * Design: Consumes "Data Points" earned from projects.
     */
    train(dataPoints) {
        // For now, simple XP gain
        this.xp += dataPoints * 10;
        this.checkLevelUp();
        return { success: true, xpGained: dataPoints * 10 };
    }

    checkLevelUp() {
        if (this.xp >= this.xpToNextLevel) {
            this.level++;
            this.xp -= this.xpToNextLevel;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);

            // Random Stat Increase
            const roll = Math.random();
            if (roll < 0.4) this.intelligence++;
            else if (roll < 0.8) this.speed++;
            else this.creativity++;

            return true; // Levelled up
        }
        return false;
    }

    /**
     * Install Hardware
     */
    installHardware(item) {
        if (this.hardware.length >= this.slots) {
            return { success: false, reason: "No empty server slots!" };
        }
        this.hardware.push(item);
        return { success: true };
    }

    /**
     * Upgrade Server Rack
     */
    expandSlots() {
        // Cost logic handled in main or here?
        this.slots++;
    }

    toJSON() {
        return {
            level: this.level,
            xp: this.xp,
            intelligence: this.intelligence,
            speed: this.speed,
            creativity: this.creativity,
            hardware: this.hardware,
            slots: this.slots,
            name: this.name
        };
    }

    fromJSON(data) {
        if (!data) return;
        Object.assign(this, data);
    }
}
