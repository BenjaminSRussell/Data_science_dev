import { describe, it, expect, vi } from 'vitest';
import { MapAssetPlacer } from '../../src/js/game/MapAssetPlacer.js';

describe('MapAssetPlacer', () => {
    let mapAssetPlacer;
    let mockGridSystem;
    let mockRoadSystem;
    let mockBuildingSystem;

    beforeEach(() => {
        mockGridSystem = {
            isWithinBounds: vi.fn(),
            getTile: vi.fn(),
        };

        mockRoadSystem = {
            isRoadTile: vi.fn(),
        };

        mockBuildingSystem = {
            hasBuilding: vi.fn(),
        };

        mapAssetPlacer = new MapAssetPlacer(mockGridSystem, mockRoadSystem, mockBuildingSystem);
    });

    describe('canPlaceAsset', () => {
        it('should return false when out of grid bounds', () => {
            mockGridSystem.isWithinBounds.mockReturnValue(false);
            expect(mapAssetPlacer.canPlaceAsset({ x: 0, y: 0 }, 1, 1)).toBe(false);
        });

        it('should return false when tile is a road', () => {
            mockGridSystem.isWithinBounds.mockReturnValue(true);
            mockRoadSystem.isRoadTile.mockReturnValue(true);
            expect(mapAssetPlacer.canPlaceAsset({ x: 0, y: 0 }, 1, 1)).toBe(false);
        });

        it('should return false when tile has a building', () => {
            mockGridSystem.isWithinBounds.mockReturnValue(true);
            mockRoadSystem.isRoadTile.mockReturnValue(false);
            mockBuildingSystem.hasBuilding.mockReturnValue(true);
            expect(mapAssetPlacer.canPlaceAsset({ x: 0, y: 0 }, 1, 1)).toBe(false);
        });

        it('should return false when tile has another asset', () => {
            mockGridSystem.isWithinBounds.mockReturnValue(true);
            mockRoadSystem.isRoadTile.mockReturnValue(false);
            mockBuildingSystem.hasBuilding.mockReturnValue(false);
            mapAssetPlacer.markAssetCells({ x: 0, y: 0 }, 1, 1);
            expect(mapAssetPlacer.canPlaceAsset({ x: 0, y: 0 }, 1, 1)).toBe(false);
        });
    });

    describe('placeAsset', () => {
        it('should store asset and mark multi-cell footprint', () => {
            mapAssetPlacer.placeAsset('asset1', { x: 0, y: 0 }, 2, 2);
            expect(mapAssetPlacer.assets['asset1']).toEqual({ x: 0, y: 0, width: 2, height: 2 });
            expect(mapAssetPlacer.markedAssetCells).toHaveProperty('0,0');
            expect(mapAssetPlacer.markedAssetCells).toHaveProperty('0,1');
            expect(mapAssetPlacer.markedAssetCells).toHaveProperty('1,0');
            expect(mapAssetPlacer.markedAssetCells).toHaveProperty('1,1');
        });
    });

    describe('findAvailablePosition', () => {
        it('should return preferred spot if free', () => {
            mockGridSystem.isWithinBounds.mockReturnValue(true);
            mockRoadSystem.isRoadTile.mockReturnValue(false);
            mockBuildingSystem.hasBuilding.mockReturnValue(false);
            expect(mapAssetPlacer.findAvailablePosition({ x: 0, y: 0 }, 1, 1)).toEqual({ x: 0, y: 0 });
        });

        it('should spiral-search up to maxRadius if preferred spot is occupied', () => {
            mockGridSystem.isWithinBounds.mockReturnValue(true);
            mockRoadSystem.isRoadTile.mockReturnValue(false);
            mockBuildingSystem.hasBuilding.mockReturnValue(false);
            mapAssetPlacer.markAssetCells({ x: 0, y: 0 }, 1, 1);
            expect(mapAssetPlacer.findAvailablePosition({ x: 0, y: 0 }, 1, 1)).toEqual({ x: 1, y: 0 });
        });

        it('should return null if no available position within maxRadius', () => {
            mockGridSystem.isWithinBounds.mockReturnValue(false);
            expect(mapAssetPlacer.findAvailablePosition({ x: 0, y: 0 }, 1, 1)).toBeNull();
        });
    });

    describe('removeAsset', () => {
        it('should unmark cells and remove from assets', () => {
            mapAssetPlacer.placeAsset('asset1', { x: 0, y: 0 }, 2, 2);
            mapAssetPlacer.removeAsset('asset1');
            expect(mapAssetPlacer.assets).not.toHaveProperty('asset1');
            expect(mapAssetPlacer.markedAssetCells).toEqual({});
        });

        it('should return false for unknown id', () => {
            expect(mapAssetPlacer.removeAsset('unknown')).toBe(false);
        });
    });
});