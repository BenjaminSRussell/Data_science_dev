/**
 * MainGame startup/flow fixes (#1612, #1036, #2146, #1657, #1473, #1678,
 * #874, #1064, #1360, #1250, #550)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { ScreenManager } from '../../src/js/ui/ScreenManager.js';
import { GameState } from '../../src/js/game/GameState.js';
import { GameplaySettings } from '../../src/js/game/settings/GameplaySettings.js';
import { countLinesInText } from '../../scripts/lib/countLines.js';

const proto = MainGame.prototype;

describe('store sync', () => {
    function storeWith(state) {
        let listener = null;
        return {
            getState: () => state,
            subscribe: (fn) => { listener = fn; },
            emit: (next) => listener(next)
        };
    }

    it('copies arrays/objects instead of sharing them, and syncs the missing fields', () => {
        const state = {
            money: 5, unlockedChartTypes: ['bar'], purchasedItems: [], unlockedTools: [], unlockedLibraries: [],
            chartConfig: { type: 'bar', colors: ['#fff'] }, bank: { savings: 1 },
            currentTask: { id: 't1' }, unlockedThemes: ['starter'], lastScore: 88, settings: { volume: 3 }
        };
        const store = storeWith(state);
        const fake = { gameStore: store, gameState: {} };
        proto.syncGameStateToStore.call(fake);

        fake.gameState.unlockedChartTypes.push('pie');
        fake.gameState.chartConfig.colors.push('#000');
        expect(state.unlockedChartTypes).toEqual(['bar']);
        expect(state.chartConfig.colors).toEqual(['#fff']);
        expect(fake.gameState.currentTask).toEqual({ id: 't1' });
        expect(fake.gameState.lastScore).toBe(88);
        expect(fake.gameState.unlockedThemes).toEqual(['starter']);
        expect(fake.gameState.settings).toEqual({ volume: 3 });

        const bank = fake.gameState.bank;
        store.emit({ ...state, lastScore: 99, bank: { savings: 999 } });
        expect(fake.gameState.lastScore).toBe(99);
        expect(fake.gameState.bank).toBe(bank);
    });
});

describe('screens and modals', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <section id="screen-menu" class="screen active"></section>
            <section id="screen-game" class="screen hidden"></section>
            <div id="modal-container"><div class="modal-backdrop"></div><div id="modal-content"></div></div>`;
    });

    it('changing screen closes an open modal', () => {
        const closeModal = vi.fn(() => document.getElementById('modal-container').classList.add('hidden'));
        const sm = new ScreenManager({ closeModal });
        sm.init();
        sm.showScreen('screen-game');
        expect(closeModal).toHaveBeenCalled();
        expect(document.getElementById('modal-container').classList.contains('hidden')).toBe(true);
    });

    it('hideCurrentScreen closes the menu without opening another screen', () => {
        const sm = new ScreenManager({});
        sm.init();
        sm.currentScreen = 'screen-menu';
        sm.hideCurrentScreen();
        expect(document.getElementById('screen-menu').classList.contains('active')).toBe(false);
        expect(sm.currentScreen).toBeNull();
    });
});

describe('init', () => {
    it('one failing step does not skip wiring the event listeners, and the menu is awaited', async () => {
        const order = [];
        const fake = {
            showDiagnostic() {}, initTheme() {}, showGame: vi.fn(),
            saveManager: { hasSave: () => { throw new Error('corrupt save'); } },
            screenManager: { init: () => order.push('screens') },
            chartManager: { init: () => { throw new Error('chart boom'); } },
            environmentManager: { init: () => order.push('env') },
            initMenu: () => new Promise(resolve => setTimeout(() => { order.push('menu'); resolve(); }, 5)),
            setupEventListeners: () => order.push('listeners')
        };
        await proto.init.call(fake);
        expect(order).toEqual(['screens', 'env', 'menu', 'listeners']);
        expect(fake.initErrors).toEqual(['load save', 'charts']);
        expect(fake.showGame).toHaveBeenCalled();
    });
});

describe('start failures and new game slots', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="loading-screen"></div><div id="game-container" class="hidden"></div>';
        vi.useFakeTimers();
    });
    afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

    it('a failed start leaves the loading screen and returns to the menu with an error', () => {
        const fake = { hideLoadingProgress: proto.hideLoadingProgress, screenManager: { showScreen: vi.fn() }, showError: vi.fn() };
        proto.handleStartFailure.call(fake, 'nope');
        const loading = document.getElementById('loading-screen');
        expect(loading.style.display).toBe('none');
        expect(fake.screenManager.showScreen).toHaveBeenCalledWith('screen-menu');
        expect(fake.showError).toHaveBeenCalledWith('nope');
    });

    it('fallback New Game asks before overwriting when every slot is full', () => {
        const confirm = vi.fn(() => false);
        vi.stubGlobal('confirm', confirm);
        const fake = { saveManager: { hasSave: () => true, getMostRecentSlot: () => 2 }, showLoadingProgress: vi.fn() };
        expect(proto.startNewGame.call(fake, null)).toBe(false);
        expect(confirm).toHaveBeenCalledWith(expect.stringContaining('Slot 3'));
        expect(fake.showLoadingProgress).not.toHaveBeenCalled();
    });
});

describe('loading screen fade', () => {
    it('fades before hiding instead of hiding in the same tick', () => {
        vi.useFakeTimers();
        try {
            const el = document.createElement('div');
            MainGame.fadeOutElement(el, 400);
            expect(el.classList.contains('hidden')).toBe(false);
            expect(el.style.transition).toContain('opacity');
            vi.advanceTimersByTime(400);
            expect(el.classList.contains('hidden')).toBe(true);
            expect(el.style.display).toBe('none');
        } finally {
            vi.useRealTimers();
        }
    });
});

describe('gameplay settings persistence', () => {
    it('saves and restores gameplay settings, even when restored before the system exists', () => {
        const gs = new GameState();
        gs.gameplaySettings = new GameplaySettings();
        gs.gameplaySettings.toggleRomance(false);
        const saved = JSON.parse(JSON.stringify(gs.toJSON()));
        expect(saved.gameplaySettings).toBeTruthy();

        const restored = new GameState();
        restored.gameplaySettings = new GameplaySettings();
        restored.fromJSON(saved);
        expect(JSON.stringify(restored.gameplaySettings.settings)).toBe(JSON.stringify(gs.gameplaySettings.settings));

        const early = new GameState();
        early.fromJSON(saved);
        expect(early.pendingGameplaySettings).toEqual(saved.gameplaySettings);
    });
});

describe('inventory line counts', () => {
    it('does not count the trailing newline as a line', () => {
        expect(countLinesInText('a\nb\nc\n')).toBe(3);
        expect(countLinesInText('a\nb\nc')).toBe(3);
        expect(countLinesInText('')).toBe(0);
        expect(countLinesInText('\n')).toBe(1);
        expect(countLinesInText('a\r\nb\r\n')).toBe(2);
    });
});
