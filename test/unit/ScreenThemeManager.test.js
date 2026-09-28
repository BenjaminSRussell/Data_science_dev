import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScreenThemeManager, SCREEN_THEMES } from '../../src/js/game/ScreenThemeManager.js';

describe('ScreenThemeManager', () => {
    let screenThemeManager;
    let setPropertySpy;
    let rootStyle;

    const expectThemeApplied = (theme) => {
        expect(setPropertySpy).toHaveBeenCalledTimes(4);
        expect(setPropertySpy).toHaveBeenCalledWith('--screen-primary', theme.primary);
        expect(setPropertySpy).toHaveBeenCalledWith('--screen-secondary', theme.secondary);
        expect(setPropertySpy).toHaveBeenCalledWith('--screen-accent', theme.accent);
        expect(setPropertySpy).toHaveBeenCalledWith('--screen-gradient', theme.gradient);

        expect(rootStyle.getPropertyValue('--screen-primary')).toBe(theme.primary);
        expect(rootStyle.getPropertyValue('--screen-secondary')).toBe(theme.secondary);
        expect(rootStyle.getPropertyValue('--screen-accent')).toBe(theme.accent);
        expect(rootStyle.getPropertyValue('--screen-gradient')).toBe(theme.gradient);

        expect(document.body.style.background).toBe(theme.gradient);
    };

    beforeEach(() => {
        document.documentElement.removeAttribute('style');
        document.body.removeAttribute('style');
        document.body.innerHTML = '<div id="screen-shop"></div>';

        rootStyle = document.documentElement.style;
        setPropertySpy = vi.spyOn(rootStyle, 'setProperty');

        screenThemeManager = new ScreenThemeManager();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should apply the default theme', () => {
            expect(screenThemeManager.currentScreen).toBe('screen-menu');
            expect(screenThemeManager.getCurrentTheme()).toBe(SCREEN_THEMES['screen-menu']);
            expectThemeApplied(SCREEN_THEMES['screen-menu']);
        });
    });

    describe('applyTheme', () => {
        it('should apply the correct theme for a known screen', () => {
            const theme = SCREEN_THEMES['screen-shop'];
            const screenElement = document.getElementById('screen-shop');
            setPropertySpy.mockClear();

            screenThemeManager.applyTheme('screen-shop');

            expect(screenThemeManager.currentScreen).toBe('screen-shop');
            expect(screenThemeManager.getCurrentTheme()).toBe(theme);
            expectThemeApplied(theme);
            expect(screenElement.style.background).toBe(theme.gradient);
        });

        it('should fall back to the default theme for an unknown screen', () => {
            const defaultTheme = SCREEN_THEMES['screen-game'];
            const screenElement = document.getElementById('screen-shop');
            setPropertySpy.mockClear();

            screenThemeManager.applyTheme('unknown-screen');

            expect(screenThemeManager.currentScreen).toBe('unknown-screen');
            expect(screenThemeManager.getCurrentTheme()).toBe(defaultTheme);
            expectThemeApplied(defaultTheme);
            expect(screenElement.style.background).toBe('');
        });
    });

    describe('getCurrentTheme', () => {
        it('should return the current theme if it matches the current screen', () => {
            screenThemeManager.applyTheme('screen-news');
            expect(screenThemeManager.getCurrentTheme()).toBe(SCREEN_THEMES['screen-news']);
        });

        it('should fall back to the default theme if the current screen does not match', () => {
            screenThemeManager.applyTheme('screen-shop');
            screenThemeManager.currentScreen = 'unknown-screen';
            expect(screenThemeManager.getCurrentTheme()).toBe(SCREEN_THEMES['screen-game']);
        });
    });
});
