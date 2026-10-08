import { describe, it, expect, vi, afterEach } from 'vitest';
import { ClientManager } from '../../src/js/game/ClientManager.js';
import { OFFICES, CLIENT_TYPES } from '../../src/js/data/tycoonData.js';

afterEach(() => vi.restoreAllMocks());

describe('ClientManager job pipeline (#1385-#1390)', () => {
    const make = (gs = {}) => new ClientManager({ money: 100, rankIndex: 4, officeIndex: 0, ...gs });

    it('completing a job pays the player (#1385)', () => {
        const gs = { money: 100, rankIndex: 4 };
        const cm = new ClientManager(gs);
        const job = cm.generateClient();
        cm.acceptJob(job.id);
        cm.updateJobProgress(job.id, 100);
        expect(gs.money).toBe(100 + job.payment);
        expect(cm.completedJobs).toContain(job);
    });

    it('the office lead bonus applies via officeIndex (#1386)', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        const best = OFFICES.length - 1;
        const cm = make({ officeIndex: best });
        cm.marketingActive = ['word_of_mouth'];
        expect(cm.getCurrentOffice()).toBe(OFFICES[best]);
        const base = make({ officeIndex: 0 });
        expect(cm.generateLeads()).toBeGreaterThanOrEqual(base.generateLeads());
        expect(OFFICES[best].clientBonus).toBeGreaterThan(0);
    });

    it('title and description describe the same job (#1387)', () => {
        const cm = make();
        for (let i = 0; i < 20; i++) {
            const job = cm.generateJob(CLIENT_TYPES[0]);
            expect(job.description.toLowerCase()).toContain(job.title.toLowerCase());
        }
    });

    it('expired offers cannot be accepted (#1388)', () => {
        const cm = make();
        const job = cm.generateClient();
        job.expiresAt = Date.now() - 1;
        expect(cm.acceptJob(job.id)).toBeNull();
        expect(cm.activeJobs).toHaveLength(0);
        expect(cm.pendingJobs).toHaveLength(0);
    });

    it('progress never goes negative (#1389)', () => {
        const cm = make();
        const job = cm.generateClient();
        cm.acceptJob(job.id);
        cm.updateJobProgress(job.id, -40);
        expect(job.progress).toBe(0);
        cm.updateJobProgress(job.id, 'oops');
        expect(job.progress).toBe(0);
    });

    it('accepted work lives in activeJobs; activeClients is an alias (#1390)', () => {
        const cm = make();
        const job = cm.generateClient();
        cm.acceptJob(job.id);
        expect(cm.activeJobs).toEqual([job]);
        expect(cm.activeClients).toBe(cm.activeJobs);
        expect(cm.getActiveJobCount()).toBe(1);
    });
});
