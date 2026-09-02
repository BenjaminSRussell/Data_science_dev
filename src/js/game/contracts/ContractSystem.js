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