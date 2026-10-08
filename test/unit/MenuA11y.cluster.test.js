/**
 * Menu accessibility, radio disclosure, top bar and labels
 * (#1320, #2212, #2474, #879, #877, #2335, #1472)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';

const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const mainCss = fs.readFileSync(path.join(root, 'src/styles/main.css'), 'utf8');
const proto = MainGame.prototype;

function key(el, k) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

describe('menu enhancements run on the current markup (#1320, #2212, #2474)', () => {
    beforeEach(() => {
        document.documentElement.removeAttribute('data-reduced-motion');
        document.body.innerHTML = `
            <section id="screen-menu">
                <button id="a">New Game</button>
                <button id="b" style="display:none">Continue</button>
                <button id="c">Load</button>
                <button id="d" title="Settings"></button>
            </section>
            <section id="screen-shop"><button id="x">Buy</button></section>`;
    });

    it('wires keyboard nav, roles and reduced motion without the deleted elements', () => {
        const fake = Object.create(proto);
        window.matchMedia = vi.fn(() => ({ matches: true }));
        fake.initMenuEnhancements();
        const menu = document.getElementById('screen-menu');
        expect(menu.getAttribute('role')).toBe('main');
        expect(menu.getAttribute('data-time')).toMatch(/morning|afternoon|evening|night/);
        expect(document.documentElement.getAttribute('data-reduced-motion')).toBe('true');
    });

    it('arrow keys move only between visible menu buttons', () => {
        const fake = Object.create(proto);
        window.matchMedia = vi.fn(() => ({ matches: false }));
        fake.initMenuEnhancements();
        fake.initMenuEnhancements(); // idempotent
        const a = document.getElementById('a');
        a.focus();
        key(a, 'ArrowDown');
        expect(document.activeElement.id).toBe('c'); // skips the hidden Continue
        key(document.activeElement, 'ArrowDown');
        expect(document.activeElement.id).toBe('d');
        key(document.activeElement, 'ArrowDown');
        expect(document.activeElement.id).toBe('d'); // never jumps to the shop
        key(document.activeElement, 'ArrowUp');
        expect(document.activeElement.id).toBe('c');
    });

    it('does not replace real button text with a generic aria-label', () => {
        const fake = Object.create(proto);
        window.matchMedia = vi.fn(() => ({ matches: false }));
        fake.initMenuEnhancements();
        expect(document.getElementById('a').hasAttribute('aria-label')).toBe(false);
        expect(document.getElementById('d').getAttribute('aria-label')).toBe('Settings');
        expect(document.getElementById('x').hasAttribute('aria-label')).toBe(false);
    });

    it('focus rings come from CSS, not per-element purple outlines', () => {
        expect(mainCss).toMatch(/:focus-visible \{\s*outline: 2px solid var\(--color-text-primary\)/);
        const src = fs.readFileSync(path.join(root, 'src/js/main.js'), 'utf8');
        expect(src).not.toContain("el.style.outline = '2px solid rgba(139, 92, 246, 0.6)'");
    });
});

describe('music radio disclosure (#879)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <button id="btn-music-radio" aria-expanded="false">MUSIC: OFF</button>
            <div id="music-radio-menu" class="hidden">
                <button class="radio-station" data-station="lofi_beats">Lofi</button>
                <button class="radio-station" data-station="jazz_fm">Jazz</button>
            </div>`;
    });

    it('exposes expanded state, moves focus in, and Escape closes back to the button', () => {
        const fake = Object.create(proto);
        fake.updateRadioUI = vi.fn();
        fake.switchMusicStation = vi.fn();
        fake.initMusicRadio();
        const btn = document.getElementById('btn-music-radio');
        const menu = document.getElementById('music-radio-menu');
        btn.click();
        expect(btn.getAttribute('aria-expanded')).toBe('true');
        expect(document.activeElement.dataset.station).toBe('lofi_beats');
        key(document.activeElement, 'ArrowDown');
        expect(document.activeElement.dataset.station).toBe('jazz_fm');
        key(document.activeElement, 'Escape');
        expect(menu.classList.contains('hidden')).toBe(true);
        expect(btn.getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(btn);
    });

    it('markup declares the popup', () => {
        expect(html).toMatch(/id="btn-music-radio"[^>]*aria-haspopup="true"[^>]*aria-expanded="false"/);
        expect(html).toMatch(/id="music-radio-menu"[^>]*role="menu"/);
        expect(html).not.toMatch(/class="radio-station btn-grey" style=/);
    });
});

describe('top bar and form labels', () => {
    it('top-bar-center has no inline display, so the mobile rule can hide it (#877)', () => {
        const tag = /<div class="top-bar-center"[^>]*>/.exec(html)[0];
        expect(tag).not.toContain('style=');
        expect(mainCss).toMatch(/\n\.top-bar-center \{\s*display: flex;/);
    });

    it('Chart Studio checkbox labels point at their inputs (#2335)', () => {
        expect(html).toContain('<label for="show-legend">Show Legend</label>');
        expect(html).toContain('<label for="show-grid">Show Grid</label>');
        expect(html).toContain('<label for="show-data-labels">Data Labels</label>');
    });

    it('menu stats dashboard has the class its CSS targets (#1472)', () => {
        expect(html).toContain('id="menu-stats-dashboard" class="menu-stats-dashboard"');
        const panels = fs.readFileSync(path.join(root, 'src/styles/game-panels.css'), 'utf8');
        expect(panels).toMatch(/\n\.menu-stats-dashboard \{\s*display: grid;/);
        expect(panels).toMatch(/\n\.stat-content \{/);
    });
});
