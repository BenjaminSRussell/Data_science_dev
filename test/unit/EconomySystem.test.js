/**
 * EconomySystem Unit Tests
 * Tests for daily finance processing, expenses, and transportation costs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';

describe('EconomySystem', () => {
    let economySystem;
    let gameState;
    let mathRandomSpy;

    beforeEach(() => {
        // Mock gameState object
        gameState = {
            money: 1000,
            currentLocation: 'apartment',
            worldMap: null
        };

        economySystem = new EconomySystem(gameState);

        // Spy on Math.random but don't mock yet - we'll mock it per test
        mathRandomSpy = vi.spyOn(Math, 'random');
    });

    afterEach(() => {
        mathRandomSpy.mockRestore();
    });

    describe('getTransportationCost', () => {
        it('should return 0 when gameState.worldMap is absent', () => {
            gameState.worldMap = null;

            const cost = economySystem.getTransportationCost();

            expect(cost).toBe(0);
        });

        it('should return 0 for walking', () => {
            gameState.worldMap = {
                currentVehicle: 'walking'
            };

            const cost = economySystem.getTransportationCost();

            expect(cost).toBe(0);
        });

        it('should return exactly 2 for bus_pass (no randomness)', () => {
            gameState.worldMap = {
                currentVehicle: 'bus_pass'
            };

            // Test multiple times to ensure it's always exactly 2
            for (let i = 0; i < 5; i++) {
                const cost = economySystem.getTransportationCost();
                expect(cost).toBe(2);
            }
        });

        it('should return 5-15 for used_car', () => {
            gameState.worldMap = {
                currentVehicle: 'used_car'
            };

            mathRandomSpy.mockReturnValue(0.5);

            const cost = economySystem.getTransportationCost();

            // With Math.random() = 0.5: 5 + floor(0.5 * 10) = 5 + 5 = 10
            expect(cost).toBe(10);
            expect(cost).toBeGreaterThanOrEqual(5);
            expect(cost).toBeLessThanOrEqual(15);
        });

        it('should return 5-15 for car', () => {
            gameState.worldMap = {
                currentVehicle: 'car'
            };

            mathRandomSpy.mockReturnValue(0.5);

            const cost = economySystem.getTransportationCost();

            // With Math.random() = 0.5: 5 + floor(0.5 * 10) = 5 + 5 = 10
            expect(cost).toBe(10);
            expect(cost).toBeGreaterThanOrEqual(5);
            expect(cost).toBeLessThanOrEqual(15);
        });

        it('should return minimum value when Math.random returns near 0 for used_car', () => {
            gameState.worldMap = {
                currentVehicle: 'used_car'
            };

            mathRandomSpy.mockReturnValue(0.0);

            const cost = economySystem.getTransportationCost();

            // 5 + floor(0.0 * 10) = 5 + 0 = 5
            expect(cost).toBe(5);
        });

        it('should return maximum value when Math.random returns near 1 for used_car', () => {
            gameState.worldMap = {
                currentVehicle: 'used_car'
            };

            mathRandomSpy.mockReturnValue(0.99);

            const cost = economySystem.getTransportationCost();

            // 5 + floor(0.99 * 10) = 5 + 9 = 14
            expect(cost).toBe(14);
        });
    });

    describe('getDailyExpenses', () => {
        it('should calculate total daily expenses with mocked Math.random()', () => {
            gameState.currentLocation = 'apartment';
            gameState.worldMap = {
                currentVehicle: 'walking'
            };

            mathRandomSpy.mockReturnValue(0.5);

            const expenses = economySystem.getDailyExpenses();

            // Food: 15 + floor(0.5 * 30) = 15 + 15 = 30
            // Utilities: 5 + floor(0.5 * 10) = 5 + 5 = 10
            // Transportation: 0 (walking)
            // Total: 40
            expect(expenses).toBe(40);
        });

        it('should calculate expenses for bus_pass', () => {
            gameState.currentLocation = 'apartment';
            gameState.worldMap = {
                currentVehicle: 'bus_pass'
            };

            mathRandomSpy.mockReturnValue(0.5);

            const expenses = economySystem.getDailyExpenses();

            // Food: 30
            // Utilities: 10
            // Transportation: 2
            // Total: 42
            expect(expenses).toBe(42);
        });

        it('should calculate expenses for non-apartment location', () => {
            gameState.currentLocation = 'other';
            gameState.worldMap = {
                currentVehicle: 'walking'
            };

            mathRandomSpy.mockReturnValue(0.5);

            const expenses = economySystem.getDailyExpenses();

            // Food: 25 + floor(0.5 * 50) = 25 + 25 = 50
            // Utilities: 5 + floor(0.5 * 10) = 5 + 5 = 10
            // Transportation: 0 (walking)
            // Total: 60
            expect(expenses).toBe(60);
        });

        it('should calculate expenses with used_car', () => {
            gameState.currentLocation = 'apartment';
            gameState.worldMap = {
                currentVehicle: 'used_car'
            };

            mathRandomSpy.mockReturnValue(0.5);

            const expenses = economySystem.getDailyExpenses();

            // Food: 30
            // Utilities: 10
            // Transportation: 10 (5 + floor(0.5 * 10))
            // Total: 50
            expect(expenses).toBe(50);
        });

        it('should return a number', () => {
            gameState.worldMap = { currentVehicle: 'walking' };
            mathRandomSpy.mockReturnValue(0.5);

            const expenses = economySystem.getDailyExpenses();

            expect(typeof expenses).toBe('number');
        });
    });

    describe('processDailyFinances', () => {
        it('should return object with expenses property', () => {
            gameState.worldMap = { currentVehicle: 'walking' };
            mathRandomSpy.mockReturnValue(0.5);

            const result = economySystem.processDailyFinances();

            expect(result).toHaveProperty('expenses');
            expect(typeof result.expenses).toBe('number');
        });

        it('should decrease gameState.money by exactly the expenses amount', () => {
            gameState.currentLocation = 'apartment';
            gameState.worldMap = { currentVehicle: 'walking' };
            gameState.money = 1000;

            mathRandomSpy.mockReturnValue(0.5);

            const result = economySystem.processDailyFinances();

            // Expected expenses: 40 (from previous test)
            expect(result.expenses).toBe(40);
            expect(gameState.money).toBe(1000 - 40);
            expect(gameState.money).toBe(960);
        });

        it('should return expenses that equals the money decrease', () => {
            gameState.currentLocation = 'apartment';
            gameState.worldMap = { currentVehicle: 'bus_pass' };
            gameState.money = 500;

            mathRandomSpy.mockReturnValue(0.5);

            const moneyBefore = gameState.money;
            const result = economySystem.processDailyFinances();
            const moneyAfter = gameState.money;

            // The amount money decreased
            const moneyDecreased = moneyBefore - moneyAfter;

            // Should equal the returned expenses
            expect(result.expenses).toBe(moneyDecreased);
        });

        it('should allow gameState.money to go negative when expenses exceed current money', () => {
            gameState.currentLocation = 'apartment';
            gameState.worldMap = { currentVehicle: 'used_car' };
            gameState.money = 40; // Less than expected expenses (50)

            mathRandomSpy.mockReturnValue(0.5);

            const result = economySystem.processDailyFinances();

            // With used_car and Math.random 0.5: expenses = 50
            expect(result.expenses).toBe(50);

            // Money should go negative
            expect(gameState.money).toBe(40 - 50);
            expect(gameState.money).toBe(-10);
            expect(gameState.money).toBeLessThan(0);
        });

        it('should correctly process finances with no worldMap', () => {
            gameState.currentLocation = 'apartment';
            gameState.worldMap = null;
            gameState.money = 100;

            mathRandomSpy.mockReturnValue(0.5);

            const result = economySystem.processDailyFinances();

            // Transportation cost is 0 when no worldMap
            // Food: 30, Utilities: 10, Transportation: 0 = 40
            expect(result.expenses).toBe(40);
            expect(gameState.money).toBe(60);
        });

        it('should handle multiple consecutive calls correctly', () => {
            gameState.currentLocation = 'apartment';
            gameState.worldMap = { currentVehicle: 'walking' };
            gameState.money = 500;

            mathRandomSpy.mockReturnValue(0.5);

            // First call
            const result1 = economySystem.processDailyFinances();
            expect(result1.expenses).toBe(40);
            expect(gameState.money).toBe(460);

            // Second call
            const result2 = economySystem.processDailyFinances();
            expect(result2.expenses).toBe(40);
            expect(gameState.money).toBe(420);
        });
    });

    describe('Edge cases', () => {
        it('should handle zero money before processing', () => {
            gameState.currentLocation = 'apartment';
            gameState.worldMap = { currentVehicle: 'walking' };
            gameState.money = 0;

            mathRandomSpy.mockReturnValue(0.5);

            const result = economySystem.processDailyFinances();

            expect(result.expenses).toBe(40);
            expect(gameState.money).toBe(-40);
        });

        it('should handle very large money values', () => {
            gameState.currentLocation = 'apartment';
            gameState.worldMap = { currentVehicle: 'walking' };
            gameState.money = 999999;

            mathRandomSpy.mockReturnValue(0.5);

            const result = economySystem.processDailyFinances();

            expect(result.expenses).toBe(40);
            expect(gameState.money).toBe(999999 - 40);
        });

        it('should use default vehicle when currentVehicle is not set', () => {
            gameState.worldMap = {};
            // currentVehicle is undefined, should default to 'walking'

            const cost = economySystem.getTransportationCost();

            expect(cost).toBe(0);
        });
    });
});
