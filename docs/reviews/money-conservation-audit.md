# Money conservation audit: EconomySystem, BankSystem, StockMarket

Scope: `src/js/game/EconomySystem.js`, `src/js/game/BankSystem.js`, `src/js/game/StockMarket.js` (including `Portfolio`), plus the `main.js` call sites that apply their results. This covers issue #254. `gameState.money` is a plain numeric field on `GameState` (`GameState.js:49`) with no setter or clamp, so every path below writes it directly.

## 1. Inventory

| File | Method | What moves | From → to | Type |
|---|---|---|---|---|
| BankSystem | `deposit(amount)` | `amount` | money → bank.savings | transfer |
| BankSystem | `withdraw(amount)` | `amount` | bank.savings → money | transfer |
| BankSystem | `takeLoan(amount)` | `amount` | (new debt) bank.loan += amount, money += amount | transfer (asset and liability created together) |
| BankSystem | `repayLoan(amount)` | `min(amount, loan)` | money → bank.loan (reduces debt) | transfer |
| BankSystem | `processWeeklyInterest()` | savings × rate, loan × rate | created into savings / added to loan | income / expense |
| EconomySystem | `evaluateChart()` → `calculateMoneyReward()` | task pay | (world) → money, applied in `main.js applyTaskRewards` | income |
| EconomySystem | `processDailyFinances()` | food + utilities + transport | money → (world) | expense |
| StockMarket | `buyStock(id, qty)` | `price × qty` | money → portfolio holdings (at market price) | transfer |
| StockMarket | `sellStock(id, qty)` | `qty × price` | portfolio holdings → money | transfer |
| main.js (daily) | staff salaries | Σ staff.salary | money → (world) | expense |
| main.js (weekly) | rent | rent − roommate share | money → (world) | expense |

## 2. Are the transfers zero-sum?

- **deposit / withdraw.** Zero-sum on every path. Each guard (`Number.isFinite`, `> 0`, sufficient balance, bank initialised) returns before either side is touched, and on success both sides change by the same `amount`. One gap: `deposit` checks `money < amount` *before* checking that `bank` exists. Both checks are pure reads, though, so a rejection still leaves both sides untouched.
- **takeLoan.** Zero-sum: money and debt rise together, and the limit check (`getAvailableCredit`) runs before either is written.
- **repayLoan.** Zero-sum. `payment = min(amount, loan)` is moved from money to the loan, so overpaying can't destroy money (#1382), and the affordability check uses `payment`, not `amount`.
- **buyStock / sellStock.** Zero-sum at the trade price. `buyStock` debits `price × qty` and `Portfolio.buy` records the same cost basis; `sellStock` credits exactly what `Portfolio.sell` returns (`qty × price`), and `Portfolio.sell` returns 0 on any rejection, so a rejected sale credits nothing. Every rejection path (invalid quantity, licence, unknown stock, insufficient funds/shares) returns before touching money or holdings.
  - **Drift risk:** `Stock.price` is an unrounded float (`price * (1 + changePct)`, `StockMarket.js:84`), so `price × qty` routinely has sub-cent float tails, and `gameState.money` stops being an integer after the first trade. Value isn't created or destroyed (buy and sell at the same price cancel), but money picks up float noise like `1234.5600000000002`, which then flows into every `money >= cost` comparison and the UI. **Fixed in this PR:** both trade amounts are rounded to cents (`StockMarket.toCents`), so a trade moves an exact cent amount.
- **Unchecked case.** If `Portfolio.buy` ever returned `false` after the money was debited, money would be destroyed. Today that can't happen, because `buyStock` validates the quantity and `price > 0` (prices are floored at 0.01) before debiting, but the return value isn't checked. It's worth making `buyStock` debit only after `portfolio.buy(...)` succeeds.

## 3. Can money go negative?

Yes, and only through the expense paths: `processDailyFinances`, staff salaries and weekly rent all subtract without a floor. None of the transfer paths can push money negative, because each checks the balance first.

It looks intentional: `main.js` toasts "Warning: You are in debt!" when money < 0 after the daily tick, and "CRITICAL: Eviction imminent!" below −1000 on the weekly tick. `NarrativeClaritySystem` switches motivation to `'survival'` for negative money. Gating checks (`GameState.canAfford`, the bank and stock guards) all compare `money >= cost`, so a negative balance simply blocks purchases. The only gap is that "eviction" has no consequence beyond the toast; that's tracked separately as #1283.

## 4. Top recommended fixes (by likelihood in normal play)

1. **Round stock trade amounts to cents.** Hit on the first trade by anyone who uses the market. *Done here* (`StockMarket.toCents`; test in `test/unit/StockMarket.cents.test.js`).
2. **Debit after a successful `portfolio.buy()` in `buyStock`.** Not reachable today, but it's the one transfer whose second half isn't confirmed before the first half commits. A refactor of `Portfolio.buy`'s validation would expose it silently.
3. **Give negative balances a consequence, or a floor (#1283).** Daily expenses run every day whether or not the player works, so negative money is the common state for an idle player. The design already treats it as "debt", but nothing escalates it, so the warning toasts are the only feedback.
