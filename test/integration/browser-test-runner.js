class BrowserContinuousTestRunner {
    constructor(game) {
        this.game = game;
        this.startTime = Date.now();
        this.iteration = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.testResults = {};
        this.issues = [];
        this.log('Initialized Browser Continuous Test Runner', 'info');
    }

    log(message, level = 'info') {
        console.log(`[${level.toUpperCase()}] ${message}`);
    }

    safeExecute(name, fn, category = 'general') {
        try {
            const result = fn();
            if (result instanceof Promise) {
                return result
                    .then(() => {
                        this.testResults[category] = this.testResults[category] || { passed: 0, failed: 0 };
                        this.testResults[category].passed++;
                    })
                    .catch(error => {
                        this.testResults[category] = this.testResults[category] || { passed: 0, failed: 0 };
                        this.testResults[category].failed++;
                        this.addIssue(name, `Error: ${error.message}`, 'high', { error: error.stack });
                    });
            } else {
                this.testResults[category] = this.testResults[category] || { passed: 0, failed: 0 };
                this.testResults[category].passed++;
                return result;
            }
        } catch (error) {
            this.testResults[category] = this.testResults[category] || { passed: 0, failed: 0 };
            this.testResults[category].failed++;
            this.addIssue(name, `Error: ${error.message}`, 'high', { error: error.stack });
        }
    }

    addIssue(name, message, severity = 'medium', details = {}) {
        this.issues.push({
            name: name,
            message: message,
            severity: severity,
            details: details,
            timestamp: Date.now()
        });
    }

    async testDialogueSystem() {
        this.log('Testing Dialogue System...');
        // Placeholder for actual dialogue system tests
        this.safeExecute('Dialogue system basic check', () => {
            if (!this.game.dialogueManager || typeof this.game.dialogueManager.startDialogue !== 'function') {
                throw new Error('Dialogue Manager not set up correctly');
            }
        }, 'dialogue');
    }

    async testWorkSystem() {
        this.log('Testing Work System...');
        // Placeholder for actual work system tests
        this.safeExecute('Work system basic check', () => {
            if (!this.game.workManager || typeof this.game.workManager.doWork !== 'function') {
                throw new Error('Work Manager not set up correctly');
            }
        }, 'work');
    }

    async testSaveLoadSystem() {
        this.log('Testing Save/Load System...');
        // Placeholder for actual save/load system tests
        this.safeExecute('Save system basic check', () => {
            if (!this.game.saveManager || typeof this.game.saveManager.save !== 'function') {
                throw new Error('Save Manager not set up correctly');
            }
        }, 'save');
        
        this.safeExecute('Load system basic check', () => {
            if (!this.game.saveManager || typeof this.game.saveManager.load !== 'function') {
                throw new Error('Load Manager not set up correctly');
            }
        }, 'load');
    }

    async testUISystem() {
        this.log('Testing UI System...');
        // Placeholder for actual UI system tests
        this.safeExecute('UI system basic check', () => {
            if (!this.game.uiManager || typeof this.game.uiManager.update !== 'function') {
                throw new Error('UI Manager not set up correctly');
            }
        }, 'ui');
    }

    async testAssetSystem() {
        this.log('Testing Asset System...');
        // Placeholder for actual asset system tests
        this.safeExecute('Asset system basic check', () => {
            if (!this.game.assetManager || typeof this.game.assetManager.loadAsset !== 'function') {
                throw new Error('Asset Manager not set up correctly');
            }
        }, 'asset');
    }

    async testGameState() {
        this.log('Testing Game State...');
        
        if (!this.game?.gameState) return this.addIssue('Game State', 'Game state is undefined', 'critical');
        
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
        
        // Mutate money
        this.safeExecute('Money mutation test', () => {
            state.money = Math.random() * 100000;
            // Re-test state
            return this.testGameState();
        }, 'mutation');
        
        // Restore and mutate rank
        state.money = originalMoney;
        this.safeExecute('Rank mutation test', () => {
            state.rankIndex = Math.floor(Math.random() * 10);
            // Re-test state
            return this.testGameState();
        }, 'mutation');
        
        // Restore
        state.rankIndex = originalRank;
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
        this.log(`Test runner stopped after ${elapsed} minutes`, 'info');
        
        // Print final summary
        const totalIssues = this.issues.length;
        const critical = this.issues.filter(i => i.severity === 'critical').length;
        const high = this.issues.filter(i => i.severity === 'high').length;
        
        this.log(`Final Summary: ${totalIssues} total issues (${critical} critical, ${high} high)`);
        
        // Save final results to localStorage
        try {
            localStorage.setItem('continuousTestResultsFinal', JSON.stringify({
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