/**
 * MenuLogoDisplay - Displays rotating statistics in the menu logo area
 */

import { RANKS } from '../data/ranks.js';

export class MenuLogoDisplay {
    constructor(saveManager) {
        this.saveManager = saveManager;
        this.currentStatIndex = 0;
        this.stats = [];
        this.rotationInterval = null;
        this.updateInterval = 3000; // 3 seconds
    }

    /**
     * Initialize logo display
     */
    init() {
        this.calculateStats();
        this.render();
        this.startRotation();
    }

    /**
     * Calculate statistics from all save slots
     */
    calculateStats() {
        let totalPlaytime = 0;
        let highestRank = 0;
        let totalAchievements = 0;
        let gamesCompleted = 0;
        let totalMoney = 0;
        let totalTasks = 0;

        // Scan all save slots
        for (let i = 0; i < 5; i++) {
            const saveData = this.saveManager.getSaveData(i);
            if (saveData && saveData.state) {
                const state = saveData.state;
                
                // Calculate playtime (rough estimate: days * 24 hours)
                const days = state.timeManager?.totalDays || 0;
                totalPlaytime += days * 24; // Rough estimate
                
                // Track highest rank
                if (state.rankIndex > highestRank) {
                    highestRank = state.rankIndex;
                }
                
                // Count achievements
                if (state.completedAchievements) {
                    totalAchievements += state.completedAchievements.length;
                }
                
                // Count completed games (reached max rank)
                if (state.rankIndex >= 6) {
                    gamesCompleted++;
                }
                
                // Sum money
                totalMoney += state.money || 0;
                
                // Sum tasks
                totalTasks += state.tasksCompleted || 0;
            }
        }

        // Get rank name
        const { RANKS } = require('../data/ranks.js');
        const rankName = RANKS[highestRank]?.title || 'Data Entry Clerk';

        // Format stats
        this.stats = [
            {
                icon: 'Time',
                label: 'Total Playtime',
                value: this.formatPlaytime(totalPlaytime)
            },
            {
                icon: 'Chart',
                label: 'Highest Rank',
                value: rankName
            },
            {
                icon: 'Trophy',
                label: 'Games Completed',
                value: gamesCompleted.toString()
            },
            {
                icon: 'Money',
                label: 'Total Money Earned',
                value: `$${totalMoney.toLocaleString()}`
            },
            {
                icon: 'Check',
                label: 'Total Tasks',
                value: totalTasks.toString()
            }
        ];

        // Only show stats if there's actual data
        if (totalPlaytime === 0 && highestRank === 0) {
            this.stats = [{
                icon: 'Chart',
                label: 'Welcome',
                value: 'Start your career'
            }];
        }
    }

    /**
     * Format playtime in hours
     */
    formatPlaytime(hours) {
        if (hours < 24) {
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
     * Render current stat in logo
     */
    render() {
        const logoIcon = document.querySelector('.menu-logo-icon');
        if (!logoIcon) {
            // Retry after a short delay if element not found
            setTimeout(() => this.render(), 100);
            return;
        }

        if (this.stats.length === 0) {
            logoIcon.textContent = 'DS';
            logoIcon.title = 'Data Science Tycoon';
            return;
        }

        const stat = this.stats[this.currentStatIndex];
        logoIcon.textContent = stat.icon;
        logoIcon.title = `${stat.label}: ${stat.value}`;
        
        // Add data attribute for styling
        logoIcon.setAttribute('data-stat-label', stat.label);
        logoIcon.setAttribute('data-stat-value', stat.value);
    }

    /**
     * Start stat rotation
     */
    startRotation() {
        if (this.stats.length <= 1) return;

        this.rotationInterval = setInterval(() => {
            this.currentStatIndex = (this.currentStatIndex + 1) % this.stats.length;
            this.render();
        }, this.updateInterval);

        // Also update on hover
        const logoIcon = document.querySelector('.menu-logo-icon');
        if (logoIcon) {
            logoIcon.addEventListener('click', () => {
                this.currentStatIndex = (this.currentStatIndex + 1) % this.stats.length;
                this.render();
            });
        }
    }

    /**
     * Stop stat rotation
     */
    stopRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
    }

    /**
     * Update stats (call when saves change)
     */
    update() {
        this.calculateStats();
        this.render();
    }
}

