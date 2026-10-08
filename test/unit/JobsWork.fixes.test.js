import { describe, it, expect, vi } from 'vitest';
import { JobSystem, JOB_CATEGORIES } from '../../src/js/game/JobSystem.js';
import { WorkInteractionSystem } from '../../src/js/game/WorkInteractionSystem.js';
import { VisualProgressionSystem } from '../../src/js/game/visual/VisualProgressionSystem.js';
import { RANKS } from '../../src/js/data/ranks.js';

function cs(level = 50) {
    return {
        getStat: () => level,
        getTotalBonuses: () => ({ clientPay: 0 }),
        addExperience: vi.fn(),
        getAllStats: () => ['intelligence', 'charisma'].map(id => ({ id, value: level }))
    };
}

describe('JobSystem (#951, #952, #953, #955, #1823, #1825, #234)', () => {
    it('every rank has a job tier with the same reputation gate', () => {
        const mins = Object.values(JOB_CATEGORIES).map(c => c.minReputation);
        expect(mins).toEqual(RANKS.map(r => r.repRequired));
    });

    it('currentJob follows reputation so getAvailableTasks returns tasks', () => {
        const gs = { reputation: 0, characterStats: cs(50) };
        const js = new JobSystem(gs);
        expect(js.getAvailableTasks().length).toBeGreaterThan(0);
        expect(js.currentJob).toMatchObject({ category: 'entry_level', level: 0 });
        gs.reputation = 700;
        js.updateCurrentJob();
        expect(js.currentJob.category).toBe('senior_analyst');
        expect(js.jobHistory).toHaveLength(1);
    });

    it('getAvailableJobs records availableJobs', () => {
        const js = new JobSystem({ reputation: 300 });
        js.getAvailableJobs();
        expect(js.availableJobs).toEqual(['entry_level', 'junior_analyst', 'data_analyst']);
    });

    it('completeTask pays into money/totalEarned/weeklyIncome and grants XP', () => {
        const gs = { money: 10, totalEarned: 0, weeklyIncome: 0, characterStats: cs(50) };
        const js = new JobSystem(gs);
        js.startTask('data_entry');
        const r = js.completeTask('data_entry', 1);
        expect(r.success).toBe(true);
        expect(r.pay).toBe(50);
        expect(gs.money).toBe(60);
        expect(gs.totalEarned).toBe(50);
        expect(gs.weeklyIncome).toBe(50);
        expect(gs.characterStats.addExperience).toHaveBeenCalledWith('focus', 5);
    });

    it('guards: must start first, cannot complete twice, quality clamped', () => {
        const gs = { money: 0, characterStats: cs(50) };
        const js = new JobSystem(gs);
        expect(js.completeTask('data_entry').success).toBe(false);
        js.startTask('data_entry');
        expect(js.completeTask('data_entry', 5).pay).toBe(50); // clamped to 1
        expect(js.completeTask('data_entry').success).toBe(false);
        js.startTask('data_entry');
        expect(js.completeTask('data_entry', -3).pay).toBe(0);
        expect(gs.money).toBe(50);
    });

    it('skills affect pay: beginners earn less (#1825)', () => {
        const js = new JobSystem({ money: 0, characterStats: cs(0) });
        js.startTask('data_entry');
        expect(js.completeTask('data_entry', 1).pay).toBe(40);
    });
});

describe('WorkInteractionSystem promotion inputs (#1542, #1809, #1016, #219, #1810)', () => {
    it('task results feed readiness and relationship, clamped to 0-100', () => {
        const wis = new WorkInteractionSystem({});
        for (let i = 0; i < 40; i++) wis.recordTaskResult(5);
        expect(wis.boss.promotionReadiness).toBe(100);
        expect(wis.boss.relationship).toBe(100);
        wis.boss.relationship = 0;
        wis.recordTaskResult(1);
        expect(wis.boss.relationship).toBe(0);
    });

    it('askForPromotion can succeed from real gameplay and stays in bounds', () => {
        const gs = { reputation: 600, tasksCompleted: 25 };
        const wis = new WorkInteractionSystem(gs);
        for (let i = 0; i < 30; i++) wis.recordTaskResult(5);
        const r = wis.askForPromotion();
        expect(r.success).toBe(true);
        expect(r.newRelationship).toBeLessThanOrEqual(100);
        wis.boss.promotionReadiness = 95;
        wis.boss.relationship = 10;
        const fail = wis.askForPromotion();
        expect(fail.success).toBe(false);
        expect(wis.boss.promotionReadiness).toBeLessThanOrEqual(100);
        expect(wis.boss.relationship).toBeGreaterThanOrEqual(0);
    });
});

describe('VisualProgressionSystem stats (#2082)', () => {
    it('reads job level and skill gains from real systems', () => {
        const gs = { reputation: 5000, characterStats: cs(40) };
        gs.jobSystem = new JobSystem(gs);
        const vps = new VisualProgressionSystem(gs);
        const stats = vps.getCurrentStats();
        expect(stats.jobLevel).toBe(6);
        expect(stats.totalSkills).toBe(60); // (40-10) x 2 stats
    });
});
