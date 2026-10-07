import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NPCManager, NPCs, PERSONALITY_TRAITS, getPersonalityTrait, DIALOGUE_TREES } from '../../src/js/game/NPCManager.js';
import { JealousySystem } from '../../src/js/game/social/JealousySystem.js';
import { RomanceSystem } from '../../src/js/game/RomanceSystem.js';

function makeGameState(overrides = {}) {
    const stats = { intelligence: 0, charisma: 0 };
    return {
        money: 1000,
        reputation: 0,
        timeManager: { totalDays: 1, energy: 100, useEnergy: vi.fn(function (a) { if (this.energy < a) return { success: false }; this.energy -= a; return { success: true }; }), restoreEnergy: vi.fn() },
        characterStats: {
            ethics: 0,
            getStat: vi.fn(id => stats[id] ?? 0),
            addExperience: vi.fn(),
            modifyEthics: vi.fn(),
            _stats: stats
        },
        ...overrides
    };
}

const idWithPersonality = p => NPCs.find(n => n.personality === p)?.id;

describe('NPCManager relationships', () => {
    let gs;
    let mgr;
    beforeEach(() => {
        gs = makeGameState();
        mgr = new NPCManager(gs);
    });

    it('every roster personality has traits (no crash for aggressive/greedy/high_maintenance)', () => {
        NPCs.forEach(npc => {
            expect(PERSONALITY_TRAITS[npc.personality], npc.id).toBeDefined();
            expect(() => mgr.modifyRelationship(npc.id, 5)).not.toThrow();
        });
    });

    it('unknown personalities fall back to a neutral trait', () => {
        expect(getPersonalityTrait('made_up').relationshipGain).toBe(1);
        const npc = NPCs[0];
        const original = npc.personality;
        npc.personality = 'hostile_unknown';
        try {
            expect(() => mgr.modifyRelationship(npc.id, 5)).not.toThrow();
        } finally {
            npc.personality = original;
        }
    });

    it('small gains accumulate instead of being floored to zero (competitive)', () => {
        const id = idWithPersonality('competitive');
        for (let i = 0; i < 8; i++) mgr.modifyRelationship(id, 0.25); // 8 * 0.25 * 0.8 = 1.6
        expect(mgr.getRelationship(id)).toBe(1);
    });

    it('losses are not amplified by a >1 multiplier', () => {
        const id = idWithPersonality('generous'); // 1.1
        mgr.relationships[id] = 50;
        mgr.modifyRelationship(id, -1); // -1.1 -> -1 applied, -0.1 carried
        expect(mgr.getRelationship(id)).toBe(49);
    });

    it('setRelationship sets an absolute clamped value', () => {
        const id = NPCs[0].id;
        expect(mgr.setRelationship(id, 140)).toBe(100);
        expect(mgr.setRelationship(id, -3)).toBe(0);
    });

    it('carry and gift cooldowns survive save/load', () => {
        const id = idWithPersonality('competitive');
        mgr.modifyRelationship(id, 0.5);
        const restored = new NPCManager(makeGameState());
        restored.fromJSON(JSON.parse(JSON.stringify(mgr.toJSON())));
        expect(restored.relationshipCarry[id]).toBeCloseTo(0.4);
    });
});

describe('NPCManager gifts', () => {
    let gs;
    let mgr;
    beforeEach(() => {
        gs = makeGameState();
        mgr = new NPCManager(gs);
    });

    it('rivals with no gift list refuse gifts', () => {
        const rival = NPCs.find(n => Array.isArray(n.gifts) && n.gifts.length === 0);
        const result = mgr.giveGift(rival.id, 'coffee');
        expect(result).toMatchObject({ success: false, reason: 'refuses gifts' });
        expect(mgr.getRelationship(rival.id)).toBe(0);
    });

    it('costs money, reports the gain actually applied, and has a daily cooldown', () => {
        const npc = NPCs.find(n => n.id === 'professor_higgins');
        mgr.relationships[npc.id] = 70; // > 60: diminishing returns
        const result = mgr.giveGift(npc.id, 'books');
        expect(result.success).toBe(true);
        expect(gs.money).toBe(1000 - result.cost);
        expect(result.relationshipGain).toBe(mgr.getRelationship(npc.id) - 70);
        expect(result.relationshipGain).toBeLessThan(15);

        expect(mgr.giveGift(npc.id, 'books')).toMatchObject({ success: false, reason: 'cooldown' });
        gs.timeManager.totalDays = 2;
        expect(mgr.giveGift(npc.id, 'books').success).toBe(true);
    });

    it('rejects gifts the player cannot afford', () => {
        gs.money = 0;
        expect(mgr.giveGift('professor_higgins', 'books')).toMatchObject({ success: false, reason: 'insufficient funds' });
    });
});

