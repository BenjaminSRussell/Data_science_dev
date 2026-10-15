/**
 * Office panel is the way into DirtyDataSystem (#2417).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('../../src/js/ui/LitUIManager.js', () => ({
    LitUIManager: class {
        initialize() {}
        updateTopBar() {}
        updateRankProgress() {}
    }
}));

import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { DirtyDataSystem } from '../../src/js/game/data/DirtyDataSystem.js';
import { ScreenManager } from '../../src/js/ui/ScreenManager.js';

const PANEL = `
    <span id="dirty-data-standing"></span>
    <div id="dirty-data-options"></div>
    <p id="dirty-data-result"></p>`;

describe('dirty data panel (#2417)', () => {
    beforeEach(() => {
        document.body.innerHTML = PANEL;
        globalThis.confirm = vi.fn(() => true);
    });

    afterEach(() => vi.restoreAllMocks());

    it('is on the office screen', () => {
        const html = readFileSync('index.html', 'utf8');
        const office = html.slice(html.indexOf('id="screen-office"'), html.indexOf('id="screen-clients"'));
        expect(office).toContain('id="dirty-data-panel"');
        expect(office).toContain('id="dirty-data-options"');
        expect(office).toContain('id="dirty-data-standing"');
    });

    it('lists getDirtyOptions and shows getReputationLevel', () => {
        const gs = { money: 1000, reputation: 50, timeManager: { totalDays: 3 } };
        const dds = new DirtyDataSystem(gs);
        const game = { gameState: gs, dirtyDataSystem: dds, showToast: vi.fn(), audioManager: { play: vi.fn() } };
        const ui = new UIUpdater(game);
        ui.updateAllUI = vi.fn();
        ui.updateDirtyDataPanel();
        expect(document.getElementById('dirty-data-standing').textContent).toBe('clean');
        const buttons = [...document.querySelectorAll('#dirty-data-options button')];
        expect(buttons.map(b => b.dataset.dirtyAction)).toEqual(dds.getDirtyOptions().map(o => o.id));
        expect(buttons[0].textContent).toContain('Manipulate Data');
        expect(buttons[0].textContent).toContain('$200');
    });

    it('performAction runs from a listed job and the standing updates', () => {
        const gs = { money: 1000, reputation: 50, timeManager: { totalDays: 3 }, legalSystem: { addLegalIssue: vi.fn() } };
        const game = { gameState: gs, showToast: vi.fn(), audioManager: { play: vi.fn() } };
        const ui = new UIUpdater(game);
        ui.updateAllUI = vi.fn();
        ui.updateDirtyDataPanel();
        expect(game.dirtyDataSystem).toBeInstanceOf(DirtyDataSystem);
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        document.querySelector('[data-dirty-action="manipulate_data"]').click();
        expect(gs.money).toBe(1200);
        expect(game.dirtyDataSystem.reputation).toBe(-10);
        expect(document.getElementById('dirty-data-standing').textContent).toBe('questionable');
        expect(document.getElementById('dirty-data-result').textContent).toMatch(/Manipulate Data/);
        expect(game.showToast).toHaveBeenCalled();
        expect(game.audioManager.play).toHaveBeenCalledWith('kaching');
        expect(ui.updateAllUI).toHaveBeenCalled();
    });

    it('does nothing when the player backs out', () => {
        globalThis.confirm.mockReturnValue(false);
        const gs = { money: 1000, reputation: 50 };
        const game = { gameState: gs, showToast: vi.fn(), audioManager: { play: vi.fn() } };
        const ui = new UIUpdater(game);
        ui.updateAllUI = vi.fn();
        ui.updateDirtyDataPanel();
        document.querySelector('[data-dirty-action="sell_data"]').click();
        expect(gs.money).toBe(1000);
        expect(game.dirtyDataSystem.unethicalActions).toHaveLength(0);
        expect(game.showToast).not.toHaveBeenCalled();
    });

    it('does not construct a system when the panel is absent', () => {
        document.body.innerHTML = '';
        const game = { gameState: {} };
        const ui = new UIUpdater(game);
        expect(() => ui.updateDirtyDataPanel()).not.toThrow();
        expect(game.dirtyDataSystem).toBeUndefined();
    });

    it('fills the panel when the office screen is shown', () => {
        document.body.innerHTML = `
            <div id="top-bar"></div>
            <section id="screen-menu" class="screen active"></section>
            <section id="screen-office" class="screen hidden">${PANEL}</section>`;
        const gs = { money: 0, reputation: 10 };
        const ui = new UIUpdater({ gameState: gs, showToast: vi.fn(), audioManager: { play: vi.fn() } });
        ui.updateAllUI = vi.fn();
        const sm = new ScreenManager({ gameState: gs, uiUpdater: ui, showToast: vi.fn() });
        sm.init();
        expect(sm.showScreen('screen-office')).toBe(true);
        expect(document.querySelectorAll('#dirty-data-options button').length).toBe(5);
        expect(document.getElementById('dirty-data-standing').textContent).toBe('clean');
    });
});
