/**
 * ContractSystem.js
 * Comprehensive contract system for 12+ job types
 * Handles contract generation, acceptance, completion, and rewards
 */

/**
 * Contract Categories - Different types of work contracts
 */
export const CONTRACT_CATEGORIES = {
    DATA_ENTRY: {
        name: 'Data Entry',
        minReputation: 0,
        basePay: 50,
        contracts: []
    },
    DATA_CLEANING: {
        name: 'Data Cleaning',
        minReputation: 50,
        basePay: 75,
        contracts: []
    },
    DATA_ANALYSIS: {
        name: 'Data Analysis',
        minReputation: 100,
        basePay: 150,
        contracts: []
    },
    VISUALIZATION: {
        name: 'Visualization',
        minReputation: 200,
        basePay: 200,
        contracts: []
    },
    REPORTING: {
        name: 'Reporting',
        minReputation: 300,
        basePay: 300,
        contracts: []
    },
    STATISTICAL_MODELING: {
        name: 'Statistical Modeling',
        minReputation: 500,
        basePay: 500,
        contracts: []
    },
    MACHINE_LEARNING: {
        name: 'Machine Learning',
        minReputation: 800,
        basePay: 800,
        contracts: []
    },
    PREDICTIVE_ANALYTICS: {
        name: 'Predictive Analytics',
        minReputation: 1200,
        basePay: 1200,
        contracts: []
    },
    BUSINESS_INTELLIGENCE: {
        name: 'Business Intelligence',
        minReputation: 2000,
        basePay: 2000,
        contracts: []
    },
    DATA_ENGINEERING: {
        name: 'Data Engineering',
        minReputation: 3000,
        basePay: 3000,
        contracts: []
    },
    CONSULTING: {
        name: 'Consulting',
        minReputation: 5000,
        basePay: 5000,
        contracts: []
    },
    EXECUTIVE: {
        name: 'Executive Strategy',
        minReputation: 10000,
        basePay: 10000,
        contracts: []
    }
};

/**
 * Contract Template Generator
 */
export class ContractGenerator {
    constructor() {
        this.contractIdCounter = 0;
    }
    
    /**
     * Generate contracts for a category
     */
    generateContractsForCategory(category, count = 3) {
        // Pick templates without repeats, so a category with one template
        // offers one contract instead of two identical ones (#1626)
        const templates = this.getContractTemplates(category);
        const pool = templates.map((_, i) => i);
        const contracts = [];
        const n = Math.min(count, templates.length);
        for (let i = 0; i < n; i++) {
            const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
            contracts.push(this.generateContract(category, templates[pick]));
        }
        return contracts;
    }
    
    /**
     * Generate a single contract
     */
    generateContract(category, chosenTemplate = null) {
        this.contractIdCounter++;
        
        const templates = this.getContractTemplates(category);
        const template = chosenTemplate || templates[Math.floor(Math.random() * templates.length)];
        
        return {
            id: `contract_${category}_${this.contractIdCounter}`,
            category: category,
            title: template.title,
            description: template.description,
            client: this.generateClientName(),
            requirements: {
                reputation: CONTRACT_CATEGORIES[category].minReputation,
                stats: template.requiredStats || {}
            },
            timeRequired: template.timeRequired,
            basePay: CONTRACT_CATEGORIES[category].basePay * (0.8 + Math.random() * 0.4), // 80-120% variation
            difficulty: template.difficulty,
            deliverables: template.deliverables,
            bonusConditions: template.bonusConditions || [],
            // The deadline clock starts when the contract is accepted, not
            // when it's offered (#972); acceptContract() stamps it
            deadline: null,
            createdAt: Date.now()
        };
    }
    
