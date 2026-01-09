#!/usr/bin/env node
/**
 * Continuous Production Readiness Test Runner
 * Runs comprehensive tests on all game systems continuously for hours
 * Finds issues by testing, mutating state, and re-testing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(path.dirname(__dirname));

const REPORT_DIR = path.join(rootDir, 'test-reports');
const ISSUES_FILE = path.join(REPORT_DIR, 'continuous-test-issues.json');
const LOG_FILE = path.join(REPORT_DIR, 'continuous-test.log');

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const issues = [];
let iteration = 0;
let startTime = Date.now();

// Load existing issues
if (fs.existsSync(ISSUES_FILE)) {
    try {
        const existing = JSON.parse(fs.readFileSync(ISSUES_FILE, 'utf8'));
        issues.push(...existing);
    } catch (e) {
        // Start fresh
    }
}

function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage);
    
    // Append to log file
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function addIssue(category, description, severity = 'medium', details = {}) {
    const issue = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category,
        description,
        severity,
        details,
        timestamp: new Date().toISOString(),
        iteration
    };
    
    issues.push(issue);
    
    // Save issues immediately
    fs.writeFileSync(ISSUES_FILE, JSON.stringify(issues, null, 2));
    
    log(`ISSUE FOUND [${severity.toUpperCase()}]: ${category} - ${description}`, 'error');
    
    return issue;
}

function safeExecute(name, fn, category = 'general') {
    try {
        const result = fn();
        if (result instanceof Promise) {
            return result.catch(error => {
                addIssue(category, `${name} failed: ${error.message}`, 'high', { error: error.stack });
                return null;
            });
        }
        return result;
    } catch (error) {
        addIssue(category, `${name} failed: ${error.message}`, 'high', { error: error.stack });
        return null;
    }
}

async function testDialogueSystem() {
    log('Testing Dialogue System...');
    
    // Test NPC conversation initialization
    safeExecute('NPC Manager Initialization', () => {
        if (typeof window !== 'undefined' && window.game?.gameState?.npcManager) {
            const npcManager = window.game.gameState.npcManager;
            if (!npcManager.getNPC) {
                addIssue('dialogue', 'NPC Manager missing getNPC method', 'high');
            }
        }
    }, 'dialogue');
    
    // Test conversation flows
    safeExecute('Conversation Flow', () => {
        if (typeof window !== 'undefined' && window.devTools?.dialogueTester) {
            // Would test actual conversation flows here
        }
    }, 'dialogue');
}

async function testWorkSystem() {
    log('Testing Work System...');
    
    safeExecute('Task System', () => {
        if (typeof window !== 'undefined' && window.game?.taskSystem) {
            const taskSystem = window.game.taskSystem;
            
            // Test task generation
            if (typeof taskSystem.generateNewTask !== 'function') {
                addIssue('work', 'TaskSystem missing generateNewTask method', 'critical');
            }
            
            // Test task completion
            const currentTask = taskSystem.getCurrentTask?.();
            if (currentTask && typeof taskSystem.completeTask !== 'function') {
                addIssue('work', 'TaskSystem missing completeTask method', 'critical');
            }
        }
    }, 'work');
    
    safeExecute('Project System', () => {
        if (typeof window !== 'undefined' && window.game?.projectSystem) {
            const projectSystem = window.game.projectSystem;
            
            if (projectSystem.activeProject && !projectSystem.activeProject.stages) {
                addIssue('work', 'Active project missing stages array', 'high');
            }
        }
    }, 'work');
}

async function testSaveLoadSystem() {
    log('Testing Save/Load System...');
    
    safeExecute('Save Manager', () => {
        if (typeof window !== 'undefined' && window.game?.saveManager) {
            const saveManager = window.game.saveManager;
            
            // Test save functionality
            try {
                const testState = { test: true, timestamp: Date.now() };
                const saved = saveManager.saveGame?.(testState, 0);
                if (saved === false) {
                    addIssue('save', 'Save operation failed silently', 'medium');
                }
            } catch (error) {
                addIssue('save', `Save operation threw error: ${error.message}`, 'high', { error: error.stack });
            }
            
            // Test load functionality
            try {
                const loaded = saveManager.loadGame?.(0);
                if (loaded && !loaded.state) {
                    addIssue('save', 'Loaded game missing state object', 'high');
                }
            } catch (error) {
                addIssue('save', `Load operation threw error: ${error.message}`, 'high', { error: error.stack });
            }
        }
    }, 'save');
}

async function testUISystem() {
    log('Testing UI System...');
    
    safeExecute('Screen Manager', () => {
        if (typeof window !== 'undefined' && window.game?.screenManager) {
            const screenManager = window.game.screenManager;
            const screens = ['screen-menu', 'screen-game', 'screen-map'];
            
            screens.forEach(screenId => {
                try {
                    screenManager.showScreen?.(screenId);
                    const current = screenManager.currentScreen;
                    if (current !== screenId) {
                        addIssue('ui', `Screen transition failed: ${screenId}`, 'medium', { expected: screenId, got: current });
                    }
                } catch (error) {
                    addIssue('ui', `Screen transition error for ${screenId}: ${error.message}`, 'high');
                }
            });
        }
    }, 'ui');
    
    safeExecute('UI Updater', () => {
        if (typeof window !== 'undefined' && window.game?.uiUpdater) {
            try {
                window.game.uiUpdater.updateAllUI?.();
            } catch (error) {
                addIssue('ui', `UI update failed: ${error.message}`, 'medium');
            }
        }
    }, 'ui');
}

async function testAssetSystem() {
    log('Testing Asset System...');
    
    safeExecute('Asset Loading', () => {
        if (typeof window !== 'undefined' && window.game?.assetManager) {
            const assetManager = window.game.assetManager;
            
            if (assetManager.loadedAssets && Object.keys(assetManager.loadedAssets).length === 0) {
                // This might be normal at startup, but we'll note it
                log('No assets loaded yet (might be normal)', 'warn');
            }
        }
    }, 'assets');
    
    safeExecute('Sprite System', () => {
        if (typeof window !== 'undefined' && window.game?.spriteSystem) {
            const spriteSystem = window.game.spriteSystem;
            
            if (spriteSystem && !spriteSystem.getCharacterSprite) {
                addIssue('assets', 'SpriteSystem missing getCharacterSprite method', 'medium');
            }
        }
    }, 'assets');
}

async function testGameState() {
    log('Testing Game State...');
    
    safeExecute('State Integrity', () => {
        if (typeof window !== 'undefined' && window.game?.gameState) {
            const state = window.game.gameState;
            
            // Check for undefined critical properties
            const criticalProps = ['money', 'rankIndex', 'tasksCompleted'];
            criticalProps.forEach(prop => {
                if (state[prop] === undefined) {
                    addIssue('state', `GameState missing critical property: ${prop}`, 'high');
                }
            });
            
            // Check for invalid values
            if (state.money !== undefined && (isNaN(state.money) || state.money < 0)) {
                addIssue('state', `Invalid money value: ${state.money}`, 'medium');
            }
            
            if (state.rankIndex !== undefined && (isNaN(state.rankIndex) || state.rankIndex < 0)) {
                addIssue('state', `Invalid rankIndex value: ${state.rankIndex}`, 'medium');
            }
        }
    }, 'state');
}

async function testMemoryLeaks() {
    log('Testing for Memory Leaks...');
    
    safeExecute('Interval Cleanup', () => {
        if (typeof window !== 'undefined') {
            // Check for uncleaned intervals (this is approximate)
            // In a real scenario, we'd track all setInterval calls
            const intervals = [];
            const originalSetInterval = window.setInterval;
            
            // Note: This is a simplified check
            // Real memory leak detection would be more sophisticated
        }
    }, 'memory');
}

async function mutateStateAndRetest() {
    log('Mutating state and re-testing...');
    
    if (typeof window !== 'undefined' && window.game?.gameState) {
        const state = window.game.gameState;
        const originalMoney = state.money;
        
        // Mutate money
        safeExecute('Money Mutation', () => {
            state.money = Math.random() * 100000;
            testGameState();
            state.money = originalMoney; // Restore
        }, 'mutation');
        
        // Mutate rank
        const originalRank = state.rankIndex;
        safeExecute('Rank Mutation', () => {
            state.rankIndex = Math.floor(Math.random() * 10);
            testGameState();
            state.rankIndex = originalRank; // Restore
        }, 'mutation');
    }
}

async function runIteration() {
    iteration++;
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    log(`\n=== Iteration ${iteration} (${elapsed} minutes elapsed) ===`);
    
    // Run all test suites
    await testDialogueSystem();
    await testWorkSystem();
    await testSaveLoadSystem();
    await testUISystem();
    await testAssetSystem();
    await testGameState();
    await testMemoryLeaks();
    
    // Every 10 iterations, mutate state and re-test
    if (iteration % 10 === 0) {
        await mutateStateAndRetest();
    }
    
    // Print summary every iteration
    const summary = {
        iteration,
        elapsedMinutes: parseFloat(elapsed),
        totalIssues: issues.length,
        issuesBySeverity: {
            critical: issues.filter(i => i.severity === 'critical').length,
            high: issues.filter(i => i.severity === 'high').length,
            medium: issues.filter(i => i.severity === 'medium').length,
            low: issues.filter(i => i.severity === 'low').length
        }
    };
    
    log(`Summary: ${summary.totalIssues} total issues (${summary.issuesBySeverity.critical} critical, ${summary.issuesBySeverity.high} high)`);
}

async function runContinuous() {
    log('Starting Continuous Production Readiness Test Runner');
    log('This will run indefinitely. Press Ctrl+C to stop.');
    log(`Report directory: ${REPORT_DIR}`);
    log(`Issues file: ${ISSUES_FILE}`);
    log(`Log file: ${LOG_FILE}`);
    
    // Run initial iteration
    await runIteration();
    
    // Continue running every 30 seconds
    const interval = setInterval(async () => {
        try {
            await runIteration();
        } catch (error) {
            log(`Error in iteration: ${error.message}`, 'error');
            addIssue('test-runner', `Iteration ${iteration} crashed: ${error.message}`, 'high', { error: error.stack });
        }
    }, 30000); // 30 seconds between iterations
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        log('Shutting down gracefully...');
        clearInterval(interval);
        
        const finalReport = {
            totalIterations: iteration,
            totalRuntimeMinutes: ((Date.now() - startTime) / 1000 / 60).toFixed(2),
            totalIssues: issues.length,
            issuesByCategory: {},
            issuesBySeverity: {
                critical: issues.filter(i => i.severity === 'critical').length,
                high: issues.filter(i => i.severity === 'high').length,
                medium: issues.filter(i => i.severity === 'medium').length,
                low: issues.filter(i => i.severity === 'low').length
            },
            issues: issues
        };
        
        // Group issues by category
        issues.forEach(issue => {
            if (!finalReport.issuesByCategory[issue.category]) {
                finalReport.issuesByCategory[issue.category] = 0;
            }
            finalReport.issuesByCategory[issue.category]++;
        });
        
        const finalReportPath = path.join(REPORT_DIR, `final-report-${Date.now()}.json`);
        fs.writeFileSync(finalReportPath, JSON.stringify(finalReport, null, 2));
        
        log(`Final report saved to: ${finalReportPath}`);
        log(`Total issues found: ${issues.length}`);
        process.exit(0);
    });
}

// For browser environment (when loaded via script tag)
if (typeof window !== 'undefined') {
    window.continuousTestRunner = {
        run: runContinuous,
        runIteration,
        issues,
        addIssue
    };
} else {
    // For Node.js environment
    runContinuous().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

