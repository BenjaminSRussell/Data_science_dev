/**
 * StockMarketHelpers.js
 * Helper functions for stock market operations and crime system
 */

import { QuotronTicker } from '../game/QuotronTicker.js';

let quotronTicker = null;

/**
 * Update the stock market screen display with enhanced multi-market visualization
 */
export function updateStockMarketScreen(game) {
    if (!game.stockMarket) return;

    // Initialize quotron ticker if not already done
    if (!quotronTicker) {
        quotronTicker = new QuotronTicker('quotron-ticker', game.stockMarket);
        quotronTicker.start();
    } else {
        quotronTicker.refresh();
    }

    // Update market indices display
    updateMarketIndices(game);

    // Update market summaries
    updateMarketSummaries(game);

    // Update world events display
    updateWorldEventsDisplay(game);

    const grid = document.getElementById('stock-grid');
    if (!grid) return;

    grid.textContent = '';

    // Group stocks by market
    const stocksByMarket = {};
    game.stockMarket?.stocks?.forEach(stock => {
        if (!stocksByMarket[stock.market]) {
            stocksByMarket[stock.market] = [];
        }
        stocksByMarket[stock.market].push(stock);
    });

    // Display stocks grouped by market
    Object.keys(stocksByMarket).forEach(market => {
        // Market header
        const marketHeader = document.createElement('div');
        marketHeader.className = 'market-section-header';
        const summary = game.stockMarket?.getMarketSummary(market);
        const marketTrend = summary ? (summary.avgChange * 100).toFixed(2) : '0.00';
        const trendClass = summary && summary.avgChange >= 0 ? 'positive' : 'negative';
        marketHeader.innerHTML = `
            <h3 class="market-name">${getMarketDisplayName(market)}</h3>
            <span class="market-trend ${trendClass}">${marketTrend >= 0 ? '+' : ''}${marketTrend}%</span>
            <span class="market-stats">${summary ? `${summary.gainers}↑ ${summary.losers}↓` : ''}</span>
        `;
        grid.appendChild(marketHeader);

        // Stocks in this market
        stocksByMarket[market].forEach(stock => {
            const owned = game.stockMarket.portfolio.getQuantity(stock.id);
            const card = document.createElement('div');
            card.className = 'stock-card';
            card.setAttribute('data-market', stock.market);
            card.setAttribute('data-sector', stock.sector);

            // Use lastChangePct if available, otherwise calculate from history
            const changePct = stock.lastChangePct !== undefined
                ? stock.lastChangePct * 100
                : (stock.history.length > 1
                    ? ((stock.price - stock.history[stock.history.length - 2]) / stock.history[stock.history.length - 2]) * 100
                    : 0);
            const changeClass = changePct >= 0 ? 'positive' : 'negative';
            const changeSymbol = changePct >= 0 ? '▲' : '▼';
            const changeValue = stock.lastChange !== undefined ? stock.lastChange : (stock.price - (stock.history[stock.history.length - 2] || stock.price));

            // Illegal Actions Check
            let illegalActionsHtml = '';
            if (game.characterStats?.ethics < -10) {
                illegalActionsHtml = `
                    <div class="stock-actions-illegal" style="margin-top: 5px; border-top: 1px dashed red; padding-top: 5px;">
                        <button class="btn-cartoon btn-sm btn-danger" onclick="game.handleCrime('pump_dump', '${stock.id}')"> Pump & Dump</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="stock-header">
                    <div class="stock-ticker">${stock.ticker}</div>
                    <div class="stock-market-badge">${stock.market}</div>
                </div>
                <div class="stock-name">${stock.name}</div>
                <div class="stock-sector">${stock.sector}</div>
                <div class="stock-price-large">$${stock.price.toFixed(2)}</div>
                <div class="stock-change ${changeClass}">
                    ${changeSymbol} ${Math.abs(changePct).toFixed(2)}% 
                    <span class="stock-change-amount">($${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)})</span>
                </div>
                <div class="stock-volume">Vol: ${formatVolume(stock.volume || 0)}</div>
                <div class="stock-holdings">Owned: ${owned}</div>
                <div class="stock-actions">
                    <button class="btn-cartoon btn-sm" onclick="game.handleBuyStock('${stock.id}')">Buy</button>
                    <button class="btn-cartoon btn-sm" onclick="game.handleSellStock('${stock.id}')">Sell</button>
                </div>
                ${illegalActionsHtml}
            `;
            grid.appendChild(card);
        });
    });

    // Update portfolio summary
    document.getElementById('portfolio-value').textContent = `$${game.stockMarket?.getPortfolioValue()?.toFixed(2) || '0.00'}`;
    document.getElementById('liquid-cash').textContent = `$${game.gameState.money.toFixed(2)}`;
}

/**
 * Update market indices display
 */
function updateMarketIndices(game) {
    const indicesContainer = document.getElementById('market-indices');
    if (!indicesContainer || !game.stockMarket.indices) return;

    indicesContainer.textContent = '';

    Object.keys(game.stockMarket.indices).forEach(indexKey => {
        const index = game.stockMarket.indices[indexKey];
        const prevValue = index.history && index.history.length > 1
            ? index.history[index.history.length - 2]
            : index.value;
        const change = index.value - prevValue;
        const changePct = prevValue > 0 ? (change / prevValue) * 100 : 0;
        const changeClass = changePct >= 0 ? 'positive' : 'negative';
        const changeSymbol = changePct >= 0 ? '▲' : '▼';

        const indexElement = document.createElement('div');
        indexElement.className = 'market-index';
        indexElement.innerHTML = `
            <div class="index-name">${index.name}</div>
            <div class="index-value">${index.value.toFixed(0)}</div>
            <div class="index-change ${changeClass}">
                ${changeSymbol} ${Math.abs(changePct).toFixed(2)}%
                <span class="index-change-amount">(${change >= 0 ? '+' : ''}${change.toFixed(0)})</span>
            </div>
        `;
        indicesContainer.appendChild(indexElement);
    });
}

/**
 * Update market summaries display
 */
function updateMarketSummaries(game) {
    const summariesContainer = document.getElementById('market-summaries');
    if (!summariesContainer) return;

    const summaries = game.stockMarket?.getAllMarketSummaries() || [];
    summariesContainer.textContent = '';

    summaries.forEach(summary => {
        if (!summary) return;

        const summaryElement = document.createElement('div');
        summaryElement.className = 'market-summary';
        const trendClass = summary.avgChange >= 0 ? 'positive' : 'negative';
        summaryElement.innerHTML = `
            <div class="summary-market">${getMarketDisplayName(summary.market)}</div>
            <div class="summary-trend ${trendClass}">
                ${(summary.avgChange * 100).toFixed(2)}%
            </div>
            <div class="summary-stats">
                ${summary.gainers}↑ ${summary.losers}↓
            </div>
        `;
        summariesContainer.appendChild(summaryElement);
    });
}

/**
 * Update world events display
 */
function updateWorldEventsDisplay(game) {
    const eventsContainer = document.getElementById('world-events-list');
    if (!eventsContainer) return;

    const events = game.stockMarket.activeWorldEvents || [];
    if (events.length === 0) {
        eventsContainer.innerHTML = '<div class="no-events">No active world events affecting markets</div>';
        return;
    }

    eventsContainer.textContent = '';
    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'world-event-alert';
        const impactClass = event.marketImpact && event.marketImpact < 0 ? 'negative' : 'positive';
        eventElement.innerHTML = `
            <div class="event-icon"></div>
            <div class="event-content">
                <div class="event-title">${event.name || event.type || 'World Event'}</div>
                <div class="event-impact ${impactClass}">Market Impact: ${event.marketImpact ? (event.marketImpact * 100).toFixed(1) + '%' : 'Active'}</div>
            </div>
        `;
        eventsContainer.appendChild(eventElement);
    });
}

