/**
 * DialogueUI Unit Tests
 * Verifies that DialogueUI uses the imported dialogueTreeSystem singleton
 * instead of falling back to the stub tree
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';
import * as DialogueTreeSystemModule from '../../src/js/game/dialogue/DialogueTreeSystem.js';

describe('DialogueUI', () => {
    let dialogueUI;
    let mockGame;
    let getTreeSpy;
    const mockTree = {
        getRootNode: () => ({ id: 'root', text: 'Hello from real system', choices: [] }),
        getNode: (id) => ({ id: 'root', text: 'Hello from real system', choices: [] })
    };

    beforeEach(() => {
        // Spy on the real dialogueTreeSystem singleton and mock its return value
        getTreeSpy = vi.spyOn(DialogueTreeSystemModule.dialogueTreeSystem, 'getTree');
        getTreeSpy.mockReturnValue(mockTree);

        // Mock game without dialogueTreeSystem properties
        // (to ensure the imported singleton is used as fallback)
        mockGame = {
            gameState: {},
        };

        dialogueUI = new DialogueUI(mockGame);
    });

    afterEach(() => {
        getTreeSpy.mockRestore();
    });

    it('should use the imported dialogueTreeSystem singleton when game does not have dialogueTreeSystem', () => {
        const mockNPC = {
            id: 'test-npc',
            name: 'Test NPC',
            personality: 'friendly'
        };

        dialogueUI.open(mockNPC, 0);

        // Verify that the real singleton's getTree method was called
        expect(getTreeSpy).toHaveBeenCalled();
        expect(getTreeSpy).toHaveBeenCalledWith('test-npc', 0);
        // Verify we got the tree from the real system, not the stub
        expect(dialogueUI.currentNode.text).toBe('Hello from real system');
    });

    it('should use game.dialogueTreeSystem as override if available', () => {
        const mockNPC = {
            id: 'test-npc',
            name: 'Test NPC',
            personality: 'friendly'
        };

        // Create a mock dialogueTreeSystem
        const mockTreeSystem = {
            getTree: vi.fn(() => ({
                getRootNode: () => ({ id: 'root', text: 'Hello from override', choices: [] }),
                getNode: (id) => ({ id: 'root', text: 'Hello from override', choices: [] })
            }))
        };

        mockGame.dialogueTreeSystem = mockTreeSystem;
        dialogueUI = new DialogueUI(mockGame);

        dialogueUI.open(mockNPC, 0);

        // Verify the mock was called instead of the real one
        expect(mockTreeSystem.getTree).toHaveBeenCalledWith('test-npc', 0);
        expect(getTreeSpy).not.toHaveBeenCalled();
        // Verify we got the override tree
        expect(dialogueUI.currentNode.text).toBe('Hello from override');
    });

    it('should use game.gameState.dialogueTreeSystem with highest priority', () => {
        const mockNPC = {
            id: 'test-npc',
            name: 'Test NPC',
            personality: 'friendly'
        };

        // Create mock tree systems
        const mockGameStateTreeSystem = {
            getTree: vi.fn(() => ({
                getRootNode: () => ({ id: 'root', text: 'From GameState', choices: [] }),
                getNode: (id) => ({ id: 'root', text: 'From GameState', choices: [] })
            }))
        };

        const mockGameTreeSystem = {
            getTree: vi.fn(() => ({
                getRootNode: () => ({ id: 'root', text: 'From Game', choices: [] }),
                getNode: (id) => ({ id: 'root', text: 'From Game', choices: [] })
            }))
        };

        mockGame.gameState.dialogueTreeSystem = mockGameStateTreeSystem;
        mockGame.dialogueTreeSystem = mockGameTreeSystem;
        dialogueUI = new DialogueUI(mockGame);

        dialogueUI.open(mockNPC, 0);

        // Verify gameState version was used
        expect(mockGameStateTreeSystem.getTree).toHaveBeenCalledWith('test-npc', 0);
        expect(mockGameTreeSystem.getTree).not.toHaveBeenCalled();
        expect(getTreeSpy).not.toHaveBeenCalled();
        expect(dialogueUI.currentNode.text).toBe('From GameState');
    });

    it('should set currentTree from the tree system', () => {
        const mockNPC = {
            id: 'test-npc',
            name: 'Test NPC',
            personality: 'friendly'
        };

        dialogueUI.open(mockNPC, 0);

        expect(dialogueUI.currentTree).toBe(mockTree);
        expect(dialogueUI.currentNode).toBeDefined();
    });

    it('should have currentNPC set after open', () => {
        const mockNPC = {
            id: 'test-npc',
            name: 'Test NPC',
            personality: 'friendly'
        };

        dialogueUI.open(mockNPC, 0);

        expect(dialogueUI.currentNPC).toBe(mockNPC);
    });


    it('uses imported singleton as fallback when game properties are not set', () => {
        const mockNPC = {
            id: 'npc-id',
            name: 'NPC Name',
            personality: 'friendly'
        };

        // Game has no dialogueTreeSystem properties, so should use imported singleton
        const gameWithoutSystem = { gameState: {} };
        const ui = new DialogueUI(gameWithoutSystem);

        ui.open(mockNPC, 5);

        // The spy should confirm the real system was called
        expect(getTreeSpy).toHaveBeenCalledWith('npc-id', 5);
        // And the tree should be from the real system
        expect(ui.currentTree).toBe(mockTree);
    });
});
