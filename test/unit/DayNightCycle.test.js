/**
 * Unit tests for DayNightCycle
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DayNightCycle, TIME_OF_DAY } from '../../src/js/game/DayNightCycle.js';
import { TimeManager } from '../../src/js/game/TimeManager.js';

describe('DayNightCycle', () => {
    let dayNightCycle;
    let mockGameState;
    let timeManager;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '<div class="map-container"></div>';
        document.body.className = '';

        // Create TimeManager
        timeManager = new TimeManager();

        // Create mock gameState
        mockGameState = {
            timeManager: timeManager
        };

        // Create DayNightCycle instance
        dayNightCycle = new DayNightCycle(mockGameState);
    });

    describe('getTimeOfDay()', () => {
        it('should return MORNING for timeSlot 0', () => {
            timeManager.timeSlot = 0;
            expect(dayNightCycle.getTimeOfDay()).toBe(TIME_OF_DAY.MORNING);
        });

        it('should return MORNING for timeSlot 1', () => {
            timeManager.timeSlot = 1;
            expect(dayNightCycle.getTimeOfDay()).toBe(TIME_OF_DAY.MORNING);
        });

        it('should return NOON for timeSlot 2', () => {
            timeManager.timeSlot = 2;
            expect(dayNightCycle.getTimeOfDay()).toBe(TIME_OF_DAY.NOON);
        });

        it('should return NOON for timeSlot 3', () => {
            timeManager.timeSlot = 3;
            expect(dayNightCycle.getTimeOfDay()).toBe(TIME_OF_DAY.NOON);
        });

        it('should return NIGHT for timeSlot 4', () => {
            timeManager.timeSlot = 4;
            expect(dayNightCycle.getTimeOfDay()).toBe(TIME_OF_DAY.NIGHT);
        });

        it('should return NIGHT for timeSlot 5', () => {
            timeManager.timeSlot = 5;
            expect(dayNightCycle.getTimeOfDay()).toBe(TIME_OF_DAY.NIGHT);
        });
    });

    describe('getTimeOfDay() with missing timeManager', () => {
        it('should return MORNING when timeManager is null', () => {
            mockGameState.timeManager = null;
            expect(dayNightCycle.getTimeOfDay()).toBe(TIME_OF_DAY.MORNING);
        });

        it('should return MORNING when timeManager is undefined', () => {
            mockGameState.timeManager = undefined;
            expect(dayNightCycle.getTimeOfDay()).toBe(TIME_OF_DAY.MORNING);
        });
    });

    describe('update() - class updates', () => {
        it('should add time-morning class when transitioning to MORNING', () => {
            timeManager.timeSlot = 0;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.NOON;
            dayNightCycle.update();

            expect(document.body.classList.contains('time-morning')).toBe(true);
            expect(document.body.classList.contains('time-noon')).toBe(false);
            expect(document.body.classList.contains('time-night')).toBe(false);
        });

        it('should add time-noon class when transitioning to NOON', () => {
            timeManager.timeSlot = 2;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.MORNING;
            dayNightCycle.update();

            expect(document.body.classList.contains('time-noon')).toBe(true);
            expect(document.body.classList.contains('time-morning')).toBe(false);
            expect(document.body.classList.contains('time-night')).toBe(false);
        });

        it('should add time-night class when transitioning to NIGHT', () => {
            timeManager.timeSlot = 4;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.MORNING;
            dayNightCycle.update();

            expect(document.body.classList.contains('time-night')).toBe(true);
            expect(document.body.classList.contains('time-morning')).toBe(false);
            expect(document.body.classList.contains('time-noon')).toBe(false);
        });

        it('should update map-container class when transitioning phases', () => {
            const mapContainer = document.querySelector('.map-container');
            timeManager.timeSlot = 0;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.NOON;
            dayNightCycle.update();

            expect(mapContainer.classList.contains('time-morning')).toBe(true);
            expect(mapContainer.classList.contains('time-noon')).toBe(false);
            expect(mapContainer.classList.contains('time-night')).toBe(false);
        });
    });

    describe('update() - phase change detection', () => {
        // #2002 removed the never-used onTimeChange callback; the observable
        // side effect of a phase change is updateMapAppearance().
        it('should not refresh map appearance when phase does not change', () => {
            const spy = vi.spyOn(dayNightCycle, 'updateMapAppearance');
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.MORNING;
            timeManager.timeSlot = 0;

            dayNightCycle.update();

            expect(spy).not.toHaveBeenCalled();
        });

        it('should refresh map appearance once when phase changes', () => {
            const spy = vi.spyOn(dayNightCycle, 'updateMapAppearance');
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.MORNING;
            timeManager.timeSlot = 2;

            dayNightCycle.update();

            expect(spy).toHaveBeenCalledOnce();
            expect(dayNightCycle.currentTimeOfDay).toBe(TIME_OF_DAY.NOON);
        });

        it('should move from NOON to NIGHT when slot reaches evening', () => {
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.NOON;
            timeManager.timeSlot = 4;

            dayNightCycle.update();

            expect(dayNightCycle.currentTimeOfDay).toBe(TIME_OF_DAY.NIGHT);
        });

        it('should not refresh a second time when called again with same phase', () => {
            const spy = vi.spyOn(dayNightCycle, 'updateMapAppearance');
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.MORNING;
            timeManager.timeSlot = 1;

            dayNightCycle.update();
            dayNightCycle.update();

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('update() - class idempotence', () => {
        it('should not re-add time class when called twice with same slot', () => {
            const mapContainer = document.querySelector('.map-container');
            timeManager.timeSlot = 0;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.NOON;

            dayNightCycle.update();
            const classesAfterFirstUpdate = [...mapContainer.classList];

            dayNightCycle.update();
            const classesAfterSecondUpdate = [...mapContainer.classList];

            expect(classesAfterFirstUpdate).toEqual(classesAfterSecondUpdate);
        });

        it('should not add class to body twice when slot does not change', () => {
            timeManager.timeSlot = 0;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.NOON;

            dayNightCycle.update();
            const classCountAfterFirst = document.body.classList.length;

            dayNightCycle.update();
            const classCountAfterSecond = document.body.classList.length;

            expect(classCountAfterFirst).toBe(classCountAfterSecond);
        });
    });

    describe('update() - multiple transitions', () => {
        it('should correctly transition through all phases', () => {
            const mapContainer = document.querySelector('.map-container');

            // Transition to NOON
            timeManager.timeSlot = 2;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.MORNING;
            dayNightCycle.update();
            expect(mapContainer.classList.contains('time-noon')).toBe(true);
            expect(mapContainer.classList.contains('time-morning')).toBe(false);

            // Transition to NIGHT
            timeManager.timeSlot = 4;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.NOON;
            dayNightCycle.update();
            expect(mapContainer.classList.contains('time-night')).toBe(true);
            expect(mapContainer.classList.contains('time-noon')).toBe(false);

            // Transition back to MORNING
            timeManager.timeSlot = 0;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.NIGHT;
            dayNightCycle.update();
            expect(mapContainer.classList.contains('time-morning')).toBe(true);
            expect(mapContainer.classList.contains('time-night')).toBe(false);
        });
    });

    describe('update() - missing map container', () => {
        it('should not throw when map-container does not exist', () => {
            document.body.innerHTML = '';
            timeManager.timeSlot = 2;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.MORNING;

            expect(() => {
                dayNightCycle.update();
            }).not.toThrow();
        });

        it('should still update body class when map-container is missing', () => {
            document.body.innerHTML = '';
            document.body.className = '';
            timeManager.timeSlot = 2;
            dayNightCycle.currentTimeOfDay = TIME_OF_DAY.MORNING;

            dayNightCycle.update();

            expect(document.body.classList.contains('time-noon')).toBe(true);
        });
    });

    describe('constructor', () => {
        it('should initialize with MORNING as default time', () => {
            expect(dayNightCycle.currentTimeOfDay).toBe(TIME_OF_DAY.MORNING);
        });

        it('should not expose the removed onTimeChange callback (#2002)', () => {
            expect(dayNightCycle.onTimeChange).toBeUndefined();
        });

        it('should store gameState reference', () => {
            expect(dayNightCycle.gameState).toBe(mockGameState);
        });
    });
});
