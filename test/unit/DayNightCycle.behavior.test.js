/**
 * DayNightCycle slot->phase bucketing and its DOM effects, against a real DOM (#2003)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { DayNightCycle } from '../../src/js/game/DayNightCycle.js';

const timeClasses = (el) => [...el.classList].filter(c => c.startsWith('time-'));

describe('DayNightCycle (real DOM)', () => {
    let gs;
    let cycle;
    beforeEach(() => {
        document.body.className = '';
        document.body.innerHTML = '<div class="map-container"></div>';
        gs = { timeManager: { timeSlot: 0 } };
        cycle = new DayNightCycle(gs);
    });

    it.each([[0, 'morning'], [1, 'morning'], [2, 'noon'], [3, 'noon'], [4, 'night'], [5, 'night']])(
        'slot %i is %s', (slot, phase) => {
            gs.timeManager.timeSlot = slot;
            expect(cycle.getTimeOfDay()).toBe(phase);
        });

    it('returns morning when there is no timeManager', () => {
        expect(new DayNightCycle({}).getTimeOfDay()).toBe('morning');
        expect(new DayNightCycle({ timeManager: undefined }).getTimeOfDay()).toBe('morning');
    });

    it('applies exactly one time-* class to body and .map-container', () => {
        cycle.update();
        const map = document.querySelector('.map-container');
        expect(timeClasses(document.body)).toEqual(['time-morning']);
        expect(timeClasses(map)).toEqual(['time-morning']);
        gs.timeManager.timeSlot = 4;
        cycle.update();
        expect(timeClasses(document.body)).toEqual(['time-night']);
        expect(timeClasses(map)).toEqual(['time-night']);
    });

    it('does nothing when the phase has not changed', () => {
        cycle.update();
        document.body.classList.add('time-noon'); // foreign change survives a no-op update
        gs.timeManager.timeSlot = 1; // still morning
        cycle.update();
        expect(document.body.classList.contains('time-noon')).toBe(true);
    });

    it('still updates body when there is no map container', () => {
        document.body.innerHTML = '';
        gs.timeManager.timeSlot = 2;
        expect(() => cycle.update()).not.toThrow();
        expect(timeClasses(document.body)).toEqual(['time-noon']);
    });
});
