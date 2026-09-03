/**
 * Unit tests for EconomySystem daily living-expense deduction
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';

describe('EconomySystem daily finances', () => {
    let economy;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            money: 1000,
            currentLocation: 'apartment',
            worldMap: null
        };
        economy = new EconomySystem(mockGameState);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('processDailyFinances', () => {
        it('returns { expenses } and decreases gameState.money by exactly that amount', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);

            const moneyBefore = mockGameState.money;
            const result = economy.processDailyFinances();

            // Hand-computed from getDailyExpenses() with Math.random() === 0.5:
            // food: base 15 (apartment) + floor(0.5 * 30) = 15 + 15 = 30
            // utilities: 5 + floor(0.5 * 10) = 5 + 5 = 10
            // transportation: no worldMap -> 0
            // total: 30 + 10 + 0 = 40
            const expectedExpenses = 40;

            expect(result).toEqual({ expenses: expectedExpenses });
            expect(mockGameState.money).toBe(moneyBefore - expectedExpenses);
            expect(moneyBefore - mockGameState.money).toBe(result.expenses);
        });

        it('allows gameState.money to go below zero when expenses exceed current money', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);

            mockGameState.money = 10; // Less than the 40 daily expenses

            const result = economy.processDailyFinances();

            expect(result.expenses).toBe(40);
            expect(mockGameState.money).toBe(-30);
            expect(mockGameState.money).toBeLessThan(0);
        });
    });

    describe('getTransportationCost', () => {
        it('returns exactly 0 when gameState.worldMap is absent', () => {
            mockGameState.worldMap = null;
            expect(economy.getTransportationCost()).toBe(0);
        });

        it('returns exactly 2 for bus_pass (no randomness)', () => {
            mockGameState.worldMap = { currentVehicle: 'bus_pass' };
            expect(economy.getTransportationCost()).toBe(2);
        });

        it.each(['used_car', 'car'])('bounds the cost for %s to $5-15/day', (vehicle) => {
            mockGameState.worldMap = { currentVehicle: vehicle };
            const cost = economy.getTransportationCost();
            expect(cost).toBeGreaterThanOrEqual(5);
            expect(cost).toBeLessThanOrEqual(15);
        });

        it('returns exactly 0 for walking', () => {
            mockGameState.worldMap = { currentVehicle: 'walking' };
            expect(economy.getTransportationCost()).toBe(0);
        });
    });
});
