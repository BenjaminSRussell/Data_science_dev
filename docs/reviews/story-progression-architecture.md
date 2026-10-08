# Story progression architecture review (#515)

QA reported a `ReferenceError` "sometime after a player's first major
decision". The reporter suspected the `switch` in
`StoryBeatsSystem.checkBeatTrigger()`. This review checks that suspicion
against the code that runs each tick:

- `storylineManager.triggerDecisionIfAvailable()`, every frame, behind a 30 s cooldown.
- `storyBeatsSystem.checkForTriggeredBeats()`, every 10 s and after weekly rent.
- `storylineManager.checkPhaseTransition()`, after weekly rent, at the end of
  `handleStoryBeat`, and inside `processDecision`.

## 1. Where the crash lived

**The StoryBeatsSystem hunch is wrong.** The `checkBeatTrigger` switch did
declare ten `const`s directly in its `case` clauses: `taskCount`,
`currentRank`, `npcManager`, `metCount`, `storylineManager`, `decisions`,
`phaseDecisions`, `characterStats`, `ethics` and `timeMgr`. They all shared
one scope covering the whole switch. That is a real hazard: reading one of
them from another case before its declaration runs throws a TDZ
`ReferenceError`. But every binding was only read inside its own case, so no
path through the switch could throw. ESLint did flag it
(`no-case-declarations`), only as a warning.

**The real defect was in `StorylineManager.checkPhaseTransition()`** (filed
as #4, fixed in ed1b3477 / #2721). The endgame `sell_company` block had
ended up after the `if (newPhase !== this.storylinePhase) { ... return }`
branch. So when the act *did not* change (almost every call), it ran
`if (phase === 'endgame')` and `decisions.push(...)`. Neither `phase` nor
`decisions` exists in that method; they are locals of
`getAvailableDecisions()`, where the block came from. The result was
`ReferenceError: phase is not defined`.

Why it showed up "after the first major decision":
`StoryUI.handleDecisionChoice()` → `processDecision()` → `checkPhaseTransition()`.
The first decision is the first time a player-driven path calls
`checkPhaseTransition()`. Before that, only weekly rent and
`handleStoryBeat` call it.

## 2. What broke as a result

The throw happened at the end of `processDecision()`, after it had already:

1. applied the consequences (money, ethics, reputation, firing, arrest), and
2. pushed the record into `majorDecisions`.

So the decision *happened*, but `processDecision` never returned:

- `StoryUI.handleDecisionChoice` threw before `npcMemorySystem.recordDecision`
  and `characterArcSystem.updateCurrentState`.
- The result and `storyImpact` toasts never showed.
- The modal-close and refresh code after it never ran.

The player paid the cost and got no feedback. NPC memory and the character
arc stayed out of step with the decision.

Other callers:

| Caller | Behaviour |
| --- | --- |
| weekly rent (`main.js`) | throws before `checkForTriggeredBeats()`, so weekly beats (rent, money, reputation, ethics, days) never fired |
| end of `handleStoryBeat` | throws after the beat was shown; the error escapes to the game-loop `try/catch` (#1656) and is logged, so the game keeps running quietly |
| `processDecision` | throws to `StoryUI` as described above |

Unreachable content: **`sell_company` (endgame) could never be offered.** It
lived inside `checkPhaseTransition` and threw before reaching anything, and
`getAvailableDecisions()` had no endgame branch.

The neighbouring bug (#1102 / #2394) is the other half of the blast radius.
`getDecision()` searched only the *currently available* list, which drops
decisions already made. So a made decision could never be looked up again.
Nothing threw; code just got `undefined` and quietly gave wrong results:

- the `major_decision` story beats (`major_decision_mid`, `major_decision_late`) never matched;
- the journal and StoryUI decision history were blank or generic;
- news tied to decisions never resolved.

To sum up: **the ReferenceError threw in `checkPhaseTransition`, and the
`getDecision` lookups failed silently.** #2757 changed `getDecision` to use
`getAvailableDecisions({ includeAll: true })`, and #2266 records the act on
each decision.

## 3. Is the two-way coupling fragile?

Yes. Both bugs come from the same design rather than from two unrelated
typos:

- `getAvailableDecisions()` is the catalog *and* the availability filter. It
  rebuilds every decision object on each call, and the result depends on the
  current act, ethics and the decisions already made.
- `StoryBeatsSystem` worked out "was a decision made in act X?" itself. Per
  beat check it read `storylineManager.majorDecisions` and then called
  `getDecision()` for each record, which rebuilds the whole catalog each
  time.
- The meaning of `getDecision()` changed (available-only, then the full
  catalog), and that silently changed what the beat system saw.
- `criminal_opportunity` has `phase: phase`, i.e. whatever act is current.
  So for an old save whose record lacks an act, the full-catalog lookup
  reported the decision as made in *the current act*. That is a wrong answer,
  not an error.
- The #4 ReferenceError happened because decision-building code was
  cut and pasted between two methods. It depended on that method's locals
  (`phase`, `decisions`), and nothing (lint or tests) caught it once moved.

## 4. Structural change in this PR

1. **One owner for the question.** `decisionMadeInPhase(manager, phase)` is
   exported from `StorylineManager.js` and exposed as
   `StorylineManager.hasDecisionInPhase(phase)`.
   - It uses the act recorded on the decision.
   - For old saves it falls back to the catalog's fixed act.
   - `StoryBeatsSystem`'s `major_decision` case now just asks it. With no
     decisions made, there are no catalog rebuilds per check.
2. **The catalog no longer makes up an act.** In the full-catalog view,
   `criminal_opportunity` has no fixed act, so an old record of it can't
   claim the current one. `processDecision` still records the act the player
   was in.
3. **Block-scoped cases.** Every `case` in `checkBeatTrigger` that declares a
   binding has its own `{ }`, as does the one in
   `EmotionalBreakdownSystem`. No case binding is shared across the switch
   any more.
4. **Lint is now enforced in CI.**
   - `eslint.config.js` makes `no-undef` and `no-case-declarations` *errors*
     for game code under `src/`.
   - `build.yml` runs `npm run lint` before the build.
   - The #4 bug (undeclared `phase`/`decisions`) would now fail CI. The only
     other `no-undef` hit, Logger's build-time `process.env.NODE_ENV`, is
     declared with `/* global process */`.
5. **Tests.** `test/unit/StoryProgression.issue515.test.js` covers:
   - `checkPhaseTransition` never throws in any act;
   - the first decision returns its result and meets an early
     `major_decision` trigger;
   - `triggerDecisionIfAvailable`, `checkForTriggeredBeats` and
     `checkPhaseTransition` run cleanly after a decision;
   - `sell_company` is reachable in the endgame;
   - the beat system asks `hasDecisionInPhase`;
   - an old-save `criminal_opportunity` record does not claim the current act.

A natural next step, which this PR does not take, is to move the decision
definitions into a static catalog in `src/js/data/` keyed by id. Each entry
would have an `isAvailable(state)` predicate, and `getAvailableDecisions()`
would become `catalog.filter(isAvailable)`. Then `getDecision()` is a map
lookup that can't change meaning, and decision objects stop being rebuilt
on each call.
