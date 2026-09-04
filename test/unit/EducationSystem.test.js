/**
 * Unit tests for EducationSystem
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EducationSystem } from '../../src/js/game/EducationSystem.js';

describe('EducationSystem', () => {
    let educationSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            money: 10000
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

        it('should allow enrollment of a 101 course with no completed courses', () => {
            const result = educationSystem.enroll('python_101');

            expect(result.success).toBe(true);
            expect(mockGameState.money).toBe(10000 - 500);
        });

        it('should still reject enrollment when tuition cannot be afforded', () => {
            mockGameState.money = 100;
            educationSystem.completedCourses.push('python_101');

            const result = educationSystem.enroll('stats_201');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Cannot afford tuition.');
        });
    });
});
