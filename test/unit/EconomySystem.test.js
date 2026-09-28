/**
 * Unit tests for EconomySystem daily living-expense deduction
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { GameState } from '../../src/js/game/GameState.js';

describe('EconomySystem daily finances', () => {
    let economy;
    let gameState;

    beforeEach(() => {
        // Real GameState: starts at currentLocation 'home' with worldMap null
        gameState = new GameState();
        gameState.money = 1000;
        economy = new EconomySystem(gameState);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('processDailyFinances', () => {
        it('returns { expenses } and decreases gameState.money by exactly that amount', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);

            const moneyBefore = gameState.money;
            const result = economy.processDailyFinances();

            // Hand-computed from getDailyExpenses() with Math.random() === 0.5:
            // food: base 15 (at 'home') + floor(0.5 * 30) = 15 + 15 = 30
            // utilities: 5 + floor(0.5 * 10) = 5 + 5 = 10
            // transportation: no worldMap -> 0
            // total: 30 + 10 + 0 = 40
            const expectedExpenses = 40;

            expect(gameState.currentLocation).toBe('home');
            expect(result).toEqual({ expenses: expectedExpenses });
            expect(gameState.money).toBe(moneyBefore - expectedExpenses);
            expect(moneyBefore - gameState.money).toBe(result.expenses);
        });

        it('charges the higher food base when the player is away from home', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);
            gameState.currentLocation = 'office';

            const moneyBefore = gameState.money;
            const result = economy.processDailyFinances();

            // food: base 25 (not 'home') + floor(0.5 * 50) = 25 + 25 = 50
            // utilities: 5 + floor(0.5 * 10) = 10
            // transportation: no worldMap -> 0
            // total: 50 + 10 + 0 = 60
            expect(result).toEqual({ expenses: 60 });
            expect(gameState.money).toBe(moneyBefore - 60);
        });

        it('allows gameState.money to go below zero when expenses exceed current money', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);

            gameState.money = 10; // Less than the 40 daily expenses at home

            const result = economy.processDailyFinances();

            expect(result.expenses).toBe(40);
            expect(gameState.money).toBe(-30);
            expect(gameState.money).toBeLessThan(0);
        });
    });

    describe('getTransportationCost', () => {
        it('returns exactly 0 when gameState.worldMap is absent', () => {
            gameState.worldMap = null;
            expect(economy.getTransportationCost()).toBe(0);
        });

        it('returns exactly 2 for bus_pass (no randomness)', () => {
            gameState.worldMap = { currentVehicle: 'bus_pass' };
            expect(economy.getTransportationCost()).toBe(2);
        });

        it.each(['used_car', 'car'])('bounds the cost for %s to $5-14/day', (vehicle) => {
            gameState.worldMap = { currentVehicle: vehicle };
            const randomSpy = vi.spyOn(Math, 'random');

            // cost = 5 + floor(Math.random() * 10), Math.random() in [0, 1)
            randomSpy.mockReturnValue(0);
            expect(economy.getTransportationCost()).toBe(5);

            randomSpy.mockReturnValue(0.999999);
            expect(economy.getTransportationCost()).toBe(14);

            randomSpy.mockRestore();
            const cost = economy.getTransportationCost();
            expect(cost).toBeGreaterThanOrEqual(5);
            expect(cost).toBeLessThanOrEqual(14);
        });

        it('returns exactly 0 for walking', () => {
            gameState.worldMap = { currentVehicle: 'walking' };
            expect(economy.getTransportationCost()).toBe(0);
        });
    });
});
