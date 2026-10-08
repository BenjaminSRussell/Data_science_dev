/**
 * tutorialCompleted gates a first-run tutorial and is set on dismissal
 * (#1680); the tutorial shows NarrativeClaritySystem's onboarding text (#1069)
 */
import { describe, it, expect, vi } from 'vitest';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { NarrativeClaritySystem } from '../../src/js/game/NarrativeClaritySystem.js';

const proto = MainGame.prototype;

function fakeGame(state = {}) {
    return {
        gameState: { isGameStarted: false, tutorialCompleted: false, ...state },
        taskSystem: { generateNewTask: vi.fn() },
        showTutorial: vi.fn(),
        showModal: vi.fn(),
        closeModal: vi.fn()
    };
}

describe('tutorial flag (#1680)', () => {
    it('first game start shows the tutorial and leaves the flag for dismissal', () => {
        const game = fakeGame();
        try { proto.finishGameStart.call(game); } catch { /* later UI steps need a real game */ }
        expect(game.gameState.isGameStarted).toBe(true);
        expect(game.showTutorial).toHaveBeenCalledTimes(1);
        expect(game.gameState.tutorialCompleted).toBe(false);
    });

    it('returning players who dismissed it are not shown it again', () => {
        const game = fakeGame({ tutorialCompleted: true });
        try { proto.finishGameStart.call(game); } catch { /* later UI steps need a real game */ }
        expect(game.showTutorial).not.toHaveBeenCalled();
    });

    it('"Got it!" sets tutorialCompleted and closes the modal', () => {
        const game = fakeGame();
        proto.dismissTutorial.call(game);
        expect(game.gameState.tutorialCompleted).toBe(true);
        expect(game.closeModal).toHaveBeenCalled();
    });
});

describe('tutorial content (#1069)', () => {
    it('includes the onboarding overview and wires the button to dismissTutorial', () => {
        const game = fakeGame({ narrativeClaritySystem: new NarrativeClaritySystem({}) });
        proto.showTutorial.call(game);
        const html = game.showModal.mock.calls[0][0];
        expect(html).toContain('Welcome to Data City');
        expect(html).toContain('Your Goal');
        expect(html).toContain('How to Play');
        expect(html).toContain('game.dismissTutorial()');
    });

    it('still renders the how-to steps without the narrative system', () => {
        const game = fakeGame();
        proto.showTutorial.call(game);
        const html = game.showModal.mock.calls[0][0];
        expect(html).not.toContain('Welcome to Data City');
        expect(html).toContain('Get Your Task');
    });
});
