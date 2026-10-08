/**
 * MenuThemeSystem - Manages background themes for the main menu
 * Themes unlock based on player progression and reflect current game state
 * Version: 2.0 - Fixed initialization issues
 */

const FALLBACK_STARTER = {
    id: 'starter',
    name: 'Starter',
    unlocked: true,
    particleColors: ['rgba(139, 92, 246, 0.6)', 'rgba(167, 139, 250, 0.4)'],
    gradient: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
    pattern: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
    background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)'
};

export class MenuThemeSystem {
    constructor() {
        this.themes = null;
        this.currentTheme = 'starter';
        this.ensureThemes();
        this.currentTheme = this.loadTheme();
    }

    /**
     * Guarantee this.themes is an object with an unlocked starter theme.
     * Every method goes through this instead of repeating its own guards.
     */
    ensureThemes() {
        if (!this.themes || typeof this.themes !== 'object' || !this.themes.starter) {
            try {
                this.themes = this.initializeThemes();
            } catch {
                this.themes = null;
            }
            if (!this.themes || typeof this.themes !== 'object' || !this.themes.starter) {
                this.themes = { starter: { ...FALLBACK_STARTER } };
            }
        }
        // The starter theme can never be locked (e.g. by corrupt saved unlocks)
        this.themes.starter.unlocked = true;
        return this.themes;
    }

