// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, deriveState } from '../../src/js/store/gameStore.js';
import { RANKS } from '../../src/js/data/ranks.js';

describe('gameStore fixes', () => {
    beforeEach(() => useGameStore.getState().reset());

    it('derived rank values follow state changes instead of freezing (#2261, #1033)', () => {
        useGameStore.getState().setRankIndex(2);
        expect(useGameStore.getState().currentRank).toEqual(RANKS[2]);
        useGameStore.setState({ rankIndex: 3, reputation: RANKS[3].repRequired });
        const s = useGameStore.getState();
        expect(s.currentRank).toEqual(RANKS[3]);
        expect(s.nextRank).toEqual(RANKS[4]);
        expect(s.progressToNextRank).toBe(0);
        useGameStore.getState().addRating(4);
        useGameStore.getState().addRating(5);
        expect(useGameStore.getState().averageRating).toBe('4.5');
    });

    it('out-of-range rankIndex falls back to RANKS[0] (#1613)', () => {
        const d = deriveState({ rankIndex: 99, reputation: 0, totalRatings: 0, ratingSum: 0 });
        expect(d.currentRank).toEqual(RANKS[0]);
        expect(Number.isFinite(d.progressToNextRank)).toBe(true);
    });

    it('purchase effects and software bonuses come from the shared config (#1032)', () => {
        useGameStore.setState({ money: 5000 });
        expect(useGameStore.getState().purchaseItem({ id: 'soft_automl', type: 'software', price: 800 })).toBe(true);
        expect(useGameStore.getState().getSoftwareQualityMultiplier().speedBonus).toBeCloseTo(0.10);
        useGameStore.getState().purchaseItem({ id: 'tool_x', type: 'tool', toolId: 'x', price: 1 });
        expect(useGameStore.getState().unlockedTools).toContain('x');
    });

    it('does not inject a debug overlay into the page (#57)', () => {
        expect(document.getElementById('debug-store-info')).toBeNull();
    });
});
