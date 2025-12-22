/**
 * ProjectHelpers.js
 * Helper functions for project work, work sessions, and AI training
 */

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
 * Start a working session with time passing
 */
export function startWorkingSession(game, hours) {
    const overlay = document.getElementById('working-overlay');
    overlay.classList.remove('hidden');

    const tickRate = 100; // ms per tick
    const ticksPerHour = 10;
    const totalTicks = hours * ticksPerHour;
    let currentTick = 0;

    document.getElementById('btn-stop-work').onclick = () => {
        finishWorkingSession(game, currentTick, totalTicks);
    };

    game.workInterval = setInterval(() => {
        currentTick++;

        // Advance time
        game.handleTimeAdvance(0.1);

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

        if (currentTick >= totalTicks) {
            finishWorkingSession(game, currentTick, totalTicks);
        }

        // Check if stage completed early
        if (game.projectSystem.activeProject.stageProgress >=
            game.projectSystem.activeProject.stages[game.projectSystem.activeProject.currentStageIndex].maxProgress) {
            finishWorkingSession(game, currentTick, totalTicks);
        }

    }, tickRate);
}

/**
 * Finish a working session
 */
export function finishWorkingSession(game, ticks, totalTicks) {
    clearInterval(game.workInterval);
    document.getElementById('working-overlay').classList.add('hidden');

    game.uiUpdater.updateCareerScreen();
    game.uiUpdater.updateAllUI();

    const result = game.projectSystem.checkProgress();

    if (result && result.status === 'project_complete') {
        game.showToast(`PROJECT COMPLETE! Earned $${result.reward}`, 'success');
        game.audioManager.play('kaching');
        game.uiUpdater.updateCareerScreen();
    } else if (result && result.status === 'stage_complete') {
        game.showToast(`Stage Complete! Next: ${result.nextStage.name}`, 'info');
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

    let tickPower = basePower * 0.1;
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

    const result = game.aiSystem.train(10);

    game.showToast(`Trained AI! Gained ${result.xpGained} XP.`, 'success');
    game.audioManager.play('keyboard_typing') || game.audioManager.play('click');

    if (game.aiSystem.checkLevelUp()) {
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
    const officeNames = ['Bedroom Corner', 'Home Office', 'Co-working Space', 'Small Office', 'Office Floor', 'Company HQ'];
    const officeIcons = ['', '', '', '', '', ''];
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
        game.uiUpdater.updateLocationLayout(locId);
    }

    // Update upgrade button
    const nextBtn = document.getElementById('upgrade-office');
    const officePrices = [0, 5000, 15000, 50000, 200000, 1000000];

    if (nextBtn) {
        const nextOfficePrice = officePrices[currentOffice + 1];
        nextBtn.textContent = `$${nextOfficePrice.toLocaleString()}`;
        nextBtn.onclick = () => game.handleUpgradeOffice();

        if (currentOffice >= officeNames.length - 1) {
            nextBtn.textContent = 'MAXED';
            nextBtn.disabled = true;
            const nextOfficeInfo = document.getElementById('next-office-info');
            if (nextOfficeInfo) nextOfficeInfo.classList.add('hidden');
        } else if (game.gameState.money < nextOfficePrice) {
            nextBtn.disabled = true;
        } else {
            nextBtn.disabled = false;
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
            const xpPct = (ai.xp / ai.xpToNextLevel) * 100;
            aiXpFillEl.style.width = `${xpPct}%`;
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
 * Update stats screen
 */
export function updateStatsScreen(game) {
    if (!game.characterStats) return;

    const charName = game.gameState.playerName || 'New Player';
    const statsNameEl = document.getElementById('stats-name');
    if (statsNameEl) statsNameEl.textContent = charName;

    // Update stat bars
    game.characterStats?.getAllStats()?.forEach(stat => {
        const el = document.querySelector(`.stat-card[data-stat="${stat.id}"]`);
        if (el) {
            const valueEl = el.querySelector('.stat-value');
            const fillEl = el.querySelector('.stat-bar-fill');
            const xpEl = el.querySelector('.stat-xp');
            
            if (valueEl) valueEl.textContent = stat.value;
            if (fillEl) fillEl.style.width = `${(stat.value / stat.maxLevel) * 100}%`;
            if (xpEl) xpEl.textContent = `XP: ${Math.floor(stat.xp)}/${stat.xpNeeded}`;
        }
    });

    // Calculate total level
    const totalLevel = game.characterStats?.getAllStats()?.reduce((sum, s) => sum + s.value, 0) || 0;
    const totalLevelEl = document.getElementById('total-level');
    if (totalLevelEl) totalLevelEl.textContent = totalLevel;
}

/**
 * Check for character visual evolution
 */
export function checkForCharacterEvolution(game) {
    if (!game.gameState.characterStats) return;

    const evolution = game.gameState.characterStats.checkEvolution(game.gameState.money);
    if (evolution.evolved) {
        game.showToast(`Character Evolved: ${evolution.stage.replace(/_/g, ' ').toUpperCase()}!`, 'success');
        game.audioManager.play('kaching');
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

    const markers = document.querySelectorAll('.player-icon');
    markers.forEach(el => el.textContent = icon);
}





