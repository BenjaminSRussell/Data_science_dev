/**
 * Unit tests for JobSystem
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JobSystem, JOB_CATEGORIES } from '../../src/js/game/JobSystem.js';

describe('JobSystem', () => {
    let jobSystem;
    let gameState;

    beforeEach(() => {
        // Create a mock gameState
        gameState = {
            reputation: 0,
            characterStats: {
                getStat: (stat) => 50,
                addExperience: () => {}
            }
        };

        jobSystem = new JobSystem(gameState);
    });

    describe('applyForJob', () => {
        it('should reject non-existent job categories', () => {
            gameState.reputation = 0;
            const result = jobSystem.applyForJob('invalid_category');
            expect(result.success).toBe(false);
            expect(result.reason).toContain('not found');
            expect(jobSystem.currentJob).toBeNull();
        });

        it('should reject application when reputation is insufficient', () => {
            gameState.reputation = 50;
            const result = jobSystem.applyForJob('data_analyst');
            expect(result.success).toBe(false);
            expect(result.reason).toContain('Insufficient reputation');
            expect(jobSystem.currentJob).toBeNull();
        });

        it('should accept application when reputation meets minimum requirement', () => {
            gameState.reputation = 300;
            const result = jobSystem.applyForJob('data_analyst');
            expect(result.success).toBe(true);
            expect(jobSystem.currentJob).not.toBeNull();
            expect(jobSystem.currentJob.category).toBe('data_analyst');
            expect(jobSystem.currentJob.name).toBe('Data Analyst');
            expect(jobSystem.currentJob.startedAt).toBeDefined();
        });

        it('should accept entry level job with zero reputation', () => {
            gameState.reputation = 0;
            const result = jobSystem.applyForJob('entry_level');
            expect(result.success).toBe(true);
            expect(jobSystem.currentJob.category).toBe('entry_level');
        });

        it('should add job to history when application succeeds', () => {
            gameState.reputation = 100;
            const initialHistoryLength = jobSystem.jobHistory.length;
            jobSystem.applyForJob('junior_analyst');
            expect(jobSystem.jobHistory.length).toBe(initialHistoryLength + 1);
            expect(jobSystem.jobHistory[0].category).toBe('junior_analyst');
        });

        it('should allow changing jobs by applying for different category', () => {
            gameState.reputation = 600;
            jobSystem.applyForJob('data_analyst');
            expect(jobSystem.currentJob.category).toBe('data_analyst');

            jobSystem.applyForJob('senior_analyst');
            expect(jobSystem.currentJob.category).toBe('senior_analyst');
            expect(jobSystem.jobHistory.length).toBe(2);
        });
    });

    describe('getAvailableTasks after applyForJob', () => {
        it('should return empty array before applying for job', () => {
            const tasks = jobSystem.getAvailableTasks();
            expect(tasks).toEqual([]);
        });

        it('should return available tasks after successful job application', () => {
            gameState.reputation = 100;
            gameState.characterStats.getStat = () => 100; // Sufficient stats to see tasks

            jobSystem.applyForJob('junior_analyst');
            const tasks = jobSystem.getAvailableTasks();

            expect(tasks.length).toBeGreaterThan(0);
            expect(tasks[0]).toHaveProperty('id');
            expect(tasks[0]).toHaveProperty('name');
            expect(tasks[0]).toHaveProperty('basePay');
        });

        it('should return entry level tasks when hired into entry level', () => {
            gameState.reputation = 0;
            gameState.characterStats.getStat = () => 50;

            jobSystem.applyForJob('entry_level');
            const tasks = jobSystem.getAvailableTasks();

            expect(tasks.length).toBeGreaterThan(0);
            const taskIds = tasks.map(t => t.id);
            expect(taskIds).toContain('data_entry');
            expect(taskIds).toContain('spreadsheet_cleanup');
            expect(taskIds).toContain('customer_survey');
        });

        it('should return senior analyst tasks when hired into senior position', () => {
            gameState.reputation = 600;
            gameState.characterStats.getStat = () => 100;

            jobSystem.applyForJob('senior_analyst');
            const tasks = jobSystem.getAvailableTasks();

            expect(tasks.length).toBeGreaterThan(0);
            const taskIds = tasks.map(t => t.id);
            expect(taskIds).toContain('fraud_detection');
            expect(taskIds).toContain('supply_chain_optimization');
            expect(taskIds).toContain('market_research');
        });
    });

    describe('findTask and startTask with currentJob set', () => {
        beforeEach(() => {
            gameState.reputation = 100;
            jobSystem.applyForJob('junior_analyst');
        });

        it('should find tasks after job is applied', () => {
            const task = jobSystem.findTask('sales_report');
            expect(task).not.toBeNull();
            expect(task.id).toBe('sales_report');
            expect(task.name).toBe('Create Monthly Sales Report');
        });

        it('should start task after job is applied', () => {
            const taskSession = jobSystem.startTask('sales_report');
            expect(taskSession).not.toBeNull();
            expect(taskSession.task.id).toBe('sales_report');
            expect(taskSession.status).toBe('in_progress');
        });

        it('should complete task and award pay after job is applied', () => {
            jobSystem.startTask('sales_report');
            const result = jobSystem.completeTask('sales_report', 1.0);

            expect(result).not.toBeNull();
            expect(result.pay).toBe(200); // sales_report basePay is 200
            expect(result.xpReward).toBeDefined();
        });
    });

    describe('Job categories and requirements', () => {
        it('should have all expected job categories with minimum reputation', () => {
            expect(JOB_CATEGORIES.entry_level.minReputation).toBe(0);
            expect(JOB_CATEGORIES.junior_analyst.minReputation).toBe(100);
            expect(JOB_CATEGORIES.data_analyst.minReputation).toBe(300);
            expect(JOB_CATEGORIES.senior_analyst.minReputation).toBe(600);
            expect(JOB_CATEGORIES.lead_scientist.minReputation).toBe(1200);
        });

        it('should allow applying for all categories with sufficient reputation', () => {
            gameState.reputation = 1200; // Highest requirement

            for (const categoryId of Object.keys(JOB_CATEGORIES)) {
                jobSystem.applyForJob(categoryId);
                expect(jobSystem.currentJob.category).toBe(categoryId);
            }
        });
    });

    describe('Critical issue fix: getAvailableTasks() must be reachable', () => {
        it('should resolve the issue - getAvailableTasks() returns tasks after applyForJob', () => {
            // This test verifies the core issue is fixed:
            // Before the fix, getAvailableTasks() was permanently dead code because currentJob was null

            gameState.reputation = 0;
            gameState.characterStats.getStat = () => 50;

            // Before calling applyForJob, getAvailableTasks should return empty
            let tasks = jobSystem.getAvailableTasks();
            expect(tasks).toEqual([]);

            // Apply for job (simulating what happens when player chooses a starter job in IntroSystem)
            const result = jobSystem.applyForJob('entry_level');
            expect(result.success).toBe(true);

            // After calling applyForJob, getAvailableTasks should return non-empty
            tasks = jobSystem.getAvailableTasks();
            expect(tasks.length).toBeGreaterThan(0);

            // Verify we can find and start these tasks
            const task = jobSystem.findTask(tasks[0].id);
            expect(task).not.toBeNull();

            const taskSession = jobSystem.startTask(tasks[0].id);
            expect(taskSession).not.toBeNull();
            expect(taskSession.status).toBe('in_progress');
        });

        it('should demonstrate all JobSystem methods become meaningful after applyForJob is called', () => {
            // This test verifies that the entire JobSystem workflow becomes operational
            gameState.reputation = 0;
            gameState.characterStats.getStat = () => 60;

            // getAvailableJobs should return entry_level as available
            const availableJobs = jobSystem.getAvailableJobs();
            expect(availableJobs.some(j => j.category === 'entry_level')).toBe(true);

            // Apply for entry level job (this is what IntroSystem calls when player chooses a starter job)
            jobSystem.applyForJob('entry_level');

            // Now all these methods should work and be meaningful:
            const availableTasks = jobSystem.getAvailableTasks();
            expect(availableTasks.length).toBeGreaterThan(0);

            const allTasks = jobSystem.getAllTasks();
            expect(allTasks.length).toBeGreaterThan(0);

            // Should be able to start any available task
            const firstTaskId = availableTasks[0].id;
            const session = jobSystem.startTask(firstTaskId);
            expect(session.status).toBe('in_progress');

            // Should be able to complete the task
            const completion = jobSystem.completeTask(firstTaskId, 1.0);
            expect(completion.pay).toBeGreaterThan(0);
            expect(completion.xpReward).toBeDefined();
        });
    });
});
