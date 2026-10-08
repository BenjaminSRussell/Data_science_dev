/**
 * ProjectSystem.js
 * Manages active projects, progress, and stage transitions.
 */
import { CONTRACTS } from './ProjectDatabase.js';

/**
 * Contract xpReward keys are data-science skills; CharacterStats only levels
 * its core stats. Map each skill onto the stat it trains so project XP is not
 * silently dropped (#2041).
 */
export const SKILL_TO_STAT = {
    python: 'intelligence',
    data_engineering: 'focus',
    statistics: 'analytics',
    machine_learning: 'intelligence',
    sql: 'analytics',
    communication: 'charisma',
    charisma: 'charisma'
};

/** Deep-copy a contract so stage edits never mutate the module-level CONTRACTS (#1792) */
function cloneContract(contract) {
    if (typeof structuredClone === 'function') return structuredClone(contract);
    return JSON.parse(JSON.stringify(contract));
}

export class ProjectSystem {
    constructor(gameState) {
        this.gameState = gameState;

        this.activeProject = null; // Currently working on
        this.availableContracts = []; // List of available jobs

        this.completedProjects = [];
        this.projectHistory = {}; // { id: count }

        // Result of the last stage/project completion, consumed by checkProgress()
        this.lastResult = null;

        // Refresh contracts on init
        this.refreshContracts();
    }

    /**
     * Generate available contracts based on player stats
     */
    refreshContracts() {
        const completed = new Set(this.completedProjects || []);
        const activeId = this.activeProject?.id;
        // Completed and in-progress contracts are not offered again (#1790)
        this.availableContracts = CONTRACTS.filter(contract =>
            !completed.has(contract.id) &&
            contract.id !== activeId &&
            this.meetsRequirements(contract)
        );
        return this.availableContracts;
    }

    /**
     * Whether the player qualifies for a contract.
     * - 'reputation' lives on gameState, not CharacterStats (#1110, #2363)
     * - fails closed when the stat store is unavailable (#1519)
     */
    meetsRequirements(contract) {
        const req = contract?.requirements;
        if (!req) return true;
        if (req.stat) {
            let value;
            if (req.stat === 'reputation') {
                value = this.gameState.reputation;
            } else if (typeof this.gameState.characterStats?.getStat === 'function') {
                value = this.gameState.characterStats.getStat(req.stat);
            }
            if (typeof value !== 'number' || !(value >= req.value)) return false;
        }
        if (req.reputation !== undefined && !((this.gameState.reputation || 0) >= req.reputation)) {
            return false;
        }
        return true;
    }

    /**
     * Start a new project
     */
    startProject(contractId) {
        if (this.activeProject) return { success: false, reason: "Already working on a project." };

        const contract = CONTRACTS.find(c => c.id === contractId);
        if (!contract) return { success: false, reason: "Contract not found." };
        if ((this.completedProjects || []).includes(contractId)) {
            return { success: false, reason: "You already completed this contract." };
        }
        // Re-validate at accept time, like ContractSystem.acceptContract (#163)
        if (!this.meetsRequirements(contract)) {
            return { success: false, reason: "You don't meet this contract's requirements yet." };
        }

        this.activeProject = {
            ...cloneContract(contract),
            currentStageIndex: 0,
            stageProgress: 0, // 0 to maxProgress
            totalProgress: 0,
            startTime: Date.now()
        };
        this.lastResult = null;
        this.availableContracts = this.availableContracts.filter(c => c.id !== contractId);

        return { success: true, project: this.activeProject };
    }

