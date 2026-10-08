/**
 * CrimeSystem.js
 * Manages illegal activities, heat, and consequences
 */
export class CrimeSystem {
    constructor(gameState) {
        this.gameState = gameState;

        // Heat Meter (0-100) - Risk of getting caught
        this.heat = 0;

        // Criminal History
        this.crimesCommitted = 0;
        this.jailTimeServed = 0; // total days spent in jail across the playthrough
        this.isUnderInvestigation = false;
        this.investigationDays = 0; // days the current investigation has been open
    }

    /**
     * Extra risk from the player's situation: a criminal record and an open
     * investigation both make the authorities more attentive.
     */
    getSituationalRisk() {
        const recordRisk = Math.min(20, this.crimesCommitted * 2);
        const investigationRisk = this.isUnderInvestigation ? 10 : 0;
        return recordRisk + investigationRisk;
    }

    /**
     * Commit a crime
     * @param {string} type - type of crime (pump_dump, insider_trading, rathole, fabricate_data)
     * @param {object} params - parameters for the crime (e.g. stockId, amount)
     * @returns {object} result - success, message, profit, heatGained
     */
    commitCrime(type, params) {
        // Ethics check? (Usually UI handles this, but we can enforce)

        // Calculate success chance based on Focus, Luck, and Heat
        const stats = this.gameState.characterStats;
        const luck = stats?.getStat?.('luck') || 0;
        const focus = stats?.getStat?.('focus') || 0;
        const situationalRisk = this.getSituationalRisk();

        // Base risk
        let risk = 0;
        let heatGain = 0;
        let ethicsLoss = 0;
        let result = { success: false, message: '', profit: 0, heatGained: 0 };

        switch (type) {
            case 'pump_dump':
                // Hype a stock artificially
                risk = 30 + (this.heat / 2) + situationalRisk;
                heatGain = 20;
                ethicsLoss = -15;
                result = this.executePumpAndDump(params, risk, luck, focus);
                break;

            case 'insider_trading':
                // Use non-public info
                risk = 40 + (this.heat / 2) + situationalRisk;
                heatGain = 25;
                ethicsLoss = -20;
                result = this.executeInsiderTrading(params, risk, luck, focus);
                break;

            case 'rathole':
                // Hide money/stocks
                risk = 20 + (this.heat / 2) + situationalRisk;
                heatGain = 10;
                ethicsLoss = -10;
                result = this.executeRathole(params, risk, luck, focus);
                break;

            case 'fabricate_data':
                // Falsify research for client
                risk = 50 + (this.heat / 2) + situationalRisk;
                heatGain = 30;
                ethicsLoss = -30;
                result = this.executeFabricateData(params, risk, luck, focus);
                break;

            default:
                return { success: false, message: 'Unknown crime.' };
        }

        if (result.success) {
            stats?.modifyEthics?.(ethicsLoss);
            this.addHeat(heatGain);
            this.crimesCommitted++;
            result.heatGained = heatGain;
        } else if (!result.invalid) {
            // A failed attempt draws more attention than a clean one: being
            // investigated adds the crime's full heat, getting caught doubles it.
            const failHeat = result.caught ? heatGain * 2 : heatGain;
            this.addHeat(failHeat);
            result.heatGained = failHeat;
            if (result.caught) {
                // The arrest itself (jail screen, fine) is applied once by the
                // caller (StockMarketHelpers.handleCrime). Here we only record it.
                this.recordArrest();
            }
        }

        return result;
    }

    executePumpAndDump(stockId, risk, luck, focus) {
        // Logic: Boost stock price temporarily, allowing player to sell high
        // For simplicity: The action effectively boosts the stock immediately

        const roll = Math.random() * 100;
        // Luck reduces risk by 0.2 per point (luck caps at 50, so at most -10 risk).
        // Focus reduces risk by 0.1 per point (focus caps at 100, so at most -10 risk).
        const effectiveRisk = Math.max(5, risk - (luck * 0.2) - (focus * 0.1));

        if (roll < effectiveRisk) {
            // Failed - Investigation started
            this.triggerInvestigation();
            return { success: false, message: 'The SEC noticed suspicious activity. Investigation started!' };
        }

        // Success
        // Notify StockMarket to bump price
        const profit = this.manipulateAndMeasure(stockId, 'pump', 1.5); // 50% boost

        return { success: true, message: 'You successfully hyped the stock! Price is surging!', profit };
    }

    executeInsiderTrading(stockId, risk, luck, focus) {
        const roll = Math.random() * 100;
        const effectiveRisk = Math.max(10, risk - (luck * 0.2) - (focus * 0.1));

        if (roll < effectiveRisk) {
            this.triggerInvestigation();
            return { success: false, message: 'Your source got spooked. The feds are sniffing around.' };
        }

        // Success: Immediate knowledge (or guaranteed profit next turn)
        // Let's implement as: Stock WILL go up next turn significantly
        const profit = this.manipulateAndMeasure(stockId, 'insider_pump', 1.3);

        return { success: true, message: 'Insider info acquired. The stock is guaranteed to jump.', profit };
    }

