/**
 * Index/markup cluster: office LOCATION row (#1126), dead chart-icon code
 * (#2211), boss moods (#2227), player name (#1295), Chart Studio mapping
 * panel (#1494), task visual container classes (#2105), day/night CSS
 * (#2001) and the bug-finder null check (#2330).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

vi.mock('../../src/js/ui/LitUIManager.js', () => ({
    LitUIManager: class { initialize() {} }
}));
vi.mock('chart.js/auto', () => {
    class FakeChart {
        constructor(canvas, config) { this.config = config; this.data = config.data; }
        destroy() {}
        update() {}
        static getChart() { return null; }
    }
    FakeChart.defaults = { color: '', borderColor: '', font: {} };
    return { default: FakeChart };
});

import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { BOSSES, BOSS_MOODS } from '../../src/js/data/bosses.js';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';
import { GameState } from '../../src/js/game/GameState.js';
import { renamePlayer, updateStatsScreen } from '../../src/js/helpers/ProjectHelpers.js';
import { ChartManager } from '../../src/js/charts/ChartManager.js';
import { TaskVisualRenderer } from '../../src/js/game/work/TaskVisualRenderer.js';
import { OFFICES } from '../../src/js/data/tycoonData.js';

const root = resolve(__dirname, '../..');
const read = p => readFileSync(resolve(root, p), 'utf8');

describe('office LOCATION row (#1126)', () => {
    beforeEach(() => {
        document.body.innerHTML = '<span id="current-office-name">Bedroom Corner</span><div id="location-interactions" class="hidden"></div>';
    });

    it('shows the shop name when visiting a shop', () => {
        const ui = new UIUpdater({ gameState: { officeIndex: 0 } });
        ui.game.worldMap = { getLocation: () => ({ id: 'donut_shop', type: 'shop', name: 'Donut Delights', activities: [] }) };
        try { ui.updateLocationLayout('donut_shop'); } catch { /* optional DOM pieces */ }
        expect(document.getElementById('current-office-name').textContent).toBe('Donut Delights');
    });

    it('shows your office tier when at the office', () => {
        const ui = new UIUpdater({ gameState: { officeIndex: 2 } });
        ui.updateOfficeEquipment = () => {};
        ui.game.worldMap = { getLocation: () => ({ id: 'home_office', type: 'office', name: 'Home', activities: [] }) };
        ui.updateLocationLayout('home_office');
        expect(document.getElementById('current-office-name').textContent).toBe(OFFICES[2].name);
    });
});

describe('chart type grid (#2211)', () => {
    it('toggles locked state without the dead icon code', () => {
        document.body.innerHTML = '<button class="chart-type-btn" data-type="bar">BAR</button><button class="chart-type-btn" data-type="radar">RADAR</button>';
        const ui = new UIUpdater({ gameState: { isChartTypeUnlocked: t => t === 'bar' } });
        ui.updateChartTypeGrid();
        const [bar, radar] = document.querySelectorAll('.chart-type-btn');
        expect(bar.classList.contains('locked')).toBe(false);
        expect(radar.classList.contains('locked')).toBe(true);
        expect(radar.getAttribute('aria-disabled')).toBe('true');
        expect(bar.textContent).toBe('BAR');
        expect(UIUpdater.prototype.getChartIcon).toBeUndefined();
    });
});

describe('boss moods (#2227)', () => {
    it('every boss has a mood from the shared vocabulary', () => {
        for (const boss of BOSSES) {
            expect(BOSS_MOODS).toContain(boss.mood);
        }
    });

    it('panel text shows mood and style', () => {
        expect(TaskSystem.bossMoodText({ mood: 'stressed', personality: 'numbers-focused' })).toBe('Mood: Stressed · Style: Numbers focused');
        expect(TaskSystem.bossMoodText({ personality: 'academic' })).toBe('Style: Academic');
        expect(TaskSystem.bossMoodText(null)).toBe('');
    });
});

