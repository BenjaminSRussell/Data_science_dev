/**
 * ScreenManager.js
 * Manages screen navigation and state
 */

export class ScreenManager {
    constructor() {
        this.currentScreen = null;
        this.history = [];
        this.screens = {};
    }

    /**
     * Register a screen with the manager
     * @param {string} screenId - The ID of the screen
     * @param {Object} screen - The screen object
     */
    registerScreen(screenId, screen) {
        this.screens[screenId] = screen;
    }

    /**
     * Show a screen and optionally add it to the history
     * @param {string} screenId - The ID of the screen to show
     * @param {boolean} addToHistory - Whether to add this screen to the history
     */
    showScreen(screenId, addToHistory = true) {
        if (this.isScreenActive(screenId)) {
            console.warn(`Screen ${screenId} is already active.`);
            return;
        }

        if (this.currentScreen) {
            this.screens[this.currentScreen].onHide();
        }

        this.currentScreen = screenId;
        this.screens[this.currentScreen].onShow();

        if (addToHistory) {
            this.history.push(screenId);
        }
    }

    /**
     * Go back to the previous screen in the history
     */
    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // Remove current screen
            const previousScreen = this.history.pop();
            this.showScreen(previousScreen, false);
        }
    }

    /**
     * Get the current screen ID
     * @returns {string|null} - The ID of the current screen or null if none
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * Check if a screen is currently active
     * @param {string} screenId - The ID of the screen to check
     * @returns {boolean} - True if the screen is active, false otherwise
     */
    isScreenActive(screenId) {
        return this.currentScreen === screenId;
    }
}