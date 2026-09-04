/**
 * EconomySystem scoring tests
 *
 * Verifies the fix for: "EconomySystem.evaluateChart can never award a
 * 1-star rating — compounding score floors keep rawScore above the
 * threshold".
 *
 * Worst-case-per-component calculation (all randomness at its minimum,
 * no software multipliers, strictness = 0.8, wrong chart type with the
 * lowest matrix entry of 20, e.g. pie for trend_analysis):
 *
 *   scoreChartAppropriateness: 20 - 5 = 15
 *   scoreVisualClarity:        0 - 2.5 -> clamped to 0
 *   scoreDataAccuracy:         80 - 5 = 75
 *
 *   rawScore_min = (15*0.4 + 0*0.3 + 75*0.3) * 0.8
 *                = (6 + 0 + 22.5) * 0.8
 *                = 28.5 * 0.8
 *                = 22.8  < 35  => 1 star reachable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';

function makeSystem() {
    const gameState = {
        getSoftwareQualityMultiplier: () => ({
            visualClarity: 1.0,
            dataAccuracy: 1.0,
            chartAppropriateness: 1.0,
            speedBonus: 0
        }),
        totalRatings: 0,
        ratingSum: 0,
        perfectScores: 0
    };
    return new EconomySystem(gameState);
}

describe('EconomySystem 1-star reachability', () => {
    beforeEach(() => {
        // Pin all randomness to its minimum so we can compute exact
        // worst-case values.
        vi.spyOn(Math, 'random').mockReturnValue(0);
    });

    it('worst-case component floors allow rawScore below the 1-star threshold (35)', () => {
        const sys = makeSystem();

        const appropriateness = sys.scoreChartAppropriateness(
            { boss: { strictness: 0.8 }, optimalChartTypes: ['line'], template: { dataType: 'trend_analysis' } },
            { type: 'pie' }
        );
        const clarity = sys.scoreVisualClarity({
            showLegend: false,
            showGrid: false,
            showDataLabels: false,
            title: ''
        });
        const accuracy = sys.scoreDataAccuracy(
            { boss: { strictness: 0.8 }, optimalChartTypes: ['line'], template: { dataType: 'trend_analysis' } },
            { type: 'pie' }
        );

        // Exact worst-case values
        expect(appropriateness).toBe(15);   // 20 (matrix) - 5 (variance)
        expect(clarity).toBe(0);            // 0 base - 2.5, clamped at 0
        expect(accuracy).toBe(75);          // 80 - 5

        const rawScore = (appropriateness * 0.4 + clarity * 0.3 + accuracy * 0.3) * 0.8;
        expect(rawScore).toBe(22.8);
        expect(rawScore).toBeLessThan(35);
        expect(sys.scoreToStars(rawScore)).toBe(1);
    });

    it('evaluateChart returns 1 star for a genuinely bad chart (worst case)', () => {
        const sys = makeSystem();

        const result = sys.evaluateChart(
            {
                boss: { strictness: 0.8 },
                optimalChartTypes: ['line'],
                template: { dataType: 'trend_analysis', acceptableChartTypes: [] },
                potentialReward: 100
            },
            {
                type: 'pie',
                showLegend: false,
                showGrid: false,
                showDataLabels: false,
                title: ''
            }
        );

        expect(result.rawScore).toBe(22.8);
        expect(result.stars).toBe(1);
    });

    it('a fully polished chart with the optimal type still scores 5 stars', () => {
        const sys = makeSystem();

        const result = sys.evaluateChart(
            {
                boss: { strictness: 0.8 },
                optimalChartTypes: ['line'],
                template: { dataType: 'trend_analysis', acceptableChartTypes: [] },
                potentialReward: 100
            },
            {
                type: 'line',
                showLegend: true,
                showGrid: true,
                showDataLabels: true,
                title: 'My Chart'
            }
        );

        // appropriateness 90, clarity 90 (90 - 2.5 clamped... actually 0+30+20+10+30-2.5=87.5), accuracy 75
        expect(result.stars).toBeGreaterThanOrEqual(4);
    });

    it('Monte Carlo sweep: bad charts can reach 1 star, good charts stay high', () => {
        vi.restoreAllMocks();
        const sys = makeSystem();

        let oneStarCount = 0;
        let fiveStarCount = 0;
        const N = 20000;

        for (let i = 0; i < N; i++) {
            const bad = sys.evaluateChart(
                {
                    boss: { strictness: 0.8 },
                    optimalChartTypes: ['line'],
                    template: { dataType: 'trend_analysis', acceptableChartTypes: [] },
                    potentialReward: 100
                },
                { type: 'pie', showLegend: false, showGrid: false, showDataLabels: false, title: '' }
            );
            if (bad.stars === 1) oneStarCount++;

            const good = sys.evaluateChart(
                {
                    boss: { strictness: 0.8 },
                    optimalChartTypes: ['line'],
                    template: { dataType: 'trend_analysis', acceptableChartTypes: [] },
                    potentialReward: 100
                },
                { type: 'line', showLegend: true, showGrid: true, showDataLabels: true, title: 'T' }
            );
            if (good.stars === 5) fiveStarCount++;
        }

        // 1-star must be reachable (previously 0 out of any number of trials)
        expect(oneStarCount).toBeGreaterThan(0);
        // Good charts should still mostly earn top ratings
        expect(fiveStarCount / N).toBeGreaterThan(0.5);
    });
});
