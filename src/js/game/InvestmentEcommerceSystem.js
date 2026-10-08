/**
 * InvestmentEcommerceSystem.js
 * Stock market investment and e-commerce business systems
 */

import { pickState, applyState } from '../utils/StateSerializer.js';

const isAmount = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const DEFAULT_PRODUCT_COST = 100;

export class InvestmentEcommerceSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.portfolio = {
            stocks: {},
            totalValue: 0,
            initialInvestment: 0
        };
        this.ecommerceBusiness = null;
    }

    /**
     * Buy stock
     */
    buyStock(stockId, shares, price) {
        const cost = shares * price;
        if (this.gameState.money < cost) {
            return { success: false, message: "Not enough money." };
        }

        this.gameState.money -= cost;
        
        if (!this.portfolio.stocks[stockId]) {
            this.portfolio.stocks[stockId] = { shares: 0, avgPrice: 0 };
        }

        const stock = this.portfolio.stocks[stockId];
        const totalShares = stock.shares + shares;
        const totalCost = (stock.avgPrice * stock.shares) + cost;
        stock.avgPrice = totalCost / totalShares;
        stock.shares = totalShares;

        this.portfolio.initialInvestment += cost;
        this.updatePortfolioValue();

        return {
            success: true,
            message: `Bought ${shares} shares of ${stockId} for $${cost.toLocaleString()}`,
            portfolio: { ...this.portfolio }
        };
    }

    /**
     * Sell stock
     */
    sellStock(stockId, shares, currentPrice) {
        const stock = this.portfolio.stocks[stockId];
        if (!stock || stock.shares < shares) {
            return { success: false, message: "Not enough shares." };
        }

        const revenue = shares * currentPrice;
        const costBasis = shares * stock.avgPrice;
        const profit = revenue - costBasis;

        this.gameState.money += revenue;
        stock.shares -= shares;
        // Keep initialInvestment aligned with remaining cost basis (#15).
        this.portfolio.initialInvestment = Math.max(
            0,
            (this.portfolio.initialInvestment || 0) - costBasis,
        );

        if (stock.shares === 0) {
            delete this.portfolio.stocks[stockId];
        }

        this.updatePortfolioValue();

        return {
            success: true,
            message: `Sold ${shares} shares of ${stockId} for $${revenue.toLocaleString()}. ${profit >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(profit).toLocaleString()}`,
            profit,
            portfolio: { ...this.portfolio }
        };
    }

    /**
     * Update portfolio value
     */
    updatePortfolioValue() {
        let total = 0;
        const stockMarket = this.gameState.stockMarket;

        for (const [stockId, holding] of Object.entries(this.portfolio.stocks)) {
            if (stockMarket) {
                const stock = stockMarket.getStock(stockId);
                if (stock) {
                    total += holding.shares * stock.price;
                }
            }
        }

        this.portfolio.totalValue = total;
    }

    /**
     * Start e-commerce business
     */
    startEcommerceBusiness(name, initialInvestment) {
        // A negative/NaN investment used to pay the player (#1003)
        if (!isAmount(initialInvestment)) {
            return { success: false, message: "Investment must be a non-negative amount." };
        }
        if (this.gameState.money < initialInvestment) {
            return { success: false, message: "Not enough money to start business." };
        }

        if (this.ecommerceBusiness) {
            return { success: false, message: "You already have an e-commerce business." };
        }

        this.gameState.money -= initialInvestment;

        this.ecommerceBusiness = {
            name,
            level: 1,
            products: [],
            revenue: 0,
            expenses: 0,
            customers: 0,
            reputation: 0,
            inventory: {},
            marketingBudget: 0,
            startedWeek: this.gameState.timeManager?.totalDays ? Math.floor(this.gameState.timeManager.totalDays / 7) : 0
        };

        return {
            success: true,
            message: `Started ${name}! Time to build your empire.`,
            business: { ...this.ecommerceBusiness }
        };
    }

    /**
     * Add product to e-commerce store
     */
    addProduct(product) {
        if (!this.ecommerceBusiness) {
            return { success: false, message: "You don't have an e-commerce business." };
        }

        // Reject products that would poison revenue with NaN (#1004)
        const id = product?.id;
        if (id === undefined || id === null || id === '' || !isAmount(product?.price)) {
            return { success: false, message: "A product needs an id and a non-negative price." };
        }
        // Re-adding an id used to reset its stock and double its sales (#1981)
        if (this.ecommerceBusiness.products.some(p => p.id === id)) {
            return { success: false, message: `${product.name || id} is already in your store.` };
        }

        // A free product (cost: 0) is free, not "unset" (#1358)
        const cost = product.cost === undefined || product.cost === null ? DEFAULT_PRODUCT_COST : product.cost;
        if (!isAmount(cost)) {
            return { success: false, message: "Product cost must be a non-negative amount." };
        }
        if (this.gameState.money < cost) {
            return { success: false, message: "Not enough money to add product." };
        }

        this.gameState.money -= cost;
        this.ecommerceBusiness.products.push(product);
        this.ecommerceBusiness.inventory[id] = isAmount(product.stock) ? Math.floor(product.stock) : 0;

        return {
            success: true,
            message: `Added ${product.name} to your store.`,
            business: { ...this.ecommerceBusiness }
        };
    }

    /**
     * Process weekly e-commerce operations
     */
    processWeeklyOperations() {
        if (!this.ecommerceBusiness) return null;

        const business = this.ecommerceBusiness;
        const marketingEffect = Math.min(2.0, 1 + (business.marketingBudget / 1000));
        const reputationEffect = 1 + (business.reputation / 100);
        
        // Calculate sales
        const baseSales = business.products.length * 10;
        const sales = Math.floor(baseSales * marketingEffect * reputationEffect);
        
        // Calculate revenue from units actually shipped
        let revenue = 0;
        let unitsSold = 0;
        const demandPerProduct = business.products.length ? Math.floor(sales / business.products.length) : 0;
        business.products.forEach(product => {
            const sold = Math.min(demandPerProduct, business.inventory[product.id] || 0);
            revenue += sold * product.price;
            unitsSold += sold;
            business.inventory[product.id] = (business.inventory[product.id] || 0) - sold;
        });

        // Marketing was paid up front in investInMarketing(); only operating
        // costs recur (#1005). The campaign's effect fades 25% a week.
        const expenses = business.products.length * 50; // Base operating costs
        business.marketingBudget = Math.floor(business.marketingBudget * 0.75);

        // Customers and reputation come from orders filled, not demand (#1356)
        business.revenue += revenue;
        business.expenses += expenses;
        business.customers += unitsSold;
        business.reputation = Math.min(100, business.reputation + Math.floor(unitsSold / 10));

        // Profit
        const profit = revenue - expenses;
        this.gameState.money += profit;

        return {
            revenue,
            expenses,
            profit,
            sales,
            unitsSold,
            business: { ...business }
        };
    }

    /**
     * Invest in marketing
     */
    investInMarketing(amount) {
        if (!this.ecommerceBusiness) {
            return { success: false, message: "You don't have an e-commerce business." };
        }

        // Negative spend used to pay the player (#1357)
        if (!isAmount(amount) || amount === 0) {
            return { success: false, message: "Marketing spend must be a positive amount." };
        }
        if (this.gameState.money < amount) {
            return { success: false, message: "Not enough money." };
        }

        this.gameState.money -= amount;
        this.ecommerceBusiness.marketingBudget += amount;

        return {
            success: true,
            message: `Invested $${amount} in marketing.`,
            business: { ...this.ecommerceBusiness }
        };
    }

    /**
     * Get portfolio summary
     */
    getPortfolioSummary() {
        this.updatePortfolioValue();
        const profit = this.portfolio.totalValue - this.portfolio.initialInvestment;
        const profitPercent = this.portfolio.initialInvestment > 0 
            ? (profit / this.portfolio.initialInvestment) * 100 
            : 0;

        return {
            ...this.portfolio,
            profit,
            // A number like profitMargin, rounded to 2 places (#1982)
            profitPercent: Math.round(profitPercent * 100) / 100
        };
    }

    /**
     * Get e-commerce business status
     */
    getEcommerceStatus() {
        if (!this.ecommerceBusiness) return null;

        const netProfit = this.ecommerceBusiness.revenue - this.ecommerceBusiness.expenses;
        return {
            ...this.ecommerceBusiness,
            netProfit,
            profitMargin: this.ecommerceBusiness.revenue > 0 
                ? (netProfit / this.ecommerceBusiness.revenue) * 100 
                : 0
        };
    }

    /**
     * Serialize player-visible state for saving
     */
    toJSON() {
        return pickState(this, ['portfolio', 'ecommerceBusiness']);
    }

    /**
     * Restore state from a save (missing fields keep constructor defaults)
     */
    fromJSON(data) {
        if (!data) return;
        applyState(this, data, ['portfolio', 'ecommerceBusiness']);
    }
}
