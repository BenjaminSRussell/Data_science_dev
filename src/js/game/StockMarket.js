/**
 * Stock Market System
 * Manages simulation of stock prices and player portfolio
 */

export class Stock {
    constructor(id, ticker, name, price, volatility, sector) {
        this.id = id;
        this.ticker = ticker;
        this.name = name;
        this.price = price;
        this.volatility = volatility; // 0.01 to 0.10 (daily variance)
        this.sector = sector;
        this.history = [price]; // Price history for charts
        this.initialPrice = price;
    }

    /**
     * Update price based on market sentiment and random noise
     * @param {number} marketTrend - Global market trend (-0.05 to 0.05)
     * @param {Object} newsEffect - Specific news effect on this stock/sector
     */
    update(marketTrend, newsEffect = 0) {
        // Random daily fluctuation based on volatility
        const noise = (Math.random() - 0.5) * 2 * this.volatility;

        // Calculate percentage change
        const changePct = marketTrend + noise + newsEffect;

        // Apply change
        this.price = this.price * (1 + changePct);

        // Ensure price doesn't go below minimum (penny stock)
        if (this.price < 0.01) this.price = 0.01;

        // Add to history (keep last 30 days)
        this.history.push(this.price);
        if (this.history.length > 30) {
            this.history.shift();
        }
    }
}

export class Portfolio {
    constructor() {
        this.holdings = {}; // stockId -> quantity
        this.totalInvested = 0;
        this.history = []; // Portfolio value history
    }

    buy(stockId, quantity, price) {
        if (!this.holdings[stockId]) this.holdings[stockId] = 0;
        this.holdings[stockId] += quantity;
        this.totalInvested += quantity * price;
    }

    sell(stockId, quantity, price) {
        if (!this.holdings[stockId] || this.holdings[stockId] < quantity) return 0;
        this.holdings[stockId] -= quantity;

        // Simplified cost basis logic: assume selling reduces invested amount proportionally?
        // Actually, profit is calculated at sell time.
        // For totalInvested tracking, it's tricky. Let's just track current value.

        if (this.holdings[stockId] === 0) delete this.holdings[stockId];
        return quantity * price;
    }

    getQuantity(stockId) {
        return this.holdings[stockId] || 0;
    }
}

export class StockMarket {
    constructor(gameState) {
        this.gameState = gameState;
        this.stocks = [];
        this.portfolio = new Portfolio();
        this.marketTrend = 0.0005; // Slightly positive drift on average
        this.initStocks();
    }

    initStocks() {
        // Define fictional companies
        const companies = [
            { id: 'ggl', ticker: 'GGL', name: 'Giggle Search', price: 150.00, vol: 0.02, sector: 'Tech' },
            { id: 'gfx', ticker: 'GFX', name: 'Graphics King', price: 450.00, vol: 0.04, sector: 'Hardware' },
            { id: 'elc', ticker: 'ELC', name: 'Electric Motors', price: 200.00, vol: 0.05, sector: 'Auto' },
            { id: 'jng', ticker: 'JNG', name: 'Jungle Store', price: 3000.00, vol: 0.02, sector: 'Retail' },
            { id: 'frt', ticker: 'FRT', name: 'Fruit Corp', price: 180.00, vol: 0.015, sector: 'Tech' },
            { id: 'mic', ticker: 'MIC', name: 'Macrohard', price: 350.00, vol: 0.015, sector: 'Tech' },
            { id: 'fbc', ticker: 'FBC', name: 'Facebook', price: 250.00, vol: 0.03, sector: 'Social' },
            { id: 'flx', ticker: 'FLX', name: 'Chill Stream', price: 400.00, vol: 0.04, sector: 'Media' },
            { id: 'rid', ticker: 'RID', name: 'Ride Share', price: 45.00, vol: 0.06, sector: 'Transport' },
            { id: 'hst', ticker: 'HST', name: 'Host Stay', price: 120.00, vol: 0.05, sector: 'Travel' },
            { id: 'bnk', ticker: 'BNK', name: 'Big Bank', price: 80.00, vol: 0.01, sector: 'Finance' },
            { id: 'bio', ticker: 'BIO', name: 'BioHealth', price: 60.00, vol: 0.08, sector: 'Health' }
        ];

        this.stocks = companies.map(c => new Stock(c.id, c.ticker, c.name, c.price, c.vol, c.sector));
    }

    /**
     * Advance market by one day
     * @param {Array} newsEvents - List of news events that might affect market
     */
    update(newsEvents = []) {
        // Determine global market trend change
        // Random walk for market trend
        this.marketTrend += (Math.random() - 0.5) * 0.002;
        // Mean reversion for trend to keep it sane
        this.marketTrend *= 0.95;

        // Process news effects
        let sectorEffects = {};

        newsEvents.forEach(news => {
            if (news.effects && news.effects.STOCK_MARKET) {
                // Global market effect
                this.marketTrend += news.effects.STOCK_MARKET;
            }
            if (news.effects && news.effects.SECTOR) {
                if (!sectorEffects[news.effects.SECTOR]) sectorEffects[news.effects.SECTOR] = 0;
                sectorEffects[news.effects.SECTOR] += news.effects.MAGNITUDE;
            }
        });

        // Update each stock
        this.stocks.forEach(stock => {
            let specificEffect = 0;
            if (sectorEffects[stock.sector]) {
                specificEffect += sectorEffects[stock.sector];
            }
            stock.update(this.marketTrend, specificEffect);
        });

        // Track portfolio value
        this.trackPortfolioPerformance();
    }

