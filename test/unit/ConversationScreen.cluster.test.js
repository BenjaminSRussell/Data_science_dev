import { describe, it, expect, vi } from 'vitest';

// ConversationScreen was removed (#2316). These cases cover the live
// choice list that NPC talk still uses (NPCManager + the NPC panel).
const { renderNPCChoices } = await import('../../src/js/helpers/NPCHelpers.js');

describe('#1581 gated tree choices are visible but locked', () => {
    it('NPCManager keeps gated generated-tree choices as locked and refuses them', async () => {
        const { NPCManager } = await import('../../src/js/game/NPCManager.js');
        const nm = Object.create(NPCManager.prototype);
        const node = { choices: [{ id: 'chat', text: 'Chat' }, { id: 'deep_connect', text: 'Share something personal', conditions: { relationship: 60 } }] };
        nm.relationships = { n1: 20 };
        nm.npcStates = {};
        nm.gameState = {};
        nm.currentConversation = { npc: { id: 'n1' }, stage: 'greeting', currentNode: 'root', dialogueTree: { getNode: () => node } };
        const choices = nm.buildConversationChoices();
        expect(choices.map(c => !!c.locked)).toEqual([false, true]);
        expect(choices[1].conditions).toEqual({ relationship: 60 });
        nm.currentConversation.choices = choices;
        expect(nm.makeChoice(1)).toBeNull();
        nm.relationships.n1 = 70;
        expect(nm.buildConversationChoices().some(c => c.locked)).toBe(false);
    });

    it('the live NPC panel renders a locked choice disabled with its requirement', () => {
        document.body.innerHTML = '<div id="npc-modal"><div class="npc-modal-actions"></div></div>';
        const game = { gameState: { npcManager: { makeChoice: vi.fn() } } };
        renderNPCChoices(game, [{ text: 'Chat' }, { text: 'Share', locked: true, conditions: { relationship: 60 } }]);
        const btns = [...document.querySelectorAll('#npc-modal .npc-modal-actions button')];
        expect(btns).toHaveLength(2);
        expect(btns[1].disabled).toBe(true);
        expect(btns[1].textContent).toBe('Share (relationship 60)');
        btns[1].click();
        expect(game.gameState.npcManager.makeChoice).not.toHaveBeenCalled();
    });
});
