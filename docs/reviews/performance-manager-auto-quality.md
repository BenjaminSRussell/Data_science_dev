# Code Review: PerformanceManager.js Auto-Quality State Machine

File: `src/js/performance/PerformanceManager.js`

## 1. Trace of `autoOptimize()` branches against all 4 quality levels

The original `autoOptimize()` had three branches:

| Branch | Condition | Transition |
|---|---|---|
| 1 | `avgFPS < 30 && quality !== 'low'` | low/medium/high/ultra → **low** |
| 2 | `avgFPS < 45 && quality === 'high'` | high → **medium** |
| 3 | `avgFPS >= 55 && quality === 'low'` | low → **medium** |

Full transition table (rows = current quality, columns = FPS regime):

| Current \ FPS | `< 30` | `30–44` | `45–54` | `>= 55` |
|---|---|---|---|---|
| **low** | — (already low) | — | — | medium |
| **medium** | low | — | — | — |
| **high** | low | medium | — | — |
| **ultra** | low | — | — | — |

Missing transitions:

- **medium → high** (no branch ever raises medium)
- **high → ultra** (no branch ever raises high)
- **ultra → medium** (ultra only ever drops straight to low, skipping medium)
- **medium → low** exists only via the `< 30` branch; there is no gradual medium → low step at 30–44 FPS.

Yes, this explains the "stuck" reports: once the system downgrades to `medium` (either from high at 30–44 FPS, or from low at >= 55 FPS), **no branch can ever move it again** — medium has no outgoing transition in the 30–54 FPS band and no upgrade path at all. The quality level is permanently frozen at `medium` for the rest of the session.

## 2. Can quality ever reach or leave `ultra` via auto mode?

- **Reach:** No. `detectHardware()` caps auto initialization at `high` (tier `high` → `setQuality('high')`), and no `autoOptimize()` branch ever calls `setQuality('ultra')`. `ultra` is only reachable if the user manually sets it.
- **Leave:** Yes, but only via the blunt `avgFPS < 30` branch, which drops ultra straight to `low`, skipping `medium` and `high`. There is no gradual ultra → high → medium degradation.

## 3. Path back to `high` once downgraded

In the original code: **none.** The only upgrade branch is `low → medium` at `avgFPS >= 55`. From `medium` there is no outgoing transition in any FPS regime, so a downgraded session can never climb back to `high` (or `ultra`). The state machine is a one-way ratchet: it can only fall, and it falls to a dead end at `medium`.

## 4. Fix recommendation

The minimal fix is to complete the upgrade ladder and the ultra degradation step: add `avgFPS >= 55 && quality === 'medium' → setQuality('high')` and `avgFPS >= 55 && quality === 'ultra'`-adjacent `avgFPS >= 55 && quality === 'high' → setQuality('ultra')` branches, so the state machine becomes a symmetric ladder (low ⇄ medium ⇄ high ⇄ ultra) with the existing `< 30 → low` and `< 45 → medium` downgrade branches retained. This lets a recovered session climb back up one level per evaluation, makes `ultra` reachable and escapable in auto mode, and removes the `medium` dead end that caused the stuck reports. (Applied in `autoOptimize()`.)
