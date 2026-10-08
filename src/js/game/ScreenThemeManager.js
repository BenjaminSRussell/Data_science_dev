/**
 * ScreenThemeManager.js
 * Manages different color themes for each screen/section
 */

import { SCREEN_THEMES } from '../data/themes.js';

export { SCREEN_THEMES };

export class ScreenThemeManager {
    /**
     * @param {Object} [environmentManager] - owner of the office background (#1731)
     */
    constructor(environmentManager = null) {
        this.environmentManager = environmentManager;
        this.currentScreen = null;
        this.currentTheme = null;
        this.applyTheme('screen-menu');
    }

    /**
     * Apply theme to a screen
     */
    applyTheme(screenId) {
        const theme = SCREEN_THEMES[screenId] || SCREEN_THEMES['screen-game'];
        this.currentScreen = screenId;
        this.currentTheme = theme;

        // Apply CSS variables
        const root = document.documentElement;
        root.style.setProperty('--screen-primary', theme.primary);
        root.style.setProperty('--screen-secondary', theme.secondary);
        root.style.setProperty('--screen-accent', theme.accent);
        root.style.setProperty('--screen-gradient', theme.gradient);

        // Apply background to screen container
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.background = theme.gradient;
        }

        // Update body background. On the main game screen the office
        // background sits on top of the theme gradient instead of being
        // wiped out by it (#1731)
        const env = this.environmentManager || (typeof window !== 'undefined' ? window.game?.environmentManager : null);
        if (screenId === 'screen-game' && env?.getBackground) {
            document.body.style.background = env.getBackground(theme.gradient);
        } else {
            document.body.style.background = theme.gradient;
        }
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return SCREEN_THEMES[this.currentScreen] || SCREEN_THEMES['screen-game'];
    }
}




