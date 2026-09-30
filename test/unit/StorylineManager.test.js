import { describe, it, expect, beforeEach } from 'vitest';
import { StorylineManager } from '../../src/js/game/StorylineManager.js';

describe('StorylineManager', () => {
    let storylineManager;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            timeManager: { totalDays: 15 },
            characterStats: { ethics: 0, modifyEthics: () => {} },
            money: 10000,
            reputation: 50
        };
        storylineManager = new StorylineManager(mockGameState);
        storylineManager.initialize();
    });

    describe('getStatus()', () => {
        it('should return decisions as an array, not a count', () => {
            const status = storylineManager.getStatus();

            // Should be an array, not a number
            expect(Array.isArray(status.decisions)).toBe(true);
            expect(typeof status.decisions).not.toBe('number');
        });

        it('should return empty array when no decisions have been made', () => {
            const status = storylineManager.getStatus();

            expect(status.decisions).toEqual([]);
            expect(status.decisions.length).toBe(0);
        });

        it('should return array of decisions after processing a decision', () => {
            // Make a decision
            storylineManager.processDecision('first_job_offer', 'accept');

            const status = storylineManager.getStatus();

            expect(Array.isArray(status.decisions)).toBe(true);
            expect(status.decisions.length).toBe(1);
            expect(status.decisions[0]).toHaveProperty('decisionId', 'first_job_offer');
            expect(status.decisions[0]).toHaveProperty('choice', 'accept');
        });

        it('should return the actual majorDecisions array reference', () => {
            storylineManager.processDecision('first_job_offer', 'accept');

            const status = storylineManager.getStatus();

            // The decisions should be the same reference as majorDecisions
            expect(status.decisions).toBe(storylineManager.majorDecisions);
        });
    });

    describe('updateDecisionsDisplay integration', () => {
        it('should handle decisions parameter correctly', () => {
            // This test ensures that when status.decisions is passed as a parameter,
            // it is an array and can be used directly (not a number)
            storylineManager.processDecision('first_job_offer', 'accept');

            const status = storylineManager.getStatus();

            // Before the fix, status.decisions would be 1 (a number)
            // After the fix, status.decisions is an array
            // This would fail with: 1 || [] => 1
            // Now it should succeed with: [decision] || [] => [decision]
            const decisions = status.decisions || [];

            expect(Array.isArray(decisions)).toBe(true);
            expect(decisions.length).toBe(1);
        });
    });
});
