/**
 * LitUIManager.js
 * UI Manager using Lit components instead of DOM manipulation
 * Phase 2: Replaces UIUpdater's direct DOM manipulation
 */

import { TopBar } from './components/TopBar.js';
import { ProgressBar } from './components/ProgressBar.js';
import { Button } from './components/Button.js';
import { LocationViewComponent } from './components/LocationViewComponent.js';

export class LitUIManager {
    constructor(game) {
        this.game = game;
        this.components = new Map();
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
        }

        // Initialize ProgressBar for rank if element exists
        const rankProgressEl = document.getElementById('rank-progress-container');
        if (rankProgressEl && !this.components.has('rankProgress')) {
            const progressBar = document.createElement('progress-bar');
            progressBar.showValue = true;
            rankProgressEl.appendChild(progressBar);
            this.components.set('rankProgress', progressBar);
        }
    }

    /**
     * Update top bar
     * Phase 4: Uses Zustand store
     */
    updateTopBar() {
        const topBar = this.components.get('topBar');
        // Phase 4: Get state from Zustand store
        const gameStore = this.game?.gameStore || (typeof useGameStore !== 'undefined' ? useGameStore : null);
        
        if (topBar && gameStore) {
            const state = gameStore.getState();
            // Create a compatible object for updateFromGameState
            const gameStateCompat = {
                money: state.money,
                reputation: state.reputation,
                currentRank: state.currentRank
            };
            topBar.updateFromGameState(gameStateCompat);
        } else if (topBar && this.game?.gameState) {
            // Fallback to GameState
            topBar.updateFromGameState(this.game.gameState);
        } else {
            // Fallback to old method if component not available
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
     * Create button using Lit component
     */
    createButton(label, icon, variant, onclick) {
        const button = document.createElement('game-button');
        button.label = label;
        button.icon = icon || '';
        button.variant = variant || 'primary';
        button.onclick = onclick;
        return button;
    }

    /**
     * Update location view using Lit component
     */
    updateLocationView(locationId, locationDetails, backgroundImage, timeOfDay) {
        let locationView = this.components.get('locationView');
        
        if (!locationView) {
            const container = document.getElementById('location-view') || 
                            document.getElementById('location-view-container');
            if (!container) return;
            
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
