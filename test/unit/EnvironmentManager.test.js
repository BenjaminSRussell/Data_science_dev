/**
 * Unit tests for EnvironmentManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EnvironmentManager } from '../../src/js/game/EnvironmentManager.js';
import { OFFICE_LOCATIONS, TIME_OF_DAY, WEATHER_EFFECTS, OFFICE_EVENTS, DESK_ITEMS } from '../../src/js/data/locations.js';

describe('EnvironmentManager', () => {
    let envManager;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            rankIndex: 0,
            tasksCompleted: 0,
            currentTask: null
        };
        envManager = new EnvironmentManager(mockGameState);
        
        // Mock DOM
        document.body.innerHTML = '<div id="game-container"></div><div class="top-bar-left"></div>';
    });

    // Every test starts clean: no leaked Date/Math spies or fake timers (#1845)
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
        delete window.game;
    });

    describe('constructor', () => {
        it('should initialize with correct default values', () => {
            expect(envManager.gameState).toBe(mockGameState);
            expect(envManager.currentLocation).toBeNull();
            expect(envManager.currentTimeOfDay).toBeNull();
            expect(envManager.currentWeather).toBeNull();
            expect(envManager.activeEvent).toBeNull();
            expect(envManager.eventTimeout).toBeNull();
            expect(envManager.timeUpdateInterval).toBeNull();
        });
    });

    describe('updateLocation', () => {
        // Exact ids, so the hidden flower_store fallthrough can't pass (#74, #2331, #1844)
        it('should return the first location for rank 0', () => {
            mockGameState.rankIndex = 0;
            const location = envManager.updateLocation();
            expect(location.id).toBe('home_office');
        });

        it('should return the highest unlocked location', () => {
            mockGameState.rankIndex = 3;
            expect(envManager.updateLocation().id).toBe('corporate_floor');
            mockGameState.rankIndex = 4;
            expect(envManager.updateLocation().id).toBe('corporate_floor');
            mockGameState.rankIndex = 99;
            expect(envManager.updateLocation().id).toBe('executive_suite');
        });

        it('never picks a hidden decorative location by rank', () => {
            for (let rank = 0; rank <= 10; rank++) {
                expect(EnvironmentManager.locationForRank(rank).hidden).toBeFalsy();
            }
        });

        it('should not change location if already set to same location', () => {
            mockGameState.rankIndex = 0;
            const applySpy = vi.spyOn(envManager, 'applyLocationStyles');
            envManager.updateLocation();
            envManager.updateLocation();
            // The identity guard is what keeps this at one call (#1843)
            expect(applySpy).toHaveBeenCalledTimes(1);
        });

        it('does not toast an unlock on the first sync after loading (#1182)', () => {
            mockGameState.rankIndex = 3;
            mockGameState.tasksCompleted = 20;
            const toast = vi.spyOn(envManager, 'showLocationUnlock');
            envManager.updateLocation();
            expect(toast).not.toHaveBeenCalled();
            mockGameState.rankIndex = 5;
            envManager.updateLocation();
            expect(toast).toHaveBeenCalledTimes(1);
            expect(toast.mock.calls[0][0].id).toBe('innovation_lab');
        });

        it('accepts a location id for dev tools and rejects unknown ids (#2177)', () => {
            expect(envManager.updateLocation('innovation_lab').id).toBe('innovation_lab');
            expect(envManager.updateLocation('not_a_place')).toBeNull();
            expect(envManager.currentLocation.id).toBe('innovation_lab');
        });
    });

    describe('updateTimeOfDay', () => {
        it('follows the in-game time slot, not the computer clock (#921)', () => {
            // slot 5 (21:00) is TimeManager's Night slot, same phase everywhere (#924)
            const cases = [[0, 'morning'], [1, 'morning'], [2, 'afternoon'], [3, 'afternoon'], [4, 'evening'], [5, 'night']];
            for (const [slot, id] of cases) {
                mockGameState.timeManager = { timeSlot: slot };
                expect(envManager.updateTimeOfDay().id).toBe(id);
            }
        });

        it('falls back to the real clock without a TimeManager', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-01-01T23:00:00'));
            expect(envManager.updateTimeOfDay().id).toBe('night');
        });

        it('should return current time of day', () => {
            const timeOfDay = envManager.updateTimeOfDay();
            expect(timeOfDay).toBeDefined();
        });
    });

    describe('updateWeather', () => {
        it('should set a weather condition', () => {
            envManager.updateWeather();
            expect(envManager.currentWeather).toBeDefined();
            expect(WEATHER_EFFECTS).toContainEqual(expect.objectContaining({ id: envManager.currentWeather.id }));
        });

        it('should return current weather', () => {
            const weather = envManager.updateWeather();
            expect(weather).toBeDefined();
        });
    });

    describe('weather and office events (#530)', () => {
        it('picks each weather by its weight band and shows its icon', () => {
            const total = WEATHER_EFFECTS.reduce((s, w) => s + w.weight, 0);
            let acc = 0;
            for (const w of WEATHER_EFFECTS) {
                const mid = (acc + w.weight / 2) / total;
                acc += w.weight;
                vi.spyOn(Math, 'random').mockReturnValue(mid);
                expect(envManager.updateWeather().id).toBe(w.id);
                expect(document.getElementById('weather-indicator').textContent).toBe(w.icon);
                vi.restoreAllMocks();
            }
        });

        it('triggerRandomEvent sets one active event, ignores re-triggers, and clears after its duration', () => {
            vi.useFakeTimers();
            const notify = vi.spyOn(envManager, 'showEventNotification').mockImplementation(() => {});
            envManager.triggerRandomEvent();
            const first = envManager.activeEvent;
            expect(OFFICE_EVENTS).toContain(first);
            envManager.triggerRandomEvent();
            expect(notify).toHaveBeenCalledTimes(1);
            vi.advanceTimersByTime(first.duration + 1);
            expect(envManager.activeEvent).toBeNull();
        });

        it('getBackground layers the office image over a gradient (#1731)', () => {
            envManager.updateLocation('home_office');
            const bg = envManager.getBackground('linear-gradient(red, blue)');
            expect(bg).toContain('url(');
            expect(bg).toContain('linear-gradient(red, blue)');
        });
    });

    describe('getState', () => {
        it('should return current environment state', () => {
            envManager.currentLocation = OFFICE_LOCATIONS[0];
            envManager.currentTimeOfDay = TIME_OF_DAY[0];
            envManager.currentWeather = WEATHER_EFFECTS[0];

            const state = envManager.getState();
            expect(state).toEqual({
                location: envManager.currentLocation,
                timeOfDay: envManager.currentTimeOfDay,
                weather: envManager.currentWeather,
                activeEvent: envManager.activeEvent
            });
        });
    });

    describe('desk collectibles (#2315)', () => {
        it('unlocks DESK_ITEMS once tasksCompleted reaches unlockedAfter', () => {
            const ids = (n) => EnvironmentManager.unlockedDeskItems(n).map(item => item.id);
            expect(ids(0)).toEqual(['coffee_mug']);
            expect(ids(1)).toEqual(['coffee_mug', 'stress_ball']);
            expect(ids(2)).toEqual(['coffee_mug', 'plant', 'stress_ball']);
            expect(ids(15)).toEqual(DESK_ITEMS.map(item => item.id));
            expect(EnvironmentManager.unlockedDeskItems(undefined)).toEqual(EnvironmentManager.unlockedDeskItems(0));
        });

        it('renders unlocked icons into the top bar', () => {
            mockGameState.tasksCompleted = 3;
            const shown = envManager.renderDeskItems();
            const strip = document.getElementById('desk-collectibles');
            expect(strip.parentElement.className).toBe('top-bar-left');
            expect(strip.getAttribute('aria-label')).toBe('Desk decorations');
            expect([...strip.querySelectorAll('[data-item-id]')].map(el => el.getAttribute('data-item-id')))
                .toEqual(shown.map(item => item.id));
            expect(strip.querySelector('[data-item-id="coffee_mug"]').textContent).toBe('☕');
            expect(strip.querySelector('[data-item-id="photo_frame"]').getAttribute('aria-label')).toBe('Photo Frame');
            expect(strip.querySelector('[data-item-id="trophy"]')).toBeNull();
        });

        it('toasts only decorations that newly cross a threshold', () => {
            mockGameState.tasksCompleted = 0;
            envManager.renderDeskItems();
            const toast = vi.fn();
            window.game = { showToast: toast };
            mockGameState.tasksCompleted = 2;
            envManager.syncDeskItems({ announce: true });
            expect(toast.mock.calls.map(call => call[0])).toEqual([
                'Desk decoration unlocked: Desk Plant',
                'Desk decoration unlocked: Stress Ball'
            ]);
            envManager.syncDeskItems({ announce: true });
            expect(toast).toHaveBeenCalledTimes(2);
            delete window.game;
        });

        it('does not toast when the strip is painted for the first time', () => {
            const toast = vi.fn();
            window.game = { showToast: toast };
            mockGameState.tasksCompleted = 15;
            envManager.syncDeskItems({ announce: true });
            expect(toast).not.toHaveBeenCalled();
            expect(document.querySelectorAll('#desk-collectibles [data-item-id]')).toHaveLength(DESK_ITEMS.length);
            delete window.game;
        });

        it('updateLocation refreshes the strip without waiting for a new office', () => {
            envManager.updateLocation();
            expect(document.querySelectorAll('#desk-collectibles [data-item-id]')).toHaveLength(1);
            mockGameState.tasksCompleted = 5;
            envManager.updateLocation();
            expect(document.querySelector('[data-item-id="trophy"]')).not.toBeNull();
        });
    });

    describe('destroy', () => {
        it('should clear intervals and timeouts', () => {
            envManager.eventTimeout = setTimeout(() => {}, 1000);
            envManager.timeUpdateInterval = setInterval(() => {}, 1000);

            const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
            const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

            envManager.destroy();

            expect(clearTimeoutSpy).toHaveBeenCalled();
            expect(clearIntervalSpy).toHaveBeenCalled();
        });
    });
});

