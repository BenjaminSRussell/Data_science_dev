/**
 * BankSystem - Handles savings, loans, and interest
 */

export class BankSystem {
    constructor(gameState) {
        this.gameState = gameState;

        // Default bank state if not exists
        if (!this.gameState.bank) {
            this.gameState.bank = {
                savings: 0,
                loan: 0,
                loanInterestRate: 0.10, // 10% weekly initial
                savingsInterestRate: 0.005, // 0.5% weekly
                creditScore: 500, // 300-850
                transactionHistory: []
            };
        }
    }

    /**
     * Deposit money into savings
     */
    deposit(amount) {
        if (amount <= 0) return { success: false, message: "Invalid amount" };
        if (this.gameState.money < amount) return { success: false, message: "Insufficient funds" };
        if (!this.gameState.bank) return { success: false, message: "Bank system not initialized" };

        this.gameState.money -= amount;
        this.gameState.bank.savings += amount;
        this.logTransaction('Deposit', amount);

        return { success: true, message: `Deposited $${amount}`, newBalance: this.gameState.bank.savings };
    }

    /**
     * Withdraw money from savings
     */
    withdraw(amount) {
        if (amount <= 0) return { success: false, message: "Invalid amount" };
        if (!this.gameState.bank) return { success: false, message: "Bank system not initialized" };
        if (this.gameState.bank.savings < amount) return { success: false, message: "Insufficient savings" };

        this.gameState.bank.savings -= amount;
        this.gameState.money += amount;
        this.logTransaction('Withdrawal', -amount);

        return { success: true, message: `Withdrew $${amount}`, newBalance: this.gameState.bank.savings };
    }

    /**
     * Take out a loan
     */
    takeLoan(amount) {
        if (!this.gameState.bank) return { success: false, message: "Bank system not initialized" };
        const maxLoan = this.calculateMaxLoan();
        if (this.gameState.bank.loan + amount > maxLoan) return { success: false, message: `Loan limit exceeded (Max: $${maxLoan})` };

        this.gameState.bank.loan += amount;
        this.gameState.money += amount;
        this.logTransaction('Loan Taken', amount);

        return { success: true, message: `Loan taken: $${amount}` };
    }

    /**
     * Repay loan
     */
    repayLoan(amount) {
        if (amount <= 0) return { success: false, message: "Invalid amount" };
        if (!this.gameState.bank) return { success: false, message: "Bank system not initialized" };
        if (this.gameState.money < amount) return { success: false, message: "Insufficient funds" };
        if (this.gameState.bank.loan <= 0) return { success: false, message: "No active loan" };

        const payment = Math.min(amount, this.gameState.bank.loan);
        this.gameState.money -= payment;
        this.gameState.bank.loan -= payment;
        this.logTransaction('Loan Repayment', -payment);

        return { success: true, message: `Repaid $${payment} of loan` };
    }

    /**
     * Calculate weekly interest
     */
    processWeeklyInterest() {
        const results = {
            savingsInterest: 0,
            loanInterest: 0
        };

        if (!this.gameState.bank) return results;

        // Savings interest
        if (this.gameState.bank.savings > 0) {
            results.savingsInterest = Math.floor(this.gameState.bank.savings * this.gameState.bank.savingsInterestRate);
            this.gameState.bank.savings += results.savingsInterest;
        }

        // Loan interest
        if (this.gameState.bank.loan > 0) {
            results.loanInterest = Math.ceil(this.gameState.bank.loan * this.gameState.bank.loanInterestRate);
            this.gameState.bank.loan += results.loanInterest;
        }

        return results;
    }

    /**
     * Calculate max loan based on reputation and credit score
     */
    calculateMaxLoan() {
        if (!this.gameState.bank) return 0;
        
        // Base $1000 + $100 per reputation point
        const reputation = this.gameState.reputation || 0;
        let limit = 1000 + (reputation * 100);

        // Multiplier based on credit score (simplified)
        const creditMultiplier = this.gameState.bank.creditScore / 500;

        return Math.floor(limit * creditMultiplier);
    }

    logTransaction(type, amount) {
        if (!this.gameState.bank) return;
        if (!this.gameState.bank.transactionHistory) {
            this.gameState.bank.transactionHistory = [];
        }
        
        this.gameState.bank.transactionHistory.unshift({
            date: new Date().toISOString(), // In-game date would be better if passed, using real time for now unique ID
            type,
            amount,
            balance: this.gameState.bank.savings
        });

        // Keep history short
        if (this.gameState.bank.transactionHistory.length > 20) {
            this.gameState.bank.transactionHistory.pop();
        }
    }
}
