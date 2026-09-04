/**
 * ContractSystem Unit Tests
 * Verifies that completeContract() cannot pay out before progress reaches timeRequired
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ContractSystem } from '../../src/js/game/contracts/ContractSystem.js';

function makeGameState() {
    return {
        reputation: 0,
        money: 0,
        characterStats: {
            getStat: (stat) => 100
        }
    };
}

describe('ContractSystem', () => {
    let system;
    let gameState;

    beforeEach(() => {
        gameState = makeGameState();
        system = new ContractSystem(gameState);
    });

    it('should reject completeContract() immediately after acceptContract() with no work', () => {
        // Find an available contract the player qualifies for
        const contract = system.availableContracts.find(
            c => gameState.reputation >= c.requirements.reputation
        );
        expect(contract).toBeDefined();

        const acceptResult = system.acceptContract(contract.id);
        expect(acceptResult.success).toBe(true);

        const moneyBefore = gameState.money;
        const reputationBefore = gameState.reputation;

        // Try to complete without any work
        const result = system.completeContract(contract.id);

        expect(result.success).toBe(false);
        expect(result.reason).toBe('Contract requirements not yet met');

        // Nothing should have been awarded
        expect(gameState.money).toBe(moneyBefore);
        expect(gameState.reputation).toBe(reputationBefore);

        // Contract should still be active
        expect(system.activeContracts.some(c => c.id === contract.id)).toBe(true);
        expect(system.completedContracts.some(c => c.id === contract.id)).toBe(false);
    });

    it('should allow completeContract() once progress reaches timeRequired', () => {
        const contract = system.availableContracts.find(
            c => gameState.reputation >= c.requirements.reputation
        );
        expect(contract).toBeDefined();

        system.acceptContract(contract.id);

        // Work until the threshold is met
        const result = system.workOnContract(contract.id, contract.timeRequired);

        expect(result.success).toBe(true);
        expect(gameState.money).toBeGreaterThan(0);
        expect(system.activeContracts.some(c => c.id === contract.id)).toBe(false);
    });
});
