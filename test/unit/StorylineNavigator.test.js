```javascript
const StorylineNavigator = require('../../js/dev/StorylineNavigator');
const GameState = require('../../src/cpp/game_state');

describe('StorylineNavigator', () => {
  let navigator;
  let gameState;
  let storylineManager;
  let storyBeatsSystem;

  beforeEach(() => {
    gameState = new GameState();
    storylineManager = {
      storylinePhase: 'intro',
      storylineProgress: 0,
      getCurrentArc: jest.fn(() => 'arc1'),
      majorDecisions: ['decision1']
    };
    storyBeatsSystem = {
      completedBeats: [],
      pendingBeats: ['beat1', 'beat2', 'beat3', 'beat4']
    };
    navigator = new StorylineNavigator({
      gameState: gameState,
      storylineManager: storylineManager,
      storyBeatsSystem: storyBeatsSystem
    });
  });

  describe('triggerStoryBeat', () => {
    test('should delegate to game.handleStoryBeat if it exists', () => {
      const game = {
        handleStoryBeat: jest.fn()
      };
      navigator.game = game;
      navigator.triggerStoryBeat('beat2');
      expect(game.handleStoryBeat).toHaveBeenCalledWith('beat2');
    });

    test('should manually push the id into completedBeats if not already present', () => {
      navigator.triggerStoryBeat('beat2');
      expect(storyBeatsSystem.completedBeats).toEqual(['beat2']);
      navigator.triggerStoryBeat('beat2');
      expect(storyBeatsSystem.completedBeats).toEqual(['beat2']);
    });

    test('should return success:false for unknown beat id', () => {
      const result = navigator.triggerStoryBeat('beat5');
      expect(result).toEqual({ success: false, error: 'Beat not found' });
    });
  });

  describe('setStorylinePhase', () => {
    test('should validate against a fixed whitelist', () => {
      navigator.setStorylinePhase('intro');
      expect(storylineManager.storylinePhase).toBe('intro');
    });

    test('should return exact error message format for invalid phase', () => {
      const result = navigator.setStorylinePhase('nonsense');
      expect(result).toEqual({ success: false, error: 'Invalid storyline phase' });
    });
  });

  describe('getStorylineState', () => {
    test('should have full fallback shape when storylineManager missing', () => {
      navigator.storylineManager = null;
      const result = navigator.getStorylineState();
      expect(result).toEqual({
        error: 'StorylineManager not initialized',
        phase: 'unknown',
        progress: 0,
        currentArc: null,
        completedDecisions: [],
        completedBeats: [],
        pendingBeats: []
      });
    });

    test('should aggregate shape when storylineManager present', () => {
      const result = navigator.getStorylineState();
      expect(result).toEqual({
        phase: 'intro',
        progress: 0,
        currentArc: 'arc1',
        completedDecisions: ['decision1'],
        completedBeats: [],
        pendingBeats: ['beat1', 'beat2', 'beat3', 'beat4']
      });
    });
  });
});