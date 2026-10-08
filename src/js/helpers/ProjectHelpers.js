/**
 * ProjectHelpers.js
 * Helper functions for project work, work sessions, and AI training
 */
import { OFFICES } from '../data/tycoonData.js';

/**
 * Price to move into each office tier, from the canonical OFFICES table (#1767)
 * @returns {number[]}
 */
export function getOfficePrices() {
    return OFFICES.map(o => o.price || 0);
}

/**
 * Handle abandoning the active project (#1113)
 */
export function handleCancelProject(game) {
    const ps = game.projectSystem;
    if (!ps?.activeProject) return;
    const title = ps.activeProject.title;
    const ok = typeof window === 'undefined' || typeof window.confirm !== 'function'
        ? true
        : window.confirm(`Abandon "${title}"? All progress on it will be lost.`);
    if (!ok) return;
    const result = ps.cancelProject();
    if (result?.success) {
        game.showToast(`Abandoned contract: ${title}`, 'warning');
        game.uiUpdater?.updateCareerScreen();
    }
}

/**
 * Handle starting a new project
 */
export function handleStartProject(game, contractId) {
    if (!game.projectSystem) return;

    const result = game.projectSystem.startProject(contractId);
    if (result.success) {
        game.showToast(`Accepted Contract: ${result.project.title}`, 'success');
        game.uiUpdater.updateCareerScreen();
    } else {
        game.showError(result.reason);
    }
}

/**
 * Handle working on a project
 */
export function handleWorkOnProject(game) {
    if (!game.projectSystem || !game.projectSystem.activeProject) return;

    const energyCost = 15;
    if (!game.timeManager?.hasEnergy(energyCost)) {
        game.showError("You are too exhausted to code. Go sleep!");
        return;
    }

    game.timeManager?.useEnergy(energyCost);
    startWorkingSession(game, 3);
}

/**
 * Start a working session with manual step control
 * No auto-progression - user must click to advance each step
 */
export function startWorkingSession(game, hours) {
    const overlay = document.getElementById('working-overlay');
    overlay.classList.remove('hidden');

    const ticksPerHour = 10;
    const totalTicks = hours * ticksPerHour;
    let currentTick = 0;

    // Store session state on game object
    game.workSession = {
        currentTick,
        totalTicks,
        hours,
        active: true
    };

    // Stop button
    document.getElementById('btn-stop-work').onclick = () => {
        game.workSession.active = false;
        finishWorkingSession(game, game.workSession.currentTick, totalTicks);
    };

    // Continue/Advance button - user must click to progress
    const advanceBtn = document.getElementById('btn-advance-work') || createAdvanceButton();
    advanceBtn.onclick = () => {
        if (!game.workSession.active) return;

        game.workSession.currentTick++;
        currentTick = game.workSession.currentTick;

        // Advance time: one time slot (3 in-game hours) per 3 hours of work.
        // handleTimeAdvance(0.1) used to advance a whole slot on every click.
        if (currentTick % (ticksPerHour * 3) === 0) {
            game.handleTimeAdvance(1);
        }

        // Add progress
        simulateWorkTick(game);

        // Update UI
        const pct = (currentTick / totalTicks) * 100;
        document.getElementById('work-progress-fill').style.width = `${pct}%`;
        document.getElementById('work-progress-text').textContent = `${Math.round(pct)}%`;

        const hoursPassed = Math.floor(currentTick / ticksPerHour);
        const minsPassed = Math.round((currentTick % ticksPerHour) * (60 / ticksPerHour));
        document.getElementById('work-time-passed').textContent = `${hoursPassed}h ${minsPassed}m`;

        // Random Events
        if (Math.random() < 0.02) {
            game.showToast("Bug found! Fixing...", "warning");
        }

        // A stage (or the whole project) finished on this tick: end the session.
        // The two checks are exclusive and null-safe once the project completes
        // and activeProject becomes null (#1768, #2040).
        if (game.workSession.active && game.projectSystem.lastResult) {
            game.workSession.active = false;
            finishWorkingSession(game, currentTick, totalTicks);
            return;
        }

        if (currentTick >= totalTicks && game.workSession.active) {
            game.workSession.active = false;
            finishWorkingSession(game, currentTick, totalTicks);
        }
    };

    // Initial UI update
    document.getElementById('work-progress-fill').style.width = '0%';
    document.getElementById('work-progress-text').textContent = '0%';
    document.getElementById('work-time-passed').textContent = '0h 0m';
}

