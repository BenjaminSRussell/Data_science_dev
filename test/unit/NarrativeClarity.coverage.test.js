import { describe, it, expect } from 'vitest';
import { NarrativeClaritySystem } from '../../src/js/game/NarrativeClaritySystem.js';

const make = (gs) => new NarrativeClaritySystem({ money: 0, reputation: 0, rankIndex: 0, ...gs });

describe('NarrativeClaritySystem derivations (#428)', () => {
    it('chapter boundaries follow totalDays', () => {
        const ch = (d) => make({ timeManager: { totalDays: d } }).getNarrativeContext().chapter;
        expect(ch(6)).toMatch(/^Chapter 1/);
        expect(ch(7)).toMatch(/^Chapter 2/);
        expect(ch(29)).toMatch(/^Chapter 2/);
        expect(ch(30)).toMatch(/^Chapter 3/);
        expect(ch(89)).toMatch(/^Chapter 3/);
        expect(ch(90)).toMatch(/^Chapter 4/);
        expect(ch(179)).toMatch(/^Chapter 4/);
        expect(ch(180)).toMatch(/^Chapter 5/);
    });

    it('themes come from the real CharacterStats ethics value', () => {
        const t = (ethics, extra = {}) => make({ characterStats: { ethics, stats: {}, getStat: () => 0 }, ...extra }).getNarrativeContext().themes;
        expect(t(-31)).toEqual(expect.arrayContaining(['corruption', 'power']));
        expect(t(31)).toEqual(expect.arrayContaining(['integrity', 'justice']));
        expect(t(0)).toEqual(expect.arrayContaining(['balance']));
        expect(t(0, { reputation: 1001 })).toContain('influence');
        expect(t(0, { rankIndex: 5 })).toContain('leadership');
        expect(t(0, { reputation: 1000, rankIndex: 4 })).not.toEqual(expect.arrayContaining(['influence']));
    });

    it('motivation text switches at relationship 30 and 70', () => {
        const at = (rel) => {
            const n = make({ npcManager: { getNPC: () => ({ id: 'alex_rivera' }), getRelationship: () => rel } });
            return n.getCharacterMotivation('alex_rivera');
        };
        expect(at(29)).not.toBe(at(30));
        expect(at(69)).toBe(at(30));
        expect(at(70)).not.toBe(at(69));
        const none = make({ npcManager: { getNPC: () => null, getRelationship: () => 0 } });
        expect(none.getCharacterMotivation('alex_rivera')).toBeNull();
    });

    it('consequence explanations keep the sign of every delta', () => {
        const n = make({});
        const out = n.getConsequenceExplanation({
            choices: {
                take: { consequences: { ethics: -10, money: 5000, reputation: 20, risk: 'high' }, message: 'm' },
                refuse: { consequences: { ethics: 5, money: -500, reputation: -3 } }
            }
        });
        expect(out[0]).toEqual({ choice: 'take', explanation: 'take: Ethics -10. Money +$5000. Reputation +20. Risk: high.', message: 'm' });
        expect(out[1].explanation).toBe('refuse: Ethics +5. Money -$500. Reputation -3.');
        expect(n.getConsequenceExplanation({})).toEqual([]);
    });

    it('economy state thresholds', () => {
        const e = (money) => make({ money }).getEconomyState();
        expect(e(-1)).toBe('Struggling financially');
        expect(e(0)).toBe('Making ends meet');
        expect(e(999)).toBe('Making ends meet');
        expect(e(1000)).toBe('Comfortable');
        expect(e(10000)).toBe('Wealthy');
        expect(e(100000)).toBe('Extremely wealthy');
    });

    it('social state counts NPCs above 70', () => {
        const s = (rels) => make({
            npcManager: { getMetNPCs: () => rels.map((_, i) => ({ id: `n${i}` })), getRelationship: (id) => rels[Number(id.slice(1))] }
        }).getSocialState();
        expect(make({}).getSocialState()).toBe('No connections yet');
        expect(s([70, 10])).toBe('Building connections');
        expect(s([71])).toBe('A few close friends');
        expect(s([80, 90])).toBe('A few close friends');
        expect(s([80, 90, 75])).toBe('Well-connected');
    });
});
