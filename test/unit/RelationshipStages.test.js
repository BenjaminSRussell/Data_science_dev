/**
 * One relationship-stage scale shared by NPCManager, RoommateSystem and the
 * dialogue systems, matching the design docs (#916, #566)
 */
import { describe, it, expect } from 'vitest';
import { RELATIONSHIP_STAGES, relationshipStage } from '../../src/js/data/relationshipStages.js';
import { NPCManager } from '../../src/js/game/NPCManager.js';
import { RoommateSystem } from '../../src/js/game/social/RoommateSystem.js';
import { RelationshipDialogueSystem } from '../../src/js/game/dialogue/RelationshipDialogueSystem.js';
import { npcDialogueLoader } from '../../src/js/game/dialogue/NPCDialogueLoader.js';

describe('relationship stages', () => {
    it('follow the design-doc order and floors, with no best_friend', () => {
        expect(RELATIONSHIP_STAGES.map(s => s.tier)).toEqual(['stranger', 'friendly', 'acquaintance', 'friend', 'close_friend']);
        expect(RELATIONSHIP_STAGES.map(s => s.min)).toEqual([0, 20, 40, 60, 80]);
        expect(relationshipStage(100).tier).toBe('close_friend');
        expect(relationshipStage(-5).tier).toBe('stranger');
        expect(relationshipStage('x').tier).toBe('stranger');
    });

    it('every system reports the same stage for the same value', () => {
        const npc = new NPCManager({});
        const room = new RoommateSystem({});
        const rds = new RelationshipDialogueSystem();
        for (let v = 0; v <= 100; v++) {
            const expected = relationshipStage(v).tier;
            npc.relationships.test_npc = v;
            room.relationship = v;
            expect(npc.getRelationshipTier('test_npc').tier, `npc ${v}`).toBe(expected);
            expect(room.getRelationshipLevel(), `roommate ${v}`).toBe(expected);
            expect(rds.getRelationshipStage(v), `dialogue ${v}`).toBe(expected);
            expect(npcDialogueLoader.getRelationshipStage(v), `loader ${v}`).toBe(expected);
        }
    });

    it('NPCManager tier keeps its label/color shape for the UI', () => {
        const npc = new NPCManager({});
        npc.relationships.a = 85;
        expect(npc.getRelationshipTier('a')).toEqual({ tier: 'close_friend', label: 'Close Friend', color: '#ffd93d' });
    });
});
