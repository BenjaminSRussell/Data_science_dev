import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MenuLogoDisplay } from '../../src/js/ui/MenuLogoDisplay.js';

function makeSaveManager(slots) {
    return {
        getSaveData(i) {
            return slots[i] ?? null;
        }
    };
}

describe('MenuLogoDisplay', () => {
    let display;
    let saveManager;

    beforeEach(() => {
        saveManager = makeSaveManager([]);
        display = new MenuLogoDisplay(saveManager);
    });

    afterEach(() => {
        display.destroy();
        vi.useRealTimers();
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    describe('formatPlaytime', () => {
        it('formats hours-only shape for values under 24h', () => {
            expect(display.formatPlaytime(5)).toBe('5h');
        });

        it('formats days+hours shape for values between 24h and 168h', () => {
            expect(display.formatPlaytime(50)).toBe('2d 2h');
        });

        it('formats weeks+days shape for values of 168h or more', () => {
            expect(display.formatPlaytime(200)).toBe('1w 1d');
        });

        it('uses days+hours shape at the 24h boundary (24 is not < 24)', () => {
            expect(display.formatPlaytime(24)).toBe('1d 0h');
        });

        it('uses weeks+days shape at the 168h boundary (168 is not < 168)', () => {
            expect(display.formatPlaytime(168)).toBe('1w 0d');
        });
    });

    describe('calculateStats', () => {
        it('collapses to a single Welcome entry when all save slots are empty', () => {
            display.calculateStats();
            expect(display.stats).toHaveLength(1);
            expect(display.stats[0]).toEqual({
                icon: 'Chart',
                label: 'Welcome',
                value: 'Start your career'
            });
        });

        it('does NOT collapse when money/tasks exist but rank is still 0', () => {
            saveManager = makeSaveManager([
                { state: { timeManager: { totalDays: 0 }, rankIndex: 0, money: 500, tasksCompleted: 3 } }
            ]);
            display = new MenuLogoDisplay(saveManager);
            display.calculateStats();
            expect(display.stats).toHaveLength(6);
            expect(display.stats.find(s => s.label === 'Welcome')).toBeUndefined();
            expect(display.stats.find(s => s.label === 'Total Money Earned').value).toBe('$500');
            expect(display.stats.find(s => s.label === 'Total Tasks').value).toBe('3');
        });

        it('builds the normal 6-stat list when there is playtime and rank data', () => {
            saveManager = makeSaveManager([
                { state: { timeManager: { totalDays: 2 }, rankIndex: 2, money: 1000, tasksCompleted: 1, completedAchievements: ['a', 'b'] } }
            ]);
            display = new MenuLogoDisplay(saveManager);
            display.calculateStats();
            expect(display.stats).toHaveLength(6);
            expect(display.stats[0].value).toBe('2d 0h');
            expect(display.stats[1].value).toBe('Data Analyst');
            expect(display.stats[5].value).toBe('2');
        });
    });

    describe('stat rotation', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            saveManager = makeSaveManager([
                { state: { timeManager: { totalDays: 1 }, rankIndex: 1, money: 100, tasksCompleted: 1 } }
            ]);
            display = new MenuLogoDisplay(saveManager);
            document.body.innerHTML = '<div class="menu-logo-icon"></div>';
            display.calculateStats();
            display.startRotation();
        });

        it('advances the index by one per tick', () => {
            vi.advanceTimersByTime(3000);
            expect(display.currentStatIndex).toBe(1);
        });

        it('wraps back to 0 after the last stat', () => {
            vi.advanceTimersByTime(3000 * display.stats.length);
            expect(display.currentStatIndex).toBe(0);
        });

        it('clears the interval on stopRotation and leaves no dangling timers', () => {
            const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
            const intervalId = display.rotationInterval;
            expect(intervalId).not.toBeNull();
            display.stopRotation();
            expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
            expect(display.rotationInterval).toBeNull();
            vi.advanceTimersByTime(3000 * 10);
            expect(display.currentStatIndex).toBe(0);
        });

        it('destroy() stops the rotation so no timers fire afterwards', () => {
            display.destroy();
            expect(display.rotationInterval).toBeNull();
            vi.advanceTimersByTime(3000 * 10);
            expect(display.currentStatIndex).toBe(0);
        });

        it('does not start a rotation when there is only one stat', () => {
            display.stopRotation();
            saveManager = makeSaveManager([]);
            display = new MenuLogoDisplay(saveManager);
            display.calculateStats();
            expect(display.stats).toHaveLength(1);
            display.startRotation();
            expect(display.rotationInterval).toBeNull();
            vi.advanceTimersByTime(3000 * 10);
            expect(display.currentStatIndex).toBe(0);
        });
    });

    describe('render', () => {
        it('retries via setTimeout when the target element is missing instead of throwing', () => {
            const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
            expect(() => display.render()).not.toThrow();
            expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
            expect(setTimeoutSpy.mock.calls[0][1]).toBe(100);
        });

        it('renders the current stat into the logo element when present', () => {
            saveManager = makeSaveManager([
                { state: { timeManager: { totalDays: 1 }, rankIndex: 1, money: 100, tasksCompleted: 1 } }
            ]);
            display = new MenuLogoDisplay(saveManager);
            display.calculateStats();
            document.body.innerHTML = '<div class="menu-logo-icon"></div>';
            display.render();
            const logo = document.querySelector('.menu-logo-icon');
            expect(logo.textContent).toBe(display.stats[0].icon);
            expect(logo.getAttribute('data-stat-label')).toBe(display.stats[0].label);
            expect(logo.getAttribute('data-stat-value')).toBe(display.stats[0].value);
        });
    });
});
