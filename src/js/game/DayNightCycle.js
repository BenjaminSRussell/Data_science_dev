/**
 * DayNightCycle.js
 * Manages day/night cycle with morning, noon, night
 * Changes map appearance based on time
 */

import { dayPhaseForSlot } from './TimeManager.js';

export class DayNightCycle {
    constructor(gameState) {
        this.gameState = gameState;
        // null so the first update() applies the classes even in the morning
        this.currentTimeOfDay = null;
    }

    static PHASE_TO_LOOK = { morning: 'morning', afternoon: 'noon', evening: 'night', night: 'night' };

    /**
     * Get current time of day based on time slot
     */
    getTimeOfDay() {
        if (!this.gameState.timeManager) {
            return 'morning';
        }

        // The map only themes three looks; fold the shared four-phase mapping
        // from TimeManager.js into them (#924)
        const phase = dayPhaseForSlot(this.gameState.timeManager?.timeSlot) ?? 'morning';
        return DayNightCycle.PHASE_TO_LOOK[phase];
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
            document.body.classList.remove('time-morning', 'time-noon', 'time-night');
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

