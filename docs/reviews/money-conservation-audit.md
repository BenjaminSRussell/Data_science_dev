# Money Conservation Audit Report

## Inventory Table of Money Mutating Methods

| File                   | Method                        | What It Moves                   | From Where to Where                       |
|------------------------|-------------------------------|-------------------------------|-------------------------------------------|
| EconomySystem.js       | applySalary                   | `gameState.money`               | Salary from employer to player            |
| EconomySystem.js       | applyBonus                    | `gameState.money`               | Bonus from employer to player             |
| BankSystem.js          | deposit                       | `bank.savings`                  | Player to bank                            |
| BankSystem.js          | withdraw                      | `bank.savings`                  | Bank to player                            |
| BankSystem.js          | takeLoan                      | `bank.loan`                     | Bank to player                            |
| BankSystem.js          | repayLoan                     | `bank.savings` to `bank.loan`   | Player to bank                            |
| StockMarket.js         | buyStock                      | `gameState.money` to `stocks`   | Player to stocks                          |
| StockMarket.js         | sellStock                     | `stocks` to `gameState.money`   | Stocks to player                          |
| Portfolio.js           | transferToBank                | `portfolio` to `bank.savings`   | Portfolio to bank                         |
| Portfolio.js           | transferFromBank              | `bank.savings` to `portfolio`   | Bank to portfolio                         |

## Zero-Sum Check for Transfer-Type Operations

1. **BankSystem.js deposit and withdraw:**
   - **deposit:** Player to bank
     - Zero-sum: Yes
     - Scenario: If deposit fails due to bank being full, no money is added to `bank.savings`.
   - **withdraw:** Bank to player
     - Zero-sum: Yes
     - Scenario: If withdrawal fails due to insufficient funds, no money is subtracted from `bank.savings`.

2. **BankSystem.js takeLoan and repayLoan:**
   - **takeLoan:** Bank to player
     - Zero-sum: Yes
     - Scenario: If loan fails due to insufficient credit, no money is added to `bank.loan`.
   - **repayLoan:** Player to bank
     - Zero-sum: Yes
     - Scenario: If repayment fails due to insufficient funds, no money is subtracted from `bank.savings`.

3. **StockMarket.js buyStock and sellStock:**
   - **buyStock:** Player to stocks
     - Zero-sum: Yes
     - Scenario: If buy fails due to insufficient funds, no money is deducted from `gameState.money`.
   - **sellStock:** Stocks to player
     - Zero-sum: Yes
     - Scenario: If sell fails due to insufficient stocks, no money is added to `gameState.money`.

4. **Portfolio.js transferToBank and transferFromBank:**
   - **transferToBank:** Portfolio to bank
     - Zero-sum: Yes
     - Scenario: If transfer fails due to insufficient funds, no money is deducted from `portfolio`.
   - **transferFromBank:** Bank to portfolio
     - Zero-sum: Yes
     - Scenario: If transfer fails due to insufficient funds, no money is added to `portfolio`.

## Negative Money Check

1. **EconomySystem.js applySalary and applyBonus:**
   - **applySalary:** Salary from employer to player
     - Negative money: No
   - **applyBonus:** Bonus from employer to player
     - Negative money: No

2. **BankSystem.js deposit and withdraw:**
   - **deposit:** Player to bank
     - Negative money: No
   - **withdraw:** Bank to player
     - Negative money: No

3. **BankSystem.js takeLoan and repayLoan:**
   - **takeLoan:** Bank to player
     - Negative money: No
   - **repayLoan:** Player to bank
     - Negative money: No

4. **StockMarket.js buyStock and sellStock:**
   - **buyStock:** Player to stocks
     - Negative money: No
   - **sellStock:** Stocks to player
     - Negative money: No

5. **Portfolio.js transferToBank and transferFromBank:**
   - **transferToBank:** Portfolio to bank
     - Negative money: No
   - **transferFromBank:** Bank to portfolio
     - Negative money: No

## Top 3 Recommended Fixes

1. **Ensure all transfer operations handle error scenarios correctly:**
   - All transfer operations should ensure that both sides of the transfer are left untouched in case of failure. This is already addressed in the zero-sum check.

2. **Add validation checks for negative money in critical operations:**
   - Add checks to prevent `gameState.money` from going negative in operations like `applySalary`, `applyBonus`, `deposit`, and `withdraw`. This can be done by adding assertions or checks before modifying `gameState.money`.

3. **Implement a rollback mechanism for complex transactions:**
   - For operations involving multiple steps (like transferring funds between different accounts or selling stocks), implement a rollback mechanism to revert all changes if any step fails. This can help maintain money conservation even in complex scenarios.