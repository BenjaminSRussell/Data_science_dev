import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectSystem, SKILL_TO_STAT } from '../../src/js/game/ProjectSystem.js';
import { CONTRACTS } from '../../src/js/game/ProjectDatabase.js';
import { CharacterStats } from '../../src/js/game/CharacterStats.js';
import { AISystem } from '../../src/js/game/AISystem.js';
import { AudioManager } from '../../src/js/audio/AudioManager.js';
import { getOfficePrices, finishWorkingSession } from '../../src/js/helpers/ProjectHelpers.js';
import { OFFICES } from '../../src/js/data/tycoonData.js';

function makeState(extra = {}) {
    const gs = { money: 0, reputation: 0, characterStats: new CharacterStats(), ...extra };
    gs.aiSystem = new AISystem(gs);
    return gs;
}

describe('ProjectSystem fixes', () => {
    let gs, ps;
    beforeEach(() => { gs = makeState(); ps = new ProjectSystem(gs); });

    it('reputation requirement reads gameState.reputation (#1110, #2363)', () => {
        expect(ps.availableContracts.map(c => c.id)).not.toContain('fashion_trends');
        gs.reputation = 250;
        ps.refreshContracts();
        expect(ps.availableContracts.map(c => c.id)).toContain('fashion_trends');
    });

    it('stat requirements fail closed without characterStats (#1519)', () => {
        const p = new ProjectSystem({ reputation: 0, characterStats: null });
        expect(p.meetsRequirements({ requirements: { stat: 'intelligence', value: 5 } })).toBe(false);
    });

    it('startProject re-checks requirements (#163)', () => {
        expect(ps.startProject('fashion_trends').success).toBe(false);
    });

    it('startProject deep-copies stages (#1792)', () => {
        ps.startProject('crypto_scraper');
        ps.activeProject.stages[0].maxProgress = 1;
        expect(CONTRACTS.find(c => c.id === 'crypto_scraper').stages[0].maxProgress).toBe(100);
    });

    it('carries overflow into the next stage and tracks totalProgress (#1117, #1518, #1789, #1517)', () => {
        ps.startProject('crypto_scraper');
        ps.workOnProject(130);
        expect(ps.activeProject.currentStageIndex).toBe(1);
        expect(ps.activeProject.stageProgress).toBeGreaterThanOrEqual(30 - 0.001);
        expect(ps.activeProject.totalProgress).toBeGreaterThanOrEqual(130);
    });

    it('workOnProject is safe with broken stages (#1112)', () => {
        ps.activeProject = { id: 'x', stages: null, currentStageIndex: 0, stageProgress: 0 };
        expect(ps.workOnProject(5)).toBeNull();
    });

    it('checkProgress returns the completion result once (#1109, #2362)', () => {
        ps.startProject('crypto_scraper');
        ps.workOnProject(100);
        expect(ps.checkProgress()?.status).toBe('stage_complete');
        expect(ps.checkProgress()).toBeNull();
    });

    it('completed contracts are not re-offered or re-startable (#1790)', () => {
        ps.startProject('crypto_scraper');
        expect(ps.availableContracts.map(c => c.id)).not.toContain('crypto_scraper');
        ps.workOnProject(100); ps.workOnProject(100);
        expect(ps.activeProject).toBeNull();
        expect(ps.availableContracts.map(c => c.id)).not.toContain('crypto_scraper');
        expect(ps.startProject('crypto_scraper').success).toBe(false);
    });

    it('project XP lands on real stats with train() scaling (#2041)', () => {
        ps.startProject('crypto_scraper');
        ps.workOnProject(100); ps.workOnProject(100);
        const res = ps.lastResult;
        expect(res.status).toBe('project_complete');
        const stat = SKILL_TO_STAT.python;
        expect(res.xpGained[stat]).toBe(Math.floor(50 * 10 * 1.1));
    });

    it('unethical contracts cost reputation (#1115)', () => {
        gs.reputation = 100;
        ps.startProject('loan_risk_model');
        ps.workOnProject(150); ps.workOnProject(250);
        expect(gs.reputation).toBeLessThan(100);
    });

    it('completing a project grants AI data points (#1807) and cancel works (#1113)', () => {
        ps.startProject('crypto_scraper');
        ps.workOnProject(100); ps.workOnProject(100);
        expect(gs.aiSystem.dataPoints).toBeGreaterThan(0);
        ps.startProject('loan_risk_model');
        expect(ps.cancelProject().success).toBe(true);
        expect(ps.activeProject).toBeNull();
        expect(ps.availableContracts.map(c => c.id)).toContain('loan_risk_model');
    });
});

describe('AISystem / Audio / office pricing', () => {
    it('train() reports level-ups (#1765) and persists data points (#1807)', () => {
        const ai = new AISystem({});
        const r = ai.train(10);
        expect(r.leveledUp).toBe(true);
        ai.dataPoints = 7;
        const back = new AISystem({}); back.fromJSON(JSON.parse(JSON.stringify(ai.toJSON())));
        expect(back.dataPoints).toBe(7);
    });

    it('AudioManager.play returns whether a sound played (#2250, #1234)', () => {
        const am = Object.create(AudioManager.prototype);
        am.soundEnabled = true;
        am.playTone = vi.fn();
        expect(am.play('not_a_sound')).toBe(false);
        expect(am.play('click')).toBe(true);
    });

    it('office prices come from OFFICES (#1767)', () => {
        expect(getOfficePrices()).toEqual(OFFICES.map(o => o.price));
    });

    it('finishWorkingSession shows the completion toast (#1768, #2040)', () => {
        document.body.innerHTML = '<div id="working-overlay"></div>';
        const gs = makeState();
        const ps = new ProjectSystem(gs);
        ps.startProject('crypto_scraper');
        ps.workOnProject(100); ps.workOnProject(100);
        const game = {
            projectSystem: ps, workSession: { active: true },
            uiUpdater: { updateCareerScreen: vi.fn(), updateAllUI: vi.fn() },
            showToast: vi.fn(), audioManager: { play: vi.fn() }
        };
        finishWorkingSession(game, 10, 30);
        expect(game.showToast).toHaveBeenCalledWith(expect.stringContaining('PROJECT COMPLETE'), 'success');
    });
});
