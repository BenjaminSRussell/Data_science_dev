/**
 * MapManager Unit Tests
 * Tests the main map manager wiring, initialization, and orchestration logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MapManager } from '../../src/js/game/MapManager.js';

// Mock all the sub-systems
vi.mock('../../src/js/game/MapGridSystem.js', () => ({
    MapGridSystem: vi.fn(() => ({
        totalWidth: 600,
        totalHeight: 600,
        gridToPercent: vi.fn((x, y, w, h) => ({ x: (x / w) * 100, y: (y / h) * 100 })),
    })),
}));

vi.mock('../../src/js/game/MapRoadSystem.js', () => ({
    MapRoadSystem: vi.fn(),
}));

vi.mock('../../src/js/game/MapZoneSystem.js', () => ({
    MapZoneSystem: vi.fn(() => ({
        getZoneAt: vi.fn(),
        findZoneForLocationType: vi.fn(),
        assignLocationToZone: vi.fn(),
        getZoneById: vi.fn(),
        getAllZones: vi.fn(() => []),
    })),
}));

vi.mock('../../src/js/game/MapBlockSystem.js', () => ({
    MapBlockSystem: vi.fn(() => ({
        getBlockAt: vi.fn(),
        findAvailableBlock: vi.fn(),
        assignLocationToBlock: vi.fn(),
    })),
}));

vi.mock('../../src/js/game/MapBuildingSystem.js', () => ({
    MapBuildingSystem: vi.fn(() => ({
        placeBuilding: vi.fn(),
    })),
}));

vi.mock('../../src/js/game/MapAssetPlacer.js', () => ({
    MapAssetPlacer: vi.fn(),
}));

vi.mock('../../src/js/game/MapEnvironmentSystem.js', () => ({
    MapEnvironmentSystem: vi.fn(() => ({
        initialize: vi.fn(),
    })),
}));

vi.mock('../../src/js/game/MapNavigationSystem.js', () => ({
    MapNavigationSystem: vi.fn(),
}));

vi.mock('../../src/js/game/MapRoadRenderer.js', () => ({
    MapRoadRenderer: vi.fn(() => ({
        render: vi.fn(),
        update: vi.fn(),
    })),
}));

// Mock LOCATIONS with test data
vi.mock('../../src/js/game/WorldMap.js', () => ({
    LOCATIONS: [
        {
            id: 'location-with-position',
            type: 'residence',
            position: { x: 5, y: 5 },
        },
        {
            id: 'location-without-position',
            type: 'work',
            // no position property
        },
        {
            id: 'location-no-zone',
            type: 'education',
            position: { x: 15, y: 15 },
        },
    ],
}));

describe('MapManager', () => {
    let mapManager;
    let mockContainer;

    beforeEach(() => {
        // Mock container element
        mockContainer = {
            offsetWidth: 800,
            offsetHeight: 600,
        };

        // Create the MapManager with mocked dependencies
        mapManager = new MapManager(mockContainer, {});
    });

    describe('Constructor & Initialization', () => {
        it('should instantiate all sub-systems in order', () => {
            const { MapGridSystem, MapRoadSystem, MapZoneSystem, MapBlockSystem, MapBuildingSystem, MapAssetPlacer, MapEnvironmentSystem, MapNavigationSystem, MapRoadRenderer } = await import('vitest');

            expect(mapManager.gridSystem).toBeDefined();
            expect(mapManager.roadSystem).toBeDefined();
            expect(mapManager.zoneSystem).toBeDefined();
            expect(mapManager.blockSystem).toBeDefined();
            expect(mapManager.buildingSystem).toBeDefined();
            expect(mapManager.assetPlacer).toBeDefined();
            expect(mapManager.environmentSystem).toBeDefined();
            expect(mapManager.navigationSystem).toBeDefined();
            expect(mapManager.roadRenderer).toBeDefined();
        });

        it('should call placeLocations() after instantiation', () => {
            // Verify that zone assignments happened (from placeLocations)
            expect(mapManager.zoneSystem.assignLocationToZone).toHaveBeenCalled();
        });

        it('should call environmentSystem.initialize() after placeLocations()', () => {
            expect(mapManager.environmentSystem.initialize).toHaveBeenCalled();
        });

        it('should store container reference', () => {
            expect(mapManager.container).toBe(mockContainer);
        });
    });

    describe('placeLocations()', () => {
        it('should skip locations without position property', () => {
            // location-without-position should not trigger zone assignment
            const assignmentCalls = mapManager.zoneSystem.assignLocationToZone.mock.calls;
            const assignedIds = assignmentCalls.map(call => call[0]);
            expect(assignedIds).not.toContain('location-without-position');
        });

        it('should resolve zone using getZoneAt for locations with position', () => {
            expect(mapManager.zoneSystem.getZoneAt).toHaveBeenCalledWith(5, 5);
        });

        it('should assign location to zone when zone is found', () => {
            // Setup: mock getZoneAt to return a zone
            const mockZone = { id: 'zone-1', type: 'residential' };
            mapManager.zoneSystem.getZoneAt.mockReturnValueOnce(mockZone);

            // Recreate manager to trigger placeLocations with new mock
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.zoneSystem.assignLocationToZone).toHaveBeenCalledWith('location-with-position', 'zone-1');
        });

        it('should find block using getBlockAt when zone exists', () => {
            // Setup: mock getZoneAt to return a zone
            const mockZone = { id: 'zone-1', type: 'residential' };
            mapManager.zoneSystem.getZoneAt.mockReturnValueOnce(mockZone);

            // Recreate manager to trigger placeLocations with new mock
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.blockSystem.getBlockAt).toHaveBeenCalledWith(5, 5);
        });

        it('should fallback to findAvailableBlock if getBlockAt returns null', () => {
            // Setup: mock getZoneAt to return a zone, getBlockAt to return null
            const mockZone = { id: 'zone-1', type: 'residential' };
            mapManager.zoneSystem.getZoneAt.mockReturnValueOnce(mockZone);
            mapManager.blockSystem.getBlockAt.mockReturnValueOnce(null);

            // Recreate manager to trigger placeLocations with new mock
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.blockSystem.findAvailableBlock).toHaveBeenCalledWith('residential', 1);
        });

        it('should place building when block is found', () => {
            // Setup: mock all systems to return valid objects
            const mockZone = { id: 'zone-1', type: 'residential' };
            const mockBlock = { id: 'block-1' };
            mapManager.zoneSystem.getZoneAt.mockReturnValueOnce(mockZone);
            mapManager.blockSystem.getBlockAt.mockReturnValueOnce(mockBlock);

            // Recreate manager to trigger placeLocations with new mock
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.buildingSystem.placeBuilding).toHaveBeenCalled();
        });

        it('should not place building when no block is found', () => {
            // Setup: mock getZoneAt to return a zone, but both block methods return null
            const mockZone = { id: 'zone-1', type: 'residential' };
            mapManager.zoneSystem.getZoneAt.mockReturnValueOnce(mockZone);
            mapManager.blockSystem.getBlockAt.mockReturnValueOnce(null);
            mapManager.blockSystem.findAvailableBlock.mockReturnValueOnce(null);

            // Recreate manager to trigger placeLocations with new mock
            mapManager = new MapManager(mockContainer, {});

            // placeBuilding should not have been called for this location
            expect(mapManager.buildingSystem.placeBuilding).not.toHaveBeenCalledWith(
                expect.objectContaining({ id: 'location-with-position' })
            );
        });

        it('should use no-zone fallback with findZoneForLocationType', () => {
            // Setup: mock getZoneAt to return null
            mapManager.zoneSystem.getZoneAt.mockReturnValueOnce(null);

            // Recreate manager to trigger placeLocations with new mock
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.zoneSystem.findZoneForLocationType).toHaveBeenCalledWith('residence');
        });

        it('should fallback cascade: find zone by type -> find block -> place building', () => {
            // Setup: mock getZoneAt to return null, then findZoneForLocationType returns zone
            const mockZone = { id: 'zone-fallback', type: 'residential' };
            const mockBlock = { id: 'block-fallback' };
            mapManager.zoneSystem.getZoneAt.mockReturnValueOnce(null);
            mapManager.zoneSystem.findZoneForLocationType.mockReturnValueOnce(mockZone);
            mapManager.blockSystem.findAvailableBlock.mockReturnValueOnce(mockBlock);

            // Recreate manager to trigger placeLocations with new mock
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.zoneSystem.assignLocationToZone).toHaveBeenCalledWith('location-with-position', 'zone-fallback');
            expect(mapManager.blockSystem.assignLocationToBlock).toHaveBeenCalledWith('location-with-position', 'block-fallback');
            expect(mapManager.buildingSystem.placeBuilding).toHaveBeenCalled();
        });
    });

    describe('render()', () => {
        it('should delegate to roadRenderer.render()', () => {
            mapManager.render();
            expect(mapManager.roadRenderer.render).toHaveBeenCalled();
        });

        it('should not directly access zone/block/building/environment', () => {
            // Just verify that render only calls roadRenderer
            mapManager.render();
            // Count calls to roadRenderer.render (should be 1)
            expect(mapManager.roadRenderer.render).toHaveBeenCalledTimes(1);
        });
    });

    describe('gridToPercent()', () => {
        it('should convert grid coordinates to percentage using container dimensions', () => {
            const result = mapManager.gridToPercent(10, 15);

            // Should call gridSystem.gridToPercent with container dimensions
            expect(mapManager.gridSystem.gridToPercent).toHaveBeenCalledWith(10, 15, 800, 600);
        });

        it('should fallback to gridSystem dimensions when container.offsetWidth is falsy', () => {
            mockContainer.offsetWidth = 0;
            mapManager = new MapManager(mockContainer, {});

            mapManager.gridToPercent(10, 15);

            // Should use gridSystem.totalWidth instead
            expect(mapManager.gridSystem.gridToPercent).toHaveBeenCalledWith(10, 15, 600, 600);
        });

        it('should fallback to gridSystem dimensions when container.offsetHeight is falsy', () => {
            mockContainer.offsetHeight = 0;
            mapManager = new MapManager(mockContainer, {});

            mapManager.gridToPercent(10, 15);

            // Should use gridSystem.totalHeight instead
            expect(mapManager.gridSystem.gridToPercent).toHaveBeenCalledWith(10, 15, 800, 600);
        });

        it('should fallback to gridSystem dimensions when both container dimensions are falsy', () => {
            mockContainer.offsetWidth = null;
            mockContainer.offsetHeight = undefined;
            mapManager = new MapManager(mockContainer, {});

            mapManager.gridToPercent(10, 15);

            // Should use both gridSystem dimensions
            expect(mapManager.gridSystem.gridToPercent).toHaveBeenCalledWith(10, 15, 600, 600);
        });
    });

    describe('update()', () => {
        it('should delegate to roadRenderer.update()', () => {
            mapManager.update();
            expect(mapManager.roadRenderer.update).toHaveBeenCalled();
        });
    });

    describe('Getter Methods', () => {
        it('should return gridSystem via getGridSystem()', () => {
            expect(mapManager.getGridSystem()).toBe(mapManager.gridSystem);
        });

        it('should return roadSystem via getRoadSystem()', () => {
            expect(mapManager.getRoadSystem()).toBe(mapManager.roadSystem);
        });

        it('should return zoneSystem via getZoneSystem()', () => {
            expect(mapManager.getZoneSystem()).toBe(mapManager.zoneSystem);
        });

        it('should return blockSystem via getBlockSystem()', () => {
            expect(mapManager.getBlockSystem()).toBe(mapManager.blockSystem);
        });

        it('should return buildingSystem via getBuildingSystem()', () => {
            expect(mapManager.getBuildingSystem()).toBe(mapManager.buildingSystem);
        });

        it('should return navigationSystem via getNavigationSystem()', () => {
            expect(mapManager.getNavigationSystem()).toBe(mapManager.navigationSystem);
        });
    });

    describe('Configuration Passing', () => {
        it('should pass grid config to MapGridSystem constructor', () => {
            const gridConfig = { gridWidth: 40, tileSize: 25 };
            const { MapGridSystem } = await import('../../src/js/game/MapGridSystem.js');

            // Create new MapManager with config
            new MapManager(mockContainer, { grid: gridConfig });

            // Verify MapGridSystem was called with the grid config
            expect(MapGridSystem).toHaveBeenCalledWith(gridConfig);
        });

        it('should use default config when none provided', () => {
            const { MapGridSystem } = await import('../../src/js/game/MapGridSystem.js');

            // Create new MapManager without config
            new MapManager(mockContainer);

            // Verify MapGridSystem was called with empty object
            expect(MapGridSystem).toHaveBeenCalledWith({});
        });
    });
});
