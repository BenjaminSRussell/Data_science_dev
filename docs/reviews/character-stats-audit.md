# Character stats audit (#268)

`src/js/game/CharacterStats.js` is the canonical store. Stat levels live in `characterStats.stats[id]`, progress in `characterStats.xp[id]`, alignment in `characterStats.ethics` (−100…+100). The public mutation API is:

- `addExperience(statId, amount)`: ignores unknown ids and non-positive or NaN amounts, levels up while XP ≥ the next threshold, and caps at `STATS[id].maxLevel`.
- `train(activityId)`: applies a `TRAINING_ACTIVITIES` entry through `addExperience` and returns the level-ups.
- `modifyEthics(amount)`: clamps to ±100.
- `fromJSON(data)`: restores saved values.

## 1. Inventory of every stat mutation outside CharacterStats.js

| Call site | Function | What it changes | Path | Canonical? |
|---|---|---|---|---|
| `main.js` | `handleTraining(activityId)` | training XP | `characterStats.train()` | ✔ |
| `ui/DialogueUI.js` | `applyEffects(effects)` | level-up effects, per-stat XP, `xpAmount`, ethics | `addExperience`, `modifyEthics` | ✔ |
| `ui/LocationView.js` | `applyFeatureResult(res)` | skill XP from feature actions | `addExperience` | ✔ (LocationView itself is unreachable, #2201) |
| `game/IDESystem.js` | `submitCode(code)` | per-skill XP | `addExperience` | ✔ (IDE unreachable, #1391) |
| `game/work/RealWorldTaskSystem.js` | `completeTask()` | task XP per stat | `addExperience` | ✔ |
| `game/NewsManager.js` | `applyEventEffects(event)` | news-event XP | `addExperience` | ✔ |
| `game/research/ResearchPaperNotificationSystem.js` | paper read reward | intelligence XP | `addExperience` | ✔ |
| `game/EducationSystem.js` | `completeCourse()`, exam reward | course XP | `addExperience` | ✔ |
| `game/ProjectSystem.js` | `completeProject()` | skill XP mapped by `SKILL_TO_STAT`, project ethics | `addExperience`, `modifyEthics` | ✔ (the older `gameState.stats` path was removed earlier) |
| `game/CrimeSystem.js` | crime outcome | ethics loss | `modifyEthics` | ✔ |
| `game/StorylineManager.js` | `applyConsequences()` | story ethics | `modifyEthics` | ✔ |
| `helpers/StockMarketHelpers.js` | `handleBribeGuard(game)` | −10 ethics | `modifyEthics` | ✔ |
| `dev/DevMenu.js` | `maxStats()` | sets every stat to its cap, zeroes XP | direct write to `cs.stats`/`cs.xp` | ✖ intentional dev cheat, documented in place |
| `game/ai/AITrainingStoryline.js` | `learnFromModel(projectId)` | +50 per learned skill | **direct write to `gameState.stats[skill]`** | ✖ **divergent; fixed here** |

The rest only read stats (`getStat`, `.stats[...]`, `.ethics`): VisualProgressionSystem (switched to CharacterStats by #2082), NarrativeClaritySystem, GameEndingSystem, ActTransitionScreen, CharacterArcSystem (describes ethics changes it's handed), and the UI.

## 2. Divergent paths and their real effect

- **`AITrainingStoryline.learnFromModel`** (the only divergent production path left). `gameState.stats` doesn't exist on `GameState`, so `this.gameState.stats[skill]` threw a `TypeError` the first time it ran. The method is in the storyline API that nothing calls yet (#1263), which is why it never surfaced. Even if `stats` had existed, the skills it wrote (`deep_learning`, `neural_networks`, `distributed_training`) aren't `STATS` ids, so the XP would never have reached a level, a gate or the UI. **Fix:** those skills are mapped in `ProjectSystem.SKILL_TO_STAT` (→ intelligence, intelligence, focus), and the method calls `characterStats.addExperience(statId, AITrainingStoryline.LEARN_XP_PER_SKILL)`. Test: `test/unit/AITrainingStoryline.learnXp.test.js`.
- **`DevMenu.maxStats`** writes `stats`/`xp` directly on purpose, to skip the level-up loop. It's dev-only and leaves CharacterStats in a valid state (levels ≤ cap, XP 0), so no change.
- The previously known divergence (ProjectSystem's separate stat bucket) is already fixed: it uses `addExperience` with `SKILL_TO_STAT`.

## 3. Preventing this drift

- **Make the wrong thing fail fast instead of silently.** The divergent write targeted a field that doesn't exist (`gameState.stats`). Defining `GameState.stats` as a getter that throws (or warns in dev) "use characterStats.addExperience()" would turn the next copy-pasted `gameState.stats[...] +=` into an immediate, obvious error. That's cheaper and more effective than true privacy (`#private` fields would also break DevMenu, save/load and many read sites).
- **One mapping for "skill → stat".** Skills named in content (projects, AI storyline, IDE) now map through `ProjectSystem.SKILL_TO_STAT`. Moving that table next to `STATS` in CharacterStats.js, and having `addExperience` accept a skill id and map it, would stop each system from inventing its own bucket for non-stat skill names.
- **A grep check in CI** (`rg "gameState\.stats\b" src/js` must be empty) is a one-line guard. It catches exactly the pattern that drifted twice, and it's cheaper than relying on review.
