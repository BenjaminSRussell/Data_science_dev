/**
 * BankSystem.js
 * Manages bank accounts, savings, loans, and interest.
 */
export class BankSystem {
    constructor(gameState) {
        this.gameState = gameState;

        this.accounts = {
            checking: { balance: 0 },
            savings: { balance: 0 },
            loan: { principal: 0, interestRate: 0.05, outstanding: 0, weeksOutstanding: 0 }
        };

        this.interestMultiplier = 1.02; // Default 2% weekly interest for savings
    }

    /**
     * Deposit money into a specified account.
     */
    deposit(accountId, amount) {
        if (!this.accounts[accountId]) return { success: false, message: "Invalid account." };
        if (amount <= 0) return { success: false, message: "Deposit amount must be positive." };

        this.accounts[accountId].balance += amount;

        return { success: true, message: `Deposited $${amount} into ${accountId} account.` };
    }

    /**
     * Withdraw money from a specified account.
     */
    withdraw(accountId, amount) {
        if (!this.accounts[accountId]) return { success: false, message: "Invalid account." };
        if (amount <= 0) return { success: false, message: "Withdrawal amount must be positive." };
        if (this.accounts[accountId].balance < amount) return { success: false, message: "Insufficient funds." };

        this.accounts[accountId].balance -= amount;

        return { success: true, message: `Withdrew $${amount} from ${accountId} account.` };
    }

    /**
     * Apply weekly interest to savings account.
     */
    processWeeklyInterest() {
        const interest = this.accounts.savings.balance * this.interestMultiplier;
        this.accounts.savings.balance += interest;

        this.processLoanInterest();
    }

    /**
     * Apply interest to loan.
     */
    processLoanInterest() {
        const interest = this.accounts.loan.outstanding * this.accounts.loan.interestRate;
        this.accounts.loan.outstanding += Math.ceil(interest);

        this.checkLoanConsequences();
    }

    /**
     * Check for loan consequences.
     */
    checkLoanConsequences() {
        const outstanding = this.accounts.loan.outstanding;
        const threshold = this.accounts.loan.principal;
        const weeksOutstanding = this.accounts.loan.weeksOutstanding;

        if (outstanding > 0 && weeksOutstanding >= 10) {
            // Apply consequence: reputation penalty
            this.gameState.reputation -= 10;
            this.accounts.loan.weeksOutstanding = 0; // Reset after applying consequence
        } else if (outstanding > 0) {
            this.accounts.loan.weeksOutstanding += 1;
        } else {
            this.accounts.loan.weeksOutstanding = 0; // Reset if loan is paid off
        }
    }

    /**
     * Take out a loan.
     */
    loan(amount, interestRate) {
        if (this.accounts.loan.outstanding > 0) return { success: false, message: "You already have an outstanding loan." };
        if (amount <= 0) return { success: false, message: "Loan amount must be positive." };
        if (interestRate <= 0) return { success: false, message: "Interest rate must be positive." };

        this.accounts.loan.principal = amount;
        this.accounts.loan.interestRate = interestRate;
        this.accounts.loan.outstanding = amount;

        return { success: true, message: `Loan of $${amount} taken out with ${interestRate * 100}% interest rate.` };
    }

    /**
     * Pay off the loan.
     */
    payOffLoan(amount) {
        if (amount <= 0) return { success: false, message: "Payment amount must be positive." };
        if (this.accounts.loan.outstanding < amount) return { success: false, message: "Payment exceeds outstanding amount." };

        this.accounts.loan.outstanding -= amount;

        return { success: true, message: `Paid off $${amount} of the loan.` };
    }

    /**
     * Serialization
     */
    toJSON() {
        return {
            accounts: this.accounts,
            interestMultiplier: this.interestMultiplier
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.accounts = data.accounts || this.accounts;
        this.interestMultiplier = data.interestMultiplier || this.interestMultiplier;
    }
}