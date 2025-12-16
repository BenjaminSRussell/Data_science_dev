/**
 * RomanceProgressionSystem.js
 * Non-sexual romance progression
 * 2 incomes, working together, difficult choices, advice
 */

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
        if (!partner) return { success: false };
        
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
        this.partnerBias = this.romancePartner.bias;
        
        return { success: true, partner: this.romancePartner };
    }
    
    /**
     * Calculate partner income
     */
    calculatePartnerIncome(partner) {
        // Base income based on partner's job/title
        const incomeMap = {
            'professor': 6000,
            'analyst': 5000,
            'manager': 7000,
            'consultant': 5500,
            'researcher': 4500
        };
        
        return incomeMap[partner.type] || 4000;
    }
    
    /**
     * Determine partner's bias
     */
    determineBias(partner) {
        // Each partner has a bias that affects their advice
        const biases = {
            'ethical': 'Always chooses ethical options',
            'practical': 'Prefers practical solutions',
            'ambitious': 'Encourages risk-taking',
            'cautious': 'Prefers safe choices',
            'creative': 'Suggests creative solutions'
        };
        
        // Assign based on personality
        if (partner.personality === 'professional') return 'practical';
        if (partner.personality === 'competitive') return 'ambitious';
        if (partner.personality === 'mysterious') return 'creative';
        if (partner.personality === 'grumpy') return 'cautious';
        return 'ethical';
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
        
        return messages[bias] || 'I think this is the best choice.';
    }
    
    /**
     * Work together on project
     */
    workTogether(projectId) {
        if (!this.romancePartner || this.relationshipStage === 'none') {
            return { success: false, message: 'No partner to work with' };
        }
        
        // Combined income and skills
        const combinedIncome = (this.gameState.economySystem?.money || 0) + this.romancePartner.income;
        const bonus = 1.5; // 50% bonus when working together
        
        return {
            success: true,
            combinedIncome: combinedIncome,
            bonus: bonus,
            message: `You and ${this.romancePartner.name} work together on the project`
        };
    }
    
    /**
     * Propose marriage
     */
    propose() {
        if (this.relationshipStage !== 'dating' || this.relationshipPoints < 100) {
            return { success: false, message: 'Not ready for marriage' };
        }
        
        this.relationshipStage = 'engaged';
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
        this.relationshipPoints += points;
        
        // Auto-progress stages
        if (this.relationshipPoints >= 50 && this.relationshipStage === 'none') {
            // Can start dating
        }
        if (this.relationshipPoints >= 100 && this.relationshipStage === 'dating') {
            // Can propose
        }
    }
}

