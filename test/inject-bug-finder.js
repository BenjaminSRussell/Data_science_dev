/**
 * Injectable Bug Finder - Copy-paste into browser console
 * Quick bug detection for immediate use
 */

(function() {
    'use strict';
    
    const bugs = [];
    const errors = [];
    const warnings = [];
    
    // Capture console errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
        warnings.push(args.join(' '));
        originalWarn.apply(console, args);
    };
    
    // Quick test runner
    function quickTest(name, testFn) {
        try {
            const result = testFn();
            if (result === false || result === undefined) {
                bugs.push(name + ': returned false/undefined');
            }
            return true;
        } catch (e) {
            bugs.push(name + ': ' + e.message);
            return false;
        }
    }
    
    // Run all quick tests
    console.log('🔍 Quick Bug Scan Starting...');
    
    quickTest('Game object exists', () => typeof window.game !== 'undefined');
    quickTest('GameState exists', () => window.game?.gameState);
    quickTest('ScreenManager exists', () => window.game?.screenManager);
    quickTest('TaskSystem exists', () => window.game?.taskSystem);
    quickTest('ChartManager exists', () => window.game?.chartManager);
    quickTest('EnvironmentManager exists', () => window.game?.environmentManager);
    
    // Test critical methods
    if (window.game?.screenManager) {
        quickTest('ScreenManager.showScreen method', () => typeof window.game.screenManager.showScreen === 'function');
    }
    
    if (window.game?.taskSystem) {
        quickTest('TaskSystem.getCurrentTask method', () => typeof window.game.taskSystem.getCurrentTask === 'function');
    }
    
    // Test DOM elements
    quickTest('Game container exists', () => document.getElementById('game-container'));
    quickTest('Screen container exists', () => document.getElementById('screen-container'));
    
    // Test for common error patterns
    const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
    quickTest('Module scripts loaded', () => scripts.length > 0);
    
    // Restore console
    console.error = originalError;
    console.warn = originalWarn;
    
    // Report
    console.log('\n📊 Quick Bug Scan Results:');
    console.log('Bugs:', bugs.length);
    console.log('Errors:', errors.length);
    console.log('Warnings:', warnings.length);
    
    if (bugs.length > 0) {
        console.log('\n🐛 Bugs:');
        bugs.forEach((b, i) => console.log(`${i+1}. ${b}`));
    }
    
    if (errors.length > 0) {
        console.log('\n❌ Recent Errors:');
        errors.slice(-10).forEach((e, i) => console.log(`${i+1}. ${e}`));
    }
    
    return { bugs, errors, warnings };
})();
