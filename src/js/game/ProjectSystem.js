/**
 * ProjectSystem.js
 * Manages project creation, tracking, and completion.
 */

export class ProjectSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.activeProject = null;
        this.completedProjects = [];
        this.projectHistory = {};
        this.CONTRACTS = [
            {
                id: 'project_1',
                name: 'Alpha',
                description: 'Build the first version of the Alpha software.',
                stages: [
                    { name: 'Design', maxProgress: 100 },
                    { name: 'Development', maxProgress: 200 },
                    { name: 'Testing', maxProgress: 150 }
                ],
                reward: 1000,
                xpReward: { programming: 50 },
                difficulty: 2,
                reputation: 50,
                requirements: {
                    stat: 'intelligence',
                    value: 5
                }
            },
            {
                id: 'project_2',
                name: 'Beta',
                description: 'Build the first version of the Beta software.',
                stages: [
                    { name: 'Design', maxProgress: 120 },
                    { name: 'Development', maxProgress: 220 },
                    { name: 'Testing', maxProgress: 160 }
                ],
                reward: 1500,
                xpReward: { programming: 75 },
                difficulty: 3,
                reputation: 75,
                requirements: {
                    stat: 'intelligence',
                    value: 6
                }
            }
        ];

        this.refreshContracts();
    }

    /**
     * Refresh available contracts based on character stats and reputation
     */
    refreshContracts() {
        this.availableContracts = this.CONTRACTS.filter(contract => {
            const statRequirement = contract.requirements.stat;
            const valueRequirement = contract.requirements.value;
            const statValue = this.gameState.characterStats?.getStat(statRequirement) || 0;
            const reputationValue = this.gameState.reputation || 0;

            return statValue >= valueRequirement && reputationValue >= contract.reputation;
        });
    }

    /**
     * Start a project
     * @param {string} contractId - The ID of the contract to start
     */
    startProject(contractId) {
        if (this.activeProject) {
            return { success: false, reason: "Already working on a project." };
        }

        const contract = this.availableContracts.find(c => c.id === contractId);
        if (!contract) {
            return { success: false, reason: "Contract not found." };
        }

        this.activeProject = {
            contractId: contract.id,
            currentStageIndex: 0,
            stageProgress: 0,
            startedAt: new Date()
        };

        return { success: true };
    }

    /**
     * Work on the active project
     * @param {number} workPower - The amount of work power to apply
     */
    workOnProject(workPower) {
        if (!this.activeProject) {
            return { success: false, reason: "No active project." };
        }

        const aiBonus = this.gameState.aiSystem ? this.gameState.aiSystem.processingPower : 0;
        const totalWork = workPower + aiBonus;

        const contract = this.CONTRACTS.find(c => c.id === this.activeProject.contractId);
        const stage = contract.stages[this.activeProject.currentStageIndex];

        this.activeProject.stageProgress += totalWork;

        if (this.activeProject.stageProgress >= stage.maxProgress) {
            this.completeStage();
        }

        return { success: true };
    }

    /**
     * Complete the current stage of the active project
     */
    completeStage() {
        if (!this.activeProject) {
            return { success: false, reason: "No active project." };
        }

        const contract = this.CONTRACTS.find(c => c.id === this.activeProject.contractId);

        this.activeProject.currentStageIndex++;
        this.activeProject.stageProgress = 0;

        if (this.activeProject.currentStageIndex >= contract.stages.length) {
            this.completeProject();
        }

        return { success: true };
    }

    /**
     * Complete the active project
     */
    completeProject() {
        if (!this.activeProject) {
            return { success: false, reason: "No active project." };
        }

        const contract = this.CONTRACTS.find(c => c.id === this.activeProject.contractId);

        this.gameState.money = (this.gameState.money || 0) + contract.reward;

        if (contract.xpReward && this.gameState?.characterStats) {
            Object.entries(contract.xpReward || {}).forEach(([skill, amount]) => {
                if (this.gameState.characterStats?.addExperience && typeof amount === 'number') {
                    try {
                        this.gameState.characterStats.addExperience(skill, amount);
                    } catch (error) {
                        console.warn('Failed to add experience:', error);
                    }
                }
            });
        }

        if (contract.ethics && this.gameState?.characterStats?.modifyEthics) {
            try {
                this.gameState.characterStats.modifyEthics(contract.ethics);
            } catch (error) {
                console.warn('Failed to modify ethics:', error);
            }
        }

        // Reputation
        if (contract.difficulty) {
            this.gameState.reputation = (this.gameState.reputation || 0) + (contract.difficulty * 10);
        }

        // Track history
        if (contract.id) {
            if (!this.completedProjects) this.completedProjects = [];
            this.completedProjects.push(contract.id);
            if (!this.projectHistory) this.projectHistory = {};
            this.projectHistory[contract.id] = (this.projectHistory[contract.id] || 0) + 1;
        }

        this.activeProject = null;

        return {
            status: 'project_complete',
            contract: contract,
            reward: contract.reward || 0
        };
    }

    /**
     * Cancel current project
     */
    cancelProject() {
        this.activeProject = null;
    }

    // Serialization
    toJSON() {
        return {
            activeProject: this.activeProject,
            completedProjects: this.completedProjects,
            projectHistory: this.projectHistory
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.activeProject = data.activeProject || null;
        this.completedProjects = data.completedProjects || [];
        this.projectHistory = data.projectHistory || {};
        this.refreshContracts();
    }
}