/**
 * Create the advance work button if it doesn't exist
 */
function createAdvanceButton() {
    const overlay = document.getElementById('working-overlay');
    let btn = document.getElementById('btn-advance-work');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'btn-advance-work';
        btn.className = 'btn btn-primary btn-lg';
        btn.textContent = '⏭ Work (Click to Progress)';
        btn.style.marginTop = '1rem';
        const stopBtn = document.getElementById('btn-stop-work');
        if (stopBtn && stopBtn.parentNode) {
            stopBtn.parentNode.insertBefore(btn, stopBtn);
        }
    }
    return btn;
}

/**
 * Finish a working session
 */
export function finishWorkingSession(game, ticks, totalTicks) {
    // Clean up work session state
    if (game.workSession) {
        game.workSession.active = false;
    }
    document.getElementById('working-overlay').classList.add('hidden');

    game.uiUpdater.updateCareerScreen();
    game.uiUpdater.updateAllUI();

    const result = game.projectSystem.checkProgress?.();

    if (result && result.status === 'project_complete') {
        game.showToast(`PROJECT COMPLETE! Earned $${result.reward}`, 'success');
        game.audioManager.play('kaching');
        game.uiUpdater.updateCareerScreen();
    } else if (result && result.status === 'stage_complete') {
        game.showToast(`Stage Complete! Next: ${result.nextStage?.name || 'next stage'}`, 'info');
        game.uiUpdater.updateCareerScreen();
    }
}

/**
 * Simulate a work tick (add progress)
 */
export function simulateWorkTick(game) {
    let basePower = 5;
    if (game.characterStats) {
        basePower += (game.characterStats?.getStat('intelligence') || 0) * 0.5;
    }

    // Apply focus/stamina task-speed bonus
    const taskSpeedBonus = 1 + ((game.characterStats?.getTotalBonuses()?.taskSpeed || 0) / 100);
    let tickPower = basePower * 0.1 * taskSpeedBonus;
    game.projectSystem.workOnProject(tickPower);
}

/**
 * Handle training the AI system
 */
export function handleTrainAI(game) {
    if (!game.aiSystem) return;

    const energyCost = 20;
    const moneyCost = 50;

    if (!game.timeManager?.hasEnergy(energyCost)) {
        game.showError("Too tired to train AI!");
        return;
    }

    if (game.gameState.money < moneyCost) {
        game.showError("Need $50 for Cloud Compute!");
        return;
    }

    game.timeManager?.useEnergy(energyCost);
    game.gameState.money -= moneyCost;
    game.handleTimeAdvance(2);

    // Training consumes Data Points earned from completed projects (#1807);
    // with none banked, the cloud compute still runs on a small synthetic set.
    const banked = Math.max(0, game.aiSystem.dataPoints || 0);
    const used = Math.min(10, banked);
    game.aiSystem.dataPoints = banked - used;
    const result = game.aiSystem.train(used > 0 ? used : 2);

    const source = used > 0 ? `${used} Data Points` : 'synthetic data (complete projects to earn Data Points)';
    game.showToast(`Trained AI on ${source}! Gained ${result.xpGained} XP.`, 'success');
    // play() returns whether a sound was found, so the fallback works (#1234, #2250)
    game.audioManager.play('keyboard_typing') || game.audioManager.play('click');

    // train() already levels up; read its result instead of re-checking (#1765)
    if (result.leveledUp) {
        game.showToast(`AI LEVEL UP! Now Level ${game.aiSystem.level}`, 'success');
        game.audioManager.play('kaching');
    }

    game.updateOfficeScreen();
    game.uiUpdater.updateAllUI();
}

