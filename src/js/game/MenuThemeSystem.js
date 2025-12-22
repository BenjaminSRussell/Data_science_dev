/**
 * MenuThemeSystem - Manages background themes for the main menu
 * Themes unlock based on player progression and reflect current game state
 * Version: 2.0 - Fixed initialization issues
 */

export class MenuThemeSystem {
    constructor() {
        // Initialize themes FIRST, before any other operations
        this.themes = null;
        this.currentTheme = 'starter';
        
        try {
            // Force initialization of themes
            this.themes = this.initializeThemes();
            
            // Verify themes were initialized correctly
            if (!this.themes || typeof this.themes !== 'object') {
                this.themes = this.initializeThemes();
            }
            
            // Verify starter theme exists
            if (!this.themes || typeof this.themes !== 'object' || !this.themes.starter) {
                // Create fallback themes object
                this.themes = {
                    starter: {
                        id: 'starter',
                        name: 'Starter',
                        unlocked: true,
                        particleColors: ['rgba(139, 92, 246, 0.6)', 'rgba(167, 139, 250, 0.4)'],
                        gradient: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
                        pattern: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
                        background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)'
                    }
                };
            }
            
            // Now that themes are guaranteed to exist, load theme preference
            this.currentTheme = this.loadTheme();
        } catch (error) {
            // Fallback initialization on error
            // Fallback initialization - ensure themes always exist
            if (!this.themes || typeof this.themes !== 'object' || !this.themes.starter) {
                this.themes = {
                    starter: {
                        id: 'starter',
                        name: 'Starter',
                        unlocked: true,
                        particleColors: ['rgba(139, 92, 246, 0.6)', 'rgba(167, 139, 250, 0.4)'],
                        gradient: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
                        pattern: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
                        background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)'
                    }
                };
            }
            this.currentTheme = 'starter';
        }
        
        // Final safety check - themes MUST exist at this point
        if (!this.themes || typeof this.themes !== 'object' || !this.themes.starter) {
            this.themes = {
                starter: {
                    id: 'starter',
                    name: 'Starter',
                    unlocked: true,
                    particleColors: ['rgba(139, 92, 246, 0.6)', 'rgba(167, 139, 250, 0.4)'],
                    gradient: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
                    pattern: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
                    background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)'
                }
            };
            this.currentTheme = 'starter';
        }
    }

    /**
     * Initialize all available themes
     */
    initializeThemes() {
        try {
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
        } catch (error) {
            // Error initializing themes, return fallback
            // Return minimal fallback themes object
            return {
                starter: {
                    id: 'starter',
                    name: 'Starter',
                    unlocked: true,
                    particleColors: ['rgba(139, 92, 246, 0.6)', 'rgba(167, 139, 250, 0.4)'],
                    gradient: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
                    pattern: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
                    background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)'
                }
            };
        }
    }

    /**
     * Check theme unlock status based on game state
     */
    checkThemeUnlocks(gameState) {
        if (!gameState) return;
        if (!this.themes || typeof this.themes !== 'object') {
            this.themes = this.initializeThemes();
        }

        Object.values(this.themes).forEach(theme => {
            if (theme.unlocked || !theme.unlockRequirement) return;

            const req = theme.unlockRequirement;
            let unlocked = true;

            if (req.rankIndex !== undefined) {
                unlocked = unlocked && (gameState.rankIndex >= req.rankIndex);
            }
            if (req.tasksCompleted !== undefined) {
                unlocked = unlocked && ((gameState.tasksCompleted || 0) >= req.tasksCompleted);
            }
            if (req.reputation !== undefined) {
                unlocked = unlocked && ((gameState.reputation || 0) >= req.reputation);
            }
            if (req.money !== undefined) {
                unlocked = unlocked && ((gameState.money || 0) >= req.money);
            }

            if (unlocked && !theme.unlocked) {
                theme.unlocked = true;
                this.saveUnlockedThemes();
            }
        });
    }

    /**
     * Get theme based on current game state
     */
    getThemeForGameState(gameState) {
        if (!this.themes || typeof this.themes !== 'object' || !this.themes.starter) {
            this.themes = this.initializeThemes();
        }
        if (!gameState) return this.themes.starter;

        // Check for highest unlocked theme based on rank
        const rankThemes = ['starter', 'corporate', 'executive'];
        let selectedTheme = this.themes.starter;

        for (let i = rankThemes.length - 1; i >= 0; i--) {
            const themeId = rankThemes[i];
            const theme = this.themes[themeId];
            if (theme.unlocked) {
                const req = theme.unlockRequirement;
                if (!req || (req.rankIndex !== undefined && gameState.rankIndex >= req.rankIndex)) {
                    selectedTheme = theme;
                    break;
                }
            }
        }

        return selectedTheme;
    }

    /**
     * Apply theme to menu
     */
    applyTheme(themeId = null) {
        if (!this.themes || typeof this.themes !== 'object' || !this.themes.starter) {
            this.themes = this.initializeThemes();
        }
        let theme = themeId ? this.themes[themeId] : this.themes[this.currentTheme];
        if (!theme || !theme.unlocked) {
            theme = this.themes.starter; // Fallback to starter
        }

        this.currentTheme = theme.id;

        // Apply background gradient
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
        if (!this.themes || typeof this.themes !== 'object' || !this.themes.starter) {
            this.themes = this.initializeThemes();
        }
        return this.themes[this.currentTheme] || this.themes.starter;
    }

    /**
     * Get all unlocked themes
     */
    getUnlockedThemes() {
        if (!this.themes || typeof this.themes !== 'object') {
            this.themes = this.initializeThemes();
        }
        return Object.values(this.themes).filter(theme => theme.unlocked);
    }

    /**
     * Load theme from localStorage
     */
    loadTheme() {
        try {
            // Ensure themes are initialized - be very defensive
            if (!this.themes || typeof this.themes !== 'object') {
                this.themes = this.initializeThemes();
            }
            
            // Double-check themes exist and have starter theme - use separate checks to avoid errors
            if (!this.themes || typeof this.themes !== 'object') {
                this.themes = this.initializeThemes();
            }
            if (this.themes && typeof this.themes === 'object' && !this.themes.starter) {
                this.themes = this.initializeThemes();
            }
            
            // Final safety check - if themes still don't exist, something is very wrong
            if (!this.themes || (typeof this.themes === 'object' && !this.themes.starter)) {
                // Failed to initialize themes, using fallback
                // Create a minimal fallback theme
                this.themes = {
                    starter: {
                        id: 'starter',
                        name: 'Starter',
                        unlocked: true,
                        particleColors: ['rgba(139, 92, 246, 0.6)', 'rgba(167, 139, 250, 0.4)'],
                        gradient: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
                        pattern: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
                        background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)'
                    }
                };
            }
            
            const saved = localStorage.getItem('menuTheme');
            if (saved && this.themes && this.themes[saved] && this.themes[saved].unlocked) {
                return saved;
            }
        } catch (error) {
            // Failed to load theme, using default
            // Ensure themes exist even on error
            try {
                if (!this.themes || typeof this.themes !== 'object') {
                    this.themes = this.initializeThemes();
                }
                if (this.themes && typeof this.themes === 'object' && !this.themes.starter) {
                    this.themes = this.initializeThemes();
                }
            } catch (initError) {
                // Failed to initialize themes in error handler
                // Last resort fallback
                this.themes = {
                    starter: {
                        id: 'starter',
                        name: 'Starter',
                        unlocked: true,
                        particleColors: ['rgba(139, 92, 246, 0.6)', 'rgba(167, 139, 250, 0.4)'],
                        gradient: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
                        pattern: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
                        background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)'
                    }
                };
            }
        }
        // Always return a valid theme ID
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
            if (!this.themes || typeof this.themes !== 'object') {
                this.themes = this.initializeThemes();
            }
            const saved = localStorage.getItem('unlockedMenuThemes');
            if (saved) {
                const unlocked = JSON.parse(saved);
                Object.keys(unlocked).forEach(themeId => {
                    if (this.themes && this.themes[themeId]) {
                        this.themes[themeId].unlocked = unlocked[themeId];
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
            if (!this.themes || typeof this.themes !== 'object') {
                this.themes = this.initializeThemes();
            }
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

