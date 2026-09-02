class CharacterArcSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.startingState = null;
        this.currentState = null;
        this.arcHistory = [];
        this.captureStartingState();
    }

    captureStartingState() {
        if (!this.startingState) {
            this.startingState = {
                ...this.gameState,
                description: this.generateCurrentDescription(this.gameState.ethics, this.gameState.reputation, this.gameState.rank, this.gameState.days)
            };
        }
    }

    updateGameState(newGameState) {
        this.currentState = {
            ...newGameState,
            description: this.generateCurrentDescription(newGameState.ethics, newGameState.reputation, newGameState.rank, newGameState.days)
        };
        this.trackArcProgression();
    }

    getRelationshipCount() {
        return this.gameState.npcManager ? this.gameState.npcManager.length || 0 : 0;
    }

    generateCurrentDescription(ethics, reputation, rank, days) {
        const ethicsDesc = this.getEthicsDescription(ethics);
        const careerDesc = this.getCareerDescription(rank, reputation);
        const timeDesc = this.getTimeDescription(days);

        return `${ethicsDesc} ${careerDesc} ${timeDesc}`;
    }

    getEthicsDescription(ethics) {
        if (ethics < -30) {
            return 'You\'ve walked a dark path, making choices that prioritize profit over principles.';
        } else if (ethics < -10) {
            return 'You\'ve made some questionable decisions, but you\'re not beyond redemption.';
        } else if (ethics > 30) {
            return 'You\'ve stayed true to your values, standing firm in your ethical convictions.';
        } else if (ethics > 10) {
            return 'You\'ve tried to do the right thing, even when it wasn\'t easy.';
        } else {
            return 'You navigate the complexities of life, balancing ambition with your values.';
        }
    }

    getCareerDescription(rank, reputation) {
        if (rank >= 6) {
            return 'You\'ve reached the pinnacle of your career, a respected leader in the industry.';
        } else if (rank >= 4) {
            return 'You\'ve established yourself as a senior professional, known for your expertise.';
        } else if (rank >= 2) {
            return 'You\'re building your reputation and making a name for yourself.';
        } else {
            return 'You\'re still finding your footing, learning the ropes of the industry.';
        }
    }

    getTimeDescription(days) {
        if (days >= 180) {
            return 'Months have passed, and you\'ve seen the city change around you.';
        } else if (days >= 90) {
            return 'You\'ve been here long enough to understand how things really work.';
        } else if (days >= 30) {
            return 'You\'re no longer a newcomer, but the journey is far from over.';
        } else {
            return 'You\'re still new to this city, but you\'re learning fast.';
        }
    }

    trackArcProgression() {
        if (!this.startingState) return;

        const changes = {
            ethics: this.currentState.ethics - this.startingState.ethics,
            reputation: this.currentState.reputation - this.startingState.reputation,
            rank: this.currentState.rank - this.startingState.rank,
            money: this.currentState.money - this.startingState.money,
            relationships: this.currentState.relationships - this.startingState.relationships
        };

        // Determine arc direction
        const arcDirection = this.determineArcDirection(changes);

        // Add to history if significant change
        if (this.isSignificantChange(changes)) {
            this.arcHistory.push({
                timestamp: Date.now(),
                days: this.currentState.days,
                state: { ...this.currentState },
                changes,
                direction: arcDirection
            });
        }
    }

    determineArcDirection(changes) {
        if (changes.ethics < -20 && changes.money > 50000) {
            return 'corruption';
        } else if (changes.ethics > 20 && changes.reputation > 500) {
            return 'redemption';
        } else if (changes.rank >= 3 && changes.reputation > 300) {
            return 'success';
        } else if (changes.ethics < -10) {
            return 'decline';
        } else if (changes.ethics > 10) {
            return 'growth';
        } else {
            return 'balanced';
        }
    }

    isSignificantChange(changes) {
        return Math.abs(changes.ethics) >= 10 ||
               Math.abs(changes.reputation) >= 100 ||
               changes.rank > 0 ||
               Math.abs(changes.money) >= 10000 ||
               changes.relationships > 0;
    }

    getArcSummary() {
        if (!this.startingState || !this.currentState) {
            return {
                start: 'Your journey is just beginning.',
                current: 'You are at the start of your path.',
                transformation: 'No significant changes yet.'
            };
        }

        const transformation = this.getTransformationDescription();

        return {
            start: this.startingState.description,
            current: this.currentState.description,
            transformation,
            changes: {
                ethics: this.currentState.ethics - this.startingState.ethics,
                reputation: this.currentState.reputation - this.startingState.reputation,
                rank: this.currentState.rank - this.startingState.rank,
                days: this.currentState.days - this.startingState.days
            }
        };
    }

    getTransformationDescription() {
        if (!this.startingState || !this.currentState) return 'No transformation yet.';

        const ethicsChange = this.currentState.ethics - this.startingState.ethics;
        const rankChange = this.currentState.rank - this.startingState.rank;
        const reputationChange = this.currentState.reputation - this.startingState.reputation;

        if (ethicsChange < -30 && rankChange >= 2) {
            return 'You\'ve achieved success, but at a cost. The money and power came with compromises.';
        } else if (ethicsChange > 20 && reputationChange > 200) {
            return 'You\'ve become known for your integrity. People trust you, and opportunities follow.';
        } else if (rankChange >= 3) {
            return 'You\'ve climbed the ladder through hard work and skill. Your dedication has paid off.';
        } else if (ethicsChange < -20) {
            return 'You\'ve made choices that changed who you are. The path you\'re on has consequences.';
        } else if (ethicsChange > 15) {
            return 'You\'ve grown stronger in your convictions. Your values define you more than ever.';
        } else if (rankChange >= 1) {
            return 'You\'ve made progress in your career. Each step forward brings new challenges.';
        } else {
            return 'You\'re still finding your way, but you\'re learning and growing with each decision.';
        }
    }

    getArcMilestones() {
        return this.arcHistory.map(entry => ({
            day: entry.days,
            description: this.getMilestoneDescription(entry),
            direction: entry.direction
        }));
    }

    getMilestoneDescription(entry) {
        const { changes, direction } = entry;

        if (direction === 'corruption') {
            return 'You crossed a line. The money was good, but something changed inside you.';
        } else if (direction === 'redemption') {
            return 'You made a stand for what\'s right. It wasn\'t easy, but you have no regrets.';
        } else if (direction === 'success') {
            return 'You reached a major milestone in your career. Your hard work is paying off.';
        } else if (direction === 'decline') {
            return 'You made choices that compromised your values. The path ahead looks darker.';
        } else if (direction === 'growth') {
            return 'You stayed true to yourself. Your integrity is your greatest strength.';
        } else {
            return 'You continue to navigate the complexities of life, finding your own way.';
        }
    }
}