/**
 * Unit tests for TaskSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';
import { TASKS } from '../../src/js/data/tasks.js';
import { BOSSES } from '../../src/js/data/bosses.js';
import { COMPREHENSIVE_DATA_SCIENCE_TASKS } from '../../src/js/data/comprehensive_datascience_tasks.js';

describe('TaskSystem', () => {
    let taskSystem;
    let mockGameState;

    beforeEach(() => {
        // Mock gameState
        mockGameState = {
            currentRank: {
                salaryMultiplier: 1.5
            },
            rankIndex: 1,
            currentTask: null
        };

        // Initialize TaskSystem with mock gameState
        taskSystem = new TaskSystem(mockGameState);

        // Set up jsdom for DOM elements
        document.body.innerHTML = `
            <div id="boss-dialogue"><p></p></div>
            <div id="boss-name"></div>
            <div id="boss-title"></div>
            <div id="boss-avatar"></div>
            <div id="boss-mood"></div>
            <div class="task-description"></div>
            <div id="task-reward"></div>
            <div class="task-requirements"></div>
            <table id="data-table">
                <thead><tr></tr></thead>
                <tbody></tbody>
            </table>
            <input id="table-filter" />
        `;
    });

    describe('getDifficultyForRank', () => {
        it('should return difficulty 1 for rankIndex <= 1', () => {
            expect(taskSystem.getDifficultyForRank(0)).toBe(1);
            expect(taskSystem.getDifficultyForRank(1)).toBe(1);
        });

        it('should return difficulty 2 for rankIndex between 2 and 3', () => {
            expect(taskSystem.getDifficultyForRank(2)).toBe(2);
            expect(taskSystem.getDifficultyForRank(3)).toBe(2);
        });

        it('should return difficulty 3 for rankIndex between 4 and 5', () => {
            expect(taskSystem.getDifficultyForRank(4)).toBe(3);
            expect(taskSystem.getDifficultyForRank(5)).toBe(3);
        });

        it('should return difficulty 4 for rankIndex >= 6', () => {
            expect(taskSystem.getDifficultyForRank(6)).toBe(4);
            expect(taskSystem.getDifficultyForRank(7)).toBe(4);
            expect(taskSystem.getDifficultyForRank(100)).toBe(4);
        });
    });

    describe('generateData', () => {
        it('should generate quarterly sales data for quarterly_sales dataType', () => {
            const template = { dataType: 'quarterly_sales' };
            const data = taskSystem.generateData(template);

            expect(data.columns).toContain('Quarter');
            expect(data.rows.length).toBe(4); // 4 quarters
            expect(data.labels).toEqual(['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024']);
            expect(data.datasets.Revenue.length).toBe(4);
        });

        it('should generate monthly revenue data for monthly_revenue dataType', () => {
            const template = { dataType: 'monthly_revenue' };
            const data = taskSystem.generateData(template);

            expect(data.columns).toContain('Month');
            expect(data.rows.length).toBe(12); // 12 months
            expect(data.labels).toContain('Jan');
            expect(data.datasets.Revenue.length).toBe(12);
        });

        it('should default to quarterly_sales for unrecognized dataType', () => {
            const template = { dataType: 'unknown_type' };
            const data = taskSystem.generateData(template);

            expect(data.columns).toContain('Quarter');
            expect(data.rows.length).toBe(4);
        });

        it('should default to quarterly_sales for missing dataType', () => {
            const template = {};
            const data = taskSystem.generateData(template);

            expect(data.columns).toContain('Quarter');
            expect(data.rows.length).toBe(4);
        });
    });

    describe('createTaskFromTemplate', () => {
        it('should calculate potentialReward correctly with rank salaryMultiplier', () => {
            const template = {
                difficulty: 2,
                dataType: 'quarterly_sales',
                requirements: ['Test'],
                optimalChartTypes: ['bar']
            };

            // salaryMultiplier: 1.5, difficulty: 2
            // reward = Math.round(100 * 1.5 + 2 * 20) = Math.round(150 + 40) = 190
            taskSystem.createTaskFromTemplate(template);

            expect(mockGameState.currentTask.potentialReward).toBe(190);
        });

        it('should use default salaryMultiplier of 1 if rank is missing', () => {
            mockGameState.currentRank = null;
            const template = {
                difficulty: 2,
                dataType: 'quarterly_sales',
                requirements: ['Test'],
                optimalChartTypes: ['bar']
            };

            // salaryMultiplier: 1 (default), difficulty: 2
            // reward = Math.round(100 * 1 + 2 * 20) = Math.round(140) = 140
            taskSystem.createTaskFromTemplate(template);

            expect(mockGameState.currentTask.potentialReward).toBe(140);
        });

        it('should auto-pick a boss from BOSSES when not provided', () => {
            const template = {
                difficulty: 1,
                dataType: 'quarterly_sales',
                requirements: [],
                optimalChartTypes: ['bar']
            };

            taskSystem.createTaskFromTemplate(template);

            expect(mockGameState.currentTask.boss).toBeDefined();
            expect(BOSSES).toContainEqual(mockGameState.currentTask.boss);
        });

        it('should use provided boss when passed', () => {
            const providedBoss = BOSSES[0];
            const template = {
                difficulty: 1,
                dataType: 'quarterly_sales',
                requirements: [],
                optimalChartTypes: ['bar']
            };

            taskSystem.createTaskFromTemplate(template, providedBoss);

            expect(mockGameState.currentTask.boss).toBe(providedBoss);
        });

        it('should initialize currentTableData and originalTableData', () => {
            const template = {
                difficulty: 1,
                dataType: 'quarterly_sales',
                requirements: [],
                optimalChartTypes: ['bar']
            };

            taskSystem.createTaskFromTemplate(template);

            expect(taskSystem.currentTableData).toBeDefined();
            expect(taskSystem.originalTableData).toBeDefined();
            expect(taskSystem.currentTableData).not.toBe(taskSystem.originalTableData);
        });
    });

    describe('generateNewTask', () => {
        it('should prefer COMPREHENSIVE_DATA_SCIENCE_TASKS over TASKS when non-empty', () => {
            // Verify that comprehensive tasks exist and are used
            if (COMPREHENSIVE_DATA_SCIENCE_TASKS && COMPREHENSIVE_DATA_SCIENCE_TASKS.length > 0) {
                const task = taskSystem.generateNewTask();

                // The task should be created successfully
                expect(task).toBeDefined();
                expect(task.id).toBeDefined();
                expect(task.data).toBeDefined();

                // Verify the task came from COMPREHENSIVE_DATA_SCIENCE_TASKS by checking for domain field
                // (comprehensive tasks have domain, subdomain, skills, tools, etc. that basic TASKS don't have)
                expect(task.domain).toBeDefined();
                const taskFoundInComprehensive = COMPREHENSIVE_DATA_SCIENCE_TASKS.some(t => t.id === task.template.id);
                expect(taskFoundInComprehensive).toBe(true);
            }
        });

        it('should filter tasks by difficulty within tolerance of 0.5', () => {
            mockGameState.rankIndex = 1; // difficulty = 1
            const difficulty = taskSystem.getDifficultyForRank(mockGameState.rankIndex);
            expect(difficulty).toBe(1); // Verify test setup

            const task = taskSystem.generateNewTask();

            expect(task).toBeDefined();
            expect(task.id).toBeDefined();

            // Verify the generated task has difficulty within 0.5 of the expected difficulty
            const taskDifficulty = typeof task.template.difficulty === 'number'
                ? task.template.difficulty
                : parseInt(task.template.difficulty) || 1;

            expect(Math.abs(taskDifficulty - difficulty)).toBeLessThanOrEqual(0.5);
        });

        it('should fall back to generateFallbackTask when zero match (assert console.warn)', () => {
            // Mock console.warn to verify it's called
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            // Temporarily replace COMPREHENSIVE_DATA_SCIENCE_TASKS and TASKS with empty arrays
            // to force zero matches
            const originalComprehensiveTasks = COMPREHENSIVE_DATA_SCIENCE_TASKS.splice(0);
            const originalTasks = TASKS.splice(0);

            try {
                // Now generateNewTask should find no tasks and fall back
                const task = taskSystem.generateNewTask();

                // Verify console.warn was called
                expect(warnSpy).toHaveBeenCalledWith('No tasks found for difficulty:', expect.any(Number));

                // Verify we got the fallback task
                expect(task).toBeDefined();
                expect(task.template.name).toBe('Basic Sales Report');
                expect(task.potentialReward).toBe(150);
            } finally {
                // Restore the original arrays
                COMPREHENSIVE_DATA_SCIENCE_TASKS.push(...originalComprehensiveTasks);
                TASKS.push(...originalTasks);
                warnSpy.mockRestore();
            }
        });
    });

    describe('handleTableSort', () => {
        beforeEach(() => {
            // Set up currentTableData with test data
            taskSystem.currentTableData = {
                columns: ['Name', 'Value', 'Amount'],
                rows: [
                    ['Alice', 50, 100],
                    ['Bob', 30, 200],
                    ['Charlie', 70, 150]
                ]
            };
            taskSystem.lastSortCol = null;
            taskSystem.lastSortAsc = null;
        });

        it('should sort in ascending order for first click on a column', () => {
            taskSystem.handleTableSort(0); // Sort by Name column

            expect(taskSystem.lastSortCol).toBe(0);
            expect(taskSystem.lastSortAsc).toBe(true);
            expect(taskSystem.currentTableData.rows[0][0]).toBe('Alice');
            expect(taskSystem.currentTableData.rows[1][0]).toBe('Bob');
            expect(taskSystem.currentTableData.rows[2][0]).toBe('Charlie');
        });

        it('should toggle sort direction when clicking same column repeatedly', () => {
            // First click - ascending
            taskSystem.handleTableSort(0);
            expect(taskSystem.lastSortAsc).toBe(true);
            const firstSort = [...taskSystem.currentTableData.rows];

            // Second click - descending
            taskSystem.handleTableSort(0);
            expect(taskSystem.lastSortAsc).toBe(false);
            expect(taskSystem.currentTableData.rows[0][0]).toBe('Charlie');
            expect(taskSystem.currentTableData.rows[2][0]).toBe('Alice');

            // Third click - ascending again
            taskSystem.handleTableSort(0);
            expect(taskSystem.lastSortAsc).toBe(true);
            expect(taskSystem.currentTableData.rows[0][0]).toBe('Alice');
        });

        it('should handle numeric column sorting correctly', () => {
            taskSystem.handleTableSort(1); // Sort by Value column (numeric)

            expect(taskSystem.lastSortAsc).toBe(true);
            expect(taskSystem.currentTableData.rows[0][1]).toBe(30);
            expect(taskSystem.currentTableData.rows[1][1]).toBe(50);
            expect(taskSystem.currentTableData.rows[2][1]).toBe(70);
        });

        it('should handle string column sorting with localeCompare', () => {
            taskSystem.handleTableSort(0); // Sort by Name column (string)

            expect(taskSystem.lastSortAsc).toBe(true);
            const names = taskSystem.currentTableData.rows.map(r => r[0]);
            expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
        });

        it('should be a no-op when currentTableData is unset', () => {
            taskSystem.currentTableData = null;

            // Should not throw an error
            expect(() => taskSystem.handleTableSort(0)).not.toThrow();
        });
    });

    describe('handleTableFilter', () => {
        beforeEach(() => {
            // Set up originalTableData and currentTableData with test data
            taskSystem.originalTableData = {
                columns: ['Name', 'City'],
                rows: [
                    ['Alice', 'New York'],
                    ['Bob', 'Boston'],
                    ['Charlie', 'New York'],
                    ['David', 'Denver']
                ]
            };
            taskSystem.currentTableData = JSON.parse(JSON.stringify(taskSystem.originalTableData));
        });

        it('should filter rows from originalTableData', () => {
            taskSystem.handleTableFilter('New York');

            expect(taskSystem.currentTableData.rows.length).toBe(2);
            expect(taskSystem.currentTableData.rows[0][1]).toBe('New York');
            expect(taskSystem.currentTableData.rows[1][1]).toBe('New York');
        });

        it('should allow undoing filter with a broader query', () => {
            // First filter to just "Boston"
            taskSystem.handleTableFilter('Boston');
            expect(taskSystem.currentTableData.rows.length).toBe(1);

            // Then broaden filter to just "o" (matches Bob, Boston, New York, David, Denver)
            taskSystem.handleTableFilter('o');
            expect(taskSystem.currentTableData.rows.length).toBeGreaterThan(1);
        });

        it('should be case-insensitive', () => {
            taskSystem.handleTableFilter('ALICE');

            expect(taskSystem.currentTableData.rows.length).toBe(1);
            expect(taskSystem.currentTableData.rows[0][0]).toBe('Alice');
        });

        it('should filter by numeric values', () => {
            taskSystem.originalTableData = {
                columns: ['Name', 'Score'],
                rows: [
                    ['Alice', 100],
                    ['Bob', 95],
                    ['Charlie', 100]
                ]
            };
            taskSystem.currentTableData = JSON.parse(JSON.stringify(taskSystem.originalTableData));

            taskSystem.handleTableFilter('100');

            expect(taskSystem.currentTableData.rows.length).toBe(2);
            expect(taskSystem.currentTableData.rows[0][0]).toBe('Alice');
            expect(taskSystem.currentTableData.rows[1][0]).toBe('Charlie');
        });

        it('should be a no-op when originalTableData is unset', () => {
            taskSystem.originalTableData = null;

            // Should not throw an error
            expect(() => taskSystem.handleTableFilter('test')).not.toThrow();
        });

        it('should always filter from original data, not filtered data', () => {
            // First filter - matches Alice and Charlie (both in New York)
            taskSystem.handleTableFilter('New');
            expect(taskSystem.currentTableData.rows.length).toBe(2);

            // Broaden filter to 'Denver' - this should match David from original data
            // This tests that we're filtering from originalTableData, not currentTableData
            taskSystem.handleTableFilter('Denver');
            expect(taskSystem.currentTableData.rows.length).toBe(1);
            expect(taskSystem.currentTableData.rows[0][0]).toBe('David');
        });
    });
});
