/**
 * JobSystem.js
 * Hundreds of real-world jobs and tasks that evolve with career progression
 */

export const JOB_CATEGORIES = {
    entry_level: {
        name: 'Entry Level',
        minReputation: 0,
        tasks: [
            {
                id: 'data_entry',
                name: 'Data Entry',
                description: 'Enter customer data into spreadsheet',
                difficulty: 1,
                timeRequired: 2,
                basePay: 50,
                skills: ['focus'],
                xpReward: { focus: 5 },
                realWorld: 'You spend hours typing numbers into Excel. Your back hurts, but the work is steady.'
            },
            {
                id: 'spreadsheet_cleanup',
                name: 'Clean Up Spreadsheet',
                description: 'Remove duplicates and fix formatting errors',
                difficulty: 1,
                timeRequired: 3,
                basePay: 75,
                skills: ['focus', 'intelligence'],
                xpReward: { focus: 8, intelligence: 3 },
                realWorld: 'The spreadsheet is a mess. You find 200 duplicate entries and inconsistent date formats.'
            },
            {
                id: 'customer_survey',
                name: 'Compile Customer Survey Results',
                description: 'Organize survey responses into categories',
                difficulty: 2,
                timeRequired: 4,
                basePay: 100,
                skills: ['intelligence'],
                xpReward: { intelligence: 10 },
                realWorld: '500 survey responses, half are incomplete. You categorize what you can.'
            }
        ]
    },
    junior_analyst: {
        name: 'Junior Analyst',
        minReputation: 100,
        tasks: [
            {
                id: 'sales_report',
                name: 'Create Monthly Sales Report',
                description: 'Analyze sales data and create summary report',
                difficulty: 3,
                timeRequired: 6,
                basePay: 200,
                skills: ['intelligence', 'analytics'],
                xpReward: { intelligence: 15, analytics: 10 },
                realWorld: 'You discover sales dropped 15% in Q3. Your boss wants answers by Friday.'
            },
            {
                id: 'customer_segmentation',
                name: 'Customer Segmentation Analysis',
                description: 'Group customers by purchasing behavior',
                difficulty: 4,
                timeRequired: 8,
                basePay: 300,
                skills: ['intelligence', 'analytics'],
                xpReward: { intelligence: 20, analytics: 15 },
                realWorld: 'You identify three distinct customer groups. One group is leaving for competitors.'
            },
            {
                id: 'website_analytics',
                name: 'Website Traffic Analysis',
                description: 'Analyze website visitor patterns',
                difficulty: 3,
                timeRequired: 5,
                basePay: 180,
                skills: ['analytics'],
                xpReward: { analytics: 12 },
                realWorld: 'Bounce rate is 70%. Users leave within 10 seconds. Something\'s wrong.'
            }
        ]
    },
    data_analyst: {
        name: 'Data Analyst',
        minReputation: 300,
        tasks: [
            {
                id: 'churn_prediction',
                name: 'Predict Customer Churn',
                description: 'Build model to predict which customers will leave',
                difficulty: 6,
                timeRequired: 12,
                basePay: 500,
                skills: ['intelligence', 'analytics'],
                xpReward: { intelligence: 30, analytics: 25 },
                realWorld: 'Your model predicts 200 customers will churn next month. Management needs a plan.'
            },
            {
                id: 'pricing_optimization',
                name: 'Pricing Strategy Analysis',
                description: 'Analyze optimal pricing for products',
                difficulty: 7,
                timeRequired: 10,
                basePay: 600,
                skills: ['intelligence', 'analytics', 'charisma'],
                xpReward: { intelligence: 25, analytics: 20, charisma: 10 },
                realWorld: 'Current pricing is losing us money. You find the sweet spot, but it means raising prices 20%.'
            },
            {
                id: 'ab_test_analysis',
                name: 'A/B Test Results Analysis',
                description: 'Analyze which version performs better',
                difficulty: 5,
                timeRequired: 8,
                basePay: 400,
                skills: ['analytics', 'intelligence'],
                xpReward: { analytics: 20, intelligence: 15 },
                realWorld: 'Version B converts 34% better, but the design team hates it. Politics ensue.'
            }
        ]
    },
    senior_analyst: {
        name: 'Senior Analyst',
        minReputation: 600,
        tasks: [
            {
                id: 'fraud_detection',
                name: 'Fraud Detection System',
                description: 'Build system to detect fraudulent transactions',
                difficulty: 9,
                timeRequired: 20,
                basePay: 1200,
                skills: ['intelligence', 'analytics'],
                xpReward: { intelligence: 50, analytics: 40 },
                realWorld: 'You catch $50k in fraud, but the false positives are annoying customers. Balance is hard.'
            },
            {
                id: 'supply_chain_optimization',
                name: 'Supply Chain Optimization',
                description: 'Optimize inventory and logistics',
                difficulty: 8,
                timeRequired: 16,
                basePay: 1000,
                skills: ['intelligence', 'analytics'],
                xpReward: { intelligence: 40, analytics: 35 },
                realWorld: 'You reduce inventory costs by 30%, but one warehouse manager loses their job. Guilt weighs on you.'
            },
            {
                id: 'market_research',
                name: 'Market Research & Competitive Analysis',
                description: 'Analyze market trends and competitors',
                difficulty: 7,
                timeRequired: 14,
                basePay: 900,
                skills: ['intelligence', 'charisma'],
                xpReward: { intelligence: 35, charisma: 20 },
                realWorld: 'You discover a competitor is about to launch something that will destroy our market share.'
            }
        ]
    },
    lead_scientist: {
        name: 'Lead Data Scientist',
        minReputation: 1200,
        tasks: [
            {
                id: 'ml_model_production',
                name: 'Deploy ML Model to Production',
                description: 'Take model from prototype to production',
                difficulty: 10,
                timeRequired: 30,
                basePay: 2000,
                skills: ['intelligence', 'analytics'],
                xpReward: { intelligence: 60, analytics: 50 },
                realWorld: 'The model works perfectly in testing, but production data is different. Everything breaks.'
            },
            {
                id: 'recommendation_engine',
                name: 'Build Recommendation Engine',
                description: 'Create personalized product recommendations',
                difficulty: 9,
                timeRequired: 25,
                basePay: 1800,
                skills: ['intelligence', 'analytics'],
                xpReward: { intelligence: 55, analytics: 45 },
                realWorld: 'Your recommendations increase sales 40%, but some customers complain about privacy.'
            },
            {
                id: 'predictive_maintenance',
                name: 'Predictive Maintenance System',
                description: 'Predict when equipment will fail',
                difficulty: 10,
                timeRequired: 28,
                basePay: 1900,
                skills: ['intelligence', 'analytics'],
                xpReward: { intelligence: 58, analytics: 48 },
                realWorld: 'You prevent $2M in downtime, but maintenance workers fear for their jobs.'
            }
        ]
    },
    // Tiers for the last two ranks in ranks.js (#953)
    principal_scientist: {
        name: 'Principal Scientist',
        minReputation: 2500,
        tasks: [
            {
                id: 'research_agenda',
                name: 'Set the Research Agenda',
                description: 'Decide which ML bets the company makes next year',
                difficulty: 12,
                timeRequired: 35,
                basePay: 3000,
                skills: ['intelligence', 'analytics'],
                xpReward: { intelligence: 70, analytics: 60 },
                realWorld: 'Three teams want funding for three incompatible ideas. You can only pick one.'
            },
            {
                id: 'causal_inference_platform',
                name: 'Causal Inference Platform',
                description: 'Build tooling so every team can run trustworthy experiments',
                difficulty: 12,
                timeRequired: 40,
                basePay: 3200,
                skills: ['analytics', 'intelligence'],
                xpReward: { analytics: 70, intelligence: 55 },
                realWorld: 'Half the past A/B tests turn out to be underpowered. Some launches need revisiting.'
            },
            {
                id: 'mentor_staff',
                name: 'Mentor the Senior Staff',
                description: 'Grow the next generation of lead data scientists',
                difficulty: 11,
                timeRequired: 30,
                basePay: 2800,
                skills: ['charisma', 'intelligence'],
                xpReward: { charisma: 50, intelligence: 40 },
                realWorld: 'Your mentee ships a model that beats yours. You are prouder than you expected.'
            }
        ]
    },
    chief_data_officer: {
        name: 'Chief Data Officer',
        minReputation: 5000,
        tasks: [
            {
                id: 'data_strategy',
                name: 'Company Data Strategy',
                description: 'Present the five-year data strategy to the board',
                difficulty: 14,
                timeRequired: 45,
                basePay: 5000,
                skills: ['charisma', 'analytics'],
                xpReward: { charisma: 80, analytics: 60 },
                realWorld: 'The board loves the vision and halves the budget. Prioritise.'
            },
            {
                id: 'ai_governance',
                name: 'AI Governance Framework',
                description: 'Define how the company audits and ships AI responsibly',
                difficulty: 14,
                timeRequired: 50,
                basePay: 5500,
                skills: ['intelligence', 'charisma'],
                xpReward: { intelligence: 80, charisma: 70 },
                realWorld: 'Legal, product and research all want different rules. Regulators are watching.'
            },
            {
                id: 'acquisition_due_diligence',
                name: 'Acquisition Due Diligence',
                description: "Assess a startup's data and models before a $200M acquisition",
                difficulty: 15,
                timeRequired: 50,
                basePay: 6000,
                skills: ['analytics', 'intelligence'],
                xpReward: { analytics: 90, intelligence: 70 },
                realWorld: "Their 'proprietary AI' is a spreadsheet and two interns. The deal is in your hands."
            }
        ]
    }
};

