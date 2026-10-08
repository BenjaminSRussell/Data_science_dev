import { describe, it, expect, vi } from 'vitest';
import { RomanceSystem } from '../../src/js/game/RomanceSystem.js';
import { NPCManager } from '../../src/js/game/NPCManager.js';

function setup() {
    const gs = { money: 100000, characterStats: { ethics: 50, getStat: () => 100 }, timeManager: { totalDays: 12, energy: 100, useEnergy: vi.fn(), advanceTime: vi.fn() } };
    gs.npcManager = new NPCManager(gs);
    const rs = new RomanceSystem(gs);
    gs.romanceSystem = rs;
    const npc = gs.npcManager.getAllNPCs().find(n => n.romanceOptions && (n.romanceOptions.minEthics ?? -999) <= 50 && (n.romanceOptions.maxEthics ?? 999) >= 50);
    gs.npcManager.relationships[npc.id] = 40;
    return { gs, rs, npc };
}

describe('RomanceSystem fixes', () => {
    it('asking your partner out again keeps the marriage (#1075)', () => {
        const { gs, rs, npc } = setup();
        expect(rs.askOnDate(npc.id).success).toBe(true);
        rs.relationshipScore = 100; rs.propose(); rs.getMarried();
        expect(rs.relationshipStatus).toBe('married');
        expect(rs.askOnDate(npc.id).success).toBe(false);
        expect(rs.relationshipStatus).toBe('married');
    });

    it('ethics gates of 0 still apply (#1081)', () => {
        const { gs, rs, npc } = setup();
        npc.romanceOptions = { ...npc.romanceOptions, minEthics: 0 };
        gs.characterStats.ethics = -5;
        expect(rs.askOnDate(npc.id).success).toBe(false);
    });

    it('dates raise the NPC relationship too (#1929, #1931)', () => {
        const { gs, rs, npc } = setup();
        rs.askOnDate(npc.id);
        rs.relationshipStatus = 'engaged';
        const before = gs.npcManager.getRelationship(npc.id);
        const r = rs.goOnDate('dinner');
        expect(r.success).toBe(true);
        expect(gs.npcManager.getRelationship(npc.id)).toBeGreaterThan(before);
    });

    it('anniversary is set on marriage and saved (#1079, #2189)', () => {
        const { gs, rs, npc } = setup();
        rs.askOnDate(npc.id); rs.relationshipScore = 100; rs.propose(); rs.getMarried();
        expect(rs.anniversary).toBe(12);
        const rs2 = new RomanceSystem(gs);
        rs2.fromJSON(JSON.parse(JSON.stringify(rs.toJSON())));
        expect(rs2.anniversary).toBe(12);
    });

    it('no date option without a romance system (#2128)', async () => {
        const { gs, npc } = setup();
        const withRomance = await gs.npcManager.startConversation(npc.id);
        expect(withRomance.choices.some(c => c.action === 'date_ask')).toBe(true);
        gs.romanceSystem = null;
        const convo = await gs.npcManager.startConversation(npc.id);
        expect((convo?.choices || []).some(c => c.action === 'date_ask')).toBe(false);
    });
});
