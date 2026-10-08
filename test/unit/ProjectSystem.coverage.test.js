/**
 * ProjectSystem filtering, stage progression and completion rewards (#440)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectSystem } from '../../src/js/game/ProjectSystem.js';

function makeState(extra = {}) {
    return {
        money: 0, reputation: 0,
        characterStats: { stats: { luck: 0 }, getStat: () => 50, addExperience: vi.fn(), modifyEthics: vi.fn() },
        ...extra
    };
}

describe('ProjectSystem coverage', () => {
    let gs, ps;
    beforeEach(() => { gs = makeState(); ps = new ProjectSystem(gs); });

    it('refreshContracts filters by reputation requirement', () => {
        expect(ps.refreshContracts().map(c => c.id)).not.toContain('fashion_trends');
        gs.reputation = 200;
        expect(ps.refreshContracts().map(c => c.id)).toContain('fashion_trends');
    });

    it('startProject guards', () => {
        expect(ps.startProject('nope')).toEqual({ success: false, reason: 'Contract not found.' });
        expect(ps.startProject('crypto_scraper').success).toBe(true);
        expect(ps.activeProject).toMatchObject({ currentStageIndex: 0, stageProgress: 0 });
        expect(ps.startProject('loan_risk_model')).toEqual({ success: false, reason: 'Already working on a project.' });
    });

    it('aiSystem processing power adds to work', () => {
        gs.aiSystem = { processingPower: 5 };
        ps.startProject('crypto_scraper');
        const r = ps.workOnProject(10);
        expect(r.status).toBe('working');
        expect(ps.activeProject.stageProgress).toBe(15);
        expect(r.progress).toBe(15);
    });

    it('stages advance and the last one completes the project', () => {
        ps.startProject('crypto_scraper'); // stages 100, 100
        const stage = ps.workOnProject(100);
        expect(stage.status).toBe('stage_complete');
        expect(ps.activeProject.currentStageIndex).toBe(1);
        expect(ps.activeProject.stageProgress).toBe(0);
        const done = ps.workOnProject(100);
        expect(done.status).toBe('project_complete');
    });

    it('completeProject pays, grants XP and reputation, records history, clears', () => {
        ps.startProject('crypto_scraper');
        const r = ps.completeProject();
        expect(gs.money).toBe(800);
        expect(gs.totalEarned).toBe(800);
        expect(gs.weeklyIncome).toBe(800);
        expect(gs.reputation).toBe(10); // difficulty 1 * 10
        expect(r.reputationChange).toBe(10);
        expect(gs.characterStats.addExperience).toHaveBeenCalledWith('intelligence', 500);
        expect(gs.characterStats.addExperience).toHaveBeenCalledWith('focus', 200);
        expect(ps.completedProjects).toEqual(['crypto_scraper']);
        expect(ps.projectHistory).toEqual({ crypto_scraper: 1 });
        expect(ps.activeProject).toBeNull();
    });

    it('a throwing addExperience does not break completion', () => {
        gs.characterStats.addExperience = vi.fn(() => { throw new Error('boom'); });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        ps.startProject('crypto_scraper');
        const r = ps.completeProject();
        expect(r.status).toBe('project_complete');
        expect(gs.money).toBe(800);
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it('unethical work applies ethics and nets reputation', () => {
        gs.reputation = 100;
        ps.startProject('loan_risk_model'); // difficulty 3, ethics -20
        const r = ps.completeProject();
        expect(gs.characterStats.modifyEthics).toHaveBeenCalledWith(-20);
        expect(r.reputationChange).toBe(30 - 40);
        expect(gs.reputation).toBe(90);
    });

    it('toJSON/fromJSON round-trip', () => {
        ps.startProject('crypto_scraper');
        ps.workOnProject(30);
        const restored = new ProjectSystem(makeState());
        restored.fromJSON(JSON.parse(JSON.stringify(ps.toJSON())));
        expect(restored.activeProject.id).toBe('crypto_scraper');
        expect(restored.activeProject.stageProgress).toBe(30);
        restored.fromJSON({});
        expect(restored.activeProject).toBeNull();
        expect(restored.completedProjects).toEqual([]);
    });
});
