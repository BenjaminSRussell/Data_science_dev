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
    update(marketTrends, sectorEffects = {}, worldEvents = [], relatedStocks = [], volatilityMultiplier = 1) {
        const oldPrice = this.price;

        // Base market trend for this stock's market
        let baseTrend = marketTrends[this.market] || marketTrends['US'] || 0;

        // Sector effect
        const sectorEffect = sectorEffects[this.sector] || 0;

        // Correlation effects - stocks in same sector or correlated markets influence each other
        let correlationEffect = 0;
        relatedStocks.forEach(otherStock => {
            if (otherStock.id === this.id) return;

            // Use the previous tick's change for every stock, regardless of
            // array order (#1217); StockMarket.update() snapshots it.
            const otherChange = otherStock.prevChangePct ?? otherStock.lastChangePct ?? 0;

            // Same sector correlation (0.3-0.6)
            if (otherStock.sector === this.sector) {
                const correlation = this.correlation[otherStock.id] || 0.4;
                correlationEffect += otherChange * correlation * 0.3;
            }

            // Same market correlation (0.2-0.4)
            if (otherStock.market === this.market) {
                const marketCorrelation = 0.25;
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
        // Volatile news days widen the swings (#1366)
        const noise = (Math.random() - 0.5) * 2 * this.volatility * (volatilityMultiplier || 1);

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
        this.costBasis = {}; // stockId -> total cost of the shares still held
        this.totalInvested = 0;
        this.history = []; // Portfolio value history
    }

    buy(stockId, quantity, price) {
        if (!Portfolio.isValidQuantity(quantity) || !(price > 0)) return false;
        if (!this.holdings[stockId]) this.holdings[stockId] = 0;
        this.holdings[stockId] += quantity;
        this.costBasis[stockId] = (this.costBasis[stockId] || 0) + quantity * price;
        this.totalInvested += quantity * price;
        return true;
    }

    sell(stockId, quantity, price) {
        if (!Portfolio.isValidQuantity(quantity)) return 0;
        const held = this.holdings[stockId] || 0;
        if (!held || held < quantity) return 0;

        // Average-cost basis: selling removes the sold shares' share of the
        // cost, so totalInvested reflects what is still held (#899, #2365)
        const basis = this.costBasis[stockId] ?? 0;
        const soldCost = held > 0 ? basis * (quantity / held) : 0;
        this.costBasis[stockId] = basis - soldCost;
        this.totalInvested = Math.max(0, this.totalInvested - soldCost);

        this.holdings[stockId] = held - quantity;
        if (this.holdings[stockId] === 0) {
            delete this.holdings[stockId];
            delete this.costBasis[stockId];
        }
        return quantity * price;
    }

    /** Whole, positive share counts only (#895, #1354) */
    static isValidQuantity(quantity) {
        return Number.isInteger(quantity) && quantity > 0;
    }

    getQuantity(stockId) {
        return this.holdings[stockId] || 0;
    }
}

export class StockMarket {
    /** Heat added per unlicensed trade (#1714) */
    static UNLICENSED_TRADE_HEAT = 5;

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
            DOW: { value: 35000, name: 'Dow Jones', market: 'US', sectors: ['Finance', 'Retail', 'Auto', 'Transport', 'Health'] },
            NASDAQ: { value: 14000, name: 'NASDAQ', market: 'US', sectors: ['Tech', 'Hardware', 'Social', 'Media'] },
            S_P_500: { value: 4500, name: 'S&P 500', market: 'US' },
            FTSE: { value: 7500, name: 'FTSE 100', market: 'EU' },
            NIKKEI: { value: 28000, name: 'Nikkei 225', market: 'ASIA', sectors: ['Auto', 'Hardware'] },
            HANG_SENG: { value: 18000, name: 'Hang Seng', market: 'ASIA', sectors: ['Tech'] }
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

        // Each index tracks its own basket: an optional sector tilt plus a
        // little index-specific noise, so DOW/NASDAQ/S&P (and NIKKEI/Hang Seng)
        // no longer move by the identical percentage every day (#2048)
        Object.keys(this.indices).forEach(indexKey => {
            const index = this.indices[indexKey];
            let performance = marketPerformance[index.market] || 0;
            if (index.sectors && this.stocks?.length) {
                const basket = this.stocks.filter(s => s.market === index.market && index.sectors.includes(s.sector));
                if (basket.length > 0) {
                    const basketChange = basket.reduce((sum, s) => sum + (s.lastChangePct || 0), 0) / basket.length;
                    performance = performance * 0.5 + basketChange * 0.5;
                }
            }
            if (index.history) {
                performance += (Math.random() - 0.5) * 0.002;
            }
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
        this.activeWorldEvents = (worldEvents || []).filter(e => e && e.active);

        // Update market trends for each region (random walk with mean reversion)
        // Snapshot pre-update values so cross-market influence is symmetric:
        // every market reads the same previous-tick values, independent of key order.
        const prevTrends = { ...this.marketTrends };
        const newTrends = {};
        Object.keys(this.marketTrends).forEach(market => {
            // Random walk
            let trend = prevTrends[market] + (Math.random() - 0.5) * 0.002;
            // Mean reversion
            trend *= 0.95;

            // Cross-market influence (markets affect each other)
            Object.keys(prevTrends).forEach(otherMarket => {
                if (otherMarket !== market) {
                    const influence = 0.1; // 10% influence from other markets
                    trend += prevTrends[otherMarket] * influence * 0.1;
                }
            });
            newTrends[market] = trend;
        });
        Object.keys(newTrends).forEach(market => {
            this.marketTrends[market] = newTrends[market];
        });

        // Process news effects on sectors
        let sectorEffects = {};
        // Market-moving headlines (effects.stockVolatility) widen today's swings (#1366)
        let newsVolatility = 0;
        newsEvents.forEach(news => {
            if (news?.effects?.stockVolatility) newsVolatility += news.effects.stockVolatility;
        });
        const volatilityMultiplier = 1 + Math.min(0.5, newsVolatility);
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

        // Process world events (can cause large market movements) — only the
        // active ones, like the per-stock impacts below (#896)
        this.activeWorldEvents.forEach(event => {
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

        // Snapshot yesterday's change so correlations don't depend on array order (#1217)
        this.stocks?.forEach(stock => { stock.prevChangePct = stock.lastChangePct || 0; });

        // Update each stock with correlations
        this.stocks?.forEach(stock => {
            stock.update(this.marketTrends, sectorEffects, this.activeWorldEvents, this.stocks, volatilityMultiplier);
        });

        // Artificially pumped prices deflate back toward their real level
        this.unwindManipulation();

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

        // Apply an immediate price shock. A manipulated price is artificial, so
        // it is recorded and unwinds back to the pre-manipulation price over the
        // next few market updates (the "dump"). Re-pumping a stock that is still
        // unwinding keeps the original base price, so repeated pumps can't ratchet
        // the "real" price up permanently.
        if (!stock.manipulation) {
            stock.manipulation = {
                basePrice: stock.price,
                baseVolatility: stock.volatility,
                daysLeft: 0
            };
        }
        stock.manipulation.daysLeft = 3;

        const oldPrice = stock.price;
        const factor = Number(magnitude) > 0 ? Number(magnitude) : 0.01;
        stock.price = Math.max(0.01, stock.price * factor);
        // Record the move so the stock card shows it (#106, #2046)
        stock.lastChange = stock.price - oldPrice;
        stock.lastChangePct = oldPrice > 0 ? (stock.price - oldPrice) / oldPrice : 0;
        stock.history.push(stock.price);
        if (stock.history.length > 100) stock.history.shift();

        // Manipulated stocks become unstable (capped so repeated pumps can't
        // push volatility without bound)
        stock.volatility = Math.min(stock.manipulation.baseVolatility + 0.4, stock.volatility + 0.2);

        return true;
    }

    /**
     * Unwind price manipulation: move each manipulated stock a share of the way
     * back to its pre-manipulation price and volatility.
     */
    unwindManipulation() {
        this.stocks?.forEach(stock => {
            const m = stock.manipulation;
            if (!m) return;
            const share = 1 / Math.max(1, m.daysLeft);
            stock.price = Math.max(0.01, stock.price - (stock.price - m.basePrice) * share);
            stock.volatility = stock.volatility - (stock.volatility - m.baseVolatility) * share;
            m.daysLeft--;
            if (m.daysLeft <= 0) {
                stock.volatility = m.baseVolatility;
                delete stock.manipulation;
            }
        });
    }

    /**
     * Shared trading-licence check for buying and selling (#1214, #2364).
     * Series 7 or Series 63 permits trading. Low-ethics players may trade
     * without one, but each unlicensed trade draws regulator heat (#1714).
     * @returns {{allowed: boolean, unlicensed?: boolean, reason?: string}}
     */
    checkTradingLicense() {
        const legal = this.gameState.legalSystem;
        if (legal?.hasLicense?.('series_7') || legal?.hasLicense?.('series_63')) {
            return { allowed: true };
        }
        if ((this.gameState.characterStats?.ethics ?? 0) > -20) {
            return { allowed: false, reason: "You need a Series 7 or Series 63 License to trade stocks legally." };
        }
        return { allowed: true, unlicensed: true };
    }

    /** Heat for trading without a licence (#1714) */
    applyUnlicensedTradeHeat() {
        const crime = this.gameState.crimeSystem;
        if (crime && typeof crime.addHeat === 'function') {
            crime.addHeat(StockMarket.UNLICENSED_TRADE_HEAT);
            return StockMarket.UNLICENSED_TRADE_HEAT;
        }
        return 0;
    }

    /** Round a money amount to whole cents (#254) */
    static toCents(amount) {
        return Math.round((Number(amount) || 0) * 100) / 100;
    }

    buyStock(stockId, quantity) {
        if (!Portfolio.isValidQuantity(quantity)) {
            return { success: false, reason: 'Enter a whole number of shares greater than zero.' };
        }
        const license = this.checkTradingLicense();
        if (!license.allowed) return { success: false, reason: license.reason };

        const stock = this.getStock(stockId);
        if (!stock) return { success: false, reason: 'Stock not found' };

        // Exact cents: prices are unrounded floats (#254)
        const totalCost = StockMarket.toCents(stock.price * quantity);
        if (this.gameState.money < totalCost) return { success: false, reason: 'Not enough money' };

        this.gameState.money -= totalCost;
        this.portfolio.buy(stockId, quantity, stock.price);
        const heat = license.unlicensed ? this.applyUnlicensedTradeHeat() : 0;

        return { success: true, message: `Bought ${quantity} shares of ${stockId}`, cost: totalCost, stock: stock, unlicensed: !!license.unlicensed, heat };
    }

    sellStock(stockId, quantity) {
        if (!Portfolio.isValidQuantity(quantity)) {
            return { success: false, reason: 'Enter a whole number of shares greater than zero.' };
        }
        const license = this.checkTradingLicense();
        if (!license.allowed) return { success: false, reason: license.reason };

        const stock = this.getStock(stockId);
        if (!stock) return { success: false, reason: "Stock not found" };

        const currentQty = this.portfolio.getQuantity(stockId);
        if (currentQty < quantity) {
            return { success: false, reason: "Not enough shares" };
        }

        const revenue = StockMarket.toCents(this.portfolio.sell(stockId, quantity, stock.price));
        this.gameState.money += revenue;
        const heat = license.unlicensed ? this.applyUnlicensedTradeHeat() : 0;
        return { success: true, revenue: revenue, stock: stock, unlicensed: !!license.unlicensed, heat };
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
     * Trigger a market crash
     * Reduces all market trends dramatically
     */
    triggerCrash() {
        Object.keys(this.marketTrends).forEach(market => {
            this.marketTrends[market] -= 0.05; // -5% daily during crash
        });
        this.updateIndices();
    }

    /**
     * Trigger a tech boom
     * Increases tech-heavy markets and tech sector
     */
    triggerBoom() {
        this.marketTrends['US'] += 0.02;
        this.marketTrends['ASIA'] += 0.015;

        // Apply tech sector boost through individual stock manipulation
        const techStocks = this.stocks?.filter(s => s.sector === 'Tech') || [];
        techStocks.forEach(stock => {
            stock.price = stock.price * 1.03; // 3% boost to tech stocks
            stock.history.push(stock.price);
        });

        this.updateIndices();
    }

    /**
     * Immediate market-wide crash used by EventSystem (#1213, #2411)
     * @param {number} percent - drop in percent (e.g. 30 = -30%)
     */
    crash(percent = 30) {
        const pct = Math.min(95, Math.max(0, Number(percent) || 0)) / 100;
        this.applyMarketShock(-pct);
        this.triggerCrash();
        return pct * 100;
    }

    /**
     * Immediate market-wide rally used by EventSystem (#1213, #2411)
     * @param {number} percent - gain in percent (e.g. 20 = +20%)
     */
    boost(percent = 20) {
        const pct = Math.min(200, Math.max(0, Number(percent) || 0)) / 100;
        this.applyMarketShock(pct);
        return pct * 100;
    }

    /** Move every stock by the same fraction and record the change */
    applyMarketShock(fraction) {
        this.stocks?.forEach(stock => {
            const old = stock.price;
            stock.price = Math.max(0.01, stock.price * (1 + fraction));
            stock.lastChange = stock.price - old;
            stock.lastChangePct = old > 0 ? (stock.price - old) / old : 0;
            stock.history.push(stock.price);
            if (stock.history.length > 100) stock.history.shift();
        });
        this.updateIndices();
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
                lastChangePct: stock.lastChangePct,
                volume: stock.volume || 0, // #1215
                correlation: stock.correlation || {}, // #1218
                manipulation: stock.manipulation || null
            })),
            portfolio: {
                holdings: this.portfolio.holdings,
                costBasis: this.portfolio.costBasis,
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
                    stock.volume = Number(sData.volume) || 0; // #1215
                    // Keep the saved correlations instead of the freshly randomized ones (#1218)
                    if (sData.correlation && typeof sData.correlation === 'object') {
                        stock.correlation = { ...sData.correlation };
                    }
                    if (sData.manipulation) stock.manipulation = { ...sData.manipulation };
                    else delete stock.manipulation;
                }
            });
        }

        // Restore portfolio
        if (data.portfolio) {
            this.portfolio.holdings = data.portfolio.holdings || {};
            this.portfolio.totalInvested = data.portfolio.totalInvested || 0;
            if (data.portfolio.costBasis) {
                this.portfolio.costBasis = { ...data.portfolio.costBasis };
            } else {
                // Older saves: spread totalInvested across holdings by current value
                const value = this.getPortfolioValue();
                this.portfolio.costBasis = {};
                for (const [id, qty] of Object.entries(this.portfolio.holdings)) {
                    const st = this.getStock(id);
                    const share = value > 0 && st ? (st.price * qty) / value : 0;
                    this.portfolio.costBasis[id] = this.portfolio.totalInvested * share;
                }
            }
            this.portfolio.history = data.portfolio.history || [];
        }
    }
}
