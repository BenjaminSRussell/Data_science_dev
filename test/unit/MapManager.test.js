/**
 * MapManager Unit Tests
 * Tests the main map manager wiring, initialization, and orchestration logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Store mock instances to be reused
let zoneSystemInstance;
let blockSystemInstance;
let buildingSystemInstance;
let gridSystemInstance;

// Track constructor call order
const constructorCallOrder = [];

// Track the last config passed to MapGridSystem
let lastGridSystemConfig;

// Factory functions for creating mocks
const createMockZoneSystem = () => ({
    getZoneAt: vi.fn(),
    findZoneForLocationType: vi.fn(),
    assignLocationToZone: vi.fn(),
    getZoneById: vi.fn(),
    getAllZones: vi.fn(() => []),
});

const createMockBlockSystem = () => ({
    getBlockAt: vi.fn(),
    findAvailableBlock: vi.fn(),
    assignLocationToBlock: vi.fn(),
});

const createMockBuildingSystem = () => ({
    placeBuilding: vi.fn(),
});

const createMockGridSystem = () => ({
    totalWidth: 600,
    totalHeight: 600,
    gridToPercent: vi.fn((x, y, w, h) => ({ x: (x / w) * 100, y: (y / h) * 100 })),
});

// Mock all the sub-systems with factory functions that can return pre-configured instances
vi.mock('../../src/js/game/MapGridSystem.js', () => ({
    MapGridSystem: vi.fn((config) => {
        constructorCallOrder.push('MapGridSystem');
        lastGridSystemConfig = config;
        if (!gridSystemInstance) {
            gridSystemInstance = createMockGridSystem();
        }
        return gridSystemInstance;
    }),
}));

vi.mock('../../src/js/game/MapRoadSystem.js', () => ({
    MapRoadSystem: vi.fn(() => {
        constructorCallOrder.push('MapRoadSystem');
    }),
}));

vi.mock('../../src/js/game/MapZoneSystem.js', () => ({
    MapZoneSystem: vi.fn(() => {
        constructorCallOrder.push('MapZoneSystem');
        if (!zoneSystemInstance) {
            zoneSystemInstance = createMockZoneSystem();
        }
        return zoneSystemInstance;
    }),
}));

vi.mock('../../src/js/game/MapBlockSystem.js', () => ({
    MapBlockSystem: vi.fn(() => {
        constructorCallOrder.push('MapBlockSystem');
        if (!blockSystemInstance) {
            blockSystemInstance = createMockBlockSystem();
        }
        return blockSystemInstance;
    }),
}));

vi.mock('../../src/js/game/MapBuildingSystem.js', () => ({
    MapBuildingSystem: vi.fn(() => {
        constructorCallOrder.push('MapBuildingSystem');
        if (!buildingSystemInstance) {
            buildingSystemInstance = createMockBuildingSystem();
        }
        return buildingSystemInstance;
    }),
}));

vi.mock('../../src/js/game/MapAssetPlacer.js', () => ({
    MapAssetPlacer: vi.fn(() => {
        constructorCallOrder.push('MapAssetPlacer');
    }),
}));

vi.mock('../../src/js/game/MapEnvironmentSystem.js', () => ({
    MapEnvironmentSystem: vi.fn(() => {
        constructorCallOrder.push('MapEnvironmentSystem');
        return {
            initialize: vi.fn(),
        };
    }),
}));

vi.mock('../../src/js/game/MapNavigationSystem.js', () => ({
    MapNavigationSystem: vi.fn(() => {
        constructorCallOrder.push('MapNavigationSystem');
    }),
}));

vi.mock('../../src/js/game/MapRoadRenderer.js', () => ({
    MapRoadRenderer: vi.fn(() => {
        constructorCallOrder.push('MapRoadRenderer');
        return {
            render: vi.fn(),
            update: vi.fn(),
        };
    }),
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

import { MapManager } from '../../src/js/game/MapManager.js';

describe('MapManager', () => {
    let mapManager;
    let mockContainer;

    beforeEach(() => {
        // Clear mock instances to force new ones to be created
        zoneSystemInstance = null;
        blockSystemInstance = null;
        buildingSystemInstance = null;
        gridSystemInstance = null;

        // Clear constructor call order tracking
        constructorCallOrder.length = 0;
        lastGridSystemConfig = undefined;

        // Clear all mock call histories
        vi.clearAllMocks();

        // Mock container element
        mockContainer = {
            offsetWidth: 800,
            offsetHeight: 600,
        };

        // Create the MapManager with mocked dependencies
        // Pre-configure default mocks to make placeLocations work
        zoneSystemInstance = createMockZoneSystem();
        blockSystemInstance = createMockBlockSystem();
        buildingSystemInstance = createMockBuildingSystem();

        // Default behavior: getZoneAt returns a zone, getBlockAt returns a block
        zoneSystemInstance.getZoneAt.mockReturnValue({ id: 'default-zone', type: 'residential' });
        blockSystemInstance.getBlockAt.mockReturnValue({ id: 'default-block' });

        vi.clearAllMocks();
        constructorCallOrder.length = 0;
        lastGridSystemConfig = undefined;
        mapManager = new MapManager(mockContainer, {});
    });

    describe('Constructor & Initialization', () => {
        it('should instantiate all sub-systems in order', () => {
            // Verify systems were created in the correct order using our tracked call order
            const expectedOrder = [
                'MapGridSystem',
                'MapRoadSystem',
                'MapZoneSystem',
                'MapBlockSystem',
                'MapBuildingSystem',
                'MapAssetPlacer',
                'MapEnvironmentSystem',
                'MapNavigationSystem',
                'MapRoadRenderer',
            ];
            expect(constructorCallOrder).toEqual(expectedOrder);
        });

        it('should call placeLocations() after instantiation', () => {
            // Verify that zone assignments happened (from placeLocations)
            expect(mapManager.zoneSystem.assignLocationToZone).toHaveBeenCalled();
        });

        it('should call environmentSystem.initialize() after placeLocations()', () => {
            // Get the mocked zoneSystem to check call order
            const zoneSystemInitialization = mapManager.zoneSystem.assignLocationToZone.mock.invocationCallOrder[0];
            const environmentInitialization = mapManager.environmentSystem.initialize.mock.invocationCallOrder[0];

            // Verify initialize was called after zone assignments (placeLocations)
            expect(environmentInitialization).toBeGreaterThan(zoneSystemInitialization);
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
            // Pre-configure mock before creating new MapManager
            zoneSystemInstance = createMockZoneSystem();
            const mockZone = { id: 'zone-1', type: 'residential' };
            zoneSystemInstance.getZoneAt.mockReturnValue(mockZone);

            vi.clearAllMocks();
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.zoneSystem.assignLocationToZone).toHaveBeenCalledWith('location-with-position', 'zone-1');
        });

        it('should find block using getBlockAt when zone exists', () => {
            // Pre-configure mock before creating new MapManager
            zoneSystemInstance = createMockZoneSystem();
            const mockZone = { id: 'zone-1', type: 'residential' };
            zoneSystemInstance.getZoneAt.mockReturnValue(mockZone);

            vi.clearAllMocks();
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.blockSystem.getBlockAt).toHaveBeenCalledWith(5, 5);
        });

        it('should fallback to findAvailableBlock if getBlockAt returns null', () => {
            // Pre-configure mocks before creating new MapManager
            zoneSystemInstance = createMockZoneSystem();
            blockSystemInstance = createMockBlockSystem();

            const mockZone = { id: 'zone-1', type: 'residential' };
            zoneSystemInstance.getZoneAt.mockReturnValue(mockZone);
            blockSystemInstance.getBlockAt.mockReturnValue(null);

            vi.clearAllMocks();
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.blockSystem.findAvailableBlock).toHaveBeenCalledWith('residential', 1);
        });

        it('should place building when block is found', () => {
            // Pre-configure mocks before creating new MapManager
            zoneSystemInstance = createMockZoneSystem();
            blockSystemInstance = createMockBlockSystem();

            const mockZone = { id: 'zone-1', type: 'residential' };
            const mockBlock = { id: 'block-1' };
            zoneSystemInstance.getZoneAt.mockReturnValue(mockZone);
            blockSystemInstance.getBlockAt.mockReturnValue(mockBlock);

            vi.clearAllMocks();
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.buildingSystem.placeBuilding).toHaveBeenCalled();
        });

        it('should not place building when no block is found', () => {
            // Pre-configure mocks before creating new MapManager
            zoneSystemInstance = createMockZoneSystem();
            blockSystemInstance = createMockBlockSystem();

            const mockZone = { id: 'zone-1', type: 'residential' };
            zoneSystemInstance.getZoneAt.mockReturnValue(mockZone);
            blockSystemInstance.getBlockAt.mockReturnValue(null);
            blockSystemInstance.findAvailableBlock.mockReturnValue(null);

            vi.clearAllMocks();
            mapManager = new MapManager(mockContainer, {});

            // placeBuilding should not have been called for this location
            expect(mapManager.buildingSystem.placeBuilding).not.toHaveBeenCalledWith(
                expect.objectContaining({ id: 'location-with-position' })
            );
        });

        it('should use no-zone fallback with findZoneForLocationType', () => {
            // Pre-configure mock before creating new MapManager
            zoneSystemInstance = createMockZoneSystem();
            zoneSystemInstance.getZoneAt.mockReturnValue(null);

            vi.clearAllMocks();
            mapManager = new MapManager(mockContainer, {});

            expect(mapManager.zoneSystem.findZoneForLocationType).toHaveBeenCalledWith('residence');
        });

        it('should fallback cascade: find zone by type -> find block -> place building', () => {
            // Pre-configure mocks before creating new MapManager
            zoneSystemInstance = createMockZoneSystem();
            blockSystemInstance = createMockBlockSystem();

            const mockZone = { id: 'zone-fallback', type: 'residential' };
            const mockBlock = { id: 'block-fallback' };
            zoneSystemInstance.getZoneAt.mockReturnValue(null);
            zoneSystemInstance.findZoneForLocationType.mockReturnValue(mockZone);
            blockSystemInstance.findAvailableBlock.mockReturnValue(mockBlock);

            vi.clearAllMocks();
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
            // Clear all mocks to capture only render() calls
            vi.clearAllMocks();
            mapManager.render();

            // Verify roadRenderer.render was called
            expect(mapManager.roadRenderer.render).toHaveBeenCalledTimes(1);

            // Verify that zone/block/building/environment systems were NOT called directly
            // Get all methods that should not be called during render
            const zoneSystemMethods = [
                'getZoneAt',
                'findZoneForLocationType',
                'assignLocationToZone',
                'getZoneById',
                'getAllZones',
            ];
            const blockSystemMethods = [
                'getBlockAt',
                'findAvailableBlock',
                'assignLocationToBlock',
            ];
            const buildingSystemMethods = ['placeBuilding'];
            const environmentSystemMethods = ['initialize'];

            // Assert none of these were called
            zoneSystemMethods.forEach(method => {
                expect(mapManager.zoneSystem[method]).not.toHaveBeenCalled();
            });
            blockSystemMethods.forEach(method => {
                expect(mapManager.blockSystem[method]).not.toHaveBeenCalled();
            });
            buildingSystemMethods.forEach(method => {
                expect(mapManager.buildingSystem[method]).not.toHaveBeenCalled();
            });
            environmentSystemMethods.forEach(method => {
                expect(mapManager.environmentSystem[method]).not.toHaveBeenCalled();
            });
        });
    });

    describe('gridToPercent()', () => {
        it('should convert grid coordinates to percentage using container dimensions', () => {
            const result = mapManager.gridToPercent(10, 15);

            // Should call gridSystem.gridToPercent with container dimensions
            expect(mapManager.gridSystem.gridToPercent).toHaveBeenCalledWith(10, 15, 800, 600);
        });

        it('should fallback to gridSystem dimensions when container.offsetWidth is falsy', () => {
            gridSystemInstance = null;
            vi.clearAllMocks();
            mockContainer.offsetWidth = 0;
            mapManager = new MapManager(mockContainer, {});

            mapManager.gridToPercent(10, 15);

            // Should use gridSystem.totalWidth instead
            expect(mapManager.gridSystem.gridToPercent).toHaveBeenCalledWith(10, 15, 600, 600);
        });

        it('should fallback to gridSystem dimensions when container.offsetHeight is falsy', () => {
            gridSystemInstance = null;
            vi.clearAllMocks();
            mockContainer.offsetHeight = 0;
            mapManager = new MapManager(mockContainer, {});

            mapManager.gridToPercent(10, 15);

            // Should use gridSystem.totalHeight instead
            expect(mapManager.gridSystem.gridToPercent).toHaveBeenCalledWith(10, 15, 800, 600);
        });

        it('should fallback to gridSystem dimensions when both container dimensions are falsy', () => {
            gridSystemInstance = null;
            vi.clearAllMocks();
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
            gridSystemInstance = null;
            constructorCallOrder.length = 0;
            lastGridSystemConfig = undefined;
            vi.clearAllMocks();

            // Create new MapManager with config
            const gridConfig = { gridWidth: 40, tileSize: 25 };
            const mm = new MapManager(mockContainer, { grid: gridConfig });

            // Verify MapGridSystem was instantiated with the config object
            expect(lastGridSystemConfig).toEqual(gridConfig);
        });

        it('should use default config when none provided', () => {
            gridSystemInstance = null;
            constructorCallOrder.length = 0;
            lastGridSystemConfig = undefined;
            vi.clearAllMocks();

            // Create new MapManager without config
            const mm = new MapManager(mockContainer);

            // Verify MapGridSystem was instantiated with empty object (default config)
            expect(lastGridSystemConfig).toEqual({});
        });
    });
});
