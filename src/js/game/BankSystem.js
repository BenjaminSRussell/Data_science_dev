/**
 * BankSystem - Handles savings, loans, and interest
 */

export const CREDIT_SCORE_MIN = 300;
export const CREDIT_SCORE_MAX = 850;
export const DEFAULT_CREDIT_SCORE = 500;
// A loan with no repayment for this many consecutive weeks is in default (#247)
export const DEFAULT_AFTER_WEEKS = 4;

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
        if (!Number.isFinite(amount) || amount <= 0) return { success: false, message: "Invalid amount" };
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
        if (!Number.isFinite(amount) || amount <= 0) return { success: false, message: "Invalid amount" };
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
        if (!Number.isFinite(amount) || amount <= 0) return { success: false, message: "Invalid amount" };
        if (!this.gameState.bank) return { success: false, message: "Bank system not initialized" };
        // The limit caps total debt, not each individual loan (#938, #1693)
        const available = this.getAvailableCredit();
        if (amount > available) {
            return { success: false, message: `Loan limit exceeded (you can borrow up to $${available.toLocaleString()} more)` };
        }

        this.gameState.bank.loan += amount;
        this.gameState.money += amount;
        this.logTransaction('Loan Taken', amount);

        return { success: true, message: `Loan taken: $${amount}` };
    }

    /**
     * Repay loan
     */
    repayLoan(amount) {
        if (!Number.isFinite(amount) || amount <= 0) return { success: false, message: "Invalid amount" };
        if (!this.gameState.bank) return { success: false, message: "Bank system not initialized" };
        if (this.gameState.bank.loan <= 0) return { success: false, message: "No active loan" };

        // Only the amount actually owed has to be affordable (#1382)
        const payment = Math.min(amount, this.gameState.bank.loan);
        if (this.gameState.money < payment) return { success: false, message: "Insufficient funds" };

        this.gameState.money -= payment;
        this.gameState.bank.loan -= payment;
        this.gameState.bank.repaidThisWeek = true;
        this.gameState.bank.missedWeeks = 0;
        this.logTransaction('Loan Repayment', -payment);

        // Repaying builds credit; paying the loan off builds more (#243, #1690)
        let creditGain = 5;
        let message = `Repaid $${payment} of loan`;
        if (this.gameState.bank.loan <= 0) {
            this.gameState.bank.loan = 0;
            this.gameState.bank.defaulted = false;
            creditGain = 25;
            message = `Loan paid off! ($${payment})`;
        }
        this.adjustCreditScore(creditGain);

        return { success: true, message, creditScore: this.gameState.bank.creditScore };
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

        const bank = this.gameState.bank;

        // Same rounding both ways, so tiny balances don't get a forced $1
        // floor on loans and $0 on savings (#1692)
        if (bank.savings > 0) {
            results.savingsInterest = Math.round(bank.savings * bank.savingsInterestRate);
            bank.savings += results.savingsInterest;
            if (results.savingsInterest > 0) this.logTransaction('Savings Interest', results.savingsInterest);
        }

        if (bank.loan > 0) {
            results.loanInterest = Math.round(bank.loan * bank.loanInterestRate);
            bank.loan += results.loanInterest;
            // Interest is now visible in the history (#1380)
            if (results.loanInterest > 0) this.logTransaction('Loan Interest', results.loanInterest);

            // Missed weeks hurt credit; a long run without paying is a default (#247, #1690)
            if (bank.repaidThisWeek) {
                bank.missedWeeks = 0;
            } else {
                bank.missedWeeks = (bank.missedWeeks || 0) + 1;
                this.adjustCreditScore(-10);
                results.missedWeeks = bank.missedWeeks;
                if (bank.missedWeeks >= DEFAULT_AFTER_WEEKS && !bank.defaulted) {
                    bank.defaulted = true;
                    this.adjustCreditScore(-100);
                    this.gameState.reputation = Math.max(0, (this.gameState.reputation || 0) - 20);
                    this.logTransaction('Loan Default', 0);
                    results.defaulted = true;
                }
            }
        } else {
            bank.missedWeeks = 0;
        }
        bank.repaidThisWeek = false;

        // Interest can push debt past the borrowing limit; the player is then
        // simply over-limit and can't borrow more until it's paid down (#1693)
        results.overLimit = bank.loan > this.calculateMaxLoan();

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

        // Multiplier based on credit score; a missing/corrupt score falls back
        // to the default instead of producing NaN (#1379)
        const score = Number(this.gameState.bank.creditScore);
        const creditScore = Number.isFinite(score) ? score : DEFAULT_CREDIT_SCORE;
        const creditMultiplier = creditScore / DEFAULT_CREDIT_SCORE;

        return Math.max(0, Math.floor(limit * creditMultiplier));
    }

    /**
     * How much more the player can borrow right now (limit minus current debt)
     */
    getAvailableCredit() {
        if (!this.gameState.bank) return 0;
        return Math.max(0, this.calculateMaxLoan() - (this.gameState.bank.loan || 0));
    }

    /**
     * Change the credit score, clamped to 300-850 (#243, #1690)
     */
    adjustCreditScore(delta) {
        const bank = this.gameState.bank;
        if (!bank) return 0;
        const current = Number.isFinite(Number(bank.creditScore)) ? Number(bank.creditScore) : DEFAULT_CREDIT_SCORE;
        bank.creditScore = Math.max(CREDIT_SCORE_MIN, Math.min(CREDIT_SCORE_MAX, current + delta));
        return bank.creditScore;
    }

    logTransaction(type, amount) {
        if (!this.gameState.bank) return;
        if (!this.gameState.bank.transactionHistory) {
            this.gameState.bank.transactionHistory = [];
        }
        
        const isLoanTransaction = type.startsWith('Loan');
        this.gameState.bank.transactionHistory.unshift({
            date: new Date().toISOString(),
            day: this.gameState.timeManager?.totalDays || null,
            type,
            amount,
            balance: isLoanTransaction ? this.gameState.bank.loan : this.gameState.bank.savings,
            savingsBalance: this.gameState.bank.savings,
            loanBalance: this.gameState.bank.loan
        });

        // Keep history short
        if (this.gameState.bank.transactionHistory.length > 20) {
            this.gameState.bank.transactionHistory.pop();
        }
    }
}
