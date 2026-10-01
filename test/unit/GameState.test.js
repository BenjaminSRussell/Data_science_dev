/**
 * GameState Unit Tests
 * Tests for GameState functionality including perk purchases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';

describe('GameState', () => {
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
    });

    describe('purchaseItem - Perks', () => {
        it('should purchase a perk and add perkId to unlockedPerks', () => {
            // Setup
            gameState.money = 1000;
            const perkItem = {
                id: 'perk_bonus_multiplier',
                name: 'Negotiation Skills',
                description: '+15% money from all tasks',
                type: 'perk',
                perkId: 'bonus_multiplier',
                price: 700
            };

            // Act
            const success = gameState.purchaseItem(perkItem);

            // Assert
            expect(success).toBe(true);
            expect(gameState.unlockedPerks).toContain('bonus_multiplier');
            expect(gameState.purchasedItems).toContain('perk_bonus_multiplier');
            expect(gameState.money).toBe(300); // 1000 - 700
        });

        it('should purchase multiple different perks', () => {
            // Setup
            gameState.money = 2000;
            const perk1 = {
                id: 'perk_time_bonus',
                type: 'perk',
                perkId: 'time_bonus',
                price: 700
            };
            const perk2 = {
                id: 'perk_rep_boost',
                type: 'perk',
                perkId: 'rep_boost',
                price: 800
            };

            // Act
            gameState.purchaseItem(perk1);
            gameState.purchaseItem(perk2);

            // Assert
            expect(gameState.unlockedPerks).toContain('time_bonus');
            expect(gameState.unlockedPerks).toContain('rep_boost');
            expect(gameState.unlockedPerks.length).toBe(2);
            expect(gameState.money).toBe(500); // 2000 - 700 - 800
        });

        it('should prevent purchasing the same perk twice', () => {
            // Setup
            gameState.money = 1500;
            const perkItem = {
                id: 'perk_bonus_multiplier',
                type: 'perk',
                perkId: 'bonus_multiplier',
                price: 700
            };

            // Act - First purchase
            const firstPurchase = gameState.purchaseItem(perkItem);
            expect(firstPurchase).toBe(true);

            // Act - Second purchase (should fail)
            const secondPurchase = gameState.purchaseItem(perkItem);

            // Assert
            expect(secondPurchase).toBe(false);
            expect(gameState.unlockedPerks.length).toBe(1);
            expect(gameState.money).toBe(800); // Only deducted once
        });

        it('should not purchase perk if player cannot afford it', () => {
            // Setup
            gameState.money = 500;
            const perkItem = {
                id: 'perk_bonus_multiplier',
                type: 'perk',
                perkId: 'bonus_multiplier',
                price: 700
            };

            // Act
            const success = gameState.purchaseItem(perkItem);

            // Assert
            expect(success).toBe(false);
            expect(gameState.unlockedPerks.length).toBe(0);
            expect(gameState.purchasedItems.length).toBe(0);
            expect(gameState.money).toBe(500); // No change
        });

        it('should persist unlockedPerks through toJSON and fromJSON', () => {
            // Setup
            gameState.money = 2000;
            const perkItem = {
                id: 'perk_time_bonus',
                type: 'perk',
                perkId: 'time_bonus',
                price: 700
            };

            // Act - Purchase perk
            gameState.purchaseItem(perkItem);
            const originalUnlockedPerks = [...gameState.unlockedPerks];

            // Serialize and deserialize
            const savedData = gameState.toJSON();
            const newGameState = new GameState();
            newGameState.fromJSON(savedData);

            // Assert
            expect(newGameState.unlockedPerks).toEqual(originalUnlockedPerks);
            expect(newGameState.unlockedPerks).toContain('time_bonus');
        });
    });

    describe('purchaseItem - Other types', () => {
        it('should still support purchasing tools', () => {
            // Setup
            gameState.money = 500;
            const toolItem = {
                id: 'tool_data_filter',
                type: 'tool',
                toolId: 'data_filter',
                price: 300
            };

            // Act
            const success = gameState.purchaseItem(toolItem);

            // Assert
            expect(success).toBe(true);
            expect(gameState.unlockedTools).toContain('data_filter');
            expect(gameState.money).toBe(200);
        });

        it('should still support purchasing software', () => {
            // Setup
            gameState.money = 500;
            const softwareItem = {
                id: 'soft_ide_pro',
                type: 'software',
                price: 250
            };

            // Act
            const success = gameState.purchaseItem(softwareItem);

            // Assert
            expect(success).toBe(true);
            expect(gameState.purchasedItems).toContain('soft_ide_pro');
            expect(gameState.money).toBe(250);
        });
    });

    describe('GameState initialization', () => {
        it('should initialize unlockedPerks as empty array', () => {
            expect(gameState.unlockedPerks).toEqual([]);
            expect(Array.isArray(gameState.unlockedPerks)).toBe(true);
        });

        it('should initialize unlockedPerks to empty when loading old save data', () => {
            // Simulate old save data without unlockedPerks field
            const oldData = {
                money: 1000,
                reputation: 100,
                unlockedTools: ['data_filter'],
                purchasedItems: ['tool_data_filter']
            };

            gameState.fromJSON(oldData);

            expect(gameState.unlockedPerks).toEqual([]);
        });
    });
});
