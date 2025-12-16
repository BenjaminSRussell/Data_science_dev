/**
 * ScreenManager - Handles screen transitions and navigation
 */

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

        console.log(`📺 Screen Manager initialized with ${Object.keys(this.screens).length} screens`);
    }

    /**
     * Show a specific screen
     */
    showScreen(screenId, addToHistory = true) {
        const targetScreen = this.screens[screenId];

        if (!targetScreen) {
            console.error(`Screen not found: ${screenId}`);
            return;
        }

        // Apply screen theme if theme manager exists
        if (this.mainGame?.gameState?.screenThemeManager) {
            this.mainGame.gameState.screenThemeManager.applyTheme(screenId);
        }

        // Hide current screen
        if (this.currentScreen && this.screens[this.currentScreen]) {
            this.screens[this.currentScreen].classList.remove('active');
        }

        // Show top bar for game screens, hide for menu
        const topBar = document.getElementById('top-bar');
        if (topBar) {
            if (screenId === 'screen-menu') {
                topBar.style.display = 'none';
            } else {
                topBar.style.display = 'flex';
            }
        }

        // Show target screen
        targetScreen.classList.add('active');

        // Track history
        if (addToHistory && this.currentScreen !== screenId) {
            this.history.push(this.currentScreen);
        }

        this.currentScreen = screenId;

        console.log(`📺 Showing screen: ${screenId}`);

        // Dispatch event
        window.dispatchEvent(new CustomEvent('screenchange', {
            detail: { screen: screenId }
        }));
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
