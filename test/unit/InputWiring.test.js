/**
 * Screen navigation guards, data-table sorting, and relationships-card access
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenManager } from '../../src/js/ui/ScreenManager.js';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';

function setupScreens(ids) {
    document.body.innerHTML = '<header id="top-bar"></header>' +
        ids.map(id => `<div class="screen hidden" id="${id}"></div>`).join('');
}

describe('ScreenManager', () => {
    let sm;
    let game;
    beforeEach(() => {
        setupScreens(['screen-menu', 'screen-game', 'screen-map', 'screen-jail', 'screen-bank', 'screen-stats']);
        game = { gameState: { jailSentence: 0 }, showToast: vi.fn() };
        sm = new ScreenManager(game);
        sm.init();
    });

    it('shows a screen and tracks history', () => {
        sm.showScreen('screen-game');
        sm.showScreen('screen-map');
        expect(sm.getCurrentScreen()).toBe('screen-map');
        expect(document.getElementById('screen-map').classList.contains('active')).toBe(true);
        expect(document.getElementById('screen-game').classList.contains('hidden')).toBe(true);
        sm.goBack();
        expect(sm.getCurrentScreen()).toBe('screen-game');
    });

    it('does nothing when navigating to the already-active screen', () => {
        sm.showScreen('screen-game');
        const spy = vi.fn();
        window.addEventListener('screenchange', spy);
        expect(sm.showScreen('screen-game')).toBe(true);
        expect(spy).not.toHaveBeenCalled();
        window.removeEventListener('screenchange', spy);
    });

    it('caps history and clears it on return to the menu', () => {
        for (let i = 0; i < 30; i++) {
            sm.showScreen(i % 2 ? 'screen-game' : 'screen-map');
        }
        expect(sm.history.length).toBeLessThanOrEqual(20);
        sm.showScreen('screen-menu');
        expect(sm.history).toEqual([]);
    });

    it('blocks leaving the jail screen while a sentence remains', () => {
        sm.showScreen('screen-jail');
        game.gameState.jailSentence = 5;
        expect(sm.showScreen('screen-map')).toBe(false);
        expect(sm.getCurrentScreen()).toBe('screen-jail');
        expect(game.showToast).toHaveBeenCalled();
        // menu is still reachable
        expect(sm.showScreen('screen-menu')).not.toBe(false);
    });

    it('allows leaving jail once the sentence is served', () => {
        sm.showScreen('screen-jail');
        game.gameState.jailSentence = 0;
        sm.showScreen('screen-game');
        expect(sm.getCurrentScreen()).toBe('screen-game');
    });

    it('reports a missing screen without throwing', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => sm.showScreen('screen-nope')).not.toThrow();
        expect(game.showToast).toHaveBeenCalled();
        vi.restoreAllMocks();
    });
});

describe('TaskSystem data-table header sorting', () => {
    it('sorts when a header is clicked (no global game reference needed)', () => {
        document.body.innerHTML = `
            <input id="table-filter">
            <table id="data-table"><thead><tr></tr></thead><tbody></tbody></table>`;
        const ts = new TaskSystem({ currentRank: { salaryMultiplier: 1 }, rankIndex: 0 });
        ts.originalTableData = { columns: ['Name', 'Value'], rows: [['b', 2], ['a', 3], ['c', 1]] };
        ts.currentTableData = JSON.parse(JSON.stringify(ts.originalTableData));
        ts.updateDataTable(ts.currentTableData);

        const header = document.querySelector('th[data-col="1"]');
        expect(header).not.toBeNull();
        expect(header.getAttribute('onclick')).toBeNull();
        header.click();
        expect(ts.currentTableData.rows.map(r => r[1])).toEqual([1, 2, 3]);
        document.querySelector('th[data-col="1"]').click();
        expect(ts.currentTableData.rows.map(r => r[1])).toEqual([3, 2, 1]);
        document.querySelector('th[data-col="0"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(ts.currentTableData.rows.map(r => r[0])).toEqual(['a', 'b', 'c']);
    });
});
