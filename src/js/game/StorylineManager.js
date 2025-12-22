/**
 * StorylineManager.js
 * Main storyline about dealing with world changes and difficulty
 */

export class StorylineManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.gameState.mainGame = null; // Will be set by MainGame
        this.storylinePhase = 'early'; // early, mid, late, endgame
        this.majorDecisions = [];
        this.storylineProgress = 0; // 0-100
        this.currentArc = null;
        this.lastDecisionCheck = 0; // Timestamp of last decision check
        this.decisionCooldown = 30000; // 30 seconds between decision checks
    }

    /**
     * Initialize storyline
     */
    initialize() {
        this.storylinePhase = this.determinePhase();
        this.currentArc = this.getCurrentArc();
    }

    /**
     * Determine current phase
     */
    determinePhase() {
        const days = this.gameState.timeManager?.totalDays || 0;
        const reputation = this.gameState.reputation || 0;

        if (days < 30) return 'early';
        if (days < 90) return 'mid';
        if (days < 180) return 'late';
        return 'endgame';
    }

    /**
     * Get current story arc
     */
    getCurrentArc() {
        const ethics = this.gameState.characterStats?.ethics || 0;
        const phase = this.storylinePhase;

        if (ethics < -30) {
            return {
                name: 'The Dark Path',
                description: 'Your choices have consequences. The world reacts to your actions.',
                theme: 'corruption',
                challenges: ['legal_trouble', 'relationship_loss', 'isolation']
            };
        } else if (ethics > 30) {
            return {
                name: 'The Righteous Path',
                description: 'You stand for what\'s right, but the world tests your resolve.',
                theme: 'integrity',
                challenges: ['financial_struggle', 'temptation', 'sacrifice']
            };
        } else {
            return {
                name: 'The Balanced Path',
                description: 'You navigate the complexities of life, trying to find balance.',
                theme: 'survival',
                challenges: ['uncertainty', 'competition', 'change']
            };
        }
    }

    /**
     * Process major decision
     */
    processDecision(decisionId, choice) {
        const decision = this.getDecision(decisionId);
        if (!decision) return null;

        const result = decision.choices[choice];
        if (!result) return null;

        // Apply consequences
        if (result.consequences) {
            this.applyConsequences(result.consequences);
        }

        // Track decision
        this.majorDecisions.push({
            decisionId,
            choice,
            timestamp: Date.now(),
            week: Math.floor((this.gameState.timeManager?.totalDays || 0) / 7)
        });

        // Update storyline progress
        this.storylineProgress = Math.min(100, this.storylineProgress + (result.progress || 0));

        // Check for phase transitions
        this.checkPhaseTransition();

        return {
            success: true,
            message: result.message,
            consequences: result.consequences,
            progress: this.storylineProgress
        };
    }

    /**
     * Get decision by ID
     */
    getDecision(decisionId) {
        const decisions = this.getAvailableDecisions();
        return decisions.find(d => d.id === decisionId);
    }

    /**
     * Get available decisions based on phase and progress
     */
    getAvailableDecisions() {
        const phase = this.storylinePhase;
        const ethics = this.gameState.characterStats?.ethics || 0;

        const decisions = [];

        // Early game decisions
        if (phase === 'early') {
            // Only show first_job_offer if player hasn't made it yet
            const hasFirstJobDecision = this.majorDecisions.some(d => d.decisionId === 'first_job_offer');
            if (!hasFirstJobDecision) {
                decisions.push({
                    id: 'first_job_offer',
                    title: 'Your First Big Opportunity',
                    description: 'A company offers you a job, but they want you to manipulate data to make their product look better. The pay is excellent - $5,000 upfront plus a salary. But you\'d be helping them deceive customers.',
                    context: 'You\'re struggling financially. Rent is due soon, and this job would solve your immediate problems. But you know it\'s wrong.',
                    phase: 'early',
                    choices: {
                        accept: {
                            message: 'You take the job. The money is good, but something feels wrong. You tell yourself it\'s just temporary, but you know you\'re compromising your values.',
                            consequences: { ethics: -10, money: 5000, reputation: 50 },
                            progress: 10,
                            storyImpact: 'You\'ve taken your first step down a path where money matters more than principles. The city notices.'
                        },
                        reject: {
                            message: 'You decline. It\'s harder financially, but you sleep better at night. You\'ll find another way. Your integrity is worth more than quick money.',
                            consequences: { ethics: 10, reputation: 20 },
                            progress: 5,
                            storyImpact: 'You\'ve chosen integrity over convenience. This decision shapes who you become. Opportunities will come, but they\'ll respect your values.'
                        },
                        negotiate: {
                            message: 'You negotiate for ethical practices. They agree to be more transparent, but pay less. It\'s a compromise, but one you can live with.',
                            consequences: { ethics: 5, money: 3000, reputation: 40 },
                            progress: 8,
                            storyImpact: 'You\'ve found a middle ground. You\'re learning to navigate the business world while staying true to yourself.'
                        }
                    }
                });
            }
        }

        // Mid game decisions
        if (phase === 'mid') {
            const hasWhistleblowerDecision = this.majorDecisions.some(d => d.decisionId === 'whistleblower');
            if (!hasWhistleblowerDecision) {
                decisions.push({
                    id: 'whistleblower',
                    title: 'You Discover Something Wrong',
                    description: 'While working on a project, you discover your company has been systematically hiding negative data about their product. Customers are being misled, and it could cause real harm. You have evidence.',
                    context: 'You\'ve built a career here. Exposing this could destroy your job, your reputation in the industry, and your financial stability. But people are being hurt. What kind of person are you?',
                    phase: 'mid',
                    choices: {
                        expose: {
                            message: 'You go public with the evidence. The story breaks, the company faces consequences, and you lose your job. But you did the right thing. Some people call you a hero, others a traitor. Your career path changes forever.',
                            consequences: { ethics: 20, reputation: -50, money: -10000 },
                            progress: 15,
                            storyImpact: 'You\'ve chosen truth over security. The city respects your courage, but your path forward will be different. New opportunities emerge from those who value integrity.'
                        },
                        stay_quiet: {
                            message: 'You stay quiet. The money keeps coming, your career continues smoothly, but the guilt weighs on you. Every time you see the product, you remember what you know. You\'ve chosen comfort over conscience.',
                            consequences: { ethics: -15, money: 5000 },
                            progress: 5,
                            storyImpact: 'You\'ve chosen silence. The money is good, but you\'ve lost something of yourself. The city remembers those who look the other way.'
                        },
                        internal_report: {
                            message: 'You report internally through proper channels. The issue is addressed quietly, changes are made, and you\'re recognized for your integrity. It\'s handled without public scandal.',
                            consequences: { ethics: 5, reputation: 30 },
                            progress: 10,
                            storyImpact: 'You\'ve found a balanced approach. You did the right thing while working within the system. Your reputation grows among those who value both ethics and professionalism.'
                        }
                    }
                });
            }
        }

        // Ethics-based decisions
        if (ethics < -20) {
            const hasCriminalDecision = this.majorDecisions.some(d => d.decisionId === 'criminal_opportunity');
            if (!hasCriminalDecision) {
                decisions.push({
                    id: 'criminal_opportunity',
                    title: 'A Lucrative But Illegal Offer',
                    description: 'A contact offers you $50,000 to manipulate stock market data to benefit their trading scheme. It\'s clearly illegal - market manipulation. But the money would change your life. No one would know. Probably.',
                    context: 'You\'ve been struggling, or maybe you\'re just greedy. This is a lot of money. But it\'s fraud. If you get caught, you could face serious legal consequences. But if you don\'t get caught...',
                    phase: phase,
                    choices: {
                        accept: {
                            message: 'You take the deal. The money is incredible - $50,000 in your account. You\'ve crossed a line you can\'t uncross. You\'re now a criminal. The money feels good, but you\'re always looking over your shoulder.',
                            consequences: { ethics: -30, money: 50000, risk: 'arrest' },
                            progress: 20,
                            storyImpact: 'You\'ve chosen the dark path. The money is real, but so are the risks. Your relationships with ethical people suffer. New, shadier opportunities open up. The city\'s underworld knows your name.'
                        },
                        reject: {
                            message: 'You walk away. It\'s tempting - incredibly tempting - but you know better. The money isn\'t worth becoming someone you\'re not. You sleep well that night.',
                            consequences: { ethics: 10 },
                            progress: 5,
                            storyImpact: 'You\'ve reaffirmed your values. Walking away from easy money takes strength. The city respects those with principles, even if they\'re not the richest.'
                        }
                    }
                });
            }
        }

        return decisions;
    }

    /**
     * Apply consequences
     */
    applyConsequences(consequences) {
        if (consequences.ethics !== undefined) {
            this.gameState.characterStats?.modifyEthics(consequences.ethics);
        }
        if (consequences.money !== undefined) {
            this.gameState.money = (this.gameState.money || 0) + consequences.money;
        }
        if (consequences.reputation !== undefined) {
            this.gameState.reputation = (this.gameState.reputation || 0) + consequences.reputation;
        }
        if (consequences.risk === 'arrest') {
            // Trigger arrest event
            if (this.gameState.mainGame) {
                this.gameState.mainGame?.handleArrest('Illegal activity');
            }
        }
    }

    /**
     * Check for phase transition
     */
    checkPhaseTransition() {
        const newPhase = this.determinePhase();
        if (newPhase !== this.storylinePhase) {
            const oldPhase = this.storylinePhase;
            this.storylinePhase = newPhase;
            this.currentArc = this.getCurrentArc();
            
            // Show act transition screen
            if (this.gameState.mainGame && this.gameState.mainGame.actTransitionScreen) {
                const summary = this.gameState.mainGame.actTransitionScreen.generateSummary(oldPhase);
                this.gameState.mainGame.actTransitionScreen.showActTransition(oldPhase, newPhase, summary);
            }
            
            // Trigger phase transition event
            return {
                phaseChanged: true,
                oldPhase,
                newPhase,
                arc: this.currentArc
            };
        }
        return { phaseChanged: false };
    }

    /**
     * Get current storyline status
     */
    getStatus() {
        return {
            phase: this.storylinePhase,
            progress: this.storylineProgress,
            arc: this.currentArc,
            decisions: this.majorDecisions.length
        };
    }

    /**
     * Check for and trigger available major decisions
     * Returns the decision if one is available, null otherwise
     */
    checkForAvailableDecisions() {
        const available = this.getAvailableDecisions();
        
        // Filter out decisions that have already been made
        const madeDecisionIds = this.majorDecisions.map(d => d.decisionId);
        const newDecisions = available.filter(d => !madeDecisionIds.includes(d.id));
        
        return newDecisions.length > 0 ? newDecisions[0] : null;
    }

    /**
     * Trigger a major decision if one is available
     * Returns true if a decision was triggered, false otherwise
     */
    triggerDecisionIfAvailable() {
        const now = Date.now();
        
        // Cooldown check - don't check too frequently
        if (now - this.lastDecisionCheck < this.decisionCooldown) {
            return false;
        }
        
        this.lastDecisionCheck = now;
        
        const decision = this.checkForAvailableDecisions();
        if (!decision) return false;

        // Notify the game to show the decision modal
        if (this.gameState.mainGame && this.gameState.mainGame.storyUI) {
            this.gameState.mainGame.storyUI.showDecisionModal(decision);
            return true;
        }

        return false;
    }
}