    trackPortfolioPerformance() {
        // Calculate current value
        let currentValue = 0;
        for (const [stockId, qty] of Object.entries(this.portfolio.holdings)) {
            const stock = this.getStock(stockId);
            if (stock) {
                currentValue += stock.price * qty;
            }
        }
        this.portfolio.history.push(currentValue);
        if (this.portfolio.history.length > 30) this.portfolio.history.shift();
    }

    /**
     * Manipulate a stock (Illegal)
     * @param {string} stockId 
     * @param {string} type - 'pump', 'insider_pump', 'crash'
     * @param {number} magnitude - multiplier
     */
    manipulateStock(stockId, type, magnitude) {
        const stock = this.stocks.find(s => s.id === stockId);
        if (!stock) return false;

        // Record the manipulation to apply in next update or now
        // For simplicity, apply immediate price shock

        let change = 0;
        if (type === 'pump' || type === 'insider_pump') {
            change = (magnitude - 1); // e.g. 1.5 -> +0.5 (50%)
        } else if (type === 'crash') {
            change = -(1 - magnitude);
        }

        // Apply change
        const oldPrice = stock.price;
        stock.price = stock.price * magnitude;
        stock.history.push(stock.price);

        // Add volatility
        stock.volatility += 0.2; // Becomes unstable

        console.log(`🕵️ Stock ${stock.ticker} manipulated! ${oldPrice.toFixed(2)} -> ${stock.price.toFixed(2)}`);
        return true;
    }

    buyStock(stockId, quantity) {
        // Legal Check: Needs Series 7 for large trades or specific types?
        // Let's enforce it for ALL trades to force the license purchase
        if (!this.gameState.legalSystem.hasLicense('series_7') && !this.gameState.legalSystem.hasLicense('series_63')) {
            // Check if player has low ethics, maybe they can trade illegally?
            if (this.gameState.characterStats.ethics > -20) {
                return { success: false, reason: "You need a Series 7 License to trade stocks legally." };
            }
            // If unethical, they can trade but risk huge fines (handled by CrimeSystem later)
        }

        const stock = this.getStock(stockId);
        if (!stock) return { success: false, reason: 'Stock not found' };

        const totalCost = stock.price * quantity;
        if (this.gameState.money < totalCost) return { success: false, reason: 'Not enough money' };

        this.gameState.money -= totalCost;
        this.portfolio.buy(stockId, quantity, stock.price);

        return { success: true, message: `Bought ${quantity} shares of ${stockId}`, cost: totalCost, stock: stock };
    }

    sellStock(stockId, quantity) {
        // Selling also requires license ideally
        if (!this.gameState.legalSystem.hasLicense('series_7') && this.gameState.characterStats.ethics > -20) {
            return { success: false, reason: "You need a Series 7 License to trade." };
        }

        const stock = this.getStock(stockId);
        if (!stock) return { success: false, reason: "Stock not found" };

        const currentQty = this.portfolio.getQuantity(stockId);
        if (currentQty < quantity) {
            return { success: false, reason: "Not enough shares" };
        }

        const revenue = this.portfolio.sell(stockId, quantity, stock.price);
        this.gameState.money += revenue;
        return { success: true, revenue: revenue, stock: stock };
    }

    getStock(stockId) {
        return this.stocks.find(s => s.id === stockId);
    }

    getPortfolioValue() {
        let value = 0;
        for (const [stockId, qty] of Object.entries(this.portfolio.holdings)) {
            const stock = this.getStock(stockId);
            if (stock) value += stock.price * qty;
        }
        return value;
    }

    /**
     * Serialize state for saving
     */
    toJSON() {
        return {
            marketTrend: this.marketTrend,
            stocks: this.stocks.map(stock => ({
                id: stock.id,
                price: stock.price,
                history: stock.history,
                volatility: stock.volatility
            })),
            portfolio: {
                holdings: this.portfolio.holdings,
                totalInvested: this.portfolio.totalInvested,
                history: this.portfolio.history
            }
        };
    }

    fromJSON(data) {
        if (!data) return;


        this.marketTrend = data.marketTrend || 0;

        // Restore stocks
        if (data.stocks) {
            data.stocks.forEach(sData => {
                const stock = this.stocks.find(s => s.id === sData.id);
                if (stock) {
                    stock.price = sData.price;
                    stock.history = sData.history || [];
                    stock.volatility = sData.volatility;
                }
            });
        }

        // Restore portfolio
        if (data.portfolio) {
            this.portfolio.holdings = data.portfolio.holdings || {};
            this.portfolio.totalInvested = data.portfolio.totalInvested || 0;
            this.portfolio.history = data.portfolio.history || [];
        }
    }
}
