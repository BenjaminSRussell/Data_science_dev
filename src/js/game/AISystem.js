/**
 * AISystem.js
 * Manages the player's AI Companion, hardware, and automation capabilities.
 */

import { trainingXpMultiplier, creativityBonus } from './LibraryEffects.js';

/** Cleaning-bug chance removed per intelligenceRating point (#1806). */
export const INTELLIGENCE_ERROR_CUT = 0.02;
/** Modeling stages get half the rating as extra work; cleaning gets all of it. */
export const MODELING_INTELLIGENCE_FACTOR = 0.5;

export class AISystem {
    constructor(gameState) {
        this.gameState = gameState;

        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;

        // Core Stats
        this.intelligence = 1; // Cleaning error rate / complex-task gate (#1806)
        this.speed = 1;        // Work multiplier
        this.creativity = 1;   // Bonus for Game Dev / Creative tasks

        // Hardware Inventory
        this.hardware = []; // [{ id: 'gpu_v100', name: 'NVIDIA V100', multiplier: 2.0 }]
        this.slots = 1;     // Max hardware slots (upgradeable)

        // State
        this.name = "Project Prometheus";
        // Training is a one-shot action (train()), so there is no in-progress
        // flag; the old isTraining was never set or read (#1808)
        // Data Points earned from completed projects, spent on training (#1807)
        this.dataPoints = 0;
    }

    /**
     * Calculate total processing power (Speed Multiplier)
     */
    get processingPower() {
        const hardwareBonus = this.hardware.reduce((sum, item) => sum + item.multiplier, 0);
        return (this.speed * 1.5) + (hardwareBonus * 2);
    }

    /**
     * Quality / error-rate rating. Project work and the complex-contract
     * gate both read this (#1806); the raw intelligence stat is what the
     * office UI prints.
     */
    get intelligenceRating() {
        return this.intelligence + (this.level * 0.5);
    }

    /**
     * Stage-specific effect of intelligenceRating (#1806).
     * cleaning: full rating added to work, and the same rating cuts bug chance.
     * modeling: half rating added to work (complex tasks).
     * scraping / game_dev: none — those are speed and creativity.
     */
    modifiersForStage(stage) {
        const rating = Number(this.intelligenceRating);
        const safe = Number.isFinite(rating) && rating > 0 ? rating : 0;
        if (stage?.type === 'cleaning') {
            return { work: safe, errorCut: safe * INTELLIGENCE_ERROR_CUT };
        }
        if (stage?.type === 'modeling') {
            return { work: safe * MODELING_INTELLIGENCE_FACTOR, errorCut: 0 };
        }
        return { work: 0, errorCut: 0 };
    }

    /**
     * Creativity including PyTorch's +2. The stored stat stays the base so
     * a save/load does not stack the bonus (#2418).
     */
    getEffectiveCreativity() {
        return (Number(this.creativity) || 0) + creativityBonus(this.gameState);
    }

    /**
     * Train the AI
     * Consumes Data (from completed projects) or just Time?
     * Design: Consumes "Data Points" earned from projects.
     */
    train(dataPoints) {
        // TensorFlow makes the same data worth 50% more XP (#2418)
        const points = Math.max(0, Number(dataPoints) || 0);
        const xpGained = Math.floor(points * 10 * trainingXpMultiplier(this.gameState));
        this.xp += xpGained;
        let levelsGained = 0;
        while (this.checkLevelUp()) levelsGained++;
        return { success: true, xpGained, leveledUp: levelsGained > 0, levelsGained };
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
            xpToNextLevel: this.xpToNextLevel,
            intelligence: this.intelligence,
            speed: this.speed,
            creativity: this.creativity,
            hardware: this.hardware,
            slots: this.slots,
            name: this.name,
            dataPoints: this.dataPoints
        };
    }

    fromJSON(data) {
        if (!data) return;
        // Older saves carry a stale isTraining flag; drop it (#1808)
        const { gameState, isTraining, ...rest } = data;
        Object.assign(this, rest);
        // Older saves didn't store xpToNextLevel; derive it from level instead of
        // keeping the level-1 default (#1804)
        if (data.xpToNextLevel === undefined) {
            let threshold = 100;
            for (let lvl = 1; lvl < (this.level || 1); lvl++) threshold = Math.floor(threshold * 1.5);
            this.xpToNextLevel = threshold;
        }
    }
}