/**
 * Update office screen with AI and hardware info
 */
export function updateOfficeScreen(game) {
    // Update office badge
    // Names come from the canonical OFFICES table so they can't drift (#1767)
    const officeNames = OFFICES.map(o => o.name);
    const officeIcons = OFFICES.map(o => o.icon || '');
    const currentOffice = game.gameState.officeIndex || 0;

    const officeNameEl = document.getElementById('current-office-name');
    const officeIconEl = document.querySelector('.office-badge .office-icon');

    if (officeNameEl) officeNameEl.textContent = officeNames[currentOffice];
    if (officeIconEl) officeIconEl.textContent = officeIcons[currentOffice];

    // Update equipment levels
    if (game.uiUpdater && game.uiUpdater.updateOfficeEquipment) {
        game.uiUpdater.updateOfficeEquipment();
    }

    // Check layout visibility
    if (game.worldMap) {
        const locId = game.worldMap.currentLocation;
        game.uiUpdater?.updateLocationLayout?.(locId);
    }

    // Update upgrade button (the DOM id is btn-upgrade-office, #1329)
    const nextBtn = document.getElementById('btn-upgrade-office') || document.getElementById('upgrade-office');
    const officePrices = getOfficePrices();

    if (nextBtn) {
        nextBtn.onclick = () => game.handleUpgradeOffice();
        const nextOfficePrice = officePrices[currentOffice + 1];

        if (currentOffice >= officeNames.length - 1 || nextOfficePrice === undefined) {
            nextBtn.textContent = 'MAXED';
            nextBtn.disabled = true;
            const nextOfficeInfo = document.getElementById('next-office-info');
            if (nextOfficeInfo) nextOfficeInfo.classList.add('hidden');
        } else {
            nextBtn.textContent = `[ RENT: $${nextOfficePrice.toLocaleString()} ]`;
            nextBtn.disabled = game.gameState.money < nextOfficePrice;
        }
    }

    // AI System Update
    if (game.aiSystem) {
        const ai = game.aiSystem;
        const aiSection = document.querySelector('.ai-console-section');
        if (aiSection) aiSection.classList.remove('hidden');

        const aiNameEl = document.getElementById('ai-name');
        const aiLevelEl = document.getElementById('ai-level');
        const aiIntEl = document.getElementById('ai-stat-int');
        const aiSpdEl = document.getElementById('ai-stat-spd');
        const aiXpFillEl = document.getElementById('ai-xp-fill');

        if (aiNameEl) aiNameEl.textContent = ai.name;
        if (aiLevelEl) aiLevelEl.textContent = ai.level;
        if (aiIntEl) aiIntEl.textContent = ai.intelligence;
        if (aiSpdEl) aiSpdEl.textContent = ai.speed;

        if (aiXpFillEl) {
            const xpPct = ai.xpToNextLevel > 0 ? (ai.xp / ai.xpToNextLevel) * 100 : 0;
            aiXpFillEl.style.width = `${Math.max(0, Math.min(100, xpPct || 0))}%`;
        }

        const trainBtn = document.getElementById('btn-train-ai');
        if (trainBtn) {
            trainBtn.onclick = () => handleTrainAI(game);
        }
    }

    // Update next office info
    if (currentOffice < officeNames.length - 1) {
        const nextIconEl = document.getElementById('next-office-icon');
        const nextNameEl = document.getElementById('next-office-name');
        if (nextIconEl) nextIconEl.textContent = officeIcons[currentOffice + 1];
        if (nextNameEl) nextNameEl.textContent = officeNames[currentOffice + 1];
    }
}

/**
 * Ask for a new player name and show it on the Stats screen
 */
