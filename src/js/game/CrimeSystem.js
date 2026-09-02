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
        this.jailTimeServed = 0;
        this.isUnderInvestigation = false;
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
        const luck = stats.getStat('luck');
        const focus = stats.getStat('focus');

        // Base risk
        let risk = 0;
        let heatGain = 0;
        let ethicsLoss = 0;
        let result = { success: false, message: '', profit: 0, heatGained: 0 };

        switch (type) {
            case 'pump_dump':
                // Hype a stock artificially
                risk = 30 + (this.heat / 2);
                heatGain = 20;
                ethicsLoss = -15;
                result = this.executePumpAndDump(params, risk, luck, focus);
                break;

            case 'insider_trading':
                // Use non-public info
                risk = 40 + (this.heat / 2);
                heatGain = 25;
                ethicsLoss = -20;
                result = this.executeInsiderTrading(params, risk, luck, focus);
                break;

            case 'rathole':
                // Hide money/stocks
                risk = 20 + (this.heat / 2);
                heatGain = 10;
                ethicsLoss = -10;
                result = this.executeRathole(params, risk, luck, focus);
                break;

            case 'fabricate_data':
                // Falsify research for client
                risk = 50 + (this.heat / 2);
                heatGain = 30;
                ethicsLoss = -30;
                result = this.executeFabricateData(params, risk, luck, focus);
                break;

            default:
                return { success: false, message: 'Unknown crime.' };
        }

        // Apply Ethics (limit to -100)
        if (result.success) {
            stats.modifyEthics(ethicsLoss);
            this.addHeat(heatGain);
            this.crimesCommitted++;
            result.heatGained = heatGain;
        } else if (result.caught) {
            // Failed and caught immediately!
            this.handleArrest();
            return { success: false, message: 'You were caught immediately! BUSTED!', caught: true };
        }

        return result;
    }

    executePumpAndDump(stockId, risk, luck, focus) {
        // Logic: Boost stock price temporarily, allowing player to sell high
        // For simplicity: The action effectively boosts the stock immediately

        const roll = Math.random() * 100;
        // Luck reduces risk. 100 Luck = -20 risk.
        // Focus reduces risk (error reduction). 100 Focus = -10 risk.
        const effectiveRisk = Math.max(5, risk - (luck * 0.2) - (focus * 0.1));

        if (roll < effectiveRisk) {
            // Failed - Investigation started
            this.triggerInvestigation();
            return { success: false, message: 'The SEC noticed suspicious activity. Investigation started!' };
        }

        // Success
        // Notify StockMarket to bump price
        if (this.gameState.stockMarket) {
            this.gameState.stockMarket?.manipulateStock(stockId, 'pump', 1.5); // 50% boost
        }

        return { success: true, message: 'You successfully hyped the stock! Price is surging!' };
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
        if (this.gameState.stockMarket) {
            this.gameState.stockMarket?.manipulateStock(stockId, 'insider_pump', 1.3);
        }

        return { success: true, message: 'Insider info acquired. The stock is guaranteed to jump.' };
    }

    executeRathole(amount, risk, luck, focus) {
        // Hide money to avoid fines/taxes? Or simply launder it?
        // Maybe "Launder Money" -> Converts "Dirty Money" (if we track it) to Clean
        // For now: Just gives a small profit (tax evasion)

        const roll = Math.random() * 100;
        const effectiveRisk = Math.max(5, risk - (luck * 0.2) - (focus * 0.1));

        if (roll < effectiveRisk) {
            this.triggerInvestigation();
            return { success: false, message: 'The IRS flagged your transaction.' };
        }

        const profit = amount * 0.2; // Saved 20% taxes basically
        this.gameState.money += profit;

        return { success: true, message: `Hidden $${amount}. Saved $${profit} in taxes.`, profit: profit };
    }

    executeFabricateData(client, risk, luck, focus) {
        const roll = Math.random() * 100;
        const effectiveRisk = Math.max(15, risk - (luck * 0.2) - (focus * 0.1));

        if (roll < effectiveRisk) {
            this.handleArrest();
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

    processHeatEvents() {
        if (this.heat > 80) {
            // High risk of audit/arrest
            if (Math.random() < 0.3) this.triggerInvestigation();
        }
    }

    triggerInvestigation() {
        if (this.isUnderInvestigation) return;
        this.isUnderInvestigation = true;
        // Notify user via toast or event
        // Logic to be handled in main game loop or here
    }

    handleArrest() {
        // Go to jail
        // This should trigger a special game state
        // For now, return a flag
    }

    toJSON() {
        return {
            heat: this.heat,
            crimesCommitted: this.crimesCommitted,
            jailTimeServed: this.jailTimeServed,
            isUnderInvestigation: this.isUnderInvestigation
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.heat = data.heat || 0;
        this.crimesCommitted = data.crimesCommitted || 0;
    }
}
