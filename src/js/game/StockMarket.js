import WorldEvent from './WorldEvent';
import Portfolio from './Portfolio';

class StockMarket {
    constructor(gameState) {
        this.gameState = gameState;
        this.stocks = [];
        this.indices = {};
        this.activeWorldEvents = [];
        this.marketTrends = {
            'North America': 'Bullish',
            'Europe': 'Bullish',
            'Asia': 'Bullish',
            'Latin America': 'Bullish',
            'Africa': 'Bullish',
            'Australia': 'Bullish'
        };
        this.portfolio = new Portfolio();
    }

    initializeStocks(stocksData) {
        this.stocks = stocksData.map(data => ({
            id: data.id,
            ticker: data.ticker,
            name: data.name,
            price: data.price,
            volatility: data.volatility,
            market: data.market,
            volume: data.volume,
            history: [data.price],
            lastChange: 0,
            lastChangePct: 0
        }));
    }

    initializeIndices(indicesData) {
        this.indices = indicesData.reduce((acc, index) => {
            acc[index.name] = {
                value: index.value,
                history: [index.value]
            };
            return acc;
        }, {});
    }

    update() {
        const now = new Date().getTime();

        // Apply world events to market
        this.activeWorldEvents = this.activeWorldEvents.filter(event => {
            event.update(now);
            if (event.isActive()) {
                event.apply(this.stocks, this.indices);
            }
            return event.isActive();
        });

        // Update stock prices
        this.stocks.forEach(stock => {
            stock.price = this.calculateNewPrice(stock);
            stock.history.push(stock.price);
            stock.lastChange = stock.price - stock.history[stock.history.length - 2];
            stock.lastChangePct = (stock.lastChange / stock.history[stock.history.length - 2]) * 100;
            stock.volatility = Math.min(stock.volatility + 0.1, 2); // Limit volatility to a maximum of 2
        });

        // Update market indices
        this.updateIndices();

        // Track portfolio value
        this.trackPortfolioPerformance();
    }

    calculateNewPrice(stock) {
        const baseChange = (Math.random() - 0.5) * 2 * stock.volatility; // Random change within -volatility to +volatility
        const change = baseChange + (stock.lastChange * 0.1); // Add some momentum based on last change
        return stock.price + (stock.price * change / 100);
    }

    updateIndices() {
        Object.keys(this.indices).forEach(key => {
            const index = this.indices[key];
            const constituentValues = this.stocks
                .filter(stock => stock.market === key)
                .map(stock => stock.price);
            const newValue = constituentValues.reduce((sum, value) => sum + value, 0) / constituentValues.length;
            index.value = newValue;
            index.history.push(newValue);
        });
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

    manipulateStock(stockId, type, magnitude) {
        const stock = this.stocks?.find(s => s.id === stockId);
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
        stock.lastChange = stock.price - oldPrice;
        stock.lastChangePct = (stock.lastChange / oldPrice) * 100;

        // Add volatility
        stock.volatility += 0.2; // Becomes unstable

        return true;
    }

    buyStock(stockId, quantity) {
        // Legal Check: Needs Series 7 for large trades or specific types?
        // Let's enforce it for ALL trades to force the license purchase
        if (!this.gameState.legalSystem?.hasLicense('series_7') && !this.gameState.legalSystem?.hasLicense('series_63')) {
            // Check if player has low ethics, maybe they can trade illegally?
            if (this.gameState.characterStats?.ethics > -20) {
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
        if (!this.gameState.legalSystem?.hasLicense('series_7') && this.gameState.characterStats?.ethics > -20) {
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
        return this.stocks?.find(s => s.id === stockId);
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
            marketTrends: this.marketTrends,
            indices: this.indices,
            activeWorldEvents: this.activeWorldEvents,
            stocks: this.stocks?.map(stock => ({
                id: stock.id,
                price: stock.price,
                history: stock.history,
                volatility: stock.volatility,
                lastChange: stock.lastChange,
                lastChangePct: stock.lastChangePct
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

        // Restore market trends
        if (data.marketTrends) {
            this.marketTrends = { ...this.marketTrends, ...data.marketTrends };
        }

        // Restore indices
        if (data.indices) {
            Object.keys(data.indices).forEach(key => {
                if (this.indices[key]) {
                    this.indices[key].value = data.indices[key].value || this.indices[key].value;
                    this.indices[key].history = data.indices[key].history || [];
                }
            });
        }

        // Restore active world events
        if (data.activeWorldEvents) {
            this.activeWorldEvents = data.activeWorldEvents;
        }

        // Restore stocks
        if (data.stocks) {
            data.stocks.forEach(sData => {
                const stock = this.stocks?.find(s => s.id === sData.id);
                if (stock) {
                    stock.price = sData.price;
                    stock.history = sData.history || [];
                    stock.volatility = sData.volatility;
                    stock.lastChange = sData.lastChange || 0;
                    stock.lastChangePct = sData.lastChangePct || 0;
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

export default StockMarket;