import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioManager } from '../../src/js/audio/AudioManager.js';

describe('AudioManager', () => {
    let audioManager;

    beforeEach(() => {
        audioManager = new AudioManager();

        // Mock Audio constructor to return different objects each time
        global.Audio = vi.fn(() => {
            return {
                volume: 0.5,
                play: vi.fn().mockResolvedValue(undefined),
                pause: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            };
        });
    });

    afterEach(() => {
        audioManager.clearActiveFades();
        vi.clearAllMocks();
    });

    describe('fadeOutAndStop', () => {
        it('should fade out audio volume to 0 before pausing', async () => {
            const audio = { volume: 0.5, pause: vi.fn() };

            const fadePromise = audioManager.fadeOutAndStop(audio, 200);

            // Check that volume starts decreasing
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(audio.volume).toBeLessThan(0.5);
            expect(audio.pause).not.toHaveBeenCalled();

            // Wait for fade to complete
            await fadePromise;
            expect(audio.volume).toBe(0);
            expect(audio.pause).toHaveBeenCalled();
        });

        it('should handle null audio element gracefully', async () => {
            await expect(audioManager.fadeOutAndStop(null, 200)).resolves.not.toThrow();
        });
    });

    describe('fadeIn', () => {
        it('should fade in audio volume from 0 to target', async () => {
            const audio = { volume: 0, addEventListener: vi.fn() };
            const targetVolume = 0.5;

            const fadePromise = audioManager.fadeIn(audio, targetVolume, 200);

            // Check that volume starts at 0 and increases
            expect(audio.volume).toBe(0);

            await new Promise(resolve => setTimeout(resolve, 100));
            expect(audio.volume).toBeGreaterThan(0);
            expect(audio.volume).toBeLessThan(targetVolume);

            // Wait for fade to complete
            await fadePromise;
            expect(audio.volume).toBe(targetVolume);
        });

        it('should handle null audio element gracefully', async () => {
            await expect(audioManager.fadeIn(null, 0.5, 200)).resolves.not.toThrow();
        });
    });

    describe('switchStation', () => {
        it('should fade out current music before switching stations', async () => {
            // Setup current music
            const oldAudio = { volume: 0.5, pause: vi.fn() };
            audioManager.currentMusic = oldAudio;
            audioManager.musicEnabled = true;

            // Start switch
            const switchPromise = audioManager.switchStation('jazz_fm');

            // Music should be fading (volume decreasing)
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(oldAudio.volume).toBeLessThan(0.5);

            // Wait for switch to complete
            await switchPromise;
            // Old audio should be paused
            expect(oldAudio.pause).toHaveBeenCalled();
        });

        it('should stop music instantly when switching to off', async () => {
            const oldAudio = { volume: 0.5, pause: vi.fn() };
            audioManager.currentMusic = oldAudio;
            audioManager.musicEnabled = true;

            await audioManager.switchStation('off');

            expect(audioManager.currentStation).toBe('off');
            expect(audioManager.musicEnabled).toBe(false);
        });

        it('should handle invalid stations gracefully', async () => {
            await audioManager.switchStation('invalid_station');
            expect(audioManager.currentMusic).toBeNull();
        });
    });

    describe('playRandomTrack', () => {
        it('should play track with fade-in', async () => {
            audioManager.musicEnabled = true;
            audioManager.musicVolume = 0.5;

            const station = audioManager.musicStations['lofi_beats'];
            const playPromise = audioManager.playRandomTrack(station);

            // Volume should start at 0
            expect(audioManager.currentMusic.volume).toBe(0);

            // Wait for play and fade-in to complete
            await playPromise;

            // Should fade in to musicVolume
            expect(audioManager.currentMusic.volume).toBe(0.5);
            expect(audioManager.currentMusic.play).toHaveBeenCalled();
        });

        it('should not play if music is disabled', async () => {
            audioManager.musicEnabled = false;
            const station = audioManager.musicStations['lofi_beats'];

            await audioManager.playRandomTrack(station);

            expect(audioManager.currentMusic).toBeNull();
        });
    });

    describe('setMusicVolume', () => {
        it('should fade music volume to new level', async () => {
            audioManager.currentMusic = { volume: 0.5, addEventListener: vi.fn() };
            audioManager.musicVolume = 0.5;

            const volumePromise = audioManager.setMusicVolume(0.2);

            // Check initial volume is still 0.5
            expect(audioManager.currentMusic.volume).toBe(0.5);

            // Wait a bit and check volume is decreasing
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(audioManager.currentMusic.volume).toBeLessThan(0.5);

            // Wait for fade to complete
            await volumePromise;
            expect(audioManager.currentMusic.volume).toBe(0.2);
            expect(audioManager.musicVolume).toBe(0.2);
        });

        it('should clamp volume between 0 and 1', async () => {
            audioManager.currentMusic = { volume: 0.5, addEventListener: vi.fn() };

            await audioManager.setMusicVolume(2.0);
            expect(audioManager.musicVolume).toBe(1);

            await audioManager.setMusicVolume(-1.0);
            expect(audioManager.musicVolume).toBe(0);
        });

        it('should work without current music', async () => {
            audioManager.currentMusic = null;

            await audioManager.setMusicVolume(0.3);
            expect(audioManager.musicVolume).toBe(0.3);
        });
    });

    describe('toggleMusic', () => {
        it('should fade out music when disabling', async () => {
            const audio = { volume: 0.5, pause: vi.fn() };
            audioManager.currentMusic = audio;
            audioManager.musicEnabled = true;

            const togglePromise = audioManager.toggleMusic();

            // Check volume is fading down
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(audio.volume).toBeLessThan(0.5);

            // Wait for toggle to complete
            await togglePromise;
            expect(audioManager.musicEnabled).toBe(false);
            expect(audio.pause).toHaveBeenCalled();
        });

        it('should toggle music state correctly', async () => {
            audioManager.currentMusic = null;
            audioManager.musicEnabled = false;
            audioManager.currentStation = 'lofi_beats';

            const result = await audioManager.toggleMusic();

            expect(result).toBe(true);
            expect(audioManager.musicEnabled).toBe(true);
        });
    });

    describe('integration: music transitions', () => {
        it('should smoothly transition between stations', async () => {
            audioManager.musicEnabled = true;
            audioManager.musicVolume = 0.5;

            // Start with one station
            const station1 = audioManager.musicStations['lofi_beats'];
            await audioManager.playRandomTrack(station1);
            const firstAudio = audioManager.currentMusic;
            expect(firstAudio.volume).toBe(0.5);

            // Switch to another station
            const switchPromise = audioManager.switchStation('jazz_fm');

            // Old audio should be fading
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(firstAudio.volume).toBeLessThan(0.5);

            // Wait for switch
            await switchPromise;

            // New audio should be different and faded in
            const secondAudio = audioManager.currentMusic;
            expect(secondAudio).not.toBe(firstAudio);
            expect(secondAudio.volume).toBe(0.5); // Should be faded in
        });
    });

    describe('clearActiveFades', () => {
        it('should clear all active fade intervals', async () => {
            const audio1 = { volume: 0.5, pause: vi.fn() };
            const audio2 = { volume: 0.5, addEventListener: vi.fn() };

            // Start two fades
            audioManager.fadeOutAndStop(audio1, 500);
            audioManager.fadeIn(audio2, 0.5, 500);

            // Clear all fades
            audioManager.clearActiveFades();

            // Fades should be interrupted, but this is hard to test directly
            // Just ensure it doesn't throw
            expect(() => audioManager.clearActiveFades()).not.toThrow();
        });
    });
});
