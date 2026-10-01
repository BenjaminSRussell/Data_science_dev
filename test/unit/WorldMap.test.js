/**
 * WorldMap Unit Tests
 * Verifies that dead code has been removed and live state is kept
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

    // #2355 called locationOverrides inert, but #2014's switchMap() now
    // writes map-specific locations into it, so it is live state that must
    // survive save/load.
    describe('locationOverrides (used by switchMap, #2014)', () => {
        it('should start empty', () => {
            expect(worldMap.locationOverrides).toEqual({});
        });

        it('should round-trip map-specific locations through toJSON/fromJSON', () => {
            worldMap.locationOverrides = {
                pier: { id: 'pier', name: 'Pier', activities: ['rest'] }
            };
            const serialized = worldMap.toJSON();

            const restored = new WorldMap(new MockGameState());
            restored.fromJSON(serialized);

            expect(restored.locationOverrides.pier.name).toBe('Pier');
            expect(restored.getLocation('pier')?.name).toBe('Pier');
        });
    });

    describe('Serialization without dead code', () => {
        it('should serialize without visitedLocations', () => {
            worldMap.travelTo('office');
            const serialized = worldMap.toJSON();

            // After removal, this should not be in the serialized output
            expect(serialized.visitedLocations).toBeUndefined();
        });

        it('should deserialize cleanly without dead code fields', () => {
            const data = {
                currentLocation: 'office',
                currentVehicle: 'walking',
                ownedVehicles: ['walking', 'bus_pass'],
                // visitedLocations should be absent
            };

            worldMap.fromJSON(data);
            expect(worldMap.currentLocation).toBe('office');
            expect(worldMap.ownedVehicles.has('bus_pass')).toBe(true);
            expect(worldMap.locationOverrides).toEqual({});
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
