/**
 * DialogueUI (DOM path) timer hygiene:
 * - typeText cancels a typewriter run that is still in progress
 * - close() cancels handleChoice's delayed return-to-root
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';

describe('DialogueUI timers', () => {
    let ui;

    beforeEach(() => {
        vi.useFakeTimers();
        document.getElementById('dialogue-ui')?.remove();
        ui = new DialogueUI({ gameState: {} });
    });

    afterEach(() => {
        ui.close();
        document.getElementById('dialogue-ui')?.remove();
        vi.useRealTimers();
    });

    it('typeText cancels the previous animation before starting', () => {
        ui.typeText('first message that is long', 10);
        vi.advanceTimersByTime(30); // partway through
        ui.typeText('second', 10);
        vi.advanceTimersByTime(1000);

        expect(ui.container.querySelector('#dialogue-text').textContent).toBe('second');
    });

    it('close() cancels the pending return-to-root from a dead-end choice', () => {
        ui.open({ id: 'nobody_here', name: 'Nobody' });
        const root = ui.currentTree.getRootNode();
        ui.currentNode = { ...root, choices: [{ id: 'dead_end', text: 'Hmm' }] };
        ui.currentTree = { getRootNode: () => root, getNode: () => null };
        const showNode = vi.spyOn(ui, 'showNode');

        ui.handleChoice('dead_end');
        ui.close();
        vi.advanceTimersByTime(2000);

        expect(showNode).not.toHaveBeenCalled();
        expect(ui.choiceTimeoutId).toBeNull();
    });
});