/**
 * Get display name for market
 */
function getMarketDisplayName(market) {
    const names = {
        'US': ' United States',
        'EU': ' Europe',
        'ASIA': ' Asia',
        'EMERGING': ' Emerging Markets'
    };
    return names[market] || market;
}

/**
 * Format volume for display
 */
function formatVolume(volume) {
    if (volume >= 1000000) {
        return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
        return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toFixed(0);
}

/**
 * Handle buying stocks
 */
export function handleBuyStock(game, stockId) {
    const qty = parseInt(prompt("How many shares to buy?", "10"));
    if (!qty || qty <= 0) return;

    const result = game.stockMarket?.buyStock(stockId, qty);
    if (!result) return;
    if (result.success) {
        game.showToast(`Bought ${qty} shares of ${result.stock.ticker}`, 'success');
        updateStockMarketScreen(game);
        game.uiUpdater.updateAllUI();
    } else {
        game.showError(result.reason);
    }
}

/**
 * Handle selling stocks
 */
export function handleSellStock(game, stockId) {
    const qty = parseInt(prompt("How many shares to sell?", "10"));
    if (!qty || qty <= 0) return;

    const result = game.stockMarket?.sellStock(stockId, qty);
    if (!result) return;
    if (result.success) {
        game.showToast(`Sold ${qty} shares of ${result.stock.ticker}`, 'success');
        updateStockMarketScreen(game);
        game.uiUpdater.updateAllUI();
    } else {
        game.showError(result.reason);
    }
}

/**
 * Handle committing crimes (stock manipulation, etc.)
 */
export function handleCrime(game, type, params) {
    if (!confirm(" This is illegal! If caught, you could go to jail. Proceed?")) return;

    const result = game.crimeSystem.commitCrime(type, params);
    if (result.success) {
        game.showToast(result.message, 'success');
        if (result.profit) {
            game.showToast(`Profit: $${result.profit}`, 'success');
        }
        updateStockMarketScreen(game);
        game.uiUpdater.updateAllUI();
    } else {
        if (result.caught) {
            handleArrest(game, result.message);
        } else {
            game.showToast(result.message, 'warning');
        }
    }
}

/**
 * Handle arrest when caught committing crime
 */
export function handleArrest(game, reason) {
    game.gameState.jailSentence = 30;
    game.screenManager.showScreen('screen-jail');
    document.getElementById('jail-time-left').textContent = `${game.gameState.jailSentence} days`;

    game.gameState.reputation = Math.floor(game.gameState.reputation / 2);
    game.gameState.money -= 5000;
    game.showToast("You've been arrested! Reputation halved.", 'error');
    game.audioManager.play('error');
}

/**
 * Handle serving jail time
 */
export function handleServeJailTime(game) {
    if (game.gameState.jailSentence <= 0) {
        game.showToast("You are free to go!", 'success');
        game.screenManager.showScreen('screen-game');
        return;
    }

    game.handleTimeAdvance(6);
    game.gameState.jailSentence--;
    document.getElementById('jail-time-left').textContent = `${game.gameState.jailSentence} days`;

    if (game.gameState.jailSentence <= 0) {
        game.showToast("You served your time.", 'info');
        game.screenManager.showScreen('screen-game');
    }
}

/**
 * Handle bribing a guard to escape jail
 */
export function handleBribeGuard(game) {
    if (game.gameState.money < 5000) {
        game.showToast("Not enough money!", 'error');
        return;
    }

    game.gameState.money -= 5000;
    const success = Math.random() > 0.5;

    if (success) {
        game.gameState.jailSentence = 0;
        game.showToast("The guard looks the other way...", 'success');
        game.screenManager.showScreen('screen-game');
        game.characterStats.modifyEthics(-10);
    } else {
        game.gameState.jailSentence += 7;
        game.showToast("Bribe failed! Sentence extended.", 'error');
        document.getElementById('jail-time-left').textContent = `${game.gameState.jailSentence} days`;
    }
    game.uiUpdater.updateAllUI();
}




