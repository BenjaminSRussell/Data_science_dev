import { describe, it, expect, beforeEach } from 'vitest';
import { ScreenManager } from '../../src/js/ui/ScreenManager.js';

describe('ScreenManager', () => {
  let screenManager;
  let mockMainGame;

  beforeEach(() => {
    mockMainGame = {
      gsapAnimator: null,
    };
    screenManager = new ScreenManager(mockMainGame);
    document.body.innerHTML = `
      <section class="screen" id="screen-menu"></section>
      <section class="screen" id="screen-a"></section>
      <section class="screen" id="screen-b"></section>
    `;
    screenManager.init();
  });

  it('should initialize screens correctly', () => {
    expect(screenManager.screens.size).toBe(3);
    expect(screenManager.screens.has('screen-menu')).toBe(true);
    expect(screenManager.screens.has('screen-a')).toBe(true);
    expect(screenManager.screens.has('screen-b')).toBe(true);
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
});