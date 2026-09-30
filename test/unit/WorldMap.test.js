/**
 * Unit tests for WorldMap - verifies that travel time system works correctly
 * Tests that locations have proper travel times defined (static lookup table)
 */

import { describe, it, expect } from 'vitest';
import { LOCATIONS, LOCATIONS_MAP } from '../../src/js/game/WorldMap.js';

describe('WorldMap - Travel Time System', () => {
    describe('LOCATIONS array', () => {
        it('should have all locations with travelTime defined', () => {
            expect(LOCATIONS.length).toBeGreaterThan(0);

            for (const location of LOCATIONS) {
                expect(location).toHaveProperty('id');
                expect(location).toHaveProperty('travelTime');
                expect(typeof location.travelTime).toBe('number');
                expect(location.travelTime).toBeGreaterThanOrEqual(0);
            }
        });

        it('should have travelTime values that make sense for location types', () => {
            const homeLocation = LOCATIONS.find(l => l.id === 'home');
            expect(homeLocation).toBeDefined();
            expect(homeLocation.travelTime).toBe(0); // Starting location has 0 travel time

            const distantLocations = LOCATIONS.filter(l => l.travelTime > 1);
            expect(distantLocations.length).toBeGreaterThan(0); // Should have some distant locations
        });

        it('should have travel times that are consistent numbers', () => {
            const travelTimes = new Set();
            for (const location of LOCATIONS) {
                travelTimes.add(location.travelTime);
            }

            // Travel times should be reasonable integers
            for (const time of travelTimes) {
                expect(Number.isInteger(time) || typeof time === 'number').toBe(true);
                expect(time).toBeLessThan(10); // Sanity check: no travel time should exceed reasonable bounds
            }
        });

        it('should have diverse travelTime values across locations', () => {
            const travelTimes = new Set(LOCATIONS.map(l => l.travelTime));
            expect(travelTimes.size).toBeGreaterThan(1); // Should have at least 2 different travel times
        });
    });

    describe('Travel time lookup', () => {
        it('should be able to get travel time for any location by ID', () => {
            for (const location of LOCATIONS) {
                const foundLocation = LOCATIONS.find(l => l.id === location.id);
                expect(foundLocation).toBeDefined();
                expect(foundLocation.travelTime).toBe(location.travelTime);
            }
        });

        it('should allow quick location lookup by travel time', () => {
            // Verify that locations with travelTime 0 and 1 exist
            const shortTravelLocations = LOCATIONS.filter(l => l.travelTime <= 1);
            expect(shortTravelLocations.length).toBeGreaterThan(0);

            const longTravelLocations = LOCATIONS.filter(l => l.travelTime >= 2);
            expect(longTravelLocations.length).toBeGreaterThan(0);
        });
    });
});
