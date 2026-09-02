/**
 * InvestmentEcommerceSystem - Handles investment and ecommerce aspects of the game
 */

export class InvestmentEcommerceSystem {
    constructor(gameState) {
        this.gameState = gameState;

        // Default portfolio state if not exists
        if (!this.gameState.portfolio) {
            this.gameState.portfolio = {
                stocks: {},
                initialInvestment: 0,
                currentValue: 0,
                totalProfit: 0
            };
        }
    }

    /**
     * Buy stock
     */
    buyStock(stockId, shares, price) {
        if (this.gameState.money < shares * price) {
            return { success: false, message: "Not enough money." };
        }

        this.gameState.money -= shares * price;

        if (this.gameState.portfolio.stocks[stockId]) {
            const currentStock = this.gameState.portfolio.stocks[stockId];
            const totalValue = currentStock.shares * currentStock.avgPrice + shares * price;
            const totalShares = currentStock.shares + shares;
            currentStock.avgPrice = totalValue / totalShares;
            currentStock.shares = totalShares;
        } else {
            this.gameState.portfolio.stocks[stockId] = {
                avgPrice: price,
                shares: shares
            };
        }

        this.updatePortfolioValue();

        return { success: true, message: `Bought ${shares} shares of ${stockId} at $${price} each.` };
    }

    /**
     * Sell stock
     */
    sellStock(stockId, shares) {
        const stock = this.gameState.portfolio.stocks[stockId];

        if (!stock || stock.shares < shares) {
            return { success: false, message: "Not enough shares." };
        }

        const revenue = shares * this.gameState.stockMarket[stockId];
        const cost = shares * stock.avgPrice;
        const profit = revenue - cost;

        this.gameState.money += revenue;
        stock.shares -= shares;

        if (stock.shares === 0) {
            delete this.gameState.portfolio.stocks[stockId];
        }

        this.updatePortfolioValue();

        return {
            success: true,
            message: profit >= 0 ? `Sold ${shares} shares of ${stockId} for a profit of $${profit}.` : `Sold ${shares} shares of ${stockId} for a loss of $${Math.abs(profit)}.`
        };
    }

    /**
     * Update portfolio value
     */
    updatePortfolioValue() {
        let totalValue = 0;

        for (const stockId in this.gameState.portfolio.stocks) {
            const stock = this.gameState.portfolio.stocks[stockId];
            if (this.gameState.stockMarket[stockId] !== undefined) {
                totalValue += stock.shares * this.gameState.stockMarket[stockId];
            }
        }

        this.gameState.portfolio.currentValue = totalValue;
        this.gameState.portfolio.totalProfit = this.gameState.portfolio.currentValue - this.gameState.portfolio.initialInvestment;
    }

    /**
     * Get portfolio summary
     */
    getPortfolioSummary() {
        const summary = {
            stocks: this.gameState.portfolio.stocks,
            currentValue: this.gameState.portfolio.currentValue,
            initialInvestment: this.gameState.portfolio.initialInvestment,
            totalProfit: this.gameState.portfolio.totalProfit,
            profitPercent: this.gameState.portfolio.initialInvestment === 0 ? 0 : (this.gameState.portfolio.totalProfit / this.gameState.portfolio.initialInvestment) * 100
        };

        return summary;
    }
}