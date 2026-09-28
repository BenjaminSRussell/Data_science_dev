/**
 * Unit tests for InvestmentEcommerceSystem (e-commerce half)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InvestmentEcommerceSystem } from '../../src/js/game/InvestmentEcommerceSystem.js';

describe('InvestmentEcommerceSystem (e-commerce)', () => {
    let system;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            money: 10000,
            timeManager: { totalDays: 14 }
        };
        system = new InvestmentEcommerceSystem(mockGameState);
    });

    describe('startEcommerceBusiness', () => {
        it('fails when money is insufficient', () => {
            mockGameState.money = 500;
            const result = system.startEcommerceBusiness('Shop', 1000);
            expect(result.success).toBe(false);
            expect(result.message).toBe('Not enough money to start business.');
            expect(system.ecommerceBusiness).toBeNull();
            expect(mockGameState.money).toBe(500);
        });

        it('fails with "already have a business" when already set, even if affordable', () => {
            system.startEcommerceBusiness('First', 100);
            const result = system.startEcommerceBusiness('Second', 100);
            expect(result.success).toBe(false);
            expect(result.message).toBe('You already have an e-commerce business.');
            expect(system.ecommerceBusiness.name).toBe('First');
        });

        it('success deducts exactly and initializes with level:1, empty products/revenue/expenses/reputation/inventory', () => {
            const result = system.startEcommerceBusiness('My Store', 2500);
            expect(result.success).toBe(true);
            expect(mockGameState.money).toBe(7500);
            expect(system.ecommerceBusiness).toEqual({
                name: 'My Store',
                level: 1,
                products: [],
                revenue: 0,
                expenses: 0,
                customers: 0,
                reputation: 0,
                inventory: {},
                marketingBudget: 0,
                startedWeek: 2
            });
        });
    });

    describe('addProduct', () => {
        it('fails when there is no business', () => {
            const result = system.addProduct({ id: 'p1', name: 'Widget', cost: 100, price: 50, stock: 10 });
            expect(result.success).toBe(false);
            expect(result.message).toBe("You don't have an e-commerce business.");
        });

        it('fails with insufficient money for an explicit cost', () => {
            system.startEcommerceBusiness('Shop', 100);
            mockGameState.money = 50;
            const result = system.addProduct({ id: 'p1', name: 'Widget', cost: 100, price: 50, stock: 10 });
            expect(result.success).toBe(false);
            expect(result.message).toBe('Not enough money to add product.');
            expect(mockGameState.money).toBe(50);
            expect(system.ecommerceBusiness.products).toHaveLength(0);
        });

        it('fails with insufficient money for the default cost of 100', () => {
            system.startEcommerceBusiness('Shop', 100);
            mockGameState.money = 99;
            const result = system.addProduct({ id: 'p1', name: 'Widget', price: 50, stock: 10 });
            expect(result.success).toBe(false);
            expect(result.message).toBe('Not enough money to add product.');
            expect(mockGameState.money).toBe(99);
        });

        it('success deducts cost, pushes product, and sets inventory', () => {
            system.startEcommerceBusiness('Shop', 100);
            const product = { id: 'p1', name: 'Widget', cost: 250, price: 50, stock: 10 };
            const result = system.addProduct(product);
            expect(result.success).toBe(true);
            expect(mockGameState.money).toBe(9650);
            expect(system.ecommerceBusiness.products).toEqual([product]);
            expect(system.ecommerceBusiness.inventory.p1).toBe(10);
        });

        it('uses default cost of 100 when product.cost is missing', () => {
            system.startEcommerceBusiness('Shop', 100);
            const product = { id: 'p1', name: 'Widget', price: 50, stock: 5 };
            system.addProduct(product);
            expect(mockGameState.money).toBe(9800);
            expect(system.ecommerceBusiness.inventory.p1).toBe(5);
        });
    });

    describe('processWeeklyOperations', () => {
        it('returns null when there is no business', () => {
            expect(system.processWeeklyOperations()).toBeNull();
        });

        it('computes marketingEffect capped at 2.0, reputationEffect 1.5, baseSales, and floored sales', () => {
            system.startEcommerceBusiness('Shop', 100);
            system.addProduct({ id: 'p1', name: 'A', cost: 0, price: 10, stock: 100 });
            system.addProduct({ id: 'p2', name: 'B', cost: 0, price: 20, stock: 100 });
            system.ecommerceBusiness.marketingBudget = 5000;
            system.ecommerceBusiness.reputation = 50;

            const result = system.processWeeklyOperations();

            // marketingEffect = min(2.0, 1 + 5000/1000) = 2.0 (capped)
            // reputationEffect = 1 + 50/100 = 1.5
            // baseSales = 2 * 10 = 20
            // sales = floor(20 * 2.0 * 1.5) = 60
            expect(result.sales).toBe(60);
        });

        it('limits per-product revenue by inventory when inventory is the binding constraint', () => {
            system.startEcommerceBusiness('Shop', 100);
            system.addProduct({ id: 'p1', name: 'A', cost: 0, price: 10, stock: 5 });
            system.addProduct({ id: 'p2', name: 'B', cost: 0, price: 20, stock: 100 });
            system.ecommerceBusiness.marketingBudget = 5000;
            system.ecommerceBusiness.reputation = 50;

            const result = system.processWeeklyOperations();

            // sales = 60, per-product share = 30
            // p1: min(30, 5) = 5 sold -> 5 * 10 = 50
            // p2: min(30, 100) = 30 sold -> 30 * 20 = 600
            expect(result.revenue).toBe(650);
            expect(system.ecommerceBusiness.inventory.p1).toBe(0);
            expect(system.ecommerceBusiness.inventory.p2).toBe(70);
        });

        it('limits per-product revenue by sales share when inventory is ample', () => {
            system.startEcommerceBusiness('Shop', 100);
            system.addProduct({ id: 'p1', name: 'A', cost: 0, price: 10, stock: 100 });
            system.addProduct({ id: 'p2', name: 'B', cost: 0, price: 20, stock: 100 });
            system.ecommerceBusiness.marketingBudget = 5000;
            system.ecommerceBusiness.reputation = 50;

            const result = system.processWeeklyOperations();

            // sales = 60, per-product share = 30
            // p1: min(30, 100) = 30 -> 30 * 10 = 300
            // p2: min(30, 100) = 30 -> 30 * 20 = 600
            expect(result.revenue).toBe(900);
            expect(system.ecommerceBusiness.inventory.p1).toBe(70);
            expect(system.ecommerceBusiness.inventory.p2).toBe(70);
        });

        it('computes expenses exactly as marketingBudget + products.length*50 and adds profit to money', () => {
            const moneyBefore = 9800;
            mockGameState.money = moneyBefore;
            system.startEcommerceBusiness('Shop', 0);
            system.addProduct({ id: 'p1', name: 'A', cost: 0, price: 10, stock: 100 });
            system.addProduct({ id: 'p2', name: 'B', cost: 0, price: 20, stock: 100 });
            system.ecommerceBusiness.marketingBudget = 5000;
            system.ecommerceBusiness.reputation = 50;

            const result = system.processWeeklyOperations();

            // expenses = 5000 + 2*50 = 5100
            expect(result.expenses).toBe(5100);
            // revenue = 900, profit = 900 - 5100 = -4200
            expect(result.profit).toBe(-4200);
            expect(mockGameState.money).toBe(moneyBefore - 4200);
            expect(system.ecommerceBusiness.revenue).toBe(900);
            expect(system.ecommerceBusiness.expenses).toBe(5100);
        });

        it('caps reputation at 100 via min(100, reputation + floor(sales/10))', () => {
            system.startEcommerceBusiness('Shop', 100);
            system.addProduct({ id: 'p1', name: 'A', cost: 0, price: 10, stock: 100 });
            system.ecommerceBusiness.marketingBudget = 5000;
            system.ecommerceBusiness.reputation = 95;

            const result = system.processWeeklyOperations();

            // baseSales = 10, marketingEffect = 2.0, reputationEffect = 1.95
            // sales = floor(10 * 2.0 * 1.95) = 39
            // reputation = min(100, 95 + floor(39/10)) = min(100, 98) = 98
            expect(result.sales).toBe(39);
            expect(system.ecommerceBusiness.reputation).toBe(98);
        });

        it('caps reputation at exactly 100 when the increase would exceed it', () => {
            system.startEcommerceBusiness('Shop', 100);
            system.addProduct({ id: 'p1', name: 'A', cost: 0, price: 10, stock: 100 });
            system.addProduct({ id: 'p2', name: 'B', cost: 0, price: 10, stock: 100 });
            system.ecommerceBusiness.marketingBudget = 5000;
            system.ecommerceBusiness.reputation = 98;

            system.processWeeklyOperations();

            // sales = floor(20 * 2.0 * 1.98) = 79
            // reputation = min(100, 98 + floor(79/10)) = min(100, 105) = 100
            expect(system.ecommerceBusiness.reputation).toBe(100);
        });
    });

    describe('investInMarketing', () => {
        it('fails with the no-business message', () => {
            const result = system.investInMarketing(500);
            expect(result.success).toBe(false);
            expect(result.message).toBe("You don't have an e-commerce business.");
        });

        it('fails with the insufficient-money message', () => {
            system.startEcommerceBusiness('Shop', 100);
            mockGameState.money = 100;
            const result = system.investInMarketing(500);
            expect(result.success).toBe(false);
            expect(result.message).toBe('Not enough money.');
            expect(mockGameState.money).toBe(100);
            expect(system.ecommerceBusiness.marketingBudget).toBe(0);
        });

        it('success deducts money and adds to marketingBudget', () => {
            system.startEcommerceBusiness('Shop', 100);
            const result = system.investInMarketing(500);
            expect(result.success).toBe(true);
            expect(mockGameState.money).toBe(9400);
            expect(system.ecommerceBusiness.marketingBudget).toBe(500);
        });
    });

    describe('getEcommerceStatus', () => {
        it('returns null when there is no business', () => {
            expect(system.getEcommerceStatus()).toBeNull();
        });

        it('returns profitMargin exactly 0 (not NaN) when revenue is 0', () => {
            system.startEcommerceBusiness('Shop', 100);
            const status = system.getEcommerceStatus();
            expect(status).not.toBeNull();
            expect(status.profitMargin).toBe(0);
            expect(Number.isNaN(status.profitMargin)).toBe(false);
            expect(status.netProfit).toBe(0);
        });

        it('computes netProfit and profitMargin when revenue is positive', () => {
            system.startEcommerceBusiness('Shop', 100);
            system.ecommerceBusiness.revenue = 200;
            system.ecommerceBusiness.expenses = 50;
            const status = system.getEcommerceStatus();
            expect(status.netProfit).toBe(150);
            expect(status.profitMargin).toBe(75);
        });
    });
});
