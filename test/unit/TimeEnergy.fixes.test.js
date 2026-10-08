import { describe, it, expect, vi } from 'vitest';
import { TimeManager, SLOTS_PER_DAY, TIME_SLOTS } from '../../src/js/game/TimeManager.js';
import { LocationBackgroundSystem } from '../../src/js/game/LocationBackgroundSystem.js';
import { EventSystem } from '../../src/js/game/events/EventSystem.js';

describe('TimeManager fixes', () => {
    it('SLOTS_PER_DAY is derived from TIME_SLOTS (#2174)', () => {
        expect(SLOTS_PER_DAY).toBe(TIME_SLOTS.length);
    });

    it('allows multi-day activities instead of blocking anything > 6 slots (#2174)', () => {
        const tm = new TimeManager();
        expect(tm.canPerformAction(SLOTS_PER_DAY + 2, 0).can).toBe(true);
        tm.timeSlot = 4;
        expect(tm.canPerformAction(3, 0).can).toBe(false);
    });

    it('hasEnergy exists (#1458)', () => {
        const tm = new TimeManager();
        tm.energy = 20;
        expect(tm.hasEnergy(15)).toBe(true);
        expect(tm.hasEnergy(25)).toBe(false);
    });

    it('negative useEnergy restores but never exceeds maxEnergy (#1460)', () => {
        const tm = new TimeManager();
        tm.energy = 95;
        expect(tm.useEnergy(-10).success).toBe(true);
        expect(tm.energy).toBe(100);
    });

    it('drainEnergy floors at 0 (#160, #1727)', () => {
        const tm = new TimeManager();
        tm.energy = 10;
        expect(tm.drainEnergy(30)).toBe(10);
        expect(tm.energy).toBe(0);
    });

    it('new_week uses the same week numbering as other systems (#1463)', () => {
        const tm = new TimeManager();
        let week;
        for (let i = 0; i < 7; i++) {
            const ev = tm.advanceDay().find(e => e.type === 'new_week');
            if (ev) week = ev.data.week;
        }
        expect(week).toBe(Math.floor(tm.totalDays / 7));
    });

    it('fromJSON clamps corrupted fields (#1461)', () => {
        const tm = new TimeManager();
        tm.fromJSON({ timeSlot: 9, day: 45, dayOfWeek: -3, month: 'x', energy: 500, maxEnergy: 100, totalDays: 12, year: 2 });
        expect(tm.timeSlot).toBe(SLOTS_PER_DAY - 1);
        expect(tm.day).toBe(30);
        expect(tm.dayOfWeek).toBe(0);
        expect(tm.month).toBe(0);
        expect(tm.energy).toBe(100);
        expect(tm.getRemainingSlots()).toBeGreaterThanOrEqual(0);
        expect(tm.totalDays).toBe(12);
        expect(tm.year).toBe(2);
    });
});

describe('LocationBackgroundSystem.getTimeOfDay (#215, #1285)', () => {
    it('follows TimeManager.timeSlot', () => {
        const tm = new TimeManager();
        const sys = Object.create(LocationBackgroundSystem.prototype);
        sys.gameState = { timeManager: tm };
        const seen = [0, 2, 4, 5].map(slot => { tm.timeSlot = slot; return sys.getTimeOfDay(); });
        expect(seen).toEqual(['morning', 'afternoon', 'evening', 'night']);
    });
});

describe('EventSystem calendar (#1459, #1707, #2413)', () => {
    it('every scheduled event falls on a reachable month/day', () => {
        const es = new EventSystem({ timeManager: new TimeManager() });
        for (const ev of es.upcomingEvents) {
            if (ev.day !== undefined) {
                expect(ev.day).toBeGreaterThanOrEqual(1);
                expect(ev.day).toBeLessThanOrEqual(30);
            }
            if (ev.type === 'party' || ev.type === 'crash' || ev.type === 'bull') {
                expect(ev.month).toBeGreaterThanOrEqual(0);
                expect(ev.month).toBeLessThan(12);
            }
        }
        const halloween = es.upcomingEvents.find(e => e.id === 'halloween');
        expect(halloween).toBeTruthy();
    });

    it('dayOfYearToDate maps offsets onto 30-day months', () => {
        expect(EventSystem.dayOfYearToDate(0)).toEqual({ month: 0, day: 1 });
        expect(EventSystem.dayOfYearToDate(42)).toEqual({ month: 1, day: 13 });
    });
});
