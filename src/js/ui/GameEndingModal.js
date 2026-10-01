/**
 * GameEndingModal.js
 * Handles the game ending modal display and user interactions
 */

/**
 * Shows the game ending modal with player stats and options
 * This method is extracted for independent testing and reusability
 * @param {Object} endingData - Object with title and message properties
 * @param {string} endingData.title - The ending title (fallback: 'Victory!')
 * @param {string} endingData.message - The ending message (fallback: 'Congratulations on completing your journey!')
 */
export function createGameEndingModal(endingData, context) {
    if (!endingData) return;

    // Create ending modal
    const modal = document.createElement('div');
    modal.id = 'game-ending-modal';
    modal.className = 'modal active';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: 'Arial', sans-serif;
    `;

    const stats = context.gameState.gameEndingSystem?.getEndingStats() || {};

    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px; border-radius: 20px; max-width: 600px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <h1 style="font-size: 48px; margin: 0 0 20px 0; color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);">
                ${endingData.title || 'Victory!'}
            </h1>
            <p style="font-size: 20px; margin: 0 0 30px 0; color: #e2e8f0;">
                ${endingData.message || 'Congratulations on completing your journey!'}
            </p>
            <div style="background: rgba(15, 23, 42, 0.8); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
                <h3 style="margin-top: 0; color: #fbbf24;">Career Statistics</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                    <div><strong>Final Rank:</strong> ${stats.rankTitle || 'Unknown'}</div>
                    <div><strong>Days Played:</strong> ${stats.days || 0}</div>
                    <div><strong>Total Money:</strong> $${(stats.money || 0).toLocaleString()}</div>
                    <div><strong>Reputation:</strong> ${stats.reputation || 0}</div>
                    <div><strong>Tasks Completed:</strong> ${stats.tasksCompleted || 0}</div>
                    <div><strong>Perfect Scores:</strong> ${stats.perfectScores || 0}</div>
                    <div><strong>Contracts:</strong> ${stats.contractsCompleted || 0}</div>
                    <div><strong>Projects:</strong> ${stats.projectsCompleted || 0}</div>
                </div>
            </div>
            <div style="margin-top: 30px;">
                <button id="btn-ending-new-game" style="
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 18px;
                    border-radius: 10px;
                    cursor: pointer;
                    margin: 0 10px;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                ">New Game</button>
                <button id="btn-ending-continue" style="
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 18px;
                    border-radius: 10px;
                    cursor: pointer;
                    margin: 0 10px;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                ">Continue Playing</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Button handlers
    document.getElementById('btn-ending-new-game').onclick = () => {
        if (confirm('Start a new game? Your current progress will be lost.')) {
            context.startNewGame();
            modal.remove();
        }
    };

    document.getElementById('btn-ending-continue').onclick = () => {
        modal.remove();
        // Allow player to continue playing even after ending
    };

    // Play victory sound
    if (context.audioManager?.play) {
        context.audioManager.play('kaching');
    }
}
