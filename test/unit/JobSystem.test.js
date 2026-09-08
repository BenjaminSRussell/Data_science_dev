import { expect } from 'vitest';
import JobSystem from '../../src/js/game/JobSystem.js';

describe('JobSystem', () => {
    let jobSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            characterStats: {
                addExperience: vi.fn()
            },
            tasks: {
                'data_entry': {
                    basePay: 50,
                    xpReward: { focus: 5 }
                },
                'coding': {
                    basePay: 100,
                    xpReward: { creativity: 10 }
                }
            }
        };
        jobSystem = new JobSystem(mockGameState);
    });

    test('returns null for unknown taskId', () => {
        const result = jobSystem.completeTask('unknown_task', 1.0);
        expect(result).toBeNull();
        expect(jobSystem.completedTasks.length).toBe(0);
    });

    test('completes task with default quality and calculates pay correctly', () => {
        const result = jobSystem.completeTask('data_entry', 1.0);
        expect(result).toBe(50);
        expect(jobSystem.completedTasks.length).toBe(1);
        expect(jobSystem.completedTasks[0]).toEqual({
            taskId: 'data_entry',
            quality: 1.0,
            pay: 50
        });
    });

    test('completes task with fractional quality and calculates pay correctly', () => {
        const result = jobSystem.completeTask('data_entry', 0.73);
        expect(result).toBe(36); // Math.floor(50 * 0.73) = 36.5, floored to 36
        expect(jobSystem.completedTasks.length).toBe(1);
        expect(jobSystem.completedTasks[0]).toEqual({
            taskId: 'data_entry',
            quality: 0.73,
            pay: 36
        });
    });

    test('grants XP based on task quality', () => {
        jobSystem.completeTask('data_entry', 0.5);
        expect(mockGameState.characterStats.addExperience).toHaveBeenCalledWith('focus', 2);
    });

    test('records completed tasks in order without mutating earlier entries', () => {
        jobSystem.completeTask('data_entry', 1.0);
        jobSystem.completeTask('coding', 0.8);
        expect(jobSystem.completedTasks.length).toBe(2);
        expect(jobSystem.completedTasks[0]).toEqual({
            taskId: 'data_entry',
            quality: 1.0,
            pay: 50
        });
        expect(jobSystem.completedTasks[1]).toEqual({
            taskId: 'coding',
            quality: 0.8,
            pay: 80 // Math.floor(100 * 0.8) = 80
        });
    });
});