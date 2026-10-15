import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenThemeManager } from '../../src/js/game/ScreenThemeManager.js';
import { SCREEN_THEMES } from '../../src/js/data/themes.js';

describe('ScreenThemeManager', () => {
    let screenThemeManager;
    let mockBody;
    let mockScreenElement;

    beforeEach(() => {
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
            expect(mockBody.style.background).toBe(defaultTheme.gradient);
        });
    });

    describe('applyTheme', () => {
        it('should apply the correct theme for a known screen', () => {
            const theme = SCREEN_THEMES['screen-shop'];
            screenThemeManager.applyTheme('screen-shop');
            expect(screenThemeManager.currentTheme).toBe(theme);
            expect(mockBody.style.background).toBe(theme.gradient);
            expect(mockScreenElement.style.background).toBe(theme.gradient);
        });

        it('does not write unread --screen-* custom properties', () => {
            const setProperty = vi.spyOn(document.documentElement.style, 'setProperty');
            screenThemeManager.applyTheme('screen-shop');
            const names = setProperty.mock.calls.map(call => call[0]);
            for (const name of ['--screen-primary', '--screen-secondary', '--screen-accent', '--screen-gradient']) {
                expect(names).not.toContain(name);
            }
        });

        it('should fall back to the default theme for an unknown screen', () => {
            mockScreenElement.style.background = undefined;
            const defaultTheme = SCREEN_THEMES['screen-game'];
            screenThemeManager.applyTheme('unknown-screen');
            expect(screenThemeManager.currentTheme).toBe(defaultTheme);
            expect(mockBody.style.background).toBe(defaultTheme.gradient);
            expect(mockScreenElement.style.background).toBeUndefined();
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