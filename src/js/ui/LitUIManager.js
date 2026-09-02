/**
 * LitUIManager.js
 * Manages UI updates using Lit components
 * Phase 2: Replaces raw DOM manipulations with Lit components
 */

import { BaseComponent } from './components/BaseComponent.js';
import { html, css } from 'lit';

export class LitUIManager extends BaseComponent {
    static properties = {
        game: { type: Object, attribute: false }
    };

    static styles = css`
        :host {
            display: block;
        }
    `;

    constructor() {
        super();
        this.game = null;
        this.components = new Map();
    }

    /**
     * Update top bar with player stats
     */
    updateTopBar() {
        let topBar = this.components.get('topBar');
        
        if (!topBar) {
            const container = document.getElementById('top-bar') || 
                            document.getElementById('top-bar-container');
            if (!container) return;
            
            topBar = document.createElement('top-bar-component');
            topBar.game = this.game;
            container.appendChild(topBar);
            this.components.set('topBar', topBar);
        }

        topBar.updateStats(this.game?.player);
    }

    /**
     * Update rank progress and next rank information
     */
    updateRankProgress() {
        let rankProgress = this.components.get('rankProgress');
        
        if (!rankProgress) {
            const container = document.getElementById('rank-progress') || 
                            document.getElementById('rank-progress-container');
            if (!container) return;
            
            rankProgress = document.createElement('rank-progress-component');
            rankProgress.game = this.game;
            container.appendChild(rankProgress);
            this.components.set('rankProgress', rankProgress);
        }

        rankProgress.updateRankInfo(this.game?.gameState);
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