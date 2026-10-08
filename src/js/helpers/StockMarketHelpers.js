/**
 * StockMarketHelpers.js
 * Helper functions for stock market operations and crime system
 */

import { getLawyerReduction } from '../game/LegalSystem.js';
import { QuotronTicker } from '../game/QuotronTicker.js';

let quotronTicker = null;

/**
 * Update the stock market screen display with enhanced multi-market visualization
 */
export function updateStockMarketScreen(game) {
    if (!game.stockMarket) return;

    // Initialize quotron ticker if not already done
    if (!quotronTicker || !quotronTicker.tickerContent) {
        quotronTicker = new QuotronTicker('quotron-ticker', game.stockMarket);
        quotronTicker.start();
    } else {
        // A new game or loaded save replaces game.stockMarket (#898)
        quotronTicker.setStockMarket?.(game.stockMarket);
        quotronTicker.refresh();
    }

    // Update heat meter display
    game.uiUpdater?.updateHeatMeter?.();

    // Off-the-books actions (only offered once ethics have slipped)
    updateShadyDealings(game);

    // Update market indices display
    updateMarketIndices(game);

    // Update market summaries
    updateMarketSummaries(game);

    // Update world events display
    updateWorldEventsDisplay(game);

    // Portfolio summary is refreshed even when the grid is missing (#2233)
    updatePortfolioSummary(game);

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
        const trend = formatPercentChange(summary ? summary.avgChange * 100 : 0);
        marketHeader.innerHTML = `
            <h3 class="market-name">${getMarketDisplayName(market)}</h3>
            <span class="market-trend ${trend.className}">${trend.text}</span>
            <span class="market-stats">${summary ? `${summary.gainers}↑ ${summary.losers}↓` : ''}</span>
        `;
        grid.appendChild(marketHeader);

        // Stocks in this market
        stocksByMarket[market].forEach(stock => {
            const owned = game.stockMarket.portfolio.getQuantity(stock.id);
            const card = document.createElement('div');
            card.className = 'stock-card';

            // Stock always initializes lastChange/lastChangePct, so read them
            // directly (the history fallback could never run, #1524, #1525)
            const changePct = (stock.lastChangePct || 0) * 100;
            const changeClass = changePct >= 0 ? 'positive' : 'negative';
            const changeSymbol = changePct >= 0 ? '▲' : '▼';
            const changeValue = stock.lastChange || 0;

            // Illegal Actions Check
            let illegalActionsHtml = '';
            if (game.characterStats?.ethics < -10) {
                illegalActionsHtml = `
                    <div class="stock-actions-illegal" style="margin-top: 5px; border-top: 1px dashed red; padding-top: 5px;">
                        <button class="btn-cartoon btn-sm btn-danger" onclick="game.handleCrime('pump_dump', '${stock.id}')"> Pump & Dump</button>
                        <button class="btn-cartoon btn-sm btn-danger" onclick="game.handleCrime('insider_trading', '${stock.id}')"> Insider Tip</button>
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

}

/**
 * Update the portfolio value / cash readout
 */
function updatePortfolioSummary(game) {
    const valueEl = document.getElementById('portfolio-value');
    if (valueEl) valueEl.textContent = `$${(game.stockMarket?.getPortfolioValue?.() || 0).toFixed(2)}`;
    const cashEl = document.getElementById('liquid-cash');
    if (cashEl) cashEl.textContent = `$${(Number(game.gameState.money) || 0).toFixed(2)}`;
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
        const trend = formatPercentChange(summary.avgChange * 100);
        summaryElement.innerHTML = `
            <div class="summary-market">${getMarketDisplayName(summary.market)}</div>
            <div class="summary-trend ${trend.className}">
                ${trend.text}
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
        // Treat 0 as a real (neutral) impact, not "missing" (#1523)
        const hasImpact = typeof event.marketImpact === 'number';
        const impactClass = !hasImpact || event.marketImpact === 0
            ? 'neutral'
            : (event.marketImpact < 0 ? 'negative' : 'positive');
        const icon = !hasImpact || event.marketImpact === 0 ? '•' : (event.marketImpact < 0 ? '▼' : '▲');
        eventElement.innerHTML = `
            <div class="event-icon">${icon}</div>
            <div class="event-content">
                <div class="event-title">${event.name || event.type || 'World Event'}</div>
                <div class="event-impact ${impactClass}">Market Impact: ${hasImpact ? (event.marketImpact * 100).toFixed(1) + '%' : 'Active'}</div>
            </div>
        `;
        eventsContainer.appendChild(eventElement);
    });
}

/**
 * Get display name for market
 */
export function getMarketDisplayName(market) {
    const names = {
        'US': 'United States',
        'EU': 'Europe',
        'ASIA': 'Asia',
        'EMERGING': 'Emerging Markets'
    };
    return names[market] || market;
}

/**
 * Shared % change formatting for market headers and summaries (#1527):
 * fixed 2 decimals, explicit + for gains, and a positive/negative class
 */
export function formatPercentChange(pct) {
    const value = Number.isFinite(pct) ? pct : 0;
    return {
        text: `${value > 0 ? '+' : ''}${value.toFixed(2)}%`,
        className: value >= 0 ? 'positive' : 'negative'
    };
}

/**
 * Format volume for display
 */
export function formatVolume(volume) {
    volume = Number(volume) || 0;
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
    // Consistent guard: bail before prompting if the market isn't loaded (#1526)
    if (!game.stockMarket) {
        game.showError('The stock market is not available right now.');
        return;
    }
    const qty = parseInt(prompt("How many shares to buy?", "10"), 10);
    if (!qty || qty <= 0) return;

    const result = game.stockMarket.buyStock(stockId, qty);
    if (result?.success) {
        game.showToast(`Bought ${qty} shares of ${result.stock?.ticker || stockId}`, 'success');
        warnUnlicensed(game, result);
        updateStockMarketScreen(game);
        game.uiUpdater?.updateAllUI();
    } else {
        game.showError(result?.reason || 'Trade failed.');
    }
}

function warnUnlicensed(game, result) {
    if (result?.unlicensed) {
        game.showToast(`Unlicensed trade: regulators noticed (+${result.heat || 0} heat).`, 'warning');
        game.uiUpdater?.updateHeatMeter?.();
    }
}

/**
 * Handle selling stocks
 */
export function handleSellStock(game, stockId) {
    if (!game.stockMarket) {
        game.showError('The stock market is not available right now.');
        return;
    }
    const qty = parseInt(prompt("How many shares to sell?", "10"), 10);
    if (!qty || qty <= 0) return;

    const result = game.stockMarket.sellStock(stockId, qty);
    if (result?.success) {
        game.showToast(`Sold ${qty} shares of ${result.stock?.ticker || stockId}`, 'success');
        warnUnlicensed(game, result);
        updateStockMarketScreen(game);
        game.uiUpdater?.updateAllUI();
    } else {
        game.showError(result?.reason || 'Trade failed.');
    }
}

/**
 * Handle committing crimes (stock manipulation, etc.)
 */
export function updateShadyDealings(game) {
    const panel = document.getElementById('shady-dealings');
    if (!panel) return;
    const unlocked = (game.characterStats?.ethics ?? 0) < -10;
    panel.classList.toggle('hidden', !unlocked);
}

export function handleCrime(game, type, params) {
    if (!game.crimeSystem) {
        game.showError('That option is not available right now.');
        return;
    }
    const heat = Math.floor(game.crimeSystem?.heat || 0);
    if (!confirm(`This is illegal! If caught, you could go to jail. Proceed?\n\nCurrent heat: ${heat}/100`)) return;

    if (type === 'rathole' && params === undefined) {
        const input = prompt('How much cash do you want to hide from the taxman?', '1000');
        if (input === null) return;
        params = Number(input);
        if (!Number.isFinite(params) || params <= 0) {
            game.showToast('Enter a positive amount.', 'warning');
            return;
        }
    }

    const result = game.crimeSystem.commitCrime(type, params);
    if (result.success) {
        game.showToast(result.message, 'success');
        if (typeof result.profit === 'number' && result.profit !== 0) {
            game.showToast(`Profit: $${Math.round(result.profit).toLocaleString()}`, result.profit > 0 ? 'success' : 'warning');
        }
        updateStockMarketScreen(game);
        game.uiUpdater.updateAllUI();
    } else {
        if (result.caught) {
            handleArrest(game, result.message);
        } else {
            game.showToast(result.message, 'warning');
            game.uiUpdater?.updateHeatMeter?.();
        }
    }
}

/**
 * Handle arrest when caught committing crime
 */
export function handleArrest(game, reason) {
    // Lawyer tier (LegalSystem.hireLawyer) mitigates the penalty:
    // cheap: 20% reduction, average: 40%, expensive: 60%
    const lawyerTier = game.gameState.legalSystem?.lawyer || null;
    const reduction = getLawyerReduction(lawyerTier);

    const baseSentence = 30;
    const baseFine = 5000;
    const sentence = Math.max(1, Math.floor(baseSentence * (1 - reduction)));
    const fine = Math.floor(baseFine * (1 - reduction));

    game.gameState.jailSentence = sentence;
    game.screenManager.showScreen('screen-jail');
    document.getElementById('jail-time-left').textContent = `${game.gameState.jailSentence} days`;
    game.uiUpdater?.updateHeatMeter?.();

    // An arrest halves reputation; a lawyer softens the hit. This used to be
    // rep * (1 - reduction), so having a lawyer was the only way to lose rep (#1281)
    const repLoss = 0.5 * (1 - reduction);
    game.gameState.reputation = Math.floor((game.gameState.reputation || 0) * (1 - repLoss));
    // Like the bribe, the fine can't take more than you have (#1277)
    const charged = Math.max(0, Math.min(fine, Math.floor(game.gameState.money || 0)));
    game.gameState.money -= charged;

    const lawyerNote = lawyerTier
        ? ` Your lawyer negotiated a ${Math.round(reduction * 100)}% reduction.`
        : '';
    // Say why you were arrested (#1521)
    const why = reason ? ` ${String(reason).trim()}` : '';
    game.showToast(`You've been arrested!${why} ${sentence} days in jail, $${charged.toLocaleString()} fine.${lawyerNote}`, 'error');
    game.audioManager.play('error');
    // Money/reputation changed: refresh the top bar (#1280)
    game.uiUpdater?.updateAllUI?.();
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
    game.gameState.crimeSystem?.serveJailDay?.();
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
    // Same guard as handleServeJailTime (#2232)
    if (!(game.gameState.jailSentence > 0)) {
        game.showToast("You're not in jail!", 'info');
        game.screenManager?.showScreen('screen-game');
        return;
    }
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




