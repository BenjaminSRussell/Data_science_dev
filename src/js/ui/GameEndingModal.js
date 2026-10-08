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
/** "-$500" rather than "$-500" (#1510) */
export function formatEndingMoney(amount) {
    const n = Number(amount) || 0;
    return `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString()}`;
}

const SKILL_LABELS = {
    technical: 'Technical', social: 'Social', creativity: 'Creativity',
    stamina: 'Stamina', business: 'Business', research: 'Research'
};

function statCell(label, value) {
    return `<div><strong>${label}:</strong> ${value}</div>`;
}

/**
 * Every stat getEndingStats() computes, not just 8 of them (#1509)
 */
export function buildEndingStatsHTML(stats = {}) {
    const rel = Object.values(stats.relationships || {});
    const avgRel = rel.length ? Math.round(rel.reduce((a, b) => a + b, 0) / rel.length) : 0;
    const rating = Number(stats.averageRating) || 0;
    const skills = Object.entries(stats.skills || {})
        .map(([id, v]) => statCell(SKILL_LABELS[id] || id, v))
        .join('');
    return `
        <div class="ending-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
            ${statCell('Final Rank', stats.rankTitle || 'Unknown')}
            ${statCell('Days Played', stats.days || 0)}
            ${statCell('Hours Played', stats.hours || 0)}
            ${statCell('Money', formatEndingMoney(stats.money))}
            ${statCell('Total Earned', formatEndingMoney(stats.totalEarned))}
            ${statCell('Total Spent', formatEndingMoney(stats.totalSpent))}
            ${statCell('Reputation', stats.reputation || 0)}
            ${statCell('Ethics', stats.ethics || 0)}
            ${statCell('Tasks Completed', stats.tasksCompleted || 0)}
            ${statCell('Perfect Scores', stats.perfectScores || 0)}
            ${statCell('Average Rating', rating ? rating.toFixed(1) : '0')}
            ${statCell('Contracts', stats.contractsCompleted || 0)}
            ${statCell('Projects', stats.projectsCompleted || 0)}
            ${statCell('Courses', stats.coursesCompleted || 0)}
            ${statCell('People Met', rel.length)}
            ${statCell('Avg. Relationship', avgRel)}
        </div>
        ${skills ? `<h4 style="color: #fbbf24; margin: 16px 0 8px;">Skills</h4>
        <div class="ending-skills-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; font-size: 13px;">${skills}</div>` : ''}
    `;
}

export function createGameEndingModal(endingData, context) {
    if (!endingData) return;
    // Only one ending screen at a time
    document.getElementById('game-ending-modal')?.remove();

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

    // Reuse the stats captured when the ending fired (#1138)
    const endingSystem = context.gameState.gameEndingSystem;
    const stats = context.gameState.gameEnding?.stats || endingSystem?.getEndingStats?.() || {};
    const earned = endingSystem?.getEarnedEndings?.() || [];
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
        <div class="ending-content" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px; border-radius: 20px; max-width: 640px; max-height: 90vh; overflow-y: auto; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
            <h1 style="font-size: 48px; margin: 0 0 20px 0; color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);">
                ${endingData.title || 'Victory!'}
            </h1>
            <p style="font-size: 20px; margin: 0 0 30px 0; color: #e2e8f0;">
                ${endingData.message || 'Congratulations on completing your journey!'}
            </p>
            <div style="background: rgba(15, 23, 42, 0.8); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
                <h3 style="margin-top: 0; color: #fbbf24;">Career Statistics</h3>
                ${buildEndingStatsHTML(stats)}
            </div>
            <div class="ending-earned" style="text-align: left; font-size: 14px; color: #cbd5e1;">
                <strong>Endings earned (${earned.length}):</strong> ${earned.map(e => e.title).join(', ') || endingData.title}
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

    const onKeydown = (e) => {
        if (e.key === 'Escape') close();
    };
    const close = () => {
        document.removeEventListener('keydown', onKeydown);
        modal.remove();
    };

    // Button handlers
    modal.querySelector('#btn-ending-new-game').onclick = () => {
        if (confirm('Start a new game? Your current progress will be lost.')) {
            close();
            context.startNewGame();
        }
    };

    // Continue keeps playing; other endings can still be earned (#1136)
    modal.querySelector('#btn-ending-continue').onclick = () => {
        close();
        context.showToast?.('Keep going - there are more endings to earn. See them under Stats > Endings.', 'info');
    };

    // Dismiss like every other modal: backdrop click or Escape (#1511)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
    document.addEventListener('keydown', onKeydown);
    modal.querySelector('#btn-ending-continue').focus?.();

    // Play victory sound
    if (context.audioManager?.play) {
        context.audioManager.play('kaching');
    }
}
