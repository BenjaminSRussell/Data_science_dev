/**
 * OptionTester.js
 * Developer utility for testing UI options
 */

import BaseComponent from './BaseComponent.js';
import { html, css } from 'lit';

export class OptionTester extends BaseComponent {
    static properties = {
        game: { type: Object }
    };

    static styles = css`
        :host {
            display: block;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        button {
            margin: 5px;
        }

        .results {
            margin-top: 20px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
    `;

    constructor() {
        super();
        this.game = null;
        this.results = {};
    }

    render() {
        return html`
            <div>
                <game-button label="Test All Options" onclick="${() => this.testAllOptions()}"></game-button>
                <game-button label="Test Buttons" onclick="${() => this.testButtons()}"></game-button>
                <game-button label="Test Dropdowns" onclick="${() => this.testDropdowns()}"></game-button>
                <game-button label="Test Inputs" onclick="${() => this.testInputs()}"></game-button>
            </div>
            ${this.results.total ? html`
                <div class="results">
                    <h3>Test Results</h3>
                    <p>Total Tests: ${this.results.total}</p>
                    <p>Passed: ${this.results.passed}</p>
                    <p>Failed: ${this.results.failed}</p>
                    ${this.results.errors.length > 0 ? html`
                        <h4>Errors</h4>
                        <ul>
                            ${this.results.errors.map(error => html`
                                <li>${error.element}: ${error.error}</li>
                            `)}
                        </ul>
                    ` : ''}
                </div>
            ` : ''}
        `;
    }

    async testAllOptions() {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            buttons: [],
            screens: [],
            errors: []
        };

        // Test all buttons
        const buttons = this.getAllButtons();
        for (const btn of buttons) {
            try {
                const buttonResults = await this.testButton(btn);
                results.buttons.push({ element: this.getElementId(btn), ...buttonResults });
                if (buttonResults.success) {
                    results.passed++;
                } else {
                    results.failed++;
                }
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
        // Fallback chain: element.id, element.className, element.tagName
        // Every element has a non-empty tagName, so 'unknown' is unreachable
        return element.id || element.className || element.tagName;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}