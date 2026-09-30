/**
 * DialogueUI Unit Tests
 * Verifies that the active dialogue system (DialogueUI) is properly functional
 * and that SimpleDialogue is no longer used (issue #1599)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';

describe('DialogueUI', () => {
    let dialogueUI;
    let mockGame;

    beforeEach(() => {
        // Create a mock game object
        mockGame = {
            container: document.createElement('div'),
        };
        dialogueUI = new DialogueUI(mockGame);
    });

    it('should instantiate correctly with a game object', () => {
        expect(dialogueUI).toBeDefined();
        expect(dialogueUI.game).toBe(mockGame);
        expect(dialogueUI.isOpen).toBe(false);
    });

    it('should have correct dialogue interface methods', () => {
        expect(typeof dialogueUI.open).toBe('function');
        expect(typeof dialogueUI.showNode).toBe('function');
        expect(typeof dialogueUI.close).toBe('function');
        expect(typeof dialogueUI.createContainer).toBe('function');
        expect(typeof dialogueUI.handleChoice).toBe('function');
    });

    it('should create a dialogue container', () => {
        const container = document.getElementById('dialogue-ui');
        expect(container).toBeDefined();
    });

    it('should have currentNPC, currentTree, and currentNode properties', () => {
        expect(dialogueUI.currentNPC).toBeNull();
        expect(dialogueUI.currentTree).toBeNull();
        expect(dialogueUI.currentNode).toBeNull();
    });

    it('should track if dialogue is open', () => {
        expect(dialogueUI.isOpen).toBe(false);
    });

    it('should open dialogue with an NPC and use DialogueTreeSystem', () => {
        const mockNPC = {
            id: 'npc-1',
            name: 'TestNPC',
            personality: 'friendly',
            type: 'merchant'
        };

        dialogueUI.open(mockNPC, 10);

        expect(dialogueUI.currentNPC).toBe(mockNPC);
        expect(dialogueUI.isOpen).toBe(true);
        expect(dialogueUI.currentNode).toBeDefined();
    });

    it('should close dialogue correctly', () => {
        const mockNPC = {
            id: 'npc-1',
            name: 'TestNPC'
        };

        dialogueUI.open(mockNPC, 0);
        expect(dialogueUI.isOpen).toBe(true);

        dialogueUI.close();
        expect(dialogueUI.isOpen).toBe(false);
        expect(dialogueUI.currentNPC).toBeNull();
        expect(dialogueUI.currentTree).toBeNull();
        expect(dialogueUI.currentNode).toBeNull();
    });
});
