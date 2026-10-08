/**
 * The story panel's chapter follows StorylineManager's phase (#512)
 */
import { describe, it, expect } from 'vitest';
import { NarrativeClaritySystem } from '../../src/js/game/NarrativeClaritySystem.js';
import { StorylineManager } from '../../src/js/game/StorylineManager.js';

function context(gs) {
    return new NarrativeClaritySystem(gs).getNarrativeContext().chapter;
}

describe('chapter follows storyline phase (#512)', () => {
    it('a reputation-accelerated phase moves the chapter too', () => {
        const gs = { timeManager: { totalDays: 10 }, reputation: 1500, characterStats: { ethics: 0 } };
        gs.storylineManager = new StorylineManager(gs);
        gs.storylineManager.storylinePhase = gs.storylineManager.determinePhase();
        expect(gs.storylineManager.storylinePhase).toBe('mid');
        expect(context(gs)).toMatch(/^Chapter 3/);
    });

    it('every phase maps to the matching chapter and day bands agree with StorylineManager', () => {
        for (const days of [0, 6, 7, 29, 30, 89, 90, 179, 180, 400]) {
            const gs = { timeManager: { totalDays: days }, reputation: 0, characterStats: { ethics: 0 } };
            gs.storylineManager = new StorylineManager(gs);
        gs.storylineManager.storylinePhase = gs.storylineManager.determinePhase();
            const phase = gs.storylineManager.storylinePhase;
            expect(NarrativeClaritySystem.phaseForDays(days)).toBe(phase);
            expect(context(gs)).toBe(NarrativeClaritySystem.chapterFor(phase, days));
        }
        expect(NarrativeClaritySystem.chapterFor('early', 3)).toMatch(/^Chapter 1/);
        expect(NarrativeClaritySystem.chapterFor('endgame', 500)).toMatch(/^Chapter 5/);
    });
});
