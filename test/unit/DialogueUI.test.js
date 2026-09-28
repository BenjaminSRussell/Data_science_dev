import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';
import { STATS, CharacterStats } from '../../src/js/game/CharacterStats.js';

/**
 * Build a minimal game mock sufficient to drive DialogueUI.open() into a
 * known currentNode via the DOM fallback path (customElements.get('dialogue-component')
 * is false in jsdom unless the Lit component is imported).
 */
function makeGameMock() {
  const rootNode = {
    id: 'root',
    text: 'Root text',
    choices: [
      { id: 'ask', text: 'Ask something', nextNode: 'gone' },
      { id: 'close', text: 'Goodbye' }
    ]
  };
  // 'gone' is referenced by the 'ask' choice but is not a node of this tree
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
      characterStats: new CharacterStats(),
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
    // open() types the node text out with chained timeouts: keep them under control
    vi.useFakeTimers();
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

    it('raises the boosted stat by one below the cap', () => {
      const stats = game.gameState.characterStats;
      expect(stats.getStat('intelligence')).toBe(10);

      ui.applyEffects({ statBoost: 'intelligence' });

      expect(stats.getStat('intelligence')).toBe(11);
    });

    it('caps statBoost at STATS maxLevel', () => {
      const stats = game.gameState.characterStats;
      expect(STATS.intelligence.maxLevel).toBe(100);
      expect(STATS.luck.maxLevel).toBe(50);
      stats.stats.intelligence = 100;
      stats.stats.luck = 50;

      ui.applyEffects({ statBoost: 'intelligence' });
      ui.applyEffects({ statBoost: 'luck' });

      expect(stats.getStat('intelligence')).toBe(100);
      expect(stats.getStat('luck')).toBe(50);
    });

    it('does not mutate or throw when effects has no relevant keys', () => {
      const setRelationship = game.gameState.npcManager.setRelationship;
      const before = { ...game.gameState.characterStats.stats };

      expect(() => ui.applyEffects({})).not.toThrow();
      expect(setRelationship).not.toHaveBeenCalled();
      expect(game.gameState.characterStats.stats).toEqual(before);
    });
  });

  describe('handleChoice', () => {
    it('close/goodbye closes and resets state', () => {
      ui.open(npc);
      expect(ui.isOpen).toBe(true);

      expect(ui.container.classList.contains('active')).toBe(true);

      ui.handleChoice('close');
      expect(ui.container.classList.contains('active')).toBe(false);
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

      tree.getNode.mockClear();
      tree.getRootNode.mockClear();
      vi.runAllTimers(); // let the typing animation of open() finish

      ui.handleChoice('does-not-exist');

      expect(tree.getNode).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
      expect(ui.isOpen).toBe(true);
      expect(ui.isOpen).toBe(before.isOpen);
      expect(ui.currentNPC).toBe(before.currentNPC);
      expect(ui.currentNode).toBe(before.currentNode);
    });

    it('schedules a 1000ms callback to show the root node when nextNode lookup fails', () => {
      ui.open(npc);
      vi.runAllTimers(); // let the typing animation of open() finish
      tree.getRootNode.mockClear();
      const showNode = vi.spyOn(ui, 'showNode');

      // 'ask' is a real choice of the root node whose nextNode is not in the tree
      ui.handleChoice('ask');

      expect(tree.getNode).toHaveBeenLastCalledWith('gone');
      expect(showNode).not.toHaveBeenCalled();
      expect(ui.currentNode).toBe(rootNode);

      vi.advanceTimersByTime(999);
      expect(tree.getRootNode).not.toHaveBeenCalled();
      expect(showNode).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(tree.getRootNode).toHaveBeenCalledTimes(1);
      expect(showNode).toHaveBeenCalledTimes(1);
      expect(showNode).toHaveBeenCalledWith(rootNode);
      expect(ui.currentNode).toBe(rootNode);
    });
  });
});
