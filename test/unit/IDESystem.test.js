/**
 * IDESystem scoring and payout (#403 #217 #1735 #1736 #1978 #1737 #1738
 * #1392 #1393 #1979 #1977 #1395)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IDESystem, INTELLIGENCE_PER_DIFFICULTY, PROJECT_COOLDOWN_DAYS, MIN_QUALITY } from '../../src/js/game/IDESystem.js';

function makeState(intelligence = 100) {
    const xp = [];
    return {
        money: 0,
        timeManager: { totalDays: 10 },
        characterStats: {
            getStat: vi.fn(() => intelligence),
            addExperience: vi.fn((skill, amount) => xp.push([skill, amount]))
        },
        xp
    };
}

describe('IDESystem', () => {
    let gs;
    let ide;

    beforeEach(() => {
        gs = makeState();
        ide = new IDESystem(gs);
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // neutral random term
    });

    afterEach(() => vi.restoreAllMocks());

    describe('startProject', () => {
        it('rejects unknown projects', () => {
            expect(ide.startProject('nope')).toEqual({ success: false, message: 'Project not found.' });
        });

        it('enforces the intelligence gate via the shared constant', () => {
            const low = new IDESystem(makeState(20));
            const r = low.startProject('data_cleaner');
            expect(r.success).toBe(false);
            expect(r.message).toContain(String(4 * INTELLIGENCE_PER_DIFFICULTY));
        });

        it('a fresh character (intelligence 10) can take the entry project', () => {
            const fresh = new IDESystem(makeState(10));
            expect(fresh.getAvailableProjects().map(p => p.id)).toEqual(['simple_script']);
            expect(fresh.startProject('simple_script').success).toBe(true);
        });

        it('starts with the template as code', () => {
            const r = ide.startProject('simple_script');
            expect(r.success).toBe(true);
            expect(ide.currentProject.status).toBe('in_progress');
            expect(ide.currentProject.code).toBe(ide.availableProjects[0].codeTemplate);
        });

        it('refuses to clobber an active project', () => {
            ide.startProject('simple_script');
            const r = ide.startProject('web_scraper');
            expect(r.success).toBe(false);
            expect(ide.currentProject.id).toBe('simple_script');
        });

        it('enforces a cooldown before repeating a project', () => {
            ide.startProject('simple_script');
            ide.submitCode('import os\ndef go():\n    pass\n\n\n\n\n\n\n\n\n\n\n\n');
            expect(ide.startProject('simple_script').success).toBe(false);
            gs.timeManager.totalDays += PROJECT_COOLDOWN_DAYS;
            expect(ide.startProject('simple_script').success).toBe(true);
        });
    });

    describe('evaluateCode', () => {
        const project = { codeTemplate: 'def f():\n    pass' };

        it('blank code scores 0, the untouched template scores the minimum', () => {
            expect(ide.evaluateCode('', project)).toBe(0);
            expect(ide.evaluateCode('   ', project)).toBe(0);
            expect(ide.evaluateCode(project.codeTemplate, project)).toBe(MIN_QUALITY);
            expect(ide.evaluateCode(null, project)).toBe(0);
        });

        it('modified code earns more than the template', () => {
            expect(ide.evaluateCode('x = 1', project)).toBeCloseTo(0.7);
            expect(ide.evaluateCode('import os\ndef g():\n  return 1\n\n', project)).toBeCloseTo(1.0);
        });

        it('random term is bounded and quality caps at 1', () => {
            Math.random.mockReturnValue(1);
            expect(ide.evaluateCode('import os\ndef g():\n  return 1\n\n', project)).toBe(1);
            Math.random.mockReturnValue(0);
            expect(ide.evaluateCode('x = 1', project)).toBeCloseTo(0.6);
        });
    });

    describe('submitCode', () => {
        it('requires an active project', () => {
            expect(ide.submitCode('x')).toEqual({ success: false, message: 'No active project.' });
        });

        it('rejects non-string and blank code without crashing', () => {
            ide.startProject('simple_script');
            expect(ide.submitCode(undefined).success).toBe(false);
            expect(ide.submitCode({}).success).toBe(false);
            expect(ide.submitCode('  ').success).toBe(false);
            expect(ide.currentProject).not.toBeNull();
            expect(gs.money).toBe(0);
        });

        it('pays basePay * quality, records completion, and clears the project', () => {
            ide.startProject('simple_script');
            const r = ide.submitCode('x = 1');
            expect(r.success).toBe(true);
            expect(r.pay).toBe(Math.floor(200 * 0.7));
            expect(gs.money).toBe(r.pay);
            expect(r.message).toMatch(/Good job/);
            expect(ide.completedProjects[0]).toMatchObject({ projectId: 'simple_script', day: 10 });
            expect(ide.currentProject).toBeNull();
        });

        it('quality tiers drive the message', () => {
            ide.startProject('web_scraper');
            const tpl = ide.currentProject.codeTemplate;
            expect(ide.submitCode(tpl).message).toMatch(/could be better/);
            ide.startProject('api_integration');
            expect(ide.submitCode('import os\ndef g():\n' + 'x\n'.repeat(200)).message).toMatch(/Excellent/);
        });

        it('splits XP across skills so multi-skill projects do not pay double', () => {
            ide.startProject('data_cleaner'); // difficulty 4, two skills
            ide.submitCode('x = 1'); // quality 0.7 -> pool 28
            expect(gs.xp).toEqual([['intelligence', 14], ['analytics', 14]]);
        });
    });

    it('cancelProject', () => {
        expect(ide.cancelProject().success).toBe(false);
        ide.startProject('simple_script');
        expect(ide.cancelProject().success).toBe(true);
        expect(ide.currentProject).toBeNull();
    });
});
