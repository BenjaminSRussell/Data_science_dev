import { describe, it, expect } from 'vitest';
import { RANKS } from '../../src/js/data/ranks.js';
import { CHART_TYPES } from '../../src/js/data/chartTypes.js';
import { GameState } from '../../src/js/game/GameState.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';

const CHART_PROMISE = /chart|heatmap|sankey/i;

describe('chart access is not a rank perk (#2012)', () => {
    it('rank perks do not promise chart unlocks', () => {
        const promised = RANKS.flatMap(rank => rank.perks || []).filter(perk => CHART_PROMISE.test(perk));
        expect(promised).toEqual([]);
    });

    it('the chart catalog has no unused unlock gate', () => {
        expect(CHART_TYPES.length).toBeGreaterThan(0);
        for (const chart of CHART_TYPES) {
            expect(chart).not.toHaveProperty('unlockRank');
            expect(chart).not.toHaveProperty('bestFor');
            expect(typeof chart.id).toBe('string');
        }
    });

    it('every chart type stays unlocked at every rank', () => {
        const state = new GameState();
        for (let rankIndex = 0; rankIndex < RANKS.length; rankIndex++) {
            state.rankIndex = rankIndex;
            for (const chart of CHART_TYPES) {
                expect(state.isChartTypeUnlocked(chart.id)).toBe(true);
            }
        }
    });

    it('keeps the rank perks the economy actually applies', () => {
        const names = new Set(RANKS.flatMap(rank => rank.perks || []));
        for (const perk of ['Time bonus increased', 'Boss tolerance increased', 'Premium clients', 'Maximum bonuses']) {
            expect(names.has(perk)).toBe(true);
        }
        expect(new EconomySystem({ rankIndex: 6 }).hasRankPerk('Maximum bonuses')).toBe(true);
        expect(new EconomySystem({ rankIndex: 3 }).hasRankPerk('Time bonus increased')).toBe(true);
        expect(new EconomySystem({ rankIndex: 2 }).hasRankPerk('Time bonus increased')).toBe(false);
        expect(new EconomySystem({ rankIndex: 1 }).hasRankPerk('Access to Line Charts')).toBe(false);
    });
});
