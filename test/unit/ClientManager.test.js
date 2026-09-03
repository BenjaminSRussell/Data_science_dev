import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientManager } from '../../src/js/game/ClientManager.js';
import { CLIENT_TYPES, MARKETING_CHANNELS } from '../../src/js/data/tycoonData.js';

function makeGameState(overrides = {}) {
    return {
        rankIndex: 1,
        currentOffice: null,
        ...overrides
    };
}

describe('ClientManager', () => {
    let manager;
    let randomSpy;

    beforeEach(() => {
        manager = new ClientManager(makeGameState());
        randomSpy = vi.spyOn(Math, 'random');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('generateLeads()', () => {
        it('defaults to word_of_mouth channel only', () => {
            expect(manager.marketingActive).toEqual(['word_of_mouth']);
        });

        it('sums leadsPerDay of active channels and multiplies by (1 + office.clientBonus)', () => {
            // word_of_mouth = 0.5, linkedin = 1 -> 1.5; office bonus 0.5 -> 2.25
            manager.activateMarketing('linkedin');
            manager.gameState.currentOffice = { clientBonus: 0.5 };
            randomSpy.mockReturnValue(0.99); // 0.99 < 0.25 is false -> floor(2.25) = 2
            const result = manager.generateLeads();
            expect(result).toBe(2);
        });

        it('rounds fractional leads up when Math.random() < fractional part', () => {
            // word_of_mouth = 0.5, no office -> totalLeads = 0.5
            randomSpy.mockReturnValue(0.4); // 0.4 < 0.5 -> rounds up to 1
            const up = manager.generateLeads();
            expect(up).toBe(1);
        });

        it('rounds fractional leads down when Math.random() >= fractional part', () => {
            randomSpy.mockReturnValue(0.6); // 0.6 < 0.5 is false -> 0
            const down = manager.generateLeads();
            expect(down).toBe(0);
        });

        it('roundup and rounddown differ by exactly 1', () => {
            randomSpy.mockReturnValue(0.4);
            const up = manager.generateLeads();
            randomSpy.mockReturnValue(0.6);
            const down = manager.generateLeads();
            expect(up - down).toBe(1);
        });
    });

    describe('generateClient()', () => {
        it('returns null and pushes nothing when rankIndex excludes all CLIENT_TYPES', () => {
            // cap = ceil(rankIndex/2) + 1; rankIndex 0 -> cap 1, but to exclude ALL
            // types (min complexity 1) we need cap < 1, i.e. rankIndex negative
            manager.gameState.rankIndex = -1; // cap = ceil(-0.5)+1 = 0
            const result = manager.generateClient();
            expect(result).toBeNull();
            expect(manager.pendingJobs).toHaveLength(0);
        });

        it('pushes job to pendingJobs and dispatches newjob CustomEvent on window', () => {
            const listener = vi.fn();
            window.addEventListener('newjob', listener);
            randomSpy.mockReturnValue(0); // pick first available client type
            const job = manager.generateClient();
            expect(job).not.toBeNull();
            expect(manager.pendingJobs).toContain(job);
            expect(listener).toHaveBeenCalledTimes(1);
            const event = listener.mock.calls[0][0];
            expect(event).toBeInstanceOf(CustomEvent);
            expect(event.detail).toBe(job);
            window.removeEventListener('newjob', listener);
        });

        it('higher rankIndex unlocks higher-complexity client types', () => {
            // rankIndex 0 -> cap 1: only small_business (complexity 1)
            manager.gameState.rankIndex = 0;
            randomSpy.mockReturnValue(0);
            const lowJob = manager.generateClient();
            expect(lowJob.clientType.dataComplexity).toBe(1);

            // rankIndex 8 -> cap 5: all types available; force last (fortune500)
            manager.gameState.rankIndex = 8;
            randomSpy.mockReturnValue(0.999);
            const highJob = manager.generateClient();
            expect(highJob.clientType.dataComplexity).toBe(4);
        });
    });

    describe('acceptJob(jobId)', () => {
        it('returns null for an unknown jobId', () => {
            expect(manager.acceptJob('nope')).toBeNull();
        });

        it('removes job from pendingJobs, sets status active, generates data, pushes to activeClients', () => {
            randomSpy.mockReturnValue(0);
            const job = manager.generateClient();
            const result = manager.acceptJob(job.id);
            expect(result).toBe(job);
            expect(manager.pendingJobs).not.toContain(job);
            expect(job.status).toBe('active');
            expect(job.data).not.toBeNull();
            expect(manager.activeClients).toContain(job);
        });
    });

    describe('declineJob(jobId)', () => {
        it('removes the matching pending job', () => {
            randomSpy.mockReturnValue(0);
            const job = manager.generateClient();
            manager.declineJob(job.id);
            expect(manager.pendingJobs).not.toContain(job);
        });

        it('is a no-op for an unknown jobId', () => {
            randomSpy.mockReturnValue(0);
            const job = manager.generateClient();
            manager.declineJob('unknown');
            expect(manager.pendingJobs).toContain(job);
        });
    });

    describe('updateJobProgress(jobId, progress)', () => {
        it('clamps progress to 100', () => {
            randomSpy.mockReturnValue(0);
            const job = manager.generateClient();
            manager.acceptJob(job.id);
            manager.updateJobProgress(job.id, 250);
            expect(job.progress).toBe(100);
        });

        it('auto-completes the job at progress >= 100 (activeClients -> completedJobs)', () => {
            randomSpy.mockReturnValue(0);
            const job = manager.generateClient();
            manager.acceptJob(job.id);
            manager.updateJobProgress(job.id, 100);
            expect(manager.activeClients).not.toContain(job);
            expect(manager.completedJobs).toContain(job);
            expect(job.status).toBe('completed');
        });
    });

    describe('cleanupExpiredJobs()', () => {
        it('filters out past expiresAt and retains future ones', () => {
            const now = Date.now();
            manager.pendingJobs = [
                { id: 'expired', expiresAt: now - 1000 },
                { id: 'future', expiresAt: now + 10000 }
            ];
            manager.cleanupExpiredJobs();
            expect(manager.pendingJobs.map(j => j.id)).toEqual(['future']);
        });
    });
});
