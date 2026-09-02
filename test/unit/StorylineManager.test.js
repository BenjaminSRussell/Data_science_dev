/**
 * StorylineManager Unit Tests
 * Verifies that checkPhaseTransition() does not throw on the common
 * no-phase-change path, and that endgame decisions are exposed via
 * getAvailableDecisions().
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StorylineManager } from '../../src/js/game/StorylineManager.js';

function makeGameState(overrides = {}) {
    return {
        timeManager: { totalDays: 0 },
        reputation: 0,
        money: 0,
        characterStats: { ethics: 0 },
        mainGame: null,
        ...overrides
    };
}

describe('StorylineManager', () => {
    let manager;

    beforeEach(() => {
        manager = new StorylineManager(makeGameState());
    });

    describe('checkPhaseTransition', () => {
        it('should not throw when there is no phase change', () => {
            manager.storylinePhase = 'early';
            manager.gameState.timeManager.totalDays = 5;

            expect(() => manager.checkPhaseTransition()).not.toThrow();
            expect(manager.checkPhaseTransition()).toEqual({ phaseChanged: false });
        });

        it('should not throw on the no-change path in every phase', () => {
            const daysByPhase = { early: 5, mid: 50, late: 100, endgame: 200 };
            for (const [phase, days] of Object.entries(daysByPhase)) {
                manager.storylinePhase = phase;
                manager.gameState.timeManager.totalDays = days;
                expect(() => manager.checkPhaseTransition()).not.toThrow();
                expect(manager.checkPhaseTransition()).toEqual({ phaseChanged: false });
            }
        });

        it('should report a phase change when the phase advances', () => {
            manager.storylinePhase = 'early';
            manager.gameState.timeManager.totalDays = 50;

            const result = manager.checkPhaseTransition();
            expect(result.phaseChanged).toBe(true);
            expect(result.oldPhase).toBe('early');
            expect(result.newPhase).toBe('mid');
            expect(manager.storylinePhase).toBe('mid');
        });
    });

    describe('getAvailableDecisions', () => {
        it('should include the sell_company decision in the endgame phase', () => {
            manager.storylinePhase = 'endgame';
            const decisions = manager.getAvailableDecisions();
            expect(decisions.some(d => d.id === 'sell_company')).toBe(true);
        });

        it('should not repeat sell_company once it has been made', () => {
            manager.storylinePhase = 'endgame';
            manager.majorDecisions.push({ decisionId: 'sell_company' });
            const decisions = manager.getAvailableDecisions();
            expect(decisions.some(d => d.id === 'sell_company')).toBe(false);
        });
    });
});
