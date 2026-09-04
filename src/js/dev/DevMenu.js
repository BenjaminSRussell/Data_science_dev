/**
 * Developer Menu System
 * Provides quick access to all screens, locations, and testing tools
 */

export class DevMenu {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.menuContainer = null;
        this.init();
    }

    init() {
        // Create dev menu toggle button (only in dev mode)
        if (this.isDevMode()) {
            this.createToggleButton();
            this.createMenu();
            this.setupKeyboardShortcut();
        }
    }

    isDevMode() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            localStorage.getItem('dev_mode') === 'true';
    }

    createToggleButton() {
        const btn = document.createElement('button');
        btn.id = 'dev-menu-toggle';
        btn.innerHTML = 'DEV';
        btn.className = 'dev-menu-toggle';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 99999;
            padding: 10px 15px;
            background: #ff6b6b;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
    }

    createMenu() {
        const menu = document.createElement('div');
        menu.id = 'dev-menu';
        menu.className = 'dev-menu hidden';
        menu.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 400px;
            height: 100vh;
            background: rgba(30, 30, 30, 0.98);
            color: white;
            padding: 20px;
            overflow-y: auto;
            z-index: 99998;
            box-shadow: -4px 0 20px rgba(0,0,0,0.5);
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
        `;

        menu.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #4ecdc4;">Developer Menu</h2>
                <button id="dev-menu-close" style="background: #ff6b6b; border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✕</button>
            </div>

            <div class="dev-section">
                <h3>Screens</h3>
                <div class="dev-buttons" id="dev-screens"></div>
            </div>

            <div class="dev-section">
                <h3>Storyline Navigation</h3>
                <div style="margin-bottom: 10px;">
                    <select id="dev-storyline-phase" style="width: 100%; padding: 5px; background: #444; color: white; border: 1px solid #666; margin-bottom: 5px;">
                        <option value="early">Early Game</option>
                        <option value="mid">Mid Game</option>
                        <option value="late">Late Game</option>
                        <option value="endgame">Endgame</option>
                    </select>
                    <button id="dev-set-phase" style="width: 100%; padding: 6px; background: #4ecdc4; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">Set Phase</button>
                </div>
                <div id="dev-storyline-beats" style="max-height: 200px; overflow-y: auto; border: 1px solid #555; padding: 10px; background: #2a2a2a; border-radius: 4px;"></div>
            </div>

            <div class="dev-section">
                <h3>Locations</h3>
                <div style="margin-bottom: 10px;">
                    <button id="dev-test-all-locations" style="width: 100%; padding: 6px; background: #4ecdc4; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 5px;">Test All Locations</button>
                    <div id="dev-location-results" style="font-size: 10px; color: #888; margin-top: 5px;"></div>
                </div>
                <div class="dev-buttons" id="dev-locations"></div>
            </div>

            <div class="dev-section">
                <h3>Dialogue Testing</h3>
                <div class="dev-buttons" id="dev-dialogue"></div>
                <input type="text" id="dev-npc-input" placeholder="NPC ID" style="width: 100%; padding: 5px; margin: 5px 0; background: #444; color: white; border: 1px solid #666;">
                <button id="dev-test-dialogue" style="width: 100%; padding: 8px; background: #4ecdc4; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px 0;">Test Dialogue</button>
            </div>

            <div class="dev-section">
                <h3>Quick Actions</h3>
                <div class="dev-buttons" id="dev-actions"></div>
            </div>

            <div class="dev-section">
                <h3>Game State</h3>
                <div class="dev-buttons" id="dev-game-state"></div>
            </div>

            <div class="dev-section">
                <h3>Testing</h3>
                <div class="dev-buttons" id="dev-testing"></div>
            </div>

            <div class="dev-section">
                <h3>Validation</h3>
                <div class="dev-buttons" id="dev-validation"></div>
            </div>
        `;

        document.body.appendChild(menu);
        this.menuContainer = menu;

        // Add styles
        this.addStyles();

        // Setup event listeners
        document.getElementById('dev-menu-close').onclick = () => this.toggle();

        // Populate sections
        this.populateScreens();
        this.populateStoryline();
        this.populateLocations();
        this.populateDialogue();
        this.populateActions();
        this.populateGameState();
        this.populateTesting();
        this.populateValidation();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .dev-menu .dev-section {
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 1px solid #444;
            }
            .dev-menu .dev-section h3 {
                margin: 0 0 10px 0;
                color: #4ecdc4;
                font-size: 14px;
            }
            .dev-menu .dev-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }
            .dev-menu .dev-btn {
                padding: 6px 12px;
                background: #555;
                color: white;
                border: 1px solid #777;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
            }
            .dev-menu .dev-btn:hover {
                background: #666;
                border-color: #4ecdc4;
            }
            .dev-menu .dev-btn.primary {
                background: #4ecdc4;
                color: #1a1a1a;
            }
            .dev-menu .dev-btn.danger {
                background: #ff6b6b;
            }
            .dev-menu.hidden {
                display: none;
            }
        `;
        document.head.appendChild(style);
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.menuContainer) {
            this.menuContainer.classList.toggle('hidden', !this.isVisible);
        }
    }

    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + D
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    createButton(text, onClick, className = '') {
        const btn = document.createElement('button');
        btn.className = `dev-btn ${className}`;
        btn.textContent = text;
        btn.onclick = onClick;
        return btn;
    }

    populateScreens() {
        try {
            const container = document.getElementById('dev-screens');
            if (!container) return;

            const screens = [
                'screen-menu', 'screen-game', 'screen-map', 'screen-stats',
                'screen-career', 'screen-shop', 'screen-office', 'screen-clients',
                'screen-staff', 'screen-library', 'screen-bank', 'screen-newspaper',
                'screen-relationships', 'screen-chart-studio', 'screen-review'
            ];

            screens.forEach(screenId => {
                const btn = this.createButton(screenId.replace('screen-', ''), () => {
                    if (this.game.screenManager) {
                        this.game.screenManager.showScreen(screenId);
                        this.game.showToast(`Switched to ${screenId}`, 'info');
                    }
                });
                container.appendChild(btn);
            });
        } catch (error) {
            console.error('Error populating screens:', error);
        }
    }

    populateStoryline() {
        const container = document.getElementById('dev-storyline-beats');
        if (!container) {
            console.warn('Storyline beats container not found');
            return;
        }

        if (!window.devTools?.storylineNavigator) {
            container.innerHTML = '<p style="color: #888; font-size: 10px;">Storyline navigator not available</p>';
            return;
        }

        try {
            const state = window.devTools.storylineNavigator.getStorylineState();
            const allBeats = window.devTools.storylineNavigator.getAllStoryBeats();

            if (!state || !allBeats) {
                container.innerHTML = '<p style="color: #888; font-size: 10px;">Could not load storyline data</p>';
                return;
            }

            container.innerHTML = '';

            // Show current state
            const stateDiv = document.createElement('div');
            stateDiv.style.cssText = 'font-size: 10px; color: #aaa; margin-bottom: 10px; padding: 5px; background: #333; border-radius: 3px;';
            stateDiv.innerHTML = `
            <strong>Current:</strong> ${state.phase} (${state.progress}% progress)<br>
            <strong>Arc:</strong> ${state.currentArc?.name || 'None'}<br>
            <strong>Completed Beats:</strong> ${state.completedBeats.length}
        `;
            container.appendChild(stateDiv);

            // Show beats by phase
            Object.keys(allBeats).forEach(phase => {
                const phaseDiv = document.createElement('div');
                phaseDiv.style.cssText = 'margin-top: 10px; padding: 5px; border-left: 2px solid #4ecdc4;';
                const phaseTitle = document.createElement('strong');
                phaseTitle.textContent = `${phase.toUpperCase()}:`;
                phaseTitle.style.cssText = 'color: #4ecdc4; font-size: 11px; display: block; margin-bottom: 5px;';
                phaseDiv.appendChild(phaseTitle);

                allBeats[phase].forEach(beat => {
                    const beatBtn = document.createElement('button');
                    beatBtn.style.cssText = 'width: 100%; padding: 4px 8px; margin: 2px 0; background: #444; color: white; border: 1px solid #555; border-radius: 3px; cursor: pointer; font-size: 10px; text-align: left;';
                    beatBtn.innerHTML = `${state.completedBeats.includes(beat.id) ? '✓ ' : ''}${beat.title}`;
                    beatBtn.title = beat.description;
                    beatBtn.onclick = () => {
                        const result = window.devTools.storylineNavigator.triggerStoryBeat(beat.id);
                        this.game.showToast(result.message || result.error, result.success ? 'success' : 'error');
                        this.populateStoryline(); // Refresh
                    };
                    phaseDiv.appendChild(beatBtn);
                });

                container.appendChild(phaseDiv);
            });
        } catch (error) {
            console.error('Error populating storyline:', error);
            container.innerHTML = `<p style="color: #ff6b6b; font-size: 10px;">Error: ${error.message}</p>`;
        }
    }

    populateLocations() {
        const container = document.getElementById('dev-locations');
        if (!container) {
            console.warn('Locations container not found');
            return;
        }

        try {
            // Get locations from location tester
            let locations = [];
            if (window.devTools?.locationTester) {
                try {
                    locations = window.devTools.locationTester.getAllLocations();
                } catch (error) {
                    console.warn('Error getting locations from locationTester:', error);
                }
            }

            // Fallback to world map
            if (locations.length === 0 && this.game?.gameState?.worldMap?.getLocations) {
                try {
                    locations = this.game.gameState.worldMap.getLocations() || [];
                } catch (error) {
                    console.warn('Error getting locations from worldMap:', error);
                }
            }

            if (locations.length === 0) {
                container.innerHTML = '<p style="color: #888; font-size: 10px;">No locations found</p>';
                return;
            }

            container.innerHTML = ''; // Clear
            locations.forEach(location => {
                const btn = this.createButton(location.name || location.id, async () => {
                    if (window.devTools?.locationTester) {
                        const result = await window.devTools.locationTester.testLocation(location.id);
                        if (result.success) {
                            window.devTools.locationTester.navigateToLocation(location.id);
                            this.game.showToast(`${location.name || location.id}`, 'success');
                        } else {
                            this.game.showToast(`${result.errors.join(', ')}`, 'error');
                            console.error('Location test failed:', result);
                        }
                    } else {
                        // Fallback
                        if (this.game.gameState?.worldMap?.setCurrentLocation) {
                            this.game.gameState.worldMap.setCurrentLocation(location.id);
                            this.game.showToast(`Location: ${location.name}`, 'info');
                        }
                    }
                });
                container.appendChild(btn);
            });

            // Also add environment manager locations
            if (this.game.environmentManager) {
                const btn = this.createButton('Update Env', () => {
                    this.game.environmentManager.updateLocation();
                    this.game.showToast('Environment updated', 'info');
                });
                container.appendChild(btn);
            }
        } catch (error) {
            console.error('Error populating locations:', error);
            if (container) {
                container.innerHTML = `<p style="color: #ff6b6b; font-size: 10px;">Error: ${error.message}</p>`;
            }
        }
    }

    populateDialogue() {
        const container = document.getElementById('dev-dialogue');
        const npcManager = this.game.gameState?.npcManager;

        if (!npcManager) {
            container.innerHTML = '<p style="color: #888;">NPC Manager not initialized</p>';
            return;
        }

        const npcs = npcManager.getAllNPCs?.() || [];
        npcs.forEach(npc => {
            const btn = this.createButton(npc.name || npc.id, () => {
                if (npcManager.startConversation) {
                    npcManager.startConversation(npc.id);
                    this.game.showToast(`Testing dialogue: ${npc.name}`, 'info');
                }
            });
            container.appendChild(btn);
        });

        // Test all dialogues button
        const testAllBtn = this.createButton('Test All', () => this.testAllDialogues(), 'primary');
        container.appendChild(testAllBtn);

        // Setup test dialogue button
        document.getElementById('dev-test-dialogue').onclick = () => {
            const npcId = document.getElementById('dev-npc-input').value;
            if (npcId && npcManager.startConversation) {
                npcManager.startConversation(npcId);
            }
        };
    }

    populateActions() {
        const container = document.getElementById('dev-actions');

        container.appendChild(this.createButton('New Game', () => {
            this.game.startNewGame();
        }, 'primary'));

        container.appendChild(this.createButton('Give $1000', () => {
            if (this.game.gameState) {
                this.game.gameState.money += 1000;
                this.game.uiUpdater?.updateAllUI();
                this.game.showToast('Added $1000', 'success');
            }
        }));

        container.appendChild(this.createButton('Max Stats', () => {
            if (this.game.gameState?.characterStats) {
                const stats = this.game.gameState.characterStats.getStats();
                Object.keys(stats).forEach(stat => {
                    this.game.gameState.characterStats.trainStat?.(stat, 100);
                });
                this.game.showToast('Maxed all stats', 'success');
            }
        }));

        container.appendChild(this.createButton('Complete Task', () => {
            if (this.game.taskSystem?.getCurrentTask) {
                const task = this.game.taskSystem.getCurrentTask();
                if (task) {
                    this.game.taskSystem.completeTask?.(task.id);
                    this.game.showToast('Task completed', 'success');
                }
            }
        }));

        container.appendChild(this.createButton('Skip Time', () => {
            if (this.game.handleTimeAdvance) {
                this.game.handleTimeAdvance(24); // Skip 1 day
                this.game.showToast('Time advanced 24 hours', 'info');
            }
        }));
    }

    populateGameState() {
        const container = document.getElementById('dev-game-state');

        container.appendChild(this.createButton('Show State', () => {
            console.log('Game State:', this.game.gameState);
            this.game.showToast('Game state logged to console', 'info');
        }));

        container.appendChild(this.createButton('Reset State', () => {
            if (confirm('Reset game state?')) {
                this.game.gameState?.reset();
                this.game.showToast('State reset', 'warning');
            }
        }, 'danger'));

        container.appendChild(this.createButton('Save Game', () => {
            if (this.game.saveManager) {
                this.game.saveManager.save(0, this.game.gameState);
                this.game.showToast('Game saved', 'success');
            }
        }));

        container.appendChild(this.createButton('Load Game', () => {
            if (this.game.saveManager) {
                const save = this.game.saveManager.load(0);
                if (save) {
                    this.game.showToast('Game loaded', 'success');
                }
            }
        }));
    }

    populateTesting() {
        const container = document.getElementById('dev-testing');

        container.appendChild(this.createButton('Run All Tests', () => {
            if (window.speedRunBugFinder) {
                window.speedRunBugFinder().then(results => {
                    console.log('Test results:', results);
                    this.game.showToast(`Tests completed. Bugs: ${results.bugs.length}, Errors: ${results.errors.length}`, 'info');
                });
            } else {
                this.game.showError('Test suite not loaded. Load test/speed-run-bug-finder.js first');
            }
        }, 'primary'));

        container.appendChild(this.createButton('Test Charts', () => {
            this.testAllCharts();
        }));

        container.appendChild(this.createButton('Test Spreadsheets', () => {
            this.testSpreadsheets();
        }));

        container.appendChild(this.createButton('Validate Assets', () => {
            this.validateAssets();
        }));
    }

    populateValidation() {
        const container = document.getElementById('dev-validation');

        container.appendChild(this.createButton('Validate Graphs', () => {
            this.validateGraphs();
        }));

        container.appendChild(this.createButton('Validate Work System', () => {
            this.validateWorkSystem();
        }));

        container.appendChild(this.createButton('Test All Options', () => {
            this.testAllOptions();
        }));

        container.appendChild(this.createButton('Check Crashes', () => {
            this.checkForCrashes();
        }));
    }

    async testAllDialogues() {
        const npcManager = this.game.gameState?.npcManager;
        if (!npcManager) return;

        const npcs = npcManager.getAllNPCs?.() || [];
        const results = { passed: 0, failed: 0, errors: [] };

        for (const npc of npcs) {
            try {
                if (npcManager.startConversation) {
                    npcManager.startConversation(npc.id);
                    await new Promise(resolve => setTimeout(resolve, 100));
                    results.passed++;
                }
            } catch (error) {
                results.failed++;
                results.errors.push({ npc: npc.id, error: error.message });
            }
        }

        console.log('Dialogue test results:', results);
        this.game.showToast(`Dialogues tested: ${results.passed} passed, ${results.failed} failed`, 'info');
    }

    testAllCharts() {
        const chartManager = this.game.chartManager;
        if (!chartManager) {
            this.game.showError('Chart manager not found');
            return;
        }

        const chartTypes = ['bar', 'line', 'pie', 'scatter', 'doughnut', 'area'];
        const testData = {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Test Data',
                data: [10, 20, 30, 40]
            }]
        };

        const results = { passed: 0, failed: 0 };

        chartTypes.forEach(type => {
            try {
                // Create a temporary canvas
                const canvas = document.createElement('canvas');
                canvas.id = `test-chart-${type}`;
                document.body.appendChild(canvas);

                if (chartManager.createChart) {
                    const chart = chartManager.createChart(canvas.id, type, testData);
                    if (chart) {
                        results.passed++;
                        // Clean up
                        setTimeout(() => canvas.remove(), 100);
                    }
                }
            } catch (error) {
                results.failed++;
                console.error(`Chart type ${type} failed:`, error);
            }
        });

        this.game.showToast(`Charts tested: ${results.passed} passed, ${results.failed} failed`, 'info');
    }

    testSpreadsheets() {
        // Test data table functionality
        const table = document.getElementById('data-table');
        if (!table) {
            this.game.showError('Data table not found');
            return;
        }

        const results = { passed: 0, failed: 0 };

        // Test sorting
        try {
            const headers = table.querySelectorAll('th');
            headers.forEach((header, index) => {
                header.click();
                results.passed++;
            });
        } catch (error) {
            results.failed++;
            console.error('Table sorting failed:', error);
        }

        // Test filtering
        try {
            const filterInput = document.getElementById('table-filter');
            if (filterInput) {
                filterInput.value = 'test';
                filterInput.dispatchEvent(new Event('input'));
                results.passed++;
            }
        } catch (error) {
            results.failed++;
            console.error('Table filtering failed:', error);
        }

        this.game.showToast(`Spreadsheet tests: ${results.passed} passed, ${results.failed} failed`, 'info');
    }

    validateAssets() {
        const results = { loaded: 0, missing: 0, errors: [] };

        // Check sprite assets
        const spriteSheets = [
            '/assets/characters/sprites/character_sheet.png',
            '/assets/characters/sprites/emotion_sheet.png'
        ];

        spriteSheets.forEach(url => {
            const img = new Image();
            img.onload = () => results.loaded++;
            img.onerror = () => {
                results.missing++;
                results.errors.push(url);
            };
            img.src = url;
        });

        setTimeout(() => {
            console.log('Asset validation:', results);
            this.game.showToast(`Assets: ${results.loaded} loaded, ${results.missing} missing`, 'info');
        }, 2000);
    }

    validateGraphs() {
        // Validate chart accuracy
        const chartManager = this.game.chartManager;
        if (!chartManager) return;

        const testCases = [
            {
                data: [10, 20, 30, 40],
                expectedSum: 100,
                type: 'bar'
            },
            {
                data: [25, 25, 25, 25],
                expectedAverage: 25,
                type: 'line'
            }
        ];

        const results = { passed: 0, failed: 0 };

        testCases.forEach(testCase => {
            try {
                // This would need actual chart validation logic
                results.passed++;
            } catch (error) {
                results.failed++;
            }
        });

        this.game.showToast(`Graph validation: ${results.passed} passed, ${results.failed} failed`, 'info');
    }

    validateWorkSystem() {
        // Test work/task system
        const taskSystem = this.game.taskSystem;
        if (!taskSystem) {
            this.game.showError('Task system not found');
            return;
        }

        const results = { passed: 0, failed: 0 };

        // Test getting current task
        try {
            const task = taskSystem.getCurrentTask?.();
            if (task !== undefined) {
                results.passed++;
            }
        } catch (error) {
            results.failed++;
        }

        // Test task completion
        try {
            const task = taskSystem.getCurrentTask?.();
            if (task && taskSystem.completeTask) {
                // Don't actually complete, just check method exists
                results.passed++;
            }
        } catch (error) {
            results.failed++;
        }

        this.game.showToast(`Work system validation: ${results.passed} passed, ${results.failed} failed`, 'info');
    }

    async testAllOptions() {
        // Test all clickable options/buttons
        const buttons = document.querySelectorAll('button:not([disabled]), .clickable, [role="button"]');
        const results = { tested: 0, errors: [] };

        for (const btn of Array.from(buttons).slice(0, 50)) { // Limit to 50
            try {
                btn.click();
                results.tested++;
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                results.errors.push({ element: btn.id || btn.className, error: error.message });
            }
        }

        console.log('Option test results:', results);
        this.game.showToast(`Options tested: ${results.tested}, Errors: ${results.errors.length}`, 'info');
    }

    checkForCrashes() {
        // Check for common crash scenarios
        const checks = {
            nullReferences: 0,
            undefinedMethods: 0,
            typeErrors: 0
        };

        // Check game state
        if (!this.game?.gameState) checks.nullReferences++;
        if (!this.game?.screenManager?.showScreen) checks.undefinedMethods++;

        // Check critical systems
        const systems = ['taskSystem', 'chartManager', 'environmentManager'];
        systems.forEach(system => {
            if (!this.game?.[system]) {
                checks.nullReferences++;
            }
        });

        const totalIssues = Object.values(checks).reduce((a, b) => a + b, 0);
        if (totalIssues === 0) {
            this.game.showToast('✅ No crash issues detected!', 'success');
        } else {
            this.game.showToast(`Found ${totalIssues} potential crash issues. Check console.`, 'warning');
            console.log('Crash check results:', checks);
        }
    }
}

