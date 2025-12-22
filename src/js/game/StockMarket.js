/**
 * Stock Market System
 * Manages simulation of stock prices and player portfolio
 * Enhanced with multiple markets, correlations, and world events
 */

export class Stock {
    constructor(id, ticker, name, price, volatility, sector, market = 'US', correlation = {}) {
        this.id = id;
        this.ticker = ticker;
        this.name = name;
        this.price = price;
        this.volatility = volatility; // 0.01 to 0.10 (daily variance)
        this.sector = sector;
        this.market = market; // 'US', 'EU', 'ASIA', etc.
        this.correlation = correlation; // Correlations with other stocks/markets
        this.history = [price]; // Price history for charts
        this.initialPrice = price;
        this.lastChange = 0;
        this.lastChangePct = 0;
        this.volume = 0; // Trading volume
    }

    /**
     * Update price based on market sentiment, correlations, and world events
     * @param {Object} marketTrends - Market trends by region {US: 0.001, EU: 0.0005, ...}
     * @param {Object} sectorEffects - Sector-specific effects
     * @param {Object} worldEvents - Active world events affecting markets
     * @param {Array} relatedStocks - Other stocks for correlation calculations
     */
    update(marketTrends, sectorEffects = {}, worldEvents = [], relatedStocks = []) {
        const oldPrice = this.price;
        
        // Base market trend for this stock's market
        let baseTrend = marketTrends[this.market] || marketTrends['US'] || 0;
        
        // Sector effect
        const sectorEffect = sectorEffects[this.sector] || 0;
        
        // Correlation effects - stocks in same sector or correlated markets influence each other
        let correlationEffect = 0;
        relatedStocks.forEach(otherStock => {
            if (otherStock.id === this.id) return;
            
            // Same sector correlation (0.3-0.6)
            if (otherStock.sector === this.sector) {
                const correlation = this.correlation[otherStock.id] || 0.4;
                const otherChange = otherStock.lastChangePct || 0;
                correlationEffect += otherChange * correlation * 0.3;
            }
            
            // Same market correlation (0.2-0.4)
            if (otherStock.market === this.market) {
                const marketCorrelation = 0.25;
                const otherChange = otherStock.lastChangePct || 0;
                correlationEffect += otherChange * marketCorrelation * 0.2;
            }
        });
        
        // World event impacts (can cause large swings)
        let worldEventEffect = 0;
        worldEvents.forEach(event => {
            if (event.affectsMarket && event.affectsMarket.includes(this.market)) {
                worldEventEffect += event.marketImpact || 0;
            }
            if (event.affectsSector && event.affectsSector.includes(this.sector)) {
                worldEventEffect += event.sectorImpact || 0;
            }
            if (event.affectsStock && event.affectsStock.includes(this.id)) {
                worldEventEffect += event.stockImpact || 0;
            }
        });
        
        // Random daily fluctuation based on volatility
        const noise = (Math.random() - 0.5) * 2 * this.volatility;
        
        // Calculate total percentage change
        const changePct = baseTrend + sectorEffect + correlationEffect + worldEventEffect + noise;
        
        // Apply change
        this.price = this.price * (1 + changePct);
        
        // Ensure price doesn't go below minimum (penny stock)
        if (this.price < 0.01) this.price = 0.01;
        
        // Track change
        this.lastChange = this.price - oldPrice;
        this.lastChangePct = changePct;
        
        // Simulate trading volume (higher on big moves)
        this.volume = Math.abs(changePct) * 1000000 + Math.random() * 500000;
        
        // Add to history (keep last 100 days for better charts)
        this.history.push(this.price);
        if (this.history.length > 100) {
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
        
        // Market trends by region (can be positive or negative)
        this.marketTrends = {
            US: 0.0005,
            EU: 0.0003,
            ASIA: 0.0004,
            EMERGING: 0.0008 // Higher volatility
        };
        
        // Market indices (like Dow, NASDAQ, etc.)
        this.indices = {
            DOW: { value: 35000, name: 'Dow Jones', market: 'US' },
            NASDAQ: { value: 14000, name: 'NASDAQ', market: 'US' },
            S_P_500: { value: 4500, name: 'S&P 500', market: 'US' },
            FTSE: { value: 7500, name: 'FTSE 100', market: 'EU' },
            NIKKEI: { value: 28000, name: 'Nikkei 225', market: 'ASIA' },
            HANG_SENG: { value: 18000, name: 'Hang Seng', market: 'ASIA' }
        };
        
        // Active world events affecting markets
        this.activeWorldEvents = [];
        
        this.initStocks();
        this.updateIndices(); // Initialize index values
    }

    initStocks() {
        // Define fictional companies across multiple markets
        const companies = [
            // US Market
            { id: 'ggl', ticker: 'GGL', name: 'Giggle Search', price: 150.00, vol: 0.02, sector: 'Tech', market: 'US' },
            { id: 'gfx', ticker: 'GFX', name: 'Graphics King', price: 450.00, vol: 0.04, sector: 'Hardware', market: 'US' },
            { id: 'elc', ticker: 'ELC', name: 'Electric Motors', price: 200.00, vol: 0.05, sector: 'Auto', market: 'US' },
            { id: 'jng', ticker: 'JNG', name: 'Jungle Store', price: 3000.00, vol: 0.02, sector: 'Retail', market: 'US' },
            { id: 'frt', ticker: 'FRT', name: 'Fruit Corp', price: 180.00, vol: 0.015, sector: 'Tech', market: 'US' },
            { id: 'mic', ticker: 'MIC', name: 'Macrohard', price: 350.00, vol: 0.015, sector: 'Tech', market: 'US' },
            { id: 'fbc', ticker: 'FBC', name: 'Facebook', price: 250.00, vol: 0.03, sector: 'Social', market: 'US' },
            { id: 'flx', ticker: 'FLX', name: 'Chill Stream', price: 400.00, vol: 0.04, sector: 'Media', market: 'US' },
            { id: 'rid', ticker: 'RID', name: 'Ride Share', price: 45.00, vol: 0.06, sector: 'Transport', market: 'US' },
            { id: 'hst', ticker: 'HST', name: 'Host Stay', price: 120.00, vol: 0.05, sector: 'Travel', market: 'US' },
            { id: 'bnk', ticker: 'BNK', name: 'Big Bank', price: 80.00, vol: 0.01, sector: 'Finance', market: 'US' },
            { id: 'bio', ticker: 'BIO', name: 'BioHealth', price: 60.00, vol: 0.08, sector: 'Health', market: 'US' },
            
            // European Market
            { id: 'sap', ticker: 'SAP', name: 'SAP Systems', price: 120.00, vol: 0.025, sector: 'Tech', market: 'EU' },
            { id: 'vol', ticker: 'VOL', name: 'Volkswagen AG', price: 180.00, vol: 0.04, sector: 'Auto', market: 'EU' },
            { id: 'hsbc', ticker: 'HSBC', name: 'HSBC Bank', price: 45.00, vol: 0.015, sector: 'Finance', market: 'EU' },
            { id: 'lvmh', ticker: 'LVMH', name: 'LVMH Luxury', price: 650.00, vol: 0.02, sector: 'Retail', market: 'EU' },
            
            // Asian Market
            { id: 'ali', ticker: 'ALI', name: 'Alibaba Group', price: 95.00, vol: 0.035, sector: 'Tech', market: 'ASIA' },
            { id: 'ten', ticker: 'TEN', name: 'Tencent Holdings', price: 55.00, vol: 0.04, sector: 'Tech', market: 'ASIA' },
            { id: 'toy', ticker: 'TOY', name: 'Toyota Motors', price: 180.00, vol: 0.03, sector: 'Auto', market: 'ASIA' },
            { id: 'sam', ticker: 'SAM', name: 'Samsung Electronics', price: 1200.00, vol: 0.025, sector: 'Hardware', market: 'ASIA' },
            
            // Emerging Markets
            { id: 'pet', ticker: 'PET', name: 'Petrobras', price: 12.00, vol: 0.08, sector: 'Energy', market: 'EMERGING' },
            { id: 'vale', ticker: 'VALE', name: 'Vale Mining', price: 15.00, vol: 0.07, sector: 'Materials', market: 'EMERGING' }
        ];

        // Create stocks with correlations
        this.stocks = companies.map(c => {
            const correlations = {};
            // Add correlations with similar stocks
            companies.forEach(other => {
                if (other.id !== c.id) {
                    if (other.sector === c.sector) {
                        correlations[other.id] = 0.4 + Math.random() * 0.2; // 0.4-0.6
                    } else if (other.market === c.market) {
                        correlations[other.id] = 0.2 + Math.random() * 0.2; // 0.2-0.4
                    }
                }
            });
            return new Stock(c.id, c.ticker, c.name, c.price, c.vol, c.sector, c.market, correlations);
        });
    }
    
    /**
     * Update market indices based on stock performance
     */
    updateIndices() {
        // Calculate index values based on market performance
        const marketPerformance = {};
        Object.keys(this.marketTrends).forEach(market => {
            const marketStocks = this.stocks?.filter(s => s.market === market) || [];
            if (marketStocks.length > 0) {
                const avgChange = marketStocks.reduce((sum, s) => sum + (s.lastChangePct || 0), 0) / marketStocks.length;
                marketPerformance[market] = avgChange;
            }
        });
        
        // Update each index
        Object.keys(this.indices).forEach(indexKey => {
            const index = this.indices[indexKey];
            const performance = marketPerformance[index.market] || 0;
            index.value = index.value * (1 + performance * 0.8); // Indices move slightly less than individual stocks
            if (!index.history) index.history = [index.value];
            index.history.push(index.value);
            if (index.history.length > 100) index.history.shift();
        });
    }

    /**
     * Advance market by one day
     * @param {Array} newsEvents - List of news events that might affect market
     * @param {Array} worldEvents - List of world events affecting markets globally
     */
    update(newsEvents = [], worldEvents = []) {
        // Update active world events
        this.activeWorldEvents = worldEvents.filter(e => e.active);
        
        // Update market trends for each region (random walk with mean reversion)
        Object.keys(this.marketTrends).forEach(market => {
            // Random walk
            this.marketTrends[market] += (Math.random() - 0.5) * 0.002;
            // Mean reversion
            this.marketTrends[market] *= 0.95;
            
            // Cross-market influence (markets affect each other)
            Object.keys(this.marketTrends).forEach(otherMarket => {
                if (otherMarket !== market) {
                    const influence = 0.1; // 10% influence from other markets
                    this.marketTrends[market] += this.marketTrends[otherMarket] * influence * 0.1;
                }
            });
        });
        
        // Process news effects on sectors
        let sectorEffects = {};
        newsEvents.forEach(news => {
            if (news.effects && news.effects.SECTOR) {
                if (!sectorEffects[news.effects.SECTOR]) sectorEffects[news.effects.SECTOR] = 0;
                sectorEffects[news.effects.SECTOR] += news.effects.MAGNITUDE || 0;
            }
            if (news.effects && news.effects.MARKET) {
                // Market-specific news
                const market = news.effects.MARKET;
                if (this.marketTrends[market] !== undefined) {
                    this.marketTrends[market] += news.effects.MAGNITUDE || 0;
                }
            }
        });
        
        // Process world events (can cause large market movements)
        worldEvents.forEach(event => {
            if (event.type === 'market_crash') {
                // Global crash affects all markets
                Object.keys(this.marketTrends).forEach(market => {
                    this.marketTrends[market] -= 0.05; // -5% daily during crash
                });
            } else if (event.type === 'tech_boom') {
                // Tech boom affects tech-heavy markets
                this.marketTrends['US'] += 0.02;
                this.marketTrends['ASIA'] += 0.015;
                sectorEffects['Tech'] = (sectorEffects['Tech'] || 0) + 0.03;
            } else if (event.type === 'trade_war') {
                // Trade war affects international markets
                this.marketTrends['ASIA'] -= 0.03;
                this.marketTrends['EU'] -= 0.02;
                this.marketTrends['EMERGING'] -= 0.04;
            } else if (event.type === 'economic_crisis') {
                // Economic crisis affects all markets
                Object.keys(this.marketTrends).forEach(market => {
                    this.marketTrends[market] -= 0.03;
                });
            } else if (event.type === 'innovation_breakthrough') {
                // Innovation benefits tech and hardware
                sectorEffects['Tech'] = (sectorEffects['Tech'] || 0) + 0.04;
                sectorEffects['Hardware'] = (sectorEffects['Hardware'] || 0) + 0.03;
            }
        });
        
        // Update each stock with correlations
        this.stocks?.forEach(stock => {
            stock.update(this.marketTrends, sectorEffects, this.activeWorldEvents, this.stocks);
        });
        
        // Update market indices
        this.updateIndices();
        
        // Track portfolio value
        this.trackPortfolioPerformance();
    }
    
    /**
     * Get market summary for a specific region
     */
    getMarketSummary(market) {
        const marketStocks = this.stocks?.filter(s => s.market === market) || [];
        if (marketStocks.length === 0) return null;
        
        const totalChange = marketStocks.reduce((sum, s) => sum + (s.lastChangePct || 0), 0);
        const avgChange = totalChange / marketStocks.length;
        const gainers = marketStocks.filter(s => s.lastChangePct > 0).length;
        const losers = marketStocks.filter(s => s.lastChangePct < 0).length;
        
        return {
            market,
            trend: this.marketTrends[market],
            avgChange,
            gainers,
            losers,
            totalStocks: marketStocks.length
        };
    }
    
    /**
     * Get all market summaries
     */
    getAllMarketSummaries() {
        return Object.keys(this.marketTrends || {}).map(market => this.getMarketSummary(market));
    }
    
    /**
     * Get recent price changes for ticker display
     */
    getRecentChanges(limit = 20) {
        return this.stocks
            .map(stock => ({
                ticker: stock.ticker,
                name: stock.name,
                price: stock.price,
                change: stock.lastChange,
                changePct: stock.lastChangePct,
                market: stock.market,
                volume: stock.volume
            }))
            .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
            .slice(0, limit);
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

        // Add volatility
        stock.volatility += 0.2; // Becomes unstable

        console.log(` Stock ${stock.ticker} manipulated! ${oldPrice.toFixed(2)} -> ${stock.price.toFixed(2)}`);
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
