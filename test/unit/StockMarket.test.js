import { Portfolio } from '../../src/js/game/StockMarket.js';

describe('Portfolio', () => {
    let portfolio;

    beforeEach(() => {
        portfolio = new Portfolio();
    });

    describe('buy', () => {
        it('should set holdings to exactly quantity and increase totalInvested by quantity * price for a new stock', () => {
            portfolio.buy('ggl', 10, 150);

            expect(portfolio.holdings['ggl']).toBe(10);
            expect(portfolio.totalInvested).toBe(1500);
        });

        it('should accumulate holdings and totalInvested when buying the same stock twice at different prices', () => {
            portfolio.buy('ggl', 10, 150);
            portfolio.buy('ggl', 5, 160);

            expect(portfolio.holdings['ggl']).toBe(15);
            expect(portfolio.totalInvested).toBe(10 * 150 + 5 * 160);
        });
    });

    describe('sell', () => {
        it('should return 0 and not mutate holdings when selling more than held', () => {
            portfolio.buy('ggl', 10, 150);

            const revenue = portfolio.sell('ggl', 20, 160);

            expect(revenue).toBe(0);
            expect(portfolio.holdings['ggl']).toBe(10);
        });

        it('should return quantity * price and delete the stockId key entirely when selling the full held quantity', () => {
            portfolio.buy('ggl', 10, 150);

            const revenue = portfolio.sell('ggl', 10, 160);

            expect(revenue).toBe(1600);
            expect(portfolio.holdings).not.toHaveProperty('ggl');
        });

        it('should decrease holdings by exactly the sold quantity and keep the key for a partial sell', () => {
            portfolio.buy('ggl', 10, 150);

            const revenue = portfolio.sell('ggl', 4, 160);

            expect(revenue).toBe(640);
            expect(portfolio.holdings['ggl']).toBe(6);
            expect(portfolio.holdings).toHaveProperty('ggl');
        });
    });

    describe('getQuantity', () => {
        it('should return 0 for a stock that was never bought', () => {
            expect(portfolio.getQuantity('ggl')).toBe(0);
        });

        it('should return the held quantity for a bought stock', () => {
            portfolio.buy('ggl', 7, 150);

            expect(portfolio.getQuantity('ggl')).toBe(7);
        });
    });
});
