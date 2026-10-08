// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScreenManager } from '../../src/js/ui/ScreenManager.js';

function setup() {
    document.body.innerHTML = `
        <div id="top-bar"></div>
        <section id="screen-menu" class="screen active"></section>
        <section id="screen-game" class="screen hidden"></section>
        <section id="screen-map" class="screen hidden"></section>`;
    const mainGame = { gameState: {}, showToast: vi.fn() };
    const sm = new ScreenManager(mainGame);
    sm.init();
    return { sm, mainGame };
}

describe('ScreenManager fixes', () => {
    beforeEach(() => vi.useRealTimers());

    it('switches screens without any animator, even if a stray gsapAnimator is present (#2295, #1087, #1362)', () => {
        const { sm, mainGame } = setup();
        mainGame.gsapAnimator = {}; // no animate* methods: must not be called
        expect(() => sm.showScreen('screen-game')).not.toThrow();
        expect(document.getElementById('screen-game').classList.contains('active')).toBe(true);
        expect(document.getElementById('screen-menu').classList.contains('active')).toBe(false);
        expect(document.getElementById('top-bar').style.display).toBe('flex');
        expect(sm.isScreenActive('screen-game')).toBe(true);
        expect(sm.getCurrentScreen()).toBe('screen-game');
    });

    it('finds a screen added after init, e.g. screen-story (#1086, #2296)', () => {
        const { sm } = setup();
        const story = document.createElement('section');
        story.id = 'screen-story';
        story.className = 'screen hidden';
        document.body.appendChild(story);
        sm.showScreen('screen-story');
        expect(story.classList.contains('active')).toBe(true);
    });

    it('resizes an existing map after showing the map screen (#2147)', () => {
        vi.useFakeTimers();
        const { sm, mainGame } = setup();
        mainGame.updateMapScreen = vi.fn();
        mainGame.unifiedMapSystem = { handleResize: vi.fn() };
        sm.showScreen('screen-map');
        vi.advanceTimersByTime(150);
        expect(mainGame.updateMapScreen).toHaveBeenCalled();
        expect(mainGame.unifiedMapSystem.handleResize).toHaveBeenCalled();
    });
});
