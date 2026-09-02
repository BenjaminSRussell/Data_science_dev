class GameEndingSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.endingTriggered = false;
        this.endingType = null;
        this.endingData = null;
    }

    /**
     * Check all victory conditions and trigger the appropriate ending
     */
    checkVictoryConditions() {
        const checks = [
            this.checkSpeedrun,
            this.checkEarlyRetirement,
            this.checkEthicsEnding,
            this.checkCompanyOwnership,
            this.checkResearchBreakthrough,
            this.checkEducationCompletion,
            this.checkFinalRank,
            this.checkMillionaire,
            this.checkEndGameMap,
            this.checkPerfectScores
        ];

        const applicableEndings = checks
            .map(check => check.call(this))
            .filter(ending => ending !== null);

        if (applicableEndings.length > 0) {
            // Sort endings by specificity (higher index for more specific endings)
            const sortedEndings = applicableEndings.sort((a, b) => {
                const order = ['final_rank', 'millionaire', 'end_game_map', 'perfect_scores', 'early_retirement', 'speedrun', 'ethical_leader', 'ruthless_climber', 'company_owner', 'research_master', 'education_master'];
                return order.indexOf(b.type) - order.indexOf(a.type);
            });

            // Trigger the most specific ending
            return this.triggerEnding(sortedEndings[0]);
        }

        return null;
    }

    /**
     * Check for generic final rank achievement
     */
    checkFinalRank() {
        const maxRankIndex = RANKS.length - 1;
        if (this.gameState.rankIndex >= maxRankIndex) {
            return {
                type: 'final_rank',
                title: 'Top of the Line',
                message: 'Congratulations on reaching the top rank! You are the best!',
                showEnding: true
            };
        }
        return null;
    }

    /**
     * Check for millionaire status
     */
    checkMillionaire() {
        if (this.gameState.money >= 1000000) {
            return {
                type: 'millionaire',
                title: 'Millionaire',
                message: 'You\'ve become a millionaire! That\'s a lot of money!',
                showEnding: true
            };
        }
        return null;
    }

    /**
     * Check for end game map achievement
     */
    checkEndGameMap() {
        if (this.gameState.endGameMapUnlocked) {
            return {
                type: 'end_game_map',
                title: 'End Game Map Unlocked',
                message: 'You\'ve unlocked the end game map! You\'re on the right track!',
                showEnding: true
            };
        }
        return null;
    }

    /**
     * Check for perfect scores achievement
     */
    checkPerfectScores() {
        if (this.gameState.perfectScores >= 10) {
            return {
                type: 'perfect_scores',
                title: 'Perfect Scores',
                message: 'You\'ve achieved perfect scores on 10 tasks! That\'s amazing!',
                showEnding: true
            };
        }
        return null;
    }

    /**
     * Check for early retirement (< 50 days)
     */
    checkEarlyRetirement() {
        const days = this.gameState.timeManager?.totalDays || 0;
        const maxRankIndex = RANKS.length - 1;
        if (days < 50 && this.gameState.rankIndex >= maxRankIndex) {
            return {
                type: 'early_retirement',
                title: 'Early Retirement',
                message: 'You\'ve reached the top in under 50 days! A true prodigy!',
                showEnding: true
            };
        }
        return null;
    }

    /**
     * Check for speedrun (< 30 days)
     */
    checkSpeedrun() {
        const days = this.gameState.timeManager?.totalDays || 0;
        const maxRankIndex = RANKS.length - 1;
        if (days < 30 && this.gameState.rankIndex >= maxRankIndex) {
            return {
                type: 'speedrun',
                title: 'Speed Demon',
                message: 'Incredible! You completed your career journey in under 30 days!',
                showEnding: true
            };
        }
        return null;
    }

    /**
     * Check ethics-based endings
     */
    checkEthicsEnding() {
        const ethics = this.gameState.characterStats?.getStat?.('ethics') || 0;
        const maxRankIndex = RANKS.length - 1;
        
        if (this.gameState.rankIndex >= maxRankIndex) {
            if (ethics >= 80) {
                return {
                    type: 'ethical_leader',
                    title: 'Ethical Leader',
                    message: 'You\'ve reached the top while maintaining high ethical standards. A true leader!',
                    showEnding: true
                };
            } else if (ethics <= -50) {
                return {
                    type: 'ruthless_climber',
                    title: 'Ruthless Climber',
                    message: 'You\'ve reached the top through any means necessary. Power at any cost!',
                    showEnding: true
                };
            }
        }
        return null;
    }

    /**
     * Check for company ownership
     */
    checkCompanyOwnership() {
        if (this.gameState.investmentEcommerceSystem) {
            const company = this.gameState.investmentEcommerceSystem?.getCompany?.();
            if (company && company.ownership >= 100) {
                return {
                    type: 'company_owner',
                    title: 'Company Owner',
                    message: 'You\'ve built and own your own company! Entrepreneurship achieved!',
                    showEnding: true
                };
            }
        }
        return null;
    }

    /**
     * Check for research breakthrough
     */
    checkResearchBreakthrough() {
        if (this.gameState.researchPaperSystem) {
            const papers = this.gameState.researchPaperSystem?.getPublishedPapers?.() || [];
            const breakthroughPapers = papers.filter(p => p.impact && p.impact.includes('breakthrough'));
            if (breakthroughPapers.length >= 3) {
                return {
                    type: 'research_master',
                    title: 'Research Master',
                    message: 'You\'ve published multiple breakthrough research papers! Academic excellence!',
                    showEnding: true
                };
            }
        }
        return null;
    }

    /**
     * Check for education completion
     */
    checkEducationCompletion() {
        if (this.gameState.educationSystem) {
            const completedCourses = this.gameState.educationSystem?.completedCourses || [];
            const degrees = this.gameState.educationSystem?.degrees || [];
            const allDegrees = degrees.every(d => d.acquired);
            
            if (completedCourses.length >= 10 && allDegrees) {
                return {
                    type: 'education_master',
                    title: 'Education Master',
                    message: 'You\'ve completed all courses and earned all degrees! Academic excellence!',
                    showEnding: true
                };
            }
        }
        return null;
    }

    /**
     * Trigger an ending
     */
    triggerEnding(endingData) {
        if (this.endingTriggered) return;
        
        this.endingTriggered = true;
        this.endingType = endingData.type;
        this.endingData = endingData;
        
        // Store ending in game state
        this.gameState.gameEnding = {
            type: endingData.type,
            title: endingData.title,
            message: endingData.message,
            triggeredAt: Date.now(),
            stats: this.getEndingStats()
        };

        // Notify main game
        if (this.gameState.mainGame) {
            this.gameState.mainGame.showGameEnding(endingData);
        }

        return endingData;
    }

    /**
     * Get comprehensive ending statistics
     */
    getEndingStats() {
        const days = this.gameState.timeManager?.totalDays || 0;
        const hours = Math.floor((Date.now() - this.gameState.startTime) / (1000 * 60 * 60));
        
        return {
            days: days,
            hours: hours,
            money: this.gameState.money,
            reputation: this.gameState.reputation,
            rankIndex: this.gameState.rankIndex,
            rankTitle: RANKS[this.gameState.rankIndex]?.title || 'Unknown',
            tasksCompleted: this.gameState.tasksCompleted || 0,
            perfectScores: this.gameState.perfectScores || 0,
            totalEarned: this.gameState.totalEarned || 0,
            totalSpent: this.gameState.totalSpent || 0,
            averageRating: this.gameState.averageRating || 0,
            contractsCompleted: this.gameState.contractSystem?.completedContracts?.length || 0,
            projectsCompleted: this.gameState.projectSystem?.completedProjects?.length || 0,
            coursesCompleted: this.gameState.educationSystem?.completedCourses?.length || 0,
            relationships: this.getRelationshipStats(),
            ethics: this.gameState.characterStats?.getStat?.('ethics') || 0,
            skills: this.getSkillStats()
        };
    }

    /**
     * Get relationship statistics
     */
    getRelationshipStats() {
        if (!this.gameState.npcManager) return {};
        
        const metNPCs = this.gameState.npcManager.getMetNPCs?.() || [];
        const relationships = {};
        
        metNPCs.forEach(npc => {
            const rel = this.gameState.npcManager.getRelationship?.(npc.id) || 0;
            relationships[npc.id] = rel;
        });

        return relationships;
    }

    /**
     * Get skill statistics
     */
    getSkillStats() {
        if (!this.gameState.characterStats) return {};
        
        return this.gameState.characterStats.getSkills();
    }

    /**
     * Reset the ending system
     */
    reset() {
        this.endingTriggered = false;
        this.endingType = null;
        this.endingData = null;
        this.gameState.gameEnding = null;
    }
}