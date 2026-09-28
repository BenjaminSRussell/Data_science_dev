import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScreenManager } from '../../src/js/ui/ScreenManager.js';

describe('ScreenManager', () => {
  let screenManager;
  let mockMainGame;
  let consoleErrorSpy;

  beforeEach(() => {
    mockMainGame = {
      gsapAnimator: null,
    };
    screenManager = new ScreenManager(mockMainGame);
    document.body.innerHTML = `
      <div id="top-bar"></div>
      <section class="screen active" id="screen-menu"></section>
      <section class="screen hidden" id="screen-a"></section>
      <section class="screen hidden" id="screen-b"></section>
    `;
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    screenManager.init();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize screens correctly', () => {
    expect(Object.keys(screenManager.screens)).toEqual(['screen-menu', 'screen-a', 'screen-b']);
    expect(screenManager.screens['screen-menu']).toBe(document.getElementById('screen-menu'));
    expect(screenManager.screens['screen-a']).toBe(document.getElementById('screen-a'));
    expect(screenManager.screens['screen-b']).toBe(document.getElementById('screen-b'));
  });

  it('should log an error and return if showScreen is called with an unknown id', () => {
    expect(() => screenManager.showScreen('screen-unknown')).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Screen not found: screen-unknown');
    expect(screenManager.currentScreen).toBe('screen-menu');
    expect(screenManager.history).toEqual([]);
  });

  it('should use classList fallback if gsapAnimator is not available', () => {
    const screenMenu = document.getElementById('screen-menu');
    const screenA = document.getElementById('screen-a');
    screenManager.showScreen('screen-a');
    expect(screenMenu.classList.contains('active')).toBe(false);
    expect(screenMenu.classList.contains('hidden')).toBe(true);
    expect(screenA.classList.contains('active')).toBe(true);
    expect(screenA.classList.contains('hidden')).toBe(false);
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
    expect(screenManager.history).toEqual(['screen-menu', 'screen-a']);
    expect(screenManager.currentScreen).toBe('screen-b');

    const showScreenSpy = vi.spyOn(screenManager, 'showScreen');
    screenManager.goBack();

    expect(showScreenSpy).toHaveBeenCalledTimes(1);
    expect(showScreenSpy).toHaveBeenCalledWith('screen-a', false);
    expect(screenManager.history).toEqual(['screen-menu']);
    expect(screenManager.currentScreen).toBe('screen-a');
  });

  it('should be a no-op if goBack is called with an empty history', () => {
    screenManager.showScreen('screen-a', false);
    expect(screenManager.history).toEqual([]);

    const showScreenSpy = vi.spyOn(screenManager, 'showScreen');
    expect(() => screenManager.goBack()).not.toThrow();

    expect(showScreenSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(screenManager.currentScreen).toBe('screen-a');
    expect(screenManager.history).toEqual([]);
  });

  it('should reflect currentScreen correctly before and after showScreen', () => {
    expect(screenManager.isScreenActive('screen-menu')).toBe(true);
    screenManager.showScreen('screen-a');
    expect(screenManager.isScreenActive('screen-menu')).toBe(false);
    expect(screenManager.isScreenActive('screen-a')).toBe(true);
  });
});
