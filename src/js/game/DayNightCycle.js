/**
 * DayNightCycle.js
 * Manages day/night cycle with morning, noon, night
 * Changes map appearance based on time
 */

export class DayNightCycle {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentTimeOfDay = 'morning';
    }

    /**
     * Get current time of day based on time slot
     */
    getTimeOfDay() {
        if (!this.gameState.timeManager) {
            return 'morning';
        }

        const slot = this.gameState.timeManager?.timeSlot;

        // Morning: slots 0-1 (early morning, late morning)
        if (slot <= 1) {
            return 'morning';
        }
        // Noon: slots 2-3 (afternoon, late afternoon)
        else if (slot <= 3) {
            return 'noon';
        }
        // Night: slots 4-5 (evening, night)
        else {
            return 'night';
        }
    }

    /**
     * Update time of day and trigger changes
     */
    update() {
        const newTimeOfDay = this.getTimeOfDay();

        if (newTimeOfDay !== this.currentTimeOfDay) {
            this.currentTimeOfDay = newTimeOfDay;

            // Update map appearance
            this.updateMapAppearance();

            // Update body class for CSS
            document.body.className = document.body.className
                .replace(/time-morning|time-noon|time-night/g, '')
                .trim();
            document.body.classList.add(`time-${newTimeOfDay}`);
        }
    }

    /**
     * Update map appearance based on time
     */
    updateMapAppearance() {
        const mapContainer = document.querySelector('.map-container');
        if (!mapContainer) return;

        // Remove old time classes
        mapContainer.classList.remove('time-morning', 'time-noon', 'time-night');
        mapContainer.classList.add(`time-${this.currentTimeOfDay}`);
    }
}

