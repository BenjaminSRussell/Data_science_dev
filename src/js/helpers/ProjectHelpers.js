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
        if (currentOffice >= officeNames.length - 1) {
            nextBtn.textContent = 'MAXED';
            nextBtn.disabled = true;
            const nextOfficeInfo = document.getElementById('next-office-info');
            if (nextOfficeInfo) nextOfficeInfo.classList.add('hidden');
        } else {
            const nextOfficePrice = officePrices[currentOffice + 1];
            nextBtn.textContent = `$${nextOfficePrice.toLocaleString()}`;
            nextBtn.onclick = () => game.handleUpgradeOffice();

            if (game.gameState.money < nextOfficePrice) {
                nextBtn.disabled = true;
            } else {
                nextBtn.disabled = false;
            }
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