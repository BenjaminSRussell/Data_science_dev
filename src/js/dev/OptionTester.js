/**
 * Option Testing System
 * Tests all clickable options and buttons to ensure they don't crash
 */

export class OptionTester {
    constructor(game) {
        this.game = game;
        this.results = [];
    }

    async testAll() {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: [],
            screens: []
        };

        // Test all buttons
        const buttons = this.getAllButtons();
        results.total = buttons.length;

        for (const btn of buttons) {
            try {
                const testResult = await this.testButton(btn);
                if (testResult.success) {
                    results.passed++;
                } else {
                    results.failed++;
                    results.errors.push({
                        element: this.getElementId(btn),
                        error: testResult.error
                    });
                }
                await this.wait(50); // Small delay between tests
            } catch (error) {
                results.failed++;
                results.errors.push({
                    element: this.getElementId(btn),
                    error: error.message
                });
            }
        }

        // Test screen-specific options
        const screens = ['screen-game', 'screen-map', 'screen-stats'];
        for (const screenId of screens) {
            try {
                if (this.game.screenManager) {
                    this.game.screenManager.showScreen(screenId);
                    await this.wait(200);
                    const screenResults = await this.testScreenOptions(screenId);
                    results.screens.push({ screen: screenId, ...screenResults });
                }
            } catch (error) {
                results.errors.push({ screen: screenId, error: error.message });
            }
        }

        this.results = results;
        return results;
    }

    getAllButtons() {
        // Get all clickable elements
        const selectors = [
            'button:not([disabled])',
            '[role="button"]:not([disabled])',
            '.clickable',
            '.nav-btn',
            '.menu-btn',
            '.dev-btn'
        ];

        const buttons = new Set();
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(btn => {
                // Skip dev menu buttons
                if (!btn.closest('#dev-menu') && !btn.id.includes('dev-')) {
                    buttons.add(btn);
                }
            });
        });

        return Array.from(buttons);
    }

    async testButton(button) {
        try {
            // Store original state
            const originalDisabled = button.disabled;
            const originalVisible = button.offsetParent !== null;

            // Skip if not visible
            if (!originalVisible) {
                return { success: true, skipped: true, reason: 'not visible' };
            }

            // Skip if disabled
            if (originalDisabled) {
                return { success: true, skipped: true, reason: 'disabled' };
            }

            // Test click
            button.click();

            // Check for immediate errors
            await this.wait(100);

            // Verify button still exists (not removed by crash)
            if (!document.contains(button) && !button.isConnected) {
                return { success: false, error: 'Element removed after click' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testScreenOptions(screenId) {
        const screen = document.getElementById(screenId);
        if (!screen) {
            return { error: 'Screen not found' };
        }

        const buttons = screen.querySelectorAll('button:not([disabled]), [role="button"]:not([disabled])');
        const results = {
            total: buttons.length,
            passed: 0,
            failed: 0,
            errors: []
        };

        for (const btn of Array.from(buttons).slice(0, 20)) { // Limit to 20 per screen
            try {
                btn.click();
                await this.wait(50);
                results.passed++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    element: this.getElementId(btn),
                    error: error.message
                });
            }
        }

        return results;
    }

    testDropdownOptions(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) {
            return { error: 'Dropdown not found' };
        }

        const options = dropdown.querySelectorAll('option, [role="option"]');
        const results = {
            total: options.length,
            passed: 0,
            failed: 0
        };

        options.forEach((option, index) => {
            try {
                dropdown.selectedIndex = index;
                dropdown.dispatchEvent(new Event('change'));
                results.passed++;
            } catch (error) {
                results.failed++;
            }
        });

        return results;
    }

    testInputFields() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
        const results = {
            total: inputs.length,
            passed: 0,
            failed: 0,
            errors: []
        };

        inputs.forEach(input => {
            try {
                // Test input
                input.value = 'test';
                input.dispatchEvent(new Event('input'));
                
                // Test clearing
                input.value = '';
                input.dispatchEvent(new Event('input'));
                
                results.passed++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    element: this.getElementId(input),
                    error: error.message
                });
            }
        });

        return results;
    }

    getElementId(element) {
        return element.id || element.className || element.tagName || 'unknown';
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

