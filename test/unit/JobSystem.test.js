/**
 * Unit tests for JobSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JobSystem } from '../../src/js/game/JobSystem.js';

describe('JobSystem', () => {
    let jobSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            characterStats: {
                addExperience: vi.fn()
            }
        };
        jobSystem = new JobSystem(mockGameState);
    });

    describe('completeTask', () => {
        it('should return null for unknown taskId', () => {
            const result = jobSystem.completeTask('unknown_task_id');
            expect(result).toBeNull();
        });

        it('should not add to completedTasks for unknown taskId', () => {
            const initialLength = jobSystem.completedTasks.length;
            jobSystem.completeTask('unknown_task_id');
            expect(jobSystem.completedTasks.length).toBe(initialLength);
        });

        it('should calculate pay exactly as Math.floor(basePay * quality) for quality = 1.0', () => {
            const result = jobSystem.completeTask('data_entry', 1.0);
            expect(result).not.toBeNull();
            expect(result.pay).toBe(50); // Math.floor(50 * 1.0)
        });

        it('should calculate pay as Math.floor(basePay * quality) for fractional quality values', () => {
            // Using quality = 0.73, which should result in Math.floor(50 * 0.73) = Math.floor(36.5) = 36
            // But Math.round(50 * 0.73) = Math.round(36.5) = 37 (verify floor, not round)
            const result = jobSystem.completeTask('data_entry', 0.73);
            expect(result).not.toBeNull();
            expect(result.pay).toBe(36); // Math.floor(50 * 0.73) = 36, not Math.round which would be 37
        });

        it('should call addExperience with correct stat and scaled XP reward', () => {
            const result = jobSystem.completeTask('data_entry', 0.5);
            expect(result).not.toBeNull();
            // data_entry has xpReward: { focus: 5 }
            // With quality 0.5: Math.floor(5 * 0.5) = 2
            expect(mockGameState.characterStats.addExperience).toHaveBeenCalledWith('focus', 2);
        });

        it('should apply XP scaling for all rewards with quality multiplier', () => {
            // spreadsheet_cleanup has xpReward: { focus: 8, intelligence: 3 }
            const result = jobSystem.completeTask('spreadsheet_cleanup', 0.5);
            expect(result).not.toBeNull();
            expect(mockGameState.characterStats.addExperience).toHaveBeenCalledWith('focus', 4); // Math.floor(8 * 0.5)
            expect(mockGameState.characterStats.addExperience).toHaveBeenCalledWith('intelligence', 1); // Math.floor(3 * 0.5)
        });

        it('should add exactly one entry to completedTasks on successful completion', () => {
            const initialLength = jobSystem.completedTasks.length;
            jobSystem.completeTask('data_entry', 1.0);
            expect(jobSystem.completedTasks.length).toBe(initialLength + 1);
        });

        it('should record taskId, quality, and computed pay in completedTasks', () => {
            jobSystem.completeTask('data_entry', 0.73);
            const entry = jobSystem.completedTasks[0];
            expect(entry.taskId).toBe('data_entry');
            expect(entry.quality).toBe(0.73);
            expect(entry.pay).toBe(36); // Math.floor(50 * 0.73)
        });

        it('should record multiple tasks in order without mutating earlier entries', () => {
            // Complete first task
            jobSystem.completeTask('data_entry', 0.5);
            const firstEntry = jobSystem.completedTasks[0];
            const firstEntrySnapshot = { ...firstEntry };

            // Complete second task
            jobSystem.completeTask('spreadsheet_cleanup', 0.8);
            const secondEntry = jobSystem.completedTasks[1];

            // Verify both are in completedTasks
            expect(jobSystem.completedTasks.length).toBe(2);

            // Verify first entry is unchanged
            expect(jobSystem.completedTasks[0]).toEqual(firstEntrySnapshot);
            expect(jobSystem.completedTasks[0].taskId).toBe('data_entry');
            expect(jobSystem.completedTasks[0].pay).toBe(25); // Math.floor(50 * 0.5)

            // Verify second entry is correct
            expect(jobSystem.completedTasks[1].taskId).toBe('spreadsheet_cleanup');
            expect(jobSystem.completedTasks[1].pay).toBe(60); // Math.floor(75 * 0.8)
        });

        it('should return correct pay and xpReward structure', () => {
            const result = jobSystem.completeTask('data_entry', 1.0);
            expect(result).toHaveProperty('pay');
            expect(result).toHaveProperty('xpReward');
            expect(result).toHaveProperty('realWorld');
            expect(result.pay).toBe(50);
            expect(result.xpReward).toEqual({ focus: 5 });
            expect(typeof result.realWorld).toBe('string');
        });

        it('should handle tasks with multiple XP rewards correctly', () => {
            // customer_survey has xpReward: { intelligence: 10 }
            jobSystem.completeTask('customer_survey', 0.6);
            expect(mockGameState.characterStats.addExperience).toHaveBeenCalledWith('intelligence', 6); // Math.floor(10 * 0.6)
        });

        it('should include completedAt timestamp in completedTasks entry', () => {
            const beforeTime = Date.now();
            jobSystem.completeTask('data_entry', 1.0);
            const afterTime = Date.now();

            const entry = jobSystem.completedTasks[0];
            expect(entry).toHaveProperty('completedAt');
            expect(entry.completedAt).toBeGreaterThanOrEqual(beforeTime);
            expect(entry.completedAt).toBeLessThanOrEqual(afterTime);
        });
    });
});
