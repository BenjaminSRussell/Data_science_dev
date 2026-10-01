/**
 * Unit tests for CharacterStats system
 *
 * Tests verify that issue #2267 is fixed:
 * - The entire stat-effects system is no longer dead code
 * - Misleading effect descriptions have been removed
 * - Only actually-wired effects (maxEnergy -> TimeManager) remain
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterStats, STATS } from '../../src/js/game/CharacterStats.js';
import { TimeManager } from '../../src/js/game/TimeManager.js';

describe('CharacterStats', () => {
    let characterStats;
    let timeManager;

    beforeEach(() => {
        characterStats = new CharacterStats();
        timeManager = new TimeManager();
    });

    describe('stat effects cleanup (issue #2267)', () => {
        it('should have removed unused effects from stats', () => {
            // Intelligence should no longer promise chartQuality, analysisSpeed, unlockAdvanced
            expect(STATS.intelligence.effects).toEqual({});

            // Charisma should no longer promise clientPay, relationshipGain, unlockVC
            expect(STATS.charisma.effects).toEqual({});

            // Focus should no longer promise taskSpeed, errorReduction, multitask
            expect(STATS.focus.effects).toEqual({});

            // Luck should no longer promise bonusChance, marketTiming, rareClients
            expect(STATS.luck.effects).toEqual({});

            // Analytics should no longer promise chartTypes, dataInsights, automation
            expect(STATS.analytics.effects).toEqual({});
        });

        it('should keep only maxEnergy effect for stamina', () => {
            // Stamina is the only stat with an effect actually wired to gameplay
            expect(STATS.stamina.effects).toHaveProperty('maxEnergy');
            expect(STATS.stamina.effects.maxEnergy).toBe(1);
        });

        it('should have updated misleading descriptions', () => {
            // Intelligence no longer promises "chart quality"
            expect(STATS.intelligence.description).not.toContain('chart quality');
            expect(STATS.intelligence.description).toEqual('Enhances learning and pattern recognition');

            // Focus no longer promises "faster tasks"
            expect(STATS.focus.description).not.toContain('Complete tasks faster');
            expect(STATS.focus.description).toEqual('Improve concentration and reduce distractions');

            // Analytics no longer promises "unlock" features
            expect(STATS.analytics.description).not.toContain('Unlock advanced');
            expect(STATS.analytics.description).toEqual('Develop data analysis and insight capabilities');

            // Charisma updated to not imply payment/VC
            expect(STATS.charisma.description).toEqual('Improves interpersonal influence and communication');

            // Luck description updated
            expect(STATS.luck.description).toEqual('Influence randomness and fortune');

            // Stamina keeps its description since maxEnergy IS wired
            expect(STATS.stamina.description).toEqual('Work more hours without fatigue');
        });
    });

    describe('getTotalBonuses', () => {
        it('should only return maxEnergy (the only wired bonus)', () => {
            const bonuses = characterStats.getTotalBonuses();

            // Should have exactly one key: maxEnergy
            expect(Object.keys(bonuses)).toEqual(['maxEnergy']);

            // Should NOT have any of the previously unconsumed fields
            expect(bonuses).not.toHaveProperty('chartQuality');
            expect(bonuses).not.toHaveProperty('taskSpeed');
            expect(bonuses).not.toHaveProperty('clientPay');
            expect(bonuses).not.toHaveProperty('bonusChance');
            expect(bonuses).not.toHaveProperty('workSlots');
        });

        it('should calculate maxEnergy based on stamina stat', () => {
            characterStats.stats.stamina = 10;
            const bonuses = characterStats.getTotalBonuses();
            expect(bonuses.maxEnergy).toBe(110); // 100 + 10
        });

        it('should handle default stamina value', () => {
            const bonuses = characterStats.getTotalBonuses();
            // Initial stamina is 100, so maxEnergy = 100 + 100 = 200
            expect(bonuses.maxEnergy).toBe(200);
        });

        it('should respond to stamina changes', () => {
            let bonuses = characterStats.getTotalBonuses();
            expect(bonuses.maxEnergy).toBe(200); // 100 + 100 (initial)

            characterStats.stats.stamina = 50;
            bonuses = characterStats.getTotalBonuses();
            expect(bonuses.maxEnergy).toBe(150); // 100 + 50
        });
    });

    describe('applyBonusesToTimeManager', () => {
        it('should apply maxEnergy bonus to TimeManager', () => {
            characterStats.stats.stamina = 25;
            characterStats.applyBonusesToTimeManager(timeManager);
            expect(timeManager.maxEnergy).toBe(125); // 100 + 25
        });

        it('should handle null timeManager gracefully', () => {
            // Should not throw
            expect(() => characterStats.applyBonusesToTimeManager(null)).not.toThrow();
        });

        it('should update maxEnergy when stamina increases', () => {
            characterStats.applyBonusesToTimeManager(timeManager);
            const initial = timeManager.maxEnergy;

            characterStats.stats.stamina += 10;
            characterStats.applyBonusesToTimeManager(timeManager);
            expect(timeManager.maxEnergy).toBe(initial + 10);
        });
    });

    describe('stat bonuses on training', () => {
        it('should reflect updated maxEnergy bonus after training', () => {
            const initialBonuses = characterStats.getTotalBonuses();
            expect(initialBonuses.maxEnergy).toBe(200); // 100 + 100 (initial stamina)

            // Manually increase stamina (simulating level up)
            characterStats.stats.stamina = 115;
            const newBonuses = characterStats.getTotalBonuses();
            expect(newBonuses.maxEnergy).toBe(215); // 100 + 115
        });
    });

    describe('verification: no unconsumed effects remain', () => {
        it('should have no effects that are not wired to gameplay', () => {
            // Get all effects from all stats
            const allEffects = new Set();
            Object.values(STATS).forEach(stat => {
                Object.keys(stat.effects).forEach(effect => {
                    allEffects.add(effect);
                });
            });

            // The only effect that should remain is maxEnergy
            // (which is wired to TimeManager.setMaxEnergy)
            expect(Array.from(allEffects)).toEqual(['maxEnergy']);
        });
    });
});
