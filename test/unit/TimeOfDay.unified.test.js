/**
 * Every in-game time-of-day consumer agrees with TimeManager's slots (#924)
 */
import { describe, it, expect } from 'vitest';
import { TIME_SLOTS, dayPhaseForSlot, slotStartHour, DAY_PHASES, TimeManager } from '../../src/js/game/TimeManager.js';
import { DayNightCycle } from '../../src/js/game/DayNightCycle.js';
import { LocationBackgroundSystem } from '../../src/js/game/LocationBackgroundSystem.js';
import { TIME_OF_DAY } from '../../src/js/data/locations.js';

describe('shared time-of-day phases (#924)', () => {
    it('maps slots to start hours and phases', () => {
        expect(TIME_SLOTS.map((_, s) => slotStartHour(s))).toEqual([6, 9, 12, 15, 18, 21]);
        expect(TIME_SLOTS.map((_, s) => dayPhaseForSlot(s))).toEqual(['morning', 'morning', 'afternoon', 'afternoon', 'evening', 'night']);
        expect(dayPhaseForSlot(undefined)).toBeNull();
        const tm = new TimeManager();
        tm.timeSlot = 4;
        expect(tm.getDayPhase()).toBe('evening');
    });

    it('LocationBackgroundSystem, EnvironmentManager hours and DayNightCycle agree for every slot', () => {
        for (let slot = 0; slot < TIME_SLOTS.length; slot++) {
            const gs = { timeManager: { timeSlot: slot } };
            const phase = dayPhaseForSlot(slot);
            expect(DAY_PHASES).toContain(phase);
            expect(LocationBackgroundSystem.prototype.getTimeOfDay.call({ gameState: gs })).toBe(phase);
            const envPhase = TIME_OF_DAY.find(t => t.hours.includes(slotStartHour(slot))).id;
            expect(envPhase).toBe(phase);
            expect(new DayNightCycle(gs).getTimeOfDay()).toBe(DayNightCycle.PHASE_TO_LOOK[phase]);
        }
    });

    it('TIME_OF_DAY hours cover each hour exactly once', () => {
        const hours = TIME_OF_DAY.flatMap(t => t.hours).sort((a, b) => a - b);
        expect(hours).toEqual(Array.from({ length: 24 }, (_, h) => h));
    });
});
