/**
 * JobSystem Unit Tests
 * Verifies that completeTask guards against unstarted, stale, and
 * duplicate completions, and clamps quality to [0, 1].
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JobSystem } from '../../src/js/game/JobSystem.js';

function makeGameState() {
    return {
        reputation: 0,
        characterStats: {
            addExperience: vi.fn(),
            getStat: vi.fn(() => 10)
        }
    };
}

describe('JobSystem task completion guards', () => {
    let jobSystem;
    let originalNow;

    beforeEach(() => {
        jobSystem = new JobSystem(makeGameState());
        originalNow = Date.now;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        Date.now = originalNow;
    });

    it('rejects completing a task that was never started', () => {
        const result = jobSystem.completeTask('data_entry');
        expect(result).toBeNull();
        expect(jobSystem.completedTasks).toHaveLength(0);
    });

    it('rejects completing a task before its timeRequired has elapsed', () => {
        vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
        jobSystem.startTask('data_entry'); // timeRequired: 2 hours

        // Only 1 hour has passed
        Date.now.mockReturnValue(1_000_000 + 60 * 60 * 1000);
        expect(jobSystem.completeTask('data_entry')).toBeNull();
        expect(jobSystem.completedTasks).toHaveLength(0);
    });

    it('completes a task after timeRequired has elapsed', () => {
        vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
        jobSystem.startTask('data_entry'); // timeRequired: 2 hours

        Date.now.mockReturnValue(1_000_000 + 2 * 60 * 60 * 1000);
        const result = jobSystem.completeTask('data_entry');
        expect(result).not.toBeNull();
        expect(result.pay).toBe(50); // basePay 50 * quality 1.0
        expect(jobSystem.completedTasks).toHaveLength(1);
    });

    it('rejects completing the same task twice without restarting it', () => {
        vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
        jobSystem.startTask('data_entry');

        Date.now.mockReturnValue(1_000_000 + 2 * 60 * 60 * 1000);
        expect(jobSystem.completeTask('data_entry')).not.toBeNull();
        // Second completion without a new startTask must be rejected
        expect(jobSystem.completeTask('data_entry')).toBeNull();
        expect(jobSystem.completedTasks).toHaveLength(1);
    });

    it('allows a task to be repeated after restarting it', () => {
        vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
        jobSystem.startTask('data_entry');

        Date.now.mockReturnValue(1_000_000 + 2 * 60 * 60 * 1000);
        expect(jobSystem.completeTask('data_entry')).not.toBeNull();

        // Restart and complete again
        jobSystem.startTask('data_entry');
        Date.now.mockReturnValue(1_000_000 + 4 * 60 * 60 * 1000);
        expect(jobSystem.completeTask('data_entry')).not.toBeNull();
        expect(jobSystem.completedTasks).toHaveLength(2);
    });

    it('clamps quality above 1 down to 1', () => {
        vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
        jobSystem.startTask('data_entry');

        Date.now.mockReturnValue(1_000_000 + 2 * 60 * 60 * 1000);
        const result = jobSystem.completeTask('data_entry', 5);
        expect(result.pay).toBe(50); // not 250
        expect(jobSystem.completedTasks[0].quality).toBe(1);
    });

    it('clamps negative quality up to 0', () => {
        vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
        jobSystem.startTask('data_entry');

        Date.now.mockReturnValue(1_000_000 + 2 * 60 * 60 * 1000);
        const result = jobSystem.completeTask('data_entry', -3);
        expect(result.pay).toBe(0); // not negative
        expect(jobSystem.completedTasks[0].quality).toBe(0);
    });

    it('startTask returns null for an unknown taskId', () => {
        expect(jobSystem.startTask('no_such_task')).toBeNull();
    });
});
