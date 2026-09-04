/**
 * ContractSystem Unit Tests
 * Verifies that contract deadlines are stamped at acceptance time, not generation time.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContractSystem } from '../../src/js/game/contracts/ContractSystem.js';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('ContractSystem', () => {
    let system;
    let gameState;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
        gameState = {
            reputation: 0,
            money: 0,
            characterStats: { getStat: () => 100 }
        };
        system = new ContractSystem(gameState);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should recompute deadline relative to acceptedAt, not generation time', () => {
        // Pick a contract from the available pool (generated at t=0)
        const contract = system.availableContracts[0];
        const timeRequired = contract.timeRequired;

        // Simulate the contract sitting in the pool for half its window
        vi.advanceTimersByTime(timeRequired * DAY_MS * 0.5);

        const result = system.acceptContract(contract.id);
        expect(result.success).toBe(true);

        const active = system.activeContracts.find(c => c.id === contract.id);
        expect(active).toBeDefined();

        // Deadline must be a full timeRequired window from acceptance,
        // even though the contract was generated (and partially "expired") earlier.
        const expectedDeadline = active.acceptedAt + timeRequired * DAY_MS;
        expect(active.deadline).toBe(expectedDeadline);
        expect(active.deadline - active.acceptedAt).toBe(timeRequired * DAY_MS);
    });

    it('should give a full early-completion bonus when finishing immediately after acceptance', () => {
        const contract = system.availableContracts[0];
        const timeRequired = contract.timeRequired;

        // Contract sits in the pool for most of its window before acceptance
        vi.advanceTimersByTime(timeRequired * DAY_MS * 0.9);

        system.acceptContract(contract.id);

        // Player completes it the moment they accept it
        const result = system.completeContract(contract.id);
        expect(result.success).toBe(true);
        expect(result.bonuses.some(b => b.type === 'early_completion')).toBe(true);
    });
});
