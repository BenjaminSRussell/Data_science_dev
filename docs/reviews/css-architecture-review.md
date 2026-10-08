# CSS architecture review (#272)

`index.html` loads 12 global, unscoped stylesheets in this order: `main.css`, `components.css`, `research-inbox.css`, `visual-progression.css`, `emotional-breakdown.css`, `patches.css`, `game-panels.css`, `intro.css`, `daynight.css`, `story-ui.css`, `text-ui.css`, `act-transition.css`. When two rules have equal specificity, the later file wins.

## 1. Cross-file collisions

Method: every selector in each sheet was parsed and its *subject* (the last compound) taken. A class was flagged when it is the subject class of a rule in more than one file. The scan script is reproducible; the bare-selector half is now a test, `test/unit/CssCollisions.test.js`.

**Bare single-class selectors (`.foo { }`) defined in 2+ files:**

| Class | Files (load order) | Wins | Verdict |
|---|---|---|---|
| `.hidden` | main.css, components.css | components.css | Identical rule (`display: none !important`). Harmless duplicate; allow-listed |
| `.stat-card` | main.css (inside a media query, menu stats), game-panels.css (shared card look) | game-panels.css | Intentional. game-panels.css re-scopes the menu with `.menu-stats-dashboard .stat-card`; allow-listed |
| `.dialogue-text` | emotional-breakdown.css (bare), components.css (`.dialogue-container .dialogue-text`) | split | **Accidental, and live.** The breakdown file's bare rule made the live DialogueUI text (`DialogueUI.js`, `.dialogue-text`) italic, centred and 1.1rem, because the scoped components.css rule doesn't set those properties. **Fixed here** by scoping it to `.breakdown-dialogue .dialogue-text` |

**Scoped subjects shared across files** (a class that is the subject in more than one file, but at least one copy is scoped by an ancestor or modifier):

| Class | Where | Verdict |
|---|---|---|
| `.progress-bar`, `.progress-fill` | components.css (bare); story-ui.css (`.screen-story …`); game-panels.css (`.working-container .progress-fill`) | Already known. The overrides are scoped by screen, so intentional |
| `.btn`, `.card`, `.panel`, `.modal-content`, `.map-container` | base in main/components; `.x.visual-mid` modifiers in visual-progression.css | Intentional theming modifiers |
| `.screen` | main.css; patches.css `.screen:not(.active)` | Intentional safeguard override |
| `.screen-title` | main.css; story-ui.css `.story-header .screen-title` | Intentional scoped override |
| `.stat-label`, `.stat-value` | main.css (`.stat-block …` / bare); game-panels.css (`.stat-content …`, `.stat-card …`) | Scoped per panel; fine |
| `.btn-icon` | main.css `button .btn-icon`; components.css bare | Same component, both files style the icon inside buttons; low risk, worth merging into components.css |

Earlier cleanups (#1832, #1796, #1787, #2836 and the unstyled-panel batches) already removed most duplicate definitions, so the remaining real risk is small.

## 2. Naming convention

There isn't a stated convention, but there is a de facto one: **component-prefixed kebab-case** (`.paper-*` 34 rules, `.btn-*` 33, `.job-*`, `.slot-*`, `.act-*`, `.decision-*`, `.story-*`, `.dialogue-*`, `.task-*`, `.shop-*`, `.npc-*`). BEM `__`/`--` separators aren't used anywhere. The convention breaks down in two places:

- generic single words (`.card`, `.panel`, `.screen`, `.hidden`, `.positive`/`.negative`) that are shared on purpose;
- generic compound names in feature files that don't carry the feature prefix: `.dialogue-text`, `.character-visual`, `.emotion-indicator` in emotional-breakdown.css. These are the ones that collide.

## 3. Recommendation

A full scoping migration (CSS modules, or moving every panel to Lit shadow DOM) isn't worth it. Most live UI is plain DOM rendered from `main.js`/helpers, so shadow DOM would mean rewriting the rendering, and the collision count is already low. The lighter fixes capture almost all of the value:

1. **Guard test (added):** `CssCollisions.test.js` fails CI when a bare single-class selector is defined in two global sheets (allow-list for deliberate cases). It runs in the existing vitest job; no new tooling.
2. **Convention going forward:** a feature stylesheet's classes start with the feature prefix (`.breakdown-*`, `.inbox-*`, …), or are nested under the feature root (`.emotional-breakdown-overlay …`). Shared generics live only in `main.css`/`components.css`.
3. **Optional follow-up:** if the guard needs to go further, `stylelint` with `no-duplicate-selectors` across files (via a concatenated-input run) would also catch scoped duplicates. That's only worth adding if new collisions keep showing up.
