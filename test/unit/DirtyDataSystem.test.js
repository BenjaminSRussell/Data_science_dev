/**
 * DirtyDataSystem.test.js
 * Tests for the DirtyDataSystem class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DirtyDataSystem } from '../../src/js/game/data/DirtyDataSystem.js';

describe('DirtyDataSystem', () => {
    let gameState;
    let dirtyDataSystem;

    beforeEach(() => {
        gameState = {
            timeManager: {
                totalDays: 10
            },
            legalSystem: null,
            reputationSystem: null,
            money: 1000
        };
        dirtyDataSystem = new DirtyDataSystem(gameState);
    });

    describe('getDirtyOptions', () => {
        it('should return array of dirty data options', () => {
            const options = dirtyDataSystem.getDirtyOptions();
            expect(Array.isArray(options)).toBe(true);
            expect(options.length).toBeGreaterThan(0);
        });

        it('should have all required fields for each option', () => {
            const options = dirtyDataSystem.getDirtyOptions();
            options.forEach(option => {
                expect(option).toHaveProperty('id');
                expect(option).toHaveProperty('name');
                expect(option).toHaveProperty('description');
                expect(option).toHaveProperty('risk');
                expect(option).toHaveProperty('reward');
                expect(option).toHaveProperty('ethical');
                expect(option).toHaveProperty('consequences');
                expect(option.ethical).toBe(false);
            });
        });

        it('should have 5 dirty data options', () => {
            const options = dirtyDataSystem.getDirtyOptions();
            expect(options.length).toBe(5);
        });
    });

    describe('performAction', () => {
        it('should return failure for invalid action id', () => {
            const result = dirtyDataSystem.performAction('invalid_action');
            expect(result.success).toBe(false);
        });

        it('should perform action when not caught', () => {
            // Mock Math.random to return a value > action.risk
            vi.spyOn(Math, 'random').mockReturnValue(1.0);

            const result = dirtyDataSystem.performAction('manipulate_data');
            expect(result.success).toBe(true);
            expect(result.caught).toBe(false);
            expect(result.message).toContain('got away with it');
        });

        it('should record action when successful', () => {
            vi.spyOn(Math, 'random').mockReturnValue(1.0);

            dirtyDataSystem.performAction('sell_data');
            expect(dirtyDataSystem.unethicalActions.length).toBe(1);
            expect(dirtyDataSystem.unethicalActions[0].action).toBe('sell_data');
            expect(dirtyDataSystem.unethicalActions[0].caught).toBe(false);
        });

        it('should be caught based on risk', () => {
            // Mock Math.random to return a value < action.risk
            vi.spyOn(Math, 'random').mockReturnValue(0.1);

            const result = dirtyDataSystem.performAction('manipulate_data');
            expect(result.success).toBe(false);
            expect(result.caught).toBe(true);
            expect(result.message).toContain('caught');
        });

        it('should record action when caught', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.1);

            dirtyDataSystem.performAction('fake_results');
            expect(dirtyDataSystem.unethicalActions.length).toBe(1);
            expect(dirtyDataSystem.unethicalActions[0].caught).toBe(true);
        });

        it('should apply consequences to reputation', () => {
            vi.spyOn(Math, 'random').mockReturnValue(1.0);

            const initialReputation = dirtyDataSystem.reputation;
            dirtyDataSystem.performAction('manipulate_data');
            expect(dirtyDataSystem.reputation).toBeLessThan(initialReputation);
        });

        it('should have higher penalties when caught', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.1);

            const initialReputation = dirtyDataSystem.reputation;
            dirtyDataSystem.performAction('sell_data');
            const caughtReputation = dirtyDataSystem.reputation;

            // Reset
            dirtyDataSystem = new DirtyDataSystem(gameState);

            // Now succeed
            vi.spyOn(Math, 'random').mockReturnValue(1.0);
            dirtyDataSystem.performAction('sell_data');
            const successReputation = dirtyDataSystem.reputation;

            // Caught should result in more negative reputation
            expect(caughtReputation).toBeLessThan(successReputation);
        });
    });

    describe('getReputationLevel', () => {
        it('should return "clean" for positive reputation', () => {
            dirtyDataSystem.reputation = 5;
            expect(dirtyDataSystem.getReputationLevel()).toBe('clean');
        });

        it('should return "clean" for reputation > -10', () => {
            dirtyDataSystem.reputation = -5;
            expect(dirtyDataSystem.getReputationLevel()).toBe('clean');
        });

        it('should return "questionable" for reputation between -10 and -30', () => {
            dirtyDataSystem.reputation = -20;
            expect(dirtyDataSystem.getReputationLevel()).toBe('questionable');
        });

        it('should return "bad" for reputation between -30 and -50', () => {
            dirtyDataSystem.reputation = -40;
            expect(dirtyDataSystem.getReputationLevel()).toBe('bad');
        });

        it('should return "terrible" for reputation < -50', () => {
            dirtyDataSystem.reputation = -60;
            expect(dirtyDataSystem.getReputationLevel()).toBe('terrible');
        });
    });

    describe('unethicalActions tracking', () => {
        it('should maintain history of actions', () => {
            vi.spyOn(Math, 'random').mockReturnValue(1.0);

            dirtyDataSystem.performAction('manipulate_data');
            dirtyDataSystem.performAction('sell_data');
            dirtyDataSystem.performAction('fake_results');

            expect(dirtyDataSystem.unethicalActions.length).toBe(3);
            expect(dirtyDataSystem.unethicalActions[0].action).toBe('manipulate_data');
            expect(dirtyDataSystem.unethicalActions[1].action).toBe('sell_data');
            expect(dirtyDataSystem.unethicalActions[2].action).toBe('fake_results');
        });
    });
});
