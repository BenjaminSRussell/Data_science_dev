class BankSystem {
    constructor(gameState) {
        this.gameState = gameState;
        if (!this.gameState.bank) {
            this.gameState.bank = {
                savings: 0
            };
        }
    }

    deposit(amount) {
        if (amount <= 0) {
            return { success: false, reason: "Amount must be greater than zero" };
        }
        if (this.gameState.money < amount) {
            return { success: false, reason: "Insufficient money to deposit" };
        }
        this.gameState.bank.savings += amount;
        this.gameState.money -= amount;
        return { success: true };
    }

    withdraw(amount) {
        if (amount <= 0) {
            return { success: false, reason: "Amount must be greater than zero" };
        }
        if (this.gameState.bank.savings < amount) {
            return { success: false, reason: "Insufficient savings to withdraw" };
        }
        this.gameState.bank.savings -= amount;
        this.gameState.money += amount;
        return { success: true };
    }
}

// Test cases
function runTests() {
    const mockGameState = { money: 100, bank: null };
    const bankSystem = new BankSystem(mockGameState);

    // Test default initialization
    console.assert(bankSystem.gameState.bank.savings === 0, "Default initialization failed");

    // Test depositing money
    console.assert(bankSystem.deposit(50).success, "Deposit should succeed");
    console.assert(mockGameState.money === 50, "Money should be deducted from gameState");
    console.assert(mockGameState.bank.savings === 50, "Savings should be added to bank");

    // Test depositing exact amount of money
    console.assert(bankSystem.deposit(50).success, "Deposit should succeed");
    console.assert(mockGameState.money === 0, "Money should be fully deducted from gameState");
    console.assert(mockGameState.bank.savings === 100, "Savings should be fully added to bank");

    // Test depositing zero money
    console.assert(!bankSystem.deposit(0).success, "Deposit should fail for zero amount");
    console.assert(mockGameState.money === 0, "Money should remain unchanged");
    console.assert(mockGameState.bank.savings === 100, "Savings should remain unchanged");

    // Test depositing negative money
    console.assert(!bankSystem.deposit(-10).success, "Deposit should fail for negative amount");
    console.assert(mockGameState.money === 0, "Money should remain unchanged");
    console.assert(mockGameState.bank.savings === 100, "Savings should remain unchanged");

    // Test depositing more than available money
    console.assert(!bankSystem.deposit(100).success, "Deposit should fail for insufficient money");
    console.assert(mockGameState.money === 0, "Money should remain unchanged");
    console.assert(mockGameState.bank.savings === 100, "Savings should remain unchanged");

    // Test withdrawing money
    console.assert(bankSystem.withdraw(50).success, "Withdraw should succeed");
    console.assert(mockGameState.money === 50, "Money should be added to gameState");
    console.assert(mockGameState.bank.savings === 50, "Savings should be deducted from bank");

    // Test withdrawing exact amount of savings
    console.assert(bankSystem.withdraw(50).success, "Withdraw should succeed");
    console.assert(mockGameState.money === 100, "Money should be fully added to gameState");
    console.assert(mockGameState.bank.savings === 0, "Savings should be fully deducted from bank");

    // Test withdrawing zero money
    console.assert(!bankSystem.withdraw(0).success, "Withdraw should fail for zero amount");
    console.assert(mockGameState.money === 100, "Money should remain unchanged");
    console.assert(mockGameState.bank.savings === 0, "Savings should remain unchanged");

    // Test withdrawing negative money
    console.assert(!bankSystem.withdraw(-10).success, "Withdraw should fail for negative amount");
    console.assert(mockGameState.money === 100, "Money should remain unchanged");
    console.assert(mockGameState.bank.savings === 0, "Savings should remain unchanged");

    // Test withdrawing more than available savings
    console.assert(!bankSystem.withdraw(100).success, "Withdraw should fail for insufficient savings");
    console.assert(mockGameState.money === 100, "Money should remain unchanged");
    console.assert(mockGameState.bank.savings === 0, "Savings should remain unchanged");

    console.log("All tests passed!");
}

// Run tests
runTests();