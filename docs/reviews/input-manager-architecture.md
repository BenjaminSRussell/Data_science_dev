# Code Review: InputManager.js Centralization

**Verdict: the premise is outdated. `src/js/systems/InputManager.js` does not exist in this
repository, and there is no `setupAll()`, `setupBackButtons()`, or `setupBankSystem()`.**
Event-listener wiring is not centralized at all — it lives in one monolithic
`setupEventListeners()` method on the game class in `src/js/main.js`, plus scattered
per-file listeners. This review documents the actual state and answers the review
questions against it.

## 1. What actually exists

- No `src/js/systems/` directory, no `InputManager` symbol anywhere
  (`grep -ri "inputmanager"` → no matches).
- `grep -c "addEventListener" src/js/main.js` → ~60, all inside the single
  `setupEventListeners()` method (roughly lines 770–1260).
- Additional listeners live in other files: `index.html` (window error/load/module-loaded),
  `src/js/audio/AudioManager.js` (music `ended`), and per-UI modules
  (`CityMapRenderer.js`, `MapRenderer.js`, `TileBasedCityMap.js`, `ConversationScreen.js`,
  `EmotionalBreakdownSystem.js`, `IntroSystem.js`, `NotificationSystem.js`, `NPCHelpers.js`).

## 2. Classification of the ~60 listeners in main.js

A representative sample shows a **mix, dominated by one category**:

- **Screen navigation (the bulk):** `btn-nav-*` and `btn-back-*` buttons, each a
  one-line `this.screenManager.showScreen(...)` call (lines 839–926). These are
  repetitive but not duplicated — each button is wired exactly once.
- **Game-flow actions:** new game / continue / tutorial / settings / credits /
  chart submit / next task (lines 777–837) — one-liners delegating to methods.
- **Business logic inline:** the bank block (lines 1095–1135) — see §4.
- **Lifecycle:** `visibilitychange` auto-save, promotion-event listeners.

There are no leftover duplicates of the same button wired twice in `main.js`.

## 3. The "dead code in setupBackButtons()" claim

Not reproducible. There is no `setupBackButtons()` and no generic `forEach` loop over
back-button ids. Each back button is an individual `addEventListener` one-liner
(lines 884–926), and `btn-back-market` (line 924) is wired directly with its own
correct handler (`showScreen('screen-game')` + `updateMapScreen()`). No unreachable
`if (btnId === 'btn-back-market')` branch exists, so there is no dead code to remove
and no other instance of that pattern to hunt for.

## 4. The bank handler

`handleBankAction` (lines 1106–1131) is a local closure inside `setupEventListeners()`,
not a method of any InputManager. It inlines amount parsing/validation, the four
`bankSystem` calls, audio, and toasts. Every other listener in the same method is a
one-line delegation, so this is the one outlier. It matters: the validation +
dispatch logic is untestable in isolation and the handler knows about UI (toasts,
input clearing) and audio, which belongs in the game/bank layer.

## 5. Answers

**(a) Single source of truth or partial centralization?**
Neither — it is *no* centralization. `main.js` is the de-facto InputManager, and it is
only partial: dynamic/interactive listeners (map tiles, dialogue choices, notifications)
are wired in their own UI modules, so `main.js` is not even the single place.

**(b) What concretely should move where?**
- Extract the static button wiring from `setupEventListeners()` into a real
  `src/js/systems/InputManager.js` with per-category `setup*()` methods
  (navigation, game-flow, bank, lifecycle), each registering listeners that delegate
  to `this.game.xxx()` one-liners.
- Move the bank business logic out of the click handler into a
  `game.handleBankAction(action, amount)` method (or `BankSystem`), leaving the
  listener as a one-line delegation.
- Keep dynamic listeners (map tiles, dialogue choices) in their owning UI modules —
  they are data-driven and correctly colocated.

**(c) One-off or sign of an unclear boundary?**
Sign of an unclear boundary. The bank block is the only listener that performs
multi-step business logic inline, which shows the "who owns the logic" line between
input wiring and game state was never drawn. It is fixable in one move (see b).

**(d) Prioritized cleanup list**
1. Extract bank logic into `game.handleBankAction()`; make the four bank listeners
   one-liners. (Small, high value, removes the only inline business logic.)
2. Create `src/js/systems/InputManager.js` and move the static navigation/game-flow
   wiring out of `main.js` into per-category `setup*()` methods.
3. Document the boundary: static DOM wiring → InputManager; dynamic/data-driven
   listeners → owning UI module; business logic → game systems.
4. (Optional) Collapse the ~10 identical `btn-back-*` one-liners into a small
   data-driven loop — but with the id→screen mapping as data, not per-id `if` checks.
