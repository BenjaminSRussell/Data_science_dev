import { describe, it, expect, beforeEach } from 'vitest';
import { TimeManager } from '../../src/js/game/TimeManager.js';

describe('TimeManager', () => {
    let timeManager;

    beforeEach(() => {
        timeManager = new TimeManager();
    });

    describe('sleep()', () => {
        it('should advance to next day when player sleeps at afternoon (slot 2)', () => {
            // Set up: player at afternoon (slot 2)
            timeManager.timeSlot = 2;
            
            // Call sleep
            const result = timeManager.sleep();
            
            // After sleep, player should be at early morning (slot 0) of next day
            expect(timeManager.timeSlot).toBe(0);
            expect(timeManager.totalDays).toBe(2);
            expect(result.events.length).toBeGreaterThan(0);
            expect(result.events.some(e => e.type === 'new_day')).toBe(true);
        });

        it('should restore energy to max when sleeping', () => {
            timeManager.energy = 50;
            const maxEnergy = timeManager.maxEnergy;
            
            timeManager.sleep();
            
            expect(timeManager.energy).toBe(maxEnergy);
        });

        it('should handle sleep at slot 0 (edge case)', () => {
            timeManager.timeSlot = 0;
            const startDay = timeManager.totalDays;
            
            const result = timeManager.sleep();
            
            // Should advance exactly one day
            expect(timeManager.totalDays).toBe(startDay + 1);
            expect(result.events.some(e => e.type === 'new_day')).toBe(true);
        });

        it('should return events from the day advance', () => {
            timeManager.timeSlot = 3;
            
            const result = timeManager.sleep();
            
            expect(result.events).toBeDefined();
            expect(Array.isArray(result.events)).toBe(true);
            // Should contain new_day event
            const newDayEvent = result.events.find(e => e.type === 'new_day');
            expect(newDayEvent).toBeDefined();
        });

        it('should not return slotsSkipped (contract change - sleep already does the advance)', () => {
            timeManager.timeSlot = 2;
            
            const result = timeManager.sleep();
            
            // The new contract should not include slotsSkipped
            expect(result.slotsSkipped).toBeUndefined();
            // Only events should be in the result
            expect(Object.keys(result)).toEqual(['events']);
        });
    });

    describe('advanceTime()', () => {
        it('should correctly advance time without sleep interference', () => {
            timeManager.timeSlot = 0;
            
            const events = timeManager.advanceTime(4);
            
            expect(timeManager.timeSlot).toBe(4);
            expect(events.length).toBe(0); // No rollover
        });

        it('should trigger day change when advancing past slot 5', () => {
            timeManager.timeSlot = 3;
            
            const events = timeManager.advanceTime(3);
            
            expect(timeManager.timeSlot).toBe(0);
            expect(timeManager.totalDays).toBe(2);
            expect(events.some(e => e.type === 'new_day')).toBe(true);
        });
    });
});
