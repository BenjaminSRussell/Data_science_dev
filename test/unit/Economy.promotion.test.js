/**
 * Promotion thresholds and notification (#232)
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { RANKS } from '../../src/js/data/ranks.js';

describe('EconomySystem.checkPromotion thresholds', () => {
    afterEach(() => vi.restoreAllMocks());

    const setup = (rankIndex, reputation) => {
        const gs = new GameState();
        gs.rankIndex = rankIndex;
        gs.reputation = reputation;
        return { gs, econ: new EconomySystem(gs) };
    };

    it('one point below the requirement does not promote or notify', () => {
        const spy = vi.spyOn(window, 'dispatchEvent');
        const { gs, econ } = setup(0, RANKS[1].repRequired - 1);
        expect(econ.checkPromotion()).toBe(false);
        expect(gs.rankIndex).toBe(0);
        expect(spy.mock.calls.filter(([e]) => e.type === 'promotion')).toHaveLength(0);
    });

    it('exactly at the requirement promotes by one and dispatches one promotion event', () => {
        const spy = vi.spyOn(window, 'dispatchEvent');
        const { gs, econ } = setup(0, RANKS[1].repRequired);
        expect(econ.checkPromotion()).toBe(true);
        expect(gs.rankIndex).toBe(1);
        const events = spy.mock.calls.map(([e]) => e).filter(e => e.type === 'promotion');
        expect(events).toHaveLength(1);
        expect(events[0].detail.rank).toBe(RANKS[1]);
    });

    it('at max rank (nextRank null) returns false without throwing', () => {
        const { gs, econ } = setup(RANKS.length - 1, 1e12);
        expect(gs.nextRank).toBeNull();
        expect(econ.checkPromotion()).toBe(false);
        expect(gs.rankIndex).toBe(RANKS.length - 1);
    });
});
