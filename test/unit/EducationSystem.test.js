/**
 * Unit tests for EducationSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EducationSystem } from '../../src/js/game/EducationSystem.js';

describe('EducationSystem', () => {
    let educationSystem;
    let mockGameState;
    let mockNewsManager;

    beforeEach(() => {
        mockNewsManager = { addNews: vi.fn() };
        mockGameState = {
            money: 10000,
            newsManager: mockNewsManager
        };
        educationSystem = new EducationSystem(mockGameState);
    });

    describe('course prereqs', () => {
        it('should define empty prereqs for 101-level courses', () => {
            expect(educationSystem.courses.python_101.prereqs).toEqual([]);
            expect(educationSystem.courses.sql_101.prereqs).toEqual([]);
        });

        it('should define 101-level prereqs for 201/intro-level courses', () => {
            expect(educationSystem.courses.stats_201.prereqs).toContain('python_101');
            expect(educationSystem.courses.ml_intro.prereqs).toEqual(expect.arrayContaining(['python_101', 'sql_101']));
        });
    });

    describe('enroll', () => {
        it('should return failure with "Course already completed." if course was already completed', () => {
            educationSystem.completeCourse('python_101');

            const result = educationSystem.enroll('python_101');
            expect(result).toEqual({ success: false, message: "Course already completed." });
        });

        it('should return failure with "Cannot afford tuition." and not mutate money when money is insufficient', () => {
            mockGameState.money = 499; // python_101 costs 500

            const result = educationSystem.enroll('python_101');
            expect(result).toEqual({ success: false, message: "Cannot afford tuition." });
            expect(mockGameState.money).toBe(499);
        });

        it('should deduct the exact course cost on successful enrollment', () => {
            const result = educationSystem.enroll('python_101');

            expect(result.success).toBe(true);
            expect(mockGameState.money).toBe(10000 - 500);
        });

        it('should allow enrollment when prerequisites are met', () => {
            educationSystem.completedCourses.push('python_101');

            const result = educationSystem.enroll('stats_201');

            expect(result.success).toBe(true);
            expect(mockGameState.money).toBe(10000 - 1000);
        });

        it('should block enrollment when prerequisites are missing', () => {
            const result = educationSystem.enroll('ml_intro');

            expect(result.success).toBe(false);
            expect(result.message).toMatch(/Prerequisites not met/i);
            expect(result.message).toContain('Python 101');
            expect(result.message).toContain('SQL Fundamentals');
            // Tuition must not be charged
            expect(mockGameState.money).toBe(10000);
        });

        it('should still reject enrollment when tuition cannot be afforded', () => {
            mockGameState.money = 100;
            educationSystem.completedCourses.push('python_101');

            const result = educationSystem.enroll('stats_201');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Cannot afford tuition.');
        });
    });

    describe('completeCourse', () => {
        it('should return true on first completion and false on duplicate', () => {
            expect(educationSystem.completeCourse('python_101')).toBe(true);
            expect(educationSystem.completeCourse('python_101')).toBe(false);
        });
    });

    describe('degree progression', () => {
        it('should unlock the bootcamp degree when both required courses are completed', () => {
            educationSystem.completeCourse('python_101');
            expect(educationSystem.degrees.bootcamp.acquired).toBe(false);

            educationSystem.completeCourse('sql_101');
            expect(educationSystem.degrees.bootcamp.acquired).toBe(true);
            expect(mockNewsManager.addNews).toHaveBeenCalledTimes(1);
            expect(mockNewsManager.addNews).toHaveBeenCalledWith(
                expect.objectContaining({ text: expect.stringContaining('Data Science Bootcamp') })
            );
        });

        it('should not unlock the degree when only one required course is completed', () => {
            educationSystem.completeCourse('python_101');

            expect(educationSystem.degrees.bootcamp.acquired).toBe(false);
            expect(mockNewsManager.addNews).not.toHaveBeenCalled();
        });

        it('should not re-trigger addNews for an already acquired degree on further completions', () => {
            educationSystem.completeCourse('python_101');
            educationSystem.completeCourse('sql_101');
            expect(mockNewsManager.addNews).toHaveBeenCalledTimes(1);

            educationSystem.completeCourse('stats_201');
            expect(mockNewsManager.addNews).toHaveBeenCalledTimes(1);
        });
    });

    describe('fromJSON', () => {
        it('should merge only existing degree keys and ignore unknown ones without throwing', () => {
            expect(() => educationSystem.fromJSON({
                degrees: {
                    bootcamp: { acquired: true },
                    made_up_degree: { acquired: true }
                }
            })).not.toThrow();

            expect(educationSystem.degrees.bootcamp.acquired).toBe(true);
            expect(educationSystem.degrees.bachelors.acquired).toBe(false);
            expect(educationSystem.degrees.masters.acquired).toBe(false);
            expect(educationSystem.degrees.made_up_degree).toBeUndefined();
        });
    });
});
