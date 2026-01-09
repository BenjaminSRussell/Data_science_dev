/**
 * EnvironmentManager - Handles dynamic backgrounds, locations, and visual effects
 */

import { OFFICE_LOCATIONS, TIME_OF_DAY, WEATHER_EFFECTS, OFFICE_EVENTS } from '../data/locations.js';

export class EnvironmentManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentLocation = null;
        this.currentTimeOfDay = null;
        this.currentWeather = null;
        this.activeEvent = null;
        this.eventTimeout = null;
        this.timeUpdateInterval = null;
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
     * Update office location based on rank
     */
    updateLocation() {
        const rankIndex = this.gameState.rankIndex;

        // Find the highest unlocked location
        let newLocation = OFFICE_LOCATIONS[0];
        for (const location of OFFICE_LOCATIONS) {
            if (rankIndex >= location.rankRequired) {
                newLocation = location;
            }
        }

        if (this.currentLocation?.id !== newLocation.id) {
            this.currentLocation = newLocation;
            this.applyLocationStyles();

            // Show unlock message if it's a new location
            if (this.gameState.tasksCompleted > 0) {
                this.showLocationUnlock(newLocation);
            }
        }

        return this.currentLocation;
    }

    /**
     * Apply location-specific styles
     */
    applyLocationStyles() {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer || !this.currentLocation) return;

        // Apply background gradient
        document.body.style.background = this.currentLocation.background;
        document.body.style.backgroundAttachment = 'fixed';

        // Update location indicator
        this.updateLocationIndicator();

        // Add floating elements
        this.createFloatingElements();
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
     * Update time of day based on real clock
     */
    updateTimeOfDay() {
        const hour = new Date().getHours();

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
        if (window.game?.showToast) {
            window.game.showToast(` New Location Unlocked: ${location.name}!`, 'success');
        }
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
