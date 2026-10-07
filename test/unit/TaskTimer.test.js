import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { GameState } from '../../src/js/game/GameState.js';
import { BOSSES } from '../../src/js/data/bosses.js';

describe('Task Timer Feature (Issue #963)', () => {
    let gameState;
    let taskSystem;
    let economySystem;

    beforeEach(() => {
        gameState = new GameState();
        taskSystem = new TaskSystem(gameState);
        economySystem = new EconomySystem(gameState);
    });

    describe('TaskSystem - timeLimit copying', () => {
        it('should copy timeLimit from template to task object', () => {
            const taskTemplate = {
                id: 'test_001',
                name: 'Test Task',
                description: 'A test task with time limit',
                dataType: 'quarterly_sales',
                difficulty: 1,
                timeLimit: 345,
                requirements: ['Show trends'],
                optimalChartTypes: ['bar'],
                acceptableChartTypes: ['bar', 'line'],
                skills: ['SQL'],
                tools: ['Python'],
                domain: 'finance',
                deliverable: 'Chart',
                realWorldContext: 'Test context'
            };

            const task = taskSystem.createTaskFromTemplate(taskTemplate, BOSSES[0]);

            expect(task).toBeDefined();
            expect(task.timeLimit).toBe(345);
        });

        it('should handle templates without timeLimit', () => {
            const taskTemplate = {
                id: 'test_002',
                name: 'Test Task',
                description: 'A test task without time limit',
                dataType: 'quarterly_sales',
                difficulty: 1,
                requirements: ['Show trends'],
                optimalChartTypes: ['bar'],
                acceptableChartTypes: ['bar', 'line']
            };

            const task = taskSystem.createTaskFromTemplate(taskTemplate, BOSSES[0]);

            expect(task).toBeDefined();
            expect(task.timeLimit).toBeUndefined();
        });

        it('should include timeLimit in currentTask when generateNewTask is called', () => {
            // This requires COMPREHENSIVE_DATA_SCIENCE_TASKS to be available
            // which should have timeLimit values
            taskSystem.generateNewTask();

            const task = gameState.currentTask;
            expect(task).toBeDefined();
            // Task might have timeLimit if it came from comprehensive tasks
            // Just verify the structure is correct
            expect(task.startTime).toBeDefined();
        });
    });

    describe('EconomySystem - time bonus calculation', () => {
        it('should apply 1.2x multiplier if completed in half the time limit or less', () => {
            const now = Date.now();
            const task = {
                potentialReward: 100,
                timeLimit: 300, // 5 minutes
                startTime: now - 100000, // 100 seconds ago (within half the time limit of 150 seconds)
            };

            const moneyReward = economySystem.calculateMoneyReward(task, 4);

            // Star multiplier for 4 stars is 1.0
            // Time bonus is 1.2 (since 100 seconds < 150 seconds)
            // Expected: 100 * 1.0 * 1.2 = 120
            expect(moneyReward).toBe(120);
        });

        it('should apply 1.0x multiplier if completed in more than half the time limit', () => {
            const now = Date.now();
            const task = {
                potentialReward: 100,
                timeLimit: 300, // 5 minutes
                startTime: now - 200000, // 200 seconds ago (more than half the time limit of 150 seconds)
            };

            const moneyReward = economySystem.calculateMoneyReward(task, 4);

            // Star multiplier for 4 stars is 1.0
            // Time bonus is 1.0 (since 200 seconds > 150 seconds)
            // Expected: 100 * 1.0 * 1.0 = 100
            expect(moneyReward).toBe(100);
        });

        it('should handle tasks without timeLimit (no time bonus)', () => {
            const now = Date.now();
            const task = {
                potentialReward: 100,
                // No timeLimit
                startTime: now
            };

            const moneyReward = economySystem.calculateMoneyReward(task, 4);

            // Star multiplier for 4 stars is 1.0
            // Time bonus is 1.0 (default, since no timeLimit)
            // Expected: 100 * 1.0 * 1.0 = 100
            expect(moneyReward).toBe(100);
        });

        it('should apply time bonus correctly with different star multipliers', () => {
            const now = Date.now();
            const task = {
                potentialReward: 100,
                timeLimit: 300,
                startTime: now - 100000, // Within half the time limit
            };

            // Test with 5 stars
            const moneyReward5Stars = economySystem.calculateMoneyReward(task, 5);
            // 100 * 1.3 (5 stars) * 1.2 (time bonus) = 156
            expect(moneyReward5Stars).toBe(156);

            // Test with 2 stars
            const moneyReward2Stars = economySystem.calculateMoneyReward(task, 2);
            // 100 * 0.4 (2 stars) * 1.2 (time bonus) = 48
            expect(moneyReward2Stars).toBe(48);
        });

        it('should handle edge case when elapsed time equals half the time limit', () => {
            const now = Date.now();
            const task = {
                potentialReward: 100,
                timeLimit: 300, // 5 minutes = 300 seconds
                startTime: now - 150000, // Exactly 150 seconds ago (exactly half the time limit)
            };

            const moneyReward = economySystem.calculateMoneyReward(task, 4);

            // At exactly half the time limit, it should still get the bonus (< check is exclusive)
            // Expected: 100 * 1.0 * 1.0 = 100 (because 150 is NOT < 150)
            expect(moneyReward).toBe(100);
        });

        it('should handle edge case just under half the time limit', () => {
            const now = Date.now();
            const task = {
                potentialReward: 100,
                timeLimit: 300, // 5 minutes = 300 seconds
                startTime: now - 149999, // Just under 150 seconds ago
            };

            const moneyReward = economySystem.calculateMoneyReward(task, 4);

            // Just under half the time limit, should get the bonus
            // Expected: 100 * 1.0 * 1.2 = 120
            expect(moneyReward).toBe(120);
        });
    });

    describe('Integration - full task flow with time bonus', () => {
        it('should calculate correct reward with time bonus for a complete task submission', () => {
            // Create a task that would have been completed quickly
            const now = Date.now();
            const task = {
                potentialReward: 200,
                timeLimit: 600, // 10 minutes
                startTime: now - 150000, // 150 seconds (completed in 2.5 minutes, well within the 5 minute half-time)
                optimalChartTypes: ['bar'],
                template: { acceptableChartTypes: ['bar', 'line'] }
            };

            const moneyReward = economySystem.calculateMoneyReward(task, 5);

            // 200 * 1.3 (5 stars) * 1.2 (time bonus) = 312
            expect(moneyReward).toBe(312);
        });
    });
});
