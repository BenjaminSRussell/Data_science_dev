import { describe, it, expect, vi } from 'vitest';
import { NPCManager, GIFT_COSTS } from '../../src/js/game/NPCManager.js';
import { handleVisitNPC, handleNPCGift, updateRelationshipsScreen } from '../../src/js/helpers/NPCHelpers.js';
import { createNPCTalkButtons } from '../../src/js/helpers/MapHelpers.js';

function makeGame() {
    const gameState = { money: 1000, timeManager: { totalDays: 1 } };
    const npcManager = new NPCManager(gameState);
    gameState.npcManager = npcManager;
    return {
        gameState, npcManager,
        showToast: vi.fn(),
        dialogueUI: { open: vi.fn(), setOnClose: vi.fn() },
        uiUpdater: { updateAllUI: vi.fn() },
        screenManager: { isScreenActive: () => false },
        handleVisitNPC: vi.fn()
    };
}

describe('NPC visiting and gifts', () => {
    it('visiting marks the NPC as met (#1465)', () => {
        const g = makeGame();
        const id = g.npcManager.getAllNPCs()[0].id;
        handleVisitNPC(g, id);
        expect(g.npcManager.metNPCs).toContain(id);
        expect(g.dialogueUI.open).toHaveBeenCalled();
    });

    it('unknown NPC gives feedback instead of silently returning (#1119)', () => {
        const g = makeGame();
        handleVisitNPC(g, 'nobody_here');
        expect(g.showToast).toHaveBeenCalled();
    });

    it('gift uses the chosen item (#1118)', () => {
        const g = makeGame();
        const npc = g.npcManager.getAllNPCs().find(n => Array.isArray(n.gifts) && n.gifts.length);
        const spy = vi.spyOn(g.npcManager, 'giveGift');
        handleNPCGift(g, npc.id, 'flowers');
        expect(spy).toHaveBeenCalledWith(npc.id, 'flowers');
        expect(g.gameState.money).toBe(1000 - GIFT_COSTS.flowers);
    });

    it('relationships cards have a gift picker wired to giveGift (#1304)', () => {
        document.body.innerHTML = '<div id="npc-grid"></div>';
        const g = makeGame();
        const npc = g.npcManager.getAllNPCs().find(n => Array.isArray(n.gifts) && n.gifts.length);
        g.npcManager.markNPCAsMet(npc.id);
        updateRelationshipsScreen(g);
        const btn = document.querySelector('.npc-gift-btn');
        expect(btn).toBeTruthy();
        document.querySelector('.npc-gift-select').value = 'books';
        btn.click();
        expect(g.gameState.money).toBe(1000 - GIFT_COSTS.books);
        expect(g.handleVisitNPC).not.toHaveBeenCalled();
    });

    it('locations offer Talk-to buttons for NPCs there (#1467)', () => {
        const g = makeGame();
        const btns = createNPCTalkButtons(g, 'coffee_shop');
        expect(btns.length).toBeGreaterThan(0);
        btns[0].click();
        expect(g.handleVisitNPC).toHaveBeenCalledWith(btns[0].dataset.npc);
    });
});
