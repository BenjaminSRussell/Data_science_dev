import { InvestmentEcommerceSystem } from '../../src/js/game/InvestmentEcommerceSystem.js';

describe('InvestmentEcommerceSystem', () => {
    let system;
    let gameState;

    beforeEach(() => {
        gameState = { money: 10000 };
        system = new InvestmentEcommerceSystem(gameState);
        system.startEcommerceBusiness('Test Store', 1000);
    });

    describe('marketing spend is a one-time investment, not a recurring expense', () => {
        it('does not re-charge marketing spend as a weekly expense', () => {
            system.investInMarketing(500);
            expect(gameState.money).toBe(8500); // 10000 - 1000 (business) - 500 (marketing)

            const first = system.processWeeklyOperations();
            const moneyAfterFirst = gameState.money;

            // Second weekly run must not charge the $500 marketing spend again
            const second = system.processWeeklyOperations();
            expect(second.expenses).toBe(first.expenses);
            expect(gameState.money - moneyAfterFirst).toBe(second.profit);
        });

        it('expenses contain only per-product operating costs, not marketingBudget', () => {
            system.investInMarketing(500);
            system.addProduct({ id: 'p1', name: 'Widget', price: 100, cost: 100, stock: 100 });

            const result = system.processWeeklyOperations();
            // 1 product * 50 operating cost; the $500 marketing must not appear
            expect(result.expenses).toBe(50);
        });

        it('marketing still boosts sales as a durable multiplier', () => {
            system.addProduct({ id: 'p1', name: 'Widget', price: 100, cost: 100, stock: 1000 });
            const withoutMarketing = system.processWeeklyOperations();

            const system2 = new InvestmentEcommerceSystem({ money: 10000 });
            system2.startEcommerceBusiness('Test Store', 1000);
            system2.addProduct({ id: 'p1', name: 'Widget', price: 100, cost: 100, stock: 1000 });
            system2.investInMarketing(500);
            const withMarketing = system2.processWeeklyOperations();

            expect(withMarketing.sales).toBeGreaterThan(withoutMarketing.sales);
        });
    });
});
