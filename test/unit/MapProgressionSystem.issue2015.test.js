/**
 * Unit tests for MapProgressionSystem
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MapProgressionSystem } from '../../src/js/game/MapProgressionSystem.js';

describe('MapProgressionSystem', () => {
    let mapSystem;

    beforeEach(() => {
        mapSystem = new MapProgressionSystem({});
    });

    describe('constructor', () => {
        it('should initialize with early_game as starting map', () => {
            expect(mapSystem.currentMap).toBe('early_game');
        });

        it('should initialize with early_game in unlockedMaps', () => {
            expect(mapSystem.unlockedMaps).toEqual(['early_game']);
        });
    });

    describe('fromJSON', () => {
        it('should restore currentMap from data', () => {
            mapSystem.fromJSON({ currentMap: 'mid_game' });
            expect(mapSystem.currentMap).toBe('mid_game');
        });

        it('should restore unlockedMaps from data', () => {
            mapSystem.fromJSON({ unlockedMaps: ['early_game', 'mid_game'] });
            expect(mapSystem.unlockedMaps).toEqual(['early_game', 'mid_game']);
        });

        it('should fall back to early_game when currentMap is missing', () => {
            mapSystem.fromJSON({ unlockedMaps: ['early_game'] });
            expect(mapSystem.currentMap).toBe('early_game');
        });

        it('should fall back to [early_game] when unlockedMaps is missing', () => {
            mapSystem.fromJSON({ currentMap: 'early_game' });
            expect(mapSystem.unlockedMaps).toEqual(['early_game']);
        });

        it('should fall back to [early_game] when unlockedMaps is null', () => {
            mapSystem.fromJSON({ unlockedMaps: null });
            expect(mapSystem.unlockedMaps).toEqual(['early_game']);
        });

        it('should fall back to [early_game] when unlockedMaps is undefined', () => {
            mapSystem.fromJSON({ unlockedMaps: undefined });
            expect(mapSystem.unlockedMaps).toEqual(['early_game']);
        });

        it('should fall back to [early_game] when unlockedMaps is an empty array', () => {
            mapSystem.fromJSON({ unlockedMaps: [] });
            expect(mapSystem.unlockedMaps).toEqual(['early_game']);
        });
    });

    describe('switchMap', () => {
        it('should allow switching to early_game when unlocked', () => {
            const result = mapSystem.switchMap('early_game');
            expect(result.success).toBe(true);
            expect(mapSystem.currentMap).toBe('early_game');
        });

        it('should prevent switching to locked map', () => {
            const result = mapSystem.switchMap('mid_game');
            expect(result.success).toBe(false);
        });

        it('should allow switching after map is unlocked', () => {
            mapSystem.unlockMap('mid_game');
            const result = mapSystem.switchMap('mid_game');
            expect(result.success).toBe(true);
            expect(mapSystem.currentMap).toBe('mid_game');
        });

        it('should prevent switching when unlockedMaps is empty', () => {
            mapSystem.unlockedMaps = [];
            const result = mapSystem.switchMap('early_game');
            expect(result.success).toBe(false);
        });
    });

    describe('regression test for issue #2015', () => {
        it('should prevent lockout when save has empty unlockedMaps array', () => {
            // Simulate loading a corrupted/malformed save with empty unlockedMaps
            mapSystem.fromJSON({ unlockedMaps: [] });

            // Player should still be able to access early_game
            expect(mapSystem.unlockedMaps).toContain('early_game');

            // switchMap to early_game should succeed
            const result = mapSystem.switchMap('early_game');
            expect(result.success).toBe(true);
        });
    });
});
