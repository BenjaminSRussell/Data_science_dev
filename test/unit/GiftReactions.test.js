/**
 * Gifts show the NPC's own hand-written reaction from its dialogue file
 * instead of one generic line for everyone (#1307)
 */
import { describe, it, expect, vi } from 'vitest';
import { NPCManager } from '../../src/js/game/NPCManager.js';
import { handleNPCGift, giftReactionLine } from '../../src/js/helpers/NPCHelpers.js';
import emma from '../../src/js/game/dialogue/npcs/emma_bloom.js';

function makeGame() {
    const gameState = { money: 1000, timeManager: { totalDays: 1 } };
    const npcManager = new NPCManager(gameState);
    gameState.npcManager = npcManager;
    return {
        gameState, npcManager,
        showToast: vi.fn(),
        uiUpdater: { updateAllUI: vi.fn() },
        screenManager: { isScreenActive: () => false }
    };
}

describe('per-NPC gift reactions (#1307)', () => {
    it('reads actions.gift_<id>, with aliases for shop ids', () => {
        expect(giftReactionLine(emma, 'books')).toBe(emma.actions.gift_books);
        expect(giftReactionLine({ actions: { gift_fine_wine: 'Vintage!' } }, 'wine')).toBe('Vintage!');
        expect(giftReactionLine({ actions: {} }, 'coffee')).toBeNull();
        expect(giftReactionLine(null, 'coffee')).toBeNull();
    });

    it("giving Emma books shows her own line in the dialogue area", async () => {
        document.body.innerHTML = '<div id="npc-dialogue-area"></div>';
        const g = makeGame();
        const line = await handleNPCGift(g, 'emma_bloom', 'books');
        expect(line).toBe(emma.actions.gift_books);
        expect(document.getElementById('npc-dialogue-area').textContent).toBe(emma.actions.gift_books);
    });

    it('falls back to the generic line when the NPC has no line for that gift', async () => {
        document.body.innerHTML = '<div id="npc-dialogue-area"></div>';
        const g = makeGame();
        const line = await handleNPCGift(g, 'emma_bloom', 'jewelry');
        expect(line).toBeNull();
        expect(document.getElementById('npc-dialogue-area').textContent).toMatch(/thanks/i);
    });
});