    /**
     * Get contract templates for category
     */
    getContractTemplates(category) {
        const templates = {
            DATA_ENTRY: [
                {
                    title: 'Customer Database Entry',
                    description: 'Enter 1000 customer records into our CRM system. Accuracy is critical.',
                    timeRequired: 2,
                    difficulty: 1,
                    deliverables: ['Completed database', 'Accuracy report'],
                    requiredStats: { focus: 10 },
                    bonusConditions: [
                        {
                            type: 'skill_requirement',
                            skill: 'focus',
                            value: 15,
                            multiplier: 0.1
                        }
                    ]
                },
                {
                    title: 'Invoice Data Entry',
                    description: 'Process and enter invoice data from last quarter.',
                    timeRequired: 3,
                    difficulty: 1,
                    deliverables: ['Entered invoices', 'Summary report'],
                    bonusConditions: [
                        {
                            type: 'early_completion',
                            multiplier: 0.15
                        }
                    ]
                }
            ],
            DATA_CLEANING: [
                {
                    title: 'Clean Sales Dataset',
                    description: 'Remove duplicates, fix formatting errors, and standardize data.',
                    timeRequired: 4,
                    difficulty: 2,
                    deliverables: ['Cleaned dataset', 'Data quality report'],
                    requiredStats: { intelligence: 15, focus: 10 },
                    bonusConditions: [
                        {
                            type: 'skill_requirement',
                            skill: 'intelligence',
                            value: 20,
                            multiplier: 0.15
                        }
                    ]
                },
                {
                    title: 'Merge Customer Databases',
                    description: 'Combine two customer databases, resolve conflicts, and deduplicate.',
                    timeRequired: 5,
                    difficulty: 3,
                    deliverables: ['Merged database', 'Conflict resolution log'],
                    bonusConditions: [
                        {
                            type: 'skill_requirement',
                            skill: 'intelligence',
                            value: 25,
                            multiplier: 0.2
                        }
                    ]
                }
            ],
            DATA_ANALYSIS: [
                {
                    title: 'Sales Trend Analysis',
                    description: 'Analyze quarterly sales data and identify trends.',
                    timeRequired: 6,
                    difficulty: 3,
                    deliverables: ['Analysis report', 'Visualizations'],
                    requiredStats: { intelligence: 20, analytics: 15 },
                    bonusConditions: [
                        {
                            type: 'skill_requirement',
                            skill: 'analytics',
                            value: 20,
                            multiplier: 0.15
                        }
                    ]
                },
                {
                    title: 'Customer Segmentation',
                    description: 'Segment customers by purchasing behavior and demographics.',
                    timeRequired: 8,
                    difficulty: 4,
                    deliverables: ['Segmentation model', 'Customer profiles'],
                    bonusConditions: [
                        {
                            type: 'skill_requirement',
                            skill: 'analytics',
                            value: 25,
                            multiplier: 0.2
                        }
                    ]
                }
            ],
            VISUALIZATION: [
                {
                    title: 'Executive Dashboard',
                    description: 'Create interactive dashboard for executive team.',
                    timeRequired: 10,
                    difficulty: 4,
                    deliverables: ['Dashboard', 'User guide'],
                    requiredStats: { intelligence: 25, analytics: 20 },
                    bonusConditions: [
                        {
                            type: 'skill_requirement',
                            skill: 'analytics',
                            value: 30,
                            multiplier: 0.2
                        }
                    ]
                }
            ],
            REPORTING: [
                {
                    title: 'Monthly Performance Report',
                    description: 'Comprehensive report on company performance metrics.',
                    timeRequired: 12,
                    difficulty: 5,
                    deliverables: ['Report document', 'Supporting data'],
                    requiredStats: { intelligence: 30, analytics: 25 },
                    bonusConditions: [
                        {
                            type: 'reputation_threshold',
                            value: 300,
                            multiplier: 0.15
                        }
                    ]
                }
            ],
            STATISTICAL_MODELING: [
                {
                    title: 'Churn Prediction Model',
                    description: 'Build statistical model to predict customer churn.',
                    timeRequired: 15,
                    difficulty: 6,
                    deliverables: ['Model', 'Validation report'],
                    requiredStats: { intelligence: 40, analytics: 35 },
                    bonusConditions: [
                        {
                            type: 'skill_requirement',
                            skill: 'intelligence',
                            value: 40,
                            multiplier: 0.2
                        }
                    ]
                }
            ],
            MACHINE_LEARNING: [
                {
                    title: 'Recommendation Engine',
                    description: 'Develop ML model for product recommendations.',
                    timeRequired: 20,
                    difficulty: 8,
                    deliverables: ['Trained model', 'Performance metrics'],
                    requiredStats: { intelligence: 50, analytics: 45 },
                    bonusConditions: [
                        {
                            type: 'skill_requirement',
                            skill: 'intelligence',
                            value: 50,
                            multiplier: 0.25
                        },
                        {
                            type: 'reputation_threshold',
                            value: 800,
                            multiplier: 0.15
                        }
                    ]
                }
            ],
            PREDICTIVE_ANALYTICS: [
                {
                    title: 'Demand Forecasting',
                    description: 'Predict future product demand using historical data.',
                    timeRequired: 18,
                    difficulty: 7,
                    deliverables: ['Forecast model', 'Confidence intervals'],
                    requiredStats: { intelligence: 45, analytics: 40 },
                    bonusConditions: [
                        {
                            type: 'skill_requirement',
                            skill: 'analytics',
                            value: 40,
                            multiplier: 0.2
                        }
                    ]
                }
            ],
            BUSINESS_INTELLIGENCE: [
                {
                    title: 'BI Platform Implementation',
                    description: 'Design and implement business intelligence platform.',
                    timeRequired: 25,
                    difficulty: 9,
                    deliverables: ['BI Platform', 'Training materials'],
                    requiredStats: { intelligence: 60, analytics: 55 },
                    bonusConditions: [
                        {
                            type: 'reputation_threshold',
                            value: 2000,
                            multiplier: 0.2
                        }
                    ]
                }
            ],
            DATA_ENGINEERING: [
                {
                    title: 'Data Pipeline Architecture',
                    description: 'Design scalable data pipeline for real-time processing.',
                    timeRequired: 30,
                    difficulty: 10,
                    deliverables: ['Pipeline design', 'Implementation plan'],
                    requiredStats: { intelligence: 65, analytics: 60 },
                    bonusConditions: [
                        {
                            type: 'skill_requirement',
                            skill: 'intelligence',
                            value: 65,
                            multiplier: 0.25
                        },
                        {
                            type: 'reputation_threshold',
                            value: 3000,
                            multiplier: 0.15
                        }
                    ]
                }
            ],
            CONSULTING: [
                {
                    title: 'Data Strategy Consultation',
                    description: 'Provide strategic guidance on data initiatives.',
                    timeRequired: 14,
                    difficulty: 8,
                    deliverables: ['Strategy document', 'Recommendations'],
                    requiredStats: { intelligence: 55, charisma: 40 },
                    bonusConditions: [
                        {
                            type: 'reputation_threshold',
                            value: 5000,
                            multiplier: 0.2
                        }
                    ]
                }
            ],
            EXECUTIVE: [
                {
                    title: 'C-Suite Data Presentation',
                    description: 'Present data insights to executive leadership.',
                    timeRequired: 10,
                    difficulty: 9,
                    deliverables: ['Presentation', 'Executive summary'],
                    requiredStats: { intelligence: 60, charisma: 50 },
                    bonusConditions: [
                        {
                            type: 'reputation_threshold',
                            value: 10000,
                            multiplier: 0.25
                        }
                    ]
                }
            ]
        };

        return templates[category] || [];
    }
    
