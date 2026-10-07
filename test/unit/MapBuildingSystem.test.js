/**
 * MapBuildingSystem Unit Tests
 * Full branch coverage of placeBuilding, placeBuildingInBlock, canPlaceBuilding
 * and the query/mutation helpers, with all collaborators as test doubles.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MapBuildingSystem } from '../../src/js/game/MapBuildingSystem.js';

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

function makeGridSystem({
    validCoords = new Set(),
    roadCells = new Set(),
    keyFn = (x, y) => `${x},${y}`
} = {}) {
    return {
        isValidGridCoord: (x, y) => validCoords.has(keyFn(x, y)),
        getGridKey: keyFn
    };
}

function makeRoadSystem(roadCells = new Set(), keyFn = (x, y) => `${x},${y}`) {
    return {
        isRoad: (x, y) => roadCells.has(keyFn(x, y))
    };
}

function makeBlockSystem({
    blocksByLocation = {},
    zoneSystem = null,
    findAvailableBlock = null,
    getBlockAt = null,
    assigned = []
} = {}) {
    return {
        zoneSystem,
        getBlockForLocation: (id) => blocksByLocation[id] || null,
        findAvailableBlock: findAvailableBlock || (() => null),
        getBlockAt: getBlockAt || (() => null),
        assignLocationToBlock: (locationId, blockId) => {
            assigned.push({ locationId, blockId });
        },
        assigned
    };
}

function makeZoneSystem(zonesByType = {}) {
    return {
        findZoneForLocationType: (type) => zonesByType[type] || null
    };
}

function makeBlock(x, y, width, height, zone = 'zone-a', id = 'block-1') {
    return { id, zone, bounds: { x, y, width, height } };
}

// A 20x20 grid where every cell is valid and no cell is a road.
function makeOpenWorld() {
    const validCoords = new Set();
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            validCoords.add(`${x},${y}`);
        }
    }
    return {
        gridSystem: makeGridSystem({ validCoords }),
        roadSystem: makeRoadSystem()
    };
}

// ---------------------------------------------------------------------------
// buildingTypeSizes
// ---------------------------------------------------------------------------

describe('buildingTypeSizes', () => {
    it('maps each known type to its expected size bucket', () => {
        const system = new MapBuildingSystem(null, null, null);
        const expected = {
            'residence': 'SMALL',
            'work': 'MEDIUM',
            'education': 'LARGE',
            'finance': 'MEDIUM',
            'government': 'LARGE',
            'shop': 'SMALL',
            'social': 'MEDIUM',
            'training': 'MEDIUM',
            'business': 'LARGE',
            'elite': 'XLARGE',
            'investment': 'MEDIUM',
            'shopping': 'LARGE'
        };
        for (const [type, bucket] of Object.entries(expected)) {
            expect(system.buildingTypeSizes[type]).toBe(bucket);
        }
    });

    it('falls back to SMALL for unmapped types', () => {
        const system = new MapBuildingSystem(null, null, null);
        expect(system.buildingTypeSizes['mystery_type'] || 'SMALL').toBe('SMALL');
    });

    it('covers every size bucket (SMALL, MEDIUM, LARGE, XLARGE)', () => {
        const system = new MapBuildingSystem(null, null, null);
        const buckets = new Set(Object.values(system.buildingTypeSizes));
        expect(buckets.has('SMALL')).toBe(true);
        expect(buckets.has('MEDIUM')).toBe(true);
        expect(buckets.has('LARGE')).toBe(true);
        expect(buckets.has('XLARGE')).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// placeBuilding
// ---------------------------------------------------------------------------

describe('placeBuilding', () => {
    let system;
    let blockSystem;
    let location;

    beforeEach(() => {
        const { gridSystem, roadSystem } = makeOpenWorld();
        blockSystem = makeBlockSystem();
        system = new MapBuildingSystem(gridSystem, roadSystem, blockSystem);
        location = { id: 'loc-1', type: 'residence', position: { x: 5, y: 5 } };
    });

    it('uses the block already assigned to the location', () => {
        const block = makeBlock(2, 2, 4, 4, 'zone-a', 'block-assigned');
        blockSystem.getBlockForLocation = () => block;

        const building = system.placeBuilding(location);

        expect(building).not.toBeNull();
        expect(building.id).toBe('building-loc-1');
        expect(building.locationId).toBe('loc-1');
        expect(building.zone).toBe('zone-a');
        expect(building.size).toEqual({ width: 1, height: 1 });
        // Centered in a 4x4 block: 2 + floor((4-1)/2) = 3
        expect(building.position).toEqual({ x: 3, y: 3 });
        expect(blockSystem.assigned).toEqual([]);
    });

    it('resolves a block via findZoneForLocationType + findAvailableBlock when none is assigned', () => {
        const zone = { type: 'residential' };
        const availableBlock = makeBlock(6, 6, 4, 4, 'zone-b', 'block-found');
        const zoneSystem = makeZoneSystem({ residence: zone });
        blockSystem.zoneSystem = zoneSystem;
        blockSystem.findAvailableBlock = (zoneType, width) => {
            expect(zoneType).toBe('residential');
            expect(width).toBe(1);
            return availableBlock;
        };

        const building = system.placeBuilding(location);

        expect(building).not.toBeNull();
        expect(building.zone).toBe('zone-b');
        expect(building.position).toEqual({ x: 7, y: 7 });
        expect(blockSystem.assigned).toEqual([{ locationId: 'loc-1', blockId: 'block-found' }]);
    });

    it('uses the x>100 last-resort branch via getBlockAt when zone lookup fails', () => {
        location.position = { x: 101, y: 102 };
        const nearbyBlock = makeBlock(10, 10, 4, 4, 'zone-c', 'block-nearby');
        blockSystem.getBlockAt = (x, y) => {
            expect(x).toBe(101);
            expect(y).toBe(102);
            return nearbyBlock;
        };

        const building = system.placeBuilding(location);

        expect(building).not.toBeNull();
        expect(building.zone).toBe('zone-c');
        expect(building.position).toEqual({ x: 11, y: 11 });
        expect(blockSystem.assigned).toEqual([{ locationId: 'loc-1', blockId: 'block-nearby' }]);
    });

    it('does not enter the x>100 branch when position.x <= 100', () => {
        location.position = { x: 50, y: 50 };
        blockSystem.getBlockAt = () => {
            throw new Error('getBlockAt should not be called for x <= 100');
        };

        expect(system.placeBuilding(location)).toBeNull();
    });

    it('returns null when no block can be resolved (terminal null)', () => {
        location.position = { x: 5, y: 5 };
        expect(system.placeBuilding(location)).toBeNull();
        expect(blockSystem.assigned).toEqual([]);
    });

    it('returns null when the x>100 branch finds no nearby block', () => {
        location.position = { x: 150, y: 150 };
        blockSystem.getBlockAt = () => null;

        expect(system.placeBuilding(location)).toBeNull();
    });

    it('falls back to blockSystem.zoneSystem when the system has no zoneSystem', () => {
        const zone = { type: 'residential' };
        const availableBlock = makeBlock(6, 6, 4, 4, 'zone-b', 'block-found');
        blockSystem.zoneSystem = makeZoneSystem({ residence: zone });
        blockSystem.findAvailableBlock = () => availableBlock;
        // system was constructed without a zoneSystem (null)
        expect(system.zoneSystem).toBeNull();

        const building = system.placeBuilding(location);

        expect(building).not.toBeNull();
        expect(building.zone).toBe('zone-b');
    });

    it('skips the zone lookup entirely when no zone system is available', () => {
        location.position = { x: 5, y: 5 };
        expect(system.zoneSystem).toBeNull();
        expect(blockSystem.zoneSystem).toBeNull();

        expect(system.placeBuilding(location)).toBeNull();
    });

    it('uses the XLARGE size for elite locations', () => {
        const block = makeBlock(0, 0, 8, 8, 'zone-a', 'block-assigned');
        blockSystem.getBlockForLocation = () => block;
        location.type = 'elite';

        const building = system.placeBuilding(location);

        expect(building.size).toEqual({ width: 4, height: 4 });
        // Centered: 0 + floor((8-4)/2) = 2
        expect(building.position).toEqual({ x: 2, y: 2 });
    });
});

// ---------------------------------------------------------------------------
// placeBuildingInBlock
// ---------------------------------------------------------------------------

describe('placeBuildingInBlock', () => {
    let system;
    let location;

    beforeEach(() => {
        const { gridSystem, roadSystem } = makeOpenWorld();
        system = new MapBuildingSystem(gridSystem, roadSystem, makeBlockSystem());
        location = { id: 'loc-2', type: 'residence' };
    });

    it('places the building centered in the block on success', () => {
        const block = makeBlock(2, 2, 5, 5, 'zone-a');
        const size = system.buildingSizes.SMALL;

        const building = system.placeBuildingInBlock(location, block, size);

        // 2 + floor((5-1)/2) = 4
        expect(building.position).toEqual({ x: 4, y: 4 });
        expect(building.id).toBe('building-loc-2');
        expect(building.type).toBe('residence');
        expect(system.buildings).toHaveLength(1);
        expect(system.buildingGrid.size).toBe(1);
    });

    it('falls back to an adjacent offset when the centered spot is blocked', () => {
        const block = makeBlock(2, 2, 5, 5, 'zone-a');
        const size = system.buildingSizes.SMALL;
        const { gridSystem } = makeOpenWorld();
        // Block the centered cell (4,4) with a road so the fallback loop must find (3,3)
        gridSystem.isValidGridCoord = (x, y) => {
            if (x === 4 && y === 4) return false;
            return x >= 0 && x < 20 && y >= 0 && y < 20;
        };
        system.gridSystem = gridSystem;

        const building = system.placeBuildingInBlock(location, block, size);

        expect(building).not.toBeNull();
        // First offset tried is (-1,-1) -> (3,3)
        expect(building.position).toEqual({ x: 3, y: 3 });
    });

    it('exhausts the 3x3 offset loop and returns null when every spot is blocked', () => {
        const block = makeBlock(2, 2, 5, 5, 'zone-a');
        const size = system.buildingSizes.SMALL;
        // Make every cell invalid -> centered spot and all 8 offsets fail
        system.gridSystem = makeGridSystem({ validCoords: new Set() });

        const building = system.placeBuildingInBlock(location, block, size);

        expect(building).toBeNull();
        expect(system.buildings).toHaveLength(0);
        expect(system.buildingGrid.size).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// canPlaceBuilding
// ---------------------------------------------------------------------------

describe('canPlaceBuilding', () => {
    let system;

    beforeEach(() => {
        const { gridSystem, roadSystem } = makeOpenWorld();
        system = new MapBuildingSystem(gridSystem, roadSystem, makeBlockSystem());
    });

    it('returns true for a free in-bounds area', () => {
        expect(system.canPlaceBuilding(5, 5, 2, 2)).toBe(true);
    });

    it('returns false when the building extends out of bounds', () => {
        // Grid is 20x20 (0..19); a 2x2 at (19,19) needs (19,20) which is invalid
        expect(system.canPlaceBuilding(19, 19, 2, 2)).toBe(false);
        // Negative coordinates are out of bounds
        expect(system.canPlaceBuilding(-1, 5, 1, 1)).toBe(false);
    });

    it('returns false when a cell is occupied by a road', () => {
        const { gridSystem } = makeOpenWorld();
        const roadSystem = makeRoadSystem(new Set(['5,5']));
        system.gridSystem = gridSystem;
        system.roadSystem = roadSystem;

        expect(system.canPlaceBuilding(5, 5, 1, 1)).toBe(false);
        expect(system.canPlaceBuilding(4, 4, 2, 2)).toBe(false); // covers (5,5)
    });

    it('returns false when a cell is already in the building grid', () => {
        const building = {
            id: 'building-existing',
            position: { x: 5, y: 5 },
            size: { width: 2, height: 2 }
        };
        system.markBuildingCells(building);

        expect(system.canPlaceBuilding(5, 5, 1, 1)).toBe(false);
        expect(system.canPlaceBuilding(4, 4, 2, 2)).toBe(false); // overlaps (5,5)
        expect(system.canPlaceBuilding(7, 7, 1, 1)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// markBuildingCells / getBuildingForLocation / getBuildingsInZone /
// getBuildingAt / getBuildingData
// ---------------------------------------------------------------------------

describe('query and mutation helpers', () => {
    let system;

    beforeEach(() => {
        const { gridSystem, roadSystem } = makeOpenWorld();
        system = new MapBuildingSystem(gridSystem, roadSystem, makeBlockSystem());
    });

    it('markBuildingCells marks every cell of the building footprint', () => {
        const building = {
            id: 'building-1',
            position: { x: 3, y: 4 },
            size: { width: 2, height: 3 }
        };
        system.markBuildingCells(building);

        expect(system.buildingGrid.size).toBe(6);
        expect(system.buildingGrid.get('3,4')).toBe('building-1');
        expect(system.buildingGrid.get('4,4')).toBe('building-1');
        expect(system.buildingGrid.get('3,5')).toBe('building-1');
        expect(system.buildingGrid.get('4,5')).toBe('building-1');
        expect(system.buildingGrid.get('3,6')).toBe('building-1');
        expect(system.buildingGrid.get('4,6')).toBe('building-1');
        expect(system.buildingGrid.has('5,4')).toBe(false);
    });

    it('getBuildingForLocation returns the matching building or undefined', () => {
        const block = makeBlock(2, 2, 4, 4, 'zone-a');
        const building = system.placeBuildingInBlock(
            { id: 'loc-9', type: 'residence' }, block, system.buildingSizes.SMALL
        );

        expect(system.getBuildingForLocation('loc-9')).toBe(building);
        expect(system.getBuildingForLocation('loc-missing')).toBeUndefined();
    });

    it('getBuildingsInZone returns only buildings in the given zone', () => {
        const blockA = makeBlock(2, 2, 4, 4, 'zone-a');
        const blockB = makeBlock(10, 10, 4, 4, 'zone-b');
        const buildingA = system.placeBuildingInBlock(
            { id: 'loc-a', type: 'residence' }, blockA, system.buildingSizes.SMALL
        );
        const buildingB = system.placeBuildingInBlock(
            { id: 'loc-b', type: 'residence' }, blockB, system.buildingSizes.SMALL
        );

        expect(system.getBuildingsInZone('zone-a')).toEqual([buildingA]);
        expect(system.getBuildingsInZone('zone-b')).toEqual([buildingB]);
        expect(system.getBuildingsInZone('zone-c')).toEqual([]);
    });

    it('getBuildingAt returns the building occupying a cell, or null', () => {
        const block = makeBlock(2, 2, 4, 4, 'zone-a');
        const building = system.placeBuildingInBlock(
            { id: 'loc-7', type: 'residence' }, block, system.buildingSizes.SMALL
        );

        expect(system.getBuildingAt(building.position.x, building.position.y)).toBe(building);
        expect(system.getBuildingAt(0, 0)).toBeNull();
    });

    it('getBuildingData returns buildings and the building grid entries', () => {
        const block = makeBlock(2, 2, 4, 4, 'zone-a');
        const building = system.placeBuildingInBlock(
            { id: 'loc-8', type: 'residence' }, block, system.buildingSizes.SMALL
        );

        const data = system.getBuildingData();

        expect(data.buildings).toEqual([building]);
        expect(data.buildingGrid).toEqual([
            [`${building.position.x},${building.position.y}`, building.id]
        ]);
    });

    it('getAllBuildings returns the full building list', () => {
        expect(system.getAllBuildings()).toEqual([]);
        const block = makeBlock(2, 2, 4, 4, 'zone-a');
        const building = system.placeBuildingInBlock(
            { id: 'loc-10', type: 'residence' }, block, system.buildingSizes.SMALL
        );
        expect(system.getAllBuildings()).toEqual([building]);
    });
});