    /**
     * Manipulate a stock and return the paper gain on the shares the player
     * holds, so the "Profit" toast has something to show (#904)
     */
    manipulateAndMeasure(stockId, type, magnitude) {
        const market = this.gameState.stockMarket;
        if (!market) return 0;
        const stock = market.getStock?.(stockId);
        const before = stock ? stock.price : 0;
        market.manipulateStock(stockId, type, magnitude);
        const owned = market.portfolio?.getQuantity?.(stockId) || 0;
        if (!stock || !owned) return 0;
        return Math.round((stock.price - before) * owned * 100) / 100;
    }

    executeRathole(amount, risk, luck, focus) {
        // Hide money to avoid fines/taxes? Or simply launder it?
        // Maybe "Launder Money" -> Converts "Dirty Money" (if we track it) to Clean
        // For now: Just gives a small profit (tax evasion)

        if (!(amount > 0)) return { success: false, message: 'Invalid amount.', invalid: true };
        if (this.gameState.money < amount) return { success: false, message: 'Insufficient funds to hide.', invalid: true };

        // Deduct the hidden amount up front so we never manufacture money
        this.gameState.money -= amount;

        const roll = Math.random() * 100;
        const effectiveRisk = Math.max(5, risk - (luck * 0.2) - (focus * 0.1));

        if (roll < effectiveRisk) {
            this.triggerInvestigation();
            return { success: false, message: `The IRS flagged your transaction. $${amount} seized.` };
        }

        const profit = amount * 0.2; // Saved 20% taxes basically
        this.gameState.money += profit;

        return { success: true, message: `Hidden $${amount}. Saved $${profit} in taxes.`, profit: profit };
    }

    executeFabricateData(client, risk, luck, focus) {
        const roll = Math.random() * 100;
        const effectiveRisk = Math.max(15, risk - (luck * 0.2) - (focus * 0.1));

        if (roll < effectiveRisk) {
            return { success: false, message: 'Fraud detected! You are going to jail!', caught: true };
        }

        // Huge reputation boost (fake) and money
        this.gameState.money += 5000;
        this.gameState.reputation += 100;

        return { success: true, message: 'Client loved the (fake) results! Huge bonus.', profit: 5000 };
    }

    addHeat(amount) {
        this.heat = Math.min(100, this.heat + amount);
        this.processHeatEvents();
    }

    decayHeat() {
        // Heat goes down slowly over time
        this.heat = Math.max(0, this.heat - 5);
    }

    /**
     * Daily tick: heat cools off and any open investigation progresses.
     * An investigation either escalates to an arrest (heat still high after
     * 3 days) or is dropped after 7 days without enough evidence.
     * @returns {{arrested?: boolean, cleared?: boolean, reason?: string}}
     */
    processDay() {
        this.decayHeat();
        if (!this.isUnderInvestigation) return {};

        this.investigationDays++;
        if (this.heat >= 80 && this.investigationDays >= 3) {
            this.recordArrest();
            return { arrested: true, reason: 'The investigation found enough evidence to arrest you.' };
        }
        if (this.investigationDays >= 7) {
            this.isUnderInvestigation = false;
            this.investigationDays = 0;
            return { cleared: true };
        }
        return {};
    }

    processHeatEvents() {
        if (this.heat > 80) {
            // High risk of audit/arrest
            if (Math.random() < 0.3) this.triggerInvestigation();
        }
    }

    triggerInvestigation() {
        if (this.isUnderInvestigation) return;
        this.isUnderInvestigation = true;
        this.investigationDays = 0;
    }

    /**
     * Record an arrest: the open investigation (if any) is closed by it.
     */
    recordArrest() {
        this.isUnderInvestigation = false;
        this.investigationDays = 0;
    }

    /**
     * Record one day served in jail.
     */
    serveJailDay() {
        this.jailTimeServed++;
    }

    handleArrest(reason = 'Illegal activity') {
        // Go to jail - delegate to the real arrest handler in the main game
        this.recordArrest();
        this.gameState.mainGame?.handleArrest(reason);
    }

    toJSON() {
        return {
            heat: this.heat,
            crimesCommitted: this.crimesCommitted,
            jailTimeServed: this.jailTimeServed,
            isUnderInvestigation: this.isUnderInvestigation,
            investigationDays: this.investigationDays
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.heat = data.heat || 0;
        this.crimesCommitted = data.crimesCommitted || 0;
        this.jailTimeServed = data.jailTimeServed || 0;
        this.isUnderInvestigation = !!data.isUnderInvestigation;
        this.investigationDays = data.investigationDays || 0;
    }
}
