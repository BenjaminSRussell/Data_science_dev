/**
 * Auto-start continuous tests when game loads
 * Include this script in your HTML to automatically start testing
 */

export function isContinuousTestsEnabled(win = (typeof window !== 'undefined' ? window : undefined)) {
    if (!win) return false;
    try {
        if (win.localStorage?.getItem('continuousTestsDisabled')) return false;
        if (win.localStorage?.getItem('continuousTestsEnabled') === 'true') return true;
    } catch (_) { /* storage disabled */ }
    try {
        return new URLSearchParams(win.location?.search || '').has('autotest');
    } catch (_) {
        return false;
    }
}

export function autoStartContinuousTests(game) {
    // Wait a bit for game to fully initialize
    setTimeout(() => {
        if (typeof window !== 'undefined') {
            // Import and start the test runner
            import('./browser-test-runner.js').then(module => {
                const { BrowserContinuousTestRunner } = module;
                
                if (!window.continuousTestRunner) {
                    window.continuousTestRunner = new BrowserContinuousTestRunner(game);
                    
                    // Opt-in only: the runner navigates screens and exercises save
                    // slots, so it must never start on its own during normal dev (#2327).
                    const autoStart = isContinuousTestsEnabled();
                    
                    if (autoStart) {
                        console.log('%c🚀 Starting Continuous Test Runner automatically', 'color: #0f0; font-size: 14px; font-weight: bold;');
                        console.log('%cTests will run every 30 seconds. Check console for results.', 'color: #0f0;');
                        console.log('%cTo disable: localStorage.removeItem("continuousTestsEnabled")', 'color: #ff0;');
                        
                        window.continuousTestRunner.start(30000); // 30 seconds
                    } else {
                        console.log('Continuous tests are off. Enable with: localStorage.setItem("continuousTestsEnabled", "true") or add ?autotest to the URL');
                        console.log('To start manually: window.continuousTestRunner.start()');
                    }
                }
            }).catch(error => {
                console.error('Failed to load continuous test runner:', error);
            });
        }
    }, 5000); // Wait 5 seconds for game initialization
}

// Auto-start if game is available
if (typeof window !== 'undefined' && window.game) {
    autoStartContinuousTests(window.game);
} else if (typeof window !== 'undefined') {
    // Wait for game to be available
    const checkGame = setInterval(() => {
        if (window.game) {
            clearInterval(checkGame);
            autoStartContinuousTests(window.game);
        }
    }, 1000);
    
    // Give up after 60 seconds
    setTimeout(() => {
        clearInterval(checkGame);
    }, 60000);
}

