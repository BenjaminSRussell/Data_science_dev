/**
 * Companions with willFollow actually change location when the player
 * travels or switches maps (#1705).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MapProgressionSystem } from '../../src/js/game/MapProgressionSystem.js';
import { NPCManager, NPCs } from '../../src/js/game/NPCManager.js';
import { WorldMap } from '../../src/js/game/WorldMap.js';

const MENTOR = 'professor_higgins';
const ROMANCE = 'emma_bloom';

function setup() {
    const gs = {
        money: 0,
        reputation: 0,
        characterStats: { ethics: 25, getStat: () => 0 },
        timeManager: { totalDays: 1 }
    };
    gs.npcManager = new NPCManager(gs);
    gs.worldMap = new WorldMap(gs);
    gs.mapProgressionSystem = new MapProgressionSystem(gs);
    return gs;
}

describe('companions travel with the player (#1705)', () => {
    let gs;

    beforeEach(() => {
        gs = setup();
    });

    it('does not rewrite the shared NPC catalog', () => {
        const home = NPCs.find(n => n.id === MENTOR).location;
        gs.npcManager.markNPCAsMet(MENTOR);
        gs.npcManager.relationships[MENTOR] = 90;
        gs.worldMap.travelTo('library');
        expect(NPCs.find(n => n.id === MENTOR).location).toBe(home);
        expect(gs.npcManager.getNPCsAtLocation('library').find(n => n.id === MENTOR).location).toBe('library');
    });

    it('moves a met NPC with relationship above 85 when the player travels', () => {
        gs.npcManager.markNPCAsMet(MENTOR);
        gs.npcManager.relationships[MENTOR] = 90;
        expect(gs.npcManager.getNPCsAtLocation('university').map(n => n.id)).toContain(MENTOR);

        const res = gs.worldMap.travelTo('library');
        expect(res.success).toBe(true);
        expect(res.followers).toContain(MENTOR);
        expect(gs.npcManager.getNPCsAtLocation('university').map(n => n.id)).not.toContain(MENTOR);
        expect(gs.npcManager.getNPCsAtLocation('library').map(n => n.id)).toContain(MENTOR);
        expect(gs.npcManager.getMetNPCs().find(n => n.id === MENTOR).location).toBe('library');
    });

    it('leaves a non-romance NPC at relationship 71 where they started', () => {
        gs.npcManager.markNPCAsMet(MENTOR);
        gs.npcManager.relationships[MENTOR] = 71;
        const listed = gs.mapProgressionSystem.getNPCsThatFollow();
        expect(listed).toEqual([expect.objectContaining({ relationship: 71, willFollow: false })]);

        gs.worldMap.travelTo('library');
        expect(gs.npcManager.getNPCsAtLocation('university').map(n => n.id)).toContain(MENTOR);
        expect(gs.npcManager.getNPCsAtLocation('library').map(n => n.id)).not.toContain(MENTOR);
    });

    it('a romance partner follows even when relationship is 70 or below', () => {
        gs.npcManager.markNPCAsMet(ROMANCE);
        gs.npcManager.relationships[ROMANCE] = 40;
        const entry = gs.mapProgressionSystem.getNPCsThatFollow().find(e => e.npc.id === ROMANCE);
        expect(entry.willFollow).toBe(true);
        expect(entry.relationship).toBe(40);

        gs.worldMap.travelTo('gym');
        expect(gs.npcManager.getNPCsAtLocation('library').map(n => n.id)).not.toContain(ROMANCE);
        expect(gs.npcManager.getNPCsAtLocation('gym').map(n => n.id)).toContain(ROMANCE);
    });

    it('does not bring someone the player has not met', () => {
        gs.npcManager.relationships[MENTOR] = 100;
        gs.worldMap.travelTo('library');
        expect(gs.npcManager.getNPCsAtLocation('university').map(n => n.id)).toContain(MENTOR);
    });

    it('does not move companions when travel is refused', () => {
        gs.npcManager.markNPCAsMet(MENTOR);
        gs.npcManager.relationships[MENTOR] = 90;
        const refused = gs.worldMap.travelTo('luxury_district');
        expect(refused.can).toBe(false);
        expect(gs.npcManager.getNPCLocation(MENTOR)).toBe('university');
    });

    it('switchMap places followers on a location of the new map', () => {
        gs.npcManager.markNPCAsMet(MENTOR);
        gs.npcManager.relationships[MENTOR] = 90;
        gs.mapProgressionSystem.unlockMap('mid_game');
        const result = gs.mapProgressionSystem.switchMap('mid_game');
        expect(result.success).toBe(true);
        expect(result.followers).toEqual([MENTOR]);
        expect(gs.npcManager.getNPCLocation(MENTOR)).toBe('tech_hub');
        expect(gs.npcManager.getNPCsAtLocation('tech_hub').map(n => n.id)).toContain(MENTOR);
    });

    it('switchMap keeps followers with the player when the new map has no world location', () => {
        gs.worldMap.travelTo('library');
        gs.npcManager.markNPCAsMet(MENTOR);
        gs.npcManager.relationships[MENTOR] = 90;
        gs.mapProgressionSystem.unlockMap('end_game');
        gs.mapProgressionSystem.switchMap('end_game');
        expect(gs.npcManager.getNPCLocation(MENTOR)).toBe('library');
    });

    it('followed locations survive save and load and clear when sent home', () => {
        gs.npcManager.markNPCAsMet(MENTOR);
        gs.npcManager.relationships[MENTOR] = 90;
        gs.worldMap.travelTo('gym');

        const restored = new NPCManager(setup());
        restored.fromJSON(JSON.parse(JSON.stringify(gs.npcManager.toJSON())));
        expect(restored.getNPCLocation(MENTOR)).toBe('gym');
        expect(restored.getNPCsAtLocation('gym').map(n => n.id)).toContain(MENTOR);

        expect(restored.setNPCLocation(MENTOR, 'university')).toBe(true);
        expect(restored.followedLocations[MENTOR]).toBeUndefined();
        expect(restored.getNPCsAtLocation('university').map(n => n.id)).toContain(MENTOR);
    });

    it('switchMap without an NPC manager still succeeds', () => {
        const mapSystem = new MapProgressionSystem({});
        const result = mapSystem.switchMap('early_game');
        expect(result.success).toBe(true);
        expect(result.followers).toEqual([]);
    });
});
