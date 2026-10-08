/**
 * Mute state has one source of truth across play, save and load (#135)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { AudioManager } from '../../src/js/audio/AudioManager.js';
import { GameState } from '../../src/js/game/GameState.js';

const proto = MainGame.prototype;

function makeFake() {
    const audioManager = new AudioManager();
    vi.spyOn(audioManager, 'switchStation').mockImplementation(function (id) { this.currentStation = id; });
    const storeState = {
        soundEnabled: true,
        musicEnabled: true,
        setSoundEnabled: vi.fn(v => { storeState.soundEnabled = v; }),
        setMusicEnabled: vi.fn(v => { storeState.musicEnabled = v; })
    };
    const fake = {
        audioManager,
        gameState: new GameState(),
        gameStore: { getState: () => storeState },
        storeState
    };
    for (const m of ['toggleSound', 'updateSoundButton', 'syncAudioPrefs', 'applyAudioPrefsFromState', 'switchMusicStation']) {
        fake[m] = proto[m].bind(fake);
    }
    return fake;
}

describe('audio preferences', () => {
    let fake;
    beforeEach(() => {
        document.body.innerHTML = '<button id="btn-sound"></button>';
        fake = makeFake();
    });

    it('toggling sound writes the persisted copies (GameState, settings, store)', () => {
        fake.toggleSound();
        expect(fake.audioManager.soundEnabled).toBe(false);
        expect(fake.gameState.soundEnabled).toBe(false);
        expect(fake.gameState.settings.soundEnabled).toBe(false);
        expect(fake.storeState.soundEnabled).toBe(false);
    });

    it('a muted session survives serialize -> deserialize -> apply', () => {
        fake.toggleSound();
        fake.audioManager.toggleMusic();
        fake.syncAudioPrefs();
        const saved = JSON.parse(JSON.stringify(fake.gameState.serialize ? fake.gameState.serialize() : fake.gameState.toJSON()));
        expect(saved.soundEnabled).toBe(false);
        expect(saved.musicEnabled).toBe(false);

        const fresh = makeFake();
        expect(fresh.audioManager.soundEnabled).toBe(true);
        fresh.gameState.deserialize ? fresh.gameState.deserialize(saved) : fresh.gameState.fromJSON(saved);
        fresh.applyAudioPrefsFromState();
        expect(fresh.audioManager.soundEnabled).toBe(false);
        expect(fresh.audioManager.musicEnabled).toBe(false);
        expect(fresh.storeState.soundEnabled).toBe(false);
        expect(document.getElementById('btn-sound').textContent).toBe('SFX: OFF');
    });

    it('applying an unmuted save leaves an unmuted AudioManager alone', () => {
        const toggle = vi.spyOn(fake.audioManager, 'toggleSound');
        fake.applyAudioPrefsFromState();
        expect(toggle).not.toHaveBeenCalled();
        expect(fake.audioManager.soundEnabled).toBe(true);
    });
});

describe('settings.theme (#1253)', () => {
    it('is not part of GameState settings and is dropped from old saves', () => {
        const gs = new GameState();
        expect(gs.settings).not.toHaveProperty('theme');
        const saved = JSON.parse(JSON.stringify(gs.serialize ? gs.serialize() : gs.toJSON()));
        saved.settings = { ...saved.settings, theme: 'dark', autoSave: false };
        const gs2 = new GameState();
        gs2.deserialize ? gs2.deserialize(saved) : gs2.fromJSON(saved);
        expect(gs2.settings).not.toHaveProperty('theme');
        expect(gs2.settings.autoSave).toBe(false);
    });
});