export class JobSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentJob = null;
        this.jobHistory = [];
        this.availableJobs = [];
        this.completedTasks = [];
        this.activeTasks = {};
    }

    /**
     * Get available jobs based on reputation. The result is also kept in
     * availableJobs (saved with the game) (#1823).
     */
    getAvailableJobs() {
        const reputation = this.gameState.reputation || 0;
        const available = [];

        // One eligibility model for both methods (#1826): reputation unlocks a
        // category, the player's stats decide which of its tasks are in reach.
        for (const [categoryId, category] of Object.entries(JOB_CATEGORIES)) {
            if (reputation >= category.minReputation) {
                available.push({
                    category: categoryId,
                    name: category.name,
                    tasks: category.tasks.filter(task => this.isTaskInReach(task))
                });
            }
        }

        this.availableJobs = available.map(j => j.category);
        return available;
    }

    /**
     * The job the player holds: the highest category their reputation
     * qualifies for. Nothing ever set currentJob before, so
     * getAvailableTasks() always returned [] (#951). `level` is the tier
     * index, read by VisualProgressionSystem (#2082).
     */
    updateCurrentJob() {
        const reputation = this.gameState.reputation || 0;
        const entries = Object.entries(JOB_CATEGORIES);
        let level = 0;
        entries.forEach(([, category], i) => {
            if (reputation >= category.minReputation) level = i;
        });
        const [categoryId, category] = entries[level];
        if (this.currentJob?.category !== categoryId) {
            if (this.currentJob) this.jobHistory.push({ ...this.currentJob, endedAt: Date.now() });
            this.currentJob = { category: categoryId, name: category.name, level, startedAt: Date.now() };
        }
        return this.currentJob;
    }

    /**
     * Get tasks for current job level
     */
    getAvailableTasks() {
        this.updateCurrentJob();

        const category = JOB_CATEGORIES[this.currentJob.category];
        if (!category) return [];
        if ((this.gameState.reputation || 0) < category.minReputation) return [];

        return category.tasks.filter(task => this.isTaskInReach(task));
    }

    /**
     * Can the player handle this task? Difficulty may be up to 2 above their
     * best of intelligence/analytics (per 10 points).
     */
    isTaskInReach(task) {
        const cs = this.gameState.characterStats;
        const playerIntelligence = cs?.getStat?.('intelligence') || 0;
        const playerAnalytics = cs?.getStat?.('analytics') || 0;
        const maxDifficulty = Math.max(playerIntelligence, playerAnalytics) / 10;
        return task.difficulty <= maxDifficulty + 2; // Allow slightly harder tasks
    }

    /**
     * Reputation earned for a task at full quality: its own reputationReward,
     * or 5 per difficulty point (#1824).
     */
    static reputationFor(task) {
        const explicit = Number(task?.reputationReward);
        if (Number.isFinite(explicit) && explicit >= 0) return explicit;
        return Math.max(1, (Number(task?.difficulty) || 1) * 5);
    }

    /**
     * Start a task. It stays active until completeTask() (#955).
     */
    startTask(taskId) {
        const task = this.findTask(taskId);
        if (!task) return null;
        if (!this.activeTasks) this.activeTasks = {};
        if (this.activeTasks[taskId]) return { task, ...this.activeTasks[taskId], status: 'in_progress' };

        const startTime = Date.now();
        this.activeTasks[taskId] = { startTime, startDay: this.gameState.timeManager?.totalDays || 0 };
        return {
            task,
            startTime,
            timeRequired: task.timeRequired,
            status: 'in_progress'
        };
    }

    /**
     * How well the player's stats cover a task's skills: 1.0 when every
     * listed skill is at 50+, down to 0.8 for raw beginners (#1825).
     */
    getSkillFactor(task) {
        const cs = this.gameState.characterStats;
        const skills = task?.skills || [];
        if (!cs?.getStat || skills.length === 0) return 1;
        const avg = skills.reduce((sum, s) => sum + (Number(cs.getStat(s)) || 0), 0) / skills.length;
        return 0.8 + 0.2 * Math.min(1, avg / 50);
    }

    /**
     * Complete a started task: pays the player, grants XP, records it.
     * Guards: the task must have been started, can only be completed once per
     * start, and quality is clamped to 0-1 (#955). Pay lands in money,
     * totalEarned and weeklyIncome (taxed) (#952).
     */
    completeTask(taskId, quality = 1.0) {
        const task = this.findTask(taskId);
        if (!task) return null;
        const active = this.activeTasks?.[taskId];
        if (!active) return { success: false, reason: 'Task was not started' };
        delete this.activeTasks[taskId];

        const q = Math.max(0, Math.min(1, Number.isFinite(Number(quality)) ? Number(quality) : 0));

        // Calculate pay based on quality and skill fit, boosted by charisma (clientPay bonus)
        const clientPayBonus = 1 + ((this.gameState.characterStats?.getTotalBonuses?.()?.clientPay || 0) / 100);
        const pay = Math.floor(task.basePay * q * this.getSkillFactor(task) * clientPayBonus);

        this.gameState.money = (this.gameState.money || 0) + pay;
        this.gameState.totalEarned = (this.gameState.totalEarned || 0) + pay;
        this.gameState.weeklyIncome = (this.gameState.weeklyIncome || 0) + pay;

        // Apply XP rewards
        if (task.xpReward) {
            for (const [stat, amount] of Object.entries(task.xpReward)) {
                this.gameState.characterStats?.addExperience?.(stat, Math.floor(amount * q));
            }
        }

        // Reputation is what unlocks the next job category; tasks now earn it (#1824)
        const reputation = Math.round(JobSystem.reputationFor(task) * q);
        if (reputation > 0) {
            this.gameState.reputation = (Number(this.gameState.reputation) || 0) + reputation;
        }

        this.completedTasks.push({
            taskId,
            completedAt: Date.now(),
            durationMs: Date.now() - active.startTime,
            quality: q,
            pay,
            reputation
        });

        return {
            success: true,
            pay,
            reputation,
            quality: q,
            xpReward: task.xpReward,
            timeRequired: task.timeRequired,
            realWorld: task.realWorld
        };
    }

    /**
     * Find task by ID
     */
    findTask(taskId) {
        for (const category of Object.values(JOB_CATEGORIES)) {
            const task = category.tasks.find(t => t.id === taskId);
            if (task) return task;
        }
        return null;
    }

    /**
     * Get all tasks (for IDE system)
     */
    getAllTasks() {
        const allTasks = [];
        for (const category of Object.values(JOB_CATEGORIES)) {
            allTasks.push(...category.tasks);
        }
        return allTasks;
    }
    
    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            currentJob: this.currentJob,
            jobHistory: this.jobHistory,
            availableJobs: this.availableJobs,
            completedTasks: this.completedTasks,
            activeTasks: this.activeTasks
        };
    }
    
    /**
     * Load from save
     */
    fromJSON(data) {
        if (!data) return;
        this.currentJob = data.currentJob || null;
        this.jobHistory = data.jobHistory || [];
        this.availableJobs = data.availableJobs || [];
        this.completedTasks = data.completedTasks || [];
        this.activeTasks = (data.activeTasks && typeof data.activeTasks === 'object') ? data.activeTasks : {};
    }
}



