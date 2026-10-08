/**
 * VisualProgressionSync.test.js
 * Tests that VisualProgressionSystem and CharacterStats maintain synchronized visual states
 * Issue #2083: Two systems with mismatched thresholds should be unified
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterStats } from '../../src/js/game/CharacterStats.js';
import { VisualProgressionSystem } from '../../src/js/game/visual/VisualProgressionSystem.js';

describe('VisualProgressionSystem and CharacterStats Synchronization', () => {
    let characterStats;
    let visualProgressionSystem;
    let mockGameState;

    beforeEach(() => {
        // Mock gameState
        mockGameState = {
            money: 0,
            npcManager: {
                getMetNPCs: () => []
            },
            timeManager: {
                totalDays: 0
            },
            jobSystem: {
                currentJob: null
            },
            stats: {}
        };

        characterStats = new CharacterStats();
        visualProgressionSystem = new VisualProgressionSystem(mockGameState);
    });

    describe('Money threshold synchronization', () => {
        it('should map VisualProgressionSystem tiers to CharacterStats stages correctly', () => {
            // At $6,000: Both should now be in sync (CharacterStats should NOT be level_2 if VisualProgressionSystem is still basic)
            mockGameState.money = 6000;

            visualProgressionSystem.checkMilestones();

            // After fix: characterStats should read from visualProgressionSystem
            const evolution = characterStats.checkEvolution(mockGameState.money, visualProgressionSystem);

            // VisualProgressionSystem is still 'basic' at $6k (needs $10k for 'mid')
            // So CharacterStats should also be 'level_1' to stay in sync
            expect(visualProgressionSystem.currentTier).toBe('basic');
            expect(characterStats.visualStage).toBe('level_1');
        });

        it('should synchronize at $10,000 money threshold (VisualProgressionSystem mid)', () => {
            mockGameState.money = 10000;

            visualProgressionSystem.checkMilestones();
            const evolution = characterStats.checkEvolution(mockGameState.money, visualProgressionSystem);

            // Both should now be in "mid" tier / level_2 territory
            expect(visualProgressionSystem.currentTier).toBe('mid');
            expect(characterStats.visualStage).toMatch(/^level_2/);
        });

        it('should synchronize at $50,000 money threshold', () => {
            mockGameState.money = 50000;

            visualProgressionSystem.checkMilestones();
            const evolution = characterStats.checkEvolution(mockGameState.money, visualProgressionSystem);

            // Both should now be in "mid" or "premium" tier
            expect(visualProgressionSystem.currentTier).toBe('mid');
            // CharacterStats should match this tier level
            expect(characterStats.visualStage).toMatch(/^level_2/);
        });

        it('should synchronize at $100,000 money threshold (VisualProgressionSystem premium)', () => {
            mockGameState.money = 100000;

            visualProgressionSystem.checkMilestones();
            const evolution = characterStats.checkEvolution(mockGameState.money, visualProgressionSystem);

            // Both should now be at premium level
            expect(visualProgressionSystem.currentTier).toBe('premium');
            expect(characterStats.visualStage).toMatch(/^level_3/);
        });

        it('should never have VisualProgressionSystem and CharacterStats in disagreement', () => {
            const testAmounts = [0, 1000, 5000, 6000, 9000, 10000, 25000, 50000, 75000, 100000, 200000, 500000];

            testAmounts.forEach(amount => {
                mockGameState.money = amount;
                visualProgressionSystem.checkMilestones();
                characterStats.checkEvolution(amount, visualProgressionSystem);

                // Map both to a common scale to check alignment
                // basic -> level_1
                // mid -> level_2
                // premium -> level_3
                const tierToBaseLevel = {
                    'basic': '1',
                    'mid': '2',
                    'premium': '3'
                };

                const visualTier = tierToBaseLevel[visualProgressionSystem.currentTier];
                const characterLevel = characterStats.visualStage.split('_')[1]; // Extract number from level_X

                // They should be synchronized
                expect(visualTier).toBe(characterLevel);
            });
        });
    });

    describe('Evolution tracking', () => {
        it('should mark evolution when crossing VisualProgressionSystem threshold', () => {
            mockGameState.money = 9999;
            visualProgressionSystem.checkMilestones();
            characterStats.checkEvolution(9999, visualProgressionSystem);
            expect(characterStats.visualStage).toBe('level_1');

            // Cross the $10k threshold
            mockGameState.money = 10000;
            visualProgressionSystem.checkMilestones();
            const evolution = characterStats.checkEvolution(10000, visualProgressionSystem);

            // Should have evolved
            expect(evolution.evolved).toBe(true);
            expect(characterStats.visualStage).toMatch(/^level_2/);
        });

        it('should handle ethics alignment when evolving to level_2', () => {
            mockGameState.money = 10000;
            characterStats.ethics = 60; // Good ethics

            visualProgressionSystem.checkMilestones();
            const evolution = characterStats.checkEvolution(10000, visualProgressionSystem);

            expect(evolution.evolved).toBe(true);
            expect(characterStats.visualStage).toBe('level_2_good');
        });

        it('should handle ethics alignment when evolving to level_2 with evil ethics', () => {
            mockGameState.money = 10000;
            characterStats.ethics = -40; // Evil ethics (below -30)

            visualProgressionSystem.checkMilestones();
            const evolution = characterStats.checkEvolution(10000, visualProgressionSystem);

            expect(evolution.evolved).toBe(true);
            expect(characterStats.visualStage).toBe('level_2_evil');
        });

        it('a neutral player (ethics 0, the starting value) evolves neutral, not evil', () => {
            mockGameState.money = 10000;
            characterStats.ethics = 0;

            visualProgressionSystem.checkMilestones();
            const evolution = characterStats.checkEvolution(10000, visualProgressionSystem);

            expect(evolution.evolved).toBe(true);
            expect(characterStats.visualStage).toBe('level_2_neutral');
        });
    });
});
