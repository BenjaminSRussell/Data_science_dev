# Positioning approach review (#529)

## 1. Who uses `PositioningHelper`?

Nobody in production. `rg "PositioningHelper|PositioningVerifier" src` (excluding tests) finds only the two files themselves: `PositioningVerifier.js` imports `PositioningHelper` (for `detectCoordinateSystem`), and nothing imports either. The live UI positions things in four places, none of which use the helper:

| Live code | What it positions | How |
|---|---|---|
| `helpers/MapHelpers.js` | legacy DOM map road tiles and the player marker | inline `style.left/top` in %, via `MapManager.gridToPercent` / `MapGridSystem.gridToPercent` |
| `ui/TooltipManager.js` | tooltips next to the cursor or target | inline px from the target's bounding rect |
| `game/UnifiedMapSystem.js` | the live Pixi map | Pixi coordinates (no DOM layout) |
| everything else (screens, panels, modals, Lit components) | general UI | CSS (flex/grid) and shadow-DOM styles |

So general UI layout already uses CSS and Lit. The only manual positioning is grid-to-screen math for maps and cursor-relative tooltips, which is exactly where CSS can't do the job on its own.

## 2. Is `PositioningVerifier` ever invoked?

No. It isn't imported anywhere, including `src/js/dev/` (DevMenu, DevTools, StorylineNavigator). It can only run from tests or a hand-typed console import. #2843 fixed crashes in its report and coordinate handling, but didn't wire it in.

## 3. Sign of past bugs, or speculative?

Mostly a fossil of a real problem, built speculatively. Both files arrived in the initial commit (`6ffd6c42`) alongside three competing coordinate conventions: grid cells, percents, and pixels. `detectCoordinateSystem()` exists to guess which one a `position` object uses, which only makes sense if mixed conventions were causing misplaced markers. That's consistent with the later map fixes (#1933 grid percent, #1935 integer grid cells). But the verifier was never hooked into anything that would catch such bugs. The live code later standardised on `MapGridSystem.gridToPercent` instead, so the helper's duplicate `gridToPercent`/`percentToGrid` were left behind.

## 4. Recommendation

Keep the *approach*: manual math only for grid and sprite placement, CSS for everything else. That's already how the live code works. The helper and verifier don't need to be part of it:

- The one piece of logic the live code needs (grid ↔ percent) already lives in `MapGridSystem`. If a shared helper is wanted, move `normalizeToPercent`'s coordinate-system handling there and drop the duplicate in `PositioningHelper`.
- No UI-layout code was found that should be using CSS or Lit and isn't. `LocationView`/`LocationViewComponent` compute feature hotspot positions inline (`20 + (index % 5) * 15`%), but those are map-like hotspots over a background image, and that code path is unreachable anyway (#2201).
- Deleting `PositioningHelper.js`/`PositioningVerifier.js` (~530 lines) is the natural end state. They're on the list of unused systems Ben hasn't decided on (#1937, #2279), so this review leaves them in place.
