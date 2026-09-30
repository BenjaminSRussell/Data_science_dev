/**
 * Unit tests for OptionTester
 * Tests button discovery, dedup, and skip logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OptionTester } from '../../src/js/dev/OptionTester.js';

describe('OptionTester', () => {
    let optionTester;
    let mockGame;

    beforeEach(() => {
        mockGame = {
            screenManager: null
        };
        optionTester = new OptionTester(mockGame);
    });

    afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
    });

    describe('getElementId', () => {
        it('should use element.id when present and non-empty', () => {
            const element = document.createElement('button');
            element.id = 'my-button';
            element.className = 'clickable';

            const id = optionTester.getElementId(element);
            expect(id).toBe('my-button');
        });

        it('should fall back to element.className when id is empty', () => {
            const element = document.createElement('button');
            element.id = '';
            element.className = 'clickable-btn';

            const id = optionTester.getElementId(element);
            expect(id).toBe('clickable-btn');
        });

        it('should fall back to element.tagName when id and className are empty', () => {
            const element = document.createElement('button');
            element.id = '';
            element.className = '';

            const id = optionTester.getElementId(element);
            expect(id).toBe('BUTTON');
        });

        it('should never return "unknown" for real elements since all have non-empty tagName', () => {
            // This test documents the fallback chain
            const element = document.createElement('div');
            element.id = '';
            element.className = '';
            // All elements have a tagName, so 'unknown' is unreachable
            const id = optionTester.getElementId(element);
            expect(id).toBe('DIV');
        });

        it('should use multiple className values', () => {
            const element = document.createElement('div');
            element.id = '';
            element.className = 'class1 class2 class3';
            const id = optionTester.getElementId(element);
            expect(id).toBe('class1 class2 class3');
        });
    });

    describe('getAllButtons', () => {
        it('should find plain button elements', () => {
            const button = document.createElement('button');
            button.id = 'regular-btn';
            document.body.appendChild(button);

            const buttons = optionTester.getAllButtons();
            expect(buttons.length).toBe(1);
            expect(buttons[0]).toBe(button);
        });

        it('should find elements with role="button"', () => {
            const div = document.createElement('div');
            div.id = 'role-btn';
            div.setAttribute('role', 'button');
            document.body.appendChild(div);

            const buttons = optionTester.getAllButtons();
            expect(buttons.length).toBe(1);
            expect(buttons[0]).toBe(div);
        });

        it('should find elements with class="clickable"', () => {
            const span = document.createElement('span');
            span.id = 'clickable-span';
            span.className = 'clickable';
            document.body.appendChild(span);

            const buttons = optionTester.getAllButtons();
            expect(buttons.length).toBe(1);
            expect(buttons[0]).toBe(span);
        });

        it('should deduplicate elements matching multiple selectors', () => {
            // Element matches both 'button' and '.clickable' selectors
            const button = document.createElement('button');
            button.id = 'dual-match-btn';
            button.className = 'clickable';
            document.body.appendChild(button);

            const buttons = optionTester.getAllButtons();
            // Set-based dedup should collapse duplicate match into single element
            expect(buttons.length).toBe(1);
            expect(buttons[0]).toBe(button);
        });

        it('should exclude buttons with dev-prefixed IDs', () => {
            const button = document.createElement('button');
            button.id = 'dev-something-btn';
            document.body.appendChild(button);

            const buttons = optionTester.getAllButtons();
            expect(buttons.length).toBe(0);
        });

        it('should exclude buttons inside dev-menu container', () => {
            const menu = document.createElement('div');
            menu.id = 'dev-menu';
            const button = document.createElement('button');
            button.id = 'menu-btn';
            menu.appendChild(button);
            document.body.appendChild(menu);

            const buttons = optionTester.getAllButtons();
            expect(buttons.length).toBe(0);
        });

        it('should handle mixed fixture with real and excluded buttons', () => {
            // Plain button
            const plainBtn = document.createElement('button');
            plainBtn.id = 'plain-btn';
            document.body.appendChild(plainBtn);

            // Role button
            const roleBtn = document.createElement('div');
            roleBtn.id = 'role-btn';
            roleBtn.setAttribute('role', 'button');
            document.body.appendChild(roleBtn);

            // Clickable class
            const clickable = document.createElement('span');
            clickable.id = 'clickable-span';
            clickable.className = 'clickable';
            document.body.appendChild(clickable);

            // Dual match (button + clickable)
            const dualBtn = document.createElement('button');
            dualBtn.id = 'dual-btn';
            dualBtn.className = 'clickable';
            document.body.appendChild(dualBtn);

            // Dev-prefixed (excluded)
            const devBtn = document.createElement('button');
            devBtn.id = 'dev-excluded-btn';
            document.body.appendChild(devBtn);

            // Inside dev-menu (excluded)
            const menu = document.createElement('div');
            menu.id = 'dev-menu';
            const menuBtn = document.createElement('button');
            menuBtn.id = 'menu-btn';
            menu.appendChild(menuBtn);
            document.body.appendChild(menu);

            const buttons = optionTester.getAllButtons();
            // Should have 4: plainBtn, roleBtn, clickable, dualBtn
            // Should exclude: devBtn, menuBtn
            expect(buttons.length).toBe(4);
            expect(buttons).toContain(plainBtn);
            expect(buttons).toContain(roleBtn);
            expect(buttons).toContain(clickable);
            expect(buttons).toContain(dualBtn);
            expect(buttons).not.toContain(devBtn);
            expect(buttons).not.toContain(menuBtn);
        });
    });

    describe('testButton', () => {
        it('should test visible enabled button with normal click path', async () => {
            const button = document.createElement('button');
            button.id = 'test-btn';
            document.body.appendChild(button);

            // Stub offsetParent to truthy value to indicate visibility
            Object.defineProperty(button, 'offsetParent', {
                value: document.body,
                configurable: true
            });

            const result = await optionTester.testButton(button);

            expect(result.success).toBe(true);
            expect(result.skipped).toBeUndefined();
            expect(result.reason).toBeUndefined();
        });

        it('should skip button when offsetParent is null (jsdom default not visible)', async () => {
            const button = document.createElement('button');
            button.id = 'invisible-btn';
            document.body.appendChild(button);

            // jsdom default: offsetParent is null for all elements
            // No need to stub, just verify the default behavior
            const result = await optionTester.testButton(button);

            expect(result.success).toBe(true);
            expect(result.skipped).toBe(true);
            expect(result.reason).toBe('not visible');
        });

        it('should skip disabled button even when visible', async () => {
            const button = document.createElement('button');
            button.id = 'disabled-btn';
            button.disabled = true;
            document.body.appendChild(button);

            // Stub offsetParent to truthy value
            Object.defineProperty(button, 'offsetParent', {
                value: document.body,
                configurable: true
            });

            const result = await optionTester.testButton(button);

            expect(result.success).toBe(true);
            expect(result.skipped).toBe(true);
            expect(result.reason).toBe('disabled');
        });

        it('should fail when click handler removes button from DOM', async () => {
            const button = document.createElement('button');
            button.id = 'self-removing-btn';
            document.body.appendChild(button);

            // Stub offsetParent to truthy value
            Object.defineProperty(button, 'offsetParent', {
                value: document.body,
                configurable: true
            });

            // Add click handler that removes button
            button.addEventListener('click', () => {
                document.body.removeChild(button);
            });

            const result = await optionTester.testButton(button);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Element removed after click');
        });

        it('should succeed even if click handler throws (error handled by handler itself)', async () => {
            const button = document.createElement('button');
            button.id = 'error-btn';
            document.body.appendChild(button);

            // Stub offsetParent to truthy value
            Object.defineProperty(button, 'offsetParent', {
                value: document.body,
                configurable: true
            });

            // Add click handler that catches its own error
            button.addEventListener('click', () => {
                try {
                    throw new Error('Internal error');
                } catch (e) {
                    // Handler handles its own error
                }
            });

            const result = await optionTester.testButton(button);

            expect(result.success).toBe(true);
        });

        it('should wait between internal calls with real timers', async () => {
            const button = document.createElement('button');
            button.id = 'wait-btn';
            document.body.appendChild(button);

            // Stub offsetParent to truthy value
            Object.defineProperty(button, 'offsetParent', {
                value: document.body,
                configurable: true
            });

            let clickTime = 0;
            let checkTime = 0;

            button.addEventListener('click', () => {
                clickTime = Date.now();
            });

            const start = Date.now();
            await optionTester.testButton(button);
            checkTime = Date.now();

            // The wait(100) inside testButton should cause a delay
            // Total time should be at least close to 100ms (allowing some tolerance)
            const elapsed = checkTime - start;
            expect(elapsed).toBeGreaterThanOrEqual(80); // Allow some tolerance
        });

        it('should preserve button disabled state after test', async () => {
            const button = document.createElement('button');
            button.id = 'test-btn';
            button.disabled = false;
            document.body.appendChild(button);

            // Stub offsetParent to truthy value
            Object.defineProperty(button, 'offsetParent', {
                value: document.body,
                configurable: true
            });

            await optionTester.testButton(button);

            expect(button.disabled).toBe(false);
        });

        it('should check isConnected in addition to document.contains', async () => {
            const button = document.createElement('button');
            button.id = 'connected-btn';
            document.body.appendChild(button);

            // Stub offsetParent to truthy value
            Object.defineProperty(button, 'offsetParent', {
                value: document.body,
                configurable: true
            });

            // Remove from DOM
            document.body.removeChild(button);

            const result = await optionTester.testButton(button);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Element removed after click');
        });
    });

    describe('wait', () => {
        it('should resolve after specified milliseconds', async () => {
            const start = Date.now();
            await optionTester.wait(50);
            const elapsed = Date.now() - start;

            expect(elapsed).toBeGreaterThanOrEqual(40); // Allow some tolerance
        });
    });
});
