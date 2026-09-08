/**
 * Legal System - Handles all legal matters within the game
 */

export class LegalSystem {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Hire a lawyer
     * @param {string} tier - The tier of the lawyer ('cheap', 'average', 'expensive')
     * @returns {object} - Result object with success status and message
     */
    hireLawyer(tier) {
        const costs = { 'cheap': 500, 'average': 2500, 'expensive': 10000 };
        
        // Validate tier
        if (!costs.hasOwnProperty(tier)) return { success: false, message: "Invalid lawyer tier." };

        if (this.gameState.money < costs[tier]) return { success: false, message: "Cannot afford retainer." };
        this.gameState.money -= costs[tier];

        // Increase reputation for hiring a lawyer
        this.gameState.reputation += 5;

        return { success: true, message: `Hired a ${tier} lawyer for $${costs[tier]}` };
    }

    /**
     * Handle a lawsuit
     * @returns {object} - Result object with success status and message
     */
    handleLawsuit() {
        // Simulate a lawsuit with a 50% chance of winning
        const winChance = 0.5;
        const outcome = Math.random() < winChance;

        if (outcome) {
            this.gameState.reputation += 10;
            return { success: true, message: "Lawsuit won! Reputation increased." };
        } else {
            this.gameState.reputation -= 5;
            this.gameState.money -= 1000; // Fined $1000
            return { success: false, message: "Lawsuit lost! Reputation decreased and fined $1000." };
        }
    }

    /**
     * Pay off fines
     * @param {number} amount - The amount to pay off
     * @returns {object} - Result object with success status and message
     */
    payFines(amount) {
        if (!this.gameState) return { success: false, message: "Game not initialized" };
        if (this.gameState.money < amount) return { success: false, message: "Insufficient funds" };
        if (this.gameState.fines <= 0) return { success: false, message: "No active fines" };

        const payment = Math.min(amount, this.gameState.fines);
        this.gameState.money -= payment;
        this.gameState.fines -= payment;

        return { success: true, message: `Paid $${payment} of fines` };
    }
}