describe('player name (#1295)', () => {
    it('cleans, stores and round-trips the name', () => {
        const gs = Object.create(GameState.prototype);
        expect(gs.setPlayerName('  Ada \n Lovelace  ')).toBe('Ada Lovelace');
        expect(GameState.cleanPlayerName('x'.repeat(40))).toHaveLength(24);
        expect(GameState.cleanPlayerName(42)).toBe('');
        const real = new GameState();
        expect(real.playerName).toBe('');
        real.setPlayerName('Ada');
        const saved = JSON.parse(JSON.stringify(real.toJSON()));
        expect(saved.playerName).toBe('Ada');
        const loaded = new GameState();
        loaded.fromJSON(saved);
        expect(loaded.playerName).toBe('Ada');
    });

    it('Rename sets the name on the Stats screen', () => {
        document.body.innerHTML = '<h3 id="stats-name">New Player</h3><button id="btn-rename-player"></button>';
        const gs = Object.create(GameState.prototype);
        gs.playerName = '';
        const game = { gameState: gs };
        expect(renamePlayer(game, () => 'Grace')).toBe('Grace');
        expect(document.getElementById('stats-name').textContent).toBe('Grace');
        // Cancel keeps the old name
        expect(renamePlayer(game, () => null)).toBe('Grace');
    });

    it('updateStatsScreen wires the Rename button', () => {
        document.body.innerHTML = '<h3 id="stats-name"></h3><button id="btn-rename-player"></button>';
        const game = { gameState: { playerName: 'Lin' }, characterStats: { getAllStats: () => [] } };
        try { updateStatsScreen(game); } catch { /* other stats DOM is optional */ }
        expect(document.getElementById('stats-name').textContent).toBe('Lin');
        expect(typeof document.getElementById('btn-rename-player').onclick).toBe('function');
    });

    it('index.html has the Rename button', () => {
        expect(read('index.html')).toContain('id="btn-rename-player"');
    });
});

describe('Chart Studio mapping panel (#1494)', () => {
    it('describes the plotted columns', () => {
        const cm = new ChartManager({});
        const data = { columns: ['Quarter', 'Revenue', 'Expenses'], labels: ['Q1'], datasets: { Revenue: [1], Expenses: [2] } };
        expect(cm.describeMapping(data, { type: 'bar' })).toEqual({ x: 'Quarter', y: 'Revenue, Expenses' });
        expect(cm.describeMapping(data, { type: 'pie' })).toEqual({ x: 'Quarter', y: 'Revenue' });
    });

    it('MainGame.updateMappingPanel writes the values', async () => {
        vi.stubGlobal('__DSD_NO_AUTOBOOT__', true);
        globalThis.__DSD_NO_AUTOBOOT__ = true;
        const { MainGame } = await import('../../src/js/main.js');
        document.body.innerHTML = '<span id="x-axis-value">Quarter</span><span id="y-axis-value">Revenue</span>';
        const fake = {
            gameState: { chartConfig: { type: 'line' }, currentTask: { data: { columns: ['Week', 'Visitors'], datasets: { Visitors: [1, 2] } } } },
            chartManager: new ChartManager({})
        };
        MainGame.prototype.updateMappingPanel.call(fake);
        expect(document.getElementById('x-axis-value').textContent).toBe('Week');
        expect(document.getElementById('y-axis-value').textContent).toBe('Visitors');
    });
});

describe('task visual containers (#2105)', () => {
    it('namespaces config class names and refuses live elements', () => {
        expect(TaskVisualRenderer.containerClass({ container: 'data-table-container' })).toBe('task-visual-container task-visual--data-table-container');
        document.body.innerHTML = '<div id="data-table-container"><table id="data-table"></table></div>';
        const r = new TaskVisualRenderer({});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const task = { visuals: ['data_table'], steps: [{ visual: 'data_table' }] };
        expect(r.renderTaskVisual(task, 0, 'data-table-container')).toBeNull();
        expect(document.getElementById('data-table')).not.toBeNull();
    });
});

describe('day/night CSS (#2001)', () => {
    it('styles the classes DayNightCycle toggles and is linked', () => {
        const css = read('src/styles/daynight.css');
        for (const cls of ['.map-container.time-morning', '.map-container.time-noon', '.map-container.time-night']) {
            expect(css).toContain(cls);
        }
        expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/#[0-9a-f]{3,8}\b/i);
        expect(read('index.html')).toContain('/src/styles/daynight.css');
    });
});

describe('inject-bug-finder null check (#2330)', () => {
    it('treats null as a failure', () => {
        const src = read('test/inject-bug-finder.js');
        expect(src).toMatch(/result === null/);
    });
});
