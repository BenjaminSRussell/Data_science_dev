/**
 * StorylineManager.js
 * Main storyline about dealing with world changes and difficulty
 */

export class StorylineManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.storylinePhase = 'early'; // early, mid, late, endgame
        this.majorDecisions = [];
        this.storylineProgress = 0; // 0-100
        this.currentArc = null;
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
        const ethics = this.gameState.characterStats?.getStat('ethics') || 0;
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
        const ethics = this.gameState.characterStats?.getStat('ethics') || 0;

        const decisions = [];

        // Early game decisions
        if (phase === 'early') {
            decisions.push({
                id: 'first_job_offer',
                title: 'Your First Big Opportunity',
                description: 'A company offers you a job, but they want you to manipulate data.',
                choices: {
                    accept: {
                        message: 'You take the job. The money is good, but something feels wrong.',
                        consequences: { ethics: -10, money: 5000, reputation: 50 },
                        progress: 10
                    },
                    reject: {
                        message: 'You decline. It\'s harder, but you sleep better at night.',
                        consequences: { ethics: 10, reputation: 20 },
                        progress: 5
                    },
                    negotiate: {
                        message: 'You negotiate for ethical practices. They agree, but pay less.',
                        consequences: { ethics: 5, money: 3000, reputation: 40 },
                        progress: 8
                    }
                }
            });
        }

        // Mid game decisions
        if (phase === 'mid') {
            decisions.push({
                id: 'whistleblower',
                title: 'You Discover Something Wrong',
                description: 'You find evidence of unethical practices at your company.',
                choices: {
                    expose: {
                        message: 'You go public. You lose your job, but you did the right thing.',
                        consequences: { ethics: 20, reputation: -50, money: -10000 },
                        progress: 15
                    },
                    stay_quiet: {
                        message: 'You stay quiet. The guilt weighs on you.',
                        consequences: { ethics: -15, money: 5000 },
                        progress: 5
                    },
                    internal_report: {
                        message: 'You report internally. It\'s handled quietly.',
                        consequences: { ethics: 5, reputation: 30 },
                        progress: 10
                    }
                }
            });
        }

        // Ethics-based decisions
        if (ethics < -20) {
            decisions.push({
                id: 'criminal_opportunity',
                title: 'A Lucrative But Illegal Offer',
                description: 'Someone offers you big money for something clearly illegal.',
                choices: {
                    accept: {
                        message: 'You take the deal. The money is incredible, but you\'re crossing a line.',
                        consequences: { ethics: -30, money: 50000, risk: 'arrest' },
                        progress: 20
                    },
                    reject: {
                        message: 'You walk away. It\'s tempting, but you know better.',
                        consequences: { ethics: 10 },
                        progress: 5
                    }
                }
            });
        }

        return decisions;
    }

    /**
     * Apply consequences
     */
    applyConsequences(consequences) {
        if (consequences.ethics !== undefined) {
            this.gameState.characterStats?.modifyStat('ethics', consequences.ethics);
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
                this.gameState.mainGame.handleArrest('Illegal activity');
            }
        }
    }

    /**
     * Check for phase transition
     */
    checkPhaseTransition() {
        const newPhase = this.determinePhase();
        if (newPhase !== this.storylinePhase) {
            this.storylinePhase = newPhase;
            this.currentArc = this.getCurrentArc();
            
            // Trigger phase transition event
            return {
                phaseChanged: true,
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
}




