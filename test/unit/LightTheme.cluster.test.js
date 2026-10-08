/**
 * Light theme and colour fixes (#1747, #1749, #881, #1893, #1892, #1881, #1090)
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { ChartManager } from '../../src/js/charts/ChartManager.js';

const root = path.resolve(__dirname, '../..');
const mainCss = fs.readFileSync(path.join(root, 'src/styles/main.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function block(selector) {
    const i = mainCss.indexOf(selector + ' {');
    return mainCss.slice(i, mainCss.indexOf('}', i));
}
function lightVar(name) {
    return block('[data-theme="light"]').match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];
}
function darkVar(name) {
    return block(':root').match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];
}
function luminance(hex) {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map(x => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
}

describe('page background follows the theme (#1747)', () => {
    it('body uses --color-bg-primary and a themed pattern', () => {
        const body = mainCss.match(/\nbody \{([^}]*)\}/)[1];
        expect(body).toContain('background: var(--color-bg-primary)');
        const before = mainCss.match(/body::before \{([^}]*)\}/)[1];
        expect(before).toContain('var(--body-pattern-1)');
        expect(lightVar('body-pattern-1')).toBeTruthy();
    });
});

describe('gradient text is readable in light mode (#1749)', () => {
    it('light --gradient-primary is dark enough to read on white', () => {
        const stops = lightVar('gradient-primary').match(/#[0-9a-f]{6}/gi);
        for (const stop of stops) expect(contrast(stop, '#ffffff')).toBeGreaterThan(4.5);
    });

    it('current rank number text contrasts with the gradient in both themes', () => {
        expect(mainCss).toMatch(/\.career-rank\.current \.rank-number \{[^}]*color: var\(--color-bg-primary\)/);
    });
});

describe('muted text contrast (#881)', () => {
    it('meets WCAG AA on the primary and secondary backgrounds in both themes', () => {
        for (const bg of ['color-bg-primary', 'color-bg-secondary']) {
            expect(contrast(darkVar('color-text-muted'), darkVar(bg))).toBeGreaterThanOrEqual(4.5);
            expect(contrast(lightVar('color-text-muted'), lightVar(bg))).toBeGreaterThanOrEqual(4.5);
        }
    });
});

describe('chart colours follow the theme (#1893)', () => {
    afterEach(() => document.documentElement.removeAttribute('data-theme'));

    it('uses dark text on light theme and light text on dark theme', () => {
        const cm = new ChartManager({ gameState: { chartConfig: {} } });
        const config = { title: 'Revenue', showLegend: true, showGrid: true, showDataLabels: true };

        const dark = cm.buildChartOptions(config, 'bar', 'revenue');
        expect(dark.plugins.title.color).toBe(ChartManager.THEME_COLORS.dark.title);

        document.documentElement.setAttribute('data-theme', 'light');
        const light = cm.buildChartOptions(config, 'bar', 'revenue');
        expect(light.plugins.title.color).toBe('#18181b');
        expect(light.plugins.legend.labels.color).toBe(ChartManager.THEME_COLORS.light.text);
        expect(light.scales.x.ticks.color).toBe(ChartManager.THEME_COLORS.light.text);
        expect(light.scales.y.grid.color).toBe(ChartManager.THEME_COLORS.light.grid);
        expect(light.plugins.datalabels.color).toBe(ChartManager.THEME_COLORS.light.dataLabel);
    });

    it('toggling the theme redraws the chart', () => {
        localStorage.clear();
        const refreshTheme = vi.fn();
        MainGame.prototype.toggleTheme.call({ currentTheme: 'dark', chartManager: { refreshTheme } });
        expect(refreshTheme).toHaveBeenCalled();
    });

    it('refreshTheme rebuilds the preview from the last data', () => {
        const cm = new ChartManager({ gameState: { chartConfig: {} } });
        cm.previewChart = {};
        cm.lastPreview = { data: { x: 1 }, config: { type: 'bar' } };
        cm.createPreviewChart = vi.fn();
        cm.refreshTheme();
        expect(cm.createPreviewChart).toHaveBeenCalledWith({ x: 1 }, { type: 'bar' });
    });
});

describe('palette swatches (#1892, #1881)', () => {
    it('has one source of swatch colours: the chart palettes', () => {
        expect(mainCss).not.toMatch(/\.palette-btn:nth-child/);
        expect(html).not.toMatch(/data-palette="corporate"\s+style=/);
        const swatch = ChartManager.paletteSwatch('corporate');
        for (const c of ChartManager.PALETTES.corporate) expect(swatch).toContain(c);
        expect(ChartManager.paletteSwatch('nope')).toBeNull();
    });

    it('buttons are labelled and expose the selection', () => {
        expect(html).toMatch(/data-palette="corporate"\s+aria-label="Corporate palette"/);
        expect(html).toMatch(/data-palette="monochrome"\s+aria-label="Monochrome palette"/);
        document.body.innerHTML = `
            <button class="palette-btn active" data-palette="corporate"></button>
            <button class="palette-btn" data-palette="monochrome"></button>`;
        MainGame.syncPaletteButtons('monochrome');
        const [corp, mono] = document.querySelectorAll('.palette-btn');
        expect(mono.getAttribute('aria-pressed')).toBe('true');
        expect(corp.getAttribute('aria-pressed')).toBe('false');
        expect(mono.classList.contains('active')).toBe(true);
        expect(corp.style.background).not.toBe('');
    });
});

describe('banned colours written as rgba() (#1090)', () => {
    it('no stylesheet ships the purple accent as an rgb triplet', () => {
        const dir = path.join(root, 'src/styles');
        const css = fs.readdirSync(dir).filter(f => f.endsWith('.css'))
            .map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
        expect(css).not.toMatch(/rgba?\(\s*139,\s*92,\s*246/);
        expect(css).not.toMatch(/rgba?\(\s*167,\s*139,\s*250/);
    });
});
