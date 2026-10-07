# Save/Load Data-Loss Audit

Scope: `src/js/save/SaveManager.js`, `GameState.toJSON()`/`fromJSON()` (`src/js/game/GameState.js`),
`SaveSlotManager` (`src/js/ui/SaveSlotManager.js`), the `continueGame()` load path in `src/js/main.js`,
and the Zustand `persist` config in `src/js/store/gameStore.js`.

Status column: **fixed** = addressed in the same PR as this report; **open** = still a risk.

## 1. Every localStorage write for game saves

| Writer | Key | Partial/corrupt-write risks | Status |
|---|---|---|---|
| `SaveManager.saveGame()` | `data_science_tycoon_save_<slot>` | `gameState.toJSON()` used to be all-or-nothing: one throwing subsystem aborted the whole save. Quota errors are caught and return `false`, but callers ignore the return value, so the player never learns the save failed. A single `setItem` is atomic per key, so there are no torn writes. | toJSON per-subsystem isolation **fixed**; silent failure **fixed** (`onSaveError` → throttled toast) |
| `SaveManager.loadGame()` (lastPlayed touch) | same | Rewrites the record it just read. If the in-memory record had been mutated by a migration, the migrated form is persisted, which is what we want. | ok |
| `SaveManager.importSave()` | target slot | Used to store `JSON.stringify(rawString)` (a double-encoded string), which corrupted the slot (#56). It also accepted any JSON. | **fixed**: stores the parsed record, validates `state`, uses UTF-8-safe base64 |
| `SaveManager.setSlotName()` | slot | Read-modify-write. If it races with autosave, the last writer wins, but both writers preserve metadata. | ok |
| `SaveManager.duplicateSave()` | target slot | Overwrote a target without bounds checks. | **fixed**: target validated |
| `SaveSlotManager.migrateOldSave()` | slot 0 and legacy key | Built a record without a `state` key (#2107). It also deleted the legacy key even when the write threw (quota) (#1663). | **fixed** |
| `SaveSlotManager.undoDelete()` | slot | Restores the raw bytes captured before deletion. It refuses if the slot was reused in the meantime. | new, guarded |
| Autosave (`startAutoSave`) | current slot | Was never started (#872) and ignored `settings.autoSave` (#1252). | **fixed** |
| `visibilitychange` handler (main.js) | current slot | Same path as `saveGame`. With `currentSaveSlot === null` it used to write to `..._null`. | **fixed** (null → slot 0) |
| Zustand `persist` (`game-storage`) | `game-storage` | A second, divergent copy of a subset of `GameState`. Nothing reads it back into the slot system, so it can drift. | **open** (see §4) |

Concurrent writes: there's a single tab and a single thread, so the only interleavings are autosave versus a manual save versus visibilitychange. All three serialize the same live object, so there's no corruption. Multiple tabs would still clobber each other (last writer wins). That's **open**, and low priority.

## 2. toJSON/fromJSON asymmetries (field-by-field pass)

Before this PR, these fields were serialized but never restored, or restored but never serialized:

| Field | Problem | Status |
|---|---|---|
| `unlockedPerks` | serialized, never restored | **fixed** |
| `bankSystem` | serialized via a non-existent `BankSystem.toJSON` (always `undefined`); bank state really lives in `bank` | **fixed** (dead wiring removed) |
| `startTime`, `totalSpent`, `jailSentence`, `currentTask`, `currentLocation`, `chartConfig`, `settings`, `unlockedThemes`, `housingLevel`, `officeLevel`, `npcMemories`, `completedStoryBeats` | never serialized | **fixed** |
| `aiSystem.xpToNextLevel`, `aiSystem.isTraining` | omitted by `AISystem.toJSON` | **fixed** (older saves derive the threshold from `level`) |
| IDE, investment/e-commerce, company, relationship-emotion, storyline, story beats, character arc, NPC memory, work interaction, demanding boss, roommate, romance progression | no `toJSON`/`fromJSON` at all | **fixed**: small field lists through `utils/StateSerializer.js` |
| Restore order | `projectSystem` was restored before `characterStats`, so contract refresh used default stats (#1520) | **fixed** (stats and time restore first) |
| `realWorldTaskSystem.taskHistory` | unbounded | **fixed** (capped at 100) |
| `performanceManager.quality` | only restored if the manager already exists. `continueGame()` doesn't create it synchronously | **open** |

The continue path was the bigger loss. `continueGame()` only rebuilt about 12 of the 40+ subsystems, so every `if (this.X && data.X)` guard for the rest was dead and their saved data was dropped. It now calls `ensureSessionSystems()` and `loadDeferredSystems()` before the reload.

## 3. What happens when `JSON.parse` fails

- `loadGame()`: the parse is inside a try/catch, so it logs and returns `false`. **Neither caller** (`init()` and `continueGame()`) checks the return value. `continueGame()` then carries on with whatever is in memory, which is defaults when you continue from a cold start. The player sees "Welcome back!" on a fresh game, and the corrupt slot is left in place. No data is overwritten until the next autosave, and **that autosave replaces the corrupt slot with the fresh game**, so the original bytes are lost. **Fixed in this PR for `continueGame()`**: an unloadable slot now shows an error and returns to the menu without starting the session or autosave.
- `getSaveData()`: caught, returns `null`. The slot list then shows the slot as empty, and choosing it starts a new game that overwrites the corrupt bytes. Same loss mode. (Still **open** for the slot list.)
- `importSave()`: caught, returns `false`. The UI now shows "not a valid save export". **Fixed.**
- `migrateOldSave()`: caught. The legacy key is now kept for a retry. **Fixed.**

## 4. Prioritized hardening list

1. **Never overwrite a slot that failed to load.** `continueGame()` now does this. Remaining work: have `getSaveInfo` mark unparsable slots as `corrupt` rather than empty, so "new game" doesn't silently pick them.
2. ~~Surface save failures.~~ Done: `SaveManager.onSaveError` drives a throttled toast in `MainGame`.
3. **Back up before overwriting.** Keep a single `..._<slot>_prev` copy written just before each save, giving one-step rollback for corruption or bad migrations.
4. **Retire or reconcile the Zustand `game-storage` copy**, so there's only one source of truth for saved fields.
5. **Create `performanceManager` (and the other setTimeout-deferred systems) synchronously on continue**, so their settings restore.
6. Multi-tab protection: a `storage` event listener that warns when another tab writes to the active slot.
7. Long term, move off LocalStorage (#2714, IndexedDB with export/import) once saves approach the ~5 MB quota.
