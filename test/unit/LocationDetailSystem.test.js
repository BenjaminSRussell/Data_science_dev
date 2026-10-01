/**
 * Unit tests for LocationDetailSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocationDetailSystem } from '../../src/js/game/locations/LocationDetailSystem.js';

describe('LocationDetailSystem', () => {
    let system;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {};
        system = new LocationDetailSystem(mockGameState);
    });

    describe('getLocationFeatures', () => {
        it('should return features array for valid location', () => {
            const features = system.getLocationFeatures('home');
            expect(Array.isArray(features)).toBe(true);
            expect(features.length).toBeGreaterThan(0);
            expect(features[0].id).toBe('bed');
            expect(features[0].name).toBe('Bed');
        });

        it('should return empty array for invalid location', () => {
            const features = system.getLocationFeatures('nonexistent');
            expect(features).toEqual([]);
        });

        it('should be called by interactWithFeature method', () => {
            // Spy on getLocationFeatures to verify it's called
            const getLocationFeaturesSpy = vi.spyOn(system, 'getLocationFeatures');

            system.interactWithFeature('home', 'bed');

            expect(getLocationFeaturesSpy).toHaveBeenCalledWith('home');
            getLocationFeaturesSpy.mockRestore();
        });

    });

    describe('interactWithFeature', () => {
        it('should return interaction result for valid feature', () => {
            const result = system.interactWithFeature('home', 'bed');
            expect(result).not.toBeNull();
            expect(result.feature.id).toBe('bed');
            expect(result.action).toBe('rest');
        });

        it('should return null for invalid location', () => {
            const result = system.interactWithFeature('invalid', 'bed');
            expect(result).toBeNull();
        });

        it('should return null for invalid feature', () => {
            const result = system.interactWithFeature('home', 'nonexistent');
            expect(result).toBeNull();
        });

        it('should use getLocationFeatures internally', () => {
            // Verify that interactWithFeature uses the features from getLocationFeatures
            const features = system.getLocationFeatures('home');
            const result = system.interactWithFeature('home', 'bed');

            // The result feature should match the one from getLocationFeatures
            const expectedFeature = features.find(f => f.id === 'bed');
            expect(result.feature).toEqual(expectedFeature);
        });
    });

    describe('getLocationDetails', () => {
        it('should return location details for valid location', () => {
            const details = system.getLocationDetails('home');
            expect(details).not.toBeNull();
            expect(details.name).toBe('Your Apartment');
            expect(details.features).toBeDefined();
        });

        it('should return null for invalid location', () => {
            const details = system.getLocationDetails('nonexistent');
            expect(details).toBeNull();
        });
    });
});
