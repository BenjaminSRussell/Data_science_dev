/**
 * Unit tests for DayNightCycle
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DayNightCycle, TIME_OF_DAY } from '../../src/js/game/DayNightCycle.js';

describe('DayNightCycle', () => {
    let cycle;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {};
        cycle = new DayNightCycle(mockGameState);
        document.body.className = '';
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.body.className = '';
    });

    describe('constructor', () => {
        it('should initialize with morning as default time of day', () => {
            expect(cycle.gameState).toBe(mockGameState);
            expect(cycle.currentTimeOfDay).toBe(TIME_OF_DAY.MORNING);
            expect(cycle.onTimeChange).toBeNull();
        });
    });

    describe('getTimeOfDay', () => {
        it('should fall back to morning when timeManager is missing', () => {
            mockGameState.timeManager = undefined;
            expect(cycle.getTimeOfDay()).toBe(TIME_OF_DAY.MORNING);
        });

        it('should map slots 0-1 to morning', () => {
            mockGameState.timeManager = { timeSlot: 0 };
            expect(cycle.getTimeOfDay()).toBe(TIME_OF_DAY.MORNING);
            mockGameState.timeManager.timeSlot = 1;
            expect(cycle.getTimeOfDay()).toBe(TIME_OF_DAY.MORNING);
        });

        it('should map slots 2-3 to noon', () => {
            mockGameState.timeManager = { timeSlot: 2 };
            expect(cycle.getTimeOfDay()).toBe(TIME_OF_DAY.NOON);
            mockGameState.timeManager.timeSlot = 3;
            expect(cycle.getTimeOfDay()).toBe(TIME_OF_DAY.NOON);
        });

        it('should map slots 4-5 to night', () => {
            mockGameState.timeManager = { timeSlot: 4 };
            expect(cycle.getTimeOfDay()).toBe(TIME_OF_DAY.NIGHT);
            mockGameState.timeManager.timeSlot = 5;
            expect(cycle.getTimeOfDay()).toBe(TIME_OF_DAY.NIGHT);
        });
    });

    describe('update', () => {
        it('should not fire onTimeChange or touch body class when time did not change', () => {
            mockGameState.timeManager = { timeSlot: 0 };
            const onTimeChange = vi.fn();
            cycle.onTimeChange = onTimeChange;
            document.body.className = 'time-morning';

            cycle.update();

            expect(onTimeChange).not.toHaveBeenCalled();
            expect(document.body.className).toBe('time-morning');
        });

        it('should fire onTimeChange with old and new time and swap body class on change', () => {
            mockGameState.timeManager = { timeSlot: 0 };
            const onTimeChange = vi.fn();
            cycle.onTimeChange = onTimeChange;
            document.body.className = 'time-morning';

            mockGameState.timeManager.timeSlot = 2;
            cycle.update();

            expect(onTimeChange).toHaveBeenCalledTimes(1);
            expect(onTimeChange).toHaveBeenCalledWith(TIME_OF_DAY.MORNING, TIME_OF_DAY.NOON);
            expect(cycle.currentTimeOfDay).toBe(TIME_OF_DAY.NOON);
            expect(document.body.className).toBe('time-noon');
        });

        it('should remove old time class when transitioning to night', () => {
            mockGameState.timeManager = { timeSlot: 0 };
            document.body.className = 'time-morning';

            mockGameState.timeManager.timeSlot = 5;
            cycle.update();

            expect(cycle.currentTimeOfDay).toBe(TIME_OF_DAY.NIGHT);
            expect(document.body.className).toBe('time-night');
        });

        it('should not call onTimeChange when it is null', () => {
            mockGameState.timeManager = { timeSlot: 0 };
            cycle.onTimeChange = null;
            document.body.className = 'time-morning';

            mockGameState.timeManager.timeSlot = 4;
            expect(() => cycle.update()).not.toThrow();
            expect(cycle.currentTimeOfDay).toBe(TIME_OF_DAY.NIGHT);
        });
    });

    describe('getBackgroundColor', () => {
        it('should return the fixed color for each time of day', () => {
            cycle.currentTimeOfDay = TIME_OF_DAY.MORNING;
            expect(cycle.getBackgroundColor()).toBe('#1a2332');

            cycle.currentTimeOfDay = TIME_OF_DAY.NOON;
            expect(cycle.getBackgroundColor()).toBe('#0f172a');

            cycle.currentTimeOfDay = TIME_OF_DAY.NIGHT;
            expect(cycle.getBackgroundColor()).toBe('#0a0f1a');
        });
    });

    describe('getMapOverlay', () => {
        it('should return the fixed overlay for each time of day', () => {
            cycle.currentTimeOfDay = TIME_OF_DAY.MORNING;
            expect(cycle.getMapOverlay()).toBe('rgba(255, 248, 220, 0.05)');

            cycle.currentTimeOfDay = TIME_OF_DAY.NOON;
            expect(cycle.getMapOverlay()).toBe('rgba(255, 255, 255, 0.02)');

            cycle.currentTimeOfDay = TIME_OF_DAY.NIGHT;
            expect(cycle.getMapOverlay()).toBe('rgba(0, 0, 0, 0.3)');
        });
    });
});
