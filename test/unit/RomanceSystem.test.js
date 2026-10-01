/**
 * Unit tests for RomanceSystem
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RomanceSystem } from '../../src/js/game/RomanceSystem.js';

describe('RomanceSystem', () => {
    let romanceSystem;
    let gameState;

    beforeEach(() => {
        gameState = {
            money: 10000,
            npcManager: {
                getNPC: () => ({ name: 'Test NPC', romanceOptions: {} }),
                getRelationship: () => 50
            },
            characterStats: { ethics: 50 }
        };

        romanceSystem = new RomanceSystem(gameState);
        // Set up dating state
        romanceSystem.partnerId = 'test-npc-id';
        romanceSystem.relationshipStatus = 'dating';
        romanceSystem.relationshipScore = 50;
    });

    describe('goOnDate', () => {
        it('should succeed for valid date types', () => {
            const result = romanceSystem.goOnDate('coffee');
            expect(result.success).toBe(true);
            expect(gameState.money).toBe(10000 - 20);
        });

        it('should make expensive dates cost-efficient at realistic gameplay scores', () => {
            // In realistic gameplay, dating starts at score 50 (askOnDate sets it).
            // This test verifies that all date types have similar cost-per-happiness efficiency
            // at that realistic score, fixing the original issue where vacation was ~10x worse than coffee.
            // On the old code (before the fix): vacation from score 50 gives only 50 pts ($40/pt), coffee gives 5 pts ($4/pt)
            // With the fix and raised cap: vacation from score 50 gives ~450 pts (~$4.44/pt), all dates are ~$4/pt

            const dateTypes = [
                { type: 'coffee', cost: 20 },
                { type: 'dinner', cost: 100 },
                { type: 'fancy_dinner', cost: 500 },
                { type: 'vacation', cost: 2000 }
            ];

            // Test at the realistic starting score for dating (50, set by askOnDate)
            const results = [];
            dateTypes.forEach(({ type, cost }) => {
                romanceSystem.relationshipScore = 50;
                gameState.money = 100000;

                const startScore = romanceSystem.relationshipScore;
                const result = romanceSystem.goOnDate(type);

                expect(result.success).toBe(true);

                const actualGain = romanceSystem.relationshipScore - startScore;
                const costPerHappiness = cost / actualGain;

                results.push({
                    type,
                    cost,
                    actualGain,
                    costPerHappiness
                });
            });

            // Verify that all date types have cost-per-happiness within 50% of coffee
            // This would FAIL on the old code (vacation $40/pt vs coffee $4/pt)
            // and PASS with the fix (all around $4/pt)
            const coffeeEfficiency = results[0].costPerHappiness;

            expect(results[1].costPerHappiness / coffeeEfficiency).toBeLessThan(1.5); // dinner
            expect(results[2].costPerHappiness / coffeeEfficiency).toBeLessThan(1.5); // fancy_dinner
            expect(results[3].costPerHappiness / coffeeEfficiency).toBeLessThan(1.5); // vacation
        });

        it('should make vacation a reasonable choice compared to cheaper dates', () => {
            // Verify that expensive dates actually provide proportionally better value than cheap ones.
            // This is the core fix for issue #2190: vacation was 10x worse per dollar than coffee.

            // At realistic score range where most gameplay happens (50-100),
            // vacation should not be strictly worse than coffee.
            // With the raised cap, vacation from score 50 gives enough points to be cost-competitive.

            romanceSystem.relationshipScore = 50;
            gameState.money = 100000;

            romanceSystem.goOnDate('coffee');
            const coffeeStartScore = 50;
            const coffeeEndScore = romanceSystem.relationshipScore;
            const coffeeGain = coffeeEndScore - coffeeStartScore;
            const coffeeCostPerPoint = 20 / coffeeGain;

            romanceSystem.relationshipScore = 50;
            gameState.money = 100000;

            romanceSystem.goOnDate('vacation');
            const vacationStartScore = 50;
            const vacationEndScore = romanceSystem.relationshipScore;
            const vacationGain = vacationEndScore - vacationStartScore;
            const vacationCostPerPoint = 2000 / vacationGain;

            // Vacation cost-per-point should be within 2x of coffee (not 10x worse as in the original)
            expect(vacationCostPerPoint).toBeLessThan(coffeeCostPerPoint * 2);

            // Verify the actual gains are meaningful
            // Coffee gives 5, vacation should give ~450 (score 50 -> 500, clamped)
            expect(coffeeGain).toBe(5);
            expect(vacationGain).toBeGreaterThan(400); // vacation significantly more than coffee
        });
    });

    describe('modifyHappiness', () => {
        it('should clamp happiness between 0 and 500', () => {
            // Raised cap to 500 to allow expensive dates to have meaningful value
            romanceSystem.relationshipScore = 480;
            romanceSystem.modifyHappiness(50);
            expect(romanceSystem.relationshipScore).toBe(500);

            romanceSystem.relationshipScore = 10;
            romanceSystem.modifyHappiness(-20);
            expect(romanceSystem.relationshipScore).toBe(0);
        });
    });

    describe('askOnDate', () => {
        it('should prevent dating two different people', () => {
            romanceSystem.partnerId = 'other-npc-id';
            const result = romanceSystem.askOnDate('test-npc');
            expect(result.success).toBe(false);
            expect(result.message).toContain('already seeing');
        });
    });
});
