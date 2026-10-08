/**
 * Time System - Day/night cycle and time slot management
 * Each day has 6 time slots, activities consume time
 */

// Time slot definitions
export const TIME_SLOTS = [
    { id: 'early_morning', name: 'Early Morning', icon: '', hours: '6:00 - 9:00', index: 0 },
    { id: 'late_morning', name: 'Late Morning', icon: '', hours: '9:00 - 12:00', index: 1 },
    { id: 'afternoon', name: 'Afternoon', icon: '', hours: '12:00 - 15:00', index: 2 },
    { id: 'late_afternoon', name: 'Late Afternoon', icon: '', hours: '15:00 - 18:00', index: 3 },
    { id: 'evening', name: 'Evening', icon: '', hours: '18:00 - 21:00', index: 4 },
    { id: 'night', name: 'Night', icon: '', hours: '21:00 - 00:00', index: 5 }
];

// Number of time slots in a day — derived from TIME_SLOTS so it is defined once (#2174)
export const SLOTS_PER_DAY = TIME_SLOTS.length;

// The game calendar uses 30-day months (see advanceDay)
export const DAYS_PER_MONTH = 30;

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
        return Math.max(0, SLOTS_PER_DAY - this.timeSlot);
    }

    /**
     * Advance time by N slots
     */
    advanceTime(slots = 1) {
        const events = [];

        for (let i = 0; i < slots; i++) {
            this.timeSlot++;

            // Check for day change
            if (this.timeSlot >= SLOTS_PER_DAY) {
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
        if (this.day > DAYS_PER_MONTH) {
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
            // Same week numbering as every other system: Math.floor(totalDays / 7) (#1463)
            events.push({ type: 'new_week', data: { week: Math.floor(this.totalDays / 7) } });
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
        this.timeSlot = SLOTS_PER_DAY - 1; // Set to night
        const events = this.advanceTime(1); // Advance to next day

        // Full energy restore from sleeping
        this.energy = this.maxEnergy;

        return { slotsSkipped: slotsToAdvance, events };
    }

    /**
     * Use energy
     */
    useEnergy(amount) {
        const cost = Number(amount);
        if (!Number.isFinite(cost)) {
            return { success: false, reason: 'Invalid energy amount' };
        }
        // Negative costs (e.g. Meditation's energyCost: -10) restore energy,
        // but never past maxEnergy (#1460)
        if (cost < 0) {
            this.restoreEnergy(-cost);
            return { success: true, remaining: this.energy };
        }
        if (this.energy < cost) {
            return { success: false, reason: 'Not enough energy' };
        }

        this.energy -= cost;
        return { success: true, remaining: this.energy };
    }

    /**
     * Whether the player has at least `amount` energy (#1458)
     */
    hasEnergy(amount = 0) {
        const cost = Number(amount) || 0;
        return this.energy >= cost;
    }

    /**
     * Forced energy loss (sickness, events). Unlike useEnergy it always applies,
     * but energy is floored at 0 so it can never go negative (#160, #1727).
     * @returns {number} energy actually lost
     */
    drainEnergy(amount) {
        const loss = Math.max(0, Number(amount) || 0);
        const before = this.energy;
        this.energy = Math.max(0, this.energy - loss);
        return before - this.energy;
    }

    /**
     * Restore energy (eating, coffee, etc.)
     */
    restoreEnergy(amount) {
        const gain = Math.max(0, Number(amount) || 0);
        this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy + gain));
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
        // Activities longer than a full day are multi-day commitments that roll
        // over into following days; only same-day activities must fit in
        // the remaining slots (#2174)
        if (timeSlots <= SLOTS_PER_DAY && this.getRemainingSlots() < timeSlots) {
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
        if (!data || typeof data !== 'object') return;
        // Validate every field before trusting it — a corrupted save must not
        // soft-lock the player with an out-of-range slot or day (#1461)
        const int = (v, min, max, fallback) => {
            const n = Number(v);
            if (!Number.isFinite(n)) return fallback;
            return Math.min(max, Math.max(min, Math.floor(n)));
        };
        this.timeSlot = int(data.timeSlot, 0, SLOTS_PER_DAY - 1, 0);
        this.day = int(data.day, 1, DAYS_PER_MONTH, 1);
        this.dayOfWeek = int(data.dayOfWeek, 0, DAYS.length - 1, 0);
        this.month = int(data.month, 0, MONTHS.length - 1, 0);
        this.year = int(data.year, 1, Number.MAX_SAFE_INTEGER, 1);
        this.totalDays = int(data.totalDays, 1, Number.MAX_SAFE_INTEGER, 1);
        this.maxEnergy = int(data.maxEnergy, 1, Number.MAX_SAFE_INTEGER, 100);
        const energy = Number(data.energy);
        this.energy = Number.isFinite(energy)
            ? Math.min(this.maxEnergy, Math.max(0, energy))
            : this.maxEnergy;
    }
}
