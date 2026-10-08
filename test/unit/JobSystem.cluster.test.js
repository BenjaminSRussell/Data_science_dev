import { describe, it, expect } from 'vitest';
import { JobSystem, JOB_CATEGORIES } from '../../src/js/game/JobSystem.js';
import { WorkInteractionSystem } from '../../src/js/game/WorkInteractionSystem.js';

const stats = (v) => ({ getStat: () => v, addExperience: () => {} });

describe('JobSystem eligibility is consistent (#1826)', () => {
    it('getAvailableJobs only lists tasks within reach, like getAvailableTasks', () => {
        const gs = { reputation: 100000, characterStats: stats(0) };
        const js = new JobSystem(gs);
        const jobs = js.getAvailableJobs();
        expect(jobs.length).toBe(Object.keys(JOB_CATEGORIES).length);
        for (const job of jobs) {
            expect(job.tasks.every(t => t.difficulty <= 2)).toBe(true);
        }
        const tasks = js.getAvailableTasks();
        expect(tasks.every(t => t.difficulty <= 2)).toBe(true);
    });

    it('getAvailableTasks refuses a category the reputation no longer covers', () => {
        const gs = { reputation: 0, characterStats: stats(100) };
        const js = new JobSystem(gs);
        js.updateCurrentJob = () => { js.currentJob = { category: 'chief_data_officer' }; return js.currentJob; };
        expect(js.getAvailableTasks()).toEqual([]);
    });
});

describe('JobSystem.completeTask grants reputation (#1824)', () => {
    it('adds reputation scaled by quality and records it', () => {
        const gs = { reputation: 0, money: 0, characterStats: stats(50) };
        const js = new JobSystem(gs);
        const task = JOB_CATEGORIES.entry_level.tasks[0];
        js.startTask(task.id);
        const res = js.completeTask(task.id, 1);
        expect(res.reputation).toBe(JobSystem.reputationFor(task));
        expect(gs.reputation).toBe(res.reputation);
        js.startTask(task.id);
        const half = js.completeTask(task.id, 0.5);
        expect(half.reputation).toBe(Math.round(JobSystem.reputationFor(task) * 0.5));
        expect(js.completedTasks.at(-1).reputation).toBe(half.reputation);
    });

    it('enough task work eventually unlocks the next category', () => {
        const gs = { reputation: 0, money: 0, characterStats: stats(50) };
        const js = new JobSystem(gs);
        const task = JOB_CATEGORIES.entry_level.tasks[0];
        for (let i = 0; i < 200 && gs.reputation < 100; i++) {
            js.startTask(task.id);
            js.completeTask(task.id, 1);
        }
        expect(js.updateCurrentJob().level).toBeGreaterThan(0);
    });

    it('an explicit reputationReward wins', () => {
        expect(JobSystem.reputationFor({ difficulty: 4, reputationReward: 2 })).toBe(2);
        expect(JobSystem.reputationFor({ difficulty: 4 })).toBe(20);
    });
});

describe('quitJob records job history (#1546)', () => {
    it('pushes the quit job into jobSystem.jobHistory before clearing it', () => {
        const gs = { currentJob: { company: 'Acme', title: 'Analyst' }, timeManager: { totalDays: 12 } };
        gs.jobSystem = new JobSystem(gs);
        const wis = new WorkInteractionSystem(gs);
        wis.boss.relationship = 55;
        wis.quitJob();
        expect(gs.currentJob).toBeNull();
        expect(gs.jobSystem.jobHistory).toHaveLength(1);
        expect(gs.jobSystem.jobHistory[0]).toMatchObject({ company: 'Acme', title: 'Analyst', reason: 'quit', bossRelationship: 55, endedDay: 12 });
    });

    it('does nothing to history when there is no job', () => {
        const gs = { currentJob: null };
        gs.jobSystem = new JobSystem(gs);
        new WorkInteractionSystem(gs).quitJob();
        expect(gs.jobSystem.jobHistory).toHaveLength(0);
    });
});
