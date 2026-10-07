import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('chart.js/auto', () => {
    class FakeChart {
        constructor(canvas, config) { this.canvas = canvas; this.config = config; this.data = config.data; }
        destroy() { this.destroyed = true; }
        static getChart() { return null; }
    }
    FakeChart.defaults = { color: '', borderColor: '', font: {} };
    return { default: FakeChart };
});

import { DevMenu, SLOTS_PER_DAY, ASSET_SAMPLES } from '../../src/js/dev/DevMenu.js';
import { isDevModeEnabled } from '../../src/js/dev/devMode.js';
import { ChartManager } from '../../src/js/charts/ChartManager.js';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';
import { CharacterStats, STATS } from '../../src/js/game/CharacterStats.js';
import { WorkSystemValidator } from '../../src/js/dev/WorkSystemValidator.js';

function makeGame(extra = {}) {
    return {
        gameState: {},
        showToast: vi.fn(),
        showError: vi.fn(),
        uiUpdater: { updateAllUI: vi.fn() },
        ...extra
    };
}

describe('DevMenu fixes', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        localStorage.clear();
        delete window.devTools;
        Object.defineProperty(window, 'location', { value: { hostname: 'localhost', search: '' }, writable: true });
    });

    it('isDevModeEnabled honours ?dev on a non-local host (#1744)', () => {
        expect(isDevModeEnabled({ location: { hostname: 'example.com', search: '?dev' }, localStorage })).toBe(true);
        expect(isDevModeEnabled({ location: { hostname: 'example.com', search: '' }, localStorage })).toBe(false);
    });

    it('Skip Time advances exactly one day of slots (#1247)', () => {
        const game = makeGame({ handleTimeAdvance: vi.fn() });
        new DevMenu(game);
        const btn = [...document.querySelectorAll('#dev-actions button')].find(b => b.textContent === 'Skip Time');
        btn.click();
        expect(SLOTS_PER_DAY).toBe(6);
        expect(game.handleTimeAdvance).toHaveBeenCalledWith(6);
    });

    it('Max Stats caps every stat via CharacterStats.stats (#1027, #2264)', () => {
        const cs = new CharacterStats();
        const game = makeGame({ gameState: { characterStats: cs } });
        const menu = new DevMenu(game);
        expect(menu.maxStats()).toBe(true);
        Object.keys(cs.stats).forEach(id => expect(cs.stats[id]).toBe(STATS[id].maxLevel));
        expect(cs.skills.python.value).toBe(100);
    });

    it('Complete Task runs the real submit pipeline (#1856, #2352)', () => {
        const gameState = { currentTask: { id: 't1' } };
        const game = makeGame({ gameState, submitChart: vi.fn(), taskSystem: new TaskSystem(gameState) });
        const menu = new DevMenu(game);
        expect(game.taskSystem.getCurrentTask()).toEqual({ id: 't1' });
        expect(menu.completeCurrentTask()).toBe(true);
        expect(game.submitChart).toHaveBeenCalledTimes(1);
        gameState.currentTask = null;
        expect(menu.completeCurrentTask()).toBe(false);
    });

    it('Reset State refreshes the UI (#1345)', () => {
        const game = makeGame({ gameState: { reset: vi.fn() } });
        vi.stubGlobal('confirm', () => true);
        new DevMenu(game);
        [...document.querySelectorAll('#dev-game-state button')].find(b => b.textContent === 'Reset State').click();
        expect(game.gameState.reset).toHaveBeenCalled();
        expect(game.uiUpdater.updateAllUI).toHaveBeenCalled();
        vi.unstubAllGlobals();
    });

    it('Validate Assets checks sprite files that ship with the game (#1342)', () => {
        expect(ASSET_SAMPLES.every(p => p.includes('lpc_sprite_') || p.endsWith('stick_figure.svg'))).toBe(true);
    });

    it('Set Phase calls StorylineNavigator.setStorylinePhase (#1742)', () => {
        const setStorylinePhase = vi.fn(() => ({ success: true, message: 'ok' }));
        window.devTools = { storylineNavigator: { setStorylinePhase, getStorylineState: () => null, getAllStoryBeats: () => null } };
        const game = makeGame();
        new DevMenu(game);
        document.getElementById('dev-storyline-phase').value = 'late';
        document.getElementById('dev-set-phase').click();
        expect(setStorylinePhase).toHaveBeenCalledWith('late');
    });

    it('clicking an already-completed beat does not re-trigger it (#1972)', () => {
        const triggerStoryBeat = vi.fn(() => ({ success: true, message: 'Triggered' }));
        window.devTools = { storylineNavigator: {
            triggerStoryBeat,
            setStorylinePhase: vi.fn(),
            getStorylineState: () => ({ phase: 'early', progress: 0, completedBeats: ['b1'] }),
            getAllStoryBeats: () => ({ early: [{ id: 'b1', title: 'Beat 1' }] })
        } };
        const game = makeGame();
        new DevMenu(game);
        document.querySelector('#dev-storyline-beats button[data-completed="true"]').click();
        expect(triggerStoryBeat).not.toHaveBeenCalled();
        expect(game.showToast).toHaveBeenCalledWith('Already completed: Beat 1', 'info');
    });

    it('opening the menu re-populates dialogue once the NPC manager exists (#1745)', () => {
        const game = makeGame();
        const menu = new DevMenu(game);
        expect(document.getElementById('dev-dialogue').textContent).toContain('not initialized');
        game.gameState.npcManager = { getAllNPCs: () => [{ id: 'alex', name: 'Alex' }], startConversation: vi.fn() };
        menu.toggle();
        const names = [...document.querySelectorAll('#dev-dialogue button')].map(b => b.textContent);
        expect(names).toContain('Alex');
        menu.toggle(); menu.toggle();
        expect([...document.querySelectorAll('#dev-dialogue button')].filter(b => b.textContent === 'Alex').length).toBe(1);
    });

    it('Test All Options never clicks dev-menu or destructive buttons (#1030)', async () => {
        vi.useFakeTimers();
        const game = makeGame({ gameState: { reset: vi.fn() } });
        const confirmSpy = vi.fn(() => false);
        vi.stubGlobal('confirm', confirmSpy);
        const menu = new DevMenu(game);
        const outside = document.createElement('button');
        const clicked = vi.fn();
        outside.onclick = clicked;
        document.body.appendChild(outside);
        const p = menu.testAllOptions();
        await vi.runAllTimersAsync();
        await p;
        expect(clicked).toHaveBeenCalled();
        expect(confirmSpy).not.toHaveBeenCalled();
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('ChartManager.createChart renders into an arbitrary canvas (#1025, #2350)', () => {
        const cm = new ChartManager({});
        const canvas = document.createElement('canvas');
        canvas.id = 'c1';
        document.body.appendChild(canvas);
        const chart = cm.createChart('c1', 'pie', { labels: ['a', 'b'], datasets: [{ label: 'X', data: [1, 2] }] });
        expect(chart).toBeTruthy();
        expect(chart.config.type).toBe('pie');
        expect(chart.data.datasets[0].data).toEqual([1, 2]);
        expect(cm.createChart('missing', 'bar', {})).toBeNull();
    });

    it('Validate Work System delegates to WorkSystemValidator.validateAll (#2443)', async () => {
        const gameState = { currentTask: { id: 't', data: {}, requirements: [] } };
        const game = makeGame({ gameState, taskSystem: new TaskSystem(gameState), submitChart: vi.fn() });
        const validator = new WorkSystemValidator(game);
        const spy = vi.spyOn(validator, 'validateAll');
        window.devTools = { workValidator: validator };
        const menu = new DevMenu(game);
        const results = await menu.validateWorkSystem();
        expect(spy).toHaveBeenCalled();
        expect(results.taskSystem.failed).toBe(0);
        expect(game.submitChart).not.toHaveBeenCalled();
    });
});
