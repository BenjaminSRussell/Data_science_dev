import { saveManager } from '../../data/SaveManager.js';
import { RANKS } from '../../data/ranks.js';

export class MenuLogoDisplay {
    constructor() {
        this.stats = [];
        this.currentStatIndex = 0;
        this.rotationInterval = null;
        this.update();
    }

    calculateStats() {
        this.stats = [];
        let totalPlaytime = 0;
        let highestRank = 0;
        let totalAchievements = 0;
        let gamesCompleted = 0;
        let totalMoney = 0;
        let totalTasksCompleted = 0;

        for (let i = 0; i < 5; i++) {
            const saveData = saveManager.getSaveData(i);
            if (saveData) {
                totalPlaytime += saveData.totalDays * 24;
                if (saveData.rankIndex > highestRank) {
                    highestRank = saveData.rankIndex;
                }
                totalAchievements += saveData.completedAchievements.length;
                if (saveData.rankIndex >= 6) {
                    gamesCompleted++;
                }
                totalMoney += saveData.money;
                totalTasksCompleted += saveData.tasksCompleted;
            }
        }

        if (totalPlaytime === 0 && highestRank === 0) {
            this.stats.push({ icon: 'Chart', label: 'Welcome', value: 'Start your career' });
        } else {
            const rankName = RANKS[highestRank]?.title || 'Data Entry Clerk';
            this.stats.push({ icon: 'Time', label: 'Playtime', value: this.formatPlaytime(totalPlaytime) });
            this.stats.push({ icon: 'Medal', label: 'Rank', value: rankName });
            this.stats.push({ icon: 'Check', label: 'Achievements', value: totalAchievements });
            this.stats.push({ icon: 'Game', label: 'Games Completed', value: gamesCompleted });
            this.stats.push({ icon: 'Dollar', label: 'Money', value: `$${totalMoney}` });
            this.stats.push({ icon: 'Tasks', label: 'Tasks Completed', value: totalTasksCompleted });
        }
    }

    formatPlaytime(hours) {
        if (hours < 24) {
            return `${Math.round(hours)}h`;
        } else if (hours < 168) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return `${days}d ${remainingHours}h`;
        } else {
            const weeks = Math.floor(hours / 168);
            const remainingDays = (hours % 168) / 24;
            return `${weeks}w ${Math.round(remainingDays)}d`;
        }
    }

    render() {
        const iconElement = document.querySelector('.menu-logo-icon');
        if (!iconElement) {
            setTimeout(() => this.render(), 100);
            return;
        }

        const currentStat = this.stats[this.currentStatIndex];
        iconElement.textContent = currentStat.icon;
        iconElement.title = currentStat.value;
        iconElement.setAttribute('data-stat-label', currentStat.label);
        iconElement.setAttribute('data-stat-value', currentStat.value);
    }

    startRotation() {
        if (this.stats.length <= 1) {
            return;
        }

        this.rotationInterval = setInterval(() => {
            this.currentStatIndex = (this.currentStatIndex + 1) % this.stats.length;
            this.render();
        }, 5000);
    }

    stopRotation() {
        clearInterval(this.rotationInterval);
        this.rotationInterval = null;
    }

    destroy() {
        this.stopRotation();
    }
}