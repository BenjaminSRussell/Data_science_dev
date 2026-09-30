/**
 * Unit tests for TimeManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TimeManager, TIME_SLOTS, DAYS, MONTHS } from '../../src/js/game/TimeManager.js';

describe('TimeManager', () => {
    let timeManager;

    beforeEach(() => {
        timeManager = new TimeManager();
    });

    describe('constructor', () => {
        it('should initialize with correct default values', () => {
            expect(timeManager.day).toBe(1);
            expect(timeManager.dayOfWeek).toBe(0); // Monday
            expect(timeManager.month).toBe(0); // January
            expect(timeManager.year).toBe(1);
            expect(timeManager.timeSlot).toBe(0);
            expect(timeManager.totalDays).toBe(1);
            expect(timeManager.energy).toBe(100);
            expect(timeManager.maxEnergy).toBe(100);
        });
    });

    describe('advanceDay', () => {
        it('should advance day correctly', () => {
            const events = timeManager.advanceDay();
            expect(timeManager.day).toBe(2);
            expect(timeManager.totalDays).toBe(2);
        });

        it('should advance dayOfWeek in sequence (Monday to Sunday)', () => {
            for (let i = 0; i < 7; i++) {
                expect(timeManager.dayOfWeek).toBe(i % 7);
                timeManager.advanceDay();
            }
            // After 7 days, should be back to Monday
            expect(timeManager.dayOfWeek).toBe(0);
        });

        it('should trigger month change when day > 30', () => {
            // Advance to day 30
            for (let i = 0; i < 29; i++) {
                timeManager.advanceDay();
            }
            expect(timeManager.day).toBe(30);
            expect(timeManager.month).toBe(0); // Still January

            // Advance one more time to trigger month change
            const events = timeManager.advanceDay();
            expect(timeManager.day).toBe(1);
            expect(timeManager.month).toBe(1); // Now February

            // Should have new_month event
            const hasMonthEvent = events.some(e => e.type === 'new_month');
            expect(hasMonthEvent).toBe(true);
        });

        it('should emit new_day event', () => {
            const events = timeManager.advanceDay();
            const dayEvent = events.find(e => e.type === 'new_day');
            expect(dayEvent).toBeDefined();
            expect(dayEvent.data.day).toBe(timeManager.totalDays);
        });

        it('should emit new_week event exactly when dayOfWeek === 0 (Monday)', () => {
            // Advance to Sunday
            for (let i = 0; i < 6; i++) {
                const events = timeManager.advanceDay();
                const weekEvent = events.find(e => e.type === 'new_week');
                expect(weekEvent).toBeUndefined(); // Should not have new_week on other days
            }

            // Advance to Monday
            const mondayEvents = timeManager.advanceDay();
            const weekEvent = mondayEvents.find(e => e.type === 'new_week');
            expect(weekEvent).toBeDefined();
            expect(timeManager.dayOfWeek).toBe(0);
        });

        it('should restore 50 energy on day rollover', () => {
            timeManager.energy = 30;
            timeManager.advanceDay();
            expect(timeManager.energy).toBe(80); // 30 + 50
        });

        it('should cap energy restore at maxEnergy', () => {
            timeManager.energy = 80;
            timeManager.advanceDay();
            expect(timeManager.energy).toBe(100); // Capped at maxEnergy, not 130
        });

        it('should handle energy restore across multiple days', () => {
            timeManager.energy = 10;
            timeManager.maxEnergy = 100;

            // Day 1
            timeManager.advanceDay(); // 10 + 50 = 60
            expect(timeManager.energy).toBe(60);

            // Day 2
            timeManager.advanceDay(); // 60 + 50 = 100 (capped)
            expect(timeManager.energy).toBe(100);

            // Day 3
            timeManager.advanceDay(); // 100 + 50 = 100 (already at max)
            expect(timeManager.energy).toBe(100);
        });

        it('should trigger year change when month >= 12', () => {
            // Advance to December (month 11) at day 30
            timeManager.month = 11;
            timeManager.day = 30;

            // Trigger month change which should trigger year change
            const events = timeManager.advanceDay();

            // Should have wrapped back to January of next year
            expect(timeManager.month).toBe(0);
            expect(timeManager.year).toBe(2);

            // Should have new_year event
            const yearEvent = events.find(e => e.type === 'new_year');
            expect(yearEvent).toBeDefined();
        });
    });

    describe('advanceMonth', () => {
        it('should advance month correctly', () => {
            timeManager.month = 5;
            timeManager.advanceMonth();
            expect(timeManager.month).toBe(6);
        });

        it('should emit new_month event', () => {
            const events = timeManager.advanceMonth();
            const monthEvent = events.find(e => e.type === 'new_month');
            expect(monthEvent).toBeDefined();
        });

        it('should trigger year change at month 12', () => {
            timeManager.month = 11;
            const events = timeManager.advanceMonth();
            expect(timeManager.month).toBe(0);
            expect(timeManager.year).toBe(2);

            const yearEvent = events.find(e => e.type === 'new_year');
            expect(yearEvent).toBeDefined();
        });
    });

    describe('advanceYear', () => {
        it('should advance year correctly', () => {
            timeManager.year = 1;
            timeManager.advanceYear();
            expect(timeManager.year).toBe(2);
        });

        it('should emit new_year event', () => {
            const events = timeManager.advanceYear();
            const yearEvent = events.find(e => e.type === 'new_year');
            expect(yearEvent).toBeDefined();
            expect(yearEvent.data.year).toBe(timeManager.year);
        });
    });

    describe('sleep', () => {
        it('should reset timeSlot to 0 on next day', () => {
            timeManager.timeSlot = 2;
            timeManager.sleep();
            expect(timeManager.timeSlot).toBe(0);
        });

        it('should restore energy to maxEnergy', () => {
            timeManager.energy = 30;
            timeManager.maxEnergy = 100;
            timeManager.sleep();
            expect(timeManager.energy).toBe(100);
        });

        it('should return correct slotsSkipped from timeSlot 0', () => {
            timeManager.timeSlot = 0;
            const result = timeManager.sleep();
            expect(result.slotsSkipped).toBe(6); // 6 - 0 = 6
        });

        it('should return correct slotsSkipped from timeSlot 3', () => {
            timeManager.timeSlot = 3;
            const result = timeManager.sleep();
            expect(result.slotsSkipped).toBe(3); // 6 - 3 = 3
        });

        it('should return correct slotsSkipped from timeSlot 5', () => {
            timeManager.timeSlot = 5;
            const result = timeManager.sleep();
            expect(result.slotsSkipped).toBe(1); // 6 - 5 = 1
        });

        it('should emit events for the new day', () => {
            timeManager.timeSlot = 2;
            const result = timeManager.sleep();
            expect(result.events).toBeDefined();
            expect(Array.isArray(result.events)).toBe(true);

            // Should have at least a new_day event
            const dayEvent = result.events.find(e => e.type === 'new_day');
            expect(dayEvent).toBeDefined();
        });

        it('should test sleep from each timeSlot (0-5)', () => {
            for (let slot = 0; slot < 6; slot++) {
                const tm = new TimeManager();
                tm.timeSlot = slot;
                const result = tm.sleep();
                expect(result.slotsSkipped).toBe(6 - slot);
                expect(tm.timeSlot).toBe(0);
                expect(tm.energy).toBe(tm.maxEnergy);
            }
        });
    });

    describe('advanceTime', () => {
        it('should advance single time slot', () => {
            const initialTimeSlot = timeManager.timeSlot;
            timeManager.advanceTime(1);
            expect(timeManager.timeSlot).toBe(initialTimeSlot + 1);
        });

        it('should advance multiple time slots', () => {
            timeManager.advanceTime(3);
            expect(timeManager.timeSlot).toBe(3);
        });

        it('should trigger day change when crossing 6 time slots', () => {
            timeManager.timeSlot = 4;
            const events = timeManager.advanceTime(2);
            expect(timeManager.timeSlot).toBe(0);
            expect(timeManager.day).toBe(2);

            // Should have new_day event
            const dayEvent = events.find(e => e.type === 'new_day');
            expect(dayEvent).toBeDefined();
        });

        it('should handle multi-day advance spanning 3+ day boundaries', () => {
            timeManager.day = 1;
            timeManager.dayOfWeek = 0;
            timeManager.totalDays = 1;

            // Advance 20 slots = 3 full days + 2 slots
            const events = timeManager.advanceTime(20);

            expect(timeManager.timeSlot).toBe(2);
            expect(timeManager.day).toBe(4); // Advanced 3 days
            expect(timeManager.totalDays).toBe(4);

            // Should have 3 new_day events
            const dayEvents = events.filter(e => e.type === 'new_day');
            expect(dayEvents.length).toBe(3);
        });

        it('should emit new_week events correctly during multi-day advance', () => {
            // Start on Monday (dayOfWeek = 0)
            timeManager.dayOfWeek = 0;
            timeManager.day = 1;
            timeManager.timeSlot = 0;

            // Advance 42 slots = 7 full days, should reach next Monday
            const events = timeManager.advanceTime(42);

            // Should have at least one new_week event
            const weekEvents = events.filter(e => e.type === 'new_week');
            expect(weekEvents.length).toBeGreaterThan(0);
        });

        it('should handle day boundary transitions correctly', () => {
            timeManager.timeSlot = 5;
            timeManager.day = 1;

            const events = timeManager.advanceTime(1);

            expect(timeManager.timeSlot).toBe(0);
            expect(timeManager.day).toBe(2);

            const dayEvent = events.find(e => e.type === 'new_day');
            expect(dayEvent).toBeDefined();
        });

        it('should restore energy during multi-day advance', () => {
            timeManager.energy = 30;
            timeManager.timeSlot = 0;

            // Advance 12 slots = 2 full days
            timeManager.advanceTime(12);

            // First day: 30 + 50 = 80, second day: 80 + 50 = 100 (capped)
            expect(timeManager.energy).toBe(100);
        });
    });

    describe('useEnergy', () => {
        it('should deduct energy successfully when sufficient', () => {
            timeManager.energy = 100;
            const result = timeManager.useEnergy(30);

            expect(result.success).toBe(true);
            expect(timeManager.energy).toBe(70);
            expect(result.remaining).toBe(70);
        });

        it('should succeed when energy equals amount (boundary)', () => {
            timeManager.energy = 50;
            const result = timeManager.useEnergy(50);

            expect(result.success).toBe(true);
            expect(timeManager.energy).toBe(0);
        });

        it('should fail when energy is less than amount', () => {
            timeManager.energy = 30;
            const result = timeManager.useEnergy(50);

            expect(result.success).toBe(false);
            expect(result.reason).toBe('Not enough energy');
        });

        it('should not mutate energy on failure', () => {
            timeManager.energy = 30;
            timeManager.useEnergy(50);
            expect(timeManager.energy).toBe(30);
        });

        it('should not allow negative energy', () => {
            timeManager.energy = 30;
            timeManager.useEnergy(20);
            expect(timeManager.energy).toBeGreaterThanOrEqual(0);
        });
    });

    describe('canPerformAction', () => {
        it('should allow action when enough time and energy', () => {
            timeManager.timeSlot = 0;
            timeManager.energy = 100;

            const result = timeManager.canPerformAction(3, 20);
            expect(result.can).toBe(true);
        });

        it('should reject when not enough time remaining today', () => {
            timeManager.timeSlot = 4; // 2 slots remaining
            timeManager.energy = 100;

            const result = timeManager.canPerformAction(3, 20);
            expect(result.can).toBe(false);
            expect(result.reason).toBe('Not enough time today');
        });

        it('should reject when not enough energy', () => {
            timeManager.timeSlot = 0; // 6 slots remaining
            timeManager.energy = 30;

            const result = timeManager.canPerformAction(3, 50);
            expect(result.can).toBe(false);
            expect(result.reason).toBe('Not enough energy');
        });

        it('should allow action requiring exactly remaining time slots (boundary)', () => {
            timeManager.timeSlot = 0; // 6 slots remaining
            timeManager.energy = 100;

            const result = timeManager.canPerformAction(6, 20);
            expect(result.can).toBe(true);
        });

        it('should reject action requiring more than remaining time slots', () => {
            timeManager.timeSlot = 0; // 6 slots remaining
            timeManager.energy = 100;

            const result = timeManager.canPerformAction(7, 20);
            expect(result.can).toBe(false);
        });

        it('should allow action with zero energy cost', () => {
            timeManager.timeSlot = 0;
            timeManager.energy = 0;

            const result = timeManager.canPerformAction(3, 0);
            expect(result.can).toBe(true);
        });

        it('should be consistent with useEnergy boundary', () => {
            timeManager.energy = 50;

            // canPerformAction should approve what useEnergy can handle
            const canResult = timeManager.canPerformAction(1, 50);
            expect(canResult.can).toBe(true);

            const useResult = timeManager.useEnergy(50);
            expect(useResult.success).toBe(true);
        });
    });

    describe('restoreEnergy', () => {
        it('should restore energy', () => {
            timeManager.energy = 50;
            const result = timeManager.restoreEnergy(20);
            expect(result).toBe(70);
            expect(timeManager.energy).toBe(70);
        });

        it('should cap energy at maxEnergy', () => {
            timeManager.energy = 90;
            timeManager.maxEnergy = 100;
            const result = timeManager.restoreEnergy(30);
            expect(result).toBe(100);
            expect(timeManager.energy).toBe(100);
        });
    });

    describe('setMaxEnergy', () => {
        it('should set max energy', () => {
            timeManager.setMaxEnergy(150);
            expect(timeManager.maxEnergy).toBe(150);
        });

        it('should cap current energy if it exceeds new max', () => {
            timeManager.energy = 100;
            timeManager.setMaxEnergy(80);
            expect(timeManager.energy).toBe(80);
            expect(timeManager.maxEnergy).toBe(80);
        });
    });

    describe('getRemainingSlots', () => {
        it('should return 6 slots at timeSlot 0', () => {
            timeManager.timeSlot = 0;
            expect(timeManager.getRemainingSlots()).toBe(6);
        });

        it('should return 1 slot at timeSlot 5', () => {
            timeManager.timeSlot = 5;
            expect(timeManager.getRemainingSlots()).toBe(1);
        });

        it('should return 0 slots at timeSlot 6', () => {
            timeManager.timeSlot = 6;
            expect(timeManager.getRemainingSlots()).toBe(0);
        });
    });

    describe('serialization', () => {
        it('should serialize to JSON', () => {
            timeManager.day = 15;
            timeManager.month = 3;
            timeManager.energy = 75;

            const json = timeManager.toJSON();
            expect(json.day).toBe(15);
            expect(json.month).toBe(3);
            expect(json.energy).toBe(75);
            expect(json.maxEnergy).toBe(100);
        });

        it('should deserialize from JSON', () => {
            const data = {
                day: 20,
                dayOfWeek: 2,
                month: 5,
                year: 2,
                timeSlot: 3,
                totalDays: 50,
                energy: 60,
                maxEnergy: 100
            };

            timeManager.fromJSON(data);
            expect(timeManager.day).toBe(20);
            expect(timeManager.dayOfWeek).toBe(2);
            expect(timeManager.month).toBe(5);
            expect(timeManager.year).toBe(2);
            expect(timeManager.timeSlot).toBe(3);
            expect(timeManager.totalDays).toBe(50);
            expect(timeManager.energy).toBe(60);
        });

        it('should handle null data in fromJSON', () => {
            const original = timeManager.toJSON();
            timeManager.fromJSON(null);
            expect(timeManager.toJSON()).toEqual(original);
        });
    });

    describe('getCurrentSlot', () => {
        it('should return current time slot info', () => {
            timeManager.timeSlot = 2;
            const slot = timeManager.getCurrentSlot();
            expect(slot).toEqual(TIME_SLOTS[2]);
        });
    });

    describe('getDateString', () => {
        it('should format date correctly', () => {
            timeManager.dayOfWeek = 0;
            timeManager.month = 0;
            timeManager.day = 1;
            timeManager.year = 1;

            const dateStr = timeManager.getDateString();
            expect(dateStr).toContain('Monday');
            expect(dateStr).toContain('January');
            expect(dateStr).toContain('1');
            expect(dateStr).toContain('Year 1');
        });
    });

    describe('getShortDate', () => {
        it('should format short date correctly', () => {
            timeManager.month = 0;
            timeManager.day = 15;
            timeManager.year = 1;

            const shortDate = timeManager.getShortDate();
            expect(shortDate).toContain('Jan');
            expect(shortDate).toContain('15');
            expect(shortDate).toContain('Y1');
        });
    });

    describe('isWeekend', () => {
        it('should return true for Saturday (dayOfWeek = 5)', () => {
            timeManager.dayOfWeek = 5;
            expect(timeManager.isWeekend()).toBe(true);
        });

        it('should return true for Sunday (dayOfWeek = 6)', () => {
            timeManager.dayOfWeek = 6;
            expect(timeManager.isWeekend()).toBe(true);
        });

        it('should return false for weekdays', () => {
            for (let i = 0; i < 5; i++) {
                timeManager.dayOfWeek = i;
                expect(timeManager.isWeekend()).toBe(false);
            }
        });
    });

    describe('energy invariants', () => {
        it('should never exceed maxEnergy after day advance', () => {
            timeManager.energy = 90;
            timeManager.maxEnergy = 100;

            for (let i = 0; i < 10; i++) {
                timeManager.advanceDay();
                expect(timeManager.energy).toBeLessThanOrEqual(timeManager.maxEnergy);
            }
        });

        it('should never exceed maxEnergy after restore', () => {
            timeManager.maxEnergy = 100;

            for (let i = 0; i < 10; i++) {
                timeManager.restoreEnergy(50);
                expect(timeManager.energy).toBeLessThanOrEqual(timeManager.maxEnergy);
            }
        });

        it('should never exceed maxEnergy after multi-day advance', () => {
            timeManager.energy = 50;
            timeManager.maxEnergy = 100;

            timeManager.advanceTime(50); // Many slots
            expect(timeManager.energy).toBeLessThanOrEqual(timeManager.maxEnergy);
        });

        it('should maintain energy >= 0 after useEnergy', () => {
            for (let i = 0; i < 10; i++) {
                timeManager.useEnergy(10);
            }
            expect(timeManager.energy).toBeGreaterThanOrEqual(0);
        });
    });

    describe('day/month/year cascade', () => {
        it('should correctly cascade through full year (12 months)', () => {
            timeManager.day = 1;
            timeManager.month = 0;
            timeManager.year = 1;

            // Advance 30 days to trigger 12 month changes
            for (let m = 0; m < 12; m++) {
                timeManager.day = 30;
                const events = timeManager.advanceDay();

                if (m < 11) {
                    expect(timeManager.month).toBe(m + 1);
                    expect(timeManager.year).toBe(1);
                    const monthEvent = events.find(e => e.type === 'new_month');
                    expect(monthEvent).toBeDefined();
                } else {
                    // Last month transition should trigger year change
                    expect(timeManager.month).toBe(0);
                    expect(timeManager.year).toBe(2);
                    const yearEvent = events.find(e => e.type === 'new_year');
                    expect(yearEvent).toBeDefined();
                }
            }
        });
    });
});
