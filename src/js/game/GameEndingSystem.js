/**
 * GameEndingSystem.js
 * Manages all game ending conditions and victory states
 * Checks for multiple ending types and triggers appropriate endings
 */

import { RANKS } from '../data/ranks.js';

export class GameEndingSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.endingTriggered = false;
        this.endingType = null;
        this.endingData = null;
    }

    /**
     * Check all victory conditions
     * Called periodically during gameplay
     */
    checkVictoryConditions() {
        if (this.endingTriggered) return null;

        // Check final rank achievement
        const finalRankCheck = this.checkFinalRank();
        if (finalRankCheck) return finalRankCheck;

        // Check millionaire achievement
        const millionaireCheck = this.checkMillionaire();
        if (millionaireCheck) return millionaireCheck;

        // Check end-game map unlock (victory condition)
        const endGameCheck = this.checkEndGameMap();
        if (endGameCheck) return endGameCheck;

        // Check perfect score achievement
        const perfectCheck = this.checkPerfectScores();
        if (perfectCheck) return perfectCheck;

        // Check early retirement
        const earlyRetirementCheck = this.checkEarlyRetirement();
        if (earlyRetirementCheck) return earlyRetirementCheck;

        // Check speedrun ending
        const speedrunCheck = this.checkSpeedrun();
        if (speedrunCheck) return speedrunCheck;

        // Check ethics-based endings
        const ethicsCheck = this.checkEthicsEnding();
        if (ethicsCheck) return ethicsCheck;

        // Check company ownership
        const companyCheck = this.checkCompanyOwnership();
        if (companyCheck) return companyCheck;

        // Check research breakthrough
        const researchCheck = this.checkResearchBreakthrough();
        if (researchCheck) return researchCheck;

        // Check education completion
        const educationCheck = this.checkEducationCompletion();
        if (educationCheck) return educationCheck;

        return null;
    }

    /**
     * Check if player reached final rank
     */
    checkFinalRank() {
        const maxRankIndex = RANKS.length - 1;
        if (this.gameState.rankIndex >= maxRankIndex) {
            return {
                type: 'final_rank',
                title: 'Chief Data Officer',
                message: 'Congratulations! You\'ve reached the pinnacle of your career as Chief Data Officer. The data world is yours!',
                showEnding: true
            };
        }
        return null;
    }

    /**
     * Check if player reached $1 million
     */
    checkMillionaire() {
        if (this.gameState.money >= 1000000) {
            return {
                type: 'millionaire',
                title: 'Millionaire',
                message: 'You\'ve amassed a fortune of over $1,000,000! Financial independence achieved!',
                showEnding: true
            };
        }
        return null;
    }

    /**
     * Check if end-game map is unlocked (victory condition)
     */
    checkEndGameMap() {
        if (this.gameState.mapProgressionSystem) {
            const unlockedMaps = this.gameState.mapProgressionSystem.unlockedMaps || [];
            if (unlockedMaps.includes('end_game')) {
                const days = this.gameState.timeManager?.totalDays || 0;
                if (days >= 90) {
                    return {
                        type: 'elite_district',
                        title: 'Elite District Unlocked',
                        message: 'You\'ve unlocked the Elite District and proven yourself among the city\'s elite!',
                        showEnding: true
                    };
                }
            }
        }
        return null;
    }

    /**
     * Check for 100 perfect scores
     */
    checkPerfectScores() {
        if (this.gameState.perfectScores >= 100) {
            return {
                type: 'perfectionist',
                title: 'Perfectionist',
                message: 'You\'ve achieved 100 perfect scores! Your dedication to excellence is unmatched!',
                showEnding: true
            };
        }
        return null;
    }

    /**
     * Check for early retirement (completing game in < 50 days)
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
     * Check for speedrun ending (< 30 days)
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
            const allDegrees = Object.values(degrees).every(d => d.acquired);
            
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
        
        const skills = ['coding', 'analysis', 'design', 'communication', 'focus', 'luck'];
        const stats = {};
        
        skills.forEach(skill => {
            stats[skill] = this.gameState.characterStats.getStat?.(skill) || 0;
        });
        
        return stats;
    }

    /**
     * Reset ending state (for new game)
     */
    reset() {
        this.endingTriggered = false;
        this.endingType = null;
        this.endingData = null;
        if (this.gameState) {
            this.gameState.gameEnding = null;
        }
    }

    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            endingTriggered: this.endingTriggered,
            endingType: this.endingType,
            endingData: this.endingData
        };
    }

    /**
     * Load from save
     */
    fromJSON(data) {
        if (!data) return;
        this.endingTriggered = data.endingTriggered || false;
        this.endingType = data.endingType || null;
        this.endingData = data.endingData || null;
    }
}

