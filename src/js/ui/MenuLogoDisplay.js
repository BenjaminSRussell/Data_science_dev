/**
 * MenuLogoDisplay - Displays rotating statistics in the menu logo area
 */

import { RANKS } from '../data/ranks.js';
import { MAX_SAVE_SLOTS } from '../save/SaveManager.js';

export class MenuLogoDisplay {
    constructor(saveManager) {
        this.saveManager = saveManager;
        this.currentStatIndex = 0;
        this.stats = [];
        this.rotationInterval = null;
        this.updateInterval = 3000; // 3 seconds
        this.renderRetryTimer = null;
        this.renderRetries = 0;
        this.maxRenderRetries = 50; // ~5s of waiting for the logo element
        this.clickTarget = null;
        this.onLogoClick = () => this.advance();
    }

    /**
     * Show the next stat
     */
    advance() {
        if (this.stats.length === 0) return;
        this.currentStatIndex = (this.currentStatIndex + 1) % this.stats.length;
        this.render();
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
        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
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
            },
            {
                icon: 'Achievement',
                label: 'Total Achievements',
                value: totalAchievements.toString()
            }
        ];

        // Only show the welcome entry when no save has any progress at all;
        // money, tasks or achievements on a rank-0 save still count
        if (totalPlaytime === 0 && highestRank === 0 && totalMoney === 0 && totalTasks === 0 && totalAchievements === 0) {
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
            // Retry after a short delay if element not found, but give up
            // eventually instead of polling forever
            if (!this.renderRetryTimer && this.renderRetries < this.maxRenderRetries) {
                this.renderRetries++;
                this.renderRetryTimer = setTimeout(() => {
                    this.renderRetryTimer = null;
                    this.render();
                }, 100);
            }
            return;
        }
        this.renderRetries = 0;

        if (this.stats.length === 0) {
            logoIcon.textContent = 'DS';
            logoIcon.title = 'Data Science Tycoon';
            return;
        }

        // Stats can shrink on update(); keep the index in range
        if (this.currentStatIndex >= this.stats.length) this.currentStatIndex = 0;
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

        // Never run two intervals at once
        this.stopRotation();
        this.rotationInterval = setInterval(() => this.advance(), this.updateInterval);

        // Clicking the logo also advances; bind once so repeated starts don't
        // make one click skip several stats
        const logoIcon = document.querySelector('.menu-logo-icon');
        if (logoIcon && this.clickTarget !== logoIcon) {
            this.clickTarget?.removeEventListener('click', this.onLogoClick);
            logoIcon.addEventListener('click', this.onLogoClick);
            this.clickTarget = logoIcon;
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
     * Cleanup - stop rotation when destroyed
     */
    destroy() {
        this.stopRotation();
        if (this.renderRetryTimer) {
            clearTimeout(this.renderRetryTimer);
            this.renderRetryTimer = null;
        }
        this.clickTarget?.removeEventListener('click', this.onLogoClick);
        this.clickTarget = null;
    }

    /**
     * Update stats (call when saves change)
     */
    update() {
        this.calculateStats();
        this.render();
    }
}