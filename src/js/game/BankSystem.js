/**
 * Bank System - Handles financial transactions and interest calculations
 */

/**
 * Bank class for managing player finances
 */
export class Bank {
    constructor() {
        this.savings = 0;
        this.loan = 0;
        this.loanInterestRate = 0.10;
    }

    /**
     * Process weekly interest on savings and loan
     */
    processWeeklyInterest() {
        let savingsInterest = 0;
        let loanInterest = 0;

        if (this.savings > 0) {
            savingsInterest = Math.floor(this.savings * this.loanInterestRate);
            this.savings += savingsInterest;
        }

        if (this.loan > 0) {
            loanInterest = Math.ceil(this.loan * this.loanInterestRate);
            this.loan += loanInterest;
        }

        return { savingsInterest, loanInterest };
    }

    /**
     * Deposit money into savings
     */
    deposit(amount) {
        if (amount > 0) {
            this.savings += amount;
            return true;
        }
        return false;
    }

    /**
     * Withdraw money from savings
     */
    withdraw(amount) {
        if (amount > 0 && this.savings >= amount) {
            this.savings -= amount;
            return true;
        }
        return false;
    }

    /**
     * Take out a loan
     */
    takeLoan(amount) {
        if (amount > 0) {
            this.loan += amount;
            return true;
        }
        return false;
    }

    /**
     * Repay loan
     */
    repayLoan(amount) {
        if (amount > 0 && this.loan >= amount) {
            this.loan -= amount;
            return true;
        }
        return false;
    }

    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            savings: this.savings,
            loan: this.loan,
            loanInterestRate: this.loanInterestRate
        };
    }

    /**
     * Load from saved data
     */
    fromJSON(data) {
        if (!data) return;
        this.savings = data.savings || 0;
        this.loan = data.loan || 0;
        this.loanInterestRate = data.loanInterestRate || 0.10;
    }
}