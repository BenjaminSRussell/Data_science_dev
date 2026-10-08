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

        // Screen-reader announcement of each navigation, driven by the
        // screenchange event this class dispatches (#1363, #133)
        if (!this._onScreenChange) {
            this._onScreenChange = (e) => this.announceScreen(e?.detail?.screen);
            window.addEventListener('screenchange', this._onScreenChange);
        }

    }

    /**
     * Human-readable name for a screen: aria-label, else its first heading,
     * else the id without the "screen-" prefix.
     */
    getScreenLabel(screenId) {
        const el = this.screens[screenId] || (typeof document !== 'undefined' ? document.getElementById(screenId) : null);
        const label = el?.getAttribute?.('aria-label') || el?.querySelector?.('h1, h2, h3')?.textContent;
        if (label && label.trim()) return label.trim();
        return String(screenId || '').replace(/^screen-/, '').replace(/[-_]+/g, ' ').trim();
    }

    /**
     * Write the screen name into a polite live region so assistive tech hears
     * where navigation went. The region is created on first use.
     * @returns {HTMLElement|null} the live region
     */
    announceScreen(screenId) {
        if (!screenId || typeof document === 'undefined' || !document.body) return null;
        let region = document.getElementById('screen-announcer');
        if (!region) {
            region = document.createElement('div');
            region.id = 'screen-announcer';
            region.className = 'visually-hidden';
            region.setAttribute('role', 'status');
            region.setAttribute('aria-live', 'polite');
            document.body.appendChild(region);
        }
        region.textContent = this.getScreenLabel(screenId);
        return region;
    }

    /**
     * Put keyboard focus on a sensible element of a screen: its first heading,
     * else its first enabled control, else the screen container itself (made
     * programmatically focusable). Focus inside the screen is left alone.
     * @param {HTMLElement} screen
     * @returns {HTMLElement|null} the element that received focus
     */
    focusScreen(screen) {
        if (!screen || typeof screen.focus !== 'function') return null;
        if (typeof document !== 'undefined' && screen.contains(document.activeElement) && document.activeElement !== screen) {
            return document.activeElement;
        }
        const heading = screen.querySelector('h1, h2, h3');
        const control = screen.querySelector(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        let target = heading || control || screen;
        if (target === heading || target === screen) {
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        }
        try {
            target.focus({ preventScroll: true });
        } catch {
            target.focus();
        }
        return target;
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
            return false;
        }

        // A modal belongs to the screen it was opened on; leaving the screen
        // closes it instead of leaving it floating over the next one (#2146)
        const modal = typeof document !== 'undefined' ? document.getElementById('modal-container') : null;
        if (modal && !modal.classList.contains('hidden') && screenId !== this.currentScreen) {
            if (typeof this.mainGame?.closeModal === 'function') this.mainGame.closeModal();
            else modal.classList.add('hidden');
        }

        // Already showing this screen: don't replay the exit/entrance animation (#1361)
        if (this.currentScreen === screenId && targetScreen.classList.contains('active')) {
            return true;
        }

        // Apply the screen theme. A missing theme manager is a wiring bug
        // (e.g. a load path that skipped it), so say so instead of failing silently (#1573)
        const themeManager = this.mainGame?.gameState?.screenThemeManager;
        if (themeManager) {
            themeManager.applyTheme(screenId);
        } else if (this.mainGame?.gameState) {
            console.warn(`[ScreenManager] screenThemeManager missing, skipping theme for ${screenId}`);
        }

        // Transitions are CSS-only: `.screen.active` runs the fadeIn keyframe
        // (main.css). The old GSAP branch called animator methods that never
        // existed on an animator that was never created (#2295, #1087, #1362).

        // Hide current screen
        if (this.currentScreen && this.screens[this.currentScreen]) {
            const currentScreenEl = this.screens[this.currentScreen];
            currentScreenEl.classList.remove('active');
            currentScreenEl.classList.add('hidden');
        }

        // Show top bar for game screens, hide for menu
        const topBar = document.getElementById('top-bar');
        if (topBar) {
            topBar.style.display = screenId === 'screen-menu' ? 'none' : 'flex';
        }

        // Show target screen
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active');

        // Force display in case CSS is overriding
        if (window.getComputedStyle(targetScreen).display === 'none') {
            targetScreen.style.display = 'block';
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



        // Move keyboard focus into the newly shown screen; the control that had
        // focus was just hidden, which would otherwise drop focus to <body> (#133)
        this.focusScreen(targetScreen);

        // Announce the navigation; init() listens for this to update the live region (#1363)
        window.dispatchEvent(new CustomEvent('screenchange', {
            detail: { screen: screenId }
        }));

        // Initialize map renderer when map screen is shown
        if (screenId === 'screen-map' && this.mainGame) {
            // Small delay to ensure DOM is ready and screen is visible
            setTimeout(() => {
                // The player may have left the map within the delay (#1089)
                if (this.currentScreen !== 'screen-map') return;
                if (this.mainGame.updateMapScreen) {
                    this.mainGame.updateMapScreen();
                }
                // Resize an existing map now; a map created by the call above
                // is still loading and resizes itself once ready (#2147)
                this.mainGame.unifiedMapSystem?.handleResize?.();
            }, 100);
        }
        return true;
    }

    /**
     * Go back to previous screen
     */
    /**
     * Hide whatever screen is showing without opening another, e.g. when a
     * full-screen flow like the intro takes over (#1360)
     */
    hideCurrentScreen() {
        const el = this.currentScreen && this.screens[this.currentScreen];
        if (el) {
            el.classList.remove('active');
            el.classList.add('hidden');
        }
        this.currentScreen = null;
    }

    /**
     * Go back to the previous screen. Returns whether navigation happened; if
     * the previous screen can't be shown, history is left as it was instead of
     * losing an entry (#1359)
     */
    goBack() {
        if (this.history.length === 0) return false;
        const previousScreen = this.history.pop();
        const ok = this.showScreen(previousScreen, false) !== false;
        if (!ok) this.history.push(previousScreen);
        return ok;
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
