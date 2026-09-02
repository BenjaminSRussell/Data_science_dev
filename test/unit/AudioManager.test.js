import { describe, it, expect, vi } from 'vitest';
import { AudioManager } from '../../src/js/dev/AudioManager.js';

describe('AudioManager', () => {
    let audioManager;
    let playSoundSpy;
    let playToneSpy;
    let switchStationSpy;
    let playRandomTrackSpy;
    let audioContextSpy;

    beforeEach(() => {
        audioManager = new AudioManager();
        playSoundSpy = vi.spyOn(audioManager, 'playSound');
        playToneSpy = vi.spyOn(audioManager, 'playTone');
        switchStationSpy = vi.spyOn(audioManager, 'switchStation');
        playRandomTrackSpy = vi.spyOn(audioManager, 'playRandomTrack');
        audioContextSpy = vi.spyOn(window, 'AudioContext').mockImplementation(() => {
            throw new Error('Mocked AudioContext Error');
        });
    });

    afterEach(() => {
        playSoundSpy.mockRestore();
        playToneSpy.mockRestore();
        switchStationSpy.mockRestore();
        playRandomTrackSpy.mockRestore();
        audioContextSpy.mockRestore();
    });

    it('should not play sound if soundEnabled is false', () => {
        audioManager.soundEnabled = false;
        audioManager.play('testSound');
        expect(playSoundSpy).not.toHaveBeenCalled();
    });

    it('should ignore unknown sound names', () => {
        audioManager.soundEnabled = true;
        audioManager.play('unknownSound');
        expect(playSoundSpy).not.toHaveBeenCalled();
    });

    it('should handle errors in playTone gracefully', () => {
        audioManager.playTone(440, 1000);
        expect(audioContextSpy).toHaveBeenCalled();
    });

    it('should toggle sound on', () => {
        audioManager.soundEnabled = false;
        expect(audioManager.toggleSound()).toBe(true);
        expect(audioManager.soundEnabled).toBe(true);
    });

    it('should toggle sound off', () => {
        audioManager.soundEnabled = true;
        expect(audioManager.toggleSound()).toBe(false);
        expect(audioManager.soundEnabled).toBe(false);
    });

    it('should toggle music on and play existing track', () => {
        audioManager.currentMusic = new Audio('test');
        audioManager.currentMusic.paused = true;
        audioManager.musicEnabled = false;
        audioManager.currentStation = 'station1';
        audioManager.switchStation = vi.fn();
        audioManager.toggleMusic(true);
        expect(audioManager.musicEnabled).toBe(true);
        expect(audioManager.currentMusic.play).toHaveBeenCalled();
    });

    it('should toggle music on and switch station if none playing', () => {
        audioManager.currentMusic = null;
        audioManager.musicEnabled = false;
        audioManager.currentStation = 'station1';
        audioManager.switchStation = vi.fn();
        audioManager.toggleMusic(true);
        expect(audioManager.musicEnabled).toBe(true);
        expect(switchStationSpy).toHaveBeenCalledWith('station1');
    });

    it('should toggle music off', () => {
        audioManager.currentMusic = new Audio('test');
        audioManager.currentMusic.paused = false;
        audioManager.musicEnabled = true;
        audioManager.currentStation = 'station1';
        audioManager.toggleMusic(false);
        expect(audioManager.musicEnabled).toBe(false);
        expect(audioManager.currentMusic.pause).toHaveBeenCalled();
    });

    it('should switch to off station', () => {
        audioManager.currentStation = 'station1';
        audioManager.switchStation('off');
        expect(audioManager.musicEnabled).toBe(false);
        expect(audioManager.currentStation).toBe('off');
    });

    it('should switch station and play new track', () => {
        audioManager.currentStation = 'station1';
        const station = { tracks: ['track1', 'track2'] };
        audioManager.musicStations = { station1: station };
        audioManager.switchStation('station1');
        expect(audioManager.currentStation).toBe('station1');
        expect(playRandomTrackSpy).toHaveBeenCalledWith(station);
    });

    it('should handle station change without tracks', () => {
        audioManager.currentStation = 'station1';
        const station = { tracks: [] };
        audioManager.musicStations = { station1: station };
        audioManager.switchStation('station1');
        expect(audioManager.currentStation).toBe('station1');
        expect(playRandomTrackSpy).not.toHaveBeenCalled();
    });

    it('should play random track from station', () => {
        const station = { tracks: ['track1', 'track2'] };
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        audioManager.playRandomTrack(station);
        expect(window.Audio).toHaveBeenCalledWith('/assets/audio/music/track1');
    });

    it('should handle track end and re-play from same station', () => {
        const station = { tracks: ['track1', 'track2'] };
        const mockAudio = { addEventListener: vi.fn(), play: vi.fn() };
        window.Audio = vi.fn(() => mockAudio);
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        audioManager.playRandomTrack(station);
        const capturedCallback = mockAudio.addEventListener.mock.calls[0][1];
        audioManager.musicEnabled = true;
        capturedCallback();
        expect(window.Audio).toHaveBeenCalledWith('/assets/audio/music/track2');
    });

    it('should handle track end and not re-play if music is disabled', () => {
        const station = { tracks: ['track1', 'track2'] };
        const mockAudio = { addEventListener: vi.fn(), play: vi.fn() };
        window.Audio = vi.fn(() => mockAudio);
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        audioManager.playRandomTrack(station);
        const capturedCallback = mockAudio.addEventListener.mock.calls[0][1];
        audioManager.musicEnabled = false;
        capturedCallback();
        expect(window.Audio).not.toHaveBeenCalledWith('/assets/audio/music/track2');
    });

    it('should handle track end and not re-play if station changed', () => {
        const station = { tracks: ['track1', 'track2'] };
        const mockAudio = { addEventListener: vi.fn(), play: vi.fn() };
        window.Audio = vi.fn(() => mockAudio);
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        audioManager.playRandomTrack(station);
        const capturedCallback = mockAudio.addEventListener.mock.calls[0][1];
        audioManager.currentStation = 'station2';
        capturedCallback();
        expect(window.Audio).not.toHaveBeenCalledWith('/assets/audio/music/track2');
    });

    it('should get current station name', () => {
        audioManager.currentStation = 'off';
        expect(audioManager.getCurrentStationName()).toBe('Off');
        audioManager.currentStation = 'station1';
        audioManager.musicStations = { station1: { name: 'Station 1' } };
        expect(audioManager.getCurrentStationName()).toBe('Station 1');
        audioManager.currentStation = 'unknownStation';
        expect(audioManager.getCurrentStationName()).toBe('Unknown');
    });

    it('should clamp sound volume', () => {
        audioManager.setSoundVolume(-0.1);
        expect(audioManager.soundVolume).toBe(0);
        audioManager.setSoundVolume(1.1);
        expect(audioManager.soundVolume).toBe(1);
        audioManager.setSoundVolume(0.5);
        expect(audioManager.soundVolume).toBe(0.5);
    });

    it('should clamp music volume', () => {
        audioManager.setMusicVolume(-0.1);
        expect(audioManager.musicVolume).toBe(0);
        audioManager.setMusicVolume(1.1);
        expect(audioManager.musicVolume).toBe(1);
        audioManager.setMusicVolume(0.5);
        expect(audioManager.musicVolume).toBe(0.5);
    });
});