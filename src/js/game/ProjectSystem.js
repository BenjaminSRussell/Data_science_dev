/**
 * ProjectSystem.js
 * Manages active projects, progress, and stage transitions.
 */
import { CONTRACTS, PROJECT_TYPES } from './ProjectDatabase.js';

export class ProjectSystem {
    constructor(gameState) {
        this.gameState = gameState;

        this.activeProject = null; // Currently working on
        this.availableContracts = []; // List of available jobs

        this.completedProjects = [];
        this.projectHistory = {}; // { id: count }

        // Refresh contracts on init
        this.refreshContracts();
    }

    /**
     * Generate available contracts based on player stats
     */
    refreshContracts() {
        // Filter contracts player qualifies for
        this.availableContracts = CONTRACTS.filter(contract => {
            // Check requirements
            if (contract.requirements) {
                if (contract.requirements.stat &&
                    this.gameState.characterStats?.getStat(contract.requirements.stat) < contract.requirements.value) {
                    return false;
                }
                if (contract.requirements.reputation &&
                    this.gameState.reputation < contract.requirements.reputation) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * Start a new project
     */
    startProject(contractId) {
        if (this.activeProject) return { success: false, reason: "Already working on a project." };

        const contract = CONTRACTS.find(c => c.id === contractId);
        if (!contract) return { success: false, reason: "Contract not found." };

        this.activeProject = {
            ...contract,
            currentStageIndex: 0,
            stageProgress: 0, // 0 to maxProgress
            totalProgress: 0,
            startTime: Date.now()
        };

        return { success: true, project: this.activeProject };
    }

    /**
     * Work on the current project (called by Game Loop)
     * @param {number} workPower - Base work amount per tick
     */
    workOnProject(workPower) {
        if (!this.activeProject) return null;

        const stage = this.activeProject.stages[this.activeProject.currentStageIndex];

        // AI Bonus Check
        let aiBonus = 0;
        if (this.gameState.aiSystem) {
            aiBonus = this.gameState.aiSystem?.processingPower || 0;

            // Intelligence Bonus for specific stages?
            // e.g. Cleaning is faster with high AI Int
        }

        // Hardware Bonus Check
        // if (stage.type === PROJECT_TYPES.MODELING && hasGPU) bonus += 5;

        const effectiveWork = workPower + aiBonus;
        this.activeProject.stageProgress += effectiveWork;

        // Check stage completion
        if (this.activeProject.stageProgress >= stage.maxProgress) {
            return this.completeStage();
        }

        return {
            status: 'working',
            stage: stage.name,
            progress: (this.activeProject.stageProgress / stage.maxProgress) * 100
        };
    }

    /**
     * Complete the current stage
     */
    completeStage() {
        if (!this.activeProject || !this.activeProject.stages) return null;
        
        const currentIndex = this.activeProject.currentStageIndex || 0;
        const stage = this.activeProject.stages[currentIndex];
        
        if (!stage) return null;

        // If there was a challenge, we assume it was passed (UI handles the challenge interaction before working)
        // Or we pause here if challenge not met? 
        // Design Decision: Challenges pause the "Fast Forward".

        // Move to next stage
        this.activeProject.currentStageIndex = (currentIndex + 1);
        this.activeProject.stageProgress = 0;

        // Check if Project is fully complete
        if (this.activeProject.currentStageIndex >= this.activeProject.stages.length) {
            return this.completeProject();
        }

        const nextStage = this.activeProject.stages[this.activeProject.currentStageIndex];
        return {
            status: 'stage_complete',
            nextStage: nextStage || null
        };
    }

    /**
     * Complete the entire project
     */
    completeProject() {
        if (!this.activeProject) return null;
        
        const project = this.activeProject;

        // Rewards
        if (project.reward) {
            this.gameState.money = (this.gameState.money || 0) + project.reward;
        }
        
        if (project.xpReward && this.gameState?.characterStats) {
            Object.entries(project.xpReward || {}).forEach(([skill, amount]) => {
                if (this.gameState.characterStats?.addExperience && typeof amount === 'number') {
                    try {
                        this.gameState.characterStats.addExperience(skill, amount);
                    } catch (error) {
                        console.warn('Failed to add experience:', error);
                    }
                }
            });
        }
        
        if (project.ethics && this.gameState?.characterStats?.modifyEthics) {
            try {
                this.gameState.characterStats.modifyEthics(project.ethics);
            } catch (error) {
                console.warn('Failed to modify ethics:', error);
            }
        }

        // Reputation
        if (project.difficulty) {
            this.gameState.reputation = (this.gameState.reputation || 0) + (project.difficulty * 10);
        }

        // Track history
        if (project.id) {
            if (!this.completedProjects) this.completedProjects = [];
            this.completedProjects.push(project.id);
            if (!this.projectHistory) this.projectHistory = {};
            this.projectHistory[project.id] = (this.projectHistory[project.id] || 0) + 1;
        }

        this.activeProject = null;

        return {
            status: 'project_complete',
            project: project,
            reward: project.reward || 0
        };
    }

    /**
     * Cancel current
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
