/**
 * EnvironmentManager - Handles dynamic backgrounds, locations, and visual effects
 */

import { OFFICE_LOCATIONS, TIME_OF_DAY, WEATHER_EFFECTS, OFFICE_EVENTS } from '../data/locations.js';
import { slotStartHour } from './TimeManager.js';

export class EnvironmentManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentLocation = null;
        this.currentTimeOfDay = null;
        this.currentWeather = null;
        this.activeEvent = null;
        this.eventTimeout = null;
        this.timeUpdateInterval = null;
        // The first location sync after construction/load is not an unlock (#1182)
        this.hasInitialized = false;
    }

    /**
     * Initialize environment based on current game state
     */
    init() {
        try {
            this.updateLocation();
            this.updateTimeOfDay();
            this.updateWeather();
            // DISABLED: Auto-progression removed - game requires manual button clicks
            // this.startEventTimer();

            // DISABLED: Automatic time updates - game should not auto-progress
            // User must manually advance time
            // this.timeUpdateInterval = setInterval(() => {
            //     this.updateTimeOfDay();
            // }, 60000);
        } catch (error) {
            console.error('EnvironmentManager init failed:', error);
        }
    }

    /**
     * Highest office the rank has unlocked. Hidden decorative entries are
     * never picked by rank (#74).
     * @param {number} rankIndex
     */
    static locationForRank(rankIndex = 0) {
        let best = OFFICE_LOCATIONS[0];
        for (const location of OFFICE_LOCATIONS) {
            if (location.hidden) continue;
            if ((rankIndex || 0) >= location.rankRequired && location.rankRequired >= best.rankRequired) {
                best = location;
            }
        }
        return best;
    }

    /**
     * Update office location based on rank
     * @param {string} [locationId] - force a specific office (dev tools, #2177)
     * @returns {Object|null} the current location, or null for an unknown id
     */
    updateLocation(locationId) {
        let newLocation;
        if (locationId !== undefined && locationId !== null) {
            newLocation = OFFICE_LOCATIONS.find(l => l.id === locationId);
            if (!newLocation) return null;
        } else {
            newLocation = EnvironmentManager.locationForRank(this.gameState.rankIndex);
        }

        const isFirstSync = !this.hasInitialized;
        this.hasInitialized = true;

        if (this.currentLocation?.id !== newLocation.id) {
            const previous = this.currentLocation;
            this.currentLocation = newLocation;
            this.applyLocationStyles();

            // Only a real promotion counts as an unlock: not the first sync
            // after loading a save, and not a forced dev-tool switch (#1182)
            const promoted = !isFirstSync && !locationId &&
                (newLocation.rankRequired > (previous?.rankRequired ?? -1));
            if (promoted && this.gameState.tasksCompleted > 0) {
                this.showLocationUnlock(newLocation);
            }
        }

        return this.currentLocation;
    }

    /**
     * Apply location-specific styles
     */
    applyLocationStyles() {
        // Everything below styles document.body, so only the location
        // matters; #game-container being absent is no reason to skip (#1186)
        if (!this.currentLocation || typeof document === 'undefined' || !document.body) return;

        // Apply background. ScreenThemeManager composes this with the screen
        // gradient so the two don't overwrite each other (#1731)
        document.body.style.background = this.getBackground() || this.currentLocation.background;
        document.body.style.backgroundAttachment = 'fixed';

        // Update location indicator
        this.updateLocationIndicator();

        // Add floating elements
        this.createFloatingElements();
    }

    /**
     * Office background layered over an optional screen gradient (#1731)
     * @param {string} [gradient]
     */
    getBackground(gradient) {
        const bg = this.currentLocation?.background;
        if (!bg) return gradient || '';
        if (!gradient) return bg;
        // url() images go on top, sized to cover; the gradient shows behind
        return /^url\(/.test(bg) ? `${bg} center / cover no-repeat, ${gradient}` : bg;
    }

    /**
     * Update location name in UI
     */
    updateLocationIndicator() {
        let indicator = document.getElementById('location-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'location-indicator';
            indicator.className = 'location-indicator';
            document.querySelector('.top-bar-left')?.appendChild(indicator);
        }

        indicator.innerHTML = `
            <span class="location-icon">${this.currentLocation.ambiance}</span>
            <span class="location-name">${this.currentLocation.name}</span>
        `;
    }

    /**
     * Create floating background elements
     */
    createFloatingElements() {
        // Remove existing floating elements
        document.querySelectorAll('.env-floating-element').forEach(el => el.remove());

        const container = document.body;
        const elements = this.currentLocation.elements;

        elements.forEach((element, index) => {
            const el = document.createElement('div');
            el.className = 'env-floating-element';
            el.textContent = element;
            el.style.cssText = `
                position: fixed;
                font-size: ${2 + Math.random() * 2}rem;
                opacity: 0.08;
                pointer-events: none;
                z-index: 0;
                animation: envFloat ${15 + Math.random() * 10}s ease-in-out infinite;
                animation-delay: ${-index * 3}s;
                left: ${10 + Math.random() * 80}%;
                top: ${10 + Math.random() * 80}%;
            `;
            container.appendChild(el);
        });
    }

    /**
     * Hour of the in-game day: the start of the current TimeManager slot
     * (6, 9, 12, 15, 18, 21). Falls back to the real clock only when there
     * is no TimeManager (#921).
     */
    getGameHour() {
        const tm = this.gameState?.timeManager;
        if (tm && Number.isFinite(tm.timeSlot)) {
            return slotStartHour(tm.timeSlot);
        }
        return new Date().getHours();
    }

    /**
     * Update time of day from the in-game clock (#921)
     */
    updateTimeOfDay() {
        const hour = this.getGameHour();

        for (const time of TIME_OF_DAY) {
            if (time.hours.includes(hour)) {
                if (this.currentTimeOfDay?.id !== time.id) {
                    this.currentTimeOfDay = time;
                    this.applyTimeOfDayStyles();
                }
                break;
            }
        }

        return this.currentTimeOfDay;
    }

    /**
     * Apply time-of-day overlay
     */
    applyTimeOfDayStyles() {
        let overlay = document.getElementById('time-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'time-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 0;
                transition: background-color 2s ease;
            `;
            document.body.appendChild(overlay);
        }

        if (this.currentTimeOfDay) {
            overlay.style.backgroundColor = this.currentTimeOfDay.overlay;
        }

        // Update greeting if on game screen
        this.updateGreeting();
    }

    /**
     * Update boss greeting based on time
     */
    updateGreeting() {
        const dialogueEl = document.getElementById('boss-dialogue');
        if (dialogueEl && this.gameState.currentTask === null && this.currentTimeOfDay) {
            // Only update if no active task
            const p = dialogueEl.querySelector('p');
            if (p) {
                p.textContent = this.currentTimeOfDay.greeting;
            }
        }
    }

    /**
     * Pick random weather
     */
    updateWeather() {
        const totalWeight = WEATHER_EFFECTS.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;

        for (const weather of WEATHER_EFFECTS) {
            random -= weather.weight;
            if (random <= 0) {
                this.currentWeather = weather;
                this.applyWeatherStyles();
                break;
            }
        }

        return this.currentWeather;
    }

    /**
     * Apply weather visual effects
     */
    applyWeatherStyles() {
        // Remove existing weather effects
        document.querySelectorAll('.weather-effect').forEach(el => el.remove());

        // Rain and snow effects disabled per user request
        // if (this.currentWeather.id === 'rainy') {
        //     this.createRainEffect();
        // } else if (this.currentWeather.id === 'snowy') {
        //     this.createSnowEffect();
        // }

        // Update weather indicator
        let indicator = document.getElementById('weather-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.id = 'weather-indicator';
            indicator.style.cssText = 'margin-left: 8px; font-size: 1rem;';
            document.querySelector('.top-bar-left')?.appendChild(indicator);
        }
        if (this.currentWeather) {
            indicator.textContent = this.currentWeather.icon;
        }
    }

    /**
     * Create rain animation
     */
    createRainEffect() {
        const container = document.createElement('div');
        container.className = 'weather-effect rain-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;

        for (let i = 0; i < 50; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.cssText = `
                position: absolute;
                width: 2px;
                height: ${10 + Math.random() * 20}px;
                background: linear-gradient(transparent, rgba(100, 150, 255, 0.3));
                left: ${Math.random() * 100}%;
                top: -20px;
                animation: rainFall ${0.5 + Math.random() * 0.5}s linear infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            container.appendChild(drop);
        }

        document.body.appendChild(container);
    }

    /**
     * Create snow animation
     */
    createSnowEffect() {
        const container = document.createElement('div');
        container.className = 'weather-effect snow-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;

        for (let i = 0; i < 30; i++) {
            const flake = document.createElement('div');
            flake.textContent = '❄';
            flake.style.cssText = `
                position: absolute;
                color: rgba(255, 255, 255, 0.6);
                font-size: ${8 + Math.random() * 12}px;
                left: ${Math.random() * 100}%;
                top: -20px;
                animation: snowFall ${3 + Math.random() * 4}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(flake);
        }

        document.body.appendChild(container);
    }

    /**
     * Start random event timer
     */
    startEventTimer() {
        // Random event every 2-5 minutes
        const triggerEvent = () => {
            if (Math.random() < 0.3) { // 30% chance
                this.triggerRandomEvent();
            }

            // Schedule next check
            const delay = 120000 + Math.random() * 180000; // 2-5 minutes
            this.eventTimeout = setTimeout(triggerEvent, delay);
        };

        // First event after 1 minute
        this.eventTimeout = setTimeout(triggerEvent, 60000);
    }

    /**
     * Trigger a random office event
     */
    triggerRandomEvent() {
        if (this.activeEvent) return; // Already have an event

        const event = OFFICE_EVENTS[Math.floor(Math.random() * OFFICE_EVENTS.length)];
        this.activeEvent = event;

        // Show event notification
        this.showEventNotification(event);

        // Clear after duration
        setTimeout(() => {
            this.activeEvent = null;
        }, event.duration);
    }

    /**
     * Show event notification
     */
    showEventNotification(event) {
        const notification = document.createElement('div');
        notification.className = 'event-notification animate-slide-in-right';
        notification.innerHTML = `
            <span class="event-icon">${event.icon}</span>
            <div class="event-content">
                <strong>${event.name}</strong>
                <p>${event.description}</p>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--glass-bg);
            backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 200;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    /**
     * Show location unlock message
     */
    showLocationUnlock(location) {
        // Similar to event notification but more celebratory
        // Each location has its own unlockMessage; the generic line is only a fallback (#2176)
        const message = location?.unlockMessage || `New Location Unlocked: ${location?.name}!`;
        if (window.game?.showToast) {
            window.game.showToast(message, 'success');
        }
        return message;
    }

    /**
     * Get current environment state
     */
    getState() {
        return {
            location: this.currentLocation,
            timeOfDay: this.currentTimeOfDay,
            weather: this.currentWeather,
            activeEvent: this.activeEvent
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.eventTimeout) {
            clearTimeout(this.eventTimeout);
        }
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
        }
        document.querySelectorAll('.env-floating-element, .weather-effect').forEach(el => el.remove());
    }
}
