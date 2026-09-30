/**
 * WorldMap Unit Tests
 * Verifies that dead code has been removed
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorldMap, LOCATIONS } from '../../src/js/game/WorldMap.js';

// Mock GameState
class MockGameState {
    constructor() {
        this.money = 10000;
        this.reputation = 0;
        this.characterStats = {
            getStat: () => 0
        };
    }
}

describe('WorldMap Dead Code Removal', () => {
    let worldMap;
    let gameState;

    beforeEach(() => {
        gameState = new MockGameState();
        worldMap = new WorldMap(gameState);
    });

    describe('getCurrentActivities removal', () => {
        it('should not have getCurrentActivities method as a public API', () => {
            // getCurrentActivities was dead code - never called from anywhere
            // Activities should be read directly from location.activities instead
            expect(typeof worldMap.getCurrentActivities).toBe('undefined');
        });

        it('should access activities directly from current location', () => {
            const currentLocation = worldMap.getCurrentLocation();
            expect(currentLocation.activities).toBeDefined();
            expect(Array.isArray(currentLocation.activities)).toBe(true);
        });
    });

    describe('visitedLocations removal', () => {
        it('should not track visitedLocations in public API', () => {
            // visitedLocations was never read by anything - dead tracking code
            expect(worldMap.visitedLocations).toBeUndefined();
        });
    });

    describe('locationOverrides removal', () => {
        it('should not have locationOverrides in public API', () => {
            // locationOverrides was never set or read - completely inert state
            expect(worldMap.locationOverrides).toBeUndefined();
        });
    });

    describe('Serialization without dead code', () => {
        it('should serialize without visitedLocations and locationOverrides', () => {
            worldMap.travelTo('office');
            const serialized = worldMap.toJSON();

            // After removal, these should not be in the serialized output
            expect(serialized.visitedLocations).toBeUndefined();
            expect(serialized.locationOverrides).toBeUndefined();
        });

        it('should deserialize cleanly without dead code fields', () => {
            const data = {
                currentLocation: 'office',
                currentVehicle: 'walking',
                ownedVehicles: ['walking', 'bus_pass'],
                // visitedLocations and locationOverrides should be absent
            };

            worldMap.fromJSON(data);
            expect(worldMap.currentLocation).toBe('office');
            expect(worldMap.ownedVehicles.has('bus_pass')).toBe(true);
        });
    });

    describe('Activities access pattern', () => {
        it('should use location.activities pattern that UIUpdater expects', () => {
            // This is the pattern UIUpdater.js uses: locationData.activities
            const locationData = worldMap.getCurrentLocation();
            const activities = locationData.activities || [];

            expect(Array.isArray(activities)).toBe(true);
            // home location should have these activities
            expect(activities).toContain('work');
            expect(activities).toContain('rest');
        });
    });
});
