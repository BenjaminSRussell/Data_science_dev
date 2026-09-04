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
        const contracts = [];
        
        for (let i = 0; i < count; i++) {
            contracts.push(this.generateContract(category));
        }
        
        return contracts;
    }
    
    /**
     * Generate a single contract
     */
    generateContract(category) {
        this.contractIdCounter++;
        
        const templates = this.getContractTemplates(category);
        const template = templates[Math.floor(Math.random() * templates.length)];
        
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
            deadline: Date.now() + (template.timeRequired * 24 * 60 * 60 * 1000), // Days to milliseconds
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
                    requiredStats: { focus: 10 }
                },
                {
                    title: 'Invoice Data Entry',
                    description: 'Process and enter invoice data from last quarter.',
                    timeRequired: 3,
                    difficulty: 1,
                    deliverables: ['Entered invoices', 'Summary report']
                }
            ],
            DATA_CLEANING: [
                {
                    title: 'Clean Sales Dataset',
                    description: 'Remove duplicates, fix formatting errors, and standardize data.',
                    timeRequired: 4,
                    difficulty: 2,
                    deliverables: ['Cleaned dataset', 'Data quality report'],
                    requiredStats: { intelligence: 15, focus: 10 }
                },
                {
                    title: 'Merge Customer Databases',
                    description: 'Combine two customer databases, resolve conflicts, and deduplicate.',
                    timeRequired: 5,
                    difficulty: 3,
                    deliverables: ['Merged database', 'Conflict resolution log']
                }
            ],
            DATA_ANALYSIS: [
                {
                    title: 'Sales Trend Analysis',
                    description: 'Analyze quarterly sales data and identify trends.',
                    timeRequired: 6,
                    difficulty: 3,
                    deliverables: ['Analysis report', 'Visualizations'],
                    requiredStats: { intelligence: 20, analytics: 15 }
                },
                {
                    title: 'Customer Segmentation',
                    description: 'Segment customers by purchasing behavior and demographics.',
                    timeRequired: 8,
                    difficulty: 4,
                    deliverables: ['Segmentation model', 'Customer profiles']
                }
            ],
            VISUALIZATION: [
                {
                    title: 'Executive Dashboard',
                    description: 'Create interactive dashboard for executive team.',
                    timeRequired: 10,
                    difficulty: 4,
                    deliverables: ['Dashboard', 'User guide'],
                    requiredStats: { intelligence: 25, analytics: 20 }
                }
            ],
            REPORTING: [
                {
                    title: 'Monthly Performance Report',
                    description: 'Comprehensive report on company performance metrics.',
                    timeRequired: 12,
                    difficulty: 5,
                    deliverables: ['Report document', 'Supporting data'],
                    requiredStats: { intelligence: 30, analytics: 25 }
                }
            ],
            STATISTICAL_MODELING: [
                {
                    title: 'Churn Prediction Model',
                    description: 'Build statistical model to predict customer churn.',
                    timeRequired: 15,
                    difficulty: 6,
                    deliverables: ['Model', 'Validation report'],
                    requiredStats: { intelligence: 40, analytics: 35 }
                }
            ],
            MACHINE_LEARNING: [
                {
                    title: 'Recommendation Engine',
                    description: 'Develop ML model for product recommendations.',
                    timeRequired: 20,
                    difficulty: 8,
                    deliverables: ['Trained model', 'Performance metrics'],
                    requiredStats: { intelligence: 50, analytics: 45 }
                }
            ],
            PREDICTIVE_ANALYTICS: [
                {
                    title: 'Demand Forecasting',
                    description: 'Predict future product demand using historical data.',
                    timeRequired: 18,
                    difficulty: 7,
                    deliverables: ['Forecast model', 'Confidence intervals'],
                    requiredStats: { intelligence: 45, analytics: 40 }
                }
            ],
            BUSINESS_INTELLIGENCE: [
                {
                    title: 'BI Platform Implementation',
                    description: 'Design and implement business intelligence platform.',
                    timeRequired: 25,
                    difficulty: 9,
                    deliverables: ['BI Platform', 'Training materials'],
                    requiredStats: { intelligence: 60, analytics: 55 }
                }
            ],
            DATA_ENGINEERING: [
                {
                    title: 'Data Pipeline Architecture',
                    description: 'Design scalable data pipeline for real-time processing.',
                    timeRequired: 30,
                    difficulty: 10,
                    deliverables: ['Pipeline design', 'Implementation plan'],
                    requiredStats: { intelligence: 65, analytics: 60 }
                }
            ],
            CONSULTING: [
                {
                    title: 'Data Strategy Consultation',
                    description: 'Provide strategic guidance on data initiatives.',
                    timeRequired: 14,
                    difficulty: 8,
                    deliverables: ['Strategy document', 'Recommendations'],
                    requiredStats: { intelligence: 55, charisma: 40 }
                }
            ],
            EXECUTIVE: [
                {
                    title: 'C-Suite Data Presentation',
                    description: 'Present data insights to executive leadership.',
                    timeRequired: 10,
                    difficulty: 9,
                    deliverables: ['Presentation', 'Executive summary'],
                    requiredStats: { intelligence: 60, charisma: 50 }
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
                const playerStat = this.gameState.characterStats?.getStat(stat) || 0;
                if (playerStat < value) {
                    return { success: false, reason: `Insufficient ${stat} (need ${value}, have ${playerStat})` };
                }
            }
        }
        
        // Move to active
        this.availableContracts = this.availableContracts.filter(c => c.id !== contractId);
        this.activeContracts.push({
            ...contract,
            acceptedAt: Date.now(),
            progress: 0,
            status: 'active'
        });
        
        return { success: true, contract };
    }
    
    /**
     * Work on active contract
     */
    workOnContract(contractId, workAmount) {
        const contract = this.activeContracts.find(c => c.id === contractId);
        if (!contract) return null;
        
        contract.progress += workAmount;
        
        // Check completion
        if (contract.progress >= contract.timeRequired) {
            return this.completeContract(contractId);
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
    completeContract(contractId) {
        const contract = this.activeContracts.find(c => c.id === contractId);
        if (!contract) return { success: false, reason: 'Contract not found' };
        
        // Guard: cannot complete before requirements are met
        if (contract.progress < contract.timeRequired) {
            return { success: false, reason: 'Contract requirements not yet met' };
        }
        
        // Calculate pay with bonuses
        let pay = contract.basePay;
        let bonuses = [];
        
        // Check bonus conditions
        contract.bonusConditions.forEach(condition => {
            if (this.checkBonusCondition(condition)) {
                const bonus = pay * condition.multiplier;
                pay += bonus;
                bonuses.push({ type: condition.type, amount: bonus });
            }
        });
        
        // Early completion bonus
        const daysEarly = Math.max(0, (contract.deadline - Date.now()) / (24 * 60 * 60 * 1000));
        if (daysEarly > 0) {
            const earlyBonus = pay * 0.1 * Math.min(daysEarly / contract.timeRequired, 1);
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
        
        // Award pay
        this.gameState.money += pay;
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
    checkBonusCondition(condition) {
        if (!condition || !this.gameState) return false;
        
        switch (condition.type) {
            case 'early_completion':
                // Already handled in completeContract
                return false;
            case 'perfect_quality':
                // Check if contract was completed with perfect quality
                return condition.achieved || false;
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
        return this.availableContracts;
    }
    
    /**
     * Get active contracts
     */
    getActiveContracts() {
        return this.activeContracts;
    }
    
    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            activeContracts: this.activeContracts,
            completedContracts: this.completedContracts,
            availableContracts: this.availableContracts
        };
    }
    
    /**
     * Load from save
     */
    fromJSON(data) {
        if (!data) return;
        this.activeContracts = data.activeContracts || [];
        this.completedContracts = data.completedContracts || [];
        this.availableContracts = data.availableContracts || [];
    }
}