describe('NPCManager unlock requirements', () => {
    it('enforces ethics (min and max), money and netWorth', () => {
        const gs = makeGameState();
        const mgr = new NPCManager(gs);
        const emma = NPCs.find(n => n.id === 'emma_bloom'); // ethics >= 20
        const vinnie = NPCs.find(n => n.id === 'vinnie_shark'); // ethics <= -10
        gs.characterStats.ethics = 0;
        expect(mgr.isNPCUnlocked(emma)).toBe(false);
        expect(mgr.isNPCUnlocked(vinnie)).toBe(false);
        gs.characterStats.ethics = 25;
        expect(mgr.isNPCUnlocked(emma)).toBe(true);
        gs.characterStats.ethics = -15;
        expect(mgr.isNPCUnlocked(vinnie)).toBe(true);

        const rich = NPCs.find(n => n.unlockRequirement && n.unlockRequirement.netWorth && Object.keys(n.unlockRequirement).length === 1);
        gs.money = 1000;
        expect(mgr.isNPCUnlocked(rich)).toBe(false);
        gs.money = 200000;
        expect(mgr.isNPCUnlocked(rich)).toBe(true);
    });

    it('getNPCsAtLocation only returns unlocked NPCs', () => {
        const gs = makeGameState();
        const mgr = new NPCManager(gs);
        gs.characterStats.ethics = 0;
        expect(mgr.getNPCsAtLocation('library').map(n => n.id)).not.toContain('emma_bloom');
    });

    it('no NPC portrait points at the unserved /downloaded_assets/ tree', () => {
        NPCs.forEach(n => expect(n.image || '', n.id).not.toMatch(/^\/downloaded_assets\//));
    });
});

describe('NPCManager conversations', () => {
    let gs;
    let mgr;
    beforeEach(() => {
        gs = makeGameState();
        mgr = new NPCManager(gs);
    });

    it('makeChoice resolves the same list startConversation rendered and advances the tree', async () => {
        const conv = await mgr.startConversation('emma_bloom');
        const rootTexts = DIALOGUE_TREES.emma_bloom.root.choices.filter(c => !c.requiredRelationship).map(c => c.text);
        expect(conv.choices.map(c => c.text)).toEqual(rootTexts);

        const result = mgr.makeChoice(0); // "What are you reading?" -> reading_topic
        expect(result.isTreeAction).toBe(true);
        expect(result.text).toBe(DIALOGUE_TREES.emma_bloom.reading_topic.text); // NPC reply, not the player's line
        expect(result.playerText).toBe(rootTexts[0]);
        expect(result.choices.map(c => c.text)).toEqual(DIALOGUE_TREES.emma_bloom.reading_topic.choices.map(c => c.text));
    });

    it('maps dialogue skill names onto real stats and spends energy', async () => {
        await mgr.startConversation('emma_bloom');
        mgr.makeChoice(0); // reading_topic
        const res = mgr.makeChoice(0); // "I love algorithms!" xp
        expect(gs.characterStats.addExperience).toHaveBeenCalledWith('analytics', 20);
        expect(res.effects.xp).toBe('analytics');
    });

    it('generic conversations advance through stages and end', async () => {
        const npc = NPCs.find(n => !DIALOGUE_TREES[n.id]);
        const conv = await mgr.startConversation(npc.id);
        expect(conv.choices.length).toBeGreaterThan(0);
        let res;
        let guard = 0;
        do {
            res = mgr.makeChoice(0);
            guard++;
        } while (res && !res.ended && guard < 20);
        expect(res.ended).toBe(true);
        expect(mgr.makeChoice(0)).toBeNull();
    });

    it('partner gets a date menu with all four date types, and date_* works without crashing when romance is missing', async () => {
        gs.romanceSystem = new RomanceSystem(gs);
        gs.npcManager = mgr;
        gs.romanceSystem.partnerId = 'emma_bloom';
        gs.romanceSystem.relationshipStatus = 'dating';
        const conv = await mgr.startConversation('emma_bloom');
        const actions = conv.choices.map(c => c.action);
        expect(actions).toEqual(expect.arrayContaining(['date_coffee', 'date_dinner', 'date_fancy_dinner', 'date_vacation', 'date_propose']));

        const idx = actions.indexOf('date_coffee');
        const res = mgr.makeChoice(idx);
        expect(res.isSpecialAction).toBe(true);
        expect(res.success).toBe(true);
        expect(gs.money).toBe(1000 - 20);

        delete gs.romanceSystem;
        mgr.currentConversation.choices = [{ text: 'x', action: 'date_ask' }];
        expect(() => mgr.makeChoice(0)).not.toThrow();
    });

    it('a jealous NPC refuses to talk, using per-save flags rather than the shared roster', async () => {
        const jealousy = new JealousySystem({ ...gs, npcManager: mgr });
        jealousy.stopTalking('emma_bloom');
        expect(NPCs.find(n => n.id === 'emma_bloom').willNotTalk).toBeUndefined();
        const conv = await mgr.startConversation('emma_bloom');
        expect(conv.refused).toBe(true);
        expect(conv.choices).toEqual([]);
        jealousy.jealousyLevels.set('emma_bloom', 10);
        jealousy.reduceJealousy('emma_bloom', 1);
        expect(mgr.getNPCFlags('emma_bloom').willNotTalk).toBe(false);
    });
});

describe('JealousySystem.shouldBeJealous', () => {
    it('ignores NPCs the player has not met and irrelevant successes', () => {
        const gs = makeGameState();
        const mgr = new NPCManager(gs);
        const js = new JealousySystem({ ...gs, npcManager: mgr });
        const rival = NPCs.find(n => n.personality === 'competitive');
        expect(js.shouldBeJealous(rival, { type: 'career' })).toBe(false);
        mgr.markNPCAsMet(rival.id);
        expect(js.shouldBeJealous(rival, { type: 'career' })).toBe(true);
        expect(js.shouldBeJealous(rival, { type: 'social' })).toBe(false);
    });

    it('affectRelationship no longer throws (setRelationship exists)', () => {
        const gs = makeGameState();
        const mgr = new NPCManager(gs);
        const js = new JealousySystem({ ...gs, npcManager: mgr });
        mgr.relationships.emma_bloom = 20;
        expect(() => js.affectRelationship('emma_bloom', -5)).not.toThrow();
        expect(mgr.getRelationship('emma_bloom')).toBe(15);
    });
});

describe('RomanceSystem', () => {
    it('enforces minIntelligence / minCharisma and charges energy and time for dates', () => {
        const gs = makeGameState();
        const mgr = new NPCManager(gs);
        gs.npcManager = gs.npcManager || mgr;
        const romance = new RomanceSystem(gs);
        mgr.relationships.maya_engineer = 40;
        expect(romance.askOnDate('maya_engineer').success).toBe(false);
        gs.characterStats._stats.intelligence = 25;
        expect(romance.askOnDate('maya_engineer').success).toBe(true);

        gs.mainGame = { handleTimeAdvance: vi.fn() };
        const res = romance.goOnDate('dinner');
        expect(res.success).toBe(true);
        expect(gs.timeManager.useEnergy).toHaveBeenCalledWith(15);
        expect(gs.mainGame.handleTimeAdvance).toHaveBeenCalled();

        gs.timeManager.energy = 0;
        expect(romance.goOnDate('coffee').success).toBe(false);
    });
});
