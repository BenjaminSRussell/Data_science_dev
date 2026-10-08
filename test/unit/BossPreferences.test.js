/**
 * Boss data from bosses.js now drives gameplay: chart tastes pick bosses and
 * shift the grade (#1854); clarity/creativity values, personality, id and the
 * per-boss success/fail lines are all read (#2226)
 */
import { describe, it, expect, vi } from 'vitest';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { BOSSES } from '../../src/js/data/bosses.js';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { bossPreferenceText, UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { MainGame } from '../../src/js/main.js';

const anderson = BOSSES.find(b => b.id === 'anderson'); // likes bar/line, dislikes radar

describe('TaskSystem.pickBossFor (#1854)', () => {
    it('never pairs a task with a boss who dislikes its optimal chart type', () => {
        const template = { optimalChartTypes: ['radar'] };
        for (let i = 0; i < 50; i++) {
            const boss = TaskSystem.pickBossFor(template, () => i / 50);
            expect(boss.preferences?.dislikesChartTypes || []).not.toContain('radar');
        }
    });

    it('weights bosses who like the chart type twice as heavily', () => {
        const a = { id: 'a', preferences: { likesChartTypes: ['pie'] } };
        const b = { id: 'b', preferences: {} };
        // weights 2 + 1: rolls below 2/3 pick a
        expect(TaskSystem.pickBossFor({ optimalChartTypes: ['pie'] }, () => 0.6, [a, b]).id).toBe('a');
        expect(TaskSystem.pickBossFor({ optimalChartTypes: ['pie'] }, () => 0.7, [a, b]).id).toBe('b');
    });

    it('falls back to everyone if every boss dislikes the type', () => {
        const a = { id: 'a', preferences: { dislikesChartTypes: ['pie'] } };
        expect(TaskSystem.pickBossFor({ optimalChartTypes: ['pie'] }, () => 0, [a]).id).toBe('a');
    });
});

describe('EconomySystem.bossTaste (#1854, #2226)', () => {
    it('liked types score higher than disliked ones', () => {
        expect(EconomySystem.bossTaste(anderson, { type: 'bar' })).toMatchObject({ appropriatenessDelta: 8, preference: 'liked' });
        expect(EconomySystem.bossTaste(anderson, { type: 'radar' })).toMatchObject({ appropriatenessDelta: -12, preference: 'disliked' });
        expect(EconomySystem.bossTaste(anderson, { type: 'pie' })).toMatchObject({ appropriatenessDelta: 0, preference: null });
    });

    it('valuesClarity reweights toward clarity; valuesCreativity rewards styling', () => {
        expect(EconomySystem.bossTaste({ preferences: { valuesClarity: true } }).weights.visualClarity).toBe(0.4);
        expect(EconomySystem.bossTaste({ preferences: {} }).weights.visualClarity).toBe(0.3);
        const creative = { preferences: { valuesCreativity: true } };
        expect(EconomySystem.bossTaste(creative, { palette: 'corporate' }).clarityDelta).toBe(0);
        expect(EconomySystem.bossTaste(creative, { palette: 'vibrant' }).clarityDelta).toBe(5);
        expect(EconomySystem.bossTaste(creative, { showDataLabels: true }).clarityDelta).toBe(5);
    });

    it('evaluateChart applies it and reports the preference', () => {
        const gs = { getSoftwareQualityMultiplier: () => ({ chartAppropriateness: 1, visualClarity: 1, dataAccuracy: 1 }), totalRatings: 0, ratingSum: 0, perfectScores: 0 };
        const econ = new EconomySystem(gs);
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const task = { boss: anderson, optimalChartTypes: ['bar', 'radar'], acceptableChartTypes: [], potentialReward: 100 };
        const liked = econ.evaluateChart(task, { type: 'bar', showLegend: true, showGrid: true, title: 't' });
        const disliked = econ.evaluateChart(task, { type: 'radar', showLegend: true, showGrid: true, title: 't' });
        vi.restoreAllMocks();
        expect(liked.bossPreference).toBe('liked');
        expect(disliked.bossPreference).toBe('disliked');
        expect(liked.rawScore).toBeGreaterThan(disliked.rawScore);
    });
});

describe('boss review and panel text (#2226)', () => {
    it('uses the boss\'s own success / fail lines', () => {
        const ok = MainGame.bossReviewLine(anderson, { stars: 4 }, {}, () => 0);
        expect(ok).toBe(anderson.successResponses[0]);
        const bad = MainGame.bossReviewLine(anderson, { stars: 1 }, {}, () => 0);
        expect(bad).toBe(anderson.failResponses[0]);
        expect(MainGame.bossReviewLine(null, { stars: 5 }, { 5: { text: 'generic' } })).toBe('generic');
        expect(MainGame.bossReviewLine(anderson, { stars: 4, bossPreference: 'disliked', chartType: 'radar' }, {}, () => 0))
            .toMatch(/^You know I'm not a fan of radar charts\. /);
    });

    it('summarises personality and tastes for the task panel', () => {
        expect(bossPreferenceText(anderson)).toBe('Traditional · likes bar, line · dislikes radar · values clarity');
        expect(bossPreferenceText(null)).toBe('');
    });

    it('updateTaskDisplay writes the tastes line with the boss id', () => {
        document.body.innerHTML = '<div><h3 id="boss-name"></h3><span id="boss-title"></span></div><div id="boss-dialogue"><p></p></div>';
        const task = { name: 'x', description: '', boss: anderson, requirements: [] };
        const ui = new UIUpdater({ gameState: { currentTask: task } });
        try { ui.updateTaskDisplay(); } catch { /* other panel parts absent in this DOM */ }
        const el = document.getElementById('boss-preferences');
        expect(el?.textContent).toContain('dislikes radar');
        expect(el?.dataset.bossId).toBe('anderson');
    });
});