    /**
     * Generate random client name
     */
    generateClientName() {
        const companies = [
            'TechCorp', 'DataFlow Inc', 'Analytics Pro', 'Insight Systems',
            'Digital Solutions', 'Cloud Analytics', 'Smart Data Co',
            'Future Metrics', 'Precision Analytics', 'Quantum Insights'
        ];
        
        return companies[Math.floor(Math.random() * companies.length)];
    }
}

/**
 * Contract System - Manages all contracts
 */
export class ContractSystem {
    static DAY_MS = 24 * 60 * 60 * 1000;

    /** Current in-game day (TimeManager.totalDays), 1 when there's no clock */
    getCurrentDay() {
        const tm = this.gameState?.timeManager;
        const day = Number(tm?.totalDays ?? tm?.day);
        return Number.isFinite(day) && day > 0 ? day : 1;
    }

    constructor(gameState) {
        this.gameState = gameState;
        this.generator = new ContractGenerator();
        this.activeContracts = [];
        this.completedContracts = [];
        this.availableContracts = [];
        this.refreshContracts();
    }
    
    /**
     * Refresh available contracts based on player stats
     */
    refreshContracts() {
        this.availableContracts = [];
        
        // Generate contracts for each category player qualifies for
        Object.entries(CONTRACT_CATEGORIES).forEach(([category, config]) => {
            if (this.gameState.reputation >= config.minReputation) {
                const contracts = this.generator.generateContractsForCategory(category, 2);
                this.availableContracts.push(...contracts);
            }
        });
        
        // Sort by pay (highest first)
        this.availableContracts.sort((a, b) => b.basePay - a.basePay);
    }
    
