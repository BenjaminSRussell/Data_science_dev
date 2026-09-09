/**
 * JobSystem Unit Tests
 * Verifies reputation gating in JobSystem.getAvailableJobs()
 */

import { describe, it, expect } from 'vitest';
import { JobSystem, JOB_CATEGORIES } from '../../src/js/game/JobSystem.js';

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
