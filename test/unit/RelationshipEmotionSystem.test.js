/**
 * RelationshipEmotionSystem relationship change and breakup logic
 * (#430 #1076 #111 #1551 #1549 #1847 #2054 #1849 #1547 #1548 #1553 #1552 #2053 #1077)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { RelationshipEmotionSystem } from '../../src/js/game/RelationshipEmotionSystem.js';
import { RomanceSystem } from '../../src/js/game/RomanceSystem.js';
import { RealisticDialogueSystem } from '../../src/js/game/RealisticDialogueSystem.js';

function makeNpcManager(npcs) {
    const rel = {};
    return {
        rel,
        metNPCs: Object.keys(npcs),
        getNPC: (id) => npcs[id] || null,
        getRelationship: (id) => rel[id] || 0,
        modifyRelationship: (id, amt) => { rel[id] = Math.max(0, Math.min(100, (rel[id] || 0) + amt)); return rel[id]; },
        setRelationship: (id, v) => { rel[id] = v; return v; },
        getMetNPCs() { return this.metNPCs.map(id => npcs[id]); }
    };
}

describe('RelationshipEmotionSystem', () => {
    let gs, res, npcs;
    beforeEach(() => {
        npcs = {
            sam: { id: 'sam', name: 'Sam', type: 'romance', romanceOptions: { minEthics: 10 } },
            pat: { id: 'pat', name: 'Pat', type: 'friend', personality: 'professional' },
            kai: { id: 'kai', name: 'Kai', type: 'romance', romanceOptions: {} }
        };
        gs = {
            money: 1000,
            timeManager: { totalDays: 0 },
            characterStats: { ethics: 20 },
            npcManager: makeNpcManager(npcs)
        };
        gs.romanceSystem = new RomanceSystem(gs);
        gs.realisticDialogueSystem = new RealisticDialogueSystem(gs);
        res = new RelationshipEmotionSystem(gs);
        gs.relationshipEmotionSystem = res;
    });

    describe('calculateRelationshipChange', () => {
        it('unethical choice: romance below minEthics -15, professional -10, others -5', () => {
            expect(res.calculateRelationshipChange('unethical_choice', npcs.sam, 0, 50, {})).toBe(-15);
            expect(res.calculateRelationshipChange('unethical_choice', npcs.pat, 0, 50, {})).toBe(-10);
            expect(res.calculateRelationshipChange('unethical_choice', npcs.kai, 0, 50, {})).toBe(-5);
        });
        it('neglect accelerates for romance but is capped', () => {
            expect(res.calculateRelationshipChange('neglect', npcs.sam, 0, 50, { daysSinceLastTalk: 8 })).toBe(-5);
            expect(res.calculateRelationshipChange('neglect', npcs.sam, 0, 50, { daysSinceLastTalk: 20 })).toBe(-10);
            expect(res.calculateRelationshipChange('neglect', npcs.pat, 0, 50, { daysSinceLastTalk: 20 })).toBe(-2);
        });
        it('betrayal hits harder at high relationship', () => {
            expect(res.calculateRelationshipChange('betrayal', npcs.pat, 0, 70, {})).toBe(-30);
            expect(res.calculateRelationshipChange('betrayal', npcs.pat, 0, 50, {})).toBe(-15);
        });
    });

    it('emotional state starts at defaults and stays clamped', () => {
        res.updateEmotionalState('pat', 'gift', { liked: true });
        expect(res.emotionalStates.pat).toEqual({ trust: 50, affection: 55, respect: 50, anger: 0, fear: 0 });
        for (let i = 0; i < 20; i++) res.updateEmotionalState('pat', 'betrayal');
        const s = res.emotionalStates.pat;
        expect(s.trust).toBe(0);
        expect(s.anger).toBe(100);
        Object.values(s).forEach(v => expect(v).toBeGreaterThanOrEqual(0));
    });

    it('emotions colour the change: trust boosts kindness, anger amplifies slights', () => {
        expect(res.applyEmotionalModifier(10, { trust: 50, anger: 0, fear: 0 })).toBe(10);
        expect(res.applyEmotionalModifier(10, { trust: 100, anger: 0, fear: 0 })).toBe(15);
        expect(res.applyEmotionalModifier(10, { trust: 50, anger: 0, fear: 100 })).toBe(5);
        expect(res.applyEmotionalModifier(-10, { trust: 50, anger: 100, fear: 0 })).toBe(-20);
    });

    describe('breakups', () => {
        beforeEach(() => {
            gs.npcManager.rel.sam = 50;
            gs.romanceSystem.partnerId = 'sam';
            gs.romanceSystem.relationshipStatus = 'dating';
        });

        it("the NPC's own minEthics decides an ethics breakup", () => {
            gs.characterStats.ethics = 5; // below Sam's 10, above the global -30
            const r = res.checkRelationshipEvents('sam', npcs.sam, 5);
            expect(r.happened).toBe(true);
            expect(r.reason).toBe('ethics');
            expect(gs.romanceSystem.partnerId).toBeNull();
        });

        it('neglect breakup uses the configured thresholds', () => {
            res.emotionalStates.sam = { trust: 50, affection: 19, respect: 50, anger: 0, fear: 0 };
            gs.npcManager.rel.sam = 29;
            expect(res.checkRelationshipEvents('sam', npcs.sam, 20).reason).toBe('neglect');
        });

        it('changing a threshold changes behaviour', () => {
            res.breakupThresholds.betrayalTrust = 60;
            expect(res.checkRelationshipEvents('sam', npcs.sam, 20).reason).toBe('betrayal');
        });

        it('money breakup when deep in debt and the relationship is weak', () => {
            gs.money = -6000;
            gs.npcManager.rel.sam = 39;
            expect(res.checkRelationshipEvents('sam', npcs.sam, 20).reason).toBe('money');
        });

        it('one breakup per check, only for the current partner', () => {
            gs.romanceSystem.partnerId = 'kai';
            expect(res.checkRelationshipEvents('sam', npcs.sam, -100)).toBeNull();
        });

        it('betrayal has its own breakup line', () => {
            const line = gs.realisticDialogueSystem.generateBreakupDialogue(70, 'betrayal');
            expect(line).toMatch(/trusted you/);
        });

        it('a non-antagonist breakup resets the relationship history', () => {
            gs.npcManager.rel.sam = 90;
            res.triggerBreakup('sam', 'neglect');
            expect(gs.npcManager.rel.sam).toBe(20);
            expect(res.emotionalStates.sam.affection).toBe(10);
            expect(res.relationshipHistory.sam.reason).toBe('neglect');
            expect(npcs.sam.isAntagonist).toBeUndefined();
        });

        it('very unethical players turn an ethics breakup into an antagonist', () => {
            gs.characterStats.ethics = -50;
            res.triggerBreakup('sam', 'ethics');
            expect(npcs.sam.isAntagonist).toBe(true);
            expect(res.emotionalStates.sam.anger).toBe(100);
        });

        it('divorce costs a quarter of your cash and a step of housing', () => {
            gs.romanceSystem.relationshipStatus = 'married';
            gs.romanceSystem.houseLevel = 2;
            gs.money = 8000;
            const r = res.triggerBreakup('sam', 'money');
            expect(r.previousStatus).toBe('married');
            expect(r.divorceCost).toBe(2000);
            expect(gs.money).toBe(6000);
            expect(gs.romanceSystem.houseLevel).toBe(1);
            expect(gs.romanceSystem.relationshipStatus).toBe('single');
        });
    });

    describe('processDailyUpdates', () => {
        it('starts the neglect clock on first sight instead of day zero', () => {
            gs.timeManager.totalDays = 100;
            gs.npcManager.rel.sam = 50;
            expect(res.processDailyUpdates()).toEqual([]);
            expect(gs.npcManager.rel.sam).toBe(50);
            expect(res.relationshipHistory.sam.lastInteraction).toBe(100);
        });

        it('romance neglect after 7 days, everyone after 30, talking resets', () => {
            res.processDailyUpdates(); // day 0: clocks start
            gs.npcManager.rel.sam = 50;
            gs.npcManager.rel.pat = 50;
            gs.timeManager.totalDays = 8;
            res.processDailyUpdates();
            expect(gs.npcManager.rel.sam).toBeLessThan(50);
            expect(gs.npcManager.rel.pat).toBe(50);
            gs.timeManager.totalDays = 31;
            res.recordInteraction('sam');
            const samBefore = gs.npcManager.rel.sam;
            res.processDailyUpdates();
            expect(gs.npcManager.rel.pat).toBeLessThan(50);
            expect(gs.npcManager.rel.sam).toBe(samBefore);
        });

        it('a neglected partner eventually leaves and the breakup is reported', () => {
            gs.romanceSystem.partnerId = 'kai';
            gs.romanceSystem.relationshipStatus = 'dating';
            gs.npcManager.rel.kai = 40;
            res.processDailyUpdates();
            let breakups = [];
            for (let d = 8; d < 30 && breakups.length === 0; d++) {
                gs.timeManager.totalDays = d;
                breakups = res.processDailyUpdates();
            }
            expect(breakups[0]).toMatchObject({ happened: true, reason: 'neglect' });
            expect(gs.romanceSystem.partnerId).toBeNull();
        });
    });

    it('dates record an interaction', () => {
        gs.timeManager.totalDays = 12;
        gs.romanceSystem.partnerId = 'sam';
        gs.romanceSystem.relationshipStatus = 'dating';
        gs.romanceSystem.goOnDate('coffee');
        expect(res.relationshipHistory.sam.lastInteraction).toBe(12);
    });
});