    /**
     * Accept a contract
     */
    acceptContract(contractId) {
        const contract = this.availableContracts.find(c => c.id === contractId);
        if (!contract) return { success: false, reason: 'Contract not found' };
        
        // Check requirements
        if (this.gameState.reputation < contract.requirements.reputation) {
            return { success: false, reason: 'Insufficient reputation' };
        }
        
        // Check stats
        if (contract.requirements.stats) {
            for (const [stat, value] of Object.entries(contract.requirements.stats)) {
                const playerStat = this.gameState.characterStats?.getStat?.(stat) || 0;
                if (playerStat < value) {
                    return { success: false, reason: `Insufficient ${stat} (need ${value}, have ${playerStat})` };
                }
            }
        }
        
        // Move to active. Deadlines run on the in-game calendar, not the real
        // clock, so the early bonus depends on game days played (#2113)
        const acceptedAt = Date.now();
        const acceptedDay = this.getCurrentDay();
        this.availableContracts = this.availableContracts.filter(c => c.id !== contractId);
        this.activeContracts.push({
            ...contract,
            acceptedAt,
            acceptedDay,
            deadlineDay: acceptedDay + (Number(contract.timeRequired) || 0),
            progress: 0,
            status: 'active'
        });
        
        return { success: true, contract };
    }
    
    /**
     * Work on active contract
     */
    workOnContract(contractId, workAmount, options = {}) {
        const contract = this.activeContracts.find(c => c.id === contractId);
        if (!contract) return null;
        
        contract.progress += Math.max(0, Number(workAmount) || 0);
        
        // Check completion
        if (contract.progress >= contract.timeRequired) {
            return this.completeContract(contractId, options);
        }
        
        return {
            status: 'working',
            progress: (contract.progress / contract.timeRequired) * 100,
            remaining: contract.timeRequired - contract.progress
        };
    }
    
    /**
     * Complete a contract
     */
    completeContract(contractId, options = {}) {
        const contract = this.activeContracts.find(c => c.id === contractId);
        if (!contract) return { success: false, reason: 'Contract not found' };

        // No payout until the work is done (#2112, #968)
        const required = Number(contract.timeRequired) || 0;
        if ((Number(contract.progress) || 0) < required) {
            return {
                success: false,
                reason: 'Contract work is not finished',
                progress: required > 0 ? ((Number(contract.progress) || 0) / required) * 100 : 0
            };
        }

        // Every bonus is a share of basePay; they used to compound off pay
        // that already included earlier bonuses (#1622)
        const basePay = Number(contract.basePay) || 0;
        let pay = basePay;
        let bonuses = [];
        const context = { quality: options.quality };
        
        // Check bonus conditions
        (contract.bonusConditions || []).forEach(condition => {
            const multiplier = ContractSystem.validMultiplier(condition?.multiplier);
            if (multiplier === null) return; // malformed: ignore, never NaN (#1625)
            if (this.checkBonusCondition(condition, context)) {
                const bonus = basePay * multiplier;
                pay += bonus;
                bonuses.push({ type: condition.type, amount: bonus });
            }
        });
        
        // Early completion bonus, in in-game days (#2113). Old saves with only a
        // wall-clock deadline get no early bonus rather than a real-time one.
        const deadlineDay = Number(contract.deadlineDay);
        const daysEarly = Number.isFinite(deadlineDay) ? Math.max(0, deadlineDay - this.getCurrentDay()) : 0;
        if (daysEarly > 0 && required > 0) {
            const earlyBonus = basePay * 0.1 * Math.min(daysEarly / required, 1);
            pay += earlyBonus;
            bonuses.push({ type: 'early_completion', amount: earlyBonus });
        }
        
        // Move to completed
        this.activeContracts = this.activeContracts.filter(c => c.id !== contractId);
        this.completedContracts.push({
            ...contract,
            completedAt: Date.now(),
            finalPay: pay,
            bonuses
        });
        
        // Award pay; contract pay is income like task pay, so it's taxed weekly (#1989)
        this.gameState.money += pay;
        this.gameState.weeklyIncome = (this.gameState.weeklyIncome || 0) + pay;
        this.gameState.totalEarned = (this.gameState.totalEarned || 0) + pay;
        this.gameState.reputation += Math.floor(contract.difficulty * 10);
        
        return {
            success: true,
            pay,
            bonuses,
            reputation: Math.floor(contract.difficulty * 10)
        };
    }
    
