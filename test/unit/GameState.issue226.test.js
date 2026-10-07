/**
 * Unit tests for GameState save/load round-trip integrity
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';

describe('GameState', () => {
    describe('toJSON() / fromJSON() - Round-trip integrity', () => {
        it('should preserve all primitive fields in round-trip', () => {
            // Create a fresh GameState
            const original = new GameState();

            // Serialize and deserialize
            const json = original.toJSON();
            const restored = new GameState();
            restored.fromJSON(json);

            // Assert every primitive field matches exactly
            expect(restored.money).toBe(original.money);
            expect(restored.reputation).toBe(original.reputation);
            expect(restored.rankIndex).toBe(original.rankIndex);
            expect(restored.rent).toBe(original.rent);
            expect(restored.tasksCompleted).toBe(original.tasksCompleted);
            expect(restored.perfectScores).toBe(original.perfectScores);
            expect(restored.totalEarned).toBe(original.totalEarned);
            expect(restored.totalSpent).toBe(original.totalSpent);
            expect(restored.weeklyIncome).toBe(original.weeklyIncome);
            expect(restored.totalRatings).toBe(original.totalRatings);
            expect(restored.ratingSum).toBe(original.ratingSum);
            expect(restored.isGameStarted).toBe(original.isGameStarted);
            expect(restored.tutorialCompleted).toBe(original.tutorialCompleted);
            expect(restored.soundEnabled).toBe(original.soundEnabled);
            expect(restored.musicEnabled).toBe(original.musicEnabled);
        });

        it('should preserve array fields in round-trip', () => {
            // Create a fresh GameState
            const original = new GameState();

            // Serialize and deserialize
            const json = original.toJSON();
            const restored = new GameState();
            restored.fromJSON(json);

            // Assert arrays match exactly
            expect(restored.unlockedChartTypes).toEqual(original.unlockedChartTypes);
            expect(restored.purchasedItems).toEqual(original.purchasedItems);
            expect(restored.unlockedTools).toEqual(original.unlockedTools);
            expect(restored.unlockedLibraries).toEqual(original.unlockedLibraries);
        });

        it('should handle boundary values correctly', () => {
            const original = new GameState();

            // Set boundary values
            original.money = 0;
            original.reputation = -50; // Negative reputation is reachable via crime/ethics penalties
            original.purchasedItems = [];
            original.unlockedChartTypes = [];

            // Serialize and deserialize
            const json = original.toJSON();
            const restored = new GameState();
            restored.fromJSON(json);

            // Assert exact equality
            expect(restored.money).toBe(0);
            expect(restored.reputation).toBe(-50);
            expect(restored.purchasedItems).toEqual([]);
            expect(restored.unlockedChartTypes).toEqual([]);
        });

        it('should handle bank field round-trip by value', () => {
            const original = new GameState();

            // Set bank object
            original.bank = { savings: 500, loan: 200 };

            // Serialize and deserialize
            const json = original.toJSON();
            const restored = new GameState();
            restored.fromJSON(json);

            // Assert bank survives round-trip
            expect(restored.bank).toEqual({ savings: 500, loan: 200 });
            expect(restored.bank.savings).toBe(500);
            expect(restored.bank.loan).toBe(200);
        });

        it('should handle null bank field correctly', () => {
            const original = new GameState();

            // Ensure bank is null (default)
            original.bank = null;

            // Serialize and deserialize
            const json = original.toJSON();
            const restored = new GameState();
            restored.fromJSON(json);

            // Assert bank stays null
            expect(restored.bank).toBeNull();
        });
    });

    describe('fromJSON() with null/undefined', () => {
        it('should return immediately without throwing when data is null', () => {
            const gameState = new GameState();
            gameState.money = 500;

            // Should not throw
            expect(() => gameState.fromJSON(null)).not.toThrow();

            // Should not mutate existing state
            expect(gameState.money).toBe(500);
        });

        it('should return immediately without throwing when data is undefined', () => {
            const gameState = new GameState();
            gameState.money = 500;

            // Should not throw
            expect(() => gameState.fromJSON(undefined)).not.toThrow();

            // Should not mutate existing state
            expect(gameState.money).toBe(500);
        });

        it('should not mutate state when called with null', () => {
            const gameState = new GameState();
            const originalMoney = gameState.money;
            const originalReputation = gameState.reputation;
            const originalPurchasedItems = [...gameState.purchasedItems];

            gameState.fromJSON(null);

            expect(gameState.money).toBe(originalMoney);
            expect(gameState.reputation).toBe(originalReputation);
            expect(gameState.purchasedItems).toEqual(originalPurchasedItems);
        });

        it('should not mutate state when called with undefined', () => {
            const gameState = new GameState();
            const originalMoney = gameState.money;
            const originalReputation = gameState.reputation;
            const originalPurchasedItems = [...gameState.purchasedItems];

            gameState.fromJSON(undefined);

            expect(gameState.money).toBe(originalMoney);
            expect(gameState.reputation).toBe(originalReputation);
            expect(gameState.purchasedItems).toEqual(originalPurchasedItems);
        });
    });

    describe('fromJSON() with empty object', () => {
        it('should fall back every field to documented default', () => {
            const gameState = new GameState();

            // Load from empty object
            gameState.fromJSON({});

            // Assert defaults
            expect(gameState.money).toBe(100);
            expect(gameState.reputation).toBe(0);
            expect(gameState.rankIndex).toBe(0);
            expect(gameState.rent).toBe(500);
            expect(gameState.tasksCompleted).toBe(0);
            expect(gameState.perfectScores).toBe(0);
            expect(gameState.totalEarned).toBe(0);
            expect(gameState.weeklyIncome).toBe(0);
            expect(gameState.totalRatings).toBe(0);
            expect(gameState.ratingSum).toBe(0);
            expect(gameState.unlockedChartTypes).toEqual(['bar', 'line', 'pie']);
            expect(gameState.unlockedTools).toEqual([]);
            expect(gameState.purchasedItems).toEqual([]);
            expect(gameState.isGameStarted).toBe(false);
            expect(gameState.tutorialCompleted).toBe(false);
            expect(gameState.soundEnabled).toBe(true);
            expect(gameState.musicEnabled).toBe(true);
            expect(gameState.unlockedLibraries).toEqual([]);
            expect(gameState.bank).toBeNull();
        });

        it('should use default unlockedChartTypes when not provided', () => {
            const gameState = new GameState();
            gameState.fromJSON({});

            expect(gameState.unlockedChartTypes).toEqual(['bar', 'line', 'pie']);
        });

        it('should use default money (100) when not provided', () => {
            const gameState = new GameState();
            gameState.fromJSON({});

            expect(gameState.money).toBe(100);
        });

        it('should use default bank (null) when not provided', () => {
            const gameState = new GameState();
            gameState.fromJSON({});

            expect(gameState.bank).toBeNull();
        });
    });

    describe('fromJSON() with partial data', () => {
        it('should reset missing fields to defaults when loading partial data', () => {
            const gameState = new GameState();
            gameState.money = 500;
            gameState.reputation = 25;

            // Load partial data
            gameState.fromJSON({ money: 200 });

            // Money should be updated
            expect(gameState.money).toBe(200);
            // Reputation should be reset to default (0) because it's not in the data
            expect(gameState.reputation).toBe(0);
        });

        it('should use default for money when data.money is undefined', () => {
            const gameState = new GameState();
            gameState.money = 500;

            gameState.fromJSON({ reputation: 10 });

            // Money should default to 100 (via ?? operator)
            expect(gameState.money).toBe(100);
        });
    });

    describe('toJSON() serialization', () => {
        it('should include all required fields in JSON output', () => {
            const gameState = new GameState();
            const json = gameState.toJSON();

            // Check required primitive fields
            expect(json).toHaveProperty('money');
            expect(json).toHaveProperty('reputation');
            expect(json).toHaveProperty('rankIndex');
            expect(json).toHaveProperty('rent');
            expect(json).toHaveProperty('bank');
            expect(json).toHaveProperty('tasksCompleted');
            expect(json).toHaveProperty('perfectScores');
            expect(json).toHaveProperty('totalEarned');
            expect(json).toHaveProperty('weeklyIncome');
            expect(json).toHaveProperty('totalRatings');
            expect(json).toHaveProperty('ratingSum');
            expect(json).toHaveProperty('unlockedChartTypes');
            expect(json).toHaveProperty('purchasedItems');
            expect(json).toHaveProperty('unlockedTools');
            expect(json).toHaveProperty('isGameStarted');
            expect(json).toHaveProperty('tutorialCompleted');
            expect(json).toHaveProperty('soundEnabled');
            expect(json).toHaveProperty('musicEnabled');
            expect(json).toHaveProperty('unlockedLibraries');
        });

        it('should serialize modified state correctly', () => {
            const gameState = new GameState();
            gameState.money = 250;
            gameState.reputation = 50;
            gameState.purchasedItems = ['item1', 'item2'];
            gameState.bank = { savings: 1000, loan: 0 };

            const json = gameState.toJSON();

            expect(json.money).toBe(250);
            expect(json.reputation).toBe(50);
            expect(json.purchasedItems).toEqual(['item1', 'item2']);
            expect(json.bank).toEqual({ savings: 1000, loan: 0 });
        });
    });

    describe('Complex round-trip scenarios', () => {
        it('should handle multiple sequential round-trips', () => {
            const original = new GameState();
            original.money = 150;
            original.reputation = 30;
            original.purchasedItems = ['tool1', 'tool2'];
            original.bank = { savings: 250, loan: 50 };

            // First round-trip
            let json = original.toJSON();
            let restored = new GameState();
            restored.fromJSON(json);

            // Second round-trip
            json = restored.toJSON();
            restored = new GameState();
            restored.fromJSON(json);

            // Third round-trip
            json = restored.toJSON();
            restored = new GameState();
            restored.fromJSON(json);

            // All values should still match
            expect(restored.money).toBe(150);
            expect(restored.reputation).toBe(30);
            expect(restored.purchasedItems).toEqual(['tool1', 'tool2']);
            expect(restored.bank).toEqual({ savings: 250, loan: 50 });
        });

        it('should handle reset after loading', () => {
            const gameState = new GameState();
            gameState.money = 500;
            gameState.reputation = 100;
            gameState.purchasedItems = ['item1'];

            // Load some data
            gameState.fromJSON({
                money: 200,
                reputation: 50,
                purchasedItems: ['item2', 'item3']
            });

            // Reset should restore defaults
            gameState.reset();

            expect(gameState.money).toBe(100);
            expect(gameState.reputation).toBe(0);
            expect(gameState.purchasedItems).toEqual([]);
        });

        it('should handle loading after reset', () => {
            const gameState = new GameState();
            gameState.money = 500;

            gameState.reset();
            expect(gameState.money).toBe(100);

            gameState.fromJSON({ money: 300 });
            expect(gameState.money).toBe(300);
        });
    });

    describe('Edge cases and special values', () => {
        it('should handle zero values for all numeric fields', () => {
            const gameState = new GameState();
            gameState.fromJSON({
                money: 0,
                reputation: 0,
                rankIndex: 0,
                rent: 0,
                tasksCompleted: 0,
                perfectScores: 0,
                totalEarned: 0,
                weeklyIncome: 0,
                totalRatings: 0,
                ratingSum: 0
            });

            expect(gameState.money).toBe(0);
            expect(gameState.reputation).toBe(0);
            expect(gameState.rankIndex).toBe(0);
            expect(gameState.rent).toBe(0);
            expect(gameState.tasksCompleted).toBe(0);
            expect(gameState.perfectScores).toBe(0);
            expect(gameState.totalEarned).toBe(0);
            expect(gameState.weeklyIncome).toBe(0);
            expect(gameState.totalRatings).toBe(0);
            expect(gameState.ratingSum).toBe(0);
        });

        it('should handle large numeric values', () => {
            const gameState = new GameState();
            const largeValue = 999999999;

            gameState.fromJSON({
                money: largeValue,
                reputation: largeValue,
                totalEarned: largeValue,
                rankIndex: 999
            });

            expect(gameState.money).toBe(largeValue);
            expect(gameState.reputation).toBe(largeValue);
            expect(gameState.totalEarned).toBe(largeValue);
            expect(gameState.rankIndex).toBe(999);
        });

        it('should handle empty arrays correctly', () => {
            const gameState = new GameState();
            gameState.fromJSON({
                purchasedItems: [],
                unlockedChartTypes: [],
                unlockedTools: [],
                unlockedLibraries: []
            });

            expect(gameState.purchasedItems).toEqual([]);
            expect(gameState.unlockedChartTypes).toEqual([]);
            expect(gameState.unlockedTools).toEqual([]);
            expect(gameState.unlockedLibraries).toEqual([]);
        });

        it('should handle arrays with multiple elements', () => {
            const gameState = new GameState();
            const items = ['item1', 'item2', 'item3', 'item4', 'item5'];
            const charts = ['bar', 'line', 'pie', 'scatter', 'area'];

            gameState.fromJSON({
                purchasedItems: items,
                unlockedChartTypes: charts
            });

            expect(gameState.purchasedItems).toEqual(items);
            expect(gameState.unlockedChartTypes).toEqual(charts);
        });

        it('should handle bank object with complex values', () => {
            const gameState = new GameState();
            gameState.fromJSON({
                bank: { savings: 0, loan: 0 }
            });

            expect(gameState.bank).toEqual({ savings: 0, loan: 0 });

            gameState.fromJSON({
                bank: { savings: 999999, loan: -999999 }
            });

            expect(gameState.bank).toEqual({ savings: 999999, loan: -999999 });
        });

        it('should preserve bank undefined as null', () => {
            const gameState = new GameState();
            gameState.bank = { savings: 100, loan: 50 };

            // Load data without bank property
            gameState.fromJSON({});

            // bank should default to null
            expect(gameState.bank).toBeNull();
        });

        it('should handle boolean flags correctly', () => {
            const gameState = new GameState();

            gameState.fromJSON({
                isGameStarted: true,
                tutorialCompleted: true,
                soundEnabled: false,
                musicEnabled: false
            });

            expect(gameState.isGameStarted).toBe(true);
            expect(gameState.tutorialCompleted).toBe(true);
            expect(gameState.soundEnabled).toBe(false);
            expect(gameState.musicEnabled).toBe(false);
        });

        it('should handle boolean defaults when not provided', () => {
            const gameState = new GameState();

            gameState.fromJSON({});

            expect(gameState.isGameStarted).toBe(false);
            expect(gameState.tutorialCompleted).toBe(false);
            expect(gameState.soundEnabled).toBe(true);
            expect(gameState.musicEnabled).toBe(true);
        });
    });
});
