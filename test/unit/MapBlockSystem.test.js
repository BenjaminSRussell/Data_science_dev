import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import MapBlockSystem from '../../src/systems/MapBlockSystem';

// Mock dependencies
const mockGridSystem = {
    gridWidth: 10,
    gridHeight: 10,
    getGridKey(x, y) {
        return `${x}-${y}`;
    },
    getGridRect(x, y) {
        return { x, y, width: 1, height: 1 };
    }
};

const mockRoadSystem = {
    isRoad(x, y) {
        return false;
    }
};

const mockZoneSystem = {
    getZoneAt(x, y) {
        return null;
    },
    getZonesByType(type) {
        return [];
    }
};

describe('MapBlockSystem', () => {
    let mapBlockSystem;

    beforeEach(() => {
        mapBlockSystem = new MapBlockSystem(mockGridSystem, mockRoadSystem, mockZoneSystem);
    });

    it('should generate blocks on construction', () => {
        expect(mapBlockSystem.blocks).toBeDefined();
        expect(mapBlockSystem.blockGrid).toBeDefined();
    });

    describe('findBlockBoundaries', () => {
        it('should expand correctly without roads or visited', () => {
            const block = mapBlockSystem.findBlockBoundaries(0, 0, new Set());
            expect(block).toEqual({
                bounds: { x: 0, y: 0, width: 9, height: 9 },
                center: { x: 4, y: 4 },
                zone: null,
                locations: []
            });
        });

        it('should truncate maxX and maxY when adjacent to a road', () => {
            mockRoadSystem.isRoad = (x, y) => {
                return x === 4 || y === 4;
            };
            const block = mapBlockSystem.findBlockBoundaries(0, 0, new Set());
            expect(block).toEqual({
                bounds: { x: 0, y: 0, width: 3, height: 3 },
                center: { x: 1, y: 1 },
                zone: null,
                locations: []
            });
        });
    });

    describe('assignBlocksToZones', () => {
        it('should set block.zone via getZoneAt(center)', () => {
            const block = { center: { x: 1, y: 1 }, zone: null };
            mockZoneSystem.getZoneAt = (x, y) => {
                return { id: 'zone1' };
            };
            mapBlockSystem.assignBlocksToZones([block]);
            expect(block.zone).toBe('zone1');
        });

        it('should set block.zone to null if no zone found', () => {
            const block = { center: { x: 1, y: 1 }, zone: null };
            mapBlockSystem.assignBlocksToZones([block]);
            expect(block.zone).toBe(null);
        });
    });

    describe('getBlockAt', () => {
        it('should return block via blockGrid', () => {
            const block = { bounds: { x: 0, y: 0, width: 1, height: 1 }, locations: [] };
            mapBlockSystem.blockGrid.set('0-0', block);
            expect(mapBlockSystem.getBlockAt(0, 0)).toBe(block);
        });

        it('should return null for unoccupied blockGrid', () => {
            expect(mapBlockSystem.getBlockAt(0, 0)).toBe(null);
        });
    });

    describe('assignLocationToBlock', () => {
        it('should not push duplicate locations', () => {
            const block = { locations: [] };
            mapBlockSystem.assignLocationToBlock('loc1', block);
            mapBlockSystem.assignLocationToBlock('loc1', block);
            expect(block.locations).toEqual(['loc1']);
        });

        it('should be a no-op for unknown blockId', () => {
            mapBlockSystem.assignLocationToBlock('loc1', 'unknownBlockId');
            expect(mapBlockSystem.blocks).toEqual([]);
        });
    });

    describe('findAvailableBlock', () => {
        it('should filter by size and empty, sort by area desc, and fall back to blocks[0]', () => {
            const block1 = { bounds: { width: 5, height: 5 }, locations: [] };
            const block2 = { bounds: { width: 3, height: 3 }, locations: ['loc1'] };
            mapBlockSystem.blocks = [block1, block2];
            const availableBlock = mapBlockSystem.findAvailableBlock('type1', 4);
            expect(availableBlock).toBe(block1);
        });

        it('should return null when zone type has none', () => {
            mockZoneSystem.getZonesByType = () => [];
            expect(mapBlockSystem.findAvailableBlock('type1', 1)).toBe(null);
        });
    });

    describe('getBlockData', () => {
        it('should return {blocks, blockGrid}', () => {
            const block = { bounds: { x: 0, y: 0, width: 1, height: 1 }, locations: [] };
            mapBlockSystem.blocks = [block];
            mapBlockSystem.blockGrid.set('0-0', block);
            const data = mapBlockSystem.getBlockData();
            expect(data).toEqual({
                blocks: [block],
                blockGrid: Array.from(mapBlockSystem.blockGrid.entries())
            });
        });
    });
});