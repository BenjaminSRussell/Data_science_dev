/**
 * ScreenThemeManager.js
 * Manages different color themes for each screen/section
 */

export const SCREEN_THEMES = {
    'screen-menu': {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    },
    'screen-game': {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#34d399',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    },
    'screen-chart-studio': {
        primary: '#1e1b4b',
        secondary: '#312e81',
        accent: '#a78bfa',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'
    },
    'screen-shop': {
        primary: '#1c1917',
        secondary: '#292524',
        accent: '#fbbf24',
        gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
    },
    'screen-map': {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    },
    'screen-relationships': {
        primary: '#1e1b4b',
        secondary: '#312e81',
        accent: '#f472b6',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'
    },
    'screen-stats': {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#34d399',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    },
    'screen-bank': {
        primary: '#1c1917',
        secondary: '#292524',
        accent: '#fbbf24',
        gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)'
    },
    'screen-news': {
        primary: '#1e293b',
        secondary: '#334155',
        accent: '#f472b6',
        gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)'
    }
};

export class ScreenThemeManager {
    constructor() {
        this.currentScreen = null;
        this.applyTheme('screen-menu');
    }

    /**
     * Apply theme to a screen
     */
    applyTheme(screenId) {
        const theme = SCREEN_THEMES[screenId] || SCREEN_THEMES['screen-game'];
        this.currentScreen = screenId;

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

        // Update body background
        document.body.style.background = theme.gradient;
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return SCREEN_THEMES[this.currentScreen] || SCREEN_THEMES['screen-game'];
    }
}