    /**
     * Check bonus condition
     */
    checkBonusCondition(condition, context = {}) {
        if (!condition || !this.gameState) return false;
        
        switch (condition.type) {
            case 'early_completion':
                // Already handled in completeContract
                return false;
            case 'perfect_quality':
                // Fires when the work is delivered at (or above) the quality
                // bar; nothing ever set condition.achieved before (#1624)
                if (condition.achieved) return true;
                return Number.isFinite(Number(context.quality))
                    && Number(context.quality) >= (Number(condition.value) || 100);
            case 'skill_requirement':
                // Check if player has required skill level
                if (this.gameState.characterStats) {
                    const skill = this.gameState.characterStats.getStat?.(condition.skill);
                    return skill >= (condition.value || 0);
                }
                return false;
            case 'reputation_threshold':
                // Check if player has required reputation
                return (this.gameState.reputation || 0) >= (condition.value || 0);
            default:
                return false;
        }
    }
    
    /**
     * Get available contracts for UI
     */
    getAvailableContracts() {
        // Copies, so UI code can't mutate the system's state (#1627)
        return this.availableContracts.map(c => ContractSystem.copyContract(c));
    }
    
    /**
     * Get active contracts
     */
    getActiveContracts() {
        return this.activeContracts.map(c => ContractSystem.copyContract(c));
    }

    static copyContract(contract) {
        if (!contract || typeof contract !== 'object') return contract;
        return typeof structuredClone === 'function'
            ? structuredClone(contract)
            : JSON.parse(JSON.stringify(contract));
    }

    /**
     * A bonus multiplier is a finite number between 0 and 5; anything else
     * returns null and the bonus is skipped (#1625)
     */
    static validMultiplier(value) {
        const n = Number(value);
        if (value === null || value === undefined || value === '' || !Number.isFinite(n)) return null;
        if (n < 0 || n > 5) return null;
        return n;
    }
    
    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            activeContracts: this.activeContracts,
            completedContracts: this.completedContracts,
            availableContracts: this.availableContracts,
            // Persist the id counter so new ids never collide after a load (#1623)
            contractIdCounter: this.generator.contractIdCounter
        };
    }
    
    /**
     * Load from save
     */
    fromJSON(data) {
        if (!data) return;
        this.activeContracts = (data.activeContracts || []).map(c => this.normalizeContract(c));
        this.completedContracts = (data.completedContracts || []).map(c => this.normalizeContract(c));
        this.availableContracts = (data.availableContracts || []).map(c => this.normalizeContract(c));
        // Never hand out an id that's already in use, even for saves made
        // before the counter was stored (#1623)
        const highest = [...this.activeContracts, ...this.completedContracts, ...this.availableContracts]
            .map(c => Number(String(c?.id || '').match(/_(\d+)$/)?.[1]))
            .filter(Number.isFinite)
            .reduce((a, b) => Math.max(a, b), 0);
        this.generator.contractIdCounter = Math.max(Number(data.contractIdCounter) || 0, highest, this.generator.contractIdCounter || 0);
    }
    
    /**
     * Normalize a contract restored from save data, filling in fields that
     * older or corrupted saves may be missing so downstream code can assume
     * a well-formed shape.
     */
    normalizeContract(contract) {
        if (!contract || typeof contract !== 'object') return contract;
        if (!Array.isArray(contract.bonusConditions)) {
            contract.bonusConditions = [];
        }
        return contract;
    }
}

