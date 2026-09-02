class BankSystem {
    constructor() {
        this.balance = 0;
        this.loan = 0;
        this.creditScore = 500; // Default credit score
    }

    deposit(amount) {
        if (amount > 0) {
            this.balance += amount;
            return { success: true, newBalance: this.balance };
        }
        return { success: false, reason: "Deposit amount must be positive" };
    }

    withdraw(amount) {
        if (amount > 0 && this.balance >= amount) {
            this.balance -= amount;
            return { success: true, newBalance: this.balance };
        }
        return { success: false, reason: "Insufficient funds or invalid amount" };
    }

    takeLoan(amount) {
        if (amount > 0 && this.calculateMaxLoan() >= amount) {
            this.loan += amount;
            this.balance += amount;
            return { success: true, newLoan: this.loan, newBalance: this.balance };
        }
        return { success: false, reason: "Amount exceeds maximum loan limit" };
    }

    repayLoan(amount) {
        if (amount > 0 && this.loan >= amount) {
            this.loan -= amount;
            this.balance -= amount;
            if (this.loan === 0) {
                this.creditScore = Math.min(this.creditScore + 25, 850); // Increase credit score on full repayment
            }
            return { success: true, remainingLoan: this.loan, newBalance: this.balance };
        }
        return { success: false, reason: "Insufficient loan amount or invalid repayment" };
    }

    calculateMaxLoan() {
        // Calculate max loan based on credit score
        return Math.floor(this.balance * 0.5 * (this.creditScore / 1000)); // Example formula
    }

    processWeeklyInterest() {
        // Process weekly interest logic
        // This is a placeholder for where we could detect unpaid loans
        if (this.loan > 0) {
            this.loan *= 1.01; // Example weekly interest rate
        }
    }

    toJSON() {
        return {
            balance: this.balance,
            loan: this.loan,
            creditScore: this.creditScore
        };
    }

    fromJSON(data) {
        if (!data) return;
        Object.assign(this, data);
    }
}