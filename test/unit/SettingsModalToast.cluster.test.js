/**
 * Settings modal, shared modal a11y, toasts, radio persistence and CSS
 * definitions (#1255, #2511, #2512, #1254, #1879, #1292, #1236, #1235,
 * #1244, #1245, #1246, #1057, #2339, #1056, #2338, #1058, #1748)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { AudioManager } from '../../src/js/audio/AudioManager.js';

const proto = MainGame.prototype;
const css = readFileSync('src/styles/main.css', 'utf8');
const html = readFileSync('index.html', 'utf8');

function modalDom() {
    document.body.innerHTML = `
        <button id="opener">OPTS</button>
        <div id="modal-container" class="hidden"><div class="modal-backdrop"></div><div id="modal-content"></div></div>
        <div id="toast-container"></div>`;
}

function fakeGame() {
    const fake = { audioManager: new AudioManager() };
    for (const m of ['showModal', 'closeModal', 'getModalFocusables', 'handleModalKeydown', 'showSettings',
        'toggleSound', 'updateSoundButton', 'updateRadioUI', 'showToast', 'dismissToast']) {
        fake[m] = proto[m].bind(fake);
    }
    return fake;
}

describe('settings modal', () => {
    beforeEach(() => { localStorage.clear(); modalDom(); });

    it('labels are tied to their controls and rows are laid out inline', () => {
        const game = fakeGame();
        game.showSettings();
        for (const id of ['settings-sound', 'settings-music', 'settings-music-volume', 'settings-sound-volume']) {
            const label = document.querySelector(`label[for="${id}"]`);
            expect(label, id).toBeTruthy();
            expect(document.getElementById(id).labels.length).toBeGreaterThan(0);
        }
        expect(document.querySelectorAll('.settings-row')).toHaveLength(4);
        for (const cls of ['.settings-modal', '.settings-row', '.credits-modal', '.credits-content', '.credits-section']) {
            expect(css).toContain(cls);
        }
        game.closeModal();
    });
});

describe('shared modal', () => {
    beforeEach(() => { localStorage.clear(); modalDom(); });

    it('is a labelled dialog, takes focus, traps Tab, closes on Escape and restores focus', () => {
        const game = fakeGame();
        const opener = document.getElementById('opener');
        opener.focus();
        game.showModal('<h2 id="modal-title">Hi</h2><button id="a">A</button><button id="b">B</button>');
        const content = document.getElementById('modal-content');
        expect(content.getAttribute('role')).toBe('dialog');
        expect(content.getAttribute('aria-modal')).toBe('true');
        expect(content.getAttribute('aria-labelledby')).toBe('modal-title');
        expect(document.activeElement.id).toBe('a');

        document.getElementById('b').focus();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
        expect(document.activeElement.id).toBe('a');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
        expect(document.activeElement.id).toBe('b');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(document.getElementById('modal-container').classList.contains('hidden')).toBe(true);
        expect(document.activeElement).toBe(opener);
        expect(game.modalKeyHandler).toBeNull();
    });
});

describe('toasts', () => {
    beforeEach(() => { modalDom(); vi.useFakeTimers(); });
    afterEach(() => vi.useRealTimers());

    it('caps the stack and keeps long messages up longer', () => {
        const game = fakeGame();
        for (let i = 0; i < 6; i++) game.showToast(`msg ${i}`, 'info');
        expect(document.querySelectorAll('.toast:not(.leaving)')).toHaveLength(4);
        vi.advanceTimersByTime(400);
        expect(document.querySelectorAll('.toast')).toHaveLength(4);

        const long = game.showToast('x'.repeat(100), 'warning');
        vi.advanceTimersByTime(3500);
        expect(long.classList.contains('leaving')).toBe(false);
        vi.advanceTimersByTime(4000);
        expect(long.classList.contains('leaving')).toBe(true);
    });

    it('info toasts have a style and the toast layer sits above full-screen overlays', () => {
        expect(css).toContain('.toast.info');
        const z = Number(/--z-toast:\s*(\d+)/.exec(css)[1]);
        expect(z).toBeGreaterThan(10002);
    });
});

describe('audio', () => {
    beforeEach(() => localStorage.clear());

    it('remembers the radio station across sessions', () => {
        vi.stubGlobal('Audio', class { constructor() { this.paused = true; } addEventListener() {} play() { this.paused = false; return Promise.resolve(); } pause() {} });
        try {
            new AudioManager().switchStation('jazz_fm');
            expect(new AudioManager().currentStation).toBe('jazz_fm');
            new AudioManager().switchStation('off');
            const am = new AudioManager();
            expect(am.currentStation).toBe('off');
            expect(am.musicEnabled).toBe(false);
        } finally {
            vi.unstubAllGlobals();
        }
    });

    it('rent has its own expense sound, not the cash-in kaching', () => {
        const src = readFileSync('src/js/main.js', 'utf8');
        expect(src).toMatch(/Paid weekly rent[^\n]*\n\s*this\.audioManager\.play\('expense'\)/);
        expect(src).not.toContain("play('kaching'); // Or a sad sound?");
    });

    it('reset progress stops the music', () => {
        modalDom();
        const stop = vi.fn();
        const fake = {
            audioManager: { stopCurrentMusic: stop },
            updateRadioUI: vi.fn(),
            saveManager: { stopAutoSave: vi.fn(), clearSave: vi.fn() },
            gameState: { reset: vi.fn() },
            closeModal: vi.fn(),
            screenManager: { showScreen: vi.fn() },
            showToast: vi.fn()
        };
        vi.stubGlobal('confirm', () => true);
        try {
            proto.resetProgress.call(fake);
        } finally {
            vi.unstubAllGlobals();
        }
        expect(stop).toHaveBeenCalled();
    });
});

describe('CSS definitions', () => {
    it('defines the variables components use', () => {
        for (const v of ['--color-primary', '--gradient-grey-dark', '--gradient-grey-mid', '--gradient-grey-light']) {
            expect(css).toMatch(new RegExp(`${v}\\s*:`));
        }
    });

    it('defines every keyframe the stylesheets animate with', () => {
        for (const name of ['loadingProgress', 'menuFadeIn', 'modalIn', 'shimmer', 'skeleton', 'pulse-border']) {
            expect(css).toContain(`@keyframes ${name}`);
        }
    });

    it('the radio menu uses the theme-aware class instead of a hardcoded inline style', () => {
        expect(html).toContain('id="music-radio-menu" class="music-radio-menu hidden"');
        const menuTag = /<div id="music-radio-menu"[^>]*>/.exec(html)[0];
        expect(menuTag).not.toContain('style=');
    });
});
