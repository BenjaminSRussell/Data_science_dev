/**
 * LitUIManager.js
 * UI Manager using Lit components instead of DOM manipulation
 * Phase 2: Replaces UIUpdater's direct DOM manipulation
 */

// Side-effect imports: each module registers its custom element
// (<top-bar>, <progress-bar>, <location-view-component>) (#1635)
import './components/TopBar.js';
import './components/ProgressBar.js';
import './components/LocationViewComponent.js';

export class LitUIManager {
    constructor(game) {
        this.game = game;
        this.components = new Map();
        // Guards to prevent console spam
        this.warnedAboutTopBarMount = false;
        this.warnedAboutRankProgressMount = false;
        this.warnedAboutTopBarFallback = false;
        this.warnedAboutRankProgressFallback = false;
        this.warnedAboutLocationViewContainer = false;
    }

    /**
     * Initialize Lit components
     */
    initialize() {
        // Initialize TopBar if element exists
        const topBarEl = document.getElementById('top-bar-container');
        if (topBarEl && !this.components.has('topBar')) {
            const topBar = document.createElement('top-bar');
            topBar.game = this.game;
            topBarEl.appendChild(topBar);
            this.components.set('topBar', topBar);
        } else if (!topBarEl && !this.warnedAboutTopBarMount) {
            console.warn('LitUIManager: #top-bar-container element not found, Lit TopBar component will not mount');
            this.warnedAboutTopBarMount = true;
        }

        // Initialize ProgressBar for rank if element exists
        const rankProgressEl = document.getElementById('rank-progress-container');
        if (rankProgressEl && !this.components.has('rankProgress')) {
            const progressBar = document.createElement('progress-bar');
            progressBar.showValue = true;
            rankProgressEl.appendChild(progressBar);
            this.components.set('rankProgress', progressBar);
        } else if (!rankProgressEl && !this.warnedAboutRankProgressMount) {
            console.warn('LitUIManager: #rank-progress-container element not found, Lit ProgressBar component will not mount');
            this.warnedAboutRankProgressMount = true;
        }
    }

    /**
     * Update top bar. GameState is the one live source: every gameplay
     * system writes money/reputation/rank there, while the Zustand store is
     * never written after startup (#134, #1616, #50).
     */
    updateTopBar() {
        const topBar = this.components.get('topBar');

        if (topBar && this.game?.gameState) {
            topBar.updateFromGameState(this.game.gameState);
        } else {
            // Fallback to old method if component not available
            if (!this.warnedAboutTopBarFallback) {
                console.warn('LitUIManager: TopBar component not available, falling back to DOM manipulation');
                this.warnedAboutTopBarFallback = true;
            }
            this.updateTopBarFallback();
        }
    }

    /**
     * Fallback to old DOM manipulation method
     */
    updateTopBarFallback() {
        const moneyEl = document.getElementById('money-value');
        const repEl = document.getElementById('reputation-value');
        const rankEl = document.getElementById('rank-value');

        if (moneyEl && this.game?.gameState) {
            moneyEl.textContent = `$${(this.game.gameState.money ?? 0).toLocaleString()}`;
        }

        if (repEl && this.game?.gameState) {
            repEl.textContent = (this.game.gameState.reputation ?? 0).toLocaleString();
        }

        if (rankEl && this.game?.gameState?.currentRank) {
            rankEl.textContent = this.game.gameState?.currentRank?.title || 'None';
        }
    }

    /**
     * Update rank progress
     */
    updateRankProgress() {
        const progressBar = this.components.get('rankProgress');
        if (progressBar && this.game?.gameState) {
            const gameState = this.game.gameState;
            progressBar.value = gameState.progressToNextRank || 0;
            progressBar.max = 100;
            progressBar.label = `Rank: ${gameState.currentRank?.title || 'None'}`;
        } else {
            // Fallback to old method
            if (!this.warnedAboutRankProgressFallback) {
                console.warn('LitUIManager: RankProgress component not available, falling back to DOM manipulation');
                this.warnedAboutRankProgressFallback = true;
            }
            this.updateRankProgressFallback();
        }
    }

    /**
     * Fallback to old DOM manipulation method
     */
    updateRankProgressFallback() {
        const currentRankEl = document.getElementById('current-rank');
        const progressEl = document.getElementById('rank-progress');
        const nextRankEl = document.querySelector('.next-rank');

        if (currentRankEl && this.game?.gameState) {
            currentRankEl.textContent = this.game.gameState.currentRank?.title || 'None';
        }

        if (progressEl && this.game?.gameState) {
            progressEl.style.width = `${this.game.gameState.progressToNextRank || 0}%`;
        }

        if (nextRankEl && this.game?.gameState) {
            if (this.game.gameState.nextRank) {
                nextRankEl.textContent = `Next: ${this.game.gameState?.nextRank?.title || 'None'}`;
            } else {
                nextRankEl.textContent = 'Max Rank Achieved!';
            }
        }
    }

    /**
     * Update location view using Lit component
     */
    updateLocationView(locationId, locationDetails, backgroundImage, timeOfDay) {
        let locationView = this.components.get('locationView');

        if (!locationView) {
            const container = document.getElementById('location-view') ||
                            document.getElementById('location-view-container');
            if (!container) {
                if (!this.warnedAboutLocationViewContainer) {
                    console.warn('LitUIManager: location view container element not found');
                    this.warnedAboutLocationViewContainer = true;
                }
                return;
            }

            locationView = document.createElement('location-view-component');
            locationView.game = this.game;
            container.appendChild(locationView);
            this.components.set('locationView', locationView);
        }

        locationView.updateLocation(locationId, locationDetails, backgroundImage, timeOfDay);
    }

    /**
     * Update all UI
     */
    updateAllUI() {
        this.updateTopBar();
        this.updateRankProgress();
        // Other updates can be added here
    }
}
