/**
 * ContractSystem.js
 * Manages contract generation, acceptance, and completion
 */

export class ContractSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.contracts = [];
        this.generateInitialContracts(5);
    }

    /**
     * Generate initial contracts
     */
    generateInitialContracts(count) {
        for (let i = 0; i < count; i++) {
            this.contracts.push(this.generateContract());
        }
    }

    /**
     * Generate a single contract
     */
    generateContract() {
        const difficulty = this.calculateDifficulty();
        const reward = this.calculateReward(difficulty);
        const deadline = this.calculateDeadline();

        return {
            id: 'contract_' + Date.now(),
            name: this.generateTaskName(),
            description: this.generateTaskDescription(),
            difficulty: difficulty,
            reward: reward,
            deadline: deadline,
            accepted: false,
            completed: false
        };
    }

    /**
     * Calculate contract difficulty
     */
    calculateDifficulty() {
        return Math.floor(Math.random() * 41) + 60; // 60-100
    }

    /**
     * Calculate contract reward
     */
    calculateReward(difficulty) {
        return Math.floor(difficulty * 1.5);
    }

    /**
     * Calculate contract deadline
     */
    calculateDeadline() {
        return Math.floor(Math.random() * 7) + 3; // 3-10 days
    }

    /**
     * Generate contract name
     */
    generateTaskName() {
        const names = [
            'Data Analysis',
            'Report Writing',
            'Project Management',
            'Market Research',
            'Client Presentation'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    /**
     * Generate contract description
     */
    generateTaskDescription() {
        return 'Complete this task within the given deadline for a reward.';
    }

    /**
     * Accept a contract
     */
    acceptContract(contractId) {
        const contract = this.contracts.find(c => c.id === contractId);
        if (contract) {
            contract.accepted = true;
            this.gameState.addMoney(contract.reward);
            this.gameState.addReputation(5);
        }
    }

    /**
     * Complete a contract
     */
    completeContract(contractId) {
        const contract = this.contracts.find(c => c.id === contractId);
        if (contract && contract.accepted) {
            contract.completed = true;
            this.gameState.addMoney(contract.reward * 1.5);
            this.gameState.addReputation(10);
        }
    }

    /**
     * List available contracts
     */
    listAvailableContracts() {
        return this.contracts.filter(c => !c.completed);
    }

    /**
     * List accepted contracts
     */
    listAcceptedContracts() {
        return this.contracts.filter(c => c.accepted && !c.completed);
    }
}