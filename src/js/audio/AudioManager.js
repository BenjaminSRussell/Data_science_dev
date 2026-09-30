/**
 * AudioManager - Handles game sounds and music
 */

export class AudioManager {
    constructor() {
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.sounds = {};
        this.currentMusic = null;
        this.currentStation = 'lofi_beats'; // Default station
        this.fadeIntervals = new Map(); // Track fade intervals for cleanup

        // Define stations and their tracks
        this.musicStations = {
            lofi_beats: {
                name: 'Lofi Beats',
                tracks: [
                    'background_0.mp3',
                    'background_1.mp3',
                    'background_2.mp3',
                    'background_3.mp3',
                    'background_4.mp3',
                    'background_5.mp3'
                ]
            },
            folk_radio: {
                name: 'Folk Radio',
                tracks: [
                    'background_folk.mp3',
                    'background_folk_1.mp3',
                    'background_folk_2.mp3',
                    'background_folk_3.mp3'
                ]
            },
            jazz_fm: {
                name: 'Jazz FM',
                tracks: [
                    'background_jazz.mp3',
                    'background_jazz_2.mp3'
                ]
            },
            synthwave: {
                name: 'Synthwave',
                tracks: [
                    'background_night_cruise.mp3',
                    'background_night_cruise_2.mp3'
                ]
            },
            space_rock: {
                name: 'Space Rock',
                tracks: [
                    'background_space_rock_1.mp3',
                    'background_space_rock_2.mp3',
                    'background_space_rock_3.mp3',
                    'background_space_rock_4.mp3'
                ]
            },
            glitch_stream: {
                name: 'Glitch Stream',
                tracks: [
                    'background_glitch.mp3',
                    'background_glitch_2.mp3'
                ]
            },
            zen_garden: {
                name: 'Zen Garden',
                tracks: [
                    'background_yoga.mp3',
                    'background_yoga_2.mp3'
                ]
            }
        };

        this.musicVolume = 0.5;
        this.soundVolume = 0.5;

        // We'll use simple Audio API for now
        // In production, consider Howler.js for better control
    }

