/**
 * Ethics Default Value Unit Test
 * Verifies that CharacterStats.ethics defaults to 0 (neutral) not 50 (good),
 * so that WeeklyNewsSystem story selection is not biased toward "ethical" at game start.
 *
 * Issue #2639: generateMainStory()'s ethics branch always picks the "ethical" story
 * at game start because CharacterStats.ethics defaults to 50, not 0
 */

import { describe, it, expect } from 'vitest';
import { CharacterStats } from '../../src/js/game/CharacterStats.js';

describe('Ethics Default Value - Issue #2639', () => {
    describe('CharacterStats.ethics initialization', () => {
        it('should default to 0 (neutral), not 50', () => {
            const stats = new CharacterStats();
            expect(stats.ethics).toBe(0);
        });

        it('should be zero-centered (-100 to 100)', () => {
            const stats = new CharacterStats();
            stats.modifyEthics(50);
            expect(stats.ethics).toBe(50);
            stats.modifyEthics(-100);
            expect(stats.ethics).toBe(-50);
        });

        it('should clamp at -100 and 100', () => {
            const stats = new CharacterStats();
            stats.modifyEthics(-200);
            expect(stats.ethics).toBe(-100);
            stats.modifyEthics(300);
            expect(stats.ethics).toBe(100);
        });
    });

    describe('WeeklyNewsSystem story selection logic based on ethics', () => {
        it('should not select ethical story at game start (ethics=0)', () => {
            const stats = new CharacterStats();

            // At ethics=0, should NOT satisfy ethics > 20
            expect(stats.ethics).toBe(0);
            expect(stats.ethics > 20).toBe(false);
        });

        it('should select ethical story when ethics > 20', () => {
            const stats = new CharacterStats();
            stats.modifyEthics(30);

            // At ethics=30, should satisfy ethics > 20
            expect(stats.ethics).toBe(30);
            expect(stats.ethics > 20).toBe(true);
        });

        it('should select criminal story when ethics < -20', () => {
            const stats = new CharacterStats();
            stats.modifyEthics(-30);

            // At ethics=-30, should satisfy ethics < -20
            expect(stats.ethics).toBe(-30);
            expect(stats.ethics < -20).toBe(true);
        });

        it('should prevent unreachable criminal story bug', () => {
            // Before the fix: ethics=50
            // To reach criminal story (ethics < -20), need: 50 + amount < -20, so amount < -70
            // This requires deducting 70+ points just to cross zero, then 20 more

            // After the fix: ethics=0
            // To reach criminal story (ethics < -20), need: 0 + amount < -20, so amount < -21
            // This requires deducting only 21+ points

            const stats = new CharacterStats();
            expect(stats.ethics).toBe(0);

            // Simulate unethical decisions totaling -25 points
            stats.modifyEthics(-25);
            expect(stats.ethics).toBe(-25);

            // With ethics=-25, criminal story should be reachable
            expect(stats.ethics < -20).toBe(true);
        });
    });

    describe('Visual stage evolution with ethics', () => {
        it('should use > 0 threshold for good visual evolution', () => {
            const stats = new CharacterStats();
            expect(stats.visualStage).toBe('level_1');

            // Reach level 2 evolution at $5000 with default ethics
            const result = stats.checkEvolution(5000);
            expect(result.evolved).toBe(true);

            // With ethics=0 and threshold > 0, should get evil visual
            expect(stats.visualStage).toBe('level_2_evil');
        });

        it('should get good visual when ethics > 0', () => {
            const stats = new CharacterStats();
            stats.modifyEthics(5);

            // Reach level 2 evolution with positive ethics
            const result = stats.checkEvolution(5000);
            expect(result.evolved).toBe(true);
            expect(stats.visualStage).toBe('level_2_good');
        });

        it('should get evil visual when ethics < 0', () => {
            const stats = new CharacterStats();
            stats.modifyEthics(-5);

            // Reach level 2 evolution with negative ethics
            const result = stats.checkEvolution(5000);
            expect(result.evolved).toBe(true);
            expect(stats.visualStage).toBe('level_2_evil');
        });

        it('should use > 0 threshold for level 3 evolution too', () => {
            const stats = new CharacterStats();

            // First evolve to level 2
            stats.checkEvolution(5000);
            expect(stats.visualStage).toBe('level_2_evil');

            // Then evolve to level 3
            const result = stats.checkEvolution(50000);
            expect(result.evolved).toBe(true);
            expect(stats.visualStage).toBe('level_3_evil');
        });
    });
});
