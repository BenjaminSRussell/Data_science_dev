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

    describe('testDropdownOptions', () => {
        function makeSelect(id, values, selectedIndex = 0) {
            const select = document.createElement('select');
            if (id) select.id = id;
            values.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
            select.selectedIndex = selectedIndex;
            document.body.appendChild(select);
            return select;
        }

        it('cycles every option by id and restores the original selection', () => {
            const select = makeSelect('settings-quality', ['low', 'medium', 'high'], 1);
            const seen = [];
            select.addEventListener('change', () => seen.push(select.value));

            const result = optionTester.testDropdownOptions('settings-quality');

            expect(result).toEqual({ total: 3, passed: 3, failed: 0 });
            expect(seen).toEqual(['low', 'medium', 'high', 'medium']);
            expect(select.value).toBe('medium');
        });

        it('accepts a select element that has no id', () => {
            const select = makeSelect('', ['only']);

            const result = optionTester.testDropdownOptions(select);

            expect(result).toEqual({ total: 1, passed: 1, failed: 0 });
            expect(result.error).toBeUndefined();
        });

        it('returns an error when the dropdown id is missing', () => {
            expect(optionTester.testDropdownOptions('missing-dropdown')).toEqual({
                error: 'Dropdown not found'
            });
        });
    });

    describe('testInputFields', () => {
        it('exercises text, number, and textarea values then restores them', () => {
            const text = document.createElement('input');
            text.type = 'text';
            text.value = 'keep-me';
            const number = document.createElement('input');
            number.type = 'number';
            number.value = '4';
            const area = document.createElement('textarea');
            area.value = 'note';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            document.body.append(text, number, area, checkbox);

            const result = optionTester.testInputFields();

            expect(result.total).toBe(3);
            expect(result.passed).toBe(3);
            expect(result.failed).toBe(0);
            expect(result.errors).toEqual([]);
            expect(text.value).toBe('keep-me');
            expect(number.value).toBe('4');
            expect(area.value).toBe('note');
        });

        it('skips inputs inside the dev menu and inputs with dev- ids', () => {
            const menu = document.createElement('div');
            menu.id = 'dev-menu';
            const menuInput = document.createElement('input');
            menuInput.type = 'text';
            menuInput.value = 'npc';
            menu.appendChild(menuInput);
            const devId = document.createElement('input');
            devId.type = 'text';
            devId.id = 'dev-npc-input';
            devId.value = 'leave';
            document.body.append(menu, devId);

            const result = optionTester.testInputFields();

            expect(result.total).toBe(0);
            expect(menuInput.value).toBe('npc');
            expect(devId.value).toBe('leave');
        });
    });

    describe('testAll', () => {
        it('runs dropdown and input smoke tests and skips dev-menu controls', async () => {
            optionTester.wait = () => Promise.resolve();

            const select = document.createElement('select');
            select.id = 'settings-quality';
            const option = document.createElement('option');
            option.value = 'low';
            select.appendChild(option);
            select.selectedIndex = 0;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = 'hello';

            const dev = document.createElement('div');
            dev.id = 'dev-menu';
            const devSelect = document.createElement('select');
            devSelect.id = 'dev-storyline-phase';
            const devOption = document.createElement('option');
            devOption.value = '1';
            devSelect.appendChild(devOption);
            const devInput = document.createElement('input');
            devInput.type = 'text';
            devInput.value = 'npc-id';
            dev.append(devSelect, devInput);
            document.body.append(select, input, dev);

            const dropdownSpy = vi.spyOn(optionTester, 'testDropdownOptions');
            const inputSpy = vi.spyOn(optionTester, 'testInputFields');

            const results = await optionTester.testAll();

            expect(dropdownSpy).toHaveBeenCalledTimes(1);
            expect(dropdownSpy).toHaveBeenCalledWith('settings-quality');
            expect(inputSpy).toHaveBeenCalledTimes(1);
            expect(results.dropdowns).toEqual([
                { element: 'settings-quality', total: 1, passed: 1, failed: 0 }
            ]);
            expect(results.inputs.total).toBe(1);
            expect(results.inputs.passed).toBe(1);
            expect(input.value).toBe('hello');
            expect(devInput.value).toBe('npc-id');
            expect(select.value).toBe('low');
        });
    });
});
