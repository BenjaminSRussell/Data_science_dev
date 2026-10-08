# Audio system review (#273)

Scope: `src/js/audio/AudioManager.js` and every call into it under `src/js`, reviewed 2026-10-07.

## 1. Sound ids used vs. defined

`AudioManager.play(name)` synthesizes a short tone from a fixed table (`click`, `success`, `fail`, `complete`, `start`, `purchase`, `promotion`, `kaching`, `error`). It does not load any audio files for sound effects.

| id at call site | calls | defined? |
|---|---|---|
| `kaching` | 16 | yes |
| `error` | 8 | yes |
| `success` | 4 | yes |
| `click` | 2 | yes |
| `complete`, `fail`, `start` | 1 each | yes |
| `keyboard_typing` | 1 (`helpers/ProjectHelpers.js`) | **no**. The call is written as `play('keyboard_typing') \|\| play('click')`, so it deliberately falls back to `click`. |

Unknown ids are a silent no-op: `play()` returns `false` and nothing throws (#2250 added the boolean return so callers can chain fallbacks). `purchase` and `promotion` are defined but never used.

## 2. State consistency

- **AudioContext per beep (fixed in this PR).** `playTone()` created a new `AudioContext` for every sound. Browsers cap the number of live contexts (Chrome allows about 6), so after a few sounds new contexts failed inside the `try` and sound effects went silent for the rest of the session. `getAudioContext()` now reuses one context, resumes it if it's suspended, and recreates it if it's closed. Tests: `AudioManager.context.test.js`.
- **Settings checkboxes (fixed in #2782).** The Sound Effects checkbox had no listener, and the Music checkbox toggled blindly, so it could invert relative to the real state. Both now set the state they display.
- **Volumes are applied.** `soundVolume` scales each tone's gain. `musicVolume` is applied to the current track and to every new track in `playRandomTrack`.
- **Autoplay.** `playRandomTrack` catches the promise rejected by `play()` before the first user gesture. The station stays selected but nothing plays until the next track or toggle. That's acceptable; no retry is needed.
- **No preload race.** Effects are synthesized, so there are no assets to wait for. Music tracks are created on demand.

## 3. API consistency

Every call site goes through `game.audioManager.play(...)` or the toggle, station and volume methods. Nothing touches Howler or `Audio` directly, except `dev/AssetValidator.js`, which probes asset URLs with `new Audio()`; that's a dev tool, not playback. Howler is listed in `package.json` but not imported anywhere, so it's a candidate for removal.

## Follow-ups (not done here)

- Remove the unused `howler` dependency, or switch music playback to it.
- `test/unit/AudioManager.test.js` imports a non-existent `src/js/dev/AudioManager.js` and spies on a `playSound` method that doesn't exist. It's in the known-failing baseline and should be rewritten against the real module.
