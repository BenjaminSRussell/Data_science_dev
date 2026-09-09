import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterStats, STATS, TRAINING_ACTIVITIES } from '../../src/js/game/CharacterStats.js';

describe('CharacterStats - training and derived bonuses', () => {
    let stats;

    beforeEach(() => {
        stats = new CharacterStats();
    });

    describe('train()', () => {
        it('rejects an unknown activity id', () => {
            const result = stats.train('bogus_id');
            expect(result).toEqual({ success: false, reason: 'Invalid activity' });
        });

        it('applies meditation gains with the luck bonus and restores energy', () => {
            const result = stats.train('meditation');

            expect(result.success).toBe(true);
            expect(result.activity.stats).toEqual({ focus: 3, stamina: 1 });
            expect(result.activity.energyCost).toBe(-10);

            // Default luck = 10 -> gain = Math.floor(xpGain * 10 * (1 + 10 * 0.01))
            const luck = stats.stats.luck;
            expect(luck).toBe(10);
            expect(result.gains.focus).toBe(Math.floor(3 * 10 * (1 + luck * 0.01)));
            expect(result.gains.focus).toBe(33);
            expect(result.gains.stamina).toBe(Math.floor(1 * 10 * (1 + luck * 0.01)));
            expect(result.gains.stamina).toBe(11);

            // No level up from a fresh character
            expect(result.levelUps).toEqual([]);
        });

        it('populates results.levelUps when a stat crosses a level boundary', () => {
            // Pre-set focus xp just below the level-10 threshold
            const threshold = stats.getXPForNextLevel('focus');
            stats.xp.focus = threshold - 1;

            const result = stats.train('meditation');

            expect(result.gains.focus).toBe(33);
            expect(result.levelUps.length).toBeGreaterThan(0);
            const focusUp = result.levelUps.find(lu => lu.stat === 'focus');
            expect(focusUp).toBeDefined();
            expect(focusUp.newLevel).toBe(11);
            expect(focusUp.levelsGained).toBe(1);
            expect(stats.stats.focus).toBe(11);
        });
    });

    describe('calculateEffects()', () => {
        it('scales numeric effects linearly with level', () => {
            const effects = stats.calculateEffects('intelligence', 20);
            expect(effects.chartQuality).toBe(STATS.intelligence.effects.chartQuality * 20);
            expect(effects.chartQuality).toBe(10);
            expect(effects.analysisSpeed).toBe(STATS.intelligence.effects.analysisSpeed * 20);
            expect(effects.analysisSpeed).toBe(6);
            expect(effects.unlockAdvanced).toBe(50);
        });

        it('counts array-valued effects as the number of thresholds met', () => {
            const effects = stats.calculateEffects('analytics', 45);
            expect(effects.chartTypes).toBe(
                STATS.analytics.effects.chartTypes.filter(v => 45 >= v).length
            );
            expect(effects.chartTypes).toBe(3);
            expect(effects.dataInsights).toBe(22.5);
            expect(effects.automation).toBe(70);
        });

        it('returns an empty object for an unknown stat', () => {
            expect(stats.calculateEffects('unknown_stat', 10)).toEqual({});
        });
    });

    describe('getTotalBonuses()', () => {
        it('computes each derived bonus from the default stats', () => {
            const s = stats.stats; // intelligence 10, charisma 10, stamina 100, focus 10, luck 10, analytics 10
            const bonuses = stats.getTotalBonuses();

            expect(bonuses.chartQuality).toBe(s.intelligence * 0.5 + s.analytics * 0.3);
            expect(bonuses.chartQuality).toBe(8);
            expect(bonuses.taskSpeed).toBe(s.focus * 0.8 + s.stamina * 0.2);
            expect(bonuses.taskSpeed).toBe(28);
            expect(bonuses.clientPay).toBe(s.charisma * 0.5);
            expect(bonuses.clientPay).toBe(5);
            expect(bonuses.bonusChance).toBe(s.luck * 1);
            expect(bonuses.bonusChance).toBe(10);
            expect(bonuses.maxEnergy).toBe(100 + s.stamina);
            expect(bonuses.maxEnergy).toBe(200);
            expect(bonuses.workSlots).toBe(6 + Math.floor(s.stamina / 20));
            expect(bonuses.workSlots).toBe(11);
        });
    });
});
