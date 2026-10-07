import { describe, it, expect } from 'vitest';
import { JobSystem } from '../../src/js/game/JobSystem.js';

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
