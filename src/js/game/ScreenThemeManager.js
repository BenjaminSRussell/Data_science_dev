/**
 * ScreenThemeManager.js
 * Manages different color themes for each screen/section
 */

import { SCREEN_THEMES } from '../data/themes.js';

export { SCREEN_THEMES };

/** Layered background-image value (url, gradient) onto an element */
function paintLayered(element, value) {
    element.style.background = '';
    element.style.backgroundImage = value;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    element.style.backgroundRepeat = 'no-repeat';
}

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

        // The location screen shows where you are: LocationBackgroundSystem's
        // background for the current location, instead of one fixed theme
        // that overwrote it on every visit (#2008, #1065)
        const locationBackground = screenId === 'screen-office' ? this.getLocationBackground() : null;
        // The menu keeps the player's unlocked menu theme instead of being
        // reset to the fixed screen gradient each time it is shown
        const menuBackground = screenId === 'screen-menu' ? this.getMenuBackground() : null;

        // Apply background to screen container
        const screen = document.getElementById(screenId);
        if (screen) {
            if (locationBackground) {
                paintLayered(screen, locationBackground);
            } else if (menuBackground) {
                screen.style.backgroundImage = menuBackground;
            } else {
                screen.style.background = theme.gradient;
            }
        }

        // Update body background. On the main game screen the office
        // background sits on top of the theme gradient instead of being
        // wiped out by it (#1731)
        const env = this.environmentManager || (typeof window !== 'undefined' ? window.game?.environmentManager : null);
        if (screenId === 'screen-game' && env?.getBackground) {
            document.body.style.background = env.getBackground(theme.gradient);
        } else if (locationBackground) {
            paintLayered(document.body, locationBackground);
        } else {
            document.body.style.background = theme.gradient;
        }
    }

    /**
     * Background layers for the active menu theme, if the menu theme system exists
     */
    getMenuBackground() {
        const game = typeof window !== 'undefined' ? window.game : null;
        const system = game?.menuThemeSystem;
        return system?.getMenuBackground ? system.getMenuBackground() : null;
    }

    /**
     * Background for the player's current location, if the systems exist
     */
    getLocationBackground() {
        const game = typeof window !== 'undefined' ? window.game : null;
        const system = game?.locationBackgroundSystem || game?.gameState?.locationBackgroundSystem;
        const locationId = game?.worldMap?.currentLocation || game?.gameState?.worldMap?.currentLocation;
        if (!system?.getLayeredBackground || !locationId) return null;
        try {
            return system.getLayeredBackground(locationId) || null;
        } catch {
            return null;
        }
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return SCREEN_THEMES[this.currentScreen] || SCREEN_THEMES['screen-game'];
    }
}




