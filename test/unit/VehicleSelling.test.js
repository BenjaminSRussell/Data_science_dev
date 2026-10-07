/**
 * Vehicle Selling Unit Tests
 * Verifies that sell_car activity works correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorldMap, VEHICLES_MAP } from '../../src/js/game/WorldMap.js';

describe('Vehicle Selling', () => {
    let gameState;
    let worldMap;

    beforeEach(() => {
        // Create a mock game state
        gameState = {
            money: 100000,
            reputation: 100,
            characterStats: {
                getStat: (stat) => 100
            }
        };

        // Create a WorldMap instance
        worldMap = new WorldMap(gameState);
    });

    describe('sellVehicle', () => {
        it('should not allow selling unknown vehicles', () => {
            const result = worldMap.sellVehicle('unknown_vehicle');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Unknown vehicle');
        });

        it('should not allow selling a vehicle the player does not own', () => {
            const result = worldMap.sellVehicle('sedan');
            expect(result.success).toBe(false);
            expect(result.reason).toBe("You don't own this vehicle");
        });

        it('should not allow selling the walking option', () => {
            const result = worldMap.sellVehicle('walking');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('Cannot sell the walking option');
        });

        it('should successfully sell an owned vehicle', () => {
            // First, buy a vehicle
            const buyResult = worldMap.buyVehicle('used_car');
            expect(buyResult.success).toBe(true);
            expect(worldMap.ownedVehicles.has('used_car')).toBe(true);

            const initialMoney = gameState.money;

            // Now sell it
            const sellResult = worldMap.sellVehicle('used_car');
            expect(sellResult.success).toBe(true);
            expect(worldMap.ownedVehicles.has('used_car')).toBe(false);
        });

        it('should credit 50% of purchase price when selling', () => {
            // Buy a vehicle
            worldMap.buyVehicle('sedan');
            const moneyAfterBuy = gameState.money;

            // Sell it
            const sellResult = worldMap.sellVehicle('sedan');
            expect(sellResult.success).toBe(true);

            const vehicle = VEHICLES_MAP.get('sedan');
            const expectedSalePrice = Math.floor(vehicle.price * 0.5);
            expect(sellResult.salePrice).toBe(expectedSalePrice);

            // Money should increase by sale price
            expect(gameState.money).toBe(moneyAfterBuy + expectedSalePrice);
        });

        it('should fall back to walking if selling current vehicle', () => {
            // Buy and switch to a vehicle
            worldMap.buyVehicle('used_car');
            worldMap.switchVehicle('used_car');
            expect(worldMap.currentVehicle).toBe('used_car');

            // Sell the current vehicle
            const sellResult = worldMap.sellVehicle('used_car');
            expect(sellResult.success).toBe(true);
            expect(worldMap.currentVehicle).toBe('walking');
        });

        it('should keep current vehicle if selling a different owned vehicle', () => {
            // Buy two vehicles
            worldMap.buyVehicle('used_car');
            worldMap.buyVehicle('sedan');
            worldMap.switchVehicle('sedan');

            // Sell the other vehicle
            const sellResult = worldMap.sellVehicle('used_car');
            expect(sellResult.success).toBe(true);
            expect(worldMap.currentVehicle).toBe('sedan');
            expect(worldMap.ownedVehicles.has('sedan')).toBe(true);
        });

        it('should invalidate cache after selling', () => {
            // This is an internal test to ensure cache invalidation works
            worldMap.buyVehicle('used_car');

            // Get accessible locations (which uses cache)
            const accessibleBefore = worldMap.getAccessibleLocations();

            // Sell vehicle and check cache is invalidated
            worldMap.sellVehicle('used_car');

            // Cache should be invalidated (internal state)
            expect(worldMap._cacheInvalid).toBe(true);
        });

        it('should handle selling and re-buying a vehicle', () => {
            // Buy a vehicle
            const vehicle = VEHICLES_MAP.get('used_car');
            const initialMoney = gameState.money;

            worldMap.buyVehicle('used_car');
            expect(worldMap.ownedVehicles.has('used_car')).toBe(true);

            // Sell it
            worldMap.sellVehicle('used_car');
            expect(worldMap.ownedVehicles.has('used_car')).toBe(false);

            const moneyAfterSell = gameState.money;
            const expectedSalePrice = Math.floor(vehicle.price * 0.5);
            expect(moneyAfterSell).toBe(initialMoney - vehicle.price + expectedSalePrice);

            // Buy it again
            worldMap.buyVehicle('used_car');
            expect(worldMap.ownedVehicles.has('used_car')).toBe(true);
        });

        it('should not adjust reputation when selling (issue #1702 fix)', () => {
            const initialReputation = gameState.reputation;

            // Buy a vehicle (gains reputation)
            worldMap.buyVehicle('sedan');
            const reputationAfterBuy = gameState.reputation;
            expect(reputationAfterBuy).toBeGreaterThan(initialReputation);

            // Sell the vehicle - reputation should NOT change
            const reputationBeforeSell = gameState.reputation;
            worldMap.sellVehicle('sedan');
            const reputationAfterSell = gameState.reputation;

            // Reputation should remain the same after selling (not decreased)
            expect(reputationAfterSell).toBe(reputationBeforeSell);
        });
    });
});
