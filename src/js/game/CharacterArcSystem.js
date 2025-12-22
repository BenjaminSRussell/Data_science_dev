/**
 * CharacterArcSystem.js
 * Tracks and displays character transformation over time
 * Priority 2 & 3: Narrative Structure & Choice Consequences
 */

export class CharacterArcSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.arcHistory = [];
        this.startingState = null;
        this.currentState = null;
    }

    /**
     * Initialize character arc
     */
    initialize() {
        this.captureStartingState();
        this.updateCurrentState();
    }

    /**
     * Capture starting character state
     */
    captureStartingState() {
        if (this.startingState) return; // Already captured

        this.startingState = {
            ethics: this.gameState.characterStats?.ethics || 0,
            reputation: this.gameState.reputation || 0,
            rank: this.gameState.rankIndex || 0,
            money: this.gameState.money || 100,
            relationships: this.getRelationshipCount(),
            days: this.gameState.timeManager?.totalDays || 0,
            description: 'A newcomer to Data City, full of potential but uncertain of the path ahead.'
        };
    }

    /**
     * Update current character state
     */
    updateCurrentState() {
        const ethics = this.gameState.characterStats?.ethics || 0;
        const reputation = this.gameState.reputation || 0;
        const rank = this.gameState.rankIndex || 0;
        const money = this.gameState.money || 0;
        const relationships = this.getRelationshipCount();
        const days = this.gameState.timeManager?.totalDays || 0;

        this.currentState = {
            ethics,
            reputation,
            rank,
            money,
            relationships,
            days,
            description: this.generateCurrentDescription(ethics, reputation, rank, days)
        };

        // Track arc progression
        this.trackArcProgression();
    }

    /**
     * Get relationship count
     */
    getRelationshipCount() {
        const npcManager = this.gameState.npcManager;
        if (!npcManager) return 0;
        return npcManager.getMetNPCs?.()?.length || 0;
    }

    /**
     * Generate current character description
     */
    generateCurrentDescription(ethics, reputation, rank, days) {
        const ethicsDesc = this.getEthicsDescription(ethics);
        const careerDesc = this.getCareerDescription(rank, reputation);
        const timeDesc = this.getTimeDescription(days);

        return `${ethicsDesc} ${careerDesc} ${timeDesc}`;
    }

    /**
     * Get ethics description
     */
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

    /**
     * Get career description
     */
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

    /**
     * Get time description
     */
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

    /**
     * Track arc progression
     */
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

    /**
     * Determine arc direction
     */
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

    /**
     * Check if change is significant
     */
    isSignificantChange(changes) {
        return Math.abs(changes.ethics) >= 10 ||
               Math.abs(changes.reputation) >= 100 ||
               changes.rank > 0 ||
               Math.abs(changes.money) >= 10000 ||
               changes.relationships > 0;
    }

    /**
     * Get arc summary
     */
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

    /**
     * Get transformation description
     */
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

    /**
     * Get arc milestones
     */
    getArcMilestones() {
        return this.arcHistory.map(entry => ({
            day: entry.days,
            description: this.getMilestoneDescription(entry),
            direction: entry.direction
        }));
    }

    /**
     * Get milestone description
     */
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
