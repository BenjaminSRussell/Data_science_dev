# Test coverage roadmap (#271)

Measured on 2026-10-07 with `npx vitest run --coverage --coverage.reportOnFailure --coverage.include='src/js/**'` (v8, line coverage). The suite has 234 test files and about 2,350 tests. Overall line coverage of `src/js` is **82.6%** (73.8k of 89.3k lines). `data/` holds about 42k lines of mostly static tables at 97%, which inflates that figure. Without `data/`, coverage is about **69%**.

About 170 tests are a known-failing baseline. They're mostly stale tests: jest-style tests, imports of modules that were moved, and tests that assert old behaviour. They still count toward coverage only as far as they import code.

## 1. Directory breakdown

| dir | lines covered | assessment |
|---|---|---|
| `main.js` (root) | 27% | **Partially covered.** It became unit-testable in #2780 (`__DSD_NO_AUTOBOOT__`, `setupWorldInputs`). Most handlers are still untested. |
| `game/` | 79% | **Well covered** overall. The gaps are listed below. |
| `ui/` | 71% | **Partially covered.** `UIUpdater.js` is at 28%, `components/ResearchInboxComponent.js` at 0%. |
| `helpers/` | 49% | **Partially covered.** `MapHelpers.js` 28%, `StockMarketHelpers.js` 50%, `ProjectHelpers.js` 53%. |
| `dev/` | 46% | Partially covered. These are dev-only tools and low risk. |
| `utils/` | 79% | Well covered. `IconRenderer.js` is untested and unused. |
| `save/` | 90% | Well covered. |
| `store/` | 85% | Well covered. |
| `charts/` | 87% | Well covered. |
| `interaction/`, `performance/` | 97% / 78% | Well covered. |
| `audio/` | 63% (now higher) | Partially covered. Settings wiring and context reuse were added in #2782 and this PR. |
| `assets/` | 48% | Partially covered. The sprite managers are unused. |
| `characters/` | 75% | Partially covered. |
| `camera/` | 36% | Essentially untested. |
| `effects/` | 0% | **Untested**: `ParticleEffectManager.js`, which is loaded lazily. |
| `visual/` | 0% | **Untested**: `FilterManager.js`. |
| `systems/` | 0% | It holds only a stray jest file, `InputManager.test.js`, that imports modules that don't exist. Delete it. |

## 2. Highest-risk gaps (ranked)

Money and save state get the most weight.

1. **`game/events/EventSystem.js` (37%).** Random events change money, reputation and stats every week. A wrong sign or a missing guard silently corrupts saves.
2. **`helpers/StockMarketHelpers.js` (50%).** This handles the buy/sell UI and money movement. Its old test file is jest-based and in the failing baseline, so effectively nothing protects the trade path. Port it to vitest first.
3. **`main.js` money handlers (27%).** This means rent, office upgrades, purchases and new-week processing. `handleHireStaff`, the world input wiring and the audio wiring are now covered. `handleUpgradeOffice`, the shop purchase and `new_week` are next. They're reachable through `MainGame.prototype.*.call(fake)`.
4. **`game/GameState.js` (80%).** The uncovered lines are mostly load and migration branches. A migration bug loses players' saves.
5. **`ui/UIUpdater.js` (28%).** These are display-only, but they're the screens players read money and stats from. Wrong numbers here produce a lot of bug reports.
6. **`helpers/MapHelpers.js` (28%).** Travel, vehicles and shop actions cost money and energy. `handleLocationAction` is covered since #2780.
7. **`game/ai/AITrainingStoryline.js` (31%)** and **`game/WorkInteractionSystem.js` (52%).** These carry progression logic. WorkInteractionSystem is pending a decision on whether to wire it in or delete it.

Not ranked, because they're unreachable or pending that decision: `MapRenderer`, `MapEnvironmentSystem`, `RoomSystem`, `ConversationScreen`, `EmotionalBreakdownSystem`, `TaskVisualRenderer`, the sprite managers and `IconRenderer`. Test them only if they get wired in.

## 3. Proposed order of work

1. **Sprint 1: make the baseline honest.** Port or delete the about 170 stale failing tests: the jest files, the wrong import paths (`AudioManager.test.js`, `ProjectHelpers.test.js`, `StockMarketHelpers.test.js`), and `src/js/systems/InputManager.test.js`. A red baseline hides real regressions, so this comes first.
2. **Sprint 2: money paths.** EventSystem effects, the StockMarketHelpers trade flow, and the `main.js` purchase, upgrade and new-week handlers. Each is a pure function of `gameState` plus a few spies.
3. **Sprint 3: save integrity.** GameState load and migration branches, and round-tripping every `SERIALIZABLE_SUBSYSTEMS` entry through `toJSON`/`fromJSON`.
4. **Sprint 4: screens.** UIUpdater sections, using DOM fixtures in the `ProjectHelpers.screens.test.js` style. Then the MapHelpers travel and vehicle flow.
5. **Afterwards:** `camera/`, `effects/` and `visual/` once they're confirmed live, and the dev tools as time allows.

Re-run the coverage command above at the end of each sprint and update the table.
