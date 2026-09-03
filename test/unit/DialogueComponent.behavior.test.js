/**
 * DialogueComponent.behavior.test.js
 *
 * Behavior tests for DialogueComponent: typewriter animation, choice/close
 * events, and the open/showNode/close lifecycle methods.
 *
 * This file establishes the fake-timer pattern for component tests in this
 * repo: `typeText` is a self-scheduling `setTimeout(type, speed)` loop that
 * appends one character per tick until the full text is typed, then sets
 * `isTyping = false`. We drive it with `vi.useFakeTimers()` +
 * `advanceTimersByTime()` / `runAllTimersAsync()`.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogueComponent } from '../../src/js/ui/components/DialogueComponent.js';

/**
 * Create and mount a fresh DialogueComponent.
 */
function createComponent() {
    const el = document.createElement('dialogue-component');
    document.body.appendChild(el);
    return el;
}

describe('DialogueComponent behavior', () => {
    let el;

    beforeEach(() => {
        vi.useFakeTimers();
        el = createComponent();
    });

    afterEach(() => {
        vi.useRealTimers();
        el.remove();
    });

    describe('open(npc, currentNode)', () => {
        it('immediately sets isOpen, npc, typingText and isTyping BEFORE advancing timers', () => {
            const npc = { name: 'Alice', title: 'Manager' };
            const node = { text: 'Hi' };

            el.open(npc, node);

            // Assert synchronously, before any timer has fired.
            expect(el.isOpen).toBe(true);
            expect(el.npc).toBe(npc);
            expect(el.currentNode).toBe(node);
            expect(el.typingText).toBe('');
            expect(el.isTyping).toBe(true);
        });

        it('completes the typewriter animation: typingText === node.text and isTyping === false', async () => {
            const npc = { name: 'Alice', title: 'Manager' };
            const node = { text: 'Hi' };

            el.open(npc, node);

            // Run all pending timers until the animation finishes.
            await vi.runAllTimersAsync();

            expect(el.typingText).toBe(node.text);
            expect(el.isTyping).toBe(false);
        });

        it('types one character per tick at the default speed of 30ms', () => {
            const npc = { name: 'Alice', title: 'Manager' };
            const node = { text: 'Hi' };

            el.open(npc, node);

            // First tick fires immediately inside typeText(); advance one more
            // tick to append the second character.
            vi.advanceTimersByTime(30);
            expect(el.typingText).toBe('Hi');
            expect(el.isTyping).toBe(false);
        });
    });

    describe('renderChoices()', () => {
        it('renders one button per choice and dispatches dialogue-choice with the exact choice object and node', async () => {
            const npc = { name: 'Alice', title: 'Manager' };
            const node = {
                text: 'Hi',
                choices: [{ text: 'Yes' }, { text: 'No' }]
            };

            el.open(npc, node);
            await vi.runAllTimersAsync();
            await el.updateComplete;

            const buttons = el.querySelectorAll('.dialogue-choice');
            expect(buttons.length).toBe(2);
            expect(buttons[0].textContent.trim()).toBe('Yes');
            expect(buttons[1].textContent.trim()).toBe('No');

            const handler = vi.fn();
            el.addEventListener('dialogue-choice', handler);

            // Click the second choice.
            buttons[1].click();

            expect(handler).toHaveBeenCalledTimes(1);
            const event = handler.mock.calls[0][0];
            expect(event.detail.choice).toBe(node.choices[1]);
            expect(event.detail.node).toBe(node);
        });

        it('renders only the "Goodbye" button when choices is unset and clicking it dispatches dialogue-close', async () => {
            const npc = { name: 'Alice', title: 'Manager' };
            const node = { text: 'Hi' }; // no choices

            el.open(npc, node);
            await vi.runAllTimersAsync();
            await el.updateComplete;

            const buttons = el.querySelectorAll('.dialogue-choice');
            expect(buttons.length).toBe(1);
            expect(buttons[0].textContent.trim()).toBe('Goodbye');

            const handler = vi.fn();
            el.addEventListener('dialogue-close', handler);

            buttons[0].click();

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler.mock.calls[0][0].detail).toEqual({});
        });
    });

    describe('.dialogue-close button', () => {
        it('dispatches dialogue-close with an empty detail object', async () => {
            const npc = { name: 'Alice', title: 'Manager' };
            const node = { text: 'Hi' };

            el.open(npc, node);
            await vi.runAllTimersAsync();
            await el.updateComplete;

            const closeBtn = el.querySelector('.dialogue-close');
            expect(closeBtn).not.toBeNull();

            const handler = vi.fn();
            el.addEventListener('dialogue-close', handler);

            closeBtn.click();

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler.mock.calls[0][0].detail).toEqual({});
        });
    });

    describe('close()', () => {
        it('resets isOpen, npc, currentNode and typingText, and removes the container after updateComplete', async () => {
            const npc = { name: 'Alice', title: 'Manager' };
            const node = { text: 'Hi' };

            el.open(npc, node);
            await vi.runAllTimersAsync();
            await el.updateComplete;

            expect(el.querySelector('.dialogue-container')).not.toBeNull();

            el.close();

            expect(el.isOpen).toBe(false);
            expect(el.npc).toBeNull();
            expect(el.currentNode).toBeNull();
            expect(el.typingText).toBe('');

            await el.updateComplete;
            expect(el.querySelector('.dialogue-container')).toBeNull();
        });
    });

    describe('showNode(node)', () => {
        it('sets currentNode and restarts the typewriter animation for the new node', async () => {
            const npc = { name: 'Alice', title: 'Manager' };
            const first = { text: 'Hi' };
            const second = { text: 'Hello there' };

            el.open(npc, first);
            await vi.runAllTimersAsync();
            expect(el.typingText).toBe('Hi');

            el.showNode(second);
            expect(el.currentNode).toBe(second);
            expect(el.isTyping).toBe(true);

            await vi.runAllTimersAsync();
            expect(el.typingText).toBe(second.text);
            expect(el.isTyping).toBe(false);
        });
    });
});
