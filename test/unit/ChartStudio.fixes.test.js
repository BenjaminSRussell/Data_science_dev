import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('chart.js/auto', () => {
    class FakeChart {
        constructor(canvas, config) {
            this.canvas = canvas;
            this.config = { type: config.type };
            this.data = config.data;
            // Mimic Chart.js: resolved options are a Proxy with Symbol keys
            this.options = new Proxy({ [Symbol('x')]: 1 }, {});
            this.rawConfig = config;
        }
        destroy() {}
        update() {}
        static getChart() { return null; }
    }
    FakeChart.defaults = { color: '', borderColor: '', font: {} };
    return { default: FakeChart };
});

import { ChartManager } from '../../src/js/charts/ChartManager.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { GameState } from '../../src/js/game/GameState.js';

const taskData = { labels: ['A', 'B', 'C'], datasets: { Sales: [10, 20, 30], Rating: [4, 5, 3] } };

describe('ChartManager.buildChartConfig', () => {
    const cm = new ChartManager({});

    it('plots every series for bar charts (#1491)', () => {
        const cfg = cm.buildChartConfig(taskData, { type: 'bar' });
        expect(cfg.data.datasets.map(d => d.label)).toEqual(['Sales', 'Rating']);
    });

    it('keeps a single series for pie charts', () => {
        const cfg = cm.buildChartConfig(taskData, { type: 'pie' });
        expect(cfg.data.datasets).toHaveLength(1);
        expect(cfg.data.datasets[0].data).toEqual([10, 20, 30]);
    });

    it('maps scatter data to {x, y} points on a labelled linear axis (#2254)', () => {
        const cfg = cm.buildChartConfig(taskData, { type: 'scatter' });
        expect(cfg.data.datasets[0].data[1]).toEqual({ x: 1, y: 20 });
        expect(cfg.options.scales.x.type).toBe('linear');
        expect(cfg.options.scales.x.ticks.callback(2)).toBe('C');
    });

    it('gives bubble points a radius (#2254)', () => {
        const cfg = cm.buildChartConfig(taskData, { type: 'bubble' });
        const p = cfg.data.datasets[0].data[2];
        expect(p.x).toBe(2);
        expect(p.y).toBe(30);
        expect(p.r).toBeGreaterThan(0);
    });
});

describe('ChartManager.copyToReviewChart', () => {
    beforeEach(() => {
        document.body.innerHTML = '<canvas id="preview-chart"></canvas><canvas id="submitted-chart"></canvas>';
    });

    it('rebuilds the review chart without spreading Chart.js option proxies', () => {
        const cm = new ChartManager({});
        cm.createPreviewChart(taskData, { type: 'line', palette: 'corporate', showLegend: true });
        expect(() => cm.copyToReviewChart()).not.toThrow();
        expect(cm.reviewChart.rawConfig.type).toBe('line');
        expect(cm.reviewChart.rawConfig.options.animation).toBe(false);
        expect(Object.getOwnPropertySymbols(cm.reviewChart.rawConfig.options)).toHaveLength(0);
    });
});

describe('EconomySystem boss strictness', () => {
    function score(strictness, rand = 0.5) {
        const spy = vi.spyOn(Math, 'random').mockReturnValue(rand);
        const gs = { totalRatings: 0, ratingSum: 0, perfectScores: 0, getSoftwareQualityMultiplier: () => ({ chartAppropriateness: 1, visualClarity: 1, dataAccuracy: 1 }), currentRank: {} };
        const eco = new EconomySystem(gs);
        const task = { boss: { strictness }, optimalChartTypes: ['line'], template: { dataType: 'trend_analysis' }, potentialReward: 100, requirements: [] };
        const r = eco.evaluateChart(task, { type: 'pie', showLegend: false, showGrid: false, showDataLabels: false, title: '' });
        spy.mockRestore();
        return r;
    }

    it('a stricter boss grades lower than an easygoing one (#1990)', () => {
        expect(score(1.3).rawScore).toBeLessThan(score(0.8).rawScore);
    });

    it('a terrible chart for a strict boss can earn 1 star (#957)', () => {
        expect(score(1.3, 0).stars).toBe(1);
    });
});

describe('GameState.defaultChartConfig (#1682)', () => {
    it('returns a fresh default object each call', () => {
        const a = GameState.defaultChartConfig();
        a.type = 'pie';
        expect(GameState.defaultChartConfig().type).toBe('bar');
        expect(GameState.defaultChartConfig().title).toBe('');
    });
});
