import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UnifiedMapSystem } from '../../src/js/game/UnifiedMapSystem.js';

describe('UnifiedMapSystem - World Map Removal', () => {
    let mapSystem;

    beforeEach(() => {
        // Create a mock container
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);

        // Create a mock game object
        const mockGame = {
            worldMap: {
                getAccessibleLocations: () => [],
                currentLocation: null,
                getCurrentLocation: () => ({ position: { x: 15, y: 15 } })
            },
            gameState: {},
            handleTravel: () => {}
        };

        // Create map system
        mapSystem = new UnifiedMapSystem(container, mockGame);
    });

    afterEach(() => {
        if (mapSystem && mapSystem.container) {
            mapSystem.container.remove();
        }
    });

    describe('World map methods removed', () => {
        it('should not have renderWorldMap method', () => {
            expect(typeof mapSystem.renderWorldMap).toBe('undefined');
        });

        it('should not have showWorldMap method', () => {
            expect(typeof mapSystem.showWorldMap).toBe('undefined');
        });

        it('should not have addWorldNavigation method', () => {
            expect(typeof mapSystem.addWorldNavigation).toBe('undefined');
        });

        it('should not have zoomToLocalMap method', () => {
            expect(typeof mapSystem.zoomToLocalMap).toBe('undefined');
        });

        it('should not have renderWorldTerrain method', () => {
            expect(typeof mapSystem.renderWorldTerrain).toBe('undefined');
        });

        it('should not have renderWorldWater method', () => {
            expect(typeof mapSystem.renderWorldWater).toBe('undefined');
        });

        it('should not have renderWorldMountains method', () => {
            expect(typeof mapSystem.renderWorldMountains).toBe('undefined');
        });

        it('should not have renderWorldSettlements method', () => {
            expect(typeof mapSystem.renderWorldSettlements).toBe('undefined');
        });
    });

    describe('World map properties removed', () => {
        it('should not have worldGridSize property', () => {
            expect(mapSystem.worldGridSize).toBeUndefined();
        });

        it('should not set currentView to "world"', () => {
            // If currentView exists, it should never be 'world'
            if (mapSystem.currentView !== undefined) {
                expect(mapSystem.currentView).not.toBe('world');
            }
        });
    });

    describe('Local map methods preserved', () => {
        it('should have renderLocalMap method', () => {
            expect(typeof mapSystem.renderLocalMap).toBe('function');
        });

        it('should have gridSize for local map set to 30', () => {
            expect(mapSystem.gridSize).toBe(30);
        });

        it('should have renderLocalGrass method', () => {
            expect(typeof mapSystem.renderLocalGrass).toBe('function');
        });

        it('should have renderLocalZones method', () => {
            expect(typeof mapSystem.renderLocalZones).toBe('function');
        });

        it('should have renderLocalParks method', () => {
            expect(typeof mapSystem.renderLocalParks).toBe('function');
        });

        it('should have renderLocalRoads method', () => {
            expect(typeof mapSystem.renderLocalRoads).toBe('function');
        });

        it('should have renderLocalBuildings method', () => {
            expect(typeof mapSystem.renderLocalBuildings).toBe('function');
        });

        it('should have renderLocalLocations method', () => {
            expect(typeof mapSystem.renderLocalLocations).toBe('function');
        });

        it('should have renderPlayerMarker method', () => {
            expect(typeof mapSystem.renderPlayerMarker).toBe('function');
        });
    });

    describe('Core methods preserved', () => {
        it('should have handleResize method', () => {
            expect(typeof mapSystem.handleResize).toBe('function');
        });

        it('should have update method', () => {
            expect(typeof mapSystem.update).toBe('function');
        });

        it('should have destroy method', () => {
            expect(typeof mapSystem.destroy).toBe('function');
        });

        it('should have initialize method', () => {
            expect(typeof mapSystem.initialize).toBe('function');
        });

        it('should have createLayers method', () => {
            expect(typeof mapSystem.createLayers).toBe('function');
        });
    });
});
