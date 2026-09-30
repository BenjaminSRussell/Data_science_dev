/**
 * Unit tests for NPCManager - NPC benefits audit (issue #2622)
 * Tests that 6 audit-target NPCs don't have unused benefits declared
 */

import { describe, it, expect } from 'vitest';
import { NPCs } from '../../src/js/game/NPCManager.js';

describe('NPCManager', () => {
    describe('NPC benefits audit - issue #2622', () => {
        // These 6 NPCs were audit targets with unused benefits declarations
        const auditTargetNPCIds = [
            'victoria_sterling',
            'donna_delight',
            'bob_bagel',
            'jordan_kim',
            'the_broker',
            'marcus_thompson'
        ];

        it('should not have unused benefits declared on audit-target NPCs', () => {
            auditTargetNPCIds.forEach(npcId => {
                const npc = NPCs.find(n => n.id === npcId);
                expect(npc, `NPC ${npcId} should exist`).toBeDefined();

                // These NPCs should not have benefits property because benefits
                // are never used anywhere in the codebase (verified by grep)
                expect(npc.benefits, `NPC ${npcId} should not have unused benefits declared`).toBeUndefined();
            });
        });

        it('should have flora_bloom as NPC without benefits (audit baseline)', () => {
            const flora = NPCs.find(n => n.id === 'flora_bloom');
            expect(flora).toBeDefined();
            expect(flora.benefits).toBeUndefined();
        });
    });
});
