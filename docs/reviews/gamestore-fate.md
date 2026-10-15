# gameStore.js: fate and removal plan (#1035)

Scope: `src/js/store/gameStore.js` and everything wired to it: `src/js/main.js`, `src/js/helpers/MapHelpers.js`, and the store tests. Checked against `origin/main` at 1843f1e (2026-10-15). The issue body predates the current code. It cites 509 lines, and the file is 281. The findings below supersede it.

Status: decision recorded here. Execution is a follow-up, as the issue asks. The steps in the plan are separate PRs.

## Decision

Remove the store (option c). `GameState` is the single source of truth, saved and loaded by `SaveManager` through `GameState.toJSON()` and `fromJSON()`.

- **(a) Make the store the source of truth** means replacing every direct `GameState` mutation in the gameplay systems with a store action, and moving saves onto the store. That is the full rewrite the issue asks us not to attempt in one pass.
- **(b) Keep the store as a display cache** still needs 24 fields kept in step with `GameState`. Today the only sync is the write-back in `main.js`, which causes the data loss described below. Fixing its direction keeps the duplicate copy, the `game-storage` localStorage copy that `save-load-audit.md` (sections 1 and 4) already lists as open, and the duplicated purchase and multiplier logic.
- **(c) Remove** loses no save data. `GameState.toJSON()` already serializes every field the store persists (`GameState.js:410-452`). The exception is the sound and music preferences, which are also needed outside a save slot, before a save loads. They need a home first (plan step 1).

## What the code does today

These correct the issue body.

- **The store is live, not dead.** `main.js:266-270` subscribes to it. Each store change copies all 24 `MainGame.STORE_SYNC_FIELDS` (`main.js:4384-4390`) into `GameState`, whether or not the field changed.
- **Only two call sites write to the store.** Every successful trip calls `setCurrentLocation` (`MapHelpers.js:571`). `syncAudioPrefs` calls `setSoundEnabled` and `setMusicEnabled` (`main.js:2884-2885`). Gameplay code writes `GameState` directly and never calls a store action.
- **This is a live data-loss path.** Gameplay never updates the store, so the next store write copies the store's stale values back over `GameState`. A scratch test (not committed) set `gameState.money` to 5000 and `isGameStarted` and `tutorialCompleted` to true, then called the store's `setCurrentLocation`. The values read back as 100, false and false. `isGameStarted` is written at `main.js:1307` and `main.js:1657`, and `tutorialCompleted` at `main.js:2709`.
- **The UI files do not use the store.** `UIUpdater.js` reads `this.gameState`. `test/unit/LitUIManager.fixes.test.js:51` asserts that `LitUIManager.js` does not reference `useGameStore`.
- **The purchase logic has already forked.** The store's `purchaseItem` (`gameStore.js:143-170`) does not add `totalSpent`, has no `software` branch, and ignores the discounted price EconomySystem passes in (#1309). `GameState.purchaseItem` (`GameState.js:274`) does all three. The software multiplier table is duplicated in `gameStore.js:199-231`. It matches `GameState.SOFTWARE_EFFECTS` (`GameState.js:13-19`) today, but nothing keeps the two in step.
- **Removing the store does not fix two chain issues on its own.** `GameState.isChartTypeUnlocked` (`GameState.js:205-207`) also returns `true` (#1614). `unlockedThemes` has no writer in either copy (`GameState.js:83`, `gameStore.js:83`) (#1615). Each needs its own change.

## Migration and removal plan

Step 1 is the priority, because it stops the live reverts. Each step is its own PR.

1. **Move the sound and music preferences out of the store.** `soundEnabled` and `musicEnabled` persist only through the `game-storage` key (`gameStore.js:258-259`). `AudioManager` keeps them in memory (`AudioManager.js:11-12`) and persists only the station key (`AudioManager.js:389-396`). Store the two flags under a dedicated localStorage key, read them in the `AudioManager` constructor, and wrap every access in try/catch. Without this, mute state resets on reload until a save loads.
2. **Stop the write-back, then delete the store.**
   - Delete `src/js/store/gameStore.js`.
   - `main.js`: remove the import (lines 13-15), `this.gameStore` (lines 170-171), the sync and subscription in `syncGameStateToStore` (lines 251-270), and the `STORE_SYNC_FIELDS` and `copyStoreValue` helpers (lines 4384-4390 and 4412-4420). `GameState` already owns `bank`.
   - `main.js` `syncAudioPrefs` (lines 2883-2885): keep the `GameState` and `AudioManager` writes, and drop the store calls.
   - `MapHelpers.js:571`: drop the store write. `GameState.currentLocation` already reads through to the world map (`GameState.js:217-223`).
   - No save-format change, so no `SAVE_VERSION` bump.
3. **Retire the persisted copy.** Optionally, remove the stale `game-storage` key once on startup, guarded by try/catch. This closes item 4 in `save-load-audit.md`.
4. **Tests.** Delete only tests that covered the removed code, and say so in each PR (handbook policy).
   - `test/unit/gameStore.test.js` (canary): its header asks for updates rather than deletions. Rewrite it to pin the fixed behaviour: a trip leaves `GameState`'s money, `isGameStarted` and `tutorialCompleted` unchanged. This is the scratch repro, kept as a real regression test. The reviewer should confirm, because the header assumed the store would stay.
   - `test/unit/gameStore.fixes.test.js` and `test/unit/gameStore.issue503.test.js`: delete the store-only cases. Port any case `GameState` does not cover first. `GameState.purchaseItem.test.js` has no perk case.
   - `test/unit/BuildDeps.fixes.test.js:16-18`: delete the `zustand/vanilla` assertion.
   - `test/unit/MainFlow.cluster.test.js`: delete the `syncGameStateToStore` copy-semantics test (from #1612) along with the function.
   - `test/unit/MainGame.audioPrefs.test.js`: remove the store fake and its `setSoundEnabled` and `setMusicEnabled` expectations. Keep the `GameState` and `AudioManager` expectations.
   - `test/unit/LocationPropagation.test.js:16`, `test/unit/UIUpdater.issue2469.test.js:42` and `test/unit/LitUIManager.fixes.test.js:21`: remove the unused `gameStore` fakes. Keep the `GameState` assertions.
5. **Drop `zustand`** from `package.json` and `package-lock.json`. Only `gameStore.js` and its tests import it. This is a separate PR, because the handbook marks `package.json` as a hot file.

## Out of scope

- **#1614** (`GameState.isChartTypeUnlocked` always returns true) and **#1615** (`unlockedThemes` has no writer) need their own changes. Deleting the store does not address either one.

## Verification for the follow-up PRs

- Handbook build, lint, dataset manifest, and the vitest baseline diff, with no new failures.
- The step 4 regression test passes, and the scratch repro no longer reverts money.
