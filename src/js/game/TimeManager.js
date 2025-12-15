/**
 * Time System - Day/night cycle and time slot management
 * Each day has 6 time slots, activities consume time
 */

// Time slot definitions
export const TIME_SLOTS = [
    { id: 'early_morning', name: 'Early Morning', icon: '🌅', hours: '6:00 - 9:00', index: 0 },
    { id: 'late_morning', name: 'Late Morning', icon: '☀️', hours: '9:00 - 12:00', index: 1 },
    { id: 'afternoon', name: 'Afternoon', icon: '🌤️', hours: '12:00 - 15:00', index: 2 },
    { id: 'late_afternoon', name: 'Late Afternoon', icon: '🌇', hours: '15:00 - 18:00', index: 3 },
    { id: 'evening', name: 'Evening', icon: '🌆', hours: '18:00 - 21:00', index: 4 },
    { id: 'night', name: 'Night', icon: '🌙', hours: '21:00 - 00:00', index: 5 }
];

// Days of the week
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Months
export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * TimeManager class - handles game time progression
 */
export class TimeManager {
    constructor() {
        // Start at Day 1, Monday, January, Year 1
        this.day = 1;           // Day of month (1-30)
        this.dayOfWeek = 0;     // 0 = Monday
        this.month = 0;         // 0 = January
        this.year = 1;
        this.timeSlot = 0;      // Current time slot (0-5)

        // Track total days played
        this.totalDays = 1;

        // Energy system
        this.energy = 100;
        this.maxEnergy = 100;

        // Event callbacks
        this.onTimeAdvance = null;
        this.onDayChange = null;
        this.onMonthChange = null;
        this.onYearChange = null;
    }

    /**
     * Get current time slot info
     */
    getCurrentSlot() {
        return TIME_SLOTS[this.timeSlot];
    }

    /**
     * Get formatted date string
     */
    getDateString() {
        return `${DAYS[this.dayOfWeek]}, ${MONTHS[this.month]} ${this.day}, Year ${this.year}`;
    }

    /**
     * Get short date
     */
    getShortDate() {
        return `${MONTHS[this.month].slice(0, 3)} ${this.day}, Y${this.year}`;
    }

    /**
     * Get time of day
     */
    getTimeOfDay() {
        return TIME_SLOTS[this.timeSlot].name;
    }

    /**
     * Check if it's a weekend
     */
    isWeekend() {
        return this.dayOfWeek >= 5; // Saturday or Sunday
    }

    /**
     * Get remaining time slots today
     */
    getRemainingSlots() {
        return 6 - this.timeSlot;
    }

    /**
     * Advance time by N slots
     */
    advanceTime(slots = 1) {
        const events = [];

        for (let i = 0; i < slots; i++) {
            this.timeSlot++;

            // Check for day change
            if (this.timeSlot >= 6) {
                this.timeSlot = 0;
                events.push(...this.advanceDay());
            }

            if (this.onTimeAdvance) {
                this.onTimeAdvance(this.getCurrentSlot());
            }
        }

        return events;
    }

    /**
     * Advance to next day
     */
    advanceDay() {
        const events = [];

        this.day++;
        this.dayOfWeek = (this.dayOfWeek + 1) % 7;
        this.totalDays++;

        // Restore energy on new day
        this.energy = Math.min(this.maxEnergy, this.energy + 50);

        // Check for month change (30 days per month)
        if (this.day > 30) {
            this.day = 1;
            events.push(...this.advanceMonth());
        }

        if (this.onDayChange) {
            this.onDayChange({
                day: this.day,
                dayOfWeek: DAYS[this.dayOfWeek],
                isWeekend: this.isWeekend()
            });
        }

        events.push({ type: 'new_day', data: { day: this.totalDays } });

        // Check for new week (Monday)
        if (this.dayOfWeek === 0) {
            events.push({ type: 'new_week', data: { week: Math.floor(this.totalDays / 7) + 1 } });
        }

        return events;
    }

    /**
     * Advance to next month
     */
    advanceMonth() {
        const events = [];

        this.month++;

        // Check for year change
        if (this.month >= 12) {
            this.month = 0;
            events.push(...this.advanceYear());
        }

        if (this.onMonthChange) {
            this.onMonthChange({ month: MONTHS[this.month] });
        }

        events.push({ type: 'new_month', data: { month: MONTHS[this.month] } });

        return events;
    }

    /**
     * Advance to next year
     */
    advanceYear() {
        this.year++;

        if (this.onYearChange) {
            this.onYearChange({ year: this.year });
        }

        return [{ type: 'new_year', data: { year: this.year } }];
    }

    /**
     * Skip to next day (rest/sleep)
     */
    sleep() {
        const slotsToAdvance = this.getRemainingSlots();
        this.timeSlot = 5; // Set to night
        const events = this.advanceTime(1); // Advance to next day

        // Full energy restore from sleeping
        this.energy = this.maxEnergy;

        return { slotsSkipped: slotsToAdvance, events };
    }

    /**
     * Use energy
     */
    useEnergy(amount) {
        if (this.energy < amount) {
            return { success: false, reason: 'Not enough energy' };
        }

        this.energy -= amount;
        return { success: true, remaining: this.energy };
    }

    /**
     * Restore energy (eating, coffee, etc.)
     */
    restoreEnergy(amount) {
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
        return this.energy;
    }

    /**
     * Set max energy (from stats)
     */
    setMaxEnergy(max) {
        this.maxEnergy = max;
        this.energy = Math.min(this.energy, max);
    }

    /**
     * Get energy percentage
     */
    getEnergyPercent() {
        return (this.energy / this.maxEnergy) * 100;
    }

    /**
     * Check if can perform action requiring time/energy
     */
    canPerformAction(timeSlots, energyCost) {
        if (this.getRemainingSlots() < timeSlots) {
            return { can: false, reason: 'Not enough time today' };
        }
        if (energyCost > 0 && this.energy < energyCost) {
            return { can: false, reason: 'Not enough energy' };
        }
        return { can: true };
    }

    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            day: this.day,
            dayOfWeek: this.dayOfWeek,
            month: this.month,
            year: this.year,
            timeSlot: this.timeSlot,
            totalDays: this.totalDays,
            energy: this.energy,
            maxEnergy: this.maxEnergy
        };
    }

    /**
     * Load from saved data
     */
    fromJSON(data) {
        if (!data) return;
        Object.assign(this, data);
    }
}
