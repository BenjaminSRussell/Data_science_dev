/**
 * DemandBossSystem.js
 * Manages demanding boss behavior
 * High expectations, frequent tasks, pressure
 */

import { pickState, applyState } from '../../utils/StateSerializer.js';

export class DemandingBossSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.boss = null;
        this.demandLevel = 50; // 0-100
        this.taskFrequency = 3; // Tasks per week
        this.satisfaction = 50; // Boss satisfaction
    }
    
    /**
     * Initialize boss
     */
    initializeBoss(bossData = {}) {
        bossData = bossData || {};
        this.boss = {
            id: bossData.id || 'boss_default',
            name: bossData.name || 'Mr. Anderson',
            title: bossData.title || 'Department Head',
            personality: 'demanding',
            // ?? so an explicit demandLevel of 0 is kept. Otherwise the
            // player's difficulty setting decides (#1251)
            demandLevel: bossData.demandLevel ?? this.getDifficultySettings()?.bossDemand ?? 70,
            satisfaction: this.satisfaction
        };
        
        this.demandLevel = this.boss.demandLevel;
    }
    
    /**
     * GameplaySettings' difficulty block is the one source of truth for boss
     * demand and task frequency (#1251)
     */
    getDifficultySettings() {
        const d = this.gameState?.gameplaySettings?.settings?.difficulty;
        return d && typeof d === 'object' ? d : null;
    }

    /**
     * Pull the current difficulty settings into the boss. Returns false when
     * there are no settings to follow.
     */
    syncDifficultyFromSettings() {
        const d = this.getDifficultySettings();
        if (!d) return false;
        if (Number.isFinite(d.bossDemand)) {
            this.demandLevel = Math.max(0, Math.min(100, d.bossDemand));
            if (this.boss) this.boss.demandLevel = this.demandLevel;
        }
        if (Number.isFinite(d.taskFrequency) && d.taskFrequency > 0) {
            this.taskFrequency = d.taskFrequency;
        }
        return true;
    }

    /**
     * Generate demanding task
     */
    generateTask() {
        this.syncDifficultyFromSettings();
        const difficulty = this.calculateDifficulty();
        const deadline = this.calculateDeadline();
        const reward = this.calculateReward(difficulty);
        
        return {
            id: `task_${Date.now()}_${(this.taskSeq = (this.taskSeq || 0) + 1)}`,
            name: this.generateTaskName(),
            description: this.generateTaskDescription(),
            difficulty: difficulty,
            deadline: deadline,
            reward: reward,
            requirements: this.generateRequirements(),
            bossSatisfaction: this.satisfaction
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
        
        this.satisfaction = Math.max(0, Math.min(100, this.satisfaction + satisfactionChange));
        // Keep the boss record's copy in sync with the system value
        if (this.boss) this.boss.satisfaction = this.satisfaction;
        
        return {
            satisfaction: this.satisfaction,
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
        if (this.satisfaction < 30) {
            return 'Your performance has been disappointing. I need to see improvement immediately.';
        } else if (this.satisfaction < 60) {
            return 'You are meeting expectations, but I know you can do better.';
        } else {
            return 'Good work. Continue at this level and we will discuss your future here.';
        }
    }

    /**
     * Serialize player-visible state for saving
     */
    toJSON() {
        return pickState(this, ['boss', 'demandLevel', 'taskFrequency', 'satisfaction']);
    }

    /**
     * Restore state from a save (missing fields keep constructor defaults)
     */
    fromJSON(data) {
        if (!data) return;
        applyState(this, data, ['boss', 'demandLevel', 'taskFrequency', 'satisfaction']);
    }
}
