/**
 * Browser-based Continuous Test Runner
 * This runs in the browser context and tests the actual game
 */

export class BrowserContinuousTestRunner {
    constructor(game) {
        this.game = game;
        this.iteration = 0;
        this.issues = [];
        this.startTime = Date.now();
        this.isRunning = false;
        this.intervalId = null;
        
        // Test results storage
        this.testResults = {
            dialogue: { passed: 0, failed: 0, errors: [] },
            work: { passed: 0, failed: 0, errors: [] },
            save: { passed: 0, failed: 0, errors: [] },
            ui: { passed: 0, failed: 0, errors: [] },
            assets: { passed: 0, failed: 0, errors: [] },
            state: { passed: 0, failed: 0, errors: [] },
            memory: { passed: 0, failed: 0, errors: [] }
        };
    }
    
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        console.log(logMessage);
        
        // Also send to console for visibility
        if (level === 'error') {
            console.error(logMessage);
        } else if (level === 'warn') {
            console.warn(logMessage);
        }
    }
    
    addIssue(category, description, severity = 'medium', details = {}) {
        const issue = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            category,
            description,
            severity,
            details,
            timestamp: new Date().toISOString(),
            iteration: this.iteration
        };
        
        this.issues.push(issue);
        this.testResults[category] = this.testResults[category] || { passed: 0, failed: 0, errors: [] };
        this.testResults[category].failed++;
        this.testResults[category].errors.push(issue);
        
        this.log(`ISSUE [${severity.toUpperCase()}]: ${category} - ${description}`, 'error');
        
        return issue;
    }
    
    safeExecute(name, fn, category = 'general') {
        try {
            const result = fn();
            const markPassed = () => {
                this.testResults[category] = this.testResults[category] || { passed: 0, failed: 0, errors: [] };
                this.testResults[category].passed++;
            };
            if (result instanceof Promise) {
                // Count async tests as passed when they resolve (#89)
                return result.then(value => {
                    markPassed();
                    return value;
                }, error => {
                    this.addIssue(category, `${name} failed: ${error.message}`, 'high', { error: error.stack });
                    return null;
                });
            }
            markPassed();
            return result;
        } catch (error) {
            this.addIssue(category, `${name} failed: ${error.message}`, 'high', { error: error.stack });
            return null;
        }
    }
    
    async testDialogueSystem() {
        this.log('Testing Dialogue System...');
        
        // Test NPC Manager
        this.safeExecute('NPC Manager exists', () => {
            if (!this.game?.gameState?.npcManager) {
                throw new Error('NPC Manager not found');
            }
            return true;
        }, 'dialogue');
        
        // Test NPC retrieval
        this.safeExecute('Get NPCs', () => {
            const npcManager = this.game.gameState.npcManager;
            if (npcManager.getAllNPCs) {
                const npcs = npcManager.getAllNPCs();
                if (!Array.isArray(npcs)) {
                    throw new Error('getAllNPCs did not return an array');
                }
                if (npcs.length === 0) {
                    this.log('No NPCs found (might be normal)', 'warn');
                }
                return npcs;
            }
            return null;
        }, 'dialogue');
        
        // Test conversation start
        this.safeExecute('Start conversation', () => {
            const npcManager = this.game.gameState.npcManager;
            if (npcManager.getAllNPCs && npcManager.startConversation) {
                const npcs = npcManager.getAllNPCs();
                if (npcs.length > 0 && npcs[0].id) {
                    try {
                        npcManager.startConversation(npcs[0].id);
                    } catch (error) {
                        // Conversation might fail for valid reasons, just log it
                        this.log(`Conversation start failed (might be normal): ${error.message}`, 'warn');
                    }
                }
            }
        }, 'dialogue');
    }
    
    async testWorkSystem() {
        this.log('Testing Work System...');
        
        // Test Task System
        this.safeExecute('Task System exists', () => {
            if (!this.game?.taskSystem) {
                throw new Error('Task System not found');
            }
            return true;
        }, 'work');
        
        // Test task generation
        this.safeExecute('Generate task', () => {
            if (this.game.taskSystem.generateNewTask) {
                try {
                    const task = this.game.taskSystem.generateNewTask();
                    if (task && !task.id) {
                        throw new Error('Generated task missing id');
                    }
                    return task;
                } catch (error) {
                    throw new Error(`Task generation failed: ${error.message}`);
                }
            }
        }, 'work');
        
        // Test current task
        this.safeExecute('Get current task', () => {
            if (this.game.taskSystem.getCurrentTask) {
                const task = this.game.taskSystem.getCurrentTask();
                // Task can be null, that's fine
                return task;
            }
        }, 'work');
        
        // Test Project System
        this.safeExecute('Project System exists', () => {
            if (!this.game?.projectSystem) {
                throw new Error('Project System not found');
            }
            return true;
        }, 'work');
        
        // Test active project
        this.safeExecute('Active project integrity', () => {
            if (this.game.projectSystem.activeProject) {
                const project = this.game.projectSystem.activeProject;
                if (!project.stages || !Array.isArray(project.stages)) {
                    throw new Error('Active project missing stages array');
                }
                if (project.currentStageIndex !== undefined && (isNaN(project.currentStageIndex) || project.currentStageIndex < 0)) {
                    throw new Error(`Invalid currentStageIndex: ${project.currentStageIndex}`);
                }
            }
        }, 'work');
    }
    
    async testSaveLoadSystem() {
        this.log('Testing Save/Load System...');
        
        // Test Save Manager
        this.safeExecute('Save Manager exists', () => {
            if (!this.game?.saveManager) {
                throw new Error('Save Manager not found');
            }
            return true;
        }, 'save');
        
        // Save/load round-trip on a scratch slot. The previous version wrote the
        // live state into real slot 0 every iteration and called loadGame(0)
        // with the wrong signature (#2327). Back up and restore the slot.
        this.safeExecute('Save/load round-trip', () => {
            const saveManager = this.game.saveManager;
            const slot = 4;
            const key = `data_science_tycoon_save_${slot}`;
            const backup = localStorage.getItem(key);
            try {
                if (saveManager.saveGame(this.game.gameState, slot) === false) {
                    throw new Error('saveGame returned false');
                }
                const scratch = new this.game.gameState.constructor();
                if (!saveManager.loadGame(scratch, slot)) {
                    throw new Error('loadGame could not read back the save');
                }
                return true;
            } finally {
                if (backup === null) localStorage.removeItem(key);
                else localStorage.setItem(key, backup);
            }
        }, 'save');
        
        // Test auto-save
        this.safeExecute('Auto-save functionality', () => {
            const saveManager = this.game.saveManager;
            if (saveManager.startAutoSave && saveManager.stopAutoSave) {
                // Test that we can start and stop auto-save
                saveManager.startAutoSave(this.game.gameState, 60000, 0);
                saveManager.stopAutoSave();
                return true;
            }
        }, 'save');
    }
    
    async testUISystem() {
        this.log('Testing UI System...');
        
        // Test Screen Manager
        this.safeExecute('Screen Manager exists', () => {
            if (!this.game?.screenManager) {
                throw new Error('Screen Manager not found');
            }
            return true;
        }, 'ui');
        
        // Test screen transitions, then put the player back where they were (#2327)
        const screens = ['screen-menu', 'screen-game', 'screen-map', 'screen-stats'];
        const originalScreen = this.game.screenManager?.getCurrentScreen?.() || this.game.screenManager?.currentScreen;
        screens.forEach(screenId => {
            this.safeExecute(`Transition to ${screenId}`, () => {
                try {
                    this.game.screenManager.showScreen(screenId);
                    // Verify screen changed (if method exists)
                    if (this.game.screenManager.currentScreen && this.game.screenManager.currentScreen !== screenId) {
                        this.log(`Screen transition may have failed: expected ${screenId}, got ${this.game.screenManager.currentScreen}`, 'warn');
                    }
                } catch (error) {
                    throw new Error(`Screen transition error: ${error.message}`);
                }
            }, 'ui');
        });
        if (originalScreen) {
            try { this.game.screenManager.showScreen(originalScreen); } catch (_) { /* ignore */ }
        }
        
        // Test UI Updater
        this.safeExecute('UI Updater exists', () => {
            if (!this.game?.uiUpdater) {
                throw new Error('UI Updater not found');
            }
            return true;
        }, 'ui');
        
        // Test UI update
        this.safeExecute('Update all UI', () => {
            if (this.game.uiUpdater.updateAllUI) {
                try {
                    this.game.uiUpdater.updateAllUI();
                } catch (error) {
                    throw new Error(`UI update failed: ${error.message}`);
                }
            }
        }, 'ui');
    }
    
    async testAssetSystem() {
        this.log('Testing Asset System...');
        
        // Test Asset Manager
        this.safeExecute('Asset Manager exists', () => {
            if (!this.game?.assetManager) {
                this.log('Asset Manager not found (might be optional)', 'warn');
                return false;
            }
            return true;
        }, 'assets');
        
        // Test Sprite System
        this.safeExecute('Sprite System exists', () => {
            if (!this.game?.spriteSystem) {
                this.log('Sprite System not found (might be optional)', 'warn');
                return false;
            }
            return true;
        }, 'assets');
    }
    
    async testGameState() {
        this.log('Testing Game State...');
        
        // Test state exists
        this.safeExecute('Game State exists', () => {
            if (!this.game?.gameState) {
                throw new Error('Game State not found');
            }
            return true;
        }, 'state');
        
        const state = this.game.gameState;
        
        // Test critical properties
        const criticalProps = ['money', 'rankIndex', 'tasksCompleted'];
        criticalProps.forEach(prop => {
            this.safeExecute(`Check ${prop}`, () => {
                if (state[prop] === undefined) {
                    throw new Error(`Missing critical property: ${prop}`);
                }
                if (isNaN(state[prop])) {
                    throw new Error(`${prop} is not a number: ${state[prop]}`);
                }
            }, 'state');
        });
        
        // Test value ranges
        this.safeExecute('Money range check', () => {
            if (state.money !== undefined && state.money < 0) {
                throw new Error(`Money is negative: ${state.money}`);
            }
        }, 'state');
        
        this.safeExecute('Rank index range check', () => {
            if (state.rankIndex !== undefined && (state.rankIndex < 0 || state.rankIndex > 20)) {
                this.log(`Rank index out of expected range: ${state.rankIndex}`, 'warn');
            }
        }, 'state');
    }
    
    async testMemoryLeaks() {
        this.log('Testing for Memory Leaks...');
        
        // Check for uncleaned intervals
        this.safeExecute('Interval cleanup check', () => {
            // This is a simplified check - in a real scenario we'd track all intervals
            // For now, we just verify that cleanup methods exist where intervals are used
            
            // Check EnvironmentManager
            if (this.game.environmentManager && this.game.environmentManager.destroy) {
                // Method exists, that's good
                return true;
            }
        }, 'memory');
    }
    
    async mutateStateAndRetest() {
        this.log('Mutating state and re-testing...');
        
        if (!this.game?.gameState) return;
        
        const state = this.game.gameState;
        const originalMoney = state.money;
        const originalRank = state.rankIndex;
        
        // Await each async re-test and always restore the real values, so a
        // live game is never left with random money/rank (#2327, #89)
        try {
            await this.safeExecute('Money mutation test', () => {
                state.money = Math.random() * 100000;
                return this.testGameState();
            }, 'mutation');
        } finally {
            state.money = originalMoney;
        }

        try {
            await this.safeExecute('Rank mutation test', () => {
                state.rankIndex = Math.floor(Math.random() * 10);
                return this.testGameState();
            }, 'mutation');
        } finally {
            state.rankIndex = originalRank;
        }
    }
    
    async runIteration() {
        this.iteration++;
        const elapsed = ((Date.now() - this.startTime) / 1000 / 60).toFixed(2);
        this.log(`\n=== Iteration ${this.iteration} (${elapsed} minutes elapsed) ===`);
        
        // Run all test suites
        await this.testDialogueSystem();
        await this.testWorkSystem();
        await this.testSaveLoadSystem();
        await this.testUISystem();
        await this.testAssetSystem();
        await this.testGameState();
        await this.testMemoryLeaks();
        
        // Every 10 iterations, mutate state and re-test
        if (this.iteration % 10 === 0) {
            await this.mutateStateAndRetest();
        }
        
        // Print summary
        const totalIssues = this.issues.length;
        const critical = this.issues.filter(i => i.severity === 'critical').length;
        const high = this.issues.filter(i => i.severity === 'high').length;
        
        this.log(`Summary: ${totalIssues} total issues (${critical} critical, ${high} high)`);
        
        // Save results to localStorage periodically
        if (this.iteration % 5 === 0) {
            try {
                localStorage.setItem('continuousTestResults', JSON.stringify({
                    iteration: this.iteration,
                    issues: this.issues,
                    testResults: this.testResults,
                    elapsedMinutes: parseFloat(elapsed)
                }));
            } catch (e) {
                // localStorage might be full, that's okay
            }
        }
    }
    
    start(intervalMs = 30000) {
        if (this.isRunning) {
            this.log('Test runner already running', 'warn');
            return;
        }
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.log('Starting Continuous Test Runner');
        this.log(`Running every ${intervalMs / 1000} seconds`);
        
        // Run initial iteration
        this.runIteration().catch(error => {
            this.log(`Error in initial iteration: ${error.message}`, 'error');
            this.addIssue('test-runner', `Initial iteration failed: ${error.message}`, 'high');
        });
        
        // Continue running
        this.intervalId = setInterval(async () => {
            try {
                await this.runIteration();
            } catch (error) {
                this.log(`Error in iteration: ${error.message}`, 'error');
                this.addIssue('test-runner', `Iteration ${this.iteration} crashed: ${error.message}`, 'high', { error: error.stack });
            }
        }, intervalMs);
    }
    
    stop() {
        if (!this.isRunning) {
            return;
        }
        
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        const elapsed = ((Date.now() - this.startTime) / 1000 / 60).toFixed(2);
        this.log(`Stopped after ${this.iteration} iterations (${elapsed} minutes)`);
        this.log(`Total issues found: ${this.issues.length}`);
        
        // Save final report
        const finalReport = {
            totalIterations: this.iteration,
            totalRuntimeMinutes: parseFloat(elapsed),
            totalIssues: this.issues.length,
            issuesByCategory: {},
            issuesBySeverity: {
                critical: this.issues.filter(i => i.severity === 'critical').length,
                high: this.issues.filter(i => i.severity === 'high').length,
                medium: this.issues.filter(i => i.severity === 'medium').length,
                low: this.issues.filter(i => i.severity === 'low').length
            },
            issues: this.issues,
            testResults: this.testResults
        };
        
        // Group issues by category
        this.issues.forEach(issue => {
            if (!finalReport.issuesByCategory[issue.category]) {
                finalReport.issuesByCategory[issue.category] = 0;
            }
            finalReport.issuesByCategory[issue.category]++;
        });
        
        try {
            localStorage.setItem('continuousTestFinalReport', JSON.stringify(finalReport));
            this.log('Final report saved to localStorage');
        } catch (e) {
            this.log('Could not save final report to localStorage', 'warn');
        }
        
        return finalReport;
    }
    
    getReport() {
        const elapsed = ((Date.now() - this.startTime) / 1000 / 60).toFixed(2);
        return {
            iteration: this.iteration,
            elapsedMinutes: parseFloat(elapsed),
            totalIssues: this.issues.length,
            issues: this.issues,
            testResults: this.testResults
        };
    }
}

// No module-level auto-start: auto-start-continuous-tests.js is the single
// entry point, so importing this module never spawns a second, orphaned
// runner interval (#2325). Start manually with:
//   window.continuousTestRunner = new BrowserContinuousTestRunner(window.game); window.continuousTestRunner.start();
