class CharacterStats {
    constructor() {
        this.stats = {
            intelligence: { id: 'intelligence', name: 'Intelligence', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 },
            focus: { id: 'focus', name: 'Focus', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 },
            stamina: { id: 'stamina', name: 'Stamina', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 },
            luck: { id: 'luck', name: 'Luck', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 },
            analytics: { id: 'analytics', name: 'Analytics', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 },
            charisma: { id: 'charisma', name: 'Charisma', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 }
        };

        this.xp = {
            intelligence: 0,
            focus: 0,
            stamina: 0,
            luck: 0,
            analytics: 0,
            charisma: 0
        };

        this.xpPerLevel = 100;

        this.visuals = {
            hair: 'messy', // messy, neat, slicked
            clothes: 'hoodie', // hoodie, cheap_suit, expensive_suit
            accessory: 'none', // none, glasses, sunglasses, watch
            bodyType: 'average', // average, fit, overweight
            age: 22
        };

        this.visualStage = 'level_1';
        this.ethics = 0;
    }

    checkEvolution(netWorth) {
        let newStage = this.visualStage;

        if (netWorth >= 5000 && this.visualStage === 'level_1') {
            newStage = this.ethics >= 50 ? 'level_2_good' : 'level_2_evil';
        }

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
        if (this.ethics < -50) this.visuals.clothes = 'expensive_suit';
    }

    getStat(statId) {
        return this.stats[statId] || 0;
    }

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

    getXPForNextLevel(statId) {
        const level = this.stats[statId];
        return Math.floor(this.xpPerLevel * Math.pow(1.1, level));
    }

    addExperience(statId, amount) {
        if (!STATS[statId]) return { leveled: false };

        if (!this.xp[statId]) this.xp[statId] = 0;
        this.xp[statId] += amount;

        let leveled = false;
        let levelsGained = 0;

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

    train(activityId) {
        const activity = TRAINING_ACTIVITIES.find(a => a.id === activityId);
        if (!activity) return { success: false, reason: 'Invalid activity' };

        const results = {
            success: true,
            activity,
            gains: {},
            levelUps: []
        };

        for (const [statId, xpGain] of Object.entries(activity.stats)) {
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

    getAllStats() {
        return Object.keys(STATS).map(id => this.getStatDetails(id));
    }

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

    toJSON() {
        return {
            stats: this.stats,
            xp: this.xp,
            experience: this.xp
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.stats = { ...this.stats, ...data.stats };
        if (data.xp) {
            this.xp = { ...this.xp, ...data.xp };
        } else if (data.experience) {
            this.xp = { ...this.xp, ...data.experience };
        }
    }
}