/**
 * BankSystem.js
 * Manages the player's bank interactions, including loans.
 */

export class BankSystem {
    constructor(gameState) {
        this.gameState = gameState;

        // Bank State
        this.loan = 0;
        this.interestRate = 0.05; // 5% interest per loan cycle
    }

    /**
     * Calculate the maximum loan amount based on reputation and credit score
     */
    calculateMaxLoan() {
        const baseLoan = 1000;
        const reputationBonus = this.gameState.getReputation() * 100;
        const totalLoan = baseLoan + reputationBonus;
        const creditScoreFactor = this.gameState.getReputation() > 0 ? this.gameState.getReputation() / 500 : 1;
        return Math.floor(totalLoan * creditScoreFactor);
    }

    /**
     * Take a loan from the bank
     * @param {number} amount - The amount to loan
     * @returns {boolean} - Success status
     */
    takeLoan(amount) {
        const maxLoan = this.calculateMaxLoan();
        if (amount > maxLoan) {
            console.log("Loan request exceeds maximum allowed.");
            return false;
        }
        this.loan = amount;
        this.gameState.addMoney(amount);
        console.log(`Loan of ${amount} taken successfully.`);
        return true;
    }

    /**
     * Repay a loan to the bank
     * @param {number} amount - The amount to repay
     * @returns {boolean} - Success status
     */
    repayLoan(amount) {
        if (this.loan === 0) {
            console.log("No active loan to repay.");
            return false;
        }
        const repayableAmount = Math.min(amount, this.loan);
        this.gameState.addMoney(-repayableAmount);
        this.loan -= repayableAmount;
        if (this.loan === 0) {
            console.log("Loan repaid in full.");
        } else {
            console.log(`Partially repaid loan. Remaining loan: ${this.loan}.`);
        }
        return true;
    }

    toJSON() {
        return {
            loan: this.loan,
            interestRate: this.interestRate
        };
    }

    fromJSON(data) {
        if (!data) return;
        Object.assign(this, data);
    }
}