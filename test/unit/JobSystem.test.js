/**
 * JobSystem Unit Tests
 * Verifies that completeTask applies pay to gameState.money,
 * reputation gating in getAvailableJobs(), and the save/load round trip
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JobSystem, JOB_CATEGORIES } from '../../src/js/game/JobSystem.js';

describe('JobSystem', () => {
    let gameState;
    let jobSystem;

    beforeEach(() => {
        gameState = {
            money: 0,
            reputation: 0,
            characterStats: {
                addExperience: () => {},
                getStat: () => 0
            }
        };
        jobSystem = new JobSystem(gameState);
    });

    describe('completeTask', () => {
        it('should add pay to gameState.money', () => {
            gameState.money = 1000;

            const result = jobSystem.completeTask('data_entry', 1.0);

            expect(result).not.toBeNull();
            expect(result.pay).toBe(50);
            expect(gameState.money).toBe(1050);
        });

        it('should add pay scaled by quality to gameState.money', () => {
            gameState.money = 0;

            const result = jobSystem.completeTask('data_entry', 0.5);

            expect(result.pay).toBe(25);
            expect(gameState.money).toBe(25);
        });

        it('should increase money by Math.floor(basePay * quality)', () => {
            gameState.money = 0;

            const quality = 0.7;
            const expectedPay = Math.floor(50 * quality);

            jobSystem.completeTask('data_entry', quality);

            expect(gameState.money).toBe(expectedPay);
        });

        it('should return null for unknown task and not change money', () => {
            gameState.money = 500;

            const result = jobSystem.completeTask('nonexistent_task');

            expect(result).toBeNull();
            expect(gameState.money).toBe(500);
        });
    });
});

function makeSystem(reputation) {
    return new JobSystem({ reputation });
}

function categoryIds(jobs) {
    return jobs.map(j => j.category);
}

describe('JobSystem.getAvailableJobs reputation gating', () => {
    it('reputation 0 returns only entry_level (minReputation 0)', () => {
        const jobs = makeSystem(0).getAvailableJobs();
        expect(categoryIds(jobs)).toEqual(['entry_level']);
    });

    it('reputation exactly 100 includes junior_analyst (boundary, >= not >)', () => {
        const jobs = makeSystem(100).getAvailableJobs();
        expect(categoryIds(jobs)).toContain('junior_analyst');
    });

    it('reputation 99 excludes junior_analyst', () => {
        const jobs = makeSystem(99).getAvailableJobs();
        expect(categoryIds(jobs)).not.toContain('junior_analyst');
    });

    it('reputation 1200+ returns all 5 categories, not a subset', () => {
        const allIds = Object.keys(JOB_CATEGORIES);
        expect(allIds).toHaveLength(5);

        const jobs = makeSystem(1200).getAvailableJobs();
        expect(categoryIds(jobs)).toEqual(allIds);
    });
});

describe('JobSystem save/load round trip', () => {
    it('round-trips a fresh instance to itself', () => {
        const system = new JobSystem({});
        const restored = new JobSystem({});
        restored.fromJSON(system.toJSON());

        expect(restored.currentJob).toBeNull();
        expect(restored.jobHistory).toEqual([]);
        expect(restored.availableJobs).toEqual([]);
        expect(restored.completedTasks).toEqual([]);
    });

    it('round-trips populated state with deep equality on all four fields', () => {
        const system = new JobSystem({});
        system.currentJob = { id: 'sales_report', name: 'Create Monthly Sales Report', progress: 0.5 };
        system.completedTasks.push({ id: 'data_entry', pay: 50 });
        system.completedTasks.push({ id: 'spreadsheet_cleanup', pay: 75 });
        system.jobHistory.push({ id: 'data_entry', completedAt: 123 });

        const restored = new JobSystem({});
        restored.fromJSON(system.toJSON());

        expect(restored.currentJob).toEqual(system.currentJob);
        expect(restored.jobHistory).toEqual(system.jobHistory);
        expect(restored.availableJobs).toEqual(system.availableJobs);
        expect(restored.completedTasks).toEqual(system.completedTasks);
    });

    it('fromJSON(null) and fromJSON(undefined) are no-ops that keep existing state', () => {
        const system = new JobSystem({});
        system.currentJob = { id: 'sales_report' };
        system.completedTasks.push({ id: 'data_entry' });
        system.jobHistory.push({ id: 'spreadsheet_cleanup' });
        system.availableJobs.push({ category: 'entry_level' });

        system.fromJSON(null);
        system.fromJSON(undefined);

        expect(system.currentJob).toEqual({ id: 'sales_report' });
        expect(system.completedTasks).toEqual([{ id: 'data_entry' }]);
        expect(system.jobHistory).toEqual([{ id: 'spreadsheet_cleanup' }]);
        expect(system.availableJobs).toEqual([{ category: 'entry_level' }]);
    });

    it('fromJSON({}) falls back each array to [] and currentJob to null', () => {
        const system = new JobSystem({});
        system.currentJob = { id: 'sales_report' };
        system.completedTasks.push({ id: 'data_entry' });
        system.jobHistory.push({ id: 'spreadsheet_cleanup' });
        system.availableJobs.push({ category: 'entry_level' });

        expect(() => system.fromJSON({})).not.toThrow();

        expect(system.currentJob).toBeNull();
        expect(system.jobHistory).toEqual([]);
        expect(system.availableJobs).toEqual([]);
        expect(system.completedTasks).toEqual([]);
    });
});
