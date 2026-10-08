# Time-of-day architecture review (#924)

## Where "what time of day is it" is answered

| Consumer | Before | After this change |
|---|---|---|
| `TimeManager.getTimeOfDay()` | Slot name (6 buckets: Early Morning … Night), from `timeSlot` | Unchanged. Still the authoritative clock; new `getDayPhase()` added |
| `DayNightCycle.getTimeOfDay()` | Own 3-bucket re-mapping of `timeSlot` (`morning`/`noon`/`night`) | Derived from the shared phase via `DayNightCycle.PHASE_TO_LOOK` |
| `EnvironmentManager.updateTimeOfDay()` | Real clock originally; #921 moved it to `(6 + slot*3) % 24` with its own formula; `TIME_OF_DAY` put 21:00 in *evening* | Uses `slotStartHour()`. `TIME_OF_DAY` hours now put 21:00 in *night*, so the slot named "Night" is night here too |
| `LocationBackgroundSystem.getTimeOfDay()` | Read the non-existent `timeManager.currentHour`, so it was always `'afternoon'`; #215/#1285 changed it to a private slot→phase table | Uses `dayPhaseForSlot()` |
| `main.js initMenuEnhancements()` | Real clock (`new Date().getHours()`) | Unchanged, on purpose: it styles the main menu before any game (and so any game clock) exists |

## Design

There is one source of truth, `TimeManager.timeSlot`. `src/js/game/TimeManager.js` now exports the only two derivations everything else uses:

- `slotStartHour(slot)` returns 6, 9, 12, 15, 18 or 21, for code that thinks in hours (EnvironmentManager's `TIME_OF_DAY` table).
- `dayPhaseForSlot(slot)` returns `morning` (slots 0–1), `afternoon` (2–3), `evening` (4) or `night` (5). `DAY_PHASES` lists the vocabulary.

Consumers that need fewer looks fold the phase down: the map's day/night cycle has three themes, and evening is drawn as night. They no longer define their own slot boundaries, so a change to `TIME_SLOTS` or to the phase mapping lands everywhere at once. `test/unit/TimeOfDay.unified.test.js` asserts that all four consumers agree for every slot and that `TIME_OF_DAY` covers each hour exactly once.

## Remaining notes

- The time-of-day callbacks and queries on `TimeManager` that nothing uses are tracked separately (#923). This change doesn't touch them.
- If an hour-granular clock is ever added, `slotStartHour` is the single place to replace with a real hour.
