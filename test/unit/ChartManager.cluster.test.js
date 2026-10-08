/**
 * ChartManager cluster: opacity parsing (#1890, #61), radar colours (#1489),
 * colours past the 6th category (#1372), radial grid toggle (#2436),
 * data labels (#1490), vibrant/pastel exposed (#1373), corporate palette
 * purples (#1891).
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

vi.mock('chart.js/auto', () => {
    class FakeChart {
        constructor(canvas, config) { this.config = config; this.data = config.data; this.options = config.options; }
        destroy() {}
        update() {}
        static getChart() { return null; }
    }
    FakeChart.defaults = { color: '', borderColor: '', font: {} };
    return { default: FakeChart };
});

import { ChartManager } from '../../src/js/charts/ChartManager.js';

const cm = new ChartManager({});
const data6 = n => ({
    labels: Array.from({ length: n }, (_, i) => `C${i}`),
    datasets: { Revenue: Array.from({ length: n }, (_, i) => i + 1) }
});

describe('ChartManager cluster', () => {
    it('withAlpha parses colours instead of replacing "0.8" (#1890, #61)', () => {
        expect(ChartManager.withAlpha('rgba(55, 65, 81, 0.9)', 1)).toBe('rgba(55, 65, 81, 1)');
        expect(ChartManager.withAlpha('rgba(229, 231, 235, 0.4)', 0.2)).toBe('rgba(229, 231, 235, 0.2)');
        expect(ChartManager.withAlpha('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
        const cfg = cm.buildChartConfig(data6(6), { type: 'bar', palette: 'monochrome' });
        for (const c of cfg.data.datasets[0].borderColor) expect(c).toMatch(/, 1\)$/);
        const line = cm.buildChartConfig(data6(4), { type: 'line', palette: 'monochrome' });
        expect(line.data.datasets[0].backgroundColor).toBe('rgba(55, 65, 81, 0.2)');
    });

    it('radar gets one colour per dataset (#1489)', () => {
        const cfg = cm.buildChartConfig(data6(5), { type: 'radar', palette: 'corporate' });
        expect(typeof cfg.data.datasets[0].backgroundColor).toBe('string');
        expect(typeof cfg.data.datasets[0].borderColor).toBe('string');
    });

    it('bar and pie keep a colour for every category past the 6th (#1372)', () => {
        for (const type of ['bar', 'pie']) {
            const cfg = cm.buildChartConfig(data6(9), { type, palette: 'corporate' });
            const bg = cfg.data.datasets[0].backgroundColor;
            expect(bg).toHaveLength(9);
            bg.forEach(c => expect(c).toMatch(/^rgba\(/));
            // 7th repeats the 1st colour but fainter
            expect(bg[6]).not.toBe(bg[0]);
        }
    });

    it('radial charts honour Show Grid (#2436)', () => {
        for (const type of ['radar', 'polarArea']) {
            const on = cm.buildChartOptions({ showGrid: true }, type, 'Revenue');
            const off = cm.buildChartOptions({ showGrid: false }, type, 'Revenue');
            expect(on.scales.r.grid.display).toBe(true);
            expect(off.scales.r.grid.display).toBe(false);
            expect(off.scales.r.angleLines.display).toBe(false);
        }
        expect(cm.buildChartOptions({ showGrid: true }, 'pie', 'x').scales).toEqual({});
    });

    it('data labels plugin draws only when the option is on (#1490)', () => {
        const cfg = cm.buildChartConfig(data6(3), { type: 'bar', showDataLabels: true });
        expect(cfg.plugins).toContain(ChartManager.dataLabelsPlugin);
        const fillText = vi.fn();
        const ctx = { save() {}, restore() {}, fillText };
        const chart = {
            ctx,
            options: cfg.options,
            data: { datasets: [{ data: [5, 1500, 2500000] }] },
            getDatasetMeta: () => ({ data: [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 30 }] })
        };
        ChartManager.dataLabelsPlugin.afterDatasetsDraw(chart);
        expect(fillText.mock.calls.map(c => c[0])).toEqual(['5', '1.5k', '2.5M']);

        fillText.mockClear();
        const off = cm.buildChartConfig(data6(3), { type: 'bar', showDataLabels: false });
        ChartManager.dataLabelsPlugin.afterDatasetsDraw({ ...chart, options: off.options });
        expect(fillText).not.toHaveBeenCalled();
    });

    it('vibrant and pastel are selectable in Chart Studio (#1373)', () => {
        const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');
        for (const name of Object.keys(ChartManager.PALETTES)) {
            expect(html).toContain(`data-palette="${name}"`);
        }
    });

    it('corporate palette has no two adjacent purples (#1891)', () => {
        const hues = ChartManager.PALETTES.corporate.map(c => {
            const [r, g, b] = c.match(/\d+/g).slice(0, 3).map(Number).map(v => v / 255);
            const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
            if (!d) return 0;
            let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
            return (h * 60 + 360) % 360;
        });
        const purple = h => h >= 255 && h <= 290;
        expect(hues.filter(purple).length).toBeLessThanOrEqual(1);
    });
});
