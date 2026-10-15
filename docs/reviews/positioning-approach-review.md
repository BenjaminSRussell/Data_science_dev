# Positioning approach review (#529)

## 1. Who uses `PositioningHelper`?

Nothing in gameplay. `PositioningVerifier` (dev menu only, #2279) imports `PositioningHelper` for `detectCoordinateSystem`. No other production file imports the helper. The live UI positions things in four places, none of which use the helper:

| Live code | What it positions | How |
|---|---|---|
| `helpers/MapHelpers.js` | legacy DOM map road tiles and the player marker | inline `style.left/top` in %, via `MapManager.gridToPercent` / `MapGridSystem.gridToPercent` |
| `ui/TooltipManager.js` | tooltips next to the cursor or target | inline px from the target's bounding rect |
| `game/UnifiedMapSystem.js` | the live Pixi map | Pixi coordinates (no DOM layout) |
| everything else (screens, panels, modals, Lit components) | general UI | CSS (flex/grid) and shadow-DOM styles |

So general UI layout already uses CSS and Lit. The only manual positioning is grid-to-screen math for maps and cursor-relative tooltips, which is exactly where CSS can't do the job on its own.

## 2. Is `PositioningVerifier` ever invoked?

Yes, from the dev menu only. `DevTools` constructs one `PositioningVerifier` when dev mode is on, and DevMenu's "Verify Positioning" button calls `generateReport(game)` then `isPositioningCorrect`. It is not part of normal gameplay. #2843 fixed crashes in its report and coordinate handling; #2279 wires the instance in.

## 3. Sign of past bugs, or speculative?

Mostly a fossil of a real problem, built speculatively. Both files arrived in the initial commit (`6ffd6c42`) alongside three competing coordinate conventions: grid cells, percents, and pixels. `detectCoordinateSystem()` exists to guess which one a `position` object uses, which only makes sense if mixed conventions were causing misplaced markers. That's consistent with the later map fixes (#1933 grid percent, #1935 integer grid cells). The verifier only runs from the dev menu, so it does not catch those bugs during normal play. The live code later standardised on `MapGridSystem.gridToPercent` instead, so the helper's duplicate `gridToPercent`/`percentToGrid` were left behind.

## 4. Recommendation

Keep the *approach*: manual math only for grid and sprite placement, CSS for everything else. That's already how the live code works. The helper and verifier don't need to be part of it:

- The one piece of logic the live code needs (grid ↔ percent) already lives in `MapGridSystem`. If a shared helper is wanted, move `normalizeToPercent`'s coordinate-system handling there and drop the duplicate in `PositioningHelper`.
- No UI-layout code was found that should be using CSS or Lit and isn't. `LocationView`/`LocationViewComponent` compute feature hotspot positions inline (`20 + (index % 5) * 15`%), but those are map-like hotspots over a background image, and that code path is unreachable anyway (#2201).
- `PositioningVerifier` is reachable from the dev menu (#2279); don't delete it as unused. `PositioningHelper` keeps only `detectCoordinateSystem`, which `verifyLocations` calls. The other static methods had no production callers and were removed (#1937). Map placement stays on `MapGridSystem`; the helper is not a second grid-to-percent implementation.
