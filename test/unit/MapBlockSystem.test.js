import { describe, it, expect } from 'vitest';
import { MapBlockSystem } from '../../src/js/game/MapBlockSystem.js';
import { MapGridSystem } from '../../src/js/game/MapGridSystem.js';

const ZONES = [
    { id: 'north', type: 'commercial' },
    { id: 'south', type: 'residential' }
];

/**
 * Build a MapBlockSystem on a real 10x10 MapGridSystem.
 * Road and zone collaborators are fresh per call so no test leaks into the next.
 */
function makeSystem({ isRoad, getZoneAt, getZonesByType } = {}) {
    const gridSystem = new MapGridSystem({ gridWidth: 10, gridHeight: 10 });
    const roadSystem = { isRoad: isRoad || (() => false) };
    const zoneSystem = {
        getZoneAt: getZoneAt || (() => null),
        getZonesByType: getZonesByType || (() => [])
    };
    return new MapBlockSystem(gridSystem, roadSystem, zoneSystem);
}

// One vertical road (column 4) and one horizontal road (row 6) cut the grid into
// four blocks: block-0-0 (4x6), block-5-0 (5x6), block-0-7 (4x3), block-5-7 (5x3).
// Rows above the road belong to the 'north' zone, rows below it to 'south'.
function makeCitySystem() {
    return makeSystem({
        isRoad: (x, y) => x === 4 || y === 6,
        getZoneAt: (x, y) => (y < 6 ? ZONES[0] : ZONES[1]),
        getZonesByType: (type) => ZONES.filter(zone => zone.type === type)
    });
}

