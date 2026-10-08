/**
 * Focus management (#133), screenchange consumer (#1363) and the missing
 * theme-manager warning (#1573)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScreenManager } from '../../src/js/ui/ScreenManager.js';

describe('ScreenManager accessibility', () => {
    let sm;
    let warn;
    beforeEach(() => {
        document.body.innerHTML = `
            <header id="top-bar"></header>
            <div class="screen active" id="screen-menu"><button id="menu-btn">Start</button></div>
            <div class="screen hidden" id="screen-bank"><h2>City Bank</h2><button id="deposit">Deposit</button></div>
            <div class="screen hidden" id="screen-shop"><button id="buy">Buy</button><button disabled>Nope</button></div>
            <div class="screen hidden" id="screen-empty"></div>
            <div class="screen hidden" id="screen-labelled" aria-label="Career Overview"></div>`;
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        sm = new ScreenManager({ gameState: { jailSentence: 0, screenThemeManager: { applyTheme: vi.fn() } }, showToast: vi.fn() });
        sm.init();
    });
    afterEach(() => {
        window.removeEventListener('screenchange', sm._onScreenChange);
        warn.mockRestore();
    });

    it('moves focus to the new screen heading, not <body>', () => {
        document.getElementById('menu-btn').focus();
        sm.showScreen('screen-bank');
        const h2 = document.querySelector('#screen-bank h2');
        expect(document.activeElement).toBe(h2);
        expect(h2.getAttribute('tabindex')).toBe('-1');
    });

    it('falls back to the first enabled control, then the container', () => {
        sm.showScreen('screen-shop');
        expect(document.activeElement.id).toBe('buy');
        sm.showScreen('screen-empty');
        const empty = document.getElementById('screen-empty');
        expect(document.activeElement).toBe(empty);
        expect(empty.getAttribute('tabindex')).toBe('-1');
    });

    it('announces the destination in a polite live region via screenchange', () => {
        sm.showScreen('screen-bank');
        const region = document.getElementById('screen-announcer');
        expect(region).not.toBeNull();
        expect(region.getAttribute('aria-live')).toBe('polite');
        expect(region.textContent).toBe('City Bank');
        sm.showScreen('screen-labelled');
        expect(region.textContent).toBe('Career Overview');
        sm.showScreen('screen-empty');
        expect(region.textContent).toBe('empty');
        expect(document.querySelectorAll('#screen-announcer')).toHaveLength(1);
    });

    it('applies the theme when the manager exists and warns when it is missing', () => {
        sm.showScreen('screen-bank');
        expect(sm.mainGame.gameState.screenThemeManager.applyTheme).toHaveBeenCalledWith('screen-bank');
        expect(warn).not.toHaveBeenCalled();
        delete sm.mainGame.gameState.screenThemeManager;
        sm.showScreen('screen-shop');
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('screenThemeManager missing'));
    });
});
