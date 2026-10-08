/**
 * Unit tests for MapBlockSystem
 */

import { describe, it, expect } from 'vitest';
import { MapBlockSystem } from '../../src/js/game/MapBlockSystem.js';

// Mock classes for dependencies
class MockGridSystem {
    constructor(gridWidth = 10, gridHeight = 10) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
    }

    getGridKey(x, y) {
        return `${x},${y}`;
    }

    getGridRect(x, y, width, height) {
        const coords = [];
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                coords.push({ x: x + dx, y: y + dy });
            }
        }
        return coords;
    }

    isValidGridCoord(x, y) {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
    }
}

class MockRoadSystem {
    isRoad(x, y) {
        return false;
    }
}

class MockZoneSystem {
    constructor(zones = []) {
        this.zones = zones;
    }

    getZonesByType(zoneType) {
        return this.zones.filter(z => z.type === zoneType);
    }

    getZoneAt(x, y) {
        return this.zones.find(z => {
            const inBounds = x >= z.x && x < z.x + z.width &&
                            y >= z.y && y < z.y + z.height;
            return inBounds;
        });
    }
}

describe('MapBlockSystem', () => {
    describe('findAvailableBlock', () => {
        it('should find blocks that fit square dimensions', () => {
            const gridSystem = new MockGridSystem();
            const roadSystem = new MockRoadSystem();
            const zoneSystem = new MockZoneSystem([
                { id: 'zone-1', type: 'residential', x: 0, y: 0, width: 10, height: 10 }
            ]);

            const blockSystem = new MapBlockSystem(gridSystem, roadSystem, zoneSystem);

            // Manually create a test block
            blockSystem.blocks = [
                {
                    id: 'block-1',
                    bounds: { x: 0, y: 0, width: 4, height: 4 },
                    center: { x: 2, y: 2 },
                    zone: 'zone-1',
                    locations: []
                }
            ];

            // Find with 2x2 dimensions (square)
            const block = blockSystem.findAvailableBlock('residential', { width: 2, height: 2 });
            expect(block).toBeDefined();
            expect(block.id).toBe('block-1');
        });

        it('should correctly filter blocks when width and height differ', () => {
            const gridSystem = new MockGridSystem();
            const roadSystem = new MockRoadSystem();
            const zoneSystem = new MockZoneSystem([
                { id: 'zone-1', type: 'residential', x: 0, y: 0, width: 10, height: 10 }
            ]);

            const blockSystem = new MapBlockSystem(gridSystem, roadSystem, zoneSystem);

            // Create test blocks with various dimensions
            blockSystem.blocks = [
                // Block that is wide enough but not tall enough for 2x4 building
                {
                    id: 'block-too-short',
                    bounds: { x: 0, y: 0, width: 2, height: 2 },
                    center: { x: 1, y: 1 },
                    zone: 'zone-1',
                    locations: []
                },
                // Block that can fit 2x4 building
                {
                    id: 'block-fits',
                    bounds: { x: 3, y: 0, width: 2, height: 4 },
                    center: { x: 4, y: 2 },
                    zone: 'zone-1',
                    locations: []
                },
                // Block that can also fit 2x4 building but is larger
                {
                    id: 'block-larger',
                    bounds: { x: 6, y: 0, width: 3, height: 5 },
                    center: { x: 7, y: 2 },
                    zone: 'zone-1',
                    locations: []
                }
            ];

            // Find with 2x4 dimensions (non-square, tall building)
            const block = blockSystem.findAvailableBlock('residential', { width: 2, height: 4 });

            // Should not return the too-short block
            expect(block).toBeDefined();
            expect(block.id).not.toBe('block-too-short');

            // Should return the largest block that fits
            expect(block.id).toBe('block-larger');
        });

        it('should reject blocks that do not meet height requirements for non-square sizes', () => {
            const gridSystem = new MockGridSystem();
            const roadSystem = new MockRoadSystem();
            const zoneSystem = new MockZoneSystem([
                { id: 'zone-1', type: 'residential', x: 0, y: 0, width: 10, height: 10 }
            ]);

            const blockSystem = new MapBlockSystem(gridSystem, roadSystem, zoneSystem);

            // Create only a block that's wide enough (2x2) but not tall enough for 2x4
            blockSystem.blocks = [
                {
                    id: 'block-insufficient-height',
                    bounds: { x: 0, y: 0, width: 2, height: 2 },
                    center: { x: 1, y: 1 },
                    zone: 'zone-1',
                    locations: []
                }
            ];

            // Try to find block for 2x4 building
            const block = blockSystem.findAvailableBlock('residential', { width: 2, height: 4 });

            // The only block doesn't meet the height requirement; the fallback
            // no longer hands back an undersized block (#1944)
            expect(block).toBeNull();
        });

        it('should maintain backward compatibility with numeric minSize parameter', () => {
            const gridSystem = new MockGridSystem();
            const roadSystem = new MockRoadSystem();
            const zoneSystem = new MockZoneSystem([
                { id: 'zone-1', type: 'residential', x: 0, y: 0, width: 10, height: 10 }
            ]);

            const blockSystem = new MapBlockSystem(gridSystem, roadSystem, zoneSystem);

            blockSystem.blocks = [
                {
                    id: 'block-1',
                    bounds: { x: 0, y: 0, width: 3, height: 3 },
                    center: { x: 1, y: 1 },
                    zone: 'zone-1',
                    locations: []
                }
            ];

            // Call with legacy numeric parameter (treated as both width and height)
            const block = blockSystem.findAvailableBlock('residential', 2);
            expect(block).toBeDefined();
            expect(block.id).toBe('block-1');
        });

        it('should return largest available block among multiple options', () => {
            const gridSystem = new MockGridSystem();
            const roadSystem = new MockRoadSystem();
            const zoneSystem = new MockZoneSystem([
                { id: 'zone-1', type: 'residential', x: 0, y: 0, width: 10, height: 10 }
            ]);

            const blockSystem = new MapBlockSystem(gridSystem, roadSystem, zoneSystem);

            blockSystem.blocks = [
                {
                    id: 'block-small',
                    bounds: { x: 0, y: 0, width: 2, height: 2 },
                    center: { x: 1, y: 1 },
                    zone: 'zone-1',
                    locations: []
                },
                {
                    id: 'block-medium',
                    bounds: { x: 3, y: 0, width: 3, height: 3 },
                    center: { x: 4, y: 1 },
                    zone: 'zone-1',
                    locations: []
                },
                {
                    id: 'block-large',
                    bounds: { x: 7, y: 0, width: 4, height: 4 },
                    center: { x: 8, y: 2 },
                    zone: 'zone-1',
                    locations: []
                }
            ];

            const block = blockSystem.findAvailableBlock('residential', { width: 2, height: 2 });
            expect(block.id).toBe('block-large');
        });

        it('should not return occupied blocks', () => {
            const gridSystem = new MockGridSystem();
            const roadSystem = new MockRoadSystem();
            const zoneSystem = new MockZoneSystem([
                { id: 'zone-1', type: 'residential', x: 0, y: 0, width: 10, height: 10 }
            ]);

            const blockSystem = new MapBlockSystem(gridSystem, roadSystem, zoneSystem);

            blockSystem.blocks = [
                {
                    id: 'block-occupied',
                    bounds: { x: 0, y: 0, width: 3, height: 3 },
                    center: { x: 1, y: 1 },
                    zone: 'zone-1',
                    locations: ['location-1'] // Already has a location
                },
                {
                    id: 'block-free',
                    bounds: { x: 4, y: 0, width: 3, height: 3 },
                    center: { x: 5, y: 1 },
                    zone: 'zone-1',
                    locations: []
                }
            ];

            const block = blockSystem.findAvailableBlock('residential', { width: 2, height: 2 });
            expect(block.id).toBe('block-free');
        });
    });
});
