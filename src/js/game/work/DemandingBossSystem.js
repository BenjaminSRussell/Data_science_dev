/**
 * DemandingBossSystem - Handles the generation of demanding tasks for high-level bosses.
 */

export class DemandingBossSystem {
    constructor() {
        this.boss = {
            id: '',
            name: 'Mr. Anderson',
            title: '',
            demandLevel: 0
        };
        this.demandLevel = this.boss.demandLevel;
    }

    initializeBoss({ id, name = 'Mr. Anderson', title, demandLevel }) {
        this.boss.id = id;
        this.boss.name = name;
        this.boss.title = title;
        this.boss.demandLevel = demandLevel;
        this.demandLevel = this.boss.demandLevel;
    }

    calculateDifficulty() {
        const baseDifficulty = 30;
        const maxDifficulty = 100;
        const difficulty = baseDifficulty + (this.demandLevel * 0.5);
        return Math.min(difficulty, maxDifficulty);
    }

    calculateDeadline() {
        const baseDeadline = 7;
        const minDeadline = 1;
        const deadline = baseDeadline - (this.demandLevel * 0.05);
        return Math.max(deadline, minDeadline);
    }

    calculateReward(difficulty) {
        return difficulty * 10;
    }

    generateTask() {
        const taskTemplates = [
            'Debug critical system bug',
            'Optimize database query performance',
            'Implement new security feature',
            'Create comprehensive documentation',
            'Conduct code review and refactor'
        ];

        const taskId = `task_${Date.now()}`;
        const taskName = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
        const difficulty = this.calculateDifficulty();
        const deadline = this.calculateDeadline();
        const reward = this.calculateReward(difficulty);

        return {
            id: taskId,
            name: taskName,
            difficulty,
            deadline,
            reward
        };
    }
}