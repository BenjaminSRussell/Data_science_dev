/**
 * DevMenu cluster: crash check (#2351, #1029), Test All Locations (#2140, #72),
 * real graph validation (#2139, #1346), chart canvas cleanup (#1746, #1344),
 * read-only dialogue tests (#1343), New Game confirm (#1341) and
 * spreadsheet test restoring the table (#1347).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('chart.js/auto', () => {
    class FakeChart {
        constructor(canvas, config) { this.canvas = canvas; this.config = config; this.data = config.data; }
        destroy() { this.destroyed = true; }
        static getChart() { return null; }
    }
    FakeChart.defaults = { color: '', borderColor: '', font: {} };
    return { default: FakeChart };
});

import { DevMenu } from '../../src/js/dev/DevMenu.js';
import { NPCManager } from '../../src/js/game/NPCManager.js';

function makeGame(extra = {}) {
    return {
        gameState: {},
        showToast: vi.fn(),
        showError: vi.fn(),
        uiUpdater: { updateAllUI: vi.fn() },
        ...extra
    };
}

function bare(game) {
    const menu = Object.create(DevMenu.prototype);
    menu.game = game;
    return menu;
}

describe('DevMenu cluster', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        delete window.devTools;
    });
    afterEach(() => vi.restoreAllMocks());

    it('Check Crashes reports issues with a warning toast instead of throwing (#2351, #1029)', () => {
        const game = makeGame();
        expect(() => bare(game).checkForCrashes()).not.toThrow();
        expect(game.showToast).toHaveBeenCalledWith(expect.stringMatching(/potential crash issues/), 'warning');
    });

    it('Test All Locations is wired and lists failures (#2140, #72)', async () => {
        document.body.innerHTML = '<button id="dev-test-all-locations"></button><div id="dev-location-results"></div><div id="dev-locations"></div>';
        window.devTools = {
            locationTester: {
                getAllLocations: () => [],
                testAllLocations: vi.fn(async () => ({
                    total: 2, passed: 1, failed: 1, warnings: 0,
                    details: [
                        { locationId: 'park', success: true, errors: [] },
                        { locationId: 'bank', success: false, errors: ['no background'] }
                    ]
                }))
            }
        };
        const game = makeGame();
        const menu = bare(game);
        menu.populateLocations();
        document.getElementById('dev-test-all-locations').click();
        await vi.waitFor(() => expect(game.showToast).toHaveBeenCalled());
        const text = document.getElementById('dev-location-results').textContent;
        expect(text).toContain('1 passed, 1 failed');
        expect(text).toContain('bank: no background');
    });

    it('Validate Graphs checks the chart data (#2139, #1346)', () => {
        expect(DevMenu.checkChartAgainstCase(null, { type: 'bar', data: [1] })).toMatch(/not created/);
        const good = { config: { type: 'bar' }, data: { datasets: [{ data: [10, 20, 30, 40] }] } };
        expect(DevMenu.checkChartAgainstCase(good, { type: 'bar', data: [10, 20, 30, 40], expectedSum: 100 })).toBeNull();
        const bad = { config: { type: 'bar' }, data: { datasets: [{ data: [10, 20, 30, 41] }] } };
        expect(DevMenu.checkChartAgainstCase(bad, { type: 'bar', data: [10, 20, 30, 40], expectedSum: 100 })).toMatch(/sum is 101/);
        const wrongType = { config: { type: 'pie' }, data: { datasets: [{ data: [25, 25, 25, 25] }] } };
        expect(DevMenu.checkChartAgainstCase(wrongType, { type: 'line', data: [25, 25, 25, 25], expectedAverage: 25 })).toMatch(/type is pie/);

        // A chart manager that returns nothing must fail, not pass
        const game = makeGame({ chartManager: { createChart: () => null } });
        const res = bare(game).validateGraphs();
        expect(res.passed).toBe(0);
        expect(res.failed).toBe(2);
        expect(document.querySelectorAll('canvas').length).toBe(0);
    });

    it('Test Charts removes every canvas, even when createChart throws (#1746, #1344)', () => {
        const game = makeGame({ chartManager: { createChart: vi.fn(() => { throw new Error('boom'); }) } });
        vi.spyOn(console, 'error').mockImplementation(() => {});
        bare(game).testAllCharts();
        expect(document.querySelectorAll('canvas').length).toBe(0);
        const game2 = makeGame({ chartManager: { createChart: vi.fn(() => ({ destroy: vi.fn() })) } });
        bare(game2).testAllCharts();
        expect(document.querySelectorAll('canvas').length).toBe(0);
    });

    it('dialogue preview leaves NPC state untouched (#1343)', async () => {
        const handleStoryBeat = vi.fn();
        const gs = { mainGame: { storyBeatsSystem: { getBeat: () => ({ id: 'meet_first_npc' }) }, handleStoryBeat } };
        const npcManager = new NPCManager(gs);
        gs.npcManager = npcManager;
        const npc = npcManager.getAllNPCs()[0];
        const metBefore = [...npcManager.metNPCs];
        const relBefore = JSON.stringify(npcManager.relationships);
        const game = makeGame({ gameState: gs });
        const menu = bare(game);
        const result = await menu.previewDialogue(npcManager, npc.id);
        expect(result.greeting).toBeTruthy();
        expect(npcManager.metNPCs).toEqual(metBefore);
        expect(JSON.stringify(npcManager.relationships)).toBe(relBefore);
        expect(handleStoryBeat).not.toHaveBeenCalled();
        expect(npcManager.currentConversation ?? null).toBeNull();

        await menu.testAllDialogues();
        expect(npcManager.metNPCs).toEqual(metBefore);
        expect(handleStoryBeat).not.toHaveBeenCalled();
    });

    it('New Game asks first (#1341)', () => {
        const game = makeGame({ startNewGame: vi.fn() });
        new DevMenu(game);
        const btn = [...document.querySelectorAll('#dev-actions button')].find(b => b.textContent === 'New Game');
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        btn.click();
        expect(game.startNewGame).not.toHaveBeenCalled();
        window.confirm.mockReturnValue(true);
        btn.click();
        expect(game.startNewGame).toHaveBeenCalledTimes(1);
    });

    it('Test Spreadsheets puts the table back (#1347)', () => {
        document.body.innerHTML = '<table id="data-table"><thead><tr><th>a</th></tr></thead></table><input id="table-filter" value="keep">';
        const original = { headers: ['a'], rows: [['x'], ['test'], ['y']] };
        const taskSystem = {
            currentTableData: JSON.parse(JSON.stringify(original)),
            lastSortCol: undefined, lastSortAsc: undefined,
            updateDataTable: vi.fn()
        };
        // Simulate the live listener filtering the table
        document.getElementById('table-filter').addEventListener('input', e => {
            taskSystem.currentTableData.rows = original.rows.filter(r => r[0].includes(e.target.value));
        });
        const game = makeGame({ taskSystem });
        bare(game).testSpreadsheets();
        expect(document.getElementById('table-filter').value).toBe('keep');
        expect(taskSystem.currentTableData).toEqual(original);
        expect(taskSystem.updateDataTable).toHaveBeenLastCalledWith(original);
    });
});