    /**
     * Initialize all available themes
     */
    initializeThemes() {
        return {
            starter: {
                id: 'starter',
                name: 'Starter',
                unlocked: true, // Always unlocked
                particleColors: [
                    'rgba(139, 92, 246, 0.6)', // Purple
                    'rgba(167, 139, 250, 0.4)'
                ],
                gradient: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.06) 0%, transparent 50%)',
                pattern: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
                background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)'
            },
            corporate: {
                id: 'corporate',
                name: 'Corporate',
                unlocked: false,
                unlockRequirement: { rankIndex: 3 }, // Unlock at rank 3
                particleColors: [
                    'rgba(59, 130, 246, 0.6)', // Blue
                    'rgba(99, 102, 241, 0.4)'
                ],
                gradient: 'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
                pattern: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
            },
            executive: {
                id: 'executive',
                name: 'Executive',
                unlocked: false,
                unlockRequirement: { rankIndex: 5 }, // Unlock at rank 5
                particleColors: [
                    'rgba(251, 191, 36, 0.6)', // Gold
                    'rgba(245, 158, 11, 0.4)'
                ],
                gradient: 'radial-gradient(circle at 50% 20%, rgba(251, 191, 36, 0.12) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
                pattern: 'linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
                background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'
            },
            dataViz: {
                id: 'dataViz',
                name: 'Data Visualization',
                unlocked: false,
                unlockRequirement: { tasksCompleted: 50 }, // Unlock after 50 tasks
                particleColors: [
                    'rgba(16, 185, 129, 0.6)', // Green
                    'rgba(34, 197, 94, 0.4)'
                ],
                gradient: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)',
                pattern: 'linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)',
                background: 'linear-gradient(180deg, #0a1a14 0%, #1a2e24 50%, #0a1a14 100%)'
            },
            minimalist: {
                id: 'minimalist',
                name: 'Minimalist',
                unlocked: false,
                unlockRequirement: { reputation: 500 }, // Unlock at 500 reputation
                particleColors: [
                    'rgba(156, 163, 175, 0.4)', // Gray
                    'rgba(107, 114, 128, 0.3)'
                ],
                gradient: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
                pattern: 'linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)',
                background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)'
            }
        };
    }

    /**
     * Check theme unlock status based on game state
     */
    checkThemeUnlocks(gameState) {
        if (!gameState) return;
        this.ensureThemes();

        let changed = false;
        Object.values(this.themes).forEach(theme => {
            if (theme.unlocked || !theme.unlockRequirement) return;
            if (this.meetsRequirement(theme.unlockRequirement, gameState)) {
                theme.unlocked = true;
                changed = true;
            }
        });
        if (changed) this.saveUnlockedThemes();
    }

    /**
     * Whether a game state satisfies every field of an unlock requirement
     */
    meetsRequirement(req, gameState) {
        if (!req) return true;
        if (!gameState) return false;
        const checks = {
            rankIndex: gameState.rankIndex,
            tasksCompleted: gameState.tasksCompleted,
            reputation: gameState.reputation,
            money: gameState.money
        };
        return Object.keys(checks).every(key =>
            req[key] === undefined || (Number(checks[key]) || 0) >= req[key]
        );
    }

    /**
     * Get theme based on current game state: the most prestigious theme
     * that is unlocked and whose requirement this save meets. Covers every
     * theme, not just the rank-based ones, so dataViz and minimalist can be
     * selected too (#100, #2005, #2406).
     */
    getThemeForGameState(gameState) {
        this.ensureThemes();
        if (!gameState) return this.themes.starter;

        for (const themeId of MenuThemeSystem.THEME_PRIORITY) {
            const theme = this.themes[themeId];
            if (theme?.unlocked && this.meetsRequirement(theme.unlockRequirement, gameState)) {
                return theme;
            }
        }
        return this.themes.starter;
    }

    /**
     * CSS background-image layers for a theme (pattern, glow, base)
     */
    getMenuBackground(themeId = null) {
        this.ensureThemes();
        const theme = this.themes[themeId || this.currentTheme] || this.themes.starter;
        return [theme.pattern, theme.gradient, theme.background]
            .filter(layer => layer && layer !== 'none')
            .join(', ');
    }

    /**
     * Apply theme to menu
     */
    applyTheme(themeId = null) {
        this.ensureThemes();
        let theme = themeId ? this.themes[themeId] : this.themes[this.currentTheme];
        if (!theme || !theme.unlocked) {
            theme = this.themes.starter; // Fallback to starter
        }

        this.currentTheme = theme.id;

        // The text-mode menu has no dedicated background layers any more, so
        // paint the theme onto the menu screen itself (#2004)
        const menuScreen = document.getElementById('screen-menu');
        if (menuScreen) {
            menuScreen.style.backgroundImage = this.getMenuBackground(theme.id);
            menuScreen.dataset.menuTheme = theme.id;
        }

        // Legacy layered background elements, if a custom menu provides them
        const menuBackground = document.querySelector('.menu-background');
        if (menuBackground) {
            menuBackground.style.background = theme.background;
        }

        // Apply gradient overlay
        const gradientOverlay = document.querySelector('.menu-gradient-overlay');
        if (gradientOverlay) {
            gradientOverlay.style.background = theme.gradient;
        }

        // Apply grid pattern
        const gridPattern = document.querySelector('.menu-grid-pattern');
        if (gridPattern) {
            gridPattern.style.backgroundImage = theme.pattern;
        }

        // Store theme preference
        this.saveTheme(theme.id);

        // Dispatch event for particle system to update colors
        window.dispatchEvent(new CustomEvent('menuThemeChanged', {
            detail: { theme, colors: theme.particleColors }
        }));
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        this.ensureThemes();
        return this.themes[this.currentTheme] || this.themes.starter;
    }

    /**
     * Get all unlocked themes
     */
    getUnlockedThemes() {
        this.ensureThemes();
        return Object.values(this.themes).filter(theme => theme.unlocked);
    }

    /**
     * Load theme from localStorage
     */
    loadTheme() {
        this.ensureThemes();
        try {
            const saved = localStorage.getItem('menuTheme');
            if (saved && this.themes[saved] && this.themes[saved].unlocked) {
                return saved;
            }
        } catch {
            // localStorage unavailable
        }
        return 'starter';
    }

    /**
     * Save theme to localStorage
     */
    saveTheme(themeId) {
        try {
            localStorage.setItem('menuTheme', themeId);
        } catch (error) {
            // Failed to save theme
        }
    }

    /**
     * Load unlocked themes from localStorage
     */
    loadUnlockedThemes() {
        try {
            this.ensureThemes();
            const saved = localStorage.getItem('unlockedMenuThemes');
            if (saved) {
                const unlocked = JSON.parse(saved);
                Object.keys(unlocked).forEach(themeId => {
                    if (this.themes && this.themes[themeId]) {
                        this.themes[themeId].unlocked = unlocked[themeId] === true;
                    }
                });
            }
        } catch (error) {
            // Failed to load unlocked themes
        }
    }

    /**
     * Save unlocked themes to localStorage
     */
    saveUnlockedThemes() {
        try {
            this.ensureThemes();
            const unlocked = {};
            Object.values(this.themes).forEach(theme => {
                unlocked[theme.id] = theme.unlocked;
            });
            localStorage.setItem('unlockedMenuThemes', JSON.stringify(unlocked));
        } catch (error) {
            // Failed to save unlocked themes
        }
    }

    /**
     * Initialize theme system
     */
    init() {
        this.loadUnlockedThemes();
        this.ensureThemes();
        // The constructor ran before saved unlocks were loaded, so a saved
        // unlocked theme was rejected there; re-read the preference now
        this.currentTheme = this.loadTheme();
        this.applyTheme();
    }

    /**
     * Update theme based on game state
     */
    updateFromGameState(gameState) {
        this.checkThemeUnlocks(gameState);
        const appropriateTheme = this.getThemeForGameState(gameState);
        if (appropriateTheme.id !== this.currentTheme) {
            this.applyTheme(appropriateTheme.id);
        }
    }
}

// Auto-selection order, most prestigious first. Every theme is listed so
// none can be unlocked but never shown.
MenuThemeSystem.THEME_PRIORITY = ['executive', 'minimalist', 'corporate', 'dataViz', 'starter'];
