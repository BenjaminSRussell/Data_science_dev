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
        this.musicStations = {
            lofi_beats: {
                name: 'Lofi Beats',
                url: null, // Will be set when audio files are added
                audio: null
            }
        };

        // We'll use simple Audio API for now
        // In production, consider Howler.js for better control
    }

    /**
     * Initialize audio manager
     */
    async init() {
        // Preload common sounds
        // Note: In a real implementation, you'd have actual audio files
        console.log(' Audio Manager initialized');
        
        // Set default station
        this.switchStation(this.currentStation);
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
            promotion: { freq: 523, duration: 200 }
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

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
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
        console.log(` Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
        return this.soundEnabled;
    }

    /**
     * Toggle background music
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;

        if (this.currentMusic) {
            if (this.musicEnabled) {
                this.currentMusic.play();
            } else {
                this.currentMusic.pause();
            }
        }

        console.log(` Music ${this.musicEnabled ? 'enabled' : 'disabled'}`);
        return this.musicEnabled;
    }

    /**
     * Switch to a different music station
     */
    switchStation(stationId) {
        // Stop current music
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic = null;
        }

        if (stationId === 'off') {
            this.currentStation = 'off';
            this.musicEnabled = false;
            console.log(' Radio turned off');
            return;
        }

        this.currentStation = stationId;
        this.musicEnabled = true;

        const station = this.musicStations[stationId];
        if (station) {
            // For now, just log - in production, load and play actual audio
            console.log(` Tuned to: ${station.name}`);
            
            // When audio files are available, uncomment this:
            // if (station.url) {
            //     this.currentMusic = new Audio(station.url);
            //     this.currentMusic.loop = true;
            //     this.currentMusic.volume = this.musicVolume || 0.5;
            //     this.currentMusic.play().catch(e => console.log('Audio play failed:', e));
            // }
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
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }
}
