/**
 * Every action that moves the relationship number also moves emotional state
 * in the same direction (#1850)
 */
import { describe, it, expect } from 'vitest';
import { RelationshipEmotionSystem } from '../../src/js/game/RelationshipEmotionSystem.js';

function system(npc) {
    const rel = { [npc.id]: 40 };
    const gs = {
        characterStats: { ethics: 0 },
        npcManager: {
            getNPC: id => (id === npc.id ? npc : null),
            getRelationship: id => rel[id],
            modifyRelationship: (id, d) => { rel[id] += d; }
        }
    };
    return new RelationshipEmotionSystem(gs);
}

const sum = s => s.trust + s.affection + s.respect - s.anger - s.fear;

describe('RelationshipEmotionSystem action coverage (#1850)', () => {
    const friend = { id: 'f', type: 'friend' };
    const partner = { id: 'p', type: 'romance' };

    for (const [action, npc, context] of [
        ['help', friend, {}],
        ['support', friend, {}],
        ['gift', friend, { liked: false }],
        ['gift', friend, { liked: true }],
        ['financial_stress', partner, { debt: 6000 }]
    ]) {
        it(`${action} ${JSON.stringify(context)} moves emotions with the relationship`, () => {
            const sys = system(npc);
            const before = sum(sys.getRelationshipState(npc.id));
            const { change } = sys.updateRelationship(npc.id, action, context);
            const after = sum(sys.getRelationshipState(npc.id));
            expect(change).not.toBe(0);
            expect(Math.sign(after - before)).toBe(Math.sign(change));
        });
    }

    it('financial stress leaves non-romance NPCs and small debts alone', () => {
        const sys = system(friend);
        sys.updateEmotionalState('f', 'financial_stress', { debt: 9000, npcType: 'friend' });
        expect(sys.getRelationshipState('f')).toEqual({ trust: 50, affection: 50, respect: 50, anger: 0, fear: 0 });
        const sys2 = system(partner);
        sys2.updateEmotionalState('p', 'financial_stress', { debt: 100, npcType: 'romance' });
        expect(sys2.getRelationshipState('p').anger).toBe(0);
    });
});
