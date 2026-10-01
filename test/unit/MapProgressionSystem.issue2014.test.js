/**
 * MapProgressionSystem Unit Tests
 * Verifies that switchMap properly updates world map locations and carries NPCs
 * Uses REAL WorldMap to test integration and collision avoidance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MapProgressionSystem } from '../../src/js/game/MapProgressionSystem.js';
import { WorldMap, LOCATIONS_MAP } from '../../src/js/game/WorldMap.js';

describe('MapProgressionSystem', () => {
    let gameState;
    let mapProgressionSystem;

    beforeEach(() => {
        // Use REAL WorldMap, not a mock
        const worldMap = new WorldMap({
            characterStats: {
                getStat: vi.fn((stat) => {
                    const stats = { charisma: 50 };
                    return stats[stat] || 0;
                })
            },
            reputation: 600,
            money: 50000,
            timeManager: { totalDays: 35 }
        });

        // Create real gameState with real worldMap
        gameState = {
            worldMap,
            characterStats: {
                getStat: vi.fn((stat) => {
                    const stats = { charisma: 50 };
                    return stats[stat] || 0;
                })
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
    });

    describe('updateWorldMapLocations', () => {
        it('should delegate to worldMap.addLocations', () => {
            const spy = vi.spyOn(gameState.worldMap, 'addLocations');
            const map = mapProgressionSystem.mapData['mid_game'];
            mapProgressionSystem.updateWorldMapLocations(map);
            expect(spy).toHaveBeenCalledWith(map.locations);
        });

        it('should return false when map is null', () => {
            const result = mapProgressionSystem.updateWorldMapLocations(null);
            expect(result).toBe(false);
        });

        it('should return false when map has no locations', () => {
            const map = { id: 'test', name: 'Test', locations: null };
            const result = mapProgressionSystem.updateWorldMapLocations(map);
            expect(result).toBe(false);
        });

        it('should return false when worldMap is missing', () => {
            gameState.worldMap = null;
            const map = mapProgressionSystem.mapData['mid_game'];
            const result = mapProgressionSystem.updateWorldMapLocations(map);
            expect(result).toBe(false);
        });
    });

    describe('WorldMap integration - collision avoidance', () => {
        it('should NOT overwrite real LOCATIONS with generic placeholders', () => {
            // tech_hub is a real LOCATION with requiresVehicle:'car' and unlock requirements
            const techHubReal = LOCATIONS_MAP.get('tech_hub');
            expect(techHubReal).toBeDefined();
            expect(techHubReal.requiresVehicle).toBe('car');
            expect(techHubReal.unlockRequirement).toBeDefined();
            expect(techHubReal.unlockRequirement.stat).toBe('charisma');

            // Switch to mid_game which tries to add tech_hub
            mapProgressionSystem.switchMap('mid_game');

            // Verify that tech_hub in worldMap still has the real requirements
            const techHubLookup = gameState.worldMap.getLocation('tech_hub');
            expect(techHubLookup).toBeDefined();
            expect(techHubLookup.requiresVehicle).toBe('car');
            expect(techHubLookup.unlockRequirement).toBeDefined();
            expect(techHubLookup.unlockRequirement.stat).toBe('charisma');
        });

        it('should NOT double-list locations after merge', () => {
            mapProgressionSystem.switchMap('mid_game');

            // With low charisma (50), tech_hub should NOT be accessible
            const accessible = gameState.worldMap.getAccessibleLocations();
            const techHubCount = accessible.filter(loc => loc.id === 'tech_hub').length;

            // Should appear at most once (and probably not at all due to access requirements)
            expect(techHubCount).toBeLessThanOrEqual(1);
        });

        it('luxury_district should keep real gating (high reputation + money)', () => {
            // luxury_district requires reputation: 5000, money: 100000
            // Our gameState has reputation: 600, money: 50000 - NOT enough
            const luxuryReal = LOCATIONS_MAP.get('luxury_district');
            expect(luxuryReal.unlockRequirement.reputation).toBe(5000);
            expect(luxuryReal.unlockRequirement.money).toBe(100000);

            mapProgressionSystem.switchMap('mid_game');

            // luxury_district should NOT be accessible due to insufficient funds
            const accessible = gameState.worldMap.getAccessibleLocations();
            const luxury = accessible.find(loc => loc.id === 'luxury_district');
            expect(luxury).toBeUndefined();
        });

        it('should NOT add locations already in LOCATIONS to locationOverrides', () => {
            mapProgressionSystem.switchMap('mid_game');

            const overrides = gameState.worldMap.locationOverrides;
            // None of the mid_game locations should be in overrides since they're all in LOCATIONS
            const midGameLocIds = ['tech_hub', 'downtown', 'networking_bar', 'stock_exchange', 'luxury_district'];

            midGameLocIds.forEach(id => {
                // If addLocations correctly skips existing LOCATIONS,
                // these should NOT be in locationOverrides
                expect(overrides[id]).toBeUndefined();
            });
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
