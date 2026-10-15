import { describe, it, expect } from 'vitest';
import { MapProgressionSystem } from '../../src/js/game/MapProgressionSystem.js';
import { WorldMap, LOCATIONS } from '../../src/js/game/WorldMap.js';

function npcManager(npcs) {
    return {
        getMetNPCs: () => npcs,
        getRelationship: (id) => npcs.find(npc => npc.id === id)?.relationship || 0
    };
}

describe('switchMap wires locations and companions (#2014)', () => {
    it('still succeeds when there is no world map to merge into', () => {
        const mapSystem = new MapProgressionSystem({});
        const result = mapSystem.switchMap('early_game');
        expect(result.success).toBe(true);
        expect(result.companions).toEqual([]);
        expect(mapSystem.currentMap).toBe('early_game');
        expect(mapSystem.followingNPCs).toEqual([]);
    });

    it('does not report success when a world map rejects the merge', () => {
        const mapSystem = new MapProgressionSystem({ worldMap: Object.freeze({}) });
        mapSystem.unlockMap('mid_game');
        const result = mapSystem.switchMap('mid_game');
        expect(result.success).toBe(false);
        expect(result.message).toBe('Could not update locations for this map.');
        expect(mapSystem.currentMap).toBe('early_game');
        expect(mapSystem.followingNPCs).toEqual([]);
    });

    it('keeps catalog locations and adds missing ones in WorldMap shape', () => {
        const worldMap = new WorldMap({});
        const before = worldMap.getLocations().length;
        const mapSystem = new MapProgressionSystem({ worldMap });
        mapSystem.unlockMap('end_game');

        const early = mapSystem.switchMap('early_game');
        expect(early.success).toBe(true);
        expect(worldMap.getLocations().length).toBe(before);
        expect(worldMap.getLocations().filter(loc => loc.id === 'home')).toHaveLength(1);
        expect(worldMap.getLocation('gym').position).toEqual(LOCATIONS.find(loc => loc.id === 'gym').position);

        const end = mapSystem.switchMap('end_game');
        expect(end.success).toBe(true);
        expect(mapSystem.currentMap).toBe('end_game');
        const tower = worldMap.getLocation('executive_tower');
        expect(tower).toMatchObject({
            id: 'executive_tower',
            name: 'Executive Tower',
            type: 'district',
            travelTime: 1,
            requiresVehicle: false,
            unlockRequirement: null,
            activities: [],
            position: { x: 50, y: 40 }
        });
        expect(tower.icon).toBe('/assets/icons/locations/executive_tower.png');
        expect(tower.background).toBe('url("/assets/backgrounds/locations/executive_tower.png")');
        expect(worldMap.getLocations().some(loc => loc.id === 'executive_tower')).toBe(true);
        expect(worldMap.canTravelTo('executive_tower').can).toBe(true);
        expect(worldMap.getAccessibleLocations().some(loc => loc.id === 'private_club')).toBe(true);

        mapSystem.switchMap('end_game');
        expect(worldMap.getLocations().filter(loc => loc.id === 'executive_tower')).toHaveLength(1);
    });

    it('merges into a plain locations array when mergeLocation is absent', () => {
        const worldMap = {};
        const mapSystem = new MapProgressionSystem({ worldMap });
        const result = mapSystem.switchMap('early_game');
        expect(result.success).toBe(true);
        expect(worldMap.locations.map(loc => loc.id)).toEqual(['home', 'coffee_shop', 'library', 'gym']);
        expect(worldMap.locations[0]).toMatchObject({
            id: 'home',
            name: 'Home',
            position: { x: 50, y: 70 },
            travelTime: 1,
            requiresVehicle: false,
            unlockRequirement: null,
            activities: []
        });
    });

    it('carries only NPCs that will follow onto the new map', () => {
        const romance = { id: 'alex', type: 'romance', relationship: 80, location: 'coffee_shop' };
        const close = { id: 'jordan', type: 'friend', relationship: 90, location: 'gym' };
        const maybe = { id: 'sam', type: 'friend', relationship: 75, location: 'library' };
        const stranger = { id: 'pat', type: 'romance', relationship: 40, location: 'home' };
        const worldMap = new WorldMap({});
        const mapSystem = new MapProgressionSystem({
            worldMap,
            npcManager: npcManager([romance, close, maybe, stranger])
        });

        const result = mapSystem.switchMap('early_game');
        expect(result.success).toBe(true);
        expect(result.companions).toEqual(['alex', 'jordan']);
        expect(mapSystem.followingNPCs).toEqual([
            { id: 'alex', relationship: 80, mapId: 'early_game', locationId: 'home' },
            { id: 'jordan', relationship: 90, mapId: 'early_game', locationId: 'home' }
        ]);
        expect(worldMap.followingNPCs).toEqual(mapSystem.followingNPCs);
        expect(romance.location).toBe('coffee_shop');
        expect(close.location).toBe('gym');
    });
});
