/**
 * Career portfolio of scored chart submissions (#2715) with a schema
 * version and migrator for older entries (#2717)
 */
import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { GameState } from '../../src/js/game/GameState.js';
import {
    PORTFOLIO_SCHEMA_VERSION, PORTFOLIO_MAX, makePortfolioEntry, migratePortfolioEntry,
    normalizePortfolio, addPortfolioEntry, filterPortfolio, exportPortfolioJSON, renderPortfolioHTML
} from '../../src/js/game/Portfolio.js';

const task = { id: 'ds_0021', name: 'Loan Default Risk', domain: 'finance', difficulty: 8.2 };
const cfg = { type: 'line', palette: 'corporate', showLegend: true, showGrid: true, showDataLabels: false, title: 'Loan risk', extra: 'dropped' };
const score = { stars: 4, chartAppropriateness: 88.4, visualClarity: 77.6, dataAccuracy: 90, rawScore: 84.2, moneyEarned: 350 };

describe('portfolio entries (#2715, #2717)', () => {
    it('records task, chart config, scores, day and a schema version', () => {
        const e = makePortfolioEntry(task, cfg, score, { day: 12, now: 1000 });
        expect(e.schemaVersion).toBe(PORTFOLIO_SCHEMA_VERSION);
        expect(e).toMatchObject({ taskId: 'ds_0021', domain: 'finance', stars: 4, day: 12, submittedAt: 1000, moneyEarned: 350 });
        expect(e.chartConfig).toEqual({ type: 'line', palette: 'corporate', showLegend: true, showGrid: true, showDataLabels: false, title: 'Loan risk' });
        expect(e.scores).toEqual({ chartAppropriateness: 88, visualClarity: 78, dataAccuracy: 90, rawScore: 84 });
    });

    it('migrates unversioned (v0) entries and drops junk', () => {
        const v0 = { taskId: 't1', taskName: 'Old', stars: 9, timestamp: 55, chartConfig: { type: 'bar' } };
        const m = migratePortfolioEntry(v0);
        expect(m.schemaVersion).toBe(1);
        expect(m.stars).toBe(5);
        expect(m.submittedAt).toBe(55);
        expect(migratePortfolioEntry(null)).toBeNull();
        expect(migratePortfolioEntry({ stars: 3 })).toBeNull();
    });

    it('keeps entries from a newer schema untouched', () => {
        const future = { schemaVersion: 99, taskId: 'x', fancy: true };
        expect(migratePortfolioEntry(future)).toEqual(future);
    });

    it('caps the list at PORTFOLIO_MAX, dropping the oldest', () => {
        let list = [];
        for (let i = 0; i < PORTFOLIO_MAX + 5; i++) list = addPortfolioEntry(list, makePortfolioEntry({ id: `t${i}` }, cfg, score));
        expect(list).toHaveLength(PORTFOLIO_MAX);
        expect(list[0].taskId).toBe('t5');
    });

    it('filters by domain and stars', () => {
        const list = [
            makePortfolioEntry({ id: 'a', domain: 'finance' }, cfg, { stars: 5 }),
            makePortfolioEntry({ id: 'b', domain: 'health' }, cfg, { stars: 2 })
        ];
        expect(filterPortfolio(list, { domain: 'finance' }).map(e => e.taskId)).toEqual(['a']);
        expect(filterPortfolio(list, { minStars: 3 }).map(e => e.taskId)).toEqual(['a']);
        expect(filterPortfolio(list)).toHaveLength(2);
    });

    it('exports versioned JSON', () => {
        const json = JSON.parse(exportPortfolioJSON([makePortfolioEntry(task, cfg, score)], 0));
        expect(json.schemaVersion).toBe(PORTFOLIO_SCHEMA_VERSION);
        expect(json.exportedAt).toBe('1970-01-01T00:00:00.000Z');
        expect(json.entries[0].taskId).toBe('ds_0021');
    });

    it('renders escaped rows with a reopen button and domain filter', () => {
        const list = [makePortfolioEntry({ id: 'a', name: '<b>x</b>', domain: 'finance' }, cfg, { stars: 3 })];
        const html = renderPortfolioHTML(list);
        expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
        expect(html).toContain('game.reopenPortfolioEntry(0)');
        expect(html).toContain('value="finance"');
        expect(renderPortfolioHTML([])).toContain('No submissions yet');
    });
});

describe('portfolio persists with the save (#2715 acceptance: lists after reload)', () => {
    it('round-trips through GameState toJSON/fromJSON with migration', () => {
        const gs = new GameState();
        gs.portfolio = [makePortfolioEntry(task, cfg, score, { day: 3 }), { taskId: 'legacy', stars: 2 }];
        const restored = new GameState();
        restored.fromJSON(JSON.parse(JSON.stringify(gs.toJSON())));
        expect(restored.portfolio).toHaveLength(2);
        expect(restored.portfolio[0].chartConfig.type).toBe('line');
        expect(restored.portfolio[1].schemaVersion).toBe(1);
    });

    it('fresh games start with an empty portfolio', () => {
        expect(new GameState().portfolio).toEqual([]);
    });
});

describe('MainGame portfolio wiring', () => {
    const proto = MainGame.prototype;

    it('submitChart records the scored submission', () => {
        const src = fs.readFileSync(path.resolve(__dirname, '../../src/js/main.js'), 'utf8');
        expect(src).toMatch(/this\.gameState\.lastScore = score;\s*\n\s*this\.recordPortfolioEntry\?\.\(task, score\);/);
        const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
        expect(html).toContain('id="btn-portfolio"');
    });

    it('recordPortfolioEntry stores the current chart config and in-game day', () => {
        const fake = { gameState: { chartConfig: cfg, portfolio: [], timeManager: { totalDays: 7 } } };
        proto.recordPortfolioEntry.call(fake, task, score);
        expect(fake.gameState.portfolio).toHaveLength(1);
        expect(fake.gameState.portfolio[0]).toMatchObject({ taskId: 'ds_0021', day: 7, stars: 4 });
    });

    it('reopenPortfolioEntry loads the saved chart settings into the studio (acceptance: reopen)', () => {
        const entry = makePortfolioEntry(task, { type: 'scatter', title: 'Saved', showGrid: false }, score);
        const fake = {
            gameState: { portfolio: [entry], chartConfig: GameState.defaultChartConfig() },
            closeModal: vi.fn(),
            openChartStudio: vi.fn()
        };
        expect(proto.reopenPortfolioEntry.call(fake, 0)).toBe(true);
        expect(fake.gameState.chartConfig).toMatchObject({ type: 'scatter', title: 'Saved', showGrid: false, palette: 'corporate' });
        expect(fake.openChartStudio).toHaveBeenCalled();
        expect(proto.reopenPortfolioEntry.call(fake, 5)).toBe(false);
    });

    it('showPortfolio opens the modal and exportPortfolio returns versioned JSON (acceptance: export)', () => {
        const fake = { gameState: { portfolio: [makePortfolioEntry(task, cfg, score)] }, showModal: vi.fn() };
        proto.showPortfolio.call(fake, 'finance');
        expect(fake.showModal.mock.calls[0][0]).toContain('Career Portfolio');
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        URL.createObjectURL = vi.fn(() => 'blob:x');
        URL.revokeObjectURL = vi.fn();
        const json = proto.exportPortfolio.call(fake);
        expect(JSON.parse(json).entries).toHaveLength(1);
        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(click).toHaveBeenCalled();
        click.mockRestore();
    });
});
