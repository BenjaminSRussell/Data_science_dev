class GameEndingSystem {
    constructor(game) {
        this.game = game;
        this.endingTriggered = false;
    }

    checkFinalRank() {
        if (this.endingTriggered) return null;
        const { rankIndex, maxRankIndex } = this.game.player.rank;
        if (rankIndex >= maxRankIndex) {
            return 'final_rank';
        }
        return null;
    }

    checkEarlyRetirement() {
        if (this.endingTriggered) return null;
        const { totalDays } = this.game.player.stats;
        if (totalDays === 20) {
            return 'early_retirement';
        }
        return null;
    }

    checkSpeedrun() {
        if (this.endingTriggered) return null;
        const { totalDays } = this.game.player.stats;
        if (totalDays === 20) {
            return 'speedrun';
        }
        return null;
    }

    checkMillionaire() {
        if (this.endingTriggered) return null;
        const { money } = this.game.player.stats;
        if (money >= 1000000) {
            return 'millionaire';
        }
        return null;
    }

    checkEthicsEnding() {
        if (this.endingTriggered) return null;
        const { rankIndex, maxRankIndex } = this.game.player.rank;
        const { ethics } = this.game.player.stats;
        if (rankIndex >= maxRankIndex && ethics >= 80) {
            return 'ethical_leader';
        }
        if (ethics <= -50) {
            return 'ruthless_climber';
        }
        return null;
    }

    checkCompanyOwnership() {
        if (this.endingTriggered) return null;
        const { company } = this.game;
        if (!company) return null;
        if (company.ownership >= 50) {
            return 'company_ownership';
        }
        return null;
    }

    checkResearchBreakthrough() {
        if (this.endingTriggered) return null;
        const { research } = this.game;
        if (!research) return null;
        if (research.progress >= 100) {
            return 'research_breakthrough';
        }
        return null;
    }

    checkEducationCompletion() {
        if (this.endingTriggered) return null;
        const { education } = this.game;
        if (!education) return null;
        if (education.completed) {
            return 'education_completion';
        }
        return null;
    }

    checkVictoryConditions() {
        const conditions = [
            this.checkFinalRank,
            this.checkEarlyRetirement,
            this.checkSpeedrun,
            this.checkMillionaire,
            this.checkEthicsEnding,
            this.checkCompanyOwnership,
            this.checkResearchBreakthrough,
            this.checkEducationCompletion
        ];

        for (const condition of conditions) {
            const result = condition.call(this);
            if (result) {
                this.endingTriggered = true;
                return result;
            }
        }

        return null;
    }
}

export default GameEndingSystem;