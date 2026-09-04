/**
 * JobSystem Unit Tests
 * Verifies that completeTask applies pay to gameState.money
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JobSystem } from '../../src/js/game/JobSystem.js';

describe('JobSystem', () => {
    let gameState;
    let jobSystem;

    beforeEach(() => {
        gameState = {
            money: 0,
            reputation: 0,
            characterStats: {
                addExperience: () => {},
                getStat: () => 0
            }
        };
        jobSystem = new JobSystem(gameState);
    });

    describe('completeTask', () => {
        it('should add pay to gameState.money', () => {
            gameState.money = 1000;

            const result = jobSystem.completeTask('data_entry', 1.0);

            expect(result).not.toBeNull();
            expect(result.pay).toBe(50);
            expect(gameState.money).toBe(1050);
        });

        it('should add pay scaled by quality to gameState.money', () => {
            gameState.money = 0;

            const result = jobSystem.completeTask('data_entry', 0.5);

            expect(result.pay).toBe(25);
            expect(gameState.money).toBe(25);
        });

        it('should increase money by Math.floor(basePay * quality)', () => {
            gameState.money = 0;

            const quality = 0.7;
            const expectedPay = Math.floor(50 * quality);

            jobSystem.completeTask('data_entry', quality);

            expect(gameState.money).toBe(expectedPay);
        });

        it('should return null for unknown task and not change money', () => {
            gameState.money = 500;

            const result = jobSystem.completeTask('nonexistent_task');

            expect(result).toBeNull();
            expect(gameState.money).toBe(500);
        });
    });
});
