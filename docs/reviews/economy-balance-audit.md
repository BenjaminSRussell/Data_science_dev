# Game-economy balance audit (#257)

Sources:

- `EconomySystem.js` (task grading and pay), `TaskSystem.js` (task pay base), `JobSystem.js`
- `contracts/ContractSystem.js`, `ProjectSystem.js` + `ProjectDatabase.js`, `work/RealWorldTaskSystem.js`
- `data/ranks.js`, `data/shopItems.js`, `data/tycoonData.js`
- `BankSystem.js`, `LegalSystem.js`, `GameState.rent`, and the NPC dialogue payouts in `NPCManager.js`

Numbers are on main at the time of writing. "Task" means one graded
day-job chart. Its pay is:

`(100 × rank.salaryMultiplier + 20 × difficulty) × star multiplier`

- Star multipliers: 0.2 / 0.4 / 0.7 / 1.0 / 1.3 for 1-5 stars.
- Optional extras: ×1.2 for a fast finish, ×1.15 for the Negotiation perk,
  ×1.1 for the rank-6 "Premium clients" perk.

The tables below use a 4-star task at difficulty 2.

## 1. Every way to earn money, by gate

| Path | Live? | Gate | Pay | Repeatable | Reputation |
|---|---|---|---|---|---|
| Day-job task, rank 1 (Data Entry Clerk) | yes | rep 0 | **$140** (5★ fast: $218) | yes | 18 (4★) |
| Day-job task, rank 2 | yes | rep 100 | $190 | yes | 18 |
| Day-job task, rank 3 | yes | rep 300 | $240 | yes | 18 |
| Day-job task, rank 4 | yes | rep 600 | $340 | yes | 18 |
| Day-job task, rank 5 | yes | rep 1,200 | $540 | yes | 18 |
| Day-job task, rank 6 | yes | rep 2,500 | $840 (+10% premium: $924) | yes | 18 |
| Day-job task, rank 7 | yes | rep 5,000 | $1,540 | yes | 18 |
| Freelance project `crypto_scraper` | yes | none | $800 for 200 work | once | 10 |
| Freelance project `fashion_trends` | yes | rep 200 | $3,800 for 500 work | once | 20 |
| Freelance project `loan_risk_model` | yes | **none** | **$5,000** for 400 work | once | 30 |
| NPC: David Chen's pitch | yes | relationship 20 | $5,000 | once (#2886) | – |
| NPC: Vinnie's loan / job | yes | none | $1,000 / $500 | daily (#2886) | – |
| NPC: Mike's data cleaning | yes | none | $300 | daily (#2886) | – |
| Contracts (ContractSystem) | no (#1231) | rep 0 … 10,000 by category | $50 … $10,000 base (±20%) for 2-5+ days | yes | ⌊difficulty×10⌋ |
| Real-world tasks | no (#1228) | job role | $500-$800+ | yes | 10-15 |
| Savings interest | yes | any balance | **0.5% per week** | passive | – |
| Stocks | yes | none (heat when unlicensed) | market | – | – |

## 2. Outliers

1. **`loan_risk_model` is ungated and pays the most.** It pays $5,000,
   which is 36 rank-1 tasks. It needs no reputation, yet the cheaper
   `fashion_trends` asks for 200. A new player can earn three months' rent
   on day one. All three projects are one-time and total $9,600, so
   freelancing is a short burst that front-loads money at exactly the point
   where rent ($500/week) is meant to bite.
2. **Before #2886, NPC dialogue was the best "job" in the game.** Looping
   David Chen's pitch paid $5,000 a click at relationship 20. It is now once
   per save. Even once, it is the single largest early payout and is gated
   only by talking to him a few times.
3. **Reputation per task is flat while the rank thresholds grow.**
   - At 18 reputation per 4★ task: rank 2 takes about 6 tasks, rank 4 about
     33, rank 6 about 140, and rank 7 about **280**.
   - Pay per task grows 11× across the ladder, but the gap between
     promotions grows about 20×. The last two ranks drag, while ranks 1-3
     go by in an afternoon.
4. **Savings interest is a passive income source that beats work.**
   - 0.5% weekly is about 30% a year.
   - $100k in savings pays $500 a week, which covers rent forever.
   - At rank 5 that balance is about 185 tasks away, so the late game turns
     into "park money in the bank".
5. **Contract pay (if wired) is pegged to reputation, not rank.** The
   rep-5,000 category pays $5,000 base for a few days of work, about 3× a
   rank-7 task per day. Re-tune before wiring #1231.

## 3. Costs against income at the rank where they matter

| Cost | Price | Becomes relevant | Typical income there | Verdict |
|---|---|---|---|---|
| Weekly rent (`GameState.rent`) | $500/week, fixed | from day 1 | rank 1: about $140/task, so about 4 good tasks a week | tight early by design; trivial from rank 5 (one task). It never scales because housing upgrades don't exist (#969) |
| Weekly tax | 0% to $192, 10% to $962, 20% to $1,923, 30% above | from rank 2 or 3 | – | sensible brackets, but they apply to `weeklyIncome`, which before #2888 missed real-world task pay |
| Shop tools | $250-$600 | rank 1 | 2-4 tasks | cheap, but 11 of 15 tools and perks do nothing (#2010), so the price is moot |
| Shop perks (Negotiation +15% pay, $1,000; Networking +20% rep, $800) | $450-$1,500, rank-independent | rank 1-2 | 7 tasks at rank 1, under 1 task at rank 7 | **expensive early, trivial later**. Negotiation repays after about 48 tasks at rank 1 but after 4 at rank 7 |
| Software | $250-$2,500 | rank 2-4 | 1-10 tasks | reasonable |
| Licences (Series 7 $1,500, Business $2,000) | $200-$2,000 | when trading stocks / running a business | rank 3-4 | fine; the unlicensed-trade heat is the real cost |
| Lawyers | $500 / $2,500 / $10,000 | after an arrest | any | the top tier is about 7 rank-6 tasks; OK as a late money sink |
| Equipment tiers (`tycoonData.EQUIPMENT`) | $200-$2,000+ per level | – | – | only read by the unreachable OfficeManager (decision #1897), so they gate nothing |
| Loans | **10% interest per week** on total debt | emergencies (rent) | rank 1 | **unaffordable by design**. A $1,000 rent loan costs $100 a week, almost a rank-1 task, and compounds. It is a trap, not a tool |

## 4. Rebalancing: the first five changes

1. **Gate `loan_risk_model` at rep 600 (rank 4)**, or cut its reward to
   about $2,000 (down about 60%). Freelance work should top up the job, not
   replace the first month. Optionally make projects repeatable at a lower
   payout so freelancing lasts past three jobs.
2. **Cut savings interest from 0.5% to about 0.1% per week** (about 5% a
   year, down 5×). It keeps rewarding saving without becoming a rent-free
   endgame.
3. **Cut loan interest from 10% to about 2% per week** (down 5×), and
   consider a credit-score modifier. At 10% the bank is never worth using,
   so the eviction and debt pressure (#1283) has no relief valve.
4. **Scale task reputation with rank**, e.g.
   `repReward × (1 + 0.25 × rankIndex)`, which gives up to ×2.5 at rank 7.
   Alternatively lower the rank-6/7 thresholds (2,500→2,000, 5,000→3,500).
   Either evens out promotion spacing (point 2.3). Promotion pacing matters
   more than raw pay because pay already scales 11×.
5. **Price perks by rank** (`price × salaryMultiplier^0.5`), or move the
   strongest perks behind a rank requirement. That keeps them a real choice
   at every stage instead of a late-game afterthought.

Related but out of scope: rent never grows (housing #969), and most shop
items have no effect (#2010). Fixing either changes the cost side more than
any single number above.
