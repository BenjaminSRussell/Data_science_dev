# Should ContractSystem, ProjectSystem and RealWorldTaskSystem be one system? (#267)

Files read in full:

- `src/js/game/contracts/ContractSystem.js` (CS)
- `src/js/game/ProjectSystem.js` (PS)
- `src/js/game/work/RealWorldTaskSystem.js` (RWTS)

The three drift bugs named in the issue have all since been fixed:

- #163: PS now re-checks requirements at start.
- #164: RWTS now has a one-task-at-a-time guard.
- #165: RWTS XP now goes through `CharacterStats.addExperience`.

That makes the design question easier to see.

## Context: only one of the three is live

- **PS** is the live freelance-project loop. `ProjectHelpers` calls
  `startProject` and `workOnProject`.
- **CS** is constructed and generates offers, but `acceptContract`,
  `workOnContract` and `completeContract` have no callers (decision #1231).
- **RWTS** is constructed and saved, but no UI starts a task (decision
  #1228/#2256).
- The player's day-job work is a fourth system, `TaskSystem` with
  `EconomySystem` grading. It isn't part of this review.

## 1. Side-by-side

| | ContractSystem | ProjectSystem | RealWorldTaskSystem |
|---|---|---|---|
| Catalog | generated from category templates and refreshed (`refreshContracts`), gated by category `minReputation` | static `CONTRACTS` in `ProjectDatabase.js`, filtered by `meetsRequirements`; completed ones are not re-offered | static task types per job role (`getAvailableTasks(jobId)`), with a lab-only filter |
| Accept / start | `acceptContract(id)` re-checks reputation and stats; **several active at once** | `startProject(id)` re-checks requirements; **one active** | `startTask(task)` takes a task object; **one active**; lab check |
| Progress unit | `progress` against `timeRequired` (days of work), with `deadlineDay` on the game calendar | per-stage `stageProgress` against `maxProgress`, overflow carried; boosted by AI processing power and hardware | discrete steps (`completeStep()`) with visuals per step |
| Completion | when `progress >= timeRequired`; bonus conditions (quality, skill, reputation) plus an early bonus | after the last stage; `lastResult` is consumed by `checkProgress()` | after the last step |
| Rewards | `basePay` plus bonuses; reputation `floor(difficulty*10)`; no XP | `reward`; XP ×10 with a luck bonus via `SKILL_TO_STAT`; ethics; reputation from difficulty, minus for shady work; AI data points | money, reputation, and XP split evenly across the task's skills |
| History | `completedContracts` (full objects) | `completedProjects` (ids) + `projectHistory` counts | `taskHistory`, capped at 100 |

**Identical in spirit:** catalog → gate → accept with a re-check → track
progress → complete → grant money, reputation and XP → record history.

**Genuinely different:**

- How progress is measured: calendar days, staged work points, and discrete
  steps. Each feeds a different UI (deadline bar, stage pipeline,
  step-by-step visual).
- How many jobs can be active at once: CS allows several, which suits
  freelance contracts; the other two allow one.
- How rewards are composed: bonus conditions vs per-skill XP calibration.

## 2. Would a shared base prevent the drift?

**Partly.** The drift came from two places.

**a. Cross-cutting rules that each system re-implemented.**

- Re-validate on accept (#163).
- One-at-a-time (#164).
- Write XP through the canonical stat API (#165).
- Book pay as weekly taxable income (#1989).
- Floor reputation at 0 (#1115).

These are the same rule written three times. A shared module *does* prevent
this class of drift: the rule exists once, and a new system gets it for
free.

Reading for this review found a live example that wasn't filed:

- RWTS added task pay to `money` only, so it skipped `weeklyIncome` (untaxed)
  and `totalEarned` (the lifetime stat).
- CS and PS both book all three.

**b. The genuinely different parts** (progress model, bonus rules, catalog
source). Forcing these into one base class would recreate the same bugs
inside a bigger file: a `type` switch in `work()` and `complete()`, plus
optional fields that only one subtype uses. The `#1112`-style
"corrupt stage data" guards would spread to the others.

So a single merged system would mostly *move* the bugs. Shared *policies*
remove them.

## 3. Recommendation: keep them separate, share the policies

Keep three small lifecycle classes, and make each honour one shared
contract. This PR starts it.

1. **Reward booking: done here.** `src/js/game/work/workRewards.js`
   exports `grantWorkReward(gameState, { money, reputation })`.
   - Pay goes to money, `weeklyIncome` and `totalEarned`.
   - Reputation is floored at 0.
   - It returns what was actually applied.

   CS, PS and RWTS all use it now, which fixes the RWTS income bookkeeping.
   `test/unit/WorkRewards.shared.test.js` covers the helper and runs each
   system end to end to check it books income the same way.
2. **XP booking, next.** Add `grantWorkXp(stats, skills, amount, { scale })`
   that maps through `SKILL_TO_STAT` and calls `addExperience`. PS passes
   ×10 plus luck; RWTS passes an even split. That keeps the calibration
   difference explicit instead of hidden in two loops.
3. **Accept-time gate, next.** Add
   `meetsWorkRequirements(gameState, requirements)`, covering reputation
   (from `gameState`), stats (fail closed) and money. PS's
   `meetsRequirements` is the most careful version, so it should become the
   shared one, and CS's inline loop should call it.
4. **The written contract**, for any future work system:
   - accept re-checks the gate;
   - the concurrency limit is declared, not implied;
   - progress can't go negative or NaN;
   - complete refuses until the work is done;
   - rewards go through the shared helpers;
   - history is bounded.

What not to do: one `WorkItem` base class with `type`-switched progress.
If Ben decides to wire CS or RWTS into the UI, or to delete them (decision
issues #1231 and #1228), the shared helpers mean either choice is cheap. The
live PS keeps working unchanged.
