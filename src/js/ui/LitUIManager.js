import { html, render } from 'lit';
import { BaseUIManager } from './BaseUIManager.js';

export class LitUIManager extends BaseUIManager {
    constructor(gameStore, game) {
        super(gameStore, game);
        this.components = new Map();
    }

    updateTopBar() {
        const gameState = this.game.gameState;
        const topBar = this.components.get('topBar');

        if (topBar) {
            topBar.updateFromGameState(gameState);
        } else {
            this.updateTopBarFallback(gameState);
        }
    }

    updateTopBarFallback(gameState) {
        const moneyElement = document.getElementById('money');
        const reputationElement = document.getElementById('reputation');
        const rankElement = document.getElementById('rank');

        if (moneyElement) {
            moneyElement.textContent = `Money: ${gameState.money}`;
        }

        if (reputationElement) {
            reputationElement.textContent = `Reputation: ${gameState.reputation}`;
        }

        if (rankElement) {
            rankElement.textContent = `Rank: ${gameState.currentRank?.title || 'None'}`;
        }
    }

    updateRankProgress() {
        const gameState = this.game.gameState;
        const rankProgress = this.components.get('rankProgress');

        if (rankProgress) {
            rankProgress.updateFromGameState(gameState);
        } else {
            this.updateRankProgressFallback(gameState);
        }
    }

    updateRankProgressFallback(gameState) {
        const rankProgressElement = document.getElementById('rankProgress');
        const nextRankEl = document.getElementById('nextRank');

        if (rankProgressElement) {
            rankProgressElement.textContent = `Progress: ${gameState.rankProgress}%`;
        }

        if (nextRankEl) {
            if (gameState.nextRank) {
                nextRankEl.textContent = `Next: ${gameState.nextRank.title}`;
            } else {
                nextRankEl.textContent = 'Max Rank Achieved!';
            }
        }
    }
}