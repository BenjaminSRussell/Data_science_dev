/**
 * DialogueComponent.typeText must cancel a typewriter run still in progress.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/js/ui/components/DialogueComponent.js';

describe('DialogueComponent typeText', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('cancels the previous animation before starting', () => {
        const el = document.createElement('dialogue-component');
        el.typeText('first message that is long', 10);
        vi.advanceTimersByTime(30);
        el.typeText('second', 10);
        vi.advanceTimersByTime(1000);

        expect(el.typingText).toBe('second');
        expect(el.isTyping).toBe(false);
        el.close();
    });
});
