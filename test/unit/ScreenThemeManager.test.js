import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenThemeManager } from '../../src/js/game/ScreenThemeManager.js';
import { SCREEN_THEMES } from '../../src/js/data/themes.js';

describe('ScreenThemeManager', () => {
    let screenThemeManager;
    let mockDocumentElement;
    let mockBody;
    let mockScreenElement;

    beforeEach(() => {
        mockDocumentElement = {
            style: {
                setProperty: vi.fn()
            }
        };
        mockBody = {
            style: {
                background: undefined
            }
        };
        mockScreenElement = {
            style: {
                background: undefined
            }
        };

        vi.spyOn(document, 'getElementById').mockImplementation(id => {
            if (id === 'screen-menu' || id === 'screen-shop') return mockScreenElement;
            return null;
        });

        Object.defineProperty(document, 'documentElement', {
            value: mockDocumentElement,
            writable: true
        });

        Object.defineProperty(document, 'body', {
            value: mockBody,
            writable: true
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
            mockDocumentElement.style.setProperty.mockClear();
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
            mockDocumentElement.style.setProperty.mockClear();
            mockScreenElement.style.background = undefined;
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

    describe('theme coverage', () => {
        it('should have theme entries for all 18 game screens', () => {
            const allScreens = [
                'screen-bank', 'screen-career', 'screen-chart-studio', 'screen-clients',
                'screen-game', 'screen-intro-video', 'screen-jail', 'screen-library',
                'screen-map', 'screen-menu', 'screen-newspaper', 'screen-office',
                'screen-relationships', 'screen-review', 'screen-shop', 'screen-staff',
                'screen-stats', 'screen-stock-market'
            ];

            for (const screenId of allScreens) {
                expect(SCREEN_THEMES[screenId]).toBeDefined();
                expect(SCREEN_THEMES[screenId]).toHaveProperty('primary');
                expect(SCREEN_THEMES[screenId]).toHaveProperty('secondary');
                expect(SCREEN_THEMES[screenId]).toHaveProperty('accent');
                expect(SCREEN_THEMES[screenId]).toHaveProperty('gradient');
            }
        });
    });
});