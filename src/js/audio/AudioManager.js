/**
 * AudioManager - Handles game sounds and music
 */

export class AudioManager {
    /** Station crossfade length and step (#1291) */
    static FADE_MS = 400;
    static FADE_STEP_MS = 40;

    constructor() {
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.currentMusic = null;
        this.currentStation = 'lofi_beats'; // Default station

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

        // Restore the last radio station the player picked (#1236). Nothing
        // auto-plays here; browsers need a user gesture first.
        const savedStation = AudioManager.loadStation();
        if (savedStation === 'off') {
            this.currentStation = 'off';
            this.musicEnabled = false;
        } else if (savedStation && this.musicStations[savedStation]) {
            this.currentStation = savedStation;
        }

        // We'll use simple Audio API for now
        // In production, consider Howler.js for better control
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
        // Returns true when a sound was played, so callers can chain fallbacks (#2250)
        if (!this.soundEnabled) return false;

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
            keyboard_typing: { freq: 1500, duration: 20 },
            expense: { freq: 330, duration: 160 },
            error: { freq: 150, duration: 300 }
        };

        const sound = sounds[soundName];
        if (sound) {
            this.playTone(sound.freq, sound.duration);
            return true;
        }
        return false;
    }

    /**
     * Play a simple tone using Web Audio API
     */
    playTone(frequency, duration) {
        try {
            const audioContext = this.getAudioContext();
            if (!audioContext) return;
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
     * One shared AudioContext for every beep. Creating a new context per
     * sound hits the browser's context limit after a handful of sounds and
     * leaks audio threads (#273)
     */
    getAudioContext() {
        if (!this.audioContext || this.audioContext.state === 'closed') {
            const Ctx = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
            if (!Ctx) return null;
            this.audioContext = new Ctx();
        }
        // Contexts start suspended until a user gesture; resume on use
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume?.().catch?.(() => {});
        }
        return this.audioContext;
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
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;

        if (this.musicEnabled && (this.currentStation === 'off' || !this.musicStations[this.currentStation])) {
            // Turning music back on after the radio was switched off picks a
            // real station again instead of staying silent forever (#1289)
            this.switchStation(AudioManager.DEFAULT_STATION);
        } else if (this.currentMusic) {
            if (this.musicEnabled) {
                this.currentMusic.play().catch(e => console.log('Audio play failed:', e));
            } else {
                this.currentMusic.pause();
            }
        } else if (this.musicEnabled) {
            this.switchStation(this.currentStation);
        }

        return this.musicEnabled;
    }

    /**
     * Switch to a different music station
     */
    switchStation(stationId) {
        // Re-selecting the station that is already playing keeps the current
        // track instead of restarting with a new random one (#1293)
        if (stationId === this.currentStation && this.currentMusic && !this.currentMusic.paused && this.musicEnabled) {
            return;
        }

        // Fade the old track out while the new one fades in (#1291)
        this.stopCurrentMusic({ fade: true });

        if (stationId === 'off') {
            this.currentStation = 'off';
            this.musicEnabled = false;
            AudioManager.saveStation('off');
            return;
        }

        this.currentStation = stationId;
        if (this.musicStations[stationId]) AudioManager.saveStation(stationId);
        this.musicEnabled = true;
        this.trackFailures = 0;

        const station = this.musicStations[stationId];
        if (station && station.tracks && station.tracks.length > 0) {
            this.playRandomTrack(station);
        }
    }

    /**
     * Stop the playing track and release its media resources, so switching
     * stations doesn't keep old elements buffering in the background (#1290)
     */
    stopCurrentMusic({ fade = false } = {}) {
        const audio = this.currentMusic;
        this.currentMusic = null;
        if (!audio) return;
        if (fade && !audio.paused && AudioManager.FADE_MS > 0) {
            this.fadeVolume(audio, 0, AudioManager.FADE_MS, () => AudioManager.releaseAudio(audio));
            return;
        }
        AudioManager.releaseAudio(audio);
    }

    /**
     * Ramp an element's volume to `target` over `ms`, then call `done` (#1291)
     */
    fadeVolume(audio, target, ms, done) {
        const steps = Math.max(1, Math.round(ms / AudioManager.FADE_STEP_MS));
        const start = Number(audio.volume) || 0;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            try {
                audio.volume = Math.max(0, Math.min(1, start + (target - start) * (step / steps)));
            } catch {
                // Element released mid-fade
            }
            if (step >= steps) {
                clearInterval(timer);
                done?.();
            }
        }, AudioManager.FADE_STEP_MS);
        return timer;
    }

    /** Pause and release an element's media resources (#1290) */
    static releaseAudio(audio) {
        try {
            audio.pause();
            audio.removeAttribute?.('src');
            audio.load?.();
        } catch {
            // Element already released
        }
    }

    /**
     * Pick a track from the station, avoiding the one that just played (#1288)
     */
    pickTrack(station, exclude = []) {
        const tracks = station.tracks || [];
        const avoid = new Set(exclude.filter(Boolean));
        const candidates = tracks.filter(track => !avoid.has(track));
        const pool = candidates.length > 0 ? candidates : tracks;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    playRandomTrack(station, exclude = []) {
        if (!this.musicEnabled || !station?.tracks?.length) return;

        const stationId = Object.keys(this.musicStations).find(key => this.musicStations[key] === station);
        const track = this.pickTrack(station, [this.lastTrack, ...exclude]);
        this.lastTrack = track;
        const url = `/assets/audio/music/${track}`;

        const audio = new Audio(url);
        // Start silent and fade in, so a station switch blends (#1291)
        audio.volume = AudioManager.FADE_MS > 0 ? 0 : this.musicVolume;
        this.currentMusic = audio;
        if (AudioManager.FADE_MS > 0) {
            audio.addEventListener('playing', () => {
                if (this.currentMusic === audio) this.fadeVolume(audio, this.musicVolume, AudioManager.FADE_MS);
            }, { once: true });
        }
        const isCurrent = () => this.currentMusic === audio && this.musicEnabled && this.currentStation === stationId;

        audio.addEventListener('playing', () => {
            if (this.currentMusic === audio) this.trackFailures = 0;
        });

        // When track ends, play another one from the same station
        audio.addEventListener('ended', () => {
            if (isCurrent()) this.playRandomTrack(station);
        });

        // A track that fails to load moves on to another one instead of
        // silently killing the station; give up once every track has failed (#860)
        audio.addEventListener('error', () => {
            if (!isCurrent()) return;
            this.trackFailures = (this.trackFailures || 0) + 1;
            if (this.trackFailures < station.tracks.length) {
                this.playRandomTrack(station, [track]);
            } else {
                console.log(`All tracks failed to load for station ${stationId}`);
                this.stopCurrentMusic();
            }
        });

        const playing = audio.play();
        playing?.catch?.(e => {
            console.log('Audio play failed (interaction likely needed):', e);
        });
    }

    /**
     * Every music track URL, for asset validation
     */
    getTrackUrls() {
        return Object.values(this.musicStations)
            .flatMap(station => station.tracks || [])
            .map(track => `/assets/audio/music/${track}`);
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

AudioManager.DEFAULT_STATION = 'lofi_beats';

AudioManager.STATION_KEY = 'musicStation';
AudioManager.loadStation = function loadStation() {
    try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(AudioManager.STATION_KEY) : null;
    } catch {
        return null;
    }
};
AudioManager.saveStation = function saveStation(stationId) {
    try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(AudioManager.STATION_KEY, stationId);
    } catch {
        // storage unavailable
    }
};
