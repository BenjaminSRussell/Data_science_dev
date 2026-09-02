import { STATS, TRAINING_ACTIVITIES } from './Constants.js';

class CharacterStats {
    constructor() {
        this.stats = {
            python_sql: 1,
            statistics: 1,
            reputation: 1,
            intelligence: 1,
            charisma: 1,
            stamina: 1,
            focus: 1,
            luck: 1,
            analytics: 1
        };

        // XP needed per level (increases each level)
        this.xpPerLevel = 100;

        // Visual State
        this.visuals = {
            hair: 'messy', // messy, neat, slicked
            clothes: 'hoodie', // hoodie, cheap_suit, expensive_suit
            accessory: 'none', // none, glasses, sunglasses, watch
            bodyType: 'average', // average, fit, overweight
            age: 22
        };

        // Ethics tracking
        this.ethics = 50;
    }

    /**
     * Check for character evolution based on stats
     * @param {number} netWorth - Current player money/net worth
     */
    checkEvolution(netWorth) {
        let newStage = this.visualStage;

        // Level 2 Threshold: $5,000
        if (netWorth >= 5000 && this.visualStage === 'level_1') {
            newStage = this.ethics >= 50 ? 'level_2_good' : 'level_2_evil';
        }

        // Level 3 Threshold: $50,000
        else if (netWorth >= 50000 && this.visualStage.startsWith('level_2')) {
            newStage = this.ethics >= 50 ? 'level_3_good' : 'level_3_evil';
        }

        if (newStage !== this.visualStage) {
            this.visualStage = newStage;
            return { evolved: true, stage: newStage };
        }
        return { evolved: false };
    }

    modifyEthics(amount) {
        this.ethics = Math.max(-100, Math.min(100, this.ethics + amount));
        // Update visuals based on ethics?
        if (this.ethics < -50) this.visuals.clothes = 'expensive_suit'; // Evil rich
    }

    updateVisuals(money) {
        // Simple logic for now
        if (money > 100000) this.visuals.clothes = 'cheap_suit';
        if (money > 1000000) this.visuals.clothes = 'expensive_suit';

        // Age progression could be here too
    }

    /**
     * Get stat value
     */
    getStat(statId) {
        return this.stats[statId] || 0;
    }

    /**
     * Get stat details with effects
     */
    getStatDetails(statId) {
        const stat = STATS[statId];
        const value = this.stats[statId];
        const xp = this.xp[statId] || 0;
        const xpNeeded = this.getXPForNextLevel(statId);

        return {
            ...stat,
            value,
            xp,
            xpNeeded,
            progress: (xp / xpNeeded) * 100,
            effects: this.calculateEffects(statId, value)
        };
    }

    /**
     * Calculate XP needed for next level
     */
    getXPForNextLevel(statId) {
        const level = this.stats[statId];
        return Math.floor(this.xpPerLevel * Math.pow(1.1, level));
    }

    /**
     * Add experience to a stat
     */
    addExperience(statId, amount) {
        if (!STATS[statId]) return { leveled: false };

        if (!this.xp[statId]) this.xp[statId] = 0;
        this.xp[statId] += amount;

        let leveled = false;
        let levelsGained = 0;

        // Check for level ups
        while (this.xp[statId] >= this.getXPForNextLevel(statId)) {
            if (this.stats[statId] >= STATS[statId].maxLevel) {
                this.xp[statId] = this.getXPForNextLevel(statId);
                break;
            }

            this.xp[statId] -= this.getXPForNextLevel(statId);
            this.stats[statId]++;
            leveled = true;
            levelsGained++;
        }

        return { leveled, levelsGained, newLevel: this.stats[statId] };
    }

    /**
     * Calculate effect values for a stat at given level
     */
    calculateEffects(statId, level) {
        const stat = STATS[statId];
        if (!stat) return {};

        const effects = {};
        for (const [key, value] of Object.entries(stat.effects)) {
            if (typeof value === 'number') {
                effects[key] = value * level;
            } else if (Array.isArray(value)) {
                effects[key] = value.filter(v => level >= v).length;
            }
        }
        return effects;
    }

    /**
     * Perform training activity
     */
    train(activityId) {
        const activity = TRAINING_ACTIVITIES.find(a => a.id === activityId);
        if (!activity) return { success: false, reason: 'Invalid activity' };

        const results = {
            success: true,
            activity,
            gains: {},
            levelUps: []
        };

        // Apply stat gains
        for (const [statId, xpGain] of Object.entries(activity.stats)) {
            // XP gain scaled by luck
            const luckBonus = 1 + (this.stats.luck * 0.01);
            const actualGain = Math.floor(xpGain * 10 * luckBonus);

            const result = this.addExperience(statId, actualGain);
            results.gains[statId] = actualGain;

            if (result.leveled) {
                results.levelUps.push({
                    stat: statId,
                    newLevel: result.newLevel,
                    levelsGained: result.levelsGained
                });
            }
        }

        return results;
    }

    /**
     * Get all stats as array for UI
     */
    getAllStats() {
        return Object.keys(STATS).map(id => this.getStatDetails(id));
    }

    /**
     * Calculate total stat-based bonuses
     */
    getTotalBonuses() {
        return {
            chartQuality: this.stats.intelligence * 0.5 + this.stats.analytics * 0.3,
            taskSpeed: this.stats.focus * 0.8 + this.stats.stamina * 0.2,
            clientPay: this.stats.charisma * 0.5,
            bonusChance: this.stats.luck * 1,
            maxEnergy: 100 + this.stats.stamina,
            workSlots: 6 + Math.floor(this.stats.stamina / 20)
        };
    }

    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            stats: this.stats,
            xp: this.xp,
            experience: this.xp // Keep for backward compatibility
        };
    }

    /**
     * Load from saved data
     */
    fromJSON(data) {
        if (!data) return;
        this.stats = { ...this.stats, ...data.stats };
        // Handle both xp (new) and experience (old saves) for backward compatibility
        if (data.xp) {
            this.xp = { ...this.xp, ...data.xp };
        } else if (data.experience) {
            this.xp = { ...this.xp, ...data.experience };
        }
    }
}

export default CharacterStats;