    /**
     * Work on the current project (called by Game Loop)
     * @param {number} workPower - Base work amount per tick
     */
    workOnProject(workPower) {
        if (!this.activeProject) return null;

        const stages = this.activeProject.stages;
        const stage = Array.isArray(stages) ? stages[this.activeProject.currentStageIndex] : null;
        // Corrupt/old project data: nothing to work on (#1112)
        if (!stage || !(stage.maxProgress > 0)) return null;

        // AI Bonus Check
        let aiBonus = 0;
        if (this.gameState.aiSystem) {
            aiBonus = this.gameState.aiSystem?.processingPower || 0;

            // Intelligence Bonus for specific stages?
            // e.g. Cleaning is faster with high AI Int
        }

        // Hardware Bonus Check
        // if (stage.type === PROJECT_TYPES.MODELING && hasGPU) bonus += 5;

        const effectiveWork = Math.max(0, (Number(workPower) || 0) + aiBonus);
        this.activeProject.stageProgress += effectiveWork;
        // totalProgress tracks all work put into the project (#1517)
        this.activeProject.totalProgress = (this.activeProject.totalProgress || 0) + effectiveWork;

        // Check stage completion
        if (this.activeProject.stageProgress >= stage.maxProgress) {
            const result = this.completeStage();
            this.lastResult = result;
            return result;
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

        // Move to next stage, carrying overshoot into it (#1117, #1518, #1789)
        const overflow = Math.max(0, (this.activeProject.stageProgress || 0) - (stage.maxProgress || 0));
        this.activeProject.currentStageIndex = (currentIndex + 1);
        this.activeProject.stageProgress = 0;

        // Check if Project is fully complete
        if (this.activeProject.currentStageIndex >= this.activeProject.stages.length) {
            return this.completeProject();
        }

        const nextStage = this.activeProject.stages[this.activeProject.currentStageIndex];
        // Overflow never completes more than one stage per tick
        this.activeProject.stageProgress = nextStage?.maxProgress
            ? Math.min(overflow, nextStage.maxProgress - 1)
            : overflow;
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
            this.gameState.totalEarned = (this.gameState.totalEarned || 0) + project.reward;
            this.gameState.weeklyIncome = (this.gameState.weeklyIncome || 0) + project.reward; // taxed weekly (#1989)
        }
        
        const xpGained = {};
        if (project.xpReward && this.gameState?.characterStats) {
            const cs = this.gameState.characterStats;
            // Same calibration as CharacterStats.train(): x10 and luck bonus (#2041)
            const luckBonus = 1 + ((cs.stats?.luck || 0) * 0.01);
            Object.entries(project.xpReward || {}).forEach(([skill, amount]) => {
                if (typeof cs.addExperience !== 'function' || typeof amount !== 'number') return;
                const statId = SKILL_TO_STAT[skill] || skill;
                const actual = Math.floor(amount * 10 * luckBonus);
                try {
                    cs.addExperience(statId, actual);
                    xpGained[statId] = (xpGained[statId] || 0) + actual;
                } catch (error) {
                    console.warn('Failed to add experience:', error);
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

        // Reputation: shady work (negative ethics) costs reputation instead of
        // earning it like honest work (#1115)
        let reputationChange = 0;
        if (project.difficulty) reputationChange += project.difficulty * 10;
        if (typeof project.ethics === 'number' && project.ethics < 0) {
            reputationChange += project.ethics * 2;
        }
        if (reputationChange !== 0) {
            this.gameState.reputation = Math.max(0, (this.gameState.reputation || 0) + reputationChange);
        }

        // Completed projects yield Data Points for training the AI (#1807)
        const dataPoints = Math.max(1, (project.difficulty || 1) * 5 + (project.stages?.length || 0) * 2);
        if (this.gameState.aiSystem) {
            this.gameState.aiSystem.dataPoints = (this.gameState.aiSystem.dataPoints || 0) + dataPoints;
        }

        // Track history
        if (project.id) {
            if (!this.completedProjects) this.completedProjects = [];
            this.completedProjects.push(project.id);
            if (!this.projectHistory) this.projectHistory = {};
            this.projectHistory[project.id] = (this.projectHistory[project.id] || 0) + 1;
        }

        this.activeProject = null;
        // Stats/reputation changed: re-evaluate what the player qualifies for (#1116)
        this.refreshContracts();

        return {
            status: 'project_complete',
            project: project,
            reward: project.reward || 0,
            reputationChange,
            xpGained,
            dataPoints
        };
    }

    /**
     * Cancel current
     */
    cancelProject() {
        if (!this.activeProject) return { success: false, reason: 'No active project.' };
        const project = this.activeProject;
        this.activeProject = null;
        this.lastResult = null;
        this.refreshContracts();
        return { success: true, project };
    }

    /**
     * Return (and clear) the outcome of the most recent stage/project
     * completion. Called by finishWorkingSession (#1109, #2362).
     */
    checkProgress() {
        const result = this.lastResult;
        this.lastResult = null;
        return result;
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
        this.lastResult = null;
        this.refreshContracts();
    }
}
