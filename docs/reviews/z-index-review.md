# Z-index / stacking review (#882)

## Current state

There are two numbering schemes plus a third in JS:

- **CSS tokens** (`main.css` `:root`): `--z-base: 1`, `--z-overlay: 100`, `--z-modal: 200`, `--z-toast: 10050`. `--z-toast` was raised from 300 by #1245 so toasts clear the full-screen overlays.
- **Literal integers** in stylesheets and JS-injected styles, from 100 up to 99999.
- **`UILayerManager.layers`** (`background 0 … cursor 1000`). It's constructed, but almost no UI routes through it (#193, #2400).

Everything that sets a z-index today:

| Layer (as used) | Where | Value |
|---|---|---|
| HUD | `main.css .top-bar` | `var(--z-overlay)` = 100 |
| Map overlays | `MapRenderer.js`, `CityMapRenderer.js` injected styles; `EnvironmentManager.js` time overlay | 100, 100, 200 |
| Tooltips (CSS) | `components.css [data-tooltip]::after` | 100 |
| Main modal | `main.css .modal-container`, `.modal`, `.loading-screen`; `components.css .tutorial-overlay`; `game-panels.css .working-overlay` | `var(--z-modal)` = 200 |
| Dialogue box | `components.css .dialogue-container` | 900 |
| Menu / music menu | `main.css .screen-menu`, `.music-radio-menu` | 1000 |
| Lit components | `DialogueComponent.js`, `ResearchInboxComponent.js` | 1000 |
| Notifications (2nd toast system) | `NotificationSystem.js` injected | 1000 |
| Save-slot dropdown | `components.css .save-slots-dropdown` | 2000 |
| Full-screen flows | `intro.css .job-application-screen`, `act-transition.css .act-transition-overlay` | 9000 |
| Full-screen overlays | `research-inbox.css .research-inbox-container` 10000, `.paper-detail-modal` 10001, `emotional-breakdown.css .emotional-breakdown-overlay` 10002, `story-ui.css .story-decision-modal` 10010, `GameEndingModal.js` 10001, `VisualProgressionSystem.js` 10000, `index.html` intro video 10000 | 10000–10010 |
| Tooltips (JS) | `TooltipManager.js` (two injected rules) | 10000 |
| Toasts | `main.css .toast-container` | `var(--z-toast)` = 10050 |
| Debug | `DevMenu.js` 99998/99999, `main.js` debug and error panels, `index.html` diagnostics | 99999 |

## Concrete problems

1. **The main modal (200) sits under the dialogue box (900), the menu (1000) and the music menu (1000).** Anything opened with `showModal()` while a dialogue is up (e.g. How to Play from a location) renders behind it.
2. **CSS tooltips (100) render under every modal and overlay**, so a `[data-tooltip]` on a modal button is hidden. The JS tooltips (10000) tie with the research inbox and visual-progression overlay, so the winner depends on DOM order.
3. **Two toast systems sit at 10050 and 1000.** `NotificationSystem` toasts are hidden behind every full-screen overlay; `.toast-container` toasts aren't.
4. **Ties at 10000/10001** (research inbox vs. visual progression vs. JS tooltips; paper detail vs. game-ending modal) also resolve by insertion order.

## Proposed single scale (CSS custom properties in `main.css`)

```css
--z-base: 1;          /* in-flow content, map tiles */
--z-map-overlay: 50;  /* time-of-day tint, map labels */
--z-hud: 100;         /* top bar, persistent panels */
--z-dropdown: 300;    /* save-slot dropdown, music radio menu, popovers */
--z-dialogue: 400;    /* dialogue box, working overlay */
--z-screen: 1000;     /* full-screen flows: menu, job application, act transition,
                         research inbox, story decision, emotional breakdown,
                         visual-progression reveal, game ending, loading screen */
--z-modal: 2000;      /* showModal(), paper detail, tutorial overlay; above a screen */
--z-tooltip: 3000;    /* tooltips must show over the modal they annotate */
--z-toast: 4000;      /* all transient feedback, both toast systems */
--z-debug: 9000;      /* dev menu, diagnostics, fatal-error panels */
```

The order is base → HUD → dropdowns → dialogue → full-screen → modals → tooltips → toasts → debug. It departs from the issue's suggested order in one place: tooltips go *above* modals. Most tooltips that matter are on controls inside modals and screens, and a tooltip is never interactive, so it can't block anything. Dropdowns sit below modals, but they close on outside click, so the two never need to overlap. Within a band, items that can be open together get `+1` offsets (e.g. `.paper-detail-modal` = `calc(var(--z-modal) + 1)` over the inbox's modal use).

`UILayerManager.layers` should read the same numbers (or be removed; that decision is #193/#2400) so JS-placed elements land in the same bands.

## Migration checklist

- `src/styles/main.css`: `.top-bar` → `--z-hud`; `.music-radio-menu` → `--z-dropdown`; `.screen-menu`, `.loading-screen` → `--z-screen`; `.modal-container`, `.modal` → `--z-modal`; `.toast-container` → `--z-toast`; define the scale and drop `--z-overlay` (alias it to `--z-hud` during migration).
- `src/styles/components.css`: `[data-tooltip]::after` → `--z-tooltip`; `.save-slots-dropdown` → `--z-dropdown`; `.dialogue-container` → `--z-dialogue`; `.tutorial-overlay` → `--z-modal`.
- `src/styles/game-panels.css`: `.working-overlay` → `--z-dialogue`.
- `src/styles/intro.css` `.job-application-screen`, `src/styles/act-transition.css` `.act-transition-overlay` → `--z-screen`.
- `src/styles/research-inbox.css`: `.research-inbox-container` → `--z-screen`; `.paper-detail-modal` → `--z-modal`.
- `src/styles/emotional-breakdown.css` `.emotional-breakdown-overlay`, `src/styles/story-ui.css` `.story-decision-modal` → `--z-screen` (+1/+2 if they can stack).
- JS-injected styles, using `var(--z-…)` (custom properties work in injected CSS and in `style.zIndex`):
  - `TooltipManager.js` → tooltip
  - `NotificationSystem.js` → toast
  - `GameEndingModal.js`, `VisualProgressionSystem.js` → screen
  - `EnvironmentManager.js` → map overlay
  - `MapRenderer.js`, `CityMapRenderer.js` → base or map overlay
  - `DialogueComponent.js`, `ResearchInboxComponent.js` → dialogue and screen (shadow DOM inherits custom properties from `:root`)
  - `DevMenu.js`, `main.js` debug and error panels, `index.html` diagnostics → debug
  - `index.html` intro video → screen

Migrate one band at a time, starting with toasts and tooltips (the visible bugs 2–3), then modal vs. dialogue (bug 1). That way each step can be checked by opening the overlapping UI pairs listed above.
