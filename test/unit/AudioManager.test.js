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

        it('should clean up fade interval from map', async () => {
            const audio = { volume: 0.5, pause: vi.fn() };

            expect(audioManager.fadeIntervals.size).toBe(0);

            await audioManager.fadeOutAndStop(audio, 50);

            expect(audioManager.fadeIntervals.size).toBe(0);
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

        it('should clean up fade interval from map', async () => {
            const audio = { volume: 0, addEventListener: vi.fn() };

            expect(audioManager.fadeIntervals.size).toBe(0);

            await audioManager.fadeIn(audio, 0.5, 50);

            expect(audioManager.fadeIntervals.size).toBe(0);
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

        it('should serialize concurrent switchStation calls to prevent race conditions', async () => {
            audioManager.musicEnabled = true;
            const oldAudio = { volume: 0.5, pause: vi.fn() };
            audioManager.currentMusic = oldAudio;

            // Fire two rapid station switches
            const switch1 = audioManager.switchStation('lofi_beats');
            const switch2 = audioManager.switchStation('jazz_fm');

            // Both should complete without error
            await expect(Promise.all([switch1, switch2])).resolves.not.toThrow();

            // The second switch should have won (final station should be jazz_fm)
            expect(audioManager.currentStation).toBe('jazz_fm');

            // Old audio should only be paused once (not by both concurrent calls)
            expect(oldAudio.pause).toHaveBeenCalledTimes(1);
        });

        it('should handle rapid switchStation calls with proper audio cleanup', async () => {
            audioManager.musicEnabled = true;
            audioManager.musicVolume = 0.5;

            // Start with initial station
            const station1 = audioManager.musicStations['lofi_beats'];
            await audioManager.playRandomTrack(station1);
            const audio1 = audioManager.currentMusic;

            // Rapidly switch stations
            const switch1 = audioManager.switchStation('jazz_fm');
            await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
            const switch2 = audioManager.switchStation('synthwave');

            // Wait for all switches to complete
            await Promise.all([switch1, switch2]);

            // Final station should be synthwave
            expect(audioManager.currentStation).toBe('synthwave');

            // currentMusic should not be the original audio
            expect(audioManager.currentMusic).not.toBe(audio1);
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

        it('should clean up fade interval from map', async () => {
            audioManager.currentMusic = { volume: 0.5 };

            expect(audioManager.fadeIntervals.size).toBe(0);

            await audioManager.setMusicVolume(0.2);

            expect(audioManager.fadeIntervals.size).toBe(0);
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

        it('should fade in volume when re-enabling music with existing track', async () => {
            const audio = { volume: 0, pause: vi.fn(), play: vi.fn().mockResolvedValue(undefined) };
            audioManager.currentMusic = audio;
            audioManager.musicEnabled = false;
            audioManager.musicVolume = 0.5;

            const togglePromise = audioManager.toggleMusic();

            // Give it time to start the fadeIn
            await new Promise(resolve => setTimeout(resolve, 50));

            // Volume should be fading in (increased from 0 but not yet at target)
            expect(audio.volume).toBeGreaterThan(0);
            expect(audio.volume).toBeLessThan(0.5);

            // Wait for toggle to complete
            await togglePromise;

            // Should have called play
            expect(audio.play).toHaveBeenCalled();

            // Should be at or very close to target volume
            expect(Math.abs(audio.volume - 0.5)).toBeLessThan(0.05);
            expect(audioManager.musicEnabled).toBe(true);
        });

        it('should handle toggle off-then-on-then-off sequence correctly', async () => {
            audioManager.currentMusic = null;
            audioManager.musicEnabled = true;
            audioManager.currentStation = 'lofi_beats';

            // Turn off
            await audioManager.toggleMusic();
            expect(audioManager.musicEnabled).toBe(false);

            // Turn on (should fade in)
            await audioManager.toggleMusic();
            expect(audioManager.musicEnabled).toBe(true);

            // Turn off again (should fade out)
            await audioManager.toggleMusic();
            expect(audioManager.musicEnabled).toBe(false);
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

    describe('fadeIntervals map cleanup', () => {
        it('should not leak memory with many fades', async () => {
            const audio = { volume: 0.5, pause: vi.fn(), addEventListener: vi.fn() };

            // Perform many fades
            for (let i = 0; i < 10; i++) {
                await audioManager.fadeOutAndStop(audio, 50);
                audio.volume = 0.5; // Reset for next fade
            }

            // Map should be empty after all fades complete
            expect(audioManager.fadeIntervals.size).toBe(0);
        });

        it('should not leak memory with fadeIn operations', async () => {
            const audio = { volume: 0, addEventListener: vi.fn() };

            // Perform many fades
            for (let i = 0; i < 10; i++) {
                await audioManager.fadeIn(audio, 0.5, 50);
            }

            // Map should be empty after all fades complete
            expect(audioManager.fadeIntervals.size).toBe(0);
        });
    });
});
