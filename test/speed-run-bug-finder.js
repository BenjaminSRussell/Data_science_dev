/**
 * Speed-Run Bug Finder
 * Automatically tests game systems to find bugs quickly
 * Run in browser console: copy-paste this file and run speedRunBugFinder()
 */

window.speedRunBugFinder = async function() {
    console.log('🚀 Starting Speed-Run Bug Finder...');
    
    const bugs = [];
    const startTime = Date.now();
    
    // Track all errors
    const originalError = console.error;
    const originalWarn = console.warn;
    const errorLog = [];
    const warnLog = [];
    
    console.error = function(...args) {
        errorLog.push({time: Date.now(), args: Array.from(args)});
        originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
        warnLog.push({time: Date.now(), args: Array.from(args)});
        originalWarn.apply(console, args);
    };
    
    // Helper to wait
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Helper to safely execute and catch errors
    const safeExecute = async (name, fn) => {
        try {
            await fn();
            console.log(`✅ ${name} - OK`);
        } catch (error) {
            bugs.push({test: name, error: error.message, stack: error.stack});
            console.error(`❌ ${name} - ERROR:`, error);
        }
    };
    
    // Test 1: Game initialization
    await safeExecute('Game Initialization', async () => {
        if (!window.game) {
            throw new Error('Game object not found');
        }
        if (!window.game.gameState) {
            throw new Error('GameState not found');
        }
    });
    
    // Test 2: Start new game
    await safeExecute('Start New Game', async () => {
        const btn = document.getElementById('btn-new-game');
        if (btn && !btn.disabled) {
            btn.click();
            await wait(1000);
        }
    });
    
    // Test 3: Test all screen transitions
    await safeExecute('Screen Transitions', async () => {
        const screenManager = window.game?.screenManager;
        if (!screenManager) throw new Error('ScreenManager not found');
        
        const screens = ['screen-menu', 'screen-game', 'screen-map', 'screen-stats', 
                        'screen-career', 'screen-shop', 'screen-office', 'screen-clients'];
        
        for (const screenId of screens) {
            try {
                screenManager.showScreen(screenId);
                await wait(100);
            } catch (e) {
                throw new Error(`Failed to show screen ${screenId}: ${e.message}`);
            }
        }
    });
    
    // Test 4: Test NPC conversations
    await safeExecute('NPC Conversations', async () => {
        const npcManager = window.game?.gameState?.npcManager;
        if (npcManager) {
            const npcs = npcManager.getAllNPCs();
            for (const npc of npcs.slice(0, 3)) { // Test first 3 NPCs
                try {
                    if (npcManager.startConversation) {
                        npcManager.startConversation(npc.id);
                        await wait(100);
                        // Try to get dialogue
                        if (npcManager.getCurrentDialogue) {
                            const dialogue = npcManager.getCurrentDialogue();
                            if (dialogue === null) {
                                throw new Error(`No dialogue returned for NPC ${npc.id}`);
                            }
                        }
                    }
                } catch (e) {
                    throw new Error(`NPC conversation failed for ${npc.id}: ${e.message}`);
                }
            }
        }
    });
    
    // Test 5: Test Task System
    await safeExecute('Task System', async () => {
        const taskSystem = window.game?.taskSystem;
        if (taskSystem) {
            // Try to get current task
            const currentTask = taskSystem.getCurrentTask?.();
            
            // Try to complete a task (if exists)
            if (currentTask && taskSystem.completeTask) {
                // Don't actually complete, just test the method exists
            }
        }
    });
    
    // Test 6: Test Map Navigation
    await safeExecute('Map Navigation', async () => {
        const mapSystem = window.game?.gameState?.worldMap;
        if (mapSystem) {
            // Test getting locations
            if (mapSystem.getLocations) {
                const locations = mapSystem.getLocations();
                if (!Array.isArray(locations)) {
                    throw new Error('getLocations() did not return an array');
                }
            }
            
            // Test getting current location
            if (mapSystem.getCurrentLocation) {
                const location = mapSystem.getCurrentLocation();
                if (location === undefined) {
                    throw new Error('getCurrentLocation() returned undefined');
                }
            }
        }
    });
    
    // Test 7: Test Environment Manager
    await safeExecute('Environment Manager', async () => {
        const envManager = window.game?.environmentManager;
        if (envManager) {
            // Test state getter
            if (envManager.getState) {
                const state = envManager.getState();
                if (!state || typeof state !== 'object') {
                    throw new Error('getState() returned invalid state');
                }
            }
            
            // Test location update
            if (envManager.updateLocation) {
                const location = envManager.updateLocation();
                if (!location) {
                    throw new Error('updateLocation() returned null/undefined');
                }
            }
        }
    });
    
    // Test 8: Test Chart Creation
    await safeExecute('Chart Creation', async () => {
        const chartManager = window.game?.chartManager;
        if (chartManager) {
            // Test creating a simple chart
            if (chartManager.createChart) {
                const testData = {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{
                        label: 'Test',
                        data: [10, 20, 30, 40]
                    }]
                };
                try {
                    const chart = chartManager.createChart('test-canvas', 'bar', testData);
                    // Chart should be created without errors
                } catch (e) {
                    throw new Error(`Chart creation failed: ${e.message}`);
                }
            }
        }
    });
    
    // Test 9: Test Save/Load
    await safeExecute('Save/Load System', async () => {
        const saveManager = window.game?.saveManager;
        if (saveManager) {
            // Test save
            if (saveManager.save) {
                try {
                    await saveManager.save(0, window.game.gameState);
                } catch (e) {
                    throw new Error(`Save failed: ${e.message}`);
                }
            }
            
            // Test load
            if (saveManager.load) {
                try {
                    const save = saveManager.load(0);
                    // Load should not throw, but may return null
                } catch (e) {
                    throw new Error(`Load failed: ${e.message}`);
                }
            }
        }
    });
    
    // Test 10: Test UI Updates
    await safeExecute('UI Updates', async () => {
        const uiUpdater = window.game?.uiUpdater;
        if (uiUpdater) {
            if (uiUpdater.updateAllUI) {
                try {
                    uiUpdater.updateAllUI();
                } catch (e) {
                    throw new Error(`updateAllUI() failed: ${e.message}`);
                }
            }
        }
    });
    
    // Test 11: Test Economy System
    await safeExecute('Economy System', async () => {
        const economy = window.game?.gameState?.economySystem;
        if (economy) {
            // Test getting money
            if (economy.getMoney !== undefined) {
                const money = economy.getMoney?.();
                if (money === undefined) {
                    throw new Error('getMoney() returned undefined');
                }
            }
        }
    });
    
    // Test 12: Test Bank System
    await safeExecute('Bank System', async () => {
        const bankSystem = window.game?.gameState?.bankSystem || window.game?.bankSystem;
        if (bankSystem) {
            // Test getting balance
            if (bankSystem.getBalance) {
                try {
                    const balance = bankSystem.getBalance();
                    if (balance === undefined) {
                        throw new Error('getBalance() returned undefined');
                    }
                } catch (e) {
                    throw new Error(`Bank balance check failed: ${e.message}`);
                }
            }
        }
    });
    
    // Test 13: Test Character Stats
    await safeExecute('Character Stats', async () => {
        const stats = window.game?.gameState?.characterStats;
        if (stats) {
            // Test getting stats
            if (stats.getStats) {
                const allStats = stats.getStats();
                if (!allStats || typeof allStats !== 'object') {
                    throw new Error('getStats() returned invalid object');
                }
            }
        }
    });
    
    // Test 14: Test All Button Clicks (safely)
    await safeExecute('Button Interactions', async () => {
        const buttons = document.querySelectorAll('button:not([disabled])');
        let clicked = 0;
        let errors = 0;
        
        for (const btn of Array.from(buttons).slice(0, 20)) { // Limit to first 20
            try {
                if (btn.id && !btn.id.includes('btn-new-game')) { // Skip new game button
                    btn.click();
                    clicked++;
                    await wait(50);
                }
            } catch (e) {
                errors++;
            }
        }
        
        if (errors > clicked / 2) {
            throw new Error(`Too many button click errors: ${errors} out of ${clicked}`);
        }
    });
    
    // Test 15: Test Event System
    await safeExecute('Event System', async () => {
        const eventSystem = window.game?.gameState?.eventSystem;
        if (eventSystem) {
            // Test getting events
            if (eventSystem.getEvents) {
                const events = eventSystem.getEvents();
                if (!Array.isArray(events)) {
                    throw new Error('getEvents() did not return an array');
                }
            }
        }
    });
    
    // Restore console
    console.error = originalError;
    console.warn = originalWarn;
    
    // Collect errors from logs
    const recentErrors = errorLog.filter(e => e.time >= startTime);
    const recentWarns = warnLog.filter(w => w.time >= startTime);
    
    // Report results
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Speed-Run Bug Finder Complete!');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🐛 Bugs Found: ${bugs.length}`);
    console.log(`❌ Errors Logged: ${recentErrors.length}`);
    console.log(`⚠️  Warnings Logged: ${recentWarns.length}`);
    
    if (bugs.length > 0) {
        console.log('\n📋 BUGS FOUND:');
        bugs.forEach((bug, i) => {
            console.log(`\n${i + 1}. ${bug.test}`);
            console.log(`   Error: ${bug.error}`);
            if (bug.stack) {
                console.log(`   Stack: ${bug.stack.split('\n').slice(0, 3).join('\n')}`);
            }
        });
    }
    
    if (recentErrors.length > 0) {
        console.log('\n📋 ERRORS IN CONSOLE:');
        recentErrors.forEach((err, i) => {
            console.log(`${i + 1}. ${err.args.join(' ')}`);
        });
    }
    
    if (bugs.length === 0 && recentErrors.length === 0) {
        console.log('\n✨ No bugs found! All tests passed!');
    }
    
    console.log('\n' + '='.repeat(60));
    
    return {
        bugs,
        errors: recentErrors,
        warnings: recentWarns,
        duration
    };
};

console.log('✅ Speed-Run Bug Finder loaded!');
console.log('🚀 Run: speedRunBugFinder()');
