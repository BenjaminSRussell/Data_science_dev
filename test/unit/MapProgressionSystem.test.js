/**
 * MapProgressionSystem Unit Tests
 * Verifies that switchMap properly updates world map locations and carries NPCs
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MapProgressionSystem } from '../../src/js/game/MapProgressionSystem.js';

describe('MapProgressionSystem', () => {
    let gameState;
    let mapProgressionSystem;

    beforeEach(() => {
        // Mock gameState
        gameState = {
            worldMap: {
                locationOverrides: {},
                addLocations: vi.fn((locations) => {
                    // Mock implementation: add locations to locationOverrides
                    if (!locations || !Array.isArray(locations)) {
                        return false;
                    }
                    let count = 0;
                    locations.forEach(loc => {
                        if (loc && loc.id) {
                            gameState.worldMap.locationOverrides[loc.id] = {
                                id: loc.id,
                                name: loc.name || loc.id,
                                x: loc.x || 0,
                                y: loc.y || 0
                            };
                            count++;
                        }
                    });
                    return count > 0;
                }),
                _invalidateCache: vi.fn()
            },
            npcManager: {
                getMetNPCs: vi.fn(() => [
                    { id: 'alex_rivera', type: 'companion' },
                    { id: 'professor_higgins', type: 'friend' }
                ]),
                getRelationship: vi.fn((npcId) => {
                    const relationships = {
                        'alex_rivera': 80,
                        'professor_higgins': 75
                    };
                    return relationships[npcId] || 0;
                })
            },
            reputation: 600,
            money: 50000,
            timeManager: { totalDays: 35 }
        };

        mapProgressionSystem = new MapProgressionSystem(gameState);
        mapProgressionSystem.unlockMap('mid_game');
    });

    describe('switchMap', () => {
        it('should fail if map is not unlocked', () => {
            const result = mapProgressionSystem.switchMap('end_game');
            expect(result.success).toBe(false);
            expect(result.message).toBe('Map not unlocked yet.');
        });

        it('should fail if map does not exist', () => {
            // Unlock a map first, then test with nonexistent_map
            mapProgressionSystem.unlockedMaps.push('fake_map_that_does_not_exist');
            const result = mapProgressionSystem.switchMap('fake_map_that_does_not_exist');
            expect(result.success).toBe(false);
            expect(result.message).toBe('Map not found.');
        });

        it('should update current map when switching', () => {
            mapProgressionSystem.switchMap('mid_game');
            expect(mapProgressionSystem.currentMap).toBe('mid_game');
        });

        it('should call updateWorldMapLocations when worldMap exists', () => {
            const spy = vi.spyOn(mapProgressionSystem, 'updateWorldMapLocations');
            mapProgressionSystem.switchMap('mid_game');
            expect(spy).toHaveBeenCalled();
        });

        it('should call getNPCsThatFollow when switching maps', () => {
            const spy = vi.spyOn(mapProgressionSystem, 'getNPCsThatFollow');
            mapProgressionSystem.switchMap('mid_game');
            expect(spy).toHaveBeenCalled();
        });

        it('should return success with map data and followingNPCs', () => {
            const result = mapProgressionSystem.switchMap('mid_game');
            expect(result.success).toBe(true);
            expect(result.map).toEqual(mapProgressionSystem.mapData['mid_game']);
            expect(result.message).toContain('arrived');
            expect(result.followingNPCs).toBeDefined();
        });

        it('should not update world map when worldMap is missing', () => {
            gameState.worldMap = null;
            const result = mapProgressionSystem.switchMap('mid_game');
            expect(result.success).toBe(true);
        });

        it('should return failure when location update fails', () => {
            // Mock addLocations to return false
            gameState.worldMap.addLocations = vi.fn(() => false);

            const result = mapProgressionSystem.switchMap('mid_game');
            expect(result.success).toBe(false);
            expect(result.message).toBe('Failed to update map locations.');
        });
    });

    describe('updateWorldMapLocations', () => {
        it('should add locations to locationOverrides', () => {
            const map = mapProgressionSystem.mapData['mid_game'];
            const result = mapProgressionSystem.updateWorldMapLocations(map);

            // Verify locations were added
            expect(result).toBe(true);
            expect(gameState.worldMap.addLocations).toHaveBeenCalled();
            // Verify that first location is in locationOverrides
            expect(gameState.worldMap.locationOverrides['tech_hub']).toBeDefined();
        });

        it('should return false when addLocations returns false', () => {
            gameState.worldMap.addLocations = vi.fn(() => false);
            const map = mapProgressionSystem.mapData['mid_game'];

            const result = mapProgressionSystem.updateWorldMapLocations(map);
            expect(result).toBe(false);
        });

        it('should handle map with locations array', () => {
            const map = {
                id: 'test_map',
                name: 'Test Map',
                locations: [
                    { id: 'loc1', name: 'Location 1', x: 10, y: 20 },
                    { id: 'loc2', name: 'Location 2', x: 30, y: 40 }
                ]
            };

            const result = mapProgressionSystem.updateWorldMapLocations(map);
            // When addLocations is mocked, it returns true/false based on count
            expect(typeof result).toBe('boolean');
        });

        it('should handle map with null/undefined locations', () => {
            const mapNoLocations = {
                id: 'test',
                name: 'Test',
                locations: null
            };

            const result = mapProgressionSystem.updateWorldMapLocations(mapNoLocations);
            expect(result).toBe(false);
        });

        it('should use fallback when addLocations is not a function', () => {
            gameState.worldMap.addLocations = undefined;
            const map = {
                id: 'test_map',
                name: 'Test Map',
                locations: [
                    { id: 'loc1', name: 'Location 1', x: 10, y: 20 }
                ]
            };

            const result = mapProgressionSystem.updateWorldMapLocations(map);
            expect(result).toBe(true);
            expect(gameState.worldMap.locationOverrides['loc1']).toBeDefined();
        });
    });

    describe('getNPCsThatFollow', () => {
        it('should return NPCs with relationship > 70', () => {
            const followingNPCs = mapProgressionSystem.getNPCsThatFollow();
            expect(followingNPCs.length).toBeGreaterThan(0);
            followingNPCs.forEach(item => {
                expect(item.relationship).toBeGreaterThan(70);
            });
        });

        it('should mark romance type as definite followers', () => {
            gameState.npcManager.getMetNPCs = vi.fn(() => [
                { id: 'romance_npc', type: 'romance' }
            ]);
            // Set relationship > 70 for the romance NPC to be included
            gameState.npcManager.getRelationship = vi.fn(() => 75);

            const followingNPCs = mapProgressionSystem.getNPCsThatFollow();
            const romanceNPC = followingNPCs.find(item => item.npc.id === 'romance_npc');

            expect(romanceNPC).toBeDefined();
            expect(romanceNPC.willFollow).toBe(true);
        });

        it('should mark high relationship (>85) as definite followers', () => {
            gameState.npcManager.getMetNPCs = vi.fn(() => [
                { id: 'high_rel_npc', type: 'companion' }
            ]);
            gameState.npcManager.getRelationship = vi.fn(() => 90);

            const followingNPCs = mapProgressionSystem.getNPCsThatFollow();
            const highRelNPC = followingNPCs.find(item => item.npc.id === 'high_rel_npc');

            expect(highRelNPC).toBeDefined();
            expect(highRelNPC.willFollow).toBe(true);
        });

        it('should return empty array if no npcManager', () => {
            gameState.npcManager = null;
            const followingNPCs = mapProgressionSystem.getNPCsThatFollow();
            expect(followingNPCs).toEqual([]);
        });

        it('should exclude NPCs with relationship <= 70 unless romance type', () => {
            gameState.npcManager.getMetNPCs = vi.fn(() => [
                { id: 'low_rel_npc', type: 'friend' }
            ]);
            gameState.npcManager.getRelationship = vi.fn(() => 60);

            const followingNPCs = mapProgressionSystem.getNPCsThatFollow();
            expect(followingNPCs.length).toBe(0);
        });
    });
});
