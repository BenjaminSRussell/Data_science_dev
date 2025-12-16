/**
 * DayNightCycle.js
 * Manages day/night cycle with morning, noon, night
 * Changes map appearance based on time
 */

export const TIME_OF_DAY = {
    MORNING: 'morning',
    NOON: 'noon',
    NIGHT: 'night'
};

export class DayNightCycle {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentTimeOfDay = TIME_OF_DAY.MORNING;
        this.onTimeChange = null;
    }
    
    /**
     * Get current time of day based on time slot
     */
    getTimeOfDay() {
        if (!this.gameState.timeManager) {
            return TIME_OF_DAY.MORNING;
        }
        
        const slot = this.gameState.timeManager.timeSlot;
        
        // Morning: slots 0-1 (early morning, late morning)
        if (slot <= 1) {
            return TIME_OF_DAY.MORNING;
        }
        // Noon: slots 2-3 (afternoon, late afternoon)
        else if (slot <= 3) {
            return TIME_OF_DAY.NOON;
        }
        // Night: slots 4-5 (evening, night)
        else {
            return TIME_OF_DAY.NIGHT;
        }
    }
    
    /**
     * Update time of day and trigger changes
     */
    update() {
        const newTimeOfDay = this.getTimeOfDay();
        
        if (newTimeOfDay !== this.currentTimeOfDay) {
            const oldTime = this.currentTimeOfDay;
            this.currentTimeOfDay = newTimeOfDay;
            
            // Trigger time change event
            if (this.onTimeChange) {
                this.onTimeChange(oldTime, newTimeOfDay);
            }
            
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
    
    /**
     * Get background color for current time
     */
    getBackgroundColor() {
        switch (this.currentTimeOfDay) {
            case TIME_OF_DAY.MORNING:
                return '#1a2332'; // Soft blue-gray
            case TIME_OF_DAY.NOON:
                return '#0f172a'; // Dark blue
            case TIME_OF_DAY.NIGHT:
                return '#0a0f1a'; // Very dark
            default:
                return '#0f172a';
        }
    }
    
    /**
     * Get map overlay color
     */
    getMapOverlay() {
        switch (this.currentTimeOfDay) {
            case TIME_OF_DAY.MORNING:
                return 'rgba(255, 248, 220, 0.05)'; // Soft warm
            case TIME_OF_DAY.NOON:
                return 'rgba(255, 255, 255, 0.02)'; // Bright
            case TIME_OF_DAY.NIGHT:
                return 'rgba(0, 0, 0, 0.3)'; // Dark
            default:
                return 'transparent';
        }
    }
}

