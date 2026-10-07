import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockClasses = vi.hoisted(() => {
  const make = (name) => {
    const C = vi.fn().mockImplementation(function (game) { this.game = game; });
    C.displayName = name;
    return C;
  };
  return {
    DevMenu: make('DevMenu'),
    DialogueTester: make('DialogueTester'),
    OptionTester: make('OptionTester'),
    AssetValidator: make('AssetValidator'),
    GraphValidator: make('GraphValidator'),
    WorkSystemValidator: make('WorkSystemValidator'),
    StorylineNavigator: make('StorylineNavigator'),
    LocationTester: make('LocationTester'),
  };
});

vi.mock('../../src/js/dev/DevMenu.js', () => ({ DevMenu: mockClasses.DevMenu }));
vi.mock('../../src/js/dev/DialogueTester.js', () => ({ DialogueTester: mockClasses.DialogueTester }));
vi.mock('../../src/js/dev/OptionTester.js', () => ({ OptionTester: mockClasses.OptionTester }));
vi.mock('../../src/js/dev/AssetValidator.js', () => ({ AssetValidator: mockClasses.AssetValidator }));
vi.mock('../../src/js/dev/GraphValidator.js', () => ({ GraphValidator: mockClasses.GraphValidator }));
vi.mock('../../src/js/dev/WorkSystemValidator.js', () => ({ WorkSystemValidator: mockClasses.WorkSystemValidator }));
vi.mock('../../src/js/dev/StorylineNavigator.js', () => ({ StorylineNavigator: mockClasses.StorylineNavigator }));
vi.mock('../../src/js/dev/LocationTester.js', () => ({ LocationTester: mockClasses.LocationTester }));

import { DevTools } from '../../src/js/dev/index.js';

const game = { name: 'mock-game' };

function setLocation({ hostname = 'example.com', search = '' } = {}) {
  Object.defineProperty(window, 'location', {
    value: { hostname, search },
    configurable: true,
  });
}

describe('DevTools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    delete window.devTools;
    setLocation();
  });

  describe('isDevMode', () => {
    it('returns true when hostname is localhost', () => {
      setLocation({ hostname: 'localhost' });
      expect(new DevTools(game).isDevMode()).toBe(true);
    });

    it('returns true when hostname is 127.0.0.1', () => {
      setLocation({ hostname: '127.0.0.1' });
      expect(new DevTools(game).isDevMode()).toBe(true);
    });

    it('returns true when localStorage dev_mode is "true"', () => {
      localStorage.setItem('dev_mode', 'true');
      expect(new DevTools(game).isDevMode()).toBe(true);
    });

    it('returns true when query string has a dev param', () => {
      setLocation({ search: '?dev=1' });
      expect(new DevTools(game).isDevMode()).toBe(true);
    });

    it('returns false by default', () => {
      expect(new DevTools(game).isDevMode()).toBe(false);
    });
  });

  describe('init', () => {
    it('does nothing when not in dev mode', () => {
      const tools = new DevTools(game);
      expect(mockClasses.DevMenu).not.toHaveBeenCalled();
      expect(mockClasses.DialogueTester).not.toHaveBeenCalled();
      expect(mockClasses.OptionTester).not.toHaveBeenCalled();
      expect(mockClasses.AssetValidator).not.toHaveBeenCalled();
      expect(mockClasses.GraphValidator).not.toHaveBeenCalled();
      expect(mockClasses.WorkSystemValidator).not.toHaveBeenCalled();
      expect(mockClasses.StorylineNavigator).not.toHaveBeenCalled();
      expect(mockClasses.LocationTester).not.toHaveBeenCalled();
      expect(window.devTools).toBeUndefined();
      expect(localStorage.getItem('dev_mode')).toBeNull();
    });

    it('constructs all 8 sub-tools and sets globals when in dev mode', () => {
      const tools = new DevTools(game);
      for (const C of Object.values(mockClasses)) {
        expect(C).toHaveBeenCalledTimes(1);
        expect(C).toHaveBeenCalledWith(game);
      }
      expect(tools.devMenu).toBeInstanceOf(mockClasses.DevMenu);
      expect(tools.dialogueTester).toBeInstanceOf(mockClasses.DialogueTester);
      expect(tools.optionTester).toBeInstanceOf(mockClasses.OptionTester);
      expect(tools.assetValidator).toBeInstanceOf(mockClasses.AssetValidator);
      expect(tools.graphValidator).toBeInstanceOf(mockClasses.GraphValidator);
      expect(tools.workValidator).toBeInstanceOf(mockClasses.WorkSystemValidator);
      expect(tools.storylineNavigator).toBeInstanceOf(mockClasses.StorylineNavigator);
      expect(tools.locationTester).toBeInstanceOf(mockClasses.LocationTester);
      expect(window.devTools).toBe(tools);
      expect(localStorage.getItem('dev_mode')).toBe('true');
    });
  });

  describe('runAllTests', () => {
    it('aggregates results from all 5 sub-tools', async () => {
      const tools = new DevTools(game);
      tools.dialogueTester = { testAll: () => Promise.resolve({ d: 1 }) };
      tools.optionTester = { testAll: () => Promise.resolve({ o: 2 }) };
      tools.assetValidator = { validateAll: () => Promise.resolve({ a: 3 }) };
      tools.graphValidator = { validateAll: () => Promise.resolve({ g: 4 }) };
      tools.workValidator = { validateAll: () => Promise.resolve({ w: 5 }) };

      const results = await tools.runAllTests();
      expect(results).toEqual({
        dialogues: { d: 1 },
        options: { o: 2 },
        assets: { a: 3 },
        graphs: { g: 4 },
        work: { w: 5 },
      });
    });

    it('resolves with null for a sub-tool that was never constructed', async () => {
      const tools = new DevTools(game);
      tools.dialogueTester = { testAll: () => Promise.resolve({ d: 1 }) };
      tools.optionTester = { testAll: () => Promise.resolve({ o: 2 }) };
      tools.assetValidator = { validateAll: () => Promise.resolve({ a: 3 }) };
      tools.graphValidator = { validateAll: () => Promise.resolve({ g: 4 }) };
      // workValidator intentionally left null

      const results = await tools.runAllTests();
      expect(results.work).toBeNull();
      expect(results.dialogues).toEqual({ d: 1 });
      expect(results.options).toEqual({ o: 2 });
      expect(results.assets).toEqual({ a: 3 });
      expect(results.graphs).toEqual({ g: 4 });
    });
  });
});
