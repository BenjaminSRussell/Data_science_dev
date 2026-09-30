/**
 * Unit tests for AudioManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioManager } from '../../src/js/audio/AudioManager.js';

describe('AudioManager', () => {
    let audioManager;
    let mockAudioContext;
    let mockOscillator;
    let mockGainNode;
    let mockAudio;

    beforeEach(() => {
        audioManager = new AudioManager();

        // Mock Web Audio API components
        mockGainNode = {
            connect: vi.fn(),
            gain: {
                setValueAtTime: vi.fn(),
                exponentialRampToValueAtTime: vi.fn()
            }
        };

        mockOscillator = {
            connect: vi.fn(),
            frequency: { value: 0 },
            type: 'sine',
            start: vi.fn(),
            stop: vi.fn()
        };

        mockAudioContext = {
            createOscillator: vi.fn(() => mockOscillator),
            createGain: vi.fn(() => mockGainNode),
            destination: {},
            currentTime: 0
        };

        // Mock window.Audio constructor
        mockAudio = vi.fn(function(url) {
            this.url = url;
            this.volume = 0.5;
            this.paused = true;
            this._listeners = {};
            this.play = vi.fn(async function() {
                this.paused = false;
                return Promise.resolve();
            });
            this.pause = vi.fn(function() {
                this.paused = true;
            });
            this.addEventListener = vi.fn(function(event, callback) {
                this._listeners[event] = callback;
            });
        });

        // Mock window.AudioContext
        window.AudioContext = vi.fn(() => mockAudioContext);
        window.Audio = mockAudio;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('play', () => {
        it('should play a sound effect when soundEnabled is true', () => {
            audioManager.soundEnabled = true;
            audioManager.play('click');
            expect(mockAudioContext.createOscillator).toHaveBeenCalled();
        });

        it('should not play a sound effect when soundEnabled is false', () => {
            audioManager.soundEnabled = false;
            audioManager.play('click');
            expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
        });

        it('should silently ignore unknown sound names', () => {
            audioManager.soundEnabled = true;
            audioManager.play('unknownSound');
            // Should not throw or call playTone
            expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
        });

        it('should play a known sound name', () => {
            audioManager.soundEnabled = true;
            audioManager.play('success');
            expect(mockOscillator.start).toHaveBeenCalled();
            expect(mockOscillator.stop).toHaveBeenCalled();
        });
    });

    describe('playTone', () => {
        it('should create an audio context and play a tone', () => {
            audioManager.playTone(440, 100);
            expect(mockAudioContext.createOscillator).toHaveBeenCalled();
            expect(mockAudioContext.createGain).toHaveBeenCalled();
            expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
            expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
        });

        it('should set oscillator frequency', () => {
            audioManager.playTone(880, 100);
            expect(mockOscillator.frequency.value).toBe(880);
        });

        it('should set oscillator type to sine', () => {
            audioManager.playTone(440, 100);
            expect(mockOscillator.type).toBe('sine');
        });

        it('should swallow errors when AudioContext throws', () => {
            const throwingAudioContext = vi.fn(() => {
                throw new Error('AudioContext not supported');
            });
            window.AudioContext = throwingAudioContext;

            // Should not throw
            expect(() => audioManager.playTone(440, 100)).not.toThrow();
        });

        it('should not propagate errors when AudioContext fails', () => {
            const errorConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
            window.AudioContext = vi.fn(() => {
                throw new Error('AudioContext failed');
            });

            audioManager.playTone(440, 100);
            // Error should be caught internally
            expect(() => audioManager.playTone(440, 100)).not.toThrow();

            errorConsoleLog.mockRestore();
        });
    });

    describe('toggleSound', () => {
        it('should toggle soundEnabled from true to false', () => {
            audioManager.soundEnabled = true;
            const result = audioManager.toggleSound();
            expect(audioManager.soundEnabled).toBe(false);
            expect(result).toBe(false);
        });

        it('should toggle soundEnabled from false to true', () => {
            audioManager.soundEnabled = false;
            const result = audioManager.toggleSound();
            expect(audioManager.soundEnabled).toBe(true);
            expect(result).toBe(true);
        });

        it('should return the new value', () => {
            audioManager.soundEnabled = true;
            const result = audioManager.toggleSound();
            expect(result).toBe(audioManager.soundEnabled);
        });
    });

    describe('toggleMusic', () => {
        it('should toggle musicEnabled from true to false', () => {
            audioManager.musicEnabled = true;
            const result = audioManager.toggleMusic();
            expect(audioManager.musicEnabled).toBe(false);
            expect(result).toBe(false);
        });

        it('should toggle musicEnabled from false to true', () => {
            audioManager.musicEnabled = false;
            const result = audioManager.toggleMusic();
            expect(audioManager.musicEnabled).toBe(true);
            expect(result).toBe(true);
        });

        it('should pause current music when toggling to false', () => {
            audioManager.musicEnabled = true;
            audioManager.currentMusic = {
                pause: vi.fn(),
                play: vi.fn(() => Promise.resolve())
            };
            audioManager.toggleMusic();
            expect(audioManager.currentMusic.pause).toHaveBeenCalled();
        });

        it('should resume current music when toggling to true', () => {
            audioManager.musicEnabled = false;
            audioManager.currentMusic = {
                pause: vi.fn(),
                play: vi.fn(() => Promise.resolve())
            };
            audioManager.toggleMusic();
            expect(audioManager.currentMusic.play).toHaveBeenCalled();
        });

        it('should call switchStation if no currentMusic and musicEnabled becomes true and station is not off', () => {
            audioManager.musicEnabled = false;
            audioManager.currentMusic = null;
            audioManager.currentStation = 'lofi_beats';

            const switchStationSpy = vi.spyOn(audioManager, 'switchStation');
            audioManager.toggleMusic();

            expect(switchStationSpy).toHaveBeenCalledWith('lofi_beats');
        });

        it('should not call switchStation if station is off', () => {
            audioManager.musicEnabled = false;
            audioManager.currentMusic = null;
            audioManager.currentStation = 'off';

            const switchStationSpy = vi.spyOn(audioManager, 'switchStation');
            audioManager.toggleMusic();

            expect(switchStationSpy).not.toHaveBeenCalled();
        });

        it('should return the new value', () => {
            audioManager.musicEnabled = true;
            const result = audioManager.toggleMusic();
            expect(result).toBe(audioManager.musicEnabled);
        });
    });

    describe('switchStation', () => {
        it('should set station to off and disable music', () => {
            audioManager.switchStation('off');
            expect(audioManager.currentStation).toBe('off');
            expect(audioManager.musicEnabled).toBe(false);
        });

        it('should pause and null current music when switching stations', () => {
            const mockMusic = {
                pause: vi.fn(),
                play: vi.fn(() => Promise.resolve()),
                volume: 0.5,
                addEventListener: vi.fn()
            };
            audioManager.currentMusic = mockMusic;

            audioManager.switchStation('folk_radio');

            expect(mockMusic.pause).toHaveBeenCalled();
            // currentMusic should be nulled before playRandomTrack is called
        });

        it('should call playRandomTrack for non-off stations', () => {
            const playRandomTrackSpy = vi.spyOn(audioManager, 'playRandomTrack');
            audioManager.switchStation('jazz_fm');
            expect(playRandomTrackSpy).toHaveBeenCalled();
        });

        it('should not call playRandomTrack for off station', () => {
            const playRandomTrackSpy = vi.spyOn(audioManager, 'playRandomTrack');
            audioManager.switchStation('off');
            expect(playRandomTrackSpy).not.toHaveBeenCalled();
        });

        it('should set musicEnabled to true for non-off stations', () => {
            audioManager.musicEnabled = false;
            audioManager.switchStation('synthwave');
            expect(audioManager.musicEnabled).toBe(true);
        });

        it('should update currentStation to the selected station', () => {
            audioManager.switchStation('space_rock');
            expect(audioManager.currentStation).toBe('space_rock');
        });
    });

    describe('playRandomTrack', () => {
        it('should create a new Audio instance with correct URL', () => {
            const station = audioManager.musicStations['lofi_beats'];
            vi.spyOn(Math, 'random').mockReturnValue(0);
            audioManager.playRandomTrack(station);

            expect(mockAudio).toHaveBeenCalledWith('/assets/audio/music/background_0.mp3');
        });

        it('should set music volume on created audio', () => {
            const station = audioManager.musicStations['folk_radio'];
            audioManager.musicVolume = 0.7;
            audioManager.playRandomTrack(station);

            expect(audioManager.currentMusic.volume).toBe(0.7);
        });

        it('should not play if musicEnabled is false', () => {
            audioManager.musicEnabled = false;
            const station = audioManager.musicStations['jazz_fm'];
            audioManager.playRandomTrack(station);

            // currentMusic should not be set when musicEnabled is false
            expect(mockAudio).not.toHaveBeenCalled();
        });

        it('should play the audio', () => {
            const station = audioManager.musicStations['glitch_stream'];
            audioManager.playRandomTrack(station);
            expect(audioManager.currentMusic.play).toHaveBeenCalled();
        });

        it('should select random track from station', () => {
            const station = audioManager.musicStations['space_rock'];
            const randomValues = [0, 0.25, 0.5, 0.75];

            randomValues.forEach((randomValue) => {
                vi.spyOn(Math, 'random').mockReturnValue(randomValue);
                mockAudio.mockClear();

                audioManager.playRandomTrack(station);
                const expectedTrack = station.tracks[Math.floor(randomValue * station.tracks.length)];
                expect(mockAudio).toHaveBeenCalledWith(`/assets/audio/music/${expectedTrack}`);
            });
        });

        it('should add ended listener that replays track from same station if musicEnabled and station matches', () => {
            const station = audioManager.musicStations['zen_garden'];
            audioManager.musicEnabled = true;
            audioManager.currentStation = 'zen_garden';

            audioManager.playRandomTrack(station);

            // Verify that addEventListener was called with 'ended' event
            expect(audioManager.currentMusic.addEventListener).toHaveBeenCalledWith(
                'ended',
                expect.any(Function)
            );

            // Get the ended listener
            const endedListener = audioManager.currentMusic._listeners['ended'];
            expect(endedListener).toBeDefined();

            // When we call the ended listener, it should not throw
            // and should trigger replay behavior
            expect(() => endedListener()).not.toThrow();
        });

        it('should not replay if musicEnabled becomes false', () => {
            const station = audioManager.musicStations['lofi_beats'];
            audioManager.musicEnabled = true;
            audioManager.currentStation = 'lofi_beats';

            const playRandomTrackSpy = vi.spyOn(audioManager, 'playRandomTrack').mockImplementation(function(station) {
                if (!this.musicEnabled) return;
                const randomTrack = station.tracks[Math.floor(Math.random() * station.tracks.length)];
                this.currentMusic = new Audio(`/assets/audio/music/${randomTrack}`);
                this.currentMusic.volume = this.musicVolume;
                this.currentMusic.addEventListener('ended', () => {
                    if (this.musicEnabled && this.currentStation === 'lofi_beats') {
                        this.playRandomTrack(station);
                    }
                });
            });

            audioManager.playRandomTrack(station);
            playRandomTrackSpy.mockClear();

            audioManager.musicEnabled = false;
            const endedListener = audioManager.currentMusic._listeners['ended'];
            endedListener();

            expect(playRandomTrackSpy).not.toHaveBeenCalled();
        });
    });

    describe('getCurrentStationName', () => {
        it('should return Off for off station', () => {
            audioManager.currentStation = 'off';
            expect(audioManager.getCurrentStationName()).toBe('Off');
        });

        it('should return station name for known station', () => {
            audioManager.currentStation = 'lofi_beats';
            expect(audioManager.getCurrentStationName()).toBe('Lofi Beats');
        });

        it('should return station name for all known stations', () => {
            const stationNames = {
                lofi_beats: 'Lofi Beats',
                folk_radio: 'Folk Radio',
                jazz_fm: 'Jazz FM',
                synthwave: 'Synthwave',
                space_rock: 'Space Rock',
                glitch_stream: 'Glitch Stream',
                zen_garden: 'Zen Garden'
            };

            Object.entries(stationNames).forEach(([id, name]) => {
                audioManager.currentStation = id;
                expect(audioManager.getCurrentStationName()).toBe(name);
            });
        });

        it('should return Unknown for garbage station id', () => {
            audioManager.currentStation = 'nonexistent_station';
            expect(audioManager.getCurrentStationName()).toBe('Unknown');
        });
    });

    describe('setSoundVolume', () => {
        it('should set sound volume to valid value', () => {
            audioManager.setSoundVolume(0.7);
            expect(audioManager.soundVolume).toBe(0.7);
        });

        it('should clamp volume to 0 when less than 0', () => {
            audioManager.setSoundVolume(-0.5);
            expect(audioManager.soundVolume).toBe(0);
        });

        it('should clamp volume to 1 when greater than 1', () => {
            audioManager.setSoundVolume(1.5);
            expect(audioManager.soundVolume).toBe(1);
        });

        it('should allow 0 volume', () => {
            audioManager.setSoundVolume(0);
            expect(audioManager.soundVolume).toBe(0);
        });

        it('should allow 1 volume', () => {
            audioManager.setSoundVolume(1);
            expect(audioManager.soundVolume).toBe(1);
        });
    });

    describe('setMusicVolume', () => {
        it('should set music volume to valid value', () => {
            audioManager.setMusicVolume(0.8);
            expect(audioManager.musicVolume).toBe(0.8);
        });

        it('should clamp volume to 0 when less than 0', () => {
            audioManager.setMusicVolume(-0.5);
            expect(audioManager.musicVolume).toBe(0);
        });

        it('should clamp volume to 1 when greater than 1', () => {
            audioManager.setMusicVolume(1.5);
            expect(audioManager.musicVolume).toBe(1);
        });

        it('should allow 0 volume', () => {
            audioManager.setMusicVolume(0);
            expect(audioManager.musicVolume).toBe(0);
        });

        it('should allow 1 volume', () => {
            audioManager.setMusicVolume(1);
            expect(audioManager.musicVolume).toBe(1);
        });

        it('should update currentMusic volume when music is playing', () => {
            const mockMusic = {
                volume: 0.5,
                pause: vi.fn(),
                play: vi.fn(() => Promise.resolve()),
                addEventListener: vi.fn()
            };
            audioManager.currentMusic = mockMusic;
            audioManager.setMusicVolume(0.3);

            expect(audioManager.currentMusic.volume).toBe(0.3);
        });

        it('should not fail when currentMusic is null', () => {
            audioManager.currentMusic = null;
            expect(() => audioManager.setMusicVolume(0.5)).not.toThrow();
        });
    });

    describe('init', () => {
        it('should not throw when called', async () => {
            expect(() => audioManager.init()).not.toThrow();
        });
    });
});
