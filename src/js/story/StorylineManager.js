/**
 * StorylineManager.js
 * Manages the game's storyline progression, decisions, consequences, and phase transitions.
 */

import { GAME_PHASES, ETHICS_ARCS, DECISIONS } from '../data/storyline.js';
import { handleArrest, modifyEthics } from '../helpers/ProjectHelpers.js';

class StorylineManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.storylinePhase = 'early';
        this.currentArc = 'neutral';
        this.majorDecisions = [];
        this.storylineProgress = 0;
    }

    determinePhase() {
        const { totalDays } = this.gameState;
        if (totalDays < 30) {
            return 'early';
        } else if (totalDays < 90) {
            return 'mid';
        } else if (totalDays < 180) {
            return 'late';
        } else {
            return 'endgame';
        }
    }

    getCurrentArc() {
        const { ethics } = this.gameState;
        if (ethics < -30) {
            return 'dark';
        } else if (ethics > 30) {
            return 'light';
        } else {
            return 'neutral';
        }
    }

    getAvailableDecisions() {
        const phase = this.determinePhase();
        const availableDecisions = [];

        if (phase === 'early') {
            if (!this.majorDecisions.some(d => d.id === 'first_job_offer')) {
                availableDecisions.push(DECISIONS.first_job_offer);
            }
            if (!this.majorDecisions.some(d => d.id === 'hire_friend')) {
                availableDecisions.push(DECISIONS.hire_friend);
            }
        }

        if (phase === 'mid') {
            availableDecisions.push(DECISIONS.whistleblower);
        }

        if (phase === 'late' || phase === 'endgame') {
            if (this.gameState.money > 20000) {
                availableDecisions.push(DECISIONS.startup_investment);
            }
        }

        if (this.gameState.ethics < -20) {
            availableDecisions.push(DECISIONS.criminal_opportunity);
        }

        return availableDecisions;
    }

    applyConsequences(decision, choice) {
        if (choice === 'accept') {
            modifyEthics(this.gameState, decision.ethicsChange);
            if (decision.risk === 'arrest') {
                handleArrest(this.gameState);
            }
        }
    }

    checkPhaseTransition() {
        const newPhase = this.determinePhase();
        if (newPhase !== this.storylinePhase) {
            this.storylinePhase = newPhase;
            return true;
        }
        return false;
    }

    processDecision(decisionId, choice) {
        const decision = DECISIONS[decisionId];
        if (!decision) {
            return null;
        }

        this.applyConsequences(decision, choice);

        const week = Math.ceil(this.gameState.totalDays / 7);
        this.majorDecisions.push({ id: decisionId, choice, week });

        this.storylineProgress = Math.min(this.storylineProgress + decision.progress, 100);
        this.currentArc = this.getCurrentArc();

        if (this.checkPhaseTransition()) {
            // Handle phase transition
        }

        return true;
    }

    triggerDecisionIfAvailable() {
        const { lastDecisionTime } = this.gameState;
        const currentTime = Date.now();
        if (currentTime - lastDecisionTime >= 30000) {
            this.gameState.lastDecisionTime = currentTime;
            // Trigger a decision
        }
    }
}

export { StorylineManager };