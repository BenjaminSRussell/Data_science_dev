import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import MapProgressionSystem from '../../src/systems/MapProgressionSystem';
import GameState from '../../src/GameState';

let gameState;

beforeAll(() => {
    gameState = new GameState();
});

beforeEach(() => {
    gameState.reset();
});

describe('MapProgressionSystem', () => {
    let mapProgressionSystem;

    beforeEach(() => {
        mapProgressionSystem = new MapProgressionSystem(gameState);
    });

    describe('checkMapUnlocks', () => {
        it('should return {unlocked: false} when gameState/mapData is missing', () => {
            gameState.mapData = null;
            expect(mapProgressionSystem.checkMapUnlocks()).toEqual({ unlocked: false });
        });

        it('should unlock mid_game when days >= 30 and reputation >= 500', () => {
            gameState.days = 30;
            gameState.reputation = 500;
            expect(mapProgressionSystem.checkMapUnlocks('mid_game')).toEqual({ unlocked: true });
        });

        it('should not unlock mid_game when days < 30', () => {
            gameState.days = 29;
            gameState.reputation = 500;
            expect(mapProgressionSystem.checkMapUnlocks('mid_game')).toEqual({ unlocked: false });
        });

        it('should not unlock mid_game when reputation < 500', () => {
            gameState.days = 30;
            gameState.reputation = 499;
            expect(mapProgressionSystem.checkMapUnlocks('mid_game')).toEqual({ unlocked: false });
        });

        it('should unlock end_game when days >= 90, reputation >= 2000, and money >= 100000', () => {
            gameState.days = 90;
            gameState.reputation = 2000;
            gameState.money = 100000;
            expect(mapProgressionSystem.checkMapUnlocks('end_game')).toEqual({ unlocked: true });
        });

        it('should not unlock end_game when days < 90', () => {
            gameState.days = 89;
            gameState.reputation = 2000;
            gameState.money = 100000;
            expect(mapProgressionSystem.checkMapUnlocks('end_game')).toEqual({ unlocked: false });
        });

        it('should not unlock end_game when reputation < 2000', () => {
            gameState.days = 90;
            gameState.reputation = 1999;
            gameState.money = 100000;
            expect(mapProgressionSystem.checkMapUnlocks('end_game')).toEqual({ unlocked: false });
        });

        it('should not unlock end_game when money < 100000', () => {
            gameState.days = 90;
            gameState.reputation = 2000;
            gameState.money = 99999;
            expect(mapProgressionSystem.checkMapUnlocks('end_game')).toEqual({ unlocked: false });
        });

        it('should not re-unlock an already-unlocked map', () => {
            gameState.unlockedMaps = ['mid_game'];
            expect(mapProgressionSystem.checkMapUnlocks('mid_game')).toEqual({ unlocked: false });
        });
    });

    describe('switchMap', () => {
        it('should fail with "Map not unlocked yet." for not-unlocked map', () => {
            expect(() => mapProgressionSystem.switchMap('mid_game')).toThrow('Map not unlocked yet.');
        });

        it('should fail with "Map not found." for unlocked-but-nonexistent map', () => {
            gameState.unlockedMaps = ['mid_game'];
            expect(() => mapProgressionSystem.switchMap('nonexistent_map')).toThrow('Map not found.');
        });

        it('should succeed and call updateWorldMapLocations when worldMap is truthy', () => {
            const updateWorldMapLocationsSpy = jest.spyOn(mapProgressionSystem, 'updateWorldMapLocations');
            gameState.unlockedMaps = ['mid_game'];
            gameState.worldMap = true;
            mapProgressionSystem.switchMap('mid_game');
            expect(updateWorldMapLocationsSpy).toHaveBeenCalled();
        });
    });

    describe('getNPCsThatFollow', () => {
        it('should return [] when npcManager is missing', () => {
            gameState.npcManager = null;
            expect(mapProgressionSystem.getNPCsThatFollow()).toEqual([]);
        });

        it('should filter NPCs with relationship > 70', () => {
            gameState.npcManager = {
                npcs: [
                    { relationship: 71, willFollow: false },
                    { relationship: 69, willFollow: false }
                ]
            };
            expect(mapProgressionSystem.getNPCsThatFollow()).toEqual([{ relationship: 71, willFollow: false }]);
        });

        it('should set willFollow to true when relationship > 85', () => {
            gameState.npcManager = {
                npcs: [
                    { relationship: 86, willFollow: false }
                ]
            };
            mapProgressionSystem.getNPCsThatFollow();
            expect(gameState.npcManager.npcs[0].willFollow).toBe(true);
        });

        it('should set willFollow to true for romance NPCs with relationship > 70', () => {
            gameState.npcManager = {
                npcs: [
                    { relationship: 71, type: 'romance', willFollow: false }
                ]
            };
            mapProgressionSystem.getNPCsThatFollow();
            expect(gameState.npcManager.npcs[0].willFollow).toBe(true);
        });
    });

    describe('getCurrentMap and getUnlockedMaps', () => {
        it('should reflect state and filter missing mapData entries', () => {
            gameState.unlockedMaps = ['mid_game', 'nonexistent_map'];
            gameState.mapData = {
                mid_game: { name: 'Mid Game' }
            };
            expect(mapProgressionSystem.getUnlockedMaps()).toEqual([{ name: 'Mid Game', id: 'mid_game' }]);
            expect(mapProgressionSystem.getCurrentMap()).toEqual({ name: 'Mid Game', id: 'mid_game' });
        });
    });

    describe('toJSON and fromJSON', () => {
        it('should round-trip', () => {
            const originalState = mapProgressionSystem.toJSON();
            const newState = new MapProgressionSystem(gameState);
            newState.fromJSON(originalState);
            expect(newState.toJSON()).toEqual(originalState);
        });

        it('should be safe with fromJSON(null)', () => {
            mapProgressionSystem.fromJSON(null);
            expect(mapProgressionSystem).toBeInstanceOf(MapProgressionSystem);
        });

        it('should default with fromJSON({})', () => {
            mapProgressionSystem.fromJSON({});
            expect(mapProgressionSystem).toBeInstanceOf(MapProgressionSystem);
        });
    });

    describe('travelToLocation', () => {
        it('should no-op safely when worldMap is missing', () => {
            gameState.worldMap = null;
            expect(() => mapProgressionSystem.travelToLocation('location1', 'vehicle1')).not.toThrow();
        });

        it('should no-op safely when locations is falsy', () => {
            gameState.worldMap = { locations: null };
            expect(() => mapProgressionSystem.travelToLocation('location1', 'vehicle1')).not.toThrow();
        });
    });
});