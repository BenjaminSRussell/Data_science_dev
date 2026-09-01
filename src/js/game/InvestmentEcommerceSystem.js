/**
 * InvestmentEcommerceSystem - Handles stock market investments
 */

export class InvestmentEcommerceSystem {
    constructor(gameState) {
        this.gameState = gameState;

        // Default investment state if not exists
        if (!this.gameState.investment) {
            this.gameState.investment = {
                portfolio: {
                    initialInvestment: 0,
                    totalValue: 0,
                    stocks: []
                }
            };
        }
    }

    /**
     * Buy a stock
     */
    buyStock(stockId, shares) {
        const stock = this.gameState.stocks.find(s => s.id === stockId);
        if (!stock || shares <= 0) return { success: false, message: "Invalid stock or shares" };

        const cost = stock.price * shares;
        if (this.gameState.money < cost) return { success: false, message: "Insufficient funds" };

        this.gameState.money -= cost;
        this.gameState.investment.portfolio.initialInvestment += cost;
        this.gameState.investment.portfolio.totalValue += cost;

        // Add or update stock in portfolio
        const existingStock = this.gameState.investment.portfolio.stocks.find(s => s.id === stockId);
        if (existingStock) {
            existingStock.shares += shares;
            existingStock.totalValue += cost;
        } else {
            this.gameState.investment.portfolio.stocks.push({
                id: stock.id,
                name: stock.name,
                price: stock.price,
                shares,
                totalValue: cost
            });
        }

        return { success: true, message: `Bought ${shares} shares of ${stock.name}` };
    }

    /**
     * Sell a stock
     */
    sellStock(stockId, shares) {
        const stock = this.gameState.stocks.find(s => s.id === stockId);
        const portfolioStock = this.gameState.investment.portfolio.stocks.find(s => s.id === stockId);

        if (!stock || !portfolioStock || shares <= 0) return { success: false, message: "Invalid stock or shares" };
        if (portfolioStock.shares < shares) return { success: false, message: "Insufficient shares" };

        const revenue = stock.price * shares;
        this.gameState.money += revenue;
        portfolioStock.shares -= shares;
        portfolioStock.totalValue -= revenue;
        this.gameState.investment.portfolio.totalValue -= revenue;

        // Adjust initial investment based on cost-basis
        const costBasis = portfolioStock.totalValue / portfolioStock.shares;
        const originalValue = costBasis * shares;
        this.gameState.investment.portfolio.initialInvestment -= originalValue;

        // Remove stock from portfolio if no shares left
        if (portfolioStock.shares === 0) {
            this.gameState.investment.portfolio.stocks = this.gameState.investment.portfolio.stocks.filter(s => s.id !== stockId);
        }

        return { success: true, message: `Sold ${shares} shares of ${stock.name}` };
    }

    /**
     * Get portfolio summary
     */
    getPortfolioSummary() {
        const portfolio = this.gameState.investment.portfolio;
        const totalValue = portfolio.stocks.reduce((sum, stock) => sum + stock.totalValue, 0);
        const profit = totalValue - portfolio.initialInvestment;
        const profitPercent = portfolio.initialInvestment > 0 ? (profit / portfolio.initialInvestment) * 100 : 0;

        return {
            totalValue,
            initialInvestment: portfolio.initialInvestment,
            profit,
            profitPercent
        };
    }
}