/**
 * UIManager.js
 * Manages UI components and their lifecycle
 * Phase 2: Code Reduction - Using Lit instead of DOM manipulation
 */

import { html } from 'lit';
import { TopBar } from './TopBar.js';
import { RankProgressBar } from './RankProgressBar.js';

export class UIManager {
    constructor() {
        this.topBar = null;
        this.rankProgressBar = null;
    }

    initialize() {
        const topBarContainer = document.getElementById('top-bar-container');
        const rankProgressBarContainer = document.getElementById('rank-progress-bar-container');

        if (topBarContainer) {
            this.topBar = new TopBar();
            topBarContainer.appendChild(this.topBar);
        }

        if (rankProgressBarContainer) {
            this.rankProgressBar = new RankProgressBar();
            rankProgressBarContainer.appendChild(this.rankProgressBar);
        }
    }

    updateTopBar(data) {
        if (this.topBar) {
            this.topBar.update(data);
        } else {
            this.updateLegacyTopBar(data);
        }
    }

    updateRankProgressBar(data) {
        if (this.rankProgressBar) {
            this.rankProgressBar.update(data);
        } else {
            this.updateLegacyRankProgressBar(data);
        }
    }

    updateLegacyTopBar(data) {
        const topBarContainer = document.getElementById('top-bar-container');
        if (topBarContainer) {
            topBarContainer.innerHTML = html`
                <div class="top-bar">
                    <span class="user-name">${data.userName}</span>
                    <span class="score">${data.score}</span>
                </div>
            `;
        }
    }

    updateLegacyRankProgressBar(data) {
        const rankProgressBarContainer = document.getElementById('rank-progress-bar-container');
        if (rankProgressBarContainer) {
            rankProgressBarContainer.innerHTML = html`
                <div class="rank-progress-bar">
                    <div class="progress" style="width: ${data.progress}%;"></div>
                </div>
            `;
        }
    }
}