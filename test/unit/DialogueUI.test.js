import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';
import { STATS } from '../../src/js/game/CharacterStats.js';
import { RealisticDialogueSystem } from '../../src/js/game/RealisticDialogueSystem.js';

/**
 * Build a minimal game mock sufficient to drive DialogueUI.open() into a
 * known currentNode via the DOM fallback path (customElements.get('dialogue-component')
 * is false in jsdom unless the Lit component is imported).
 */
function makeGameMock() {
  const rootNode = {
    id: 'root',
    text: 'Root text',
    choices: [{ id: 'close', text: 'Goodbye' }]
  };
  const tree = {
    getRootNode: vi.fn(() => rootNode),
    getNode: vi.fn((id) => (id === 'root' ? rootNode : null))
  };
  const game = {
    gameState: {
      npcManager: {
        getRelationship: vi.fn(() => 0),
        setRelationship: vi.fn()
      },
      characterStats: {
        stats: {},
        getStat: vi.fn((id) => 0)
      },
      dialogueTreeSystem: {
        getTree: vi.fn(() => tree)
      }
    }
  };
  return { game, tree, rootNode };
}

describe('DialogueUI', () => {
  let ui;
  let game;
  let tree;
  let rootNode;
  let npc;

  beforeEach(() => {
    document.body.innerHTML = '';
    const mock = makeGameMock();
    game = mock.game;
    tree = mock.tree;
    rootNode = mock.rootNode;
    npc = { id: 'npc-1', name: 'Alice', title: 'Analyst' };
    ui = new DialogueUI(game);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('applyEffects', () => {
    it('applies relationship delta on top of current relationship', () => {
      game.gameState.npcManager.getRelationship.mockReturnValue(40);
      ui.currentNPC = npc;

      ui.applyEffects({ relationship: 10 });

      expect(game.gameState.npcManager.setRelationship).toHaveBeenCalledWith('npc-1', 50);
    });

    it('caps statBoost at STATS maxLevel', () => {
      const maxLevel = STATS.intelligence.maxLevel; // 100
      game.gameState.characterStats.getStat.mockReturnValue(maxLevel);
      game.gameState.characterStats.stats = { intelligence: maxLevel };

      ui.applyEffects({ statBoost: 'intelligence' });

      expect(game.gameState.characterStats.stats.intelligence).toBe(maxLevel);
      expect(game.gameState.characterStats.stats.intelligence).toBeLessThanOrEqual(100);
    });

    it('does not mutate or throw when effects has no relevant keys', () => {
      const setRelationship = game.gameState.npcManager.setRelationship;
      const stats = game.gameState.characterStats.stats;

      expect(() => ui.applyEffects({})).not.toThrow();
      expect(setRelationship).not.toHaveBeenCalled();
      expect(stats).toEqual({});
    });
  });

  describe('handleChoice', () => {
    it('close/goodbye closes and resets state', () => {
      ui.open(npc);
      expect(ui.isOpen).toBe(true);

      ui.handleChoice('close');
      expect(ui.isOpen).toBeFalsy();
      expect(ui.currentNPC).toBeFalsy();
      expect(ui.currentTree).toBeFalsy();
      expect(ui.currentNode).toBeFalsy();

      ui.open(npc);
      ui.handleChoice('goodbye');
      expect(ui.isOpen).toBeFalsy();
      expect(ui.currentNPC).toBeFalsy();
    });

    it('continue with nextNode set shows that node', () => {
      const nextNode = { id: 'next', text: 'Next text', choices: [] };
      tree.getNode.mockImplementation((id) => (id === 'next' ? nextNode : rootNode));
      rootNode.nextNode = 'next';

      ui.open(npc);
      ui.handleChoice('continue');

      expect(ui.currentNode).toBe(nextNode);
      expect(ui.isOpen).toBe(true);
    });

    it('continue without nextNode falls through to close', () => {
      ui.open(npc);
      ui.handleChoice('continue');

      expect(ui.isOpen).toBeFalsy();
      expect(ui.currentNode).toBeFalsy();
    });

    it('unknown choice id silently returns with no state change', () => {
      ui.open(npc);
      const before = {
        isOpen: ui.isOpen,
        currentNPC: ui.currentNPC,
        currentNode: ui.currentNode
      };

      ui.handleChoice('does-not-exist');

      expect(ui.isOpen).toBe(before.isOpen);
      expect(ui.currentNPC).toBe(before.currentNPC);
      expect(ui.currentNode).toBe(before.currentNode);
    });

    it('speaks a RealisticDialogueSystem greeting without rewriting the tree node (#2272)', () => {
      vi.useFakeTimers();
      const random = vi.spyOn(Math, 'random').mockReturnValue(0);
      game.gameState.realisticDialogueSystem = new RealisticDialogueSystem();
      ui.open(npc);
      vi.runAllTimers();

      const heard = document.querySelector('#dialogue-text').textContent;
      const expected = game.gameState.realisticDialogueSystem.generateRelationshipDialogue(
        { ...npc, personality: 'friendly' }, 0, 'casual'
      );
      expect(ui.currentNode.text).toBe('Root text');
      expect(heard).toBe(expected);
      expect(heard).not.toBe('Root text');
      random.mockRestore();
    });

    it('a synthesized compliment is an emotional response (#2272)', () => {
      vi.useFakeTimers();
      game.gameState.realisticDialogueSystem = new RealisticDialogueSystem();
      game.gameState.npcManager.getRelationship.mockReturnValue(80);
      ui.open(npc);
      ui.showNode({
        id: 'compliment',
        synthesized: true,
        text: 'static library line',
        choices: [{ id: 'close', text: 'Goodbye' }]
      });
      vi.runAllTimers();

      expect(ui.currentNode.text).toBe('static library line');
      expect(document.querySelector('#dialogue-text').textContent)
        .toBe('Thank you so much. I really needed that.');
    });

    it('goodbye speaks generateDialogue and still closes (#2272)', () => {
      const random = vi.spyOn(Math, 'random').mockReturnValue(0);
      const sys = new RealisticDialogueSystem();
      game.gameState.realisticDialogueSystem = sys;
      game.showToast = vi.fn();
      ui.open(npc);
      ui.handleChoice('goodbye');

      const line = sys.generateDialogue({
        speaker: 'Alice',
        emotion: 'neutral',
        relationship: 0,
        situation: 'goodbye',
        personality: 'friendly'
      });
      expect(ui.isOpen).toBeFalsy();
      expect(game.showToast).toHaveBeenCalledWith(`Alice: "${line}"`, 'info');
      random.mockRestore();
    });

    it('schedules a 1000ms callback to show the root node when nextNode lookup fails', () => {
      vi.useFakeTimers();
      tree.getNode.mockImplementation((id) => (id === 'root' ? rootNode : null));
      ui.open(npc);

      ui.handleChoice('some-choice');

      expect(ui.currentNode).toBe(rootNode);
      vi.advanceTimersByTime(1000);
      expect(tree.getRootNode).toHaveBeenCalled();
      expect(ui.currentNode).toBe(rootNode);
    });
  });
});
