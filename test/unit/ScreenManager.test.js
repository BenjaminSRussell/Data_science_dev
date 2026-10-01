import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenManager } from '../../src/js/ui/ScreenManager.js';

describe('ScreenManager', () => {
  let screenManager;
  let mockMainGame;

  beforeEach(() => {
    mockMainGame = {
      gsapAnimator: null,
      showToast: vi.fn(),
    };
    screenManager = new ScreenManager(mockMainGame);
    document.body.innerHTML = `
      <div id="top-bar"></div>
      <section class="screen" id="screen-menu"></section>
      <section class="screen" id="screen-a"></section>
      <section class="screen" id="screen-b"></section>
      <div id="toast-container" class="toast-container"></div>
    `;
    screenManager.init();
  });

  it('should initialize screens correctly', () => {
    expect(Object.keys(screenManager.screens).length).toBe(3);
    expect(screenManager.screens['screen-menu']).toBeDefined();
    expect(screenManager.screens['screen-a']).toBeDefined();
    expect(screenManager.screens['screen-b']).toBeDefined();
  });

  it('should log an error and return if showScreen is called with an unknown id', () => {
    console.error = vi.fn();
    screenManager.showScreen('screen-unknown');
    expect(console.error).toHaveBeenCalled();
  });

  it('should use classList fallback if gsapAnimator is not available', () => {
    const screenA = document.getElementById('screen-a');
    const screenB = document.getElementById('screen-b');
    screenManager.showScreen('screen-a');
    expect(screenA.classList.contains('active')).toBe(true);
    expect(screenA.classList.contains('hidden')).toBe(false);
    expect(screenB.classList.contains('active')).toBe(false);
    expect(screenB.classList.contains('hidden')).toBe(true);
  });

  it('should toggle top-bar display based on screen id', () => {
    const topBar = document.getElementById('top-bar');
    screenManager.showScreen('screen-menu');
    expect(topBar.style.display).toBe('none');
    screenManager.showScreen('screen-a');
    expect(topBar.style.display).toBe('flex');
  });

  it('should track history and navigate back correctly', () => {
    screenManager.showScreen('screen-a');
    screenManager.showScreen('screen-b');
    expect(screenManager.history).toEqual(['screen-menu', 'screen-a', 'screen-b']);
    screenManager.goBack();
    expect(screenManager.history).toEqual(['screen-menu', 'screen-a']);
    expect(screenManager.currentScreen).toBe('screen-a');
  });

  it('should be a no-op if goBack is called with an empty history', () => {
    console.error = vi.fn();
    screenManager.history = [];
    screenManager.goBack();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should reflect currentScreen correctly before and after showScreen', () => {
    expect(screenManager.isScreenActive('screen-menu')).toBe(true);
    screenManager.showScreen('screen-a');
    expect(screenManager.isScreenActive('screen-menu')).toBe(false);
    expect(screenManager.isScreenActive('screen-a')).toBe(true);
  });

  it('should re-scan DOM and cache screens added after init() - issue #1364 recovery', () => {
    // Simulate a screen that was added to the DOM after init() but not in the cache
    // (like the screen-story timing bug mentioned in the issue)
    const newScreen = document.createElement('section');
    newScreen.className = 'screen';
    newScreen.id = 'screen-late-loaded';
    document.body.appendChild(newScreen);

    // Verify the screen is not in the cache yet
    expect(screenManager.screens['screen-late-loaded']).toBeUndefined();

    // Call showScreen with the late-loaded screen ID
    screenManager.showScreen('screen-late-loaded');

    // Should find it in the DOM and cache it
    expect(screenManager.screens['screen-late-loaded']).toBeDefined();
    expect(screenManager.screens['screen-late-loaded']).toBe(newScreen);

    // Should have made it the current screen and added proper classes
    expect(screenManager.currentScreen).toBe('screen-late-loaded');
    expect(newScreen.classList.contains('active')).toBe(true);
  });

  it('should display error toast when screen truly cannot be found - issue #1364 user feedback', () => {
    // Try to show a screen that doesn't exist and won't be in DOM
    screenManager.showScreen('screen-nonexistent');

    // Should display an error toast to the player using mainGame.showToast
    // which uses the existing .toast.error CSS pattern (z-index: var(--z-toast)=300)
    expect(mockMainGame.showToast).toHaveBeenCalledWith(
      expect.stringContaining('Screen could not be loaded'),
      'error'
    );
  });

  it('should call handleResize on map screen after updateMapScreen completes initialization on first visit', async () => {
    // Create map screen element
    const mapScreenHtml = '<section class="screen" id="screen-map"></section>';
    document.body.innerHTML += mapScreenHtml;
    screenManager.init();

    // Create a mock unifiedMapSystem that will be assigned after a delay
    const mockHandleResize = vi.fn();
    const mockUnifiedMapSystem = {
      handleResize: mockHandleResize,
      initialize: vi.fn().mockResolvedValue(undefined),
      rendered: false,
      update: vi.fn(),
    };

    // Create mock game with updateMapScreen that simulates async initialization
    mockMainGame.updateMapScreen = vi.fn(async () => {
      // Simulate the async import and initialization happening after the function is called
      await new Promise(resolve => setTimeout(resolve, 50));
      mockMainGame.unifiedMapSystem = mockUnifiedMapSystem;
    });

    // Show the map screen
    screenManager.showScreen('screen-map');

    // Wait for the async operations to complete and handleResize to be called
    await new Promise(resolve => setTimeout(resolve, 200));

    // Verify that handleResize was called after initialization
    expect(mockHandleResize).toHaveBeenCalled();
  });
});