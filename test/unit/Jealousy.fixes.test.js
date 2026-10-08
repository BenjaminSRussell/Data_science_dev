import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JealousySystem } from '../../src/js/game/social/JealousySystem.js';
import { EmotionalBreakdownSystem } from '../../src/js/game/dialogue/EmotionalBreakdownSystem.js';

function makeState() {
    const rel = { rival: 40 };
    const flags = { rival: {} };
    return {
        npcManager: {
            metNPCs: ['rival'],
            getMetNPCs: () => [{ id: 'rival', name: 'Rival', personality: 'competitive' }],
            getNPC: id => ({ id, name: 'Rival' }),
            getRelationship: id => rel[id] ?? 0,
            setRelationship: (id, v) => { rel[id] = v; },
            getNPCFlags: id => flags[id]
        },
        _rel: rel, _flags: flags
    };
}

describe('JealousySystem fixes', () => {
    let gs, js;
    beforeEach(() => { gs = makeState(); js = new JealousySystem(gs); });

    it('applies the -5 penalty only when crossing 50 (#1408, #2182)', () => {
        js.increaseJealousy('rival', 55);
        expect(gs._rel.rival).toBe(35);
        js.increaseJealousy('rival', 10);
        js.increaseJealousy('rival', 10);
        expect(gs._rel.rival).toBe(35);
    });

    it('stops talking only on crossing 75, keeping one message', () => {
        js.increaseJealousy('rival', 80);
        const msg = gs._flags.rival.jealousyMessage;
        expect(gs._flags.rival.willNotTalk).toBe(true);
        js.increaseJealousy('rival', 5);
        expect(gs._flags.rival.jealousyMessage).toBe(msg);
    });

    it('refunds jealousy damage once the NPC calms down (#1859, #1858)', () => {
        js.increaseJealousy('rival', 60);
        expect(js.getRelationshipChanges('rival')).toBe(-5);
        expect(gs._rel.rival).toBe(35);
        js.reduceJealousy('rival', 20);
        expect(gs._rel.rival).toBe(40);
        expect(js.getRelationshipChanges('rival')).toBe(0);
        expect(gs._flags.rival.willNotTalk).toBe(false);
    });

    it('decayAll cools every NPC', () => {
        js.increaseJealousy('rival', 30);
        js.decayAll(10);
        expect(js.getJealousyLevel('rival')).toBe(20);
    });

    it('honours the jealousy gameplay setting (#1410)', () => {
        gs.gameplaySettings = { settings: { relationships: { enabled: true, jealousy: false } } };
        js.checkJealousy({ type: 'career', level: 60 });
        expect(js.getJealousyLevel('rival')).toBe(0);
        gs.gameplaySettings.settings.relationships.jealousy = true;
        js.checkJealousy({ type: 'career', level: 60 });
        expect(js.getJealousyLevel('rival')).toBe(60);
    });

    it('EmotionalBreakdownSystem reads real jealousy levels (#1409)', () => {
        gs.jealousySystem = js;
        const ebs = new EmotionalBreakdownSystem(gs);
        expect(ebs.checkJealousy('rival')).toBe(false);
        js.increaseJealousy('rival', 80);
        expect(ebs.checkJealousy('rival')).toBe(true);
    });
});

import { RoommateSystem } from '../../src/js/game/social/RoommateSystem.js';
describe('RoommateSystem relationship', () => {
    it('clamps to 0-100 and keeps both copies in sync (#908, #1718)', () => {
        const rs = new RoommateSystem({});
        for (let i = 0; i < 30; i++) rs.hangout();
        expect(rs.relationship).toBe(100);
        expect(rs.roommate.relationship).toBe(100);
        for (let i = 0; i < 40; i++) rs.complain();
        expect(rs.relationship).toBe(0);
        expect(rs.roommate.relationship).toBe(0);
    });

    it('hangout restores energy and help grants XP (#1717)', () => {
        const restoreEnergy = vi.fn();
        const addExperience = vi.fn();
        const rs = new RoommateSystem({ timeManager: { restoreEnergy }, characterStats: { addExperience } });
        rs.hangout();
        expect(restoreEnergy).toHaveBeenCalledWith(10);
        rs.setRelationship(50);
        expect(rs.askForHelp().help).toBe(true);
        expect(addExperience).toHaveBeenCalledWith('analytics', 10);
    });
});
