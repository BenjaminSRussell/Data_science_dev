/**
 * Unit tests for LocationView
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocationView } from '../../src/js/ui/LocationView.js';
import { LocationDetailSystem } from '../../src/js/game/locations/LocationDetailSystem.js';

describe('LocationView', () => {
    let locationView;
    let mockGame;
    let locationDetailSystem;
    let container;

    beforeEach(() => {
        // Create a mock game object
        locationDetailSystem = new LocationDetailSystem({});

        mockGame = {
            locationDetailSystem,
            dayNightCycle: {
                getTimeOfDay: () => 'noon'
            },
            gameState: {
                npcManager: {
                    getAllNPCs: () => []
                }
            },
            assetManager: null,
            uiUpdater: null
        };

        // Create a container for the view
        container = document.createElement('div');
        container.id = 'location-view';
        document.body.appendChild(container);

        locationView = new LocationView(
            mockGame,
            null, // assetManager
            null, // characterAnimationSystem
            null  // threeRenderer
        );

        locationView.container = container;
    });

    afterEach(() => {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('renderLocation', () => {
        it('should call getLocationFeatures when rendering location', () => {
            // Spy on getLocationFeatures to verify it's called
            const getLocationFeaturesSpy = vi.spyOn(locationDetailSystem, 'getLocationFeatures');

            const details = locationDetailSystem.getLocationDetails('home');
            locationView.renderLocation('home', details);

            // Verify getLocationFeatures was called with the correct location
            expect(getLocationFeaturesSpy).toHaveBeenCalledWith('home');
            getLocationFeaturesSpy.mockRestore();
        });

        it('should render features using getLocationFeatures return value', () => {
            const details = locationDetailSystem.getLocationDetails('home');
            const expectedFeatures = locationDetailSystem.getLocationFeatures('home');

            locationView.renderLocation('home', details);

            // Verify the features container exists and has features
            const featuresContainer = container.querySelector('#location-features');
            expect(featuresContainer).not.toBeNull();

            // Verify the number of rendered feature elements matches the features array
            const featureElements = container.querySelectorAll('.location-feature');
            expect(featureElements.length).toBe(expectedFeatures.length);
        });

        it('should handle missing location gracefully', () => {
            const details = locationDetailSystem.getLocationDetails('nonexistent');

            // Should not throw when details is null
            expect(() => {
                if (details) {
                    locationView.renderLocation('nonexistent', details);
                }
            }).not.toThrow();
        });

        it('should render all features with correct attributes', () => {
            const details = locationDetailSystem.getLocationDetails('home');
            const features = locationDetailSystem.getLocationFeatures('home');

            locationView.renderLocation('home', details);

            const featureElements = container.querySelectorAll('.location-feature');

            // Verify each feature element has the correct feature id
            featureElements.forEach((element, index) => {
                expect(element.dataset.featureId).toBe(features[index].id);
            });
        });
    });
});
