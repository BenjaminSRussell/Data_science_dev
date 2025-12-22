/**
 * StatisticsAggregator - Aggregates statistics across all save slots
 */

import { RANKS } from '../data/ranks.js';

export class StatisticsAggregator {
    constructor(saveManager) {
        this.saveManager = saveManager;
        this.stats = null;
    }

    /**
     * Calculate aggregated statistics
     */
    calculate() {
        let totalPlaytime = 0;
        let gamesCompleted = 0;
        let highestRank = 0;
        let totalMoney = 0;
        let totalTasks = 0;
        let totalReputation = 0;
        let sessions = [];
        let averageSessionLength = 0;

        // Scan all save slots
        for (let i = 0; i < 5; i++) {
            const saveData = this.saveManager.getSaveData(i);
            if (saveData && saveData.state) {
                const state = saveData.state;
                
                // Calculate playtime (rough estimate: days * 24 hours)
                const days = state.timeManager?.totalDays || 0;
                const hours = days * 24; // Rough estimate
                totalPlaytime += hours;
                
                // Track highest rank
                if (state.rankIndex > highestRank) {
                    highestRank = state.rankIndex;
                }
                
                // Count completed games (reached max rank, index 6)
                if (state.rankIndex >= 6) {
                    gamesCompleted++;
                }
                
                // Sum money
                totalMoney += state.money || 0;
                
                // Sum tasks
                totalTasks += state.tasksCompleted || 0;
                
                // Sum reputation
                totalReputation += state.reputation || 0;
                
                // Track session info
                if (saveData.timestamp) {
                    sessions.push({
                        slotIndex: i,
                        lastPlayed: saveData.timestamp,
                        days: days,
                        rank: state.rankIndex
                    });
                }
            }
        }

        // Calculate average session length
        if (sessions.length > 0) {
            const totalDays = sessions.reduce((sum, s) => sum + s.days, 0);
            averageSessionLength = totalDays / sessions.length;
        }

        this.stats = {
            totalPlaytime,
            gamesCompleted,
            highestRank,
            highestRankName: RANKS[highestRank]?.title || 'Data Entry Clerk',
            totalMoney,
            totalTasks,
            totalReputation,
            sessions: sessions.length,
            averageSessionLength,
            lastUpdated: Date.now()
        };

        // Save to localStorage for quick access
        this.saveToLocalStorage();

        return this.stats;
    }

    /**
     * Get cached statistics
     */
    getStats() {
        if (!this.stats) {
            this.calculate();
        }
        return this.stats;
    }

    /**
     * Format playtime
     */
    formatPlaytime(hours) {
        if (hours < 1) {
            return '< 1h';
        } else if (hours < 24) {
            return `${Math.round(hours)}h`;
        } else if (hours < 168) {
            const days = Math.floor(hours / 24);
            const remainingHours = Math.round(hours % 24);
            return `${days}d ${remainingHours}h`;
        } else {
            const weeks = Math.floor(hours / 168);
            const days = Math.floor((hours % 168) / 24);
            return `${weeks}w ${days}d`;
        }
    }

    /**
     * Format money
     */
    formatMoney(amount) {
        if (amount < 1000) {
            return `$${amount.toLocaleString()}`;
        } else if (amount < 1000000) {
            return `$${(amount / 1000).toFixed(1)}K`;
        } else {
            return `$${(amount / 1000000).toFixed(2)}M`;
        }
    }

    /**
     * Save statistics to localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('gameStatistics', JSON.stringify(this.stats));
        } catch (error) {
            console.error('Failed to save statistics:', error);
        }
    }

    /**
     * Load statistics from localStorage
     */
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('gameStatistics');
            if (saved) {
                this.stats = JSON.parse(saved);
                return this.stats;
            }
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
        return null;
    }

    /**
     * Update statistics (recalculate)
     */
    update() {
        return this.calculate();
    }
}

