/**
 * Character Stats System - RPG-style character progression
 * Stats affect gameplay outcomes and unlock abilities
 */

// Character stat definitions
export const STATS = {
    intelligence: {
        id: 'intelligence',
        name: 'Intelligence',
        icon: '',
        color: '#4ecdc4',
        description: 'Affects chart quality and complex analysis',
        maxLevel: 100,
        effects: {
            chartQuality: 0.5,     // +0.5% per point
            analysisSpeed: 0.3,   // +0.3% per point
            unlockAdvanced: 50    // Unlock advanced features at 50
        }
    },
    charisma: {
        id: 'charisma',
        name: 'Charisma',
        icon: '',
        color: '#a855f7',
        description: 'Better negotiations and relationships',
        maxLevel: 100,
        effects: {
            clientPay: 0.5,        // +0.5% pay per point
            relationshipGain: 1,  // +1% relationship gain
            unlockVC: 60          // Unlock VC path at 60
        }
    },
    stamina: {
        id: 'stamina',
        name: 'Stamina',
        icon: '',
        color: '#ff6b9d',
        description: 'Work more hours without fatigue',
        maxLevel: 100,
        effects: {
            maxEnergy: 1,         // +1 max energy per point
            recoveryRate: 0.2,    // +0.2% recovery
            workHours: 0.05       // +0.05 extra time slots
        }
    },
    focus: {
        id: 'focus',
        name: 'Focus',
        icon: '',
        color: '#ffd93d',
        description: 'Complete tasks faster',
        maxLevel: 100,
        effects: {
            taskSpeed: 0.8,       // +0.8% task speed per point
            errorReduction: 0.3, // -0.3% errors
            multitask: 30         // Unlock multitasking at 30
        }
    },
    luck: {
        id: 'luck',
        name: 'Luck',
        icon: '',
        color: '#6bcb77',
        description: 'Random bonuses and market wins',
        maxLevel: 50, // Luck caps lower
        effects: {
            bonusChance: 1,       // +1% bonus event chance
            marketTiming: 0.5,    // +0.5% better market timing
            rareClients: 0.3      // +0.3% rare client chance
        }
    },
    analytics: {
        id: 'analytics',
        name: 'Analytics',
        icon: '',
        color: '#ff8548',
        description: 'Unlock advanced chart types and tools',
        maxLevel: 100,
        effects: {
            chartTypes: [10, 25, 40, 60, 80], // Unlock levels
            dataInsights: 0.5,    // +0.5% insight quality
            automation: 70        // Unlock automation at 70
        }
    }
};

// Training activities that improve stats
export const TRAINING_ACTIVITIES = [
    {
        id: 'study_books',
        name: 'Study Books',
        icon: '',
        location: 'library',
        stats: { intelligence: 2, analytics: 1 },
        cost: 0,
        timeSlots: 2,
        energyCost: 15,
        description: 'Read data science textbooks'
    },
    {
        id: 'online_course',
        name: 'Online Course',
        icon: '',
        location: 'home',
        stats: { intelligence: 3, analytics: 2 },
        cost: 50,
        timeSlots: 2,
        energyCost: 20,
        description: 'Take an online tutorial'
    },
    {
        id: 'gym_workout',
        name: 'Gym Workout',
        icon: '',
        location: 'gym',
        stats: { stamina: 3, focus: 1 },
        cost: 20,
        timeSlots: 1,
        energyCost: 25,
        description: 'Build physical endurance'
    },
    {
        id: 'meditation',
        name: 'Meditation',
        icon: '',
        location: 'home',
        stats: { focus: 3, stamina: 1 },
        cost: 0,
        timeSlots: 1,
        energyCost: -10, // Restores energy!
        description: 'Clear your mind and focus'
    },
    {
        id: 'networking_event',
        name: 'Networking Event',
        icon: '',
        location: 'networking_bar',
        stats: { charisma: 3, luck: 1 },
        cost: 30,
        timeSlots: 2,
        energyCost: 20,
        description: 'Meet industry professionals'
    },
    {
        id: 'presentation_practice',
        name: 'Presentation Practice',
        icon: '',
        location: 'home',
        stats: { charisma: 2, intelligence: 1 },
        cost: 0,
        timeSlots: 1,
        energyCost: 15,
        description: 'Practice your pitch'
    },
    {
        id: 'data_challenges',
        name: 'Data Challenges',
        icon: '',
        location: 'home',
        stats: { analytics: 3, intelligence: 1 },
        cost: 0,
        timeSlots: 2,
        energyCost: 25,
        description: 'Solve Kaggle competitions'
    },
    {
        id: 'coffee_network',
        name: 'Coffee Meetup',
        icon: '',
        location: 'coffee_shop',
        stats: { charisma: 1, luck: 1 },
        cost: 10,
        timeSlots: 1,
        energyCost: 5,
        description: 'Casual networking over coffee'
    },
    {
        id: 'certification_study',
        name: 'Certification Study',
        icon: '',
        location: 'university',
        stats: { analytics: 4, intelligence: 2 },
        cost: 100,
        timeSlots: 3,
        energyCost: 30,
        description: 'Study for professional certification'
    }
];

/**
 * CharacterStats class - manages player stats and training
 */
export class CharacterStats {
    constructor() {
        // Core stats (0-100)
        this.stats = {
            intelligence: 10,
            charisma: 10,
            stamina: 100, // Max energy
            focus: 10,
            luck: 10,
            analytics: 10
        };

        // Moral Alignment (-100 to 100)
        // -100: Pure Evil (Wolf of Wall Street)
        // 0: Neutral
        // +100: Saint
        this.ethics = 50; // 0 (Evil) to 100 (Saint)
        this.level = 1;
        this.visualStage = 'level_1'; // level_1, level_2_good, level_2_evil, etc.

        // Define Skills
        this.skills = {
            python: { id: 'python', name: 'Python', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 },
            sql: { id: 'sql', name: 'SQL', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 },
            statistics: { id: 'statistics', name: 'Statistics', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 },
            machine_learning: { id: 'machine_learning', name: 'Machine Learning', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 },
            communication: { id: 'communication', name: 'Communication', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 },
            charisma: { id: 'charisma', name: 'Charisma', value: 0, maxLevel: 100, xp: 0, xpNeeded: 100 }
        };

        // Experience points for each stat
        this.xp = {
            intelligence: 0,
            charisma: 0,
            focus: 0,
            luck: 0,
            analytics: 0
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