describe('MapBlockSystem', () => {
    it('should generate blocks on construction', () => {
        const system = makeSystem();

        expect(system.blocks).toHaveLength(1);
        expect(system.blocks[0].id).toBe('block-0-0');
        expect(system.blockGrid.size).toBe(100);
        expect(system.blockGrid.get('9,9')).toBe('block-0-0');
    });

    it('should split the grid into one block per road-bounded area', () => {
        const system = makeCitySystem();

        expect(system.blocks.map(block => block.id)).toEqual([
            'block-0-0',
            'block-5-0',
            'block-0-7',
            'block-5-7'
        ]);
        // 100 cells minus the 19 road cells (column 4 + row 6, sharing one cell)
        expect(system.blockGrid.size).toBe(81);
    });

    describe('findBlockBoundaries', () => {
        it('should expand correctly without roads or visited', () => {
            const system = makeSystem();

            const block = system.findBlockBoundaries(0, 0, new Set());

            expect(block).toEqual({
                id: 'block-0-0',
                bounds: { x: 0, y: 0, width: 10, height: 10 },
                center: { x: 5, y: 5 },
                zone: null,
                locations: [],
                buildings: []
            });
        });

        it('should truncate maxX and maxY when adjacent to a road', () => {
            const system = makeSystem({ isRoad: (x, y) => x === 4 || y === 4 });

            const block = system.findBlockBoundaries(0, 0, new Set());

            expect(block).toEqual({
                id: 'block-0-0',
                bounds: { x: 0, y: 0, width: 4, height: 4 },
                center: { x: 2, y: 2 },
                zone: null,
                locations: [],
                buildings: []
            });
        });

        it('should truncate expansion at already visited cells', () => {
            const system = makeSystem();

            const block = system.findBlockBoundaries(0, 0, new Set(['3,0', '0,5']));

            expect(block.bounds).toEqual({ x: 0, y: 0, width: 3, height: 5 });
            expect(block.center).toEqual({ x: 1, y: 2 });
        });
    });

    describe('assignBlocksToZones', () => {
        it('should set block.zone via getZoneAt(center)', () => {
            // Only the centre cell of the single 10x10 block resolves to a zone
            const system = makeSystem({
                getZoneAt: (x, y) => (x === 5 && y === 5 ? { id: 'zone1' } : null)
            });

            expect(system.blocks[0].zone).toBe('zone1');
        });

        it('should assign each block the zone found at its own center', () => {
            const system = makeCitySystem();

            expect(system.blocks.map(block => block.zone)).toEqual([
                'north',
                'north',
                'south',
                'south'
            ]);
        });

        it('should set block.zone to null if no zone found', () => {
            const system = makeSystem();

            system.assignBlocksToZones();

            expect(system.blocks[0].zone).toBe(null);
        });
    });

    describe('getBlockAt', () => {
        it('should return block via blockGrid', () => {
            const system = makeCitySystem();

            expect(system.getBlockAt(0, 0)).toBe(system.blocks[0]);
            expect(system.getBlockAt(9, 5).id).toBe('block-5-0');
            expect(system.getBlockAt(2, 8).id).toBe('block-0-7');
        });

        it('should return null for unoccupied blockGrid', () => {
            const system = makeCitySystem();

            // Road cells never belong to a block
            expect(system.getBlockAt(4, 0)).toBe(null);
            expect(system.getBlockAt(0, 6)).toBe(null);
            // Outside the grid
            expect(system.getBlockAt(20, 20)).toBe(null);
        });
    });

    describe('assignLocationToBlock', () => {
        it('should not push duplicate locations', () => {
            const system = makeSystem();

            system.assignLocationToBlock('loc1', 'block-0-0');
            system.assignLocationToBlock('loc1', 'block-0-0');

            expect(system.blocks[0].locations).toEqual(['loc1']);
        });

        it('should be a no-op for unknown blockId', () => {
            const system = makeCitySystem();

            system.assignLocationToBlock('loc1', 'unknownBlockId');

            expect(system.blocks).toHaveLength(4);
            system.blocks.forEach(block => {
                expect(block.locations).toEqual([]);
            });
        });
    });

    describe('findAvailableBlock', () => {
        it('should return the largest empty block of the zone type', () => {
            const system = makeCitySystem();

            // block-5-0 (5x6 = 30) beats block-0-0 (4x6 = 24)
            expect(system.findAvailableBlock('commercial', 1).id).toBe('block-5-0');
        });

        it('should skip blocks that already hold a location', () => {
            const system = makeCitySystem();
            system.assignLocationToBlock('loc1', 'block-5-0');

            expect(system.findAvailableBlock('commercial', 1).id).toBe('block-0-0');
        });

        it('should only offer blocks at least minSize wide and tall', () => {
            const system = makeCitySystem();

            // South blocks are 4x3 and 5x3: both fit 3, and the larger one wins
            expect(system.findAvailableBlock('residential', 3).id).toBe('block-5-7');
            // Only block-5-0 (5x6) is at least 5 wide and 5 tall; block-0-0 is 4 wide
            expect(system.findAvailableBlock('commercial', 5).id).toBe('block-5-0');
        });

        it('should fall back to blocks[0] of the zone type when none is available', () => {
            const system = makeCitySystem();

            // No commercial block is 7 tiles wide, so the first commercial block is returned
            expect(system.findAvailableBlock('commercial', 7).id).toBe('block-0-0');
            // Both south blocks are wide enough for 4 but only 3 tall
            expect(system.findAvailableBlock('residential', 4).id).toBe('block-0-7');
        });

        it('should return null when zone type has none', () => {
            const system = makeCitySystem();

            expect(system.findAvailableBlock('industrial', 1)).toBe(null);
        });
    });

    describe('getBlockData', () => {
        it('should return {blocks, blockGrid}', () => {
            const system = makeCitySystem();

            const data = system.getBlockData();

            expect(Object.keys(data)).toEqual(['blocks', 'blockGrid']);
            expect(data.blocks).toBe(system.blocks);
            expect(Array.isArray(data.blockGrid)).toBe(true);
            expect(data.blockGrid).toHaveLength(81);
            expect(data.blockGrid[0]).toEqual(['0,0', 'block-0-0']);
            expect(data.blockGrid).toContainEqual(['9,9', 'block-5-7']);
        });
    });
});
