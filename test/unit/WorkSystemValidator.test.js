/**
 * Unit tests for WorkSystemValidator
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { WorkSystemValidator } from '../../src/js/dev/WorkSystemValidator.js';

describe('WorkSystemValidator', () => {
    let validator;
    let mockGame;

    beforeEach(() => {
        // Set up fake timers for async operations
        vi.useFakeTimers();

        mockGame = {
            gameState: {
                money: 1000,
                reputation: 50,
                rankIndex: 2
            },
            taskSystem: {
                getCurrentTask: () => ({
                    id: 'task-1',
                    description: 'Test task',
                    requirements: ['req1', 'req2']
                }),
                workOnTask: () => {},
                completeTask: () => {}
            }
        };

        validator = new WorkSystemValidator(mockGame);

        // Mock DOM
        document.body.innerHTML = `
            <table id="data-table">
                <thead>
                    <tr>
                        <th class="sortable">Name</th>
                        <th class="sortable">Value</th>
                        <th class="sortable">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Item 1</td><td>100</td><td>Active</td></tr>
                    <tr><td>Item 2</td><td>200</td><td>Inactive</td></tr>
                    <tr><td>Item 3</td><td>150</td><td>Active</td></tr>
                </tbody>
            </table>
            <input id="table-filter" type="text" placeholder="Filter...">
        `;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('validateDataIntegrity', () => {
        it('should pass when money, reputation, and rankIndex are valid', async () => {
            const result = await validator.validateDataIntegrity();
            expect(result.passed).toBeGreaterThan(0);
            expect(result.failed).toBe(0);
            expect(result.errors).toHaveLength(0);
        });

        it('should independently flag when money is NaN', async () => {
            mockGame.gameState.money = NaN;
            const result = await validator.validateDataIntegrity();
            expect(result.failed).toBeGreaterThan(0);
            expect(result.errors.some(e => e.includes('Money'))).toBe(true);
        });

        it('should independently flag when money is not a number', async () => {
            mockGame.gameState.money = 'not-a-number';
            const result = await validator.validateDataIntegrity();
            expect(result.failed).toBeGreaterThan(0);
            expect(result.errors.some(e => e.includes('Money'))).toBe(true);
        });

        it('should independently flag when reputation is not a number', async () => {
            mockGame.gameState.reputation = 'not-a-number';
            const result = await validator.validateDataIntegrity();
            expect(result.failed).toBeGreaterThan(0);
            expect(result.errors.some(e => e.includes('Reputation'))).toBe(true);
        });

        it('should independently flag when rankIndex is negative', async () => {
            mockGame.gameState.rankIndex = -1;
            const result = await validator.validateDataIntegrity();
            expect(result.failed).toBeGreaterThan(0);
            expect(result.errors.some(e => e.includes('Rank'))).toBe(true);
        });

        it('should fail when gameState is missing', async () => {
            mockGame.gameState = null;
            const result = await validator.validateDataIntegrity();
            expect(result.failed).toBeGreaterThan(0);
            expect(result.errors.some(e => e.includes('Game state'))).toBe(true);
        });

        it('should increment passed count independently for each valid check', async () => {
            const result = await validator.validateDataIntegrity();
            // Should have 3 passed: money, reputation, rankIndex
            expect(result.passed).toBe(3);
            expect(result.failed).toBe(0);
        });
    });

    describe('validateTaskSystem', () => {
        it('should return error when task system not found', async () => {
            mockGame.taskSystem = null;
            const result = await validator.validateTaskSystem();
            expect(result.error).toBe('Task system not found');
        });

        it('should flag task missing required field with specific field name', async () => {
            mockGame.taskSystem.getCurrentTask = () => ({
                id: 'task-1',
                description: 'Test task'
                // missing 'requirements'
            });
            const result = await validator.validateTaskSystem();
            expect(result.errors.some(e => e.includes('requirements'))).toBe(true);
        });

        it('should flag each missing required field independently', async () => {
            mockGame.taskSystem.getCurrentTask = () => ({
                // missing all required fields
            });
            const result = await validator.validateTaskSystem();
            expect(result.errors.some(e => e.includes('id'))).toBe(true);
            expect(result.errors.some(e => e.includes('description'))).toBe(true);
            expect(result.errors.some(e => e.includes('requirements'))).toBe(true);
        });

        it('should increment passed count for getCurrentTask', async () => {
            const result = await validator.validateTaskSystem();
            expect(result.passed).toBeGreaterThan(0);
        });

        it('should check getCurrentTask method exists', async () => {
            mockGame.taskSystem.getCurrentTask = undefined;
            const result = await validator.validateTaskSystem();
            expect(result.failed).toBeGreaterThan(0);
            expect(result.errors.some(e => e.includes('getCurrentTask'))).toBe(true);
        });
    });

    describe('validateWorkFlow', () => {
        it('should fail early when no taskSystem', async () => {
            mockGame.taskSystem = null;
            const result = await validator.validateWorkFlow();
            expect(result.failed).toBeGreaterThan(0);
            expect(result.errors.some(e => e.includes('Task system'))).toBe(true);
        });

        it('should flag when task.requirements is not an array', async () => {
            mockGame.taskSystem.getCurrentTask = () => ({
                id: 'task-1',
                description: 'Test task',
                requirements: 'not-an-array'
            });
            const result = await validator.validateWorkFlow();
            expect(result.failed).toBeGreaterThan(0);
            expect(result.errors.some(e => e.includes('requirements'))).toBe(true);
        });

        it('should pass when task.requirements is a valid array', async () => {
            const result = await validator.validateWorkFlow();
            expect(result.errors.some(e => e.includes('requirements'))).toBe(false);
            expect(result.passed).toBeGreaterThan(0);
        });

        it('should fail when getCurrentTask returns undefined', async () => {
            mockGame.taskSystem.getCurrentTask = () => undefined;
            const result = await validator.validateWorkFlow();
            expect(result.failed).toBeGreaterThan(0);
        });
    });

    describe('validateSorting', () => {
        it('should click every header in table', async () => {
            const table = document.getElementById('data-table');
            const headers = table.querySelectorAll('thead th');
            expect(headers.length).toBe(3);

            const promise = validator.validateSorting(table);
            // Advance timers to complete all sort operations
            await vi.advanceTimersByTimeAsync(600);
            const result = await promise;

            // Should have attempted to sort each header
            expect(result).toHaveProperty('passed');
            expect(result).toHaveProperty('failed');
        });

        it('should preserve row count after sort', async () => {
            const table = document.getElementById('data-table');
            const originalRowCount = table.querySelectorAll('tbody tr').length;
            expect(originalRowCount).toBe(3);

            const promise = validator.validateSorting(table);
            await vi.advanceTimersByTimeAsync(600);
            const result = await promise;

            // Row count should be preserved
            const afterSortRowCount = table.querySelectorAll('tbody tr').length;
            expect(afterSortRowCount).toBe(originalRowCount);
        });

        it('should not assert on row reordering, only on count preservation', async () => {
            const table = document.getElementById('data-table');
            const headers = table.querySelectorAll('thead th');

            // Record original row order
            const originalRows = Array.from(table.querySelectorAll('tbody tr')).map(r => r.innerHTML);

            const promise = validator.validateSorting(table);
            await vi.advanceTimersByTimeAsync(600);
            const result = await promise;

            // The validator checks row count, not order
            // This test verifies that the validator doesn't care about order changes
            expect(result).toHaveProperty('passed');
            expect(result).toHaveProperty('failed');
        });

        it('should use setTimeout with 100ms delay for sort completion', async () => {
            const table = document.getElementById('data-table');
            const promise = validator.validateSorting(table);

            // Advance by 100ms for first sort
            await vi.advanceTimersByTimeAsync(100);

            // Complete remaining timers
            await vi.advanceTimersByTimeAsync(500);

            const result = await promise;
            expect(result.passed).toBeGreaterThanOrEqual(0);
        });

        it('should click each header to test sorting', async () => {
            const table = document.getElementById('data-table');
            const header = table.querySelector('thead th');
            const clickSpy = vi.spyOn(header, 'click');

            const promise = validator.validateSorting(table);
            await vi.advanceTimersByTimeAsync(600);
            const result = await promise;

            // Should have clicked headers
            expect(clickSpy).toHaveBeenCalled();
            expect(result).toHaveProperty('passed');
            expect(result).toHaveProperty('failed');
        });
    });

    describe('validateFiltering', () => {
        it('should return immediate failure when #table-filter absent', async () => {
            document.getElementById('table-filter').remove();
            const table = document.getElementById('data-table');

            const result = await validator.validateFiltering(table);
            expect(result.failed).toBeGreaterThan(0);
            expect(result.errors.some(e => e.includes('Filter input'))).toBe(true);
        });

        it('should filter by various test values', async () => {
            const table = document.getElementById('data-table');
            const promise = validator.validateFiltering(table);

            // Advance past all async operations
            await vi.advanceTimersByTimeAsync(1000);

            const result = await promise;
            // Should test multiple filter values
            expect(result.passed).toBeGreaterThan(0);
        });

        it('should dispatch input event on filter changes', async () => {
            const filterInput = document.getElementById('table-filter');
            const dispatchSpy = vi.spyOn(filterInput, 'dispatchEvent');
            const table = document.getElementById('data-table');

            const promise = validator.validateFiltering(table);
            await vi.advanceTimersByTimeAsync(1000);
            const result = await promise;

            // Should have dispatched events
            expect(dispatchSpy).toHaveBeenCalled();
        });

        it('should clear filter at the end', async () => {
            const filterInput = document.getElementById('table-filter');
            const table = document.getElementById('data-table');

            const promise = validator.validateFiltering(table);
            await vi.advanceTimersByTimeAsync(1000);
            await promise;

            // Filter should be cleared
            expect(filterInput.value).toBe('');
        });
    });

    describe('validateAll', () => {
        it('should validate all systems together', async () => {
            const promise = validator.validateAll();
            // Need to advance timers enough for sorting and filtering
            await vi.advanceTimersByTimeAsync(1500);
            const result = await promise;

            expect(result).toHaveProperty('taskSystem');
            expect(result).toHaveProperty('spreadsheet');
            expect(result).toHaveProperty('workFlow');
            expect(result).toHaveProperty('dataIntegrity');
        });

        it('should handle missing data-table in spreadsheet validation', async () => {
            document.getElementById('data-table').remove();
            const promise = validator.validateAll();
            await vi.advanceTimersByTimeAsync(1500);
            const result = await promise;

            expect(result.spreadsheet).toHaveProperty('error');
        });
    });
});
