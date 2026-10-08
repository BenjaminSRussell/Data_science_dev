/**
 * Contracts, projects and real-world tasks share one reward path (#267):
 * pay is weekly (taxed) income and lifetime earnings, reputation floors at 0
 */
import { describe, it, expect } from 'vitest';
import { grantWorkReward } from '../../src/js/game/work/workRewards.js';
import { ContractSystem } from '../../src/js/game/contracts/ContractSystem.js';
import { ProjectSystem } from '../../src/js/game/ProjectSystem.js';
import { RealWorldTaskSystem } from '../../src/js/game/work/RealWorldTaskSystem.js';

function gs(extra = {}) {
    return { money: 100, reputation: 5, weeklyIncome: 0, totalEarned: 0,
        characterStats: { getStat: () => 999, addExperience() {}, modifyEthics() {}, stats: {} },
        timeManager: { totalDays: 1 }, ...extra };
}

describe('grantWorkReward (#267)', () => {
    it('books pay as money, weekly income and lifetime earnings', () => {
        const g = gs();
        expect(grantWorkReward(g, { money: 250, reputation: 3 })).toEqual({ money: 250, reputation: 3 });
        expect(g).toMatchObject({ money: 350, weeklyIncome: 250, totalEarned: 250, reputation: 8 });
    });

    it('floors reputation at 0 and reports what was applied', () => {
        const g = gs();
        expect(grantWorkReward(g, { reputation: -20 }).reputation).toBe(-5);
        expect(g.reputation).toBe(0);
    });

    it('ignores junk values and a missing gameState', () => {
        const g = gs();
        grantWorkReward(g, { money: 'abc', reputation: NaN });
        expect(g).toMatchObject({ money: 100, reputation: 5, weeklyIncome: 0 });
        expect(grantWorkReward(null, { money: 5 })).toEqual({ money: 0, reputation: 0 });
    });
});

describe('every work system books income the same way (#267)', () => {
    it('ContractSystem', () => {
        const g = gs({ reputation: 100000 });
        const cs = new ContractSystem(g);
        const c = cs.availableContracts[0];
        expect(cs.acceptContract(c.id).success).toBe(true);
        const r = cs.workOnContract(c.id, c.timeRequired);
        expect(r.success).toBe(true);
        expect(g.weeklyIncome).toBeCloseTo(r.pay);
        expect(g.totalEarned).toBeCloseTo(r.pay);
    });

    it('ProjectSystem', () => {
        const g = gs({ reputation: 100000 });
        const ps = new ProjectSystem(g);
        const p = ps.availableContracts.find(c => c.reward > 0);
        expect(ps.startProject(p.id).success).toBe(true);
        let result;
        for (let i = 0; i < 100 && ps.activeProject; i++) result = ps.workOnProject(1e6);
        expect(result.status).toBe('project_complete');
        expect(g.weeklyIncome).toBe(p.reward);
        expect(g.totalEarned).toBe(p.reward);
    });

    it('RealWorldTaskSystem (task pay used to skip weekly income)', () => {
        const g = gs();
        const rw = new RealWorldTaskSystem(g);
        const task = rw.generateTask('data_analyst');
        rw.startTask(task);
        rw.completeTask();
        expect(task.reward.money).toBeGreaterThan(0);
        expect(g.weeklyIncome).toBe(task.reward.money);
        expect(g.totalEarned).toBe(task.reward.money);
        expect(g.money).toBe(100 + task.reward.money);
    });
});
