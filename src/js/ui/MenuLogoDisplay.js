/**
 * MenuLogoDisplay - Displays rotating statistics in the menu logo area
 */

import { RANKS } from '../data/ranks.js';
import { StatisticsAggregator } from './StatisticsAggregator.js';

export class MenuLogoDisplay {
    constructor(saveManager, aggregator = null) {
        this.saveManager = saveManager;
        // Same numbers as the stats dashboard: one aggregator, one playtime formula (#1629)
        this.aggregator = aggregator || new StatisticsAggregator(saveManager);
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
        const totals = this.aggregator.getStats();
        const totalPlaytime = totals.totalPlaytime || 0;
        const highestRank = totals.highestRank || 0;
        const gamesCompleted = totals.gamesCompleted || 0;
        const totalMoney = totals.totalMoney || 0;
        const totalTasks = totals.totalTasks || 0;

        // Achievements aren't in the aggregator; count them per distinct playthrough
        let totalAchievements = 0;
        for (const { saveData } of this.aggregator.getDistinctSaves()) {
            const done = saveData.state.completedAchievements;
            if (Array.isArray(done)) totalAchievements += done.length;
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
        return this.aggregator.formatPlaytime(hours);
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