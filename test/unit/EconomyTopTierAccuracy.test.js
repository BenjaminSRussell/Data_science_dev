import { describe, it, expect } from 'vitest';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { COMPREHENSIVE_DATA_SCIENCE_TASKS } from '../../src/js/data/comprehensive_datascience_tasks.js';

// #264: top-tier tasks get a real, deterministic data-accuracy rubric
const loanTask = COMPREHENSIVE_DATA_SCIENCE_TASKS.find(t => t.id === 'ds_0021');

const economy = new EconomySystem({ getSoftwareQualityMultiplier: () => ({}) });

describe('top-tier data accuracy rubric (#264)', () => {
    it('uses a real top-tier task from the catalogue', () => {
        expect(loanTask.difficulty).toBeGreaterThanOrEqual(EconomySystem.TOP_TIER_DIFFICULTY);
        expect(loanTask.optimalChartTypes).toContain('line');
    });

    it('scores a correct chart far above a wrong one', () => {
        const correct = { type: 'line', title: 'Loan default risk by credit score', showGrid: true, showLegend: true, showDataLabels: false };
        const wrong = { type: 'pie', title: '', showGrid: false, showLegend: false, showDataLabels: false };
        const good = economy.scoreDataAccuracy(loanTask, correct);
        const bad = economy.scoreDataAccuracy(loanTask, wrong);
        expect(good).toBe(100);
        expect(bad).toBe(10);
        expect(good - bad).toBeGreaterThanOrEqual(50);
    });

    it('is deterministic (no random jitter) for top-tier tasks', () => {
        const cfg = { type: 'scatter', title: 'Default rates', showGrid: true };
        const scores = new Set(Array.from({ length: 20 }, () => economy.scoreDataAccuracy(loanTask, cfg)));
        expect(scores.size).toBe(1);
    });

    it('breaks the score down by criterion', () => {
        const { breakdown } = EconomySystem.topTierAccuracy(loanTask, { type: 'bar', title: 'Quarterly numbers', showGrid: false, showLegend: true });
        expect(breakdown).toEqual({ chartType: 5, readingAid: 5, title: 10, legend: 15 });
    });

    it('credits acceptable-but-not-optimal types partially', () => {
        const task = { difficulty: 9, name: 'Churn segments', optimalChartTypes: ['pie'], acceptableChartTypes: ['pie', 'bar'] };
        const { breakdown } = EconomySystem.topTierAccuracy(task, { type: 'bar' });
        expect(breakdown.chartType).toBe(25);
    });

    it('asks proportion charts for data labels and a legend', () => {
        const task = { difficulty: 9, name: 'Revenue share by region', optimalChartTypes: ['pie'], acceptableChartTypes: ['pie'] };
        const bare = EconomySystem.topTierAccuracy(task, { type: 'pie', title: 'Revenue share', showGrid: true });
        const dressed = EconomySystem.topTierAccuracy(task, { type: 'pie', title: 'Revenue share', showDataLabels: true, showLegend: true });
        expect(bare.breakdown.readingAid).toBe(5);
        expect(bare.breakdown.legend).toBe(0);
        expect(dressed.score).toBe(100);
    });

    it('generic words in the title do not count as naming the subject', () => {
        expect(EconomySystem.titleNamesSubject('Model analysis', loanTask)).toBe(false);
        expect(EconomySystem.titleNamesSubject('Loan risk', loanTask)).toBe(true);
    });

    it('lower tiers keep the existing heuristic (40-100 range)', () => {
        const easy = { difficulty: 2, optimalChartTypes: ['bar'] };
        const s = economy.scoreDataAccuracy(easy, { type: 'bar' });
        expect(s).toBeGreaterThanOrEqual(40);
        expect(s).toBeLessThanOrEqual(100);
    });
});
