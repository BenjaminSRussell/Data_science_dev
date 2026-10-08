/**
 * Settings modal, SFX button and music radio drive AudioManager (#869)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { AudioManager } from '../../src/js/audio/AudioManager.js';

const proto = MainGame.prototype;

function makeFake() {
    const audioManager = new AudioManager();
    vi.spyOn(audioManager, 'switchStation').mockImplementation(function (id) { this.currentStation = id; });
    const fake = {
        audioManager,
        showModal: (html) => { document.getElementById('modal').innerHTML = html; }
    };
    for (const m of ['showSettings', 'toggleSound', 'updateSoundButton', 'initMusicRadio', 'switchMusicStation', 'updateRadioUI']) {
        fake[m] = proto[m].bind(fake);
    }
    return fake;
}

const change = (el, checked) => { el.checked = checked; el.dispatchEvent(new Event('change', { bubbles: true })); };
const input = (el, value) => { el.value = String(value); el.dispatchEvent(new Event('input', { bubbles: true })); };

describe('settings modal', () => {
    let fake;
    beforeEach(() => {
        document.body.innerHTML = '<button id="btn-sound"></button><div id="modal"></div>';
        fake = makeFake();
        fake.showSettings();
    });

    it('checkboxes reflect the current state', () => {
        expect(document.getElementById('settings-sound').checked).toBe(fake.audioManager.soundEnabled);
        expect(document.getElementById('settings-music').checked).toBe(fake.audioManager.musicEnabled);
    });

    it('the sound checkbox sets sound on/off and updates the toolbar label', () => {
        const box = document.getElementById('settings-sound');
        change(box, false);
        expect(fake.audioManager.soundEnabled).toBe(false);
        expect(document.getElementById('btn-sound').textContent).toBe('SFX: OFF');
        change(box, false); // already off: no flip back
        expect(fake.audioManager.soundEnabled).toBe(false);
        change(box, true);
        expect(fake.audioManager.soundEnabled).toBe(true);
        expect(document.getElementById('btn-sound').textContent).toBe('SFX: ON');
    });

    it('the music checkbox follows its checked state', () => {
        const box = document.getElementById('settings-music');
        const start = fake.audioManager.musicEnabled;
        change(box, !start);
        expect(fake.audioManager.musicEnabled).toBe(!start);
        change(box, !start);
        expect(fake.audioManager.musicEnabled).toBe(!start);
    });

    it('volume sliders set clamped volumes', () => {
        input(document.getElementById('settings-music-volume'), 25);
        expect(fake.audioManager.musicVolume).toBe(0.25);
        input(document.getElementById('settings-sound-volume'), 80);
        expect(fake.audioManager.soundVolume).toBe(0.8);
    });
});

describe('toolbar sound button', () => {
    it('toggleSound flips state and the label', () => {
        document.body.innerHTML = '<button id="btn-sound"></button>';
        const fake = makeFake();
        const before = fake.audioManager.soundEnabled;
        fake.toggleSound();
        expect(fake.audioManager.soundEnabled).toBe(!before);
        expect(document.getElementById('btn-sound').textContent).toBe(before ? 'SFX: OFF' : 'SFX: ON');
        expect(document.getElementById('btn-sound').getAttribute('aria-pressed')).toBe(before ? 'false' : 'true');
    });
});

describe('music radio', () => {
    let fake;
    beforeEach(() => {
        document.body.innerHTML = `
          <button id="btn-music-radio">Radio</button>
          <div id="music-radio-menu" class="hidden">
            <div class="radio-station" data-station="lofi">Lofi</div>
            <div class="radio-station" data-station="jazz">Jazz</div>
          </div>
          <div id="outside"></div>`;
        fake = makeFake();
        fake.initMusicRadio();
    });
    const menu = () => document.getElementById('music-radio-menu');

    it('button toggles the menu; clicking outside closes it', () => {
        document.getElementById('btn-music-radio').click();
        expect(menu().classList.contains('hidden')).toBe(false);
        document.getElementById('outside').click();
        expect(menu().classList.contains('hidden')).toBe(true);
    });

    it('a second init does not double-bind the toggle', () => {
        fake.initMusicRadio();
        document.getElementById('btn-music-radio').click();
        expect(menu().classList.contains('hidden')).toBe(false);
    });

    it('choosing a station switches, marks it active and closes the menu', () => {
        document.getElementById('btn-music-radio').click();
        document.querySelector('[data-station="jazz"]').click();
        expect(fake.audioManager.switchStation).toHaveBeenCalledWith('jazz');
        expect(document.querySelector('[data-station="jazz"]').classList.contains('active')).toBe(true);
        expect(document.querySelector('[data-station="lofi"]').classList.contains('active')).toBe(false);
        expect(menu().classList.contains('hidden')).toBe(true);
    });
});
