# Code Review: PositioningHelper / PositioningVerifier vs. Lit-component layout

## 1. Where is `PositioningHelper` actually used?

Grepping `PositioningHelper.` across `src/js` shows the class is **not used by any
live UI code at all**. The only references found are:

- `src/js/utils/PositioningHelper.js` — the class definition itself.
- `src/js/utils/PositioningVerifier.js` — one internal call,
  `PositioningHelper.detectCoordinateSystem(pos, 30)` (line 38), used by the
  verifier's own `verifyLocations()` method.

No file under `src/js/ui/`, `src/js/game/`, or `src/js/dev/` imports or calls
`PositioningHelper`. So the premise of the review — "is it used broadly, or
narrowly (e.g. only for map/character sprite placement)?" — resolves to a
third option: **it is used nowhere in the live UI**. It is not even narrowly
scoped to grid/sprite placement; it is entirely orphaned.

The Lit-based components in `src/js/ui/components/*.js` do their layout with
CSS/shadow-DOM as expected, and nothing in them reaches for the manual
positioning helpers.

## 2. Is `PositioningVerifier` ever invoked in a live code path?

No. `PositioningVerifier` is referenced only inside its own file
(`src/js/utils/PositioningVerifier.js`). Checking `src/js/dev/`:

- `src/js/dev/index.js` (the `DevTools` entry point) instantiates
  `DevMenu`, `DialogueTester`, `OptionTester`, `AssetValidator`,
  `GraphValidator`, `WorkSystemValidator`, `StorylineNavigator`, and
  `LocationTester` — and exposes them via `window.devTools`.
  **`PositioningVerifier` is not among them**, and `runAllTests()` does not
  include any positioning check.

So `PositioningVerifier` is not wired into the dev menu, not called from any
game code path, and not part of any test harness. It is a standalone class
that nothing ever constructs.

## 3. Past-bug artifact or speculative infrastructure?

Honest read: **unused speculative infrastructure**, not a scar from past
positioning bugs.

The evidence:

- A verifier built to fight real positioning bugs would be wired into the dev
  tooling (the `DevTools` class exists precisely for this kind of runtime
  self-check, and every other validator — assets, graphs, work system — is
  wired in). `PositioningVerifier` is conspicuously absent from that wiring.
- The helper it verifies against (`PositioningHelper`) is itself unused, so
  the verifier is checking a convention that no live code follows. A bug-driven
  tool would verify code that actually exists.
- `PositioningHelper.detectCoordinateSystem()` is marked `@deprecated` with the
  note "All locations now use grid coordinates (0-30)" — the codebase moved
  past the ambiguity the verifier was built to police, and neither file was
  updated or removed.

The most likely story: these were written during an earlier phase when
positioning was inconsistent (mixed grid/pixel coordinates), the codebase
standardized on grid coordinates, and both files were left behind rather than
deleted.

## 4. Recommendation

- **Delete both files.** `src/js/utils/PositioningHelper.js` and
  `src/js/utils/PositioningVerifier.js` have zero live callers. Keeping them
  around invites future contributors to use the manual inline-style approach
  for new UI, which is exactly the code smell the review was worried about —
  except here the smell is that the manual system exists at all.
- **No UI-layout code needs migrating.** The Lit components already use
  CSS/shadow-DOM layout correctly; there is no live code that "should be using
  CSS instead" and isn't.
- **If grid-to-percent conversion is ever needed again** (e.g. for map sprite
  placement), a two-line inline calculation or a small CSS custom-property
  approach is preferable to resurrecting a 250-line utility class plus a
  250-line verifier for it.
