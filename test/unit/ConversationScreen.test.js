import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationScreen } from '../../src/js/game/dialogue/ConversationScreen.js';
import { GameState } from '../../src/js/game/GameState.js';
import { NPCManager, NPCs } from '../../src/js/game/NPCManager.js';

describe('ConversationScreen avatar', () => {
    let game;
    let npc;

    beforeEach(() => {
        document.body.innerHTML = '';
        const gameState = new GameState();
        game = { gameState, npcManager: new NPCManager(gameState) };
        npc = NPCs.find((candidate) => candidate.modelPath);
    });

    it('has an NPC with a 3D model path to test against', () => {
        expect(npc).toBeDefined();
    });

    it('shows the 2D portrait when the game has no 3D renderer', async () => {
        const screen = new ConversationScreen(game);
        screen.showConversation(npc.id);
        await screen.startConversation();

        const portrait = document.querySelector('#npc-avatar-container img');
        expect(portrait).not.toBeNull();
        expect(portrait.getAttribute('alt')).toBe(npc.name);
    });

    it('hands the model to the game\'s 3D renderer when there is one', async () => {
        const requested = [];
        game.threeRenderer = {
            create3DCharacter(id, options) {
                requested.push({ id, path: options.path });
                return document.createElement('div');
            },
            dispose() {}
        };
        const screen = new ConversationScreen(game);
        screen.showConversation(npc.id);
        await screen.startConversation();

        expect(requested).toContainEqual({ id: npc.id, path: npc.modelPath });
        expect(document.querySelector('#npc-avatar-container img')).toBeNull();
    });

    it('closes without a 3D renderer', async () => {
        const screen = new ConversationScreen(game);
        screen.showConversation(npc.id);
        await screen.startConversation();

        expect(() => screen.close()).not.toThrow();
        expect(screen.currentNPC).toBeNull();
    });
});
