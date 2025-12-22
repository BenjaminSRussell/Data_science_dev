/**
 * Unit tests for EnvironmentManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnvironmentManager } from '../../src/js/game/EnvironmentManager.js';
import { OFFICE_LOCATIONS, TIME_OF_DAY, WEATHER_EFFECTS } from '../../src/js/data/locations.js';

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
        document.body.innerHTML = '<div id="game-container"></div>';
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
        it('should return the first location for rank 0', () => {
            mockGameState.rankIndex = 0;
            const location = envManager.updateLocation();
            expect(location).toBeDefined();
            expect(location.rankRequired).toBe(0);
        });

        it('should return the highest unlocked location', () => {
            mockGameState.rankIndex = 3;
            const location = envManager.updateLocation();
            expect(location).toBeDefined();
            expect(location.rankRequired).toBeLessThanOrEqual(3);
        });

        it('should not change location if already set to same location', () => {
            mockGameState.rankIndex = 0;
            envManager.updateLocation();
            const firstLocation = envManager.currentLocation;
            envManager.updateLocation();
            expect(envManager.currentLocation).toBe(firstLocation);
        });
    });

    describe('updateTimeOfDay', () => {
        it('should set time of day based on current hour', () => {
            // Mock Date
            const mockDate = new Date('2024-01-01T10:00:00');
            vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
            vi.spyOn(mockDate, 'getHours').mockReturnValue(10);

            envManager.updateTimeOfDay();
            expect(envManager.currentTimeOfDay).toBeDefined();
            expect(envManager.currentTimeOfDay.id).toBe('morning');
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

