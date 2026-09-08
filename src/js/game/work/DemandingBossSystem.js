/**
 * DemandBossSystem.js
 * Manages demanding boss behavior
 * High expectations, frequent tasks, pressure
 */

export class DemandingBossSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.boss = null;
        this.demandLevel = 50; // 0-100
        this.taskFrequency = 3; // Tasks per week
    }
    
    /**
     * Initialize boss
     */
    initializeBoss(bossData) {
        this.boss = {
            id: bossData.id || 'boss_default',
            name: bossData.name || 'Mr. Anderson',
            title: bossData.title || 'Department Head',
            personality: 'demanding',
            demandLevel: bossData.demandLevel || 70,
            satisfaction: 50
        };
        
        this.demandLevel = this.boss.demandLevel;
    }
    
    /**
     * Generate demanding task
     */
    generateTask() {
        const difficulty = this.calculateDifficulty();
        const deadline = this.calculateDeadline();
        const reward = this.calculateReward(difficulty);
        
        return {
            id: 'task_' + Date.now(),
            name: this.generateTaskName(),
            description: this.generateTaskDescription(),
            difficulty: difficulty,
            deadline: deadline,
            reward: reward,
            requirements: this.generateRequirements(),
            bossSatisfaction: this.boss.satisfaction
        };
    }
    
    /**
     * Calculate task difficulty based on demand level
     */
    calculateDifficulty() {
        const base = 30;
        const demandBonus = this.demandLevel * 0.5;
        return Math.min(100, base + demandBonus);
    }
    
    /**
     * Calculate deadline (demanding boss = shorter deadlines)
     */
    calculateDeadline() {
        const baseDays = 7;
        const demandReduction = this.demandLevel * 0.05;
        return Math.max(1, baseDays - demandReduction);
    }
    
    /**
     * Calculate reward
     */
    calculateReward(difficulty) {
        return difficulty * 10;
    }
    
    /**
     * Generate task name
     */
    generateTaskName() {
        const names = [
            'Urgent Data Analysis',
            'Critical Report Needed',
            'High-Priority Visualization',
            'Emergency Data Review',
            'Immediate Action Required'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }
    
    /**
     * Generate task description
     */
    generateTaskDescription() {
        return 'This needs to be done immediately. I expect nothing less than perfection.';
    }
    
    /**
     * Generate requirements
     */
    generateRequirements() {
        return [
            'High quality visualization',
            'Detailed analysis',
            'Professional presentation',
            'On-time delivery'
        ];
    }
    
    /**
     * Evaluate task completion
     */
    evaluateTask(task, quality, onTime) {
        let satisfactionChange = 0;
        
        if (quality >= 80) {
            satisfactionChange += 10;
        } else if (quality < 60) {
            satisfactionChange -= 15;
        }
        
        if (onTime) {
            satisfactionChange += 5;
        } else {
            satisfactionChange -= 10;
        }
        
        this.boss.satisfaction = Math.max(0, Math.min(100, this.boss.satisfaction + satisfactionChange));
        
        return {
            satisfaction: this.boss.satisfaction,
            change: satisfactionChange,
            message: this.getBossMessage(satisfactionChange)
        };
    }
    
    /**
     * Get boss message
     */
    getBossMessage(change) {
        if (change > 5) {
            return 'Good work. Keep it up.';
        } else if (change < -5) {
            return 'This is unacceptable. Do better.';
        } else {
            return 'Adequate. I expect more next time.';
        }
    }
    
    /**
     * Get boss dialogue
     */
    getBossDialogue() {
        if (this.boss.satisfaction < 30) {
            return 'Your performance has been disappointing. I need to see improvement immediately.';
        } else if (this.boss.satisfaction < 60) {
            return 'You are meeting expectations, but I know you can do better.';
        } else {
            return 'Good work. Continue at this level and we will discuss your future here.';
        }
    }
}

