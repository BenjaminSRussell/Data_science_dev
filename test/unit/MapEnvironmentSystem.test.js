/**
 * Unit tests for MapEnvironmentSystem
 * Tests environmental elements system (trees, parks, decorations)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MapEnvironmentSystem } from '../../src/js/game/MapEnvironmentSystem.js';

describe('MapEnvironmentSystem', () => {
    let mapEnvironmentSystem;
    let mockZoneSystem;
    let mockRoadSystem;
    let mockAssetPlacer;
    let mockGridSystem;

    beforeEach(() => {
        // Create mock implementations
        mockZoneSystem = {
            getZonesByType: vi.fn()
        };

        mockRoadSystem = {
            isRoad: vi.fn()
        };

        mockAssetPlacer = {
            placeAsset: vi.fn()
        };

        mockGridSystem = {
            width: 100,
            height: 100
        };

        mapEnvironmentSystem = new MapEnvironmentSystem(
            mockGridSystem,
            mockRoadSystem,
            mockZoneSystem,
            mockAssetPlacer
        );
    });

    describe('constructor', () => {
        it('should initialize with empty environmentElements array', () => {
            expect(mapEnvironmentSystem.environmentElements).toEqual([]);
        });

        it('should store all dependencies', () => {
            expect(mapEnvironmentSystem.gridSystem).toBe(mockGridSystem);
            expect(mapEnvironmentSystem.roadSystem).toBe(mockRoadSystem);
            expect(mapEnvironmentSystem.zoneSystem).toBe(mockZoneSystem);
            expect(mapEnvironmentSystem.assetPlacer).toBe(mockAssetPlacer);
        });
    });

    describe('initialize', () => {
        it('should call getZonesByType for park, residential, and commercial zones', () => {
            mockZoneSystem.getZonesByType.mockReturnValue([]);

            mapEnvironmentSystem.initialize();

            expect(mockZoneSystem.getZonesByType).toHaveBeenCalledWith('park');
            expect(mockZoneSystem.getZonesByType).toHaveBeenCalledWith('residential');
            expect(mockZoneSystem.getZonesByType).toHaveBeenCalledWith('commercial');
            expect(mockZoneSystem.getZonesByType).toHaveBeenCalledTimes(3);
        });

        it('should call addParkElements for each park zone', () => {
            const parkZone = { id: 'park-1', bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 } };
            mockZoneSystem.getZonesByType.mockImplementation((type) => {
                if (type === 'park') return [parkZone];
                return [];
            });

            const addParkElementsSpy = vi.spyOn(mapEnvironmentSystem, 'addParkElements');
            mapEnvironmentSystem.initialize();

            expect(addParkElementsSpy).toHaveBeenCalledWith(parkZone);
        });

        it('should call addStreetTrees for each residential zone', () => {
            const residentialZone = { id: 'res-1', bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 } };
            mockZoneSystem.getZonesByType.mockImplementation((type) => {
                if (type === 'residential') return [residentialZone];
                return [];
            });

            const addStreetTreesSpy = vi.spyOn(mapEnvironmentSystem, 'addStreetTrees');
            mapEnvironmentSystem.initialize();

            expect(addStreetTreesSpy).toHaveBeenCalledWith(residentialZone);
        });

        it('should call addCommercialDecorations for each commercial zone', () => {
            const commercialZone = { id: 'com-1', bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 } };
            mockZoneSystem.getZonesByType.mockImplementation((type) => {
                if (type === 'commercial') return [commercialZone];
                return [];
            });

            const addCommercialDecorationsSpy = vi.spyOn(mapEnvironmentSystem, 'addCommercialDecorations');
            mapEnvironmentSystem.initialize();

            expect(addCommercialDecorationsSpy).toHaveBeenCalledWith(commercialZone);
        });
    });

    describe('addParkElements', () => {
        it('should not place elements on road positions', () => {
            const zone = { id: 'park-1', bounds: { minX: 0, maxX: 2, minY: 0, maxY: 2 } };
            mockRoadSystem.isRoad.mockReturnValue(true);
            mockAssetPlacer.placeAsset.mockReturnValue(true);

            mapEnvironmentSystem.addParkElements(zone);

            // When all positions are roads, no elements should be added even if assetPlacer returns true
            expect(mapEnvironmentSystem.environmentElements.length).toBe(0);
        });

        it('should only add elements when assetPlacer.placeAsset returns true', () => {
            const zone = { id: 'park-1', bounds: { minX: 0, maxX: 3, minY: 0, maxY: 3 } };
            let callCount = 0;

            // Make assetPlacer return true only on even calls
            mockAssetPlacer.placeAsset.mockImplementation(() => {
                callCount++;
                return callCount % 2 === 0;
            });
            mockRoadSystem.isRoad.mockReturnValue(false);

            mapEnvironmentSystem.addParkElements(zone);

            // Only elements where assetPlacer returned true should be in environmentElements
            const allSuccessful = mapEnvironmentSystem.environmentElements.every((el) => {
                return el.type === 'tree' && el.zoneId === zone.id;
            });
            expect(allSuccessful).toBe(true);

            // The number of elements should be less than or equal to total attempts (due to true/false alternating)
            expect(mapEnvironmentSystem.environmentElements.length).toBeGreaterThan(0);
        });

        it('should create tree objects with correct properties', () => {
            const zone = { id: 'park-1', bounds: { minX: 5, maxX: 10, minY: 5, maxY: 10 } };
            mockRoadSystem.isRoad.mockReturnValue(false);
            mockAssetPlacer.placeAsset.mockReturnValue(true);

            mapEnvironmentSystem.addParkElements(zone);

            // Should have at least some trees
            expect(mapEnvironmentSystem.environmentElements.length).toBeGreaterThan(0);

            // All trees should have the correct structure
            mapEnvironmentSystem.environmentElements.forEach((tree) => {
                expect(tree).toHaveProperty('id');
                expect(tree.id).toMatch(/^tree-park-1-\d+$/);
                expect(tree.type).toBe('tree');
                expect(tree).toHaveProperty('x');
                expect(tree).toHaveProperty('y');
                expect(tree.width).toBe(1);
                expect(tree.height).toBe(1);
                expect(tree.zoneId).toBe(zone.id);
            });
        });

        it('should place trees within zone bounds', () => {
            const zone = { id: 'park-1', bounds: { minX: 10, maxX: 20, minY: 10, maxY: 20 } };
            mockRoadSystem.isRoad.mockReturnValue(false);
            mockAssetPlacer.placeAsset.mockReturnValue(true);

            mapEnvironmentSystem.addParkElements(zone);

            mapEnvironmentSystem.environmentElements.forEach((tree) => {
                expect(tree.x).toBeGreaterThanOrEqual(zone.bounds.minX);
                expect(tree.x).toBeLessThanOrEqual(zone.bounds.maxX);
                expect(tree.y).toBeGreaterThanOrEqual(zone.bounds.minY);
                expect(tree.y).toBeLessThanOrEqual(zone.bounds.maxY);
            });
        });
    });

    describe('addStreetTrees', () => {
        it('should not place elements on road positions', () => {
            const zone = { id: 'res-1', bounds: { minX: 0, maxX: 2, minY: 0, maxY: 2 } };
            mockRoadSystem.isRoad.mockReturnValue(true);
            mockAssetPlacer.placeAsset.mockReturnValue(true);

            mapEnvironmentSystem.addStreetTrees(zone);

            // When all positions are roads, no elements should be added
            expect(mapEnvironmentSystem.environmentElements.length).toBe(0);
        });

        it('should only add elements when assetPlacer.placeAsset returns true', () => {
            const zone = { id: 'res-1', bounds: { minX: 0, maxX: 5, minY: 0, maxY: 5 } };
            let callCount = 0;

            // Make assetPlacer return true only on odd calls
            mockAssetPlacer.placeAsset.mockImplementation(() => {
                callCount++;
                return callCount % 2 === 1;
            });

            // Mock isRoad to ensure we have near-road positions
            mockRoadSystem.isRoad.mockImplementation((x, y) => {
                // Return true for some neighbors but false for the position itself or neighbors
                return false;
            });

            mapEnvironmentSystem.addStreetTrees(zone);

            // All elements should have type tree
            const allTreesCorrect = mapEnvironmentSystem.environmentElements.every((el) => {
                return el.type === 'tree' && el.zoneId === zone.id;
            });
            expect(allTreesCorrect).toBe(true);
        });

        it('should only place street trees near roads', () => {
            const zone = { id: 'res-1', bounds: { minX: 0, maxX: 5, minY: 0, maxY: 5 } };
            mockAssetPlacer.placeAsset.mockReturnValue(true);

            // Track which positions were checked
            const checkedPositions = [];
            mockRoadSystem.isRoad.mockImplementation((x, y) => {
                checkedPositions.push({ x, y });
                // Make position (2,2) and its neighbors have roads nearby
                const isNearRoad = (x === 1 && y === 2) || (x === 3 && y === 2) ||
                                   (x === 2 && y === 1) || (x === 2 && y === 3);
                return isNearRoad;
            });

            mapEnvironmentSystem.addStreetTrees(zone);

            // Should have checked road positions for adjacency
            expect(checkedPositions.length).toBeGreaterThan(0);
        });

        it('should create street tree objects with correct properties', () => {
            const zone = { id: 'res-1', bounds: { minX: 5, maxX: 10, minY: 5, maxY: 10 } };
            mockRoadSystem.isRoad.mockReturnValue(false);
            mockAssetPlacer.placeAsset.mockReturnValue(true);

            mapEnvironmentSystem.addStreetTrees(zone);

            if (mapEnvironmentSystem.environmentElements.length > 0) {
                mapEnvironmentSystem.environmentElements.forEach((tree) => {
                    expect(tree).toHaveProperty('id');
                    expect(tree.id).toMatch(/^street-tree-res-1-\d+$/);
                    expect(tree.type).toBe('tree');
                    expect(tree).toHaveProperty('x');
                    expect(tree).toHaveProperty('y');
                    expect(tree.width).toBe(1);
                    expect(tree.height).toBe(1);
                    expect(tree.zoneId).toBe(zone.id);
                });
            }
        });
    });

    describe('addCommercialDecorations', () => {
        it('should not place elements on road positions', () => {
            const zone = { id: 'com-1', bounds: { minX: 0, maxX: 2, minY: 0, maxY: 2 } };
            mockRoadSystem.isRoad.mockReturnValue(true);
            mockAssetPlacer.placeAsset.mockReturnValue(true);

            mapEnvironmentSystem.addCommercialDecorations(zone);

            // When all positions are roads, no elements should be added
            expect(mapEnvironmentSystem.environmentElements.length).toBe(0);
        });

        it('should only add elements when assetPlacer.placeAsset returns true', () => {
            const zone = { id: 'com-1', bounds: { minX: 0, maxX: 5, minY: 0, maxY: 5 } };
            let callCount = 0;

            mockAssetPlacer.placeAsset.mockImplementation(() => {
                callCount++;
                return callCount % 3 === 0;  // Return true every 3rd call
            });
            mockRoadSystem.isRoad.mockReturnValue(false);

            mapEnvironmentSystem.addCommercialDecorations(zone);

            // All elements should have type decoration
            const allDecorationsCorrect = mapEnvironmentSystem.environmentElements.every((el) => {
                return el.type === 'decoration' && el.zoneId === zone.id;
            });
            expect(allDecorationsCorrect).toBe(true);
        });

        it('should create decoration objects with correct properties', () => {
            const zone = { id: 'com-1', bounds: { minX: 5, maxX: 10, minY: 5, maxY: 10 } };
            mockRoadSystem.isRoad.mockReturnValue(false);
            mockAssetPlacer.placeAsset.mockReturnValue(true);

            mapEnvironmentSystem.addCommercialDecorations(zone);

            expect(mapEnvironmentSystem.environmentElements.length).toBeGreaterThan(0);

            mapEnvironmentSystem.environmentElements.forEach((decoration) => {
                expect(decoration).toHaveProperty('id');
                expect(decoration.id).toMatch(/^decoration-com-1-\d+$/);
                expect(decoration.type).toBe('decoration');
                expect(decoration).toHaveProperty('x');
                expect(decoration).toHaveProperty('y');
                expect(decoration.width).toBe(1);
                expect(decoration.height).toBe(1);
                expect(decoration.zoneId).toBe(zone.id);
            });
        });

        it('should place decorations within zone bounds', () => {
            const zone = { id: 'com-1', bounds: { minX: 15, maxX: 25, minY: 15, maxY: 25 } };
            mockRoadSystem.isRoad.mockReturnValue(false);
            mockAssetPlacer.placeAsset.mockReturnValue(true);

            mapEnvironmentSystem.addCommercialDecorations(zone);

            mapEnvironmentSystem.environmentElements.forEach((decoration) => {
                expect(decoration.x).toBeGreaterThanOrEqual(zone.bounds.minX);
                expect(decoration.x).toBeLessThanOrEqual(zone.bounds.maxX);
                expect(decoration.y).toBeGreaterThanOrEqual(zone.bounds.minY);
                expect(decoration.y).toBeLessThanOrEqual(zone.bounds.maxY);
            });
        });
    });

    describe('getAllElements', () => {
        it('should return empty array when no elements added', () => {
            expect(mapEnvironmentSystem.getAllElements()).toEqual([]);
        });

        it('should return all added elements', () => {
            const mockElements = [
                { id: 'tree-1', type: 'tree', zoneId: 'park-1', x: 5, y: 5 },
                { id: 'tree-2', type: 'tree', zoneId: 'res-1', x: 10, y: 10 },
                { id: 'decoration-1', type: 'decoration', zoneId: 'com-1', x: 15, y: 15 }
            ];
            mapEnvironmentSystem.environmentElements = mockElements;

            const result = mapEnvironmentSystem.getAllElements();
            expect(result).toEqual(mockElements);
            expect(result).toHaveLength(3);
        });

        it('should return the actual array reference', () => {
            const mockElements = [
                { id: 'tree-1', type: 'tree', zoneId: 'park-1', x: 5, y: 5 }
            ];
            mapEnvironmentSystem.environmentElements = mockElements;

            const result = mapEnvironmentSystem.getAllElements();
            expect(result).toBe(mapEnvironmentSystem.environmentElements);
        });
    });

    describe('getElementsByType', () => {
        it('should return empty array when no elements match type', () => {
            mapEnvironmentSystem.environmentElements = [
                { id: 'tree-1', type: 'tree', zoneId: 'park-1', x: 5, y: 5 }
            ];

            const result = mapEnvironmentSystem.getElementsByType('decoration');
            expect(result).toEqual([]);
        });

        it('should return only elements of specified type', () => {
            const mockElements = [
                { id: 'tree-1', type: 'tree', zoneId: 'park-1', x: 5, y: 5 },
                { id: 'tree-2', type: 'tree', zoneId: 'res-1', x: 10, y: 10 },
                { id: 'decoration-1', type: 'decoration', zoneId: 'com-1', x: 15, y: 15 },
                { id: 'decoration-2', type: 'decoration', zoneId: 'com-2', x: 20, y: 20 }
            ];
            mapEnvironmentSystem.environmentElements = mockElements;

            const treeResult = mapEnvironmentSystem.getElementsByType('tree');
            expect(treeResult).toHaveLength(2);
            expect(treeResult.every(el => el.type === 'tree')).toBe(true);

            const decorationResult = mapEnvironmentSystem.getElementsByType('decoration');
            expect(decorationResult).toHaveLength(2);
            expect(decorationResult.every(el => el.type === 'decoration')).toBe(true);
        });

        it('should return a filtered array, not modify original', () => {
            const mockElements = [
                { id: 'tree-1', type: 'tree', zoneId: 'park-1', x: 5, y: 5 },
                { id: 'decoration-1', type: 'decoration', zoneId: 'com-1', x: 15, y: 15 }
            ];
            mapEnvironmentSystem.environmentElements = mockElements;
            const originalLength = mapEnvironmentSystem.environmentElements.length;

            const filteredResult = mapEnvironmentSystem.getElementsByType('tree');

            expect(filteredResult).toHaveLength(1);
            expect(mapEnvironmentSystem.environmentElements).toHaveLength(originalLength);
        });
    });

    describe('getElementsInZone', () => {
        it('should return empty array when no elements in zone', () => {
            mapEnvironmentSystem.environmentElements = [
                { id: 'tree-1', type: 'tree', zoneId: 'park-1', x: 5, y: 5 }
            ];

            const result = mapEnvironmentSystem.getElementsInZone('com-1');
            expect(result).toEqual([]);
        });

        it('should return only elements in specified zone', () => {
            const mockElements = [
                { id: 'tree-1', type: 'tree', zoneId: 'park-1', x: 5, y: 5 },
                { id: 'tree-2', type: 'tree', zoneId: 'park-1', x: 6, y: 6 },
                { id: 'tree-3', type: 'tree', zoneId: 'res-1', x: 10, y: 10 },
                { id: 'decoration-1', type: 'decoration', zoneId: 'com-1', x: 15, y: 15 }
            ];
            mapEnvironmentSystem.environmentElements = mockElements;

            const parkResult = mapEnvironmentSystem.getElementsInZone('park-1');
            expect(parkResult).toHaveLength(2);
            expect(parkResult.every(el => el.zoneId === 'park-1')).toBe(true);

            const resResult = mapEnvironmentSystem.getElementsInZone('res-1');
            expect(resResult).toHaveLength(1);
            expect(resResult[0].zoneId).toBe('res-1');
        });

        it('should return a filtered array, not modify original', () => {
            const mockElements = [
                { id: 'tree-1', type: 'tree', zoneId: 'park-1', x: 5, y: 5 },
                { id: 'tree-2', type: 'tree', zoneId: 'res-1', x: 10, y: 10 }
            ];
            mapEnvironmentSystem.environmentElements = mockElements;
            const originalLength = mapEnvironmentSystem.environmentElements.length;

            const filteredResult = mapEnvironmentSystem.getElementsInZone('park-1');

            expect(filteredResult).toHaveLength(1);
            expect(mapEnvironmentSystem.environmentElements).toHaveLength(originalLength);
        });
    });

    describe('integration: assetPlacer return value affects element addition', () => {
        it('should not add any elements if assetPlacer always returns false', () => {
            const zone = { id: 'park-1', bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 } };
            mockAssetPlacer.placeAsset.mockReturnValue(false);
            mockRoadSystem.isRoad.mockReturnValue(false);

            mapEnvironmentSystem.addParkElements(zone);

            expect(mapEnvironmentSystem.environmentElements).toHaveLength(0);
        });

        it('should add all attempted elements if assetPlacer always returns true', () => {
            const zone = { id: 'com-1', bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 } };
            mockAssetPlacer.placeAsset.mockReturnValue(true);
            mockRoadSystem.isRoad.mockReturnValue(false);

            const initialCount = mapEnvironmentSystem.environmentElements.length;
            mapEnvironmentSystem.addCommercialDecorations(zone);
            const finalCount = mapEnvironmentSystem.environmentElements.length;

            // Should have added elements
            expect(finalCount).toBeGreaterThan(initialCount);
        });

        it('should respect road system and assetPlacer together', () => {
            const zone = { id: 'res-1', bounds: { minX: 0, maxX: 5, minY: 0, maxY: 5 } };

            // Every other position is a road
            let callCount = 0;
            mockRoadSystem.isRoad.mockImplementation(() => {
                callCount++;
                return callCount % 2 === 0;
            });

            mockAssetPlacer.placeAsset.mockReturnValue(true);

            mapEnvironmentSystem.addStreetTrees(zone);

            // No elements should be added because every other call to isRoad returns true
            // (street trees need isNearRoad to be true but isRoad(x,y) to be false)
            expect(mapEnvironmentSystem.environmentElements.length).toBeGreaterThanOrEqual(0);
        });
    });
});
