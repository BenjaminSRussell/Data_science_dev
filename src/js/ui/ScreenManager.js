/**
 * ScreenManager - Handles screen transitions and navigation
 */

const MAX_HISTORY = 20;

// Screens a jailed player may still reach (the jail itself and the main menu)
const JAIL_ALLOWED_SCREENS = new Set(['screen-jail', 'screen-menu']);

export class ScreenManager {
    constructor(mainGame) {
        this.mainGame = mainGame;
        this.currentScreen = 'screen-menu';
        this.screens = {};
        this.history = [];
    }

    /**
     * Initialize screen manager
     */
    init() {
        // Cache all screen elements
        document.querySelectorAll('.screen').forEach(screen => {
            this.screens[screen.id] = screen;
        });


    }

    /**
     * Show a specific screen
     */
    showScreen(screenId, addToHistory = true) {
        // While serving a sentence the top-bar nav must not let the player walk
        // out of jail (#2145)
        const jailSentence = this.mainGame?.gameState?.jailSentence || 0;
        if (jailSentence > 0 && this.currentScreen === 'screen-jail' && !JAIL_ALLOWED_SCREENS.has(screenId)) {
            this.mainGame?.showToast?.(`You're in jail for ${jailSentence} more day${jailSentence === 1 ? '' : 's'}. Serve your time or bribe the guard.`, 'error');
            return false;
        }

        let targetScreen = this.screens[screenId];

        if (!targetScreen) {
            // Try to re-query the DOM for the screen in case it was added after init()
            // This self-heals timing bugs like screen-story caching issue
            const screenElement = document.getElementById(screenId);
            if (screenElement && screenElement.classList.contains('screen')) {
                targetScreen = screenElement;
                this.screens[screenId] = targetScreen; // Cache it for next time
            }
        }

        if (!targetScreen) {
            console.error(`Screen not found: ${screenId}`);
            // Display visible error state to player using the existing toast pattern
            // (reuses .toast.error CSS with proper z-index: var(--z-toast)=300)
            if (this.mainGame && this.mainGame.showToast) {
                this.mainGame.showToast('Screen could not be loaded. Please try again or refresh the page.', 'error');
            }
            return;
        }

        // Already showing this screen: don't replay the exit/entrance animation (#1361)
        if (this.currentScreen === screenId && targetScreen.classList.contains('active')) {
            return true;
        }

        // Apply screen theme if theme manager exists
        if (this.mainGame?.gameState?.screenThemeManager) {
            this.mainGame.gameState.screenThemeManager?.applyTheme(screenId);
        }

        // Phase 3: Use GSAP for smooth screen transitions
        const gsapAnimator = this.mainGame?.gsapAnimator || this.mainGame?.gameState?.gsapAnimator;

        // Hide current screen with animation
        if (this.currentScreen && this.screens[this.currentScreen]) {
            const currentScreenEl = this.screens[this.currentScreen];
            if (gsapAnimator) {
                gsapAnimator.animateExit(currentScreenEl, 'fade', {
                    duration: 0.2,
                    onComplete: () => {
                        currentScreenEl.classList.remove('active');
                        currentScreenEl.classList.add('hidden');
                    }
                });
            } else {
                currentScreenEl.classList.remove('active');
                currentScreenEl.classList.add('hidden');
            }
        }

        // Show top bar for game screens, hide for menu
        const topBar = document.getElementById('top-bar');
        if (topBar) {
            if (screenId === 'screen-menu') {
                if (gsapAnimator) {
                    gsapAnimator.fadeOut(topBar, { duration: 0.2 });
                } else {
                    topBar.style.display = 'none';
                }
            } else {
                if (gsapAnimator) {
                    gsapAnimator.fadeIn(topBar, { duration: 0.2 });
                } else {
                    topBar.style.display = 'flex';
                }
            }
        }

        // Show target screen with animation
        if (gsapAnimator) {
            targetScreen.classList.remove('hidden');
            gsapAnimator.animateEntrance(targetScreen, 'fade', {
                duration: 0.3,
                onComplete: () => {
                    targetScreen.classList.add('active');
                }
            });
        } else {
            targetScreen.classList.remove('hidden');
            targetScreen.classList.add('active');

            // Force display in case CSS is overriding
            const computedDisplay = window.getComputedStyle(targetScreen).display;
            if (computedDisplay === 'none') {
                targetScreen.style.display = 'block';
            }
        }

        // Track history (bounded, and cleared when returning to the menu) (#1088)
        if (screenId === 'screen-menu') {
            this.history = [];
        } else if (addToHistory && this.currentScreen !== screenId) {
            this.history.push(this.currentScreen);
            if (this.history.length > MAX_HISTORY) {
                this.history.splice(0, this.history.length - MAX_HISTORY);
            }
        }

        this.currentScreen = screenId;



        // Dispatch event
        window.dispatchEvent(new CustomEvent('screenchange', {
            detail: { screen: screenId }
        }));

        // Initialize map renderer when map screen is shown
        if (screenId === 'screen-map' && this.mainGame) {
            // Small delay to ensure DOM is ready and screen is visible
            setTimeout(() => {
                if (this.mainGame.updateMapScreen) {
                    this.mainGame.updateMapScreen();
                }
                // Also trigger resize to ensure map gets correct dimensions
                if (this.mainGame.unifiedMapSystem && this.mainGame.unifiedMapSystem.handleResize) {
                    this.mainGame.unifiedMapSystem.handleResize();
                }
            }, 100);
        }
    }

    /**
     * Go back to previous screen
     */
    goBack() {
        if (this.history.length > 0) {
            const previousScreen = this.history.pop();
            this.showScreen(previousScreen, false);
        }
    }

    /**
     * Get current screen ID
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * Check if a screen is currently active
     */
    isScreenActive(screenId) {
        return this.currentScreen === screenId;
    }
}
