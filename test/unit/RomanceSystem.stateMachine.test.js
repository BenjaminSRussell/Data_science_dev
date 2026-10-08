/**
 * RomanceSystem dating -> engaged -> married state machine (#431)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { RomanceSystem } from '../../src/js/game/RomanceSystem.js';

describe('RomanceSystem state machine', () => {
    let gs, rs, npcs, rel;
    beforeEach(() => {
        rel = { ana: 40, ben: 40, cal: 40, dee: 10 };
        npcs = {
            ana: { id: 'ana', name: 'Ana', romanceOptions: {} },
            ben: { id: 'ben', name: 'Ben', romanceOptions: { minEthics: 10 } },
            cal: { id: 'cal', name: 'Cal', romanceOptions: { maxEthics: -10 } },
            dee: { id: 'dee', name: 'Dee', romanceOptions: {} },
            eve: { id: 'eve', name: 'Eve' }
        };
        gs = {
            money: 100000,
            characterStats: { ethics: 0, getStat: () => 50 },
            npcManager: { getNPC: (id) => npcs[id], getRelationship: (id) => rel[id] || 0, modifyRelationship: (id, a) => { rel[id] += a; } },
            timeManager: { totalDays: 5, energy: 100, useEnergy() {}, advanceTime() {} }
        };
        rs = new RomanceSystem(gs);
    });

    it('askOnDate rejections and success', () => {
        expect(rs.askOnDate('eve').success).toBe(false); // no romanceOptions
        expect(rs.askOnDate('dee').success).toBe(false); // relationship < 30
        expect(rs.askOnDate('ben').message).toMatch(/criminals/); // ethics < minEthics
        expect(rs.askOnDate('cal').message).toMatch(/goody/); // ethics > maxEthics
        const ok = rs.askOnDate('ana');
        expect(ok.success).toBe(true);
        expect(rs).toMatchObject({ partnerId: 'ana', relationshipStatus: 'dating', relationshipScore: 50 });
        expect(rs.askOnDate('dee').message).toMatch(/Cheater/);
        expect(rs.relationshipScore).toBe(25);
    });

    it('goOnDate costs and failures', () => {
        expect(rs.goOnDate('coffee').message).toBe('You are single.');
        rs.askOnDate('ana');
        expect(rs.goOnDate('picnic').success).toBe(false);
        gs.money = 10;
        expect(rs.goOnDate('coffee').message).toMatch(/afford/);
        gs.money = 10000;
        const r = rs.goOnDate('fancy_dinner');
        expect(r.success).toBe(true);
        expect(gs.money).toBe(9500);
        expect(rs.relationshipScore).toBe(175);
    });

    it('modifyHappiness clamps to [0, 500]', () => {
        rs.modifyHappiness(-10);
        expect(rs.relationshipScore).toBe(0);
        rs.modifyHappiness(9999);
        expect(rs.relationshipScore).toBe(500);
    });

    it('propose and getMarried', () => {
        expect(rs.propose().success).toBe(false);
        rs.askOnDate('ana');
        expect(rs.propose().success).toBe(false); // score 50 < 80
        expect(rs.relationshipScore).toBe(30);
        rs.relationshipScore = 100;
        gs.money = 4999;
        expect(rs.propose().message).toMatch(/ring/);
        gs.money = 30000;
        expect(rs.propose().success).toBe(true);
        expect(rs.relationshipStatus).toBe('engaged');
        expect(gs.money).toBe(25000);
        gs.money = 19999;
        expect(rs.getMarried().success).toBe(false);
        gs.money = 20000;
        expect(rs.getMarried().success).toBe(true);
        expect(rs.relationshipStatus).toBe('married');
        expect(rs.anniversary).toBe(5);
        expect(gs.money).toBe(0);
    });

    it('breakUp ends things and is free unless married', () => {
        expect(rs.breakUp().partnerId).toBeNull();
        rs.askOnDate('ana');
        const r = rs.breakUp('mutual');
        expect(r).toEqual({ previousStatus: 'dating', divorceCost: 0, partnerId: 'ana' });
        expect(rs.relationshipStatus).toBe('single');
        expect(gs.money).toBe(100000);
    });

    it('toJSON/fromJSON round-trip with defaults', () => {
        rs.askOnDate('ana');
        rs.children = ['kid'];
        rs.houseLevel = 2;
        const restored = new RomanceSystem(gs);
        restored.fromJSON(JSON.parse(JSON.stringify(rs.toJSON())));
        expect(restored.toJSON()).toEqual(rs.toJSON());
        const empty = new RomanceSystem(gs);
        empty.fromJSON({ partnerId: 'ana' });
        expect(empty.relationshipStatus).toBe('dating');
        expect(empty.children).toEqual([]);
        expect(empty.houseLevel).toBe(0);
        expect(() => empty.fromJSON(null)).not.toThrow();
    });
});
