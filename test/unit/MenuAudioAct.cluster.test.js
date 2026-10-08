/**
 * Menu themes (#100, #2005, #2406, #2004, #1474), music radio
 * (#1288, #1289, #1290, #1293, #860, #866, #868, #2310) and the act
 * transition overlay (#44, #2244, #43, #2510, #2509)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { MenuThemeSystem } from '../../src/js/game/MenuThemeSystem.js';
import { ScreenThemeManager } from '../../src/js/game/ScreenThemeManager.js';
import { AudioManager } from '../../src/js/audio/AudioManager.js';
import { ActTransitionScreen } from '../../src/js/ui/ActTransitionScreen.js';
import { AssetValidator } from '../../src/js/dev/AssetValidator.js';

class FakeAudio {
    static instances = [];
    constructor(src) {
        this.src = src;
        this.paused = true;
        this.listeners = {};
        this.removeAttribute = vi.fn((name) => { if (name === 'src') this.src = ''; });
        this.load = vi.fn();
        FakeAudio.instances.push(this);
    }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    emit(type) { (this.listeners[type] || []).forEach(fn => fn()); }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
}

describe('menu theme selection', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '<section id="screen-menu"></section>';
    });

    it('auto-selects dataViz and minimalist once unlocked', () => {
        const mts = new MenuThemeSystem();
        const state = { rankIndex: 0, tasksCompleted: 60, reputation: 0 };
        mts.updateFromGameState(state);
        expect(mts.currentTheme).toBe('dataViz');
        mts.updateFromGameState({ ...state, reputation: 600 });
        expect(mts.currentTheme).toBe('minimalist');
        mts.updateFromGameState({ rankIndex: 5, tasksCompleted: 60, reputation: 600 });
        expect(mts.currentTheme).toBe('executive');
    });

    it('every theme is reachable through the priority list', () => {
        const mts = new MenuThemeSystem();
        expect([...MenuThemeSystem.THEME_PRIORITY].sort()).toEqual(Object.keys(mts.themes).sort());
    });

    it('meetsRequirement checks every field of a requirement', () => {
        const mts = new MenuThemeSystem();
        expect(mts.meetsRequirement({ rankIndex: 3, money: 100 }, { rankIndex: 3, money: 50 })).toBe(false);
        expect(mts.meetsRequirement({ rankIndex: 3, money: 100 }, { rankIndex: 4, money: 100 })).toBe(true);
        expect(mts.meetsRequirement(null, {})).toBe(true);
    });

    it('applyTheme paints the menu screen itself', () => {
        const mts = new MenuThemeSystem();
        mts.themes.corporate.unlocked = true;
        mts.applyTheme('corporate');
        const screen = document.getElementById('screen-menu');
        expect(screen.dataset.menuTheme).toBe('corporate');
        expect(screen.style.backgroundImage).toContain('gradient');
        expect(mts.getMenuBackground('corporate')).toContain(mts.themes.corporate.background);
    });

    it('ScreenThemeManager keeps the menu theme when the menu is shown', () => {
        const mts = new MenuThemeSystem();
        mts.themes.corporate.unlocked = true;
        mts.applyTheme('corporate');
        window.game = { menuThemeSystem: mts };
        try {
            const stm = new ScreenThemeManager();
            stm.applyTheme('screen-menu');
            expect(document.getElementById('screen-menu').style.backgroundImage).toContain('gradient');
            expect(stm.getMenuBackground()).toBe(mts.getMenuBackground());
        } finally {
            delete window.game;
        }
    });

    it('initMenu runs the unlock check once per load', () => {
        const mts = new MenuThemeSystem();
        const check = vi.spyOn(mts, 'checkThemeUnlocks');
        const fake = {
            menuThemeSystem: mts,
            saveManager: { getMostRecentSlot: () => 0, getSaveData: () => ({ state: { rankIndex: 3 } }) }
        };
        try {
            MainGame.prototype.initMenu.call(fake, true);
        } catch {
            // later menu setup needs more of the game; only the theme part matters
        }
        expect(check).toHaveBeenCalledTimes(1);
    });
});

describe('music radio', () => {
    let am;
    beforeEach(() => {
        FakeAudio.instances = [];
        vi.stubGlobal('Audio', FakeAudio);
        am = new AudioManager();
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('re-selecting the playing station keeps the track', () => {
        am.switchStation('lofi_beats');
        am.switchStation('lofi_beats');
        expect(FakeAudio.instances).toHaveLength(1);
    });

    it('switching stations releases the old element (after the crossfade, #1291)', () => {
        vi.useFakeTimers();
        am.switchStation('lofi_beats');
        const first = FakeAudio.instances[0];
        am.switchStation('zen_garden');
        vi.advanceTimersByTime(AudioManager.FADE_MS + 100);
        vi.useRealTimers();
        expect(first.paused).toBe(true);
        expect(first.removeAttribute).toHaveBeenCalledWith('src');
        expect(first.load).toHaveBeenCalled();
    });

    it('toggleMusic turns music back on after the radio was switched off', () => {
        am.switchStation('off');
        expect(am.toggleMusic()).toBe(true);
        expect(am.currentStation).toBe(AudioManager.DEFAULT_STATION);
        expect(am.currentMusic).not.toBeNull();
    });

    it('never plays the same track twice in a row', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        am.switchStation('zen_garden');
        const first = FakeAudio.instances[0].src;
        FakeAudio.instances[0].emit('ended');
        expect(FakeAudio.instances[1].src).not.toBe(first);
    });

    it('a failed track moves on, and the station stops once every track failed', () => {
        am.switchStation('zen_garden');
        FakeAudio.instances[0].emit('error');
        expect(FakeAudio.instances).toHaveLength(2);
        expect(FakeAudio.instances[1].src).not.toBe(FakeAudio.instances[0].src);
        FakeAudio.instances[1].emit('error');
        expect(FakeAudio.instances).toHaveLength(2);
        expect(am.currentMusic).toBeNull();
    });

    it('events from a replaced element are ignored', () => {
        am.switchStation('lofi_beats');
        const old = FakeAudio.instances[0];
        am.switchStation('zen_garden');
        old.emit('ended');
        old.emit('error');
        expect(FakeAudio.instances).toHaveLength(2);
    });

    it('defines every sound the game requests', () => {
        vi.stubGlobal('AudioContext', class {
            constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
            createOscillator() { return { connect() {}, frequency: {}, start() {}, stop() {} }; }
            createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
        });
        for (const name of ['keyboard_typing', 'purchase', 'promotion', 'kaching', 'click']) {
            expect(am.play(name)).toBe(true);
        }
    });

    it('AssetValidator checks the music tracks', () => {
        const validator = new AssetValidator({ audioManager: am });
        const paths = validator.getAudioPaths();
        expect(paths).toContain('/assets/audio/music/background_0.mp3');
        expect(paths.length).toBe(am.getTrackUrls().length);
    });

    it('the radio button shows the playing station', () => {
        document.body.innerHTML = '<button id="btn-music-radio">MUSIC: OFF</button>';
        const fake = { audioManager: am };
        am.switchStation('zen_garden');
        MainGame.prototype.updateRadioUI.call(fake);
        expect(document.getElementById('btn-music-radio').textContent).toBe('MUSIC: Zen Garden');
        am.switchStation('off');
        MainGame.prototype.updateRadioUI.call(fake);
        expect(document.getElementById('btn-music-radio').textContent).toBe('MUSIC: OFF');
    });
});

describe('act transition overlay', () => {
    beforeEach(() => { document.body.innerHTML = ''; vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

    it('closing with Continue removes the Escape listener', () => {
        const screen = new ActTransitionScreen({ gameState: {} });
        const remove = vi.spyOn(document, 'removeEventListener');
        const close = vi.spyOn(screen, 'closeTransition');
        const overlay = screen.showActTransition('early', 'mid', null);
        overlay.querySelector('.act-continue-btn').click();
        expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(close).toHaveBeenCalledTimes(1);
    });

    it('shows zero counts in the recap', () => {
        const screen = new ActTransitionScreen({});
        const html = screen.formatSummary({ decisions: 0, relationships: 0, progress: '', ethics: 0 });
        expect(html).toContain('Major Decisions:</strong> 0');
        expect(html).toContain('Relationships:</strong> 0');
    });

    it('generateSummary does not need a time manager', () => {
        const screen = new ActTransitionScreen({ gameState: { characterStats: { ethics: 5 } } });
        expect(screen.generateSummary('early')).toMatchObject({ decisions: 0, relationships: 0, ethics: 5 });
    });

    it('every overlay class has a style rule and the stylesheet is linked', () => {
        const css = readFileSync('src/styles/act-transition.css', 'utf8');
        const html = new ActTransitionScreen({ gameState: { storylineManager: {}, characterStats: { ethics: 0 } } })
            .getTransitionHTML('early', 'mid', { decisions: 1, relationships: 1, progress: 'x', ethics: 0 });
        const classes = new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)));
        for (const cls of classes) expect(css).toContain(`.${cls}`);
        expect(readFileSync('index.html', 'utf8')).toContain('/src/styles/act-transition.css');
    });
});
