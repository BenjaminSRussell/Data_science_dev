import { describe, it, expect, vi } from 'vitest';
import { NPCManager } from '../../src/js/game/NPCManager.js';

function makeGameState(totalDays = 1) {
    return {
        money: 0,
        reputation: 0,
        characterStats: { ethics: 0, addExperience: vi.fn(), modifyEthics(a) { this.ethics += a; } },
        timeManager: { totalDays }
    };
}

function choose(manager, text) {
    const idx = manager.currentConversation.choices.findIndex(c => c.text === text);
    expect(idx).toBeGreaterThanOrEqual(0);
    return manager.makeChoice(idx);
}

describe('NPCManager review fixes (#252)', () => {
    it('a flagged one-off payout (David Chen seed money) pays once, not every loop', async () => {
        const gs = makeGameState();
        const m = new NPCManager(gs);
        m.relationships.david_chen = 30;
        await m.startConversation('david_chen');
        for (let i = 0; i < 3; i++) {
            choose(m, 'Mr. Chen? I have a proposal.');
            choose(m, 'Data-driven AI for Healthcare.');
        }
        expect(gs.money).toBe(5000);
        expect(m.getNPCFlags('david_chen').seed_interest).toBe(true);
    });

    it('an unflagged paying choice pays once per in-game day', async () => {
        const gs = makeGameState(3);
        const m = new NPCManager(gs);
        await m.startConversation('mike_johnson');
        choose(m, "I'm looking for corporate clients.");
        choose(m, "I'll take it.");
        choose(m, "I'm looking for corporate clients.");
        const repeat = choose(m, "I'll take it.");
        expect(gs.money).toBe(300);
        expect(repeat.effects.money).toBeUndefined();
        // Costs still apply on a repeat
        expect(repeat.effects.energy).toBe(-20);

        gs.timeManager.totalDays = 4;
        choose(m, "I'm looking for corporate clients.");
        choose(m, "I'll take it.");
        expect(gs.money).toBe(600);
    });

    it('looping a free positive choice cannot farm the relationship within a day', async () => {
        const gs = makeGameState();
        const m = new NPCManager(gs);
        await m.startConversation('david_chen');
        const start = m.getRelationship('david_chen');
        for (let i = 0; i < 10; i++) {
            choose(m, '*Nod silently*');
            choose(m, '...');
        }
        // One payout each for the two choices, not ten (personality-scaled)
        expect(m.getRelationship('david_chen') - start).toBeLessThanOrEqual(3);
    });

    it('the payout ledger is saved with the NPC state', async () => {
        const gs = makeGameState();
        const m = new NPCManager(gs);
        await m.startConversation('mike_johnson');
        choose(m, "I'm looking for corporate clients.");
        choose(m, "I'll take it.");
        const restored = new NPCManager(makeGameState());
        restored.fromJSON(JSON.parse(JSON.stringify(m.toJSON())));
        expect(Object.values(restored.getNPCState('mike_johnson').payouts)).toContain(1);
    });

    it('fromJSON coerces relationship scores to clamped numbers', () => {
        const m = new NPCManager(makeGameState());
        m.fromJSON({ relationships: { sarah_martinez: '50', mike_johnson: 'junk', lisa_wong: 250 } });
        expect(m.getRelationship('sarah_martinez')).toBe(50);
        expect(m.getRelationship('mike_johnson')).toBe(0);
        expect(m.getRelationship('lisa_wong')).toBe(100);
        m.setRelationship('sarah_martinez', 50);
        m.modifyRelationship('sarah_martinez', 10);
        expect(typeof m.getRelationship('sarah_martinez')).toBe('number');
        expect(m.getRelationship('sarah_martinez')).toBeLessThanOrEqual(100);
    });

    it('meeting someone through a gift goes through registerVisit (first-NPC beat fires)', () => {
        const gs = makeGameState();
        gs.money = 1000;
        const handleStoryBeat = vi.fn();
        const recordInteraction = vi.fn();
        gs.relationshipEmotionSystem = { recordInteraction };
        const m = new NPCManager(gs);
        gs.mainGame = { storyBeatsSystem: { getBeat: (id) => ({ id }) }, handleStoryBeat };
        const npc = m.getAllNPCs().find(n => Array.isArray(n.gifts) && n.gifts.length);
        const result = m.giveGift(npc.id, npc.gifts[0]);
        expect(result.success).toBe(true);
        expect(m.metNPCs).toContain(npc.id);
        expect(handleStoryBeat).toHaveBeenCalledWith({ id: 'meet_first_npc' });
        expect(recordInteraction).toHaveBeenCalledTimes(1);
    });
});
