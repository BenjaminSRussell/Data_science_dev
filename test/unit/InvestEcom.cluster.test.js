import { describe, it, expect } from 'vitest';
import { InvestmentEcommerceSystem } from '../../src/js/game/InvestmentEcommerceSystem.js';

function make(money = 100000, prices = { ACME: 10 }) {
    const gs = { money, stockMarket: { getStock: (id) => (id in prices ? { price: prices[id] } : null) } };
    return { gs, sys: new InvestmentEcommerceSystem(gs), prices };
}

describe('stock portfolio math (#405, #1982)', () => {
    it('averages cost, tracks profit, and reduces the basis on a full exit', () => {
        const { gs, sys, prices } = make();
        sys.buyStock('ACME', 10, 10);
        sys.buyStock('ACME', 10, 20);
        expect(sys.portfolio.stocks.ACME.avgPrice).toBe(15);
        expect(sys.portfolio.initialInvestment).toBe(300);
        prices.ACME = 30;
        const summary = sys.getPortfolioSummary();
        expect(summary.totalValue).toBe(600);
        expect(summary.profit).toBe(300);
        expect(summary.profitPercent).toBe(100);
        expect(typeof summary.profitPercent).toBe('number');
        const sold = sys.sellStock('ACME', 20, 30);
        expect(sold.profit).toBe(300);
        expect(sys.portfolio.initialInvestment).toBe(0);
        expect(sys.getPortfolioSummary().profitPercent).toBe(0);
        expect(gs.money).toBe(100000 - 300 + 600);
    });

    it('profitPercent is rounded to 2 places', () => {
        const { sys, prices } = make();
        sys.buyStock('ACME', 3, 10);
        prices.ACME = 11;
        expect(sys.getPortfolioSummary().profitPercent).toBe(10);
        prices.ACME = 10.1;
        expect(sys.getPortfolioSummary().profitPercent).toBe(1);
    });
});

describe('e-commerce validation and weekly operations', () => {
    function shop(money = 10000) {
        const ctx = make(money);
        expect(ctx.sys.startEcommerceBusiness('Shop', 1000).success).toBe(true);
        return ctx;
    }

    it('rejects negative or NaN start-up investment (#1003)', () => {
        const { gs, sys } = make(500);
        expect(sys.startEcommerceBusiness('Bad', -1000).success).toBe(false);
        expect(sys.startEcommerceBusiness('Bad', NaN).success).toBe(false);
        expect(gs.money).toBe(500);
    });

    it('validates products and rejects duplicate ids (#1004, #1981)', () => {
        const { gs, sys } = shop();
        expect(sys.addProduct({ name: 'No id', price: 5 }).success).toBe(false);
        expect(sys.addProduct({ id: 'a', name: 'No price' }).success).toBe(false);
        expect(sys.addProduct({ id: 'a', name: 'A', price: 5, stock: 100 }).success).toBe(true);
        expect(sys.addProduct({ id: 'a', name: 'A again', price: 5, stock: 0 }).success).toBe(false);
        expect(sys.ecommerceBusiness.products).toHaveLength(1);
        expect(sys.ecommerceBusiness.inventory.a).toBe(100);
        expect(gs.money).toBe(10000 - 1000 - 100);
    });

    it('a free product costs nothing (#1358)', () => {
        const { gs, sys } = shop();
        const before = gs.money;
        expect(sys.addProduct({ id: 'free', name: 'Freebie', price: 1, cost: 0 }).success).toBe(true);
        expect(gs.money).toBe(before);
    });

    it('rejects negative marketing spend (#1357)', () => {
        const { gs, sys } = shop();
        const before = gs.money;
        expect(sys.investInMarketing(-500).success).toBe(false);
        expect(sys.investInMarketing(0).success).toBe(false);
        expect(gs.money).toBe(before);
        expect(sys.ecommerceBusiness.marketingBudget).toBe(0);
    });

    it('marketing is paid once, not every week (#1005)', () => {
        const { gs, sys } = shop();
        sys.addProduct({ id: 'a', name: 'A', price: 0, cost: 0, stock: 0 });
        sys.investInMarketing(1000);
        const afterSpend = gs.money;
        const w1 = sys.processWeeklyOperations();
        const w2 = sys.processWeeklyOperations();
        expect(w1.expenses).toBe(50);
        expect(w2.expenses).toBe(50);
        expect(gs.money).toBe(afterSpend - 100);
        expect(sys.ecommerceBusiness.marketingBudget).toBe(562); // 1000 -> 750 -> 562
    });

    it('no stock means no customers or reputation (#1356)', () => {
        const { sys } = shop();
        sys.addProduct({ id: 'a', name: 'A', price: 10, cost: 0, stock: 0 });
        sys.investInMarketing(1000);
        const week = sys.processWeeklyOperations();
        expect(week.sales).toBeGreaterThan(0);
        expect(week.unitsSold).toBe(0);
        expect(sys.ecommerceBusiness.customers).toBe(0);
        expect(sys.ecommerceBusiness.reputation).toBe(0);
    });

    it('sales are capped by stock and counted in whole units', () => {
        const { sys } = shop();
        sys.addProduct({ id: 'a', name: 'A', price: 10, cost: 0, stock: 4 });
        const week = sys.processWeeklyOperations();
        expect(week.unitsSold).toBe(4);
        expect(week.revenue).toBe(40);
        expect(sys.ecommerceBusiness.inventory.a).toBe(0);
        expect(sys.ecommerceBusiness.customers).toBe(4);
    });
});
