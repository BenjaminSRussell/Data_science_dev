import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateRelationshipsScreen } from '../../src/js/helpers/NPCHelpers.js';

const npc = (id, extra = {}) => ({ id, name: `N ${id}`, title: 'Analyst', relationship: 50, tier: { label: 'Friend' }, type: 'friend', ...extra });

describe('NPCHelpers.updateRelationshipsScreen (#199)', () => {
    beforeEach(() => { document.body.innerHTML = '<div id="npc-grid"></div>'; });

    it('shows an empty-state message when no NPCs have been met', () => {
        updateRelationshipsScreen({ npcManager: { getMetNPCs: () => [] } });
        expect(document.querySelectorAll('.npc-card')).toHaveLength(0);
        expect(document.querySelector('.npc-grid-empty')).not.toBeNull();
    });

    it('renders one card per NPC without throwing', () => {
        expect(() => updateRelationshipsScreen({ npcManager: { getMetNPCs: () => [npc('a'), npc('b')] } })).not.toThrow();
        const cards = document.querySelectorAll('.npc-card');
        expect(cards).toHaveLength(2);
        expect(cards[0].dataset.npc).toBe('a');
        expect(cards[0].querySelector('.npc-name').textContent).toBe('N a');
        expect(cards[0].querySelector('.relationship-tier').textContent).toBe('Friend');
        expect(cards[0].getAttribute('role')).toBe('button');
    });

    it('falls back to gameState.npcManager and clears old cards on re-render', () => {
        const game = { gameState: { npcManager: { getMetNPCs: () => [npc('a')] } } };
        updateRelationshipsScreen(game);
        updateRelationshipsScreen(game);
        expect(document.querySelectorAll('.npc-card')).toHaveLength(1);
    });

    it('tolerates a missing tier and clamps the relationship bar', () => {
        updateRelationshipsScreen({ npcManager: { getMetNPCs: () => [npc('a', { tier: undefined, relationship: 150 }), npc('b', { relationship: -5 })] } });
        const fills = document.querySelectorAll('.relationship-fill');
        expect(fills[0].style.width).toBe('100%');
        expect(fills[1].style.width).toBe('0%');
    });

    it('warns and returns without an npcManager or grid', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const err = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => updateRelationshipsScreen({})).not.toThrow();
        document.body.innerHTML = '';
        expect(() => updateRelationshipsScreen({ npcManager: { getMetNPCs: () => [npc('a')] } })).not.toThrow();
        expect(warn).toHaveBeenCalled();
        expect(err).toHaveBeenCalled();
        vi.restoreAllMocks();
    });
});
