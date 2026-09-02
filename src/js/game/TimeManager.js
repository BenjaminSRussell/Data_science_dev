class TimeManager {
    constructor() {
        this.day = 1;
        this.dayOfWeek = 0;
        this.month = 0;
        this.year = 2023;
        this.timeSlot = 0;
        this.totalDays = 0;
        this.energy = 100;
        this.maxEnergy = 100;

        this.onDayChange = null;
        this.onMonthChange = null;
        this.onYearChange = null;
    }

    /**
     * Advance time by a certain number of slots
     * @param {number} slots - Number of time slots to advance
     */
    advanceTime(slots) {
        const events = [];
        slots = Math.floor(slots);

        if (slots <= 0) {
            return events;
        }

        for (let i = 0; i < slots; i++) {
            this.timeSlot = (this.timeSlot + 1) % 6;
            if (this.timeSlot === 0) {
                events.push(...this.advanceDay());
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