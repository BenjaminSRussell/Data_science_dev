/**
 * MenuThemeSystem: invariant, unlock gating, theme application, persistence (#436)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MenuThemeSystem } from '../../src/js/game/MenuThemeSystem.js';

describe('MenuThemeSystem behaviour', () => {
    beforeEach(() => { localStorage.clear(); });
    afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = ''; localStorage.clear(); });

    it('always has an unlocked starter theme after construction, even if initializeThemes throws', () => {
        expect(new MenuThemeSystem().themes.starter.unlocked).toBe(true);
        vi.spyOn(MenuThemeSystem.prototype, 'initializeThemes').mockImplementation(() => { throw new Error('x'); });
        const sys = new MenuThemeSystem();
        expect(sys.themes.starter.unlocked).toBe(true);
        expect(sys.currentTheme).toBe('starter');
        expect(sys.getThemeForGameState({ rankIndex: 9 })).toBe(sys.themes.starter);
    });

    it('corporate unlocks at rankIndex 3 and saves only when newly unlocked', () => {
        const sys = new MenuThemeSystem();
        const save = vi.spyOn(sys, 'saveUnlockedThemes');
        sys.checkThemeUnlocks({ rankIndex: 2 });
        expect(sys.themes.corporate.unlocked).toBe(false);
        expect(save).not.toHaveBeenCalled();
        sys.checkThemeUnlocks({ rankIndex: 3 });
        expect(sys.themes.corporate.unlocked).toBe(true);
        expect(save).toHaveBeenCalledTimes(1);
        sys.checkThemeUnlocks({ rankIndex: 3 });
        expect(save).toHaveBeenCalledTimes(1);
        expect(JSON.parse(localStorage.getItem('unlockedMenuThemes')).corporate).toBe(true);
    });

    it('dataViz treats missing tasksCompleted as 0 and unlocks at 50', () => {
        const sys = new MenuThemeSystem();
        sys.checkThemeUnlocks({ rankIndex: 0 });
        expect(sys.themes.dataViz.unlocked).toBe(false);
        sys.checkThemeUnlocks({ rankIndex: 0, tasksCompleted: 49 });
        expect(sys.themes.dataViz.unlocked).toBe(false);
        sys.checkThemeUnlocks({ rankIndex: 0, tasksCompleted: 50 });
        expect(sys.themes.dataViz.unlocked).toBe(true);
    });

    it('getThemeForGameState: starter for no state, highest satisfied rank theme otherwise', () => {
        const sys = new MenuThemeSystem();
        expect(sys.getThemeForGameState(null)).toBe(sys.themes.starter);
        sys.themes.corporate.unlocked = true;
        sys.themes.executive.unlocked = true;
        expect(sys.getThemeForGameState({ rankIndex: 5 })).toBe(sys.themes.executive);
        expect(sys.getThemeForGameState({ rankIndex: 4 })).toBe(sys.themes.corporate);
        expect(sys.getThemeForGameState({ rankIndex: 1 })).toBe(sys.themes.starter);
    });

    it('applyTheme paints the menu, saves the id and dispatches menuThemeChanged', () => {
        document.body.innerHTML = '<div class="menu-background"></div><div class="menu-gradient-overlay"></div><div class="menu-grid-pattern"></div>';
        const sys = new MenuThemeSystem();
        sys.themes.corporate.unlocked = true;
        const events = [];
        const handler = (e) => events.push(e.detail);
        window.addEventListener('menuThemeChanged', handler);
        sys.applyTheme('corporate');
        window.removeEventListener('menuThemeChanged', handler);
        expect(sys.currentTheme).toBe('corporate');
        expect(localStorage.getItem('menuTheme')).toBe('corporate');
        const probe = document.createElement('div');
        probe.style.background = sys.themes.corporate.gradient;
        expect(document.querySelector('.menu-gradient-overlay').style.background).toBe(probe.style.background);
        probe.style.backgroundImage = sys.themes.corporate.pattern;
        expect(document.querySelector('.menu-grid-pattern').style.backgroundImage).toBe(probe.style.backgroundImage);
        expect(events).toHaveLength(1);
        expect(events[0].colors).toBe(sys.themes.corporate.particleColors);
    });

    it('applyTheme falls back to starter for locked or unknown themes', () => {
        const sys = new MenuThemeSystem();
        sys.applyTheme('executive');
        expect(sys.currentTheme).toBe('starter');
        sys.applyTheme('nope');
        expect(sys.currentTheme).toBe('starter');
    });

    it('loadTheme only returns a saved id that exists and is unlocked', () => {
        const sys = new MenuThemeSystem();
        expect(sys.loadTheme()).toBe('starter');
        localStorage.setItem('menuTheme', 'ghost');
        expect(sys.loadTheme()).toBe('starter');
        localStorage.setItem('menuTheme', 'corporate');
        expect(sys.loadTheme()).toBe('starter');
        sys.themes.corporate.unlocked = true;
        expect(sys.loadTheme()).toBe('corporate');
    });

    it('init restores a saved theme that was unlocked in a previous session', () => {
        localStorage.setItem('unlockedMenuThemes', JSON.stringify({ starter: true, corporate: true }));
        localStorage.setItem('menuTheme', 'corporate');
        const sys = new MenuThemeSystem();
        sys.init();
        expect(sys.currentTheme).toBe('corporate');
    });

    it('corrupt saved unlocks cannot lock the starter theme', () => {
        localStorage.setItem('unlockedMenuThemes', JSON.stringify({ starter: false, corporate: 'yes' }));
        const sys = new MenuThemeSystem();
        sys.init();
        expect(sys.themes.starter.unlocked).toBe(true);
        expect(sys.themes.corporate.unlocked).toBe(false);
    });
});
