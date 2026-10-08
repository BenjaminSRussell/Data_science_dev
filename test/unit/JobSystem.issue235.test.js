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

    it('reputation 5000+ returns all 7 categories (one per rank, #953), not a subset', () => {
        const allIds = Object.keys(JOB_CATEGORIES);
        expect(allIds).toHaveLength(7);

        const jobs = makeSystem(5000).getAvailableJobs();
        expect(categoryIds(jobs)).toEqual(allIds);
        // 1200 stops at the Lead Data Scientist tier
        expect(categoryIds(makeSystem(1200).getAvailableJobs())).toEqual(allIds.slice(0, 5));
    });
});
