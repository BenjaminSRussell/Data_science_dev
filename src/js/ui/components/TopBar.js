/**
 * TopBar.js
 * Top bar component showing money, reputation, rank
 * Phase 2: Replaces DOM manipulation in UIUpdater
 */

import { BaseComponent } from './BaseComponent.js';
import { html, css } from 'lit';

export class TopBar extends BaseComponent {
    static properties = {
        money: { type: Number },
        reputation: { type: Number },
        rank: { type: String }
    };

    static styles = css`
        :host {
            display: flex;
            align-items: center;
            gap: 24px;
            padding: 12px 24px;
            background: rgba(0, 0, 0, 0.1);
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .stat-label {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
        }

        .stat-value {
            font-size: 16px;
            font-weight: 700;
            color: #fff;
        }

        .money-value {
            color: #10b981;
        }

        .reputation-value {
            color: #3b82f6;
        }

        .rank-value {
            color: #f59e0b;
        }
    `;

    constructor() {
        super();
        this.money = 0;
        this.reputation = 0;
        this.rank = '';
    }

    render() {
        return html`
            <div class="stat-item">
                <span class="stat-label">Money:</span>
                <span class="stat-value money-value">${this.formatMoney(this.money)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Reputation:</span>
                <span class="stat-value reputation-value">${this.formatNumber(this.reputation)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Rank:</span>
                <span class="stat-value rank-value">${this.rank || 'None'}</span>
            </div>
        `;
    }

    /**
     * Update from game state
     */
    updateFromGameState(gameState) {
        if (!gameState) return;
        this.money = gameState.money ?? 0;
        this.reputation = gameState.reputation ?? 0;
        this.rank = gameState.currentRank?.title || '';
    }
}

customElements.define('top-bar', TopBar);
