/**
 * StockMarketHelpers.js
 * Helper functions for stock market operations and crime system
 */

/**
 * Update the stock market screen display
 */
export function updateStockMarketScreen(game) {
    if (!game.stockMarket) return;

    const grid = document.getElementById('stock-grid');
    if (!grid) return;

    grid.innerHTML = '';

    game.stockMarket.stocks.forEach(stock => {
        const owned = game.stockMarket.portfolio.getQuantity(stock.id);
        const card = document.createElement('div');
        card.className = 'stock-card';

        // Calculate change
        const lastPrice = stock.history.length > 1 ? stock.history[stock.history.length - 2] : stock.price;
        const change = ((stock.price - lastPrice) / lastPrice) * 100;
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeSymbol = change >= 0 ? '▲' : '▼';

        // Illegal Actions Check
        let illegalActionsHtml = '';
        if (game.characterStats.ethics < -10) {
            illegalActionsHtml = `
                <div class="stock-actions-illegal" style="margin-top: 5px; border-top: 1px dashed red; padding-top: 5px;">
                    <button class="btn-cartoon btn-sm btn-danger" onclick="game.handleCrime('pump_dump', '${stock.id}')">⚡ Pump & Dump</button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="stock-header">
                <div class="stock-ticker">${stock.ticker}</div>
                <div class="stock-price">$${stock.price.toFixed(2)}</div>
            </div>
            <div class="stock-name">${stock.name}</div>
            <div class="stock-change ${changeClass}">${changeSymbol} ${Math.abs(change).toFixed(2)}%</div>
            <div class="stock-holdings">Owned: ${owned}</div>
            <div class="stock-actions">
                <button class="btn-cartoon btn-sm" onclick="game.handleBuyStock('${stock.id}')">Buy</button>
                <button class="btn-cartoon btn-sm" onclick="game.handleSellStock('${stock.id}')">Sell</button>
            </div>
            ${illegalActionsHtml}
        `;
        grid.appendChild(card);
    });

    // Update portfolio summary
    document.getElementById('portfolio-value').textContent = `$${game.stockMarket.getPortfolioValue().toFixed(2)}`;
    document.getElementById('liquid-cash').textContent = `$${game.gameState.money.toFixed(2)}`;
}

/**
 * Handle buying stocks
 */
export function handleBuyStock(game, stockId) {
    const qty = parseInt(prompt("How many shares to buy?", "10"));
    if (!qty || qty <= 0) return;

    const result = game.stockMarket.buyStock(stockId, qty);
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

    const result = game.stockMarket.sellStock(stockId, qty);
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
    if (!confirm("⚠️ This is illegal! If caught, you could go to jail. Proceed?")) return;

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




