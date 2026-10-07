import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';
import { RANKS } from '../../src/js/data/ranks.js';

describe('GameState rank/rating computed properties', () => {
    let state;

    beforeEach(() => {
        state = new GameState();
    });

    describe('currentRank', () => {
        it('returns the rank at rankIndex', () => {
            state.rankIndex = 2;
            expect(state.currentRank).toBe(RANKS[2]);
        });

        it('falls back to RANKS[0] for out-of-range rankIndex', () => {
            state.rankIndex = 99;
            expect(state.currentRank).toBe(RANKS[0]);
        });
    });

    describe('nextRank', () => {
        it('returns the rank after rankIndex', () => {
            state.rankIndex = 0;
            expect(state.nextRank).toBe(RANKS[1]);
        });

        it('returns null when rankIndex is the last index of RANKS', () => {
            state.rankIndex = RANKS.length - 1;
            expect(state.nextRank).toBeNull();
        });
    });

    describe('progressToNextRank', () => {
        it('is 100 when rankIndex is the last index of RANKS', () => {
            state.rankIndex = RANKS.length - 1;
            expect(state.progressToNextRank).toBe(100);
        });

        it('is 0 when reputation exactly equals currentRank.repRequired', () => {
            state.rankIndex = 1;
            state.reputation = RANKS[1].repRequired;
            expect(state.progressToNextRank).toBe(0);
        });

        it('is 100 when reputation exactly equals nextRank.repRequired', () => {
            state.rankIndex = 1;
            state.reputation = RANKS[2].repRequired;
            expect(state.progressToNextRank).toBe(100);
        });

        it('clamps to 0 (not negative) when reputation is below currentRank.repRequired', () => {
            state.rankIndex = 1;
            state.reputation = RANKS[1].repRequired - 50;
            expect(state.progressToNextRank).toBe(0);
        });

        it('computes partial progress between ranks', () => {
            state.rankIndex = 1;
            const span = RANKS[2].repRequired - RANKS[1].repRequired;
            state.reputation = RANKS[1].repRequired + span / 2;
            expect(state.progressToNextRank).toBe(50);
        });
    });

    describe('averageRating', () => {
        it('returns the number 0 when totalRatings is 0', () => {
            state.totalRatings = 0;
            state.ratingSum = 0;
            expect(state.averageRating).toBe(0);
            expect(typeof state.averageRating).toBe('number');
        });

        it('returns a string via toFixed(1) when totalRatings > 0', () => {
            state.totalRatings = 2;
            state.ratingSum = 9;
            expect(state.averageRating).toBe('4.5');
            expect(typeof state.averageRating).toBe('string');
        });
    });
});