export function renamePlayer(game, promptFn = (msg, value) => window.prompt(msg, value)) {
    const current = game.gameState.playerName || '';
    const answer = promptFn('What should we call you?', current);
    if (answer === null || answer === undefined) return current;
    const name = typeof game.gameState.setPlayerName === 'function'
        ? game.gameState.setPlayerName(answer)
        : (game.gameState.playerName = String(answer).trim().slice(0, 24));
    const el = document.getElementById('stats-name');
    if (el) el.textContent = name || 'New Player';
    return name;
}

/**
 * Update stats screen
 */
export function updateStatsScreen(game) {
    if (!game.characterStats) return;

    const charName = game.gameState.playerName || 'New Player';
    const statsNameEl = document.getElementById('stats-name');
    if (statsNameEl) statsNameEl.textContent = charName;

    // Nothing ever wrote playerName; let the player set it here (#1295)
    const renameBtn = document.getElementById('btn-rename-player');
    if (renameBtn) renameBtn.onclick = () => renamePlayer(game);

    // Update stat bars
    game.characterStats?.getAllStats()?.forEach(stat => {
        const el = document.querySelector(`.stat-card[data-stat="${stat.id}"]`);
        if (el) {
            const valueEl = el.querySelector('.stat-value');
            const fillEl = el.querySelector('.stat-bar-fill');
            const xpEl = el.querySelector('.stat-xp');

            if (valueEl) valueEl.textContent = stat.value;
            if (fillEl) fillEl.style.width = `${stat.maxLevel > 0 ? Math.min(100, (stat.value / stat.maxLevel) * 100) : 0}%`;
            if (xpEl) xpEl.textContent = `XP: ${Math.floor(stat.xp)}/${stat.xpNeeded}`;
        }
    });

    // Calculate total level
    const totalLevel = game.characterStats?.getAllStats()?.reduce((sum, s) => sum + s.value, 0) || 0;
    const totalLevelEl = document.getElementById('total-level');
    if (totalLevelEl) totalLevelEl.textContent = totalLevel;

    // Endings earned this playthrough stay visible after the ending screen (#1139)
    const endingsEl = document.getElementById('stats-endings-list');
    if (endingsEl) {
        const earned = game.gameState.gameEndingSystem?.getEarnedEndings?.() || [];
        endingsEl.replaceChildren();
        if (!earned.length) {
            endingsEl.textContent = 'No endings earned yet.';
        } else {
            earned.forEach(e => {
                const item = document.createElement('div');
                item.className = 'ending-earned-item';
                item.textContent = e.day ? `${e.title} (day ${e.day})` : e.title;
                endingsEl.appendChild(item);
            });
        }
    }
}

/**
 * Check for character visual evolution
 */
export function checkForCharacterEvolution(game) {
    if (!game.gameState.characterStats?.checkEvolution) return;

    // Pass visualProgressionSystem to maintain synchronized state
    // This ensures CharacterStats.visualStage matches VisualProgressionSystem.currentTier
    const evolution = game.gameState.characterStats.checkEvolution(
        game.gameState.money,
        game.gameState.visualProgressionSystem
    );
    if (evolution?.evolved) {
        game.showToast?.(`Character Evolved: ${String(evolution.stage).replace(/_/g, ' ').toUpperCase()}!`, 'success');
        game.audioManager?.play?.('kaching');
        updatePlayerAvatar(game);
    }
}

/**
 * Update player avatar based on evolution stage
 */
export function updatePlayerAvatar(game) {
    if (!game.gameState.characterStats) return;

    const stage = game.gameState.characterStats?.visualStage;
    let icon = '';

    if (stage === 'level_2_good') icon = '';
    if (stage === 'level_2_evil') icon = '';
    if (stage === 'level_3_good') icon = '';
    if (stage === 'level_3_evil') icon = '';

    // Tag every marker with the stage for styling; only replace the text
    // when there is an icon, instead of blanking the marker
    const markers = document.querySelectorAll('.player-icon');
    markers.forEach(el => {
        if (stage) el.dataset.stage = stage;
        if (icon) el.textContent = icon;
    });
}





