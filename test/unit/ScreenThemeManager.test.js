import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenThemeManager } from '../../src/js/game/ScreenThemeManager.js';
import { SCREEN_THEMES } from '../../src/js/data/themes.js';

describe('ScreenThemeManager', () => {
    let screenThemeManager;
    let mockDocumentElement;
    let mockBody;
    let mockScreenElement;

    beforeEach(() => {
        mockDocumentElement = { style: {} };
        mockBody = { style: {} };
        mockScreenElement = { style: {} };

        vi.spyOn(document, 'querySelector').mockImplementation(selector => {
            if (selector === '#game-container') return mockScreenElement;
            return null;
        });

        Object.defineProperty(document, 'documentElement', {
            get: () => mockDocumentElement
        });

        Object.defineProperty(document, 'body', {
            get: () => mockBody
        });

        screenThemeManager = new ScreenThemeManager();
    });

    describe('constructor', () => {
        it('should apply the default theme', () => {
            const defaultTheme = SCREEN_THEMES['screen-menu'];
            expect(screenThemeManager.currentTheme).toBe(defaultTheme);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledTimes(4);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-primary', defaultTheme.primary);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-secondary', defaultTheme.secondary);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-accent', defaultTheme.accent);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-gradient', defaultTheme.gradient);
            expect(mockBody.style.background).toBe(defaultTheme.gradient);
        });
    });

    describe('applyTheme', () => {
        it('should apply the correct theme for a known screen', () => {
            const theme = SCREEN_THEMES['screen-shop'];
            screenThemeManager.applyTheme('screen-shop');
            expect(screenThemeManager.currentTheme).toBe(theme);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledTimes(4);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-primary', theme.primary);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-secondary', theme.secondary);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-accent', theme.accent);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-gradient', theme.gradient);
            expect(mockBody.style.background).toBe(theme.gradient);
            expect(mockScreenElement.style.background).toBe(theme.gradient);
        });

        it('should fall back to the default theme for an unknown screen', () => {
            const defaultTheme = SCREEN_THEMES['screen-game'];
            screenThemeManager.applyTheme('unknown-screen');
            expect(screenThemeManager.currentTheme).toBe(defaultTheme);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledTimes(4);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-primary', defaultTheme.primary);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-secondary', defaultTheme.secondary);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-accent', defaultTheme.accent);
            expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--screen-gradient', defaultTheme.gradient);
            expect(mockBody.style.background).toBe(defaultTheme.gradient);
            expect(mockScreenElement.style.background).toBeUndefined();
        });
    });

    describe('getCurrentTheme', () => {
        it('should return the current theme if it matches the current screen', () => {
            const theme = SCREEN_THEMES['screen-shop'];
            screenThemeManager.currentTheme = theme;
            screenThemeManager.currentScreen = 'screen-shop';
            expect(screenThemeManager.getCurrentTheme()).toBe(theme);
        });

        it('should fall back to the default theme if the current screen does not match', () => {
            const defaultTheme = SCREEN_THEMES['screen-game'];
            screenThemeManager.currentTheme = SCREEN_THEMES['screen-shop'];
            screenThemeManager.currentScreen = 'unknown-screen';
            expect(screenThemeManager.getCurrentTheme()).toBe(defaultTheme);
        });
    });
});