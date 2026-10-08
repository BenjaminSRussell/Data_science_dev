/**
 * DemandBossSystem.js
 * Manages demanding boss behavior
 * High expectations, frequent tasks, pressure
 */

import { pickState, applyState } from '../../utils/StateSerializer.js';

export class DemandingBossSystem {
    static PRAISE_AT = 80;
    static ANGRY_AT = 20;
    static REPUTATION_SWING = 5;

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

        // The task matters (#1777): nailing a hard task impresses more, and
        // stumbling on one is forgiven a little; easy tasks are the reverse.
        satisfactionChange = Math.round(satisfactionChange * DemandingBossSystem.difficultyFactor(task, satisfactionChange));
        
        const before = this.satisfaction;
        this.satisfaction = Math.max(0, Math.min(100, this.satisfaction + satisfactionChange));
        // Keep the boss record's copy in sync with the system value
        if (this.boss) this.boss.satisfaction = this.satisfaction;
        
        return {
            satisfaction: this.satisfaction,
            change: satisfactionChange,
            message: this.getBossMessage(satisfactionChange),
            consequence: this.applyConsequences(before, this.satisfaction)
        };
    }

    /**
     * Multiplier on a satisfaction swing from the task's difficulty (0-100,
     * as calculateDifficulty produces). Neutral (1.0) when unknown.
     */
    static difficultyFactor(task, change) {
        let d = Number(task?.difficulty);
        if (!Number.isFinite(d) || d <= 0) return 1;
        const hardness = (Math.min(100, d) - 50) / 100; // -0.5 .. +0.5
        return change >= 0 ? 1 + hardness : 1 - hardness;
    }

    /**
     * Satisfaction now touches the player's game (#1779): crossing into
     * "impressed" earns reputation, crossing into "furious" costs some.
     */
    applyConsequences(before, after) {
        const gs = this.gameState;
        if (!gs) return null;
        const { PRAISE_AT, ANGRY_AT, REPUTATION_SWING } = DemandingBossSystem;
        if (before < PRAISE_AT && after >= PRAISE_AT) {
            gs.reputation = (Number(gs.reputation) || 0) + REPUTATION_SWING;
            return { type: 'praise', reputation: REPUTATION_SWING,
                message: `${this.boss?.name || 'Your boss'} is impressed: +${REPUTATION_SWING} reputation.` };
        }
        if (before > ANGRY_AT && after <= ANGRY_AT) {
            gs.reputation = Math.max(0, (Number(gs.reputation) || 0) - REPUTATION_SWING);
            return { type: 'warning', reputation: -REPUTATION_SWING,
                message: `${this.boss?.name || 'Your boss'} is furious: -${REPUTATION_SWING} reputation. Turn it around.` };
        }
        return null;
    }

    /**
     * Feed a finished Chart Studio task back to the boss (#1014). Quality is
     * the star rating as a percentage; onTime respects the effective limit.
     */
    recordTaskResult(task, score, { now = Date.now(), timeLimit = null } = {}) {
        if (!task || !score) return null;
        const quality = Math.max(0, Math.min(100, (Number(score.stars) || 0) * 20));
        const limit = Number(timeLimit ?? task.timeLimit) || 0;
        const onTime = !limit || !task.startTime || (now - task.startTime) / 1000 <= limit;
        return this.evaluateTask(task, quality, onTime);
    }
    
    /**
     * Get boss message
     */
    getBossMessage(change) {
        // >= so decent work delivered on time (+5) counts as good (#1780)
        if (change >= 5) {
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
