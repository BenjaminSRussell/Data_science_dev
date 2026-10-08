/**
 * RomanceProgressionSystem.js
 * Non-sexual romance progression
 * 2 incomes, working together, difficult choices, advice
 */

import { pickState, applyState } from '../../utils/StateSerializer.js';

// What each bias means; used for the advice text (#123)
export const PARTNER_BIASES = {
    ethical: 'Always chooses ethical options',
    practical: 'Prefers practical solutions',
    ambitious: 'Encourages risk-taking',
    cautious: 'Prefers safe choices',
    creative: 'Suggests creative solutions'
};

// Points needed before you can propose
export const PROPOSE_POINTS = 100;
// Points needed before a crush can turn into dating
export const DATING_POINTS = 50;

export class RomanceProgressionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.romancePartner = null;
        this.relationshipStage = 'none'; // none, dating, engaged, married
        this.relationshipPoints = 0;
        this.difficultChoices = [];
        this.partnerBias = null;
    }
    
    /**
     * Start dating someone
     */
    startDating(partnerId) {
        const partner = this.gameState.npcManager?.getNPC(partnerId);
        if (!partner) return { success: false, message: 'Unknown person' };

        // Starting something new must not silently erase a marriage or an
        // engagement (#1417)
        if (this.relationshipStage === 'married' || this.relationshipStage === 'engaged') {
            return {
                success: false,
                message: `You're ${this.relationshipStage} to ${this.romancePartner?.name || 'someone'}`
            };
        }
        if (this.romancePartner?.id === partnerId) {
            return { success: false, message: `Already dating ${partner.name}` };
        }
        
        this.romancePartner = {
            id: partnerId,
            name: partner.name,
            job: partner.title,
            income: this.calculatePartnerIncome(partner),
            bias: this.determineBias(partner),
            relationshipPoints: 0,
            stage: 'dating',
            started: this.gameState.timeManager?.totalDays || 1
        };
        
        this.relationshipStage = 'dating';
        // Points belong to a relationship; a new partner starts from zero, so
        // you can't propose to someone you just met (#2062)
        this.relationshipPoints = 0;
        this.canPropose = false;
        this.partnerBias = this.romancePartner.bias;
        this.syncPartner();
        
        return { success: true, partner: this.romancePartner };
    }

    /**
     * Keep the partner record's stage/points in step with the system (#2060)
     */
    syncPartner() {
        if (!this.romancePartner) return;
        this.romancePartner.stage = this.relationshipStage;
        this.romancePartner.relationshipPoints = this.relationshipPoints;
    }
    
    /**
     * Calculate partner income
     */
    calculatePartnerIncome(partner) {
        // An explicit income on the NPC wins; otherwise estimate from their job title
        if (typeof partner?.income === 'number') return partner.income;
        const title = (partner?.title || '').toLowerCase();
        const incomeByKeyword = [
            ['professor', 6000],
            ['engineer', 7500],
            ['manager', 7000],
            ['consultant', 5500],
            ['analyst', 5000],
            ['researcher', 4500],
            ['influencer', 8000],
            ['librarian', 3500],
            ['teacher', 3500],
            ['artist', 3000]
        ];
        const match = incomeByKeyword.find(([keyword]) => title.includes(keyword));
        return match ? match[1] : 4000;
    }

    /**
     * Determine partner's bias
     */
    determineBias(partner) {
        // An explicit bias on the NPC wins
        if (PARTNER_BIASES[partner?.romanceBias]) return partner.romanceBias;

        // Personalities, including the ones real romance NPCs use (#1413, #2058)
        const byPersonality = {
            professional: 'practical',
            competitive: 'ambitious',
            high_maintenance: 'ambitious',
            mysterious: 'creative',
            grumpy: 'cautious'
        };
        if (byPersonality[partner?.personality]) return byPersonality[partner.personality];

        // Most partners are 'friendly', so their job decides
        const title = (partner?.title || '').toLowerCase();
        const byJob = [
            ['engineer', 'practical'], ['analyst', 'practical'],
            ['artist', 'creative'], ['designer', 'creative'], ['writer', 'creative'],
            ['influencer', 'ambitious'], ['founder', 'ambitious'],
            ['accountant', 'cautious'], ['nurse', 'cautious']
        ];
        const match = byJob.find(([keyword]) => title.includes(keyword));
        return match ? match[1] : 'ethical';
    }

    /**
     * Description of a bias (#123)
     */
    describeBias(bias) {
        return PARTNER_BIASES[bias] || null;
    }
    
    /**
     * Get difficult choice advice
     */
    getAdviceForChoice(choiceId, options) {
        if (!this.romancePartner || this.relationshipStage === 'none') {
            return null;
        }
        
        const bias = this.partnerBias;
        let recommendation = null;
        
        // Partner gives advice based on their bias
        switch (bias) {
            case 'ethical':
                recommendation = options.find(o => o.ethical === true) || options[0];
                break;
            case 'practical':
                recommendation = options.find(o => o.practical === true) || options[0];
                break;
            case 'ambitious':
                recommendation = options.find(o => o.risky === true && o.reward > 0) || options[0];
                break;
            case 'cautious':
                recommendation = options.find(o => o.safe === true) || options[0];
                break;
            case 'creative':
                recommendation = options.find(o => o.creative === true) || options[0];
                break;
            default:
                recommendation = options[0];
        }
        
        return {
            partner: this.romancePartner.name,
            bias: bias,
            recommendation: recommendation,
            message: this.getAdviceMessage(bias, recommendation)
        };
    }
    
    /**
     * Get advice message
     */
    getAdviceMessage(bias, recommendation) {
        const messages = {
            'ethical': `I think we should choose the ethical option. It's the right thing to do.`,
            'practical': `Let's go with the most practical solution. It makes the most sense.`,
            'ambitious': `I think we should take the risk. The reward is worth it.`,
            'cautious': `Let's be careful here. The safe option is better.`,
            'creative': `What if we tried something different? The creative approach might work.`
        };
        
        const base = messages[bias] || 'I think this is the best choice.';
        // Name the option being recommended (#124)
        const label = recommendation?.text || recommendation?.label || recommendation?.name || recommendation?.id;
        return label ? `${base} My vote: "${label}".` : base;
    }
    
    /**
     * Work together on project
     */
    workTogether(projectId) {
        if (!this.romancePartner || this.relationshipStage === 'none') {
            return { success: false, message: 'No partner to work with' };
        }

        const project = this.findProject(projectId);
        if (!project) {
            return { success: false, message: 'Unknown project' };
        }
        
        // Combined income and skills
        const combinedIncome = (this.gameState.economySystem?.money || 0) + this.romancePartner.income;
        const bonus = this.projectBonus(project);
        
        return {
            success: true,
            projectId: project.id,
            combinedIncome: combinedIncome,
            bonus: bonus,
            message: `You and ${this.romancePartner.name} work together on ${project.title || project.name || 'the project'}`
        };
    }

    /**
     * Look up a project/task by id (or accept the object itself)
     */
    findProject(projectId) {
        if (projectId && typeof projectId === 'object') return projectId;
        if (projectId == null) return null;
        const gs = this.gameState || {};
        const pools = [
            [gs.currentTask],
            gs.taskSystem?.availableTasks,
            gs.taskSystem?.tasks,
            gs.projects
        ];
        for (const pool of pools) {
            const hit = (Array.isArray(pool) ? pool : []).find(p => p && p.id === projectId);
            if (hit) return hit;
        }
        return null;
    }

    /**
     * The working-together bonus depends on the project (#125): harder
     * projects gain more from two people, and a partner whose job matches
     * the project's field adds a bit more. Range 1.25x - 1.85x.
     */
    projectBonus(project) {
        const difficulty = Math.min(10, Math.max(1, Number(project?.difficulty) || 5));
        let bonus = 1.25 + difficulty * 0.05;
        const field = `${project?.category || ''} ${project?.type || ''} ${project?.title || ''}`.toLowerCase();
        const job = (this.romancePartner?.job || '').toLowerCase();
        const jobWords = job.split(/[^a-z]+/).filter(w => w.length > 3);
        if (jobWords.some(w => field.includes(w))) bonus += 0.1;
        return Math.round(bonus * 100) / 100;
    }
    
    /**
     * Propose marriage
     */
    propose() {
        if (this.relationshipStage !== 'dating' || this.relationshipPoints < PROPOSE_POINTS) {
            return { success: false, message: 'Not ready for marriage' };
        }
        
        this.relationshipStage = 'engaged';
        this.canPropose = false;
        this.syncPartner();
        return { success: true, message: 'Engaged!' };
    }
    
    /**
     * Get married
     */
    getMarried() {
        if (this.relationshipStage !== 'engaged') {
            return { success: false, message: 'Not engaged' };
        }
        
        this.relationshipStage = 'married';
        this.syncPartner();
        
        // Combined household income
        const householdIncome = (this.gameState.economySystem?.money || 0) + this.romancePartner.income;
        
        return {
            success: true,
            message: `You and ${this.romancePartner.name} are now married`,
            householdIncome: householdIncome
        };
    }
    
    /**
     * Increase relationship points
     */
    increaseRelationship(points) {
        this.relationshipPoints = Math.max(0, this.relationshipPoints + (Number(points) || 0));

        // Stage milestones: these used to be empty if-blocks (#2059, #1414).
        // Dating and proposing stay player choices; this unlocks them and
        // reports what just became possible.
        const wasProposable = !!this.canPropose;
        this.canStartDating = this.relationshipStage === 'none' && this.relationshipPoints >= DATING_POINTS;
        this.canPropose = this.relationshipStage === 'dating' && this.relationshipPoints >= PROPOSE_POINTS;
        this.syncPartner();

        return {
            points: this.relationshipPoints,
            stage: this.relationshipStage,
            canStartDating: this.canStartDating,
            canPropose: this.canPropose,
            proposeUnlocked: this.canPropose && !wasProposable
        };
    }

    /**
     * Serialize player-visible state for saving
     */
    toJSON() {
        return pickState(this, ['romancePartner', 'relationshipStage', 'relationshipPoints', 'difficultChoices', 'partnerBias']);
    }

    /**
     * Restore state from a save (missing fields keep constructor defaults)
     */
    fromJSON(data) {
        if (!data) return;
        applyState(this, data, ['romancePartner', 'relationshipStage', 'relationshipPoints', 'difficultChoices', 'partnerBias']);
    }
}