    /**
     * Fade out audio and pause it
     * @param {HTMLAudioElement} audio - The audio element to fade out
     * @param {number} duration - Fade duration in milliseconds (default 500)
     * @returns {Promise<void>} - Resolves when fade is complete
     */
    async fadeOutAndStop(audio, duration = 500) {
        if (!audio) return;

        // Clear any existing fade interval for this audio element
        const fadeKey = `fadeOut_${Math.random()}`;
        const startVolume = audio.volume;
        const startTime = Date.now();

        return new Promise(resolve => {
            const intervalId = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                audio.volume = startVolume * (1 - progress);

                if (progress >= 1) {
                    clearInterval(intervalId);
                    audio.volume = 0;
                    audio.pause();
                    resolve();
                }
            }, 16); // ~60fps

            this.fadeIntervals.set(fadeKey, intervalId);
        });
    }

    /**
     * Fade in audio
     * @param {HTMLAudioElement} audio - The audio element to fade in
     * @param {number} targetVolume - Target volume to fade to (default musicVolume)
     * @param {number} duration - Fade duration in milliseconds (default 500)
     * @returns {Promise<void>} - Resolves when fade is complete
     */
    async fadeIn(audio, targetVolume, duration = 500) {
        if (!audio) return;

        audio.volume = 0;
        const startTime = Date.now();

        return new Promise(resolve => {
            const intervalId = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                audio.volume = targetVolume * progress;

                if (progress >= 1) {
                    clearInterval(intervalId);
                    audio.volume = targetVolume;
                    resolve();
                }
            }, 16); // ~60fps

            const fadeKey = `fadeIn_${Math.random()}`;
            this.fadeIntervals.set(fadeKey, intervalId);
        });
    }

    /**
     * Clear all active fades
     */
    clearActiveFades() {
        this.fadeIntervals.forEach(intervalId => {
            clearInterval(intervalId);
        });
        this.fadeIntervals.clear();
    }

    /**
     * Initialize audio manager
     */
    async init() {
        // Preload common sounds (if any)

        // Set default station but don't auto-play unless enabled
        // this.switchStation(this.currentStation);
    }

    /**
     * Play a sound effect
     */
    play(soundName) {
        if (!this.soundEnabled) return;

        // Map sound names to frequencies for simple beeps
        // In production, replace with actual audio files
        const sounds = {
            click: { freq: 800, duration: 50 },
            success: { freq: 880, duration: 150 },
            fail: { freq: 220, duration: 200 },
            complete: { freq: 660, duration: 100 },
            start: { freq: 440, duration: 100 },
            purchase: { freq: 1000, duration: 75 },
            promotion: { freq: 523, duration: 200 },
            kaching: { freq: 1200, duration: 100 },
            error: { freq: 150, duration: 300 }
        };

        const sound = sounds[soundName];
        if (sound) {
            this.playTone(sound.freq, sound.duration);
        }
    }

    /**
     * Play a simple tone using Web Audio API
     */
    playTone(frequency, duration) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(this.soundVolume * 0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (e) {
            // Audio not supported or blocked
        }
    }

    /**
     * Toggle sound effects
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    /**
     * Toggle background music
     */
    async toggleMusic() {
        this.musicEnabled = !this.musicEnabled;

        if (this.currentMusic) {
            if (this.musicEnabled) {
                this.currentMusic.play().catch(e => console.log('Audio play failed:', e));
            } else {
                await this.fadeOutAndStop(this.currentMusic, 500);
            }
        } else if (this.musicEnabled && this.currentStation !== 'off') {
            await this.switchStation(this.currentStation);
        }

        return this.musicEnabled;
    }

    /**
     * Switch to a different music station
     */
    async switchStation(stationId) {
        // Stop current music with fade-out
        if (this.currentMusic) {
            await this.fadeOutAndStop(this.currentMusic, 500);
            this.currentMusic = null;
        }

        if (stationId === 'off') {
            this.currentStation = 'off';
            this.musicEnabled = false;
            return;
        }

        this.currentStation = stationId;
        this.musicEnabled = true;

        const station = this.musicStations[stationId];
        if (station && station.tracks && station.tracks.length > 0) {
            await this.playRandomTrack(station);
        }
    }

    async playRandomTrack(station) {
        if (!this.musicEnabled) return;

        const randomTrack = station.tracks[Math.floor(Math.random() * station.tracks.length)];
        const url = `/assets/audio/music/${randomTrack}`;

        this.currentMusic = new Audio(url);
        this.currentMusic.volume = 0; // Start at 0 for fade-in

        // When track ends, play another one from the same station
        this.currentMusic.addEventListener('ended', () => {
            if (this.musicEnabled && this.currentStation === Object.keys(this.musicStations).find(key => this.musicStations[key] === station)) {
                this.playRandomTrack(station);
            }
        });

        try {
            await this.currentMusic.play();
            // Fade in after play starts
            await this.fadeIn(this.currentMusic, this.musicVolume, 500);
        } catch (e) {
            console.log('Audio play failed (interaction likely needed):', e);
        }
    }

    /**
     * Get current station name
     */
    getCurrentStationName() {
        if (this.currentStation === 'off') {
            return 'Off';
        }
        return this.musicStations[this.currentStation]?.name || 'Unknown';
    }

    /**
     * Set sound volume
     */
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Set music volume with fade
     */
    async setMusicVolume(volume) {
        const targetVolume = Math.max(0, Math.min(1, volume));
        this.musicVolume = targetVolume;

        if (this.currentMusic) {
            // Fade to the new volume over 300ms (shorter than track transitions)
            const startVolume = this.currentMusic.volume;
            const startTime = Date.now();
            const duration = 300;

            return new Promise(resolve => {
                const intervalId = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    this.currentMusic.volume = startVolume + (targetVolume - startVolume) * progress;

                    if (progress >= 1) {
                        clearInterval(intervalId);
                        this.currentMusic.volume = targetVolume;
                        resolve();
                    }
                }, 16); // ~60fps

                const fadeKey = `fadeVolume_${Math.random()}`;
                this.fadeIntervals.set(fadeKey, intervalId);
            });
        }
    }
}
