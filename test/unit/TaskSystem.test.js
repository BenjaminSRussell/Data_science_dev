import { TaskSystem } from '../../src/js/game/TaskSystem.js';
import { gameState } from '../../src/js/game/gameState.js';
import { BOSSES } from '../../src/js/game/BOSSES.js';

// Mock gameState
gameState.currentRank = {
    salaryMultiplier: 1.5
};
gameState.rankIndex = 2;
gameState.characterStats = {
    rank: gameState.currentRank
};

describe('TaskSystem', () => {
    let taskSystem;

    beforeEach(() => {
        taskSystem = new TaskSystem(gameState);
    });

    describe('getDifficultyForRank', () => {
        it('should return correct difficulty for rankIndex <= 1', () => {
            expect(taskSystem.getDifficultyForRank(1)).toBe(1);
        });

        it('should return correct difficulty for rankIndex <= 3', () => {
            expect(taskSystem.getDifficultyForRank(2)).toBe(2);
            expect(taskSystem.getDifficultyForRank(3)).toBe(2);
        });

        it('should return correct difficulty for rankIndex <= 5', () => {
            expect(taskSystem.getDifficultyForRank(4)).toBe(3);
            expect(taskSystem.getDifficultyForRank(5)).toBe(3);
        });

        it('should return correct difficulty for rankIndex === 6 or > 5', () => {
            expect(taskSystem.getDifficultyForRank(6)).toBe(4);
            expect(taskSystem.getDifficultyForRank(7)).toBe(4);
        });
    });

    describe('generateNewTask', () => {
        it('should prefer COMPREHENSIVE_DATA_SCIENCE_TASKS when non-empty', () => {
            const mockTasks = [{ difficulty: 2 }, { difficulty: 2.5 }];
            taskSystem.COMPREHENSIVE_DATA_SCIENCE_TASKS = mockTasks;
            taskSystem.TASKS = [{ difficulty: 3 }];
            const task = taskSystem.generateNewTask();
            expect(task).toBe(mockTasks[0]);
        });

        it('should filter tasks with difficulty within 0.5', () => {
            const mockTasks = [{ difficulty: 2 }, { difficulty: 3.1 }, { difficulty: 4 }];
            taskSystem.COMPREHENSIVE_DATA_SCIENCE_TASKS = mockTasks;
            const task = taskSystem.generateNewTask();
            expect(task).toBe(mockTasks[0]);
        });

        it('should fall back to generateFallbackTask when zero match', () => {
            const spy = jest.spyOn(taskSystem, 'generateFallbackTask');
            taskSystem.COMPREHENSIVE_DATA_SCIENCE_TASKS = [];
            taskSystem.generateNewTask();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('generateData', () => {
        it('should generate data for \'quarterly_sales\'', () => {
            const template = { dataType: 'quarterly_sales' };
            const data = taskSystem.generateData(template);
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBe(4); // Assuming 4 quarters in a year
        });

        it('should generate data for \'monthly_revenue\'', () => {
            const template = { dataType: 'monthly_revenue' };
            const data = taskSystem.generateData(template);
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBe(12); // Assuming 12 months in a year
        });

        it('should generate data for unrecognized dataType', () => {
            const template = { dataType: 'unknown' };
            const spy = jest.spyOn(taskSystem, 'generateQuarterlySalesData');
            taskSystem.generateData(template);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('createTaskFromTemplate', () => {
        it('should calculate potentialReward correctly', () => {
            const taskTemplate = { difficulty: 2 };
            const task = taskSystem.createTaskFromTemplate(taskTemplate);
            expect(task.potentialReward).toBe(160);
        });

        it('should auto-pick boss when not passed', () => {
            const taskTemplate = { difficulty: 2 };
            const task = taskSystem.createTaskFromTemplate(taskTemplate);
            expect(task.boss).toBe(BOSSES[0]);
        });
    });

    describe('handleTableSort', () => {
        it('should toggle sort direction on repeated same-colIndex', () => {
            const tableData = [{ name: 'A' }, { name: 'B' }];
            taskSystem.currentTableData = tableData;
            taskSystem.handleTableSort(0);
            expect(tableData[0].name).toBe('B');
            taskSystem.handleTableSort(0);
            expect(tableData[0].name).toBe('A');
        });

        it('should handle numeric and string columns', () => {
            const tableData = [{ score: 10 }, { score: 20 }];
            taskSystem.currentTableData = tableData;
            taskSystem.handleTableSort(0);
            expect(tableData[0].score).toBe(20);
        });

        it('should no-op when currentTableData is unset', () => {
            const spy = jest.spyOn(taskSystem, 'sortTableData');
            taskSystem.handleTableSort(0);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('handleTableFilter', () => {
        it('should filter from originalTableData', () => {
            const originalTableData = [{ name: 'Alice' }, { name: 'Bob' }];
            taskSystem.originalTableData = originalTableData;
            taskSystem.handleTableFilter('Alice');
            expect(taskSystem.currentTableData).toEqual([{ name: 'Alice' }]);
        });

        it('should allow filter undo by broader query', () => {
            const originalTableData = [{ name: 'Alice' }, { name: 'Bob' }];
            taskSystem.originalTableData = originalTableData;
            taskSystem.handleTableFilter('Alice');
            taskSystem.handleTableFilter('');
            expect(taskSystem.currentTableData).toEqual(originalTableData);
        });

        it('should no-op when originalTableData is unset', () => {
            const spy = jest.spyOn(taskSystem, 'filterTableData');
            taskSystem.handleTableFilter('Alice');
            expect(spy).not.toHaveBeenCalled();
        });
    });
});