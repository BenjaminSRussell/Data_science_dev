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
    }
};

export class JobSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentJob = null;
        this.jobHistory = [];
        this.availableJobs = [];
        this.completedTasks = [];
    }

    /**
     * Get available jobs based on reputation
     */
    getAvailableJobs() {
        const reputation = this.gameState.reputation || 0;
        const available = [];

        for (const [categoryId, category] of Object.entries(JOB_CATEGORIES)) {
            if (reputation >= category.minReputation) {
                available.push({
                    category: categoryId,
                    name: category.name,
                    tasks: category.tasks
                });
            }
        }

        return available;
    }

    /**
     * Get tasks for current job level
     */
    getAvailableTasks() {
        if (!this.currentJob) return [];
        
        const category = JOB_CATEGORIES[this.currentJob.category];
        if (!category) return [];

        // Filter tasks by difficulty (player should be able to handle them)
        const playerIntelligence = this.gameState.characterStats?.getStat('intelligence') || 0;
        const playerAnalytics = this.gameState.characterStats?.getStat('analytics') || 0;

        return category.tasks.filter(task => {
            const maxDifficulty = Math.max(playerIntelligence, playerAnalytics) / 10;
            return task.difficulty <= maxDifficulty + 2; // Allow slightly harder tasks
        });
    }

    /**
     * Start a task
     */
    startTask(taskId) {
        const task = this.findTask(taskId);
        if (!task) return null;

        return {
            task,
            startTime: Date.now(),
            status: 'in_progress'
        };
    }

    /**
     * Complete a task
     */
    completeTask(taskId, quality = 1.0) {
        const task = this.findTask(taskId);
        if (!task) return null;

        // Calculate pay based on quality
        const pay = Math.floor(task.basePay * quality);
        
        // Apply XP rewards
        if (task.xpReward) {
            for (const [stat, amount] of Object.entries(task.xpReward)) {
                this.gameState.characterStats?.addExperience(stat, Math.floor(amount * quality));
            }
        }

        this.completedTasks.push({
            taskId,
            completedAt: Date.now(),
            quality,
            pay
        });

        return {
            pay,
            xpReward: task.xpReward,
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
            completedTasks: this.completedTasks
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
    }
}



