/**
 * handleVisitNPC / interactWithNPC (#1124)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const opened = [];
vi.mock('../../src/js/ui/DialogueUI.js', () => ({
    DialogueUI: vi.fn().mockImplementation(function () {
        this.open = vi.fn((...a) => opened.push(a));
        this.setOnClose = vi.fn();
    })
}));

import { handleVisitNPC, interactWithNPC } from '../../src/js/helpers/NPCHelpers.js';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';

function makeGame(npc, relationship) {
    return {
        showToast: vi.fn(),
        gameState: {
            npcManager: { getNPC: vi.fn(() => npc), getRelationship: vi.fn(() => relationship), registerVisit: vi.fn() }
        }
    };
}

describe('handleVisitNPC', () => {
    beforeEach(() => { opened.length = 0; DialogueUI.mockClear(); });

    it('opens the dialogue with the NPC and relationship, reusing one DialogueUI', () => {
        const npc = { id: 'sam' };
        const game = makeGame(npc, 42);
        handleVisitNPC(game, 'sam');
        handleVisitNPC(game, 'sam');
        expect(DialogueUI).toHaveBeenCalledTimes(1);
        expect(opened).toEqual([[npc, 42], [npc, 42]]);
        expect(game.gameState.npcManager.registerVisit).toHaveBeenCalledWith('sam');
    });

    it('missing NPC: no dialogue, but the player is told', () => {
        const game = makeGame(undefined, 0);
        handleVisitNPC(game, 'ghost');
        expect(DialogueUI).not.toHaveBeenCalled();
        expect(game.showToast).toHaveBeenCalledWith(expect.any(String), 'warning');
    });

    it('undefined relationship falls back to 0', () => {
        const game = makeGame({ id: 'sam' }, undefined);
        handleVisitNPC(game, 'sam');
        expect(opened[0][1]).toBe(0);
    });

    it('interactWithNPC behaves exactly like handleVisitNPC', () => {
        const npc = { id: 'kim' };
        const game = makeGame(npc, 7);
        interactWithNPC(game, 'kim');
        expect(game.gameState.npcManager.getNPC).toHaveBeenCalledWith('kim');
        expect(opened).toEqual([[npc, 7]]);
    });
});
