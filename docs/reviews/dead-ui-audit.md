# Dead-UI audit: `src/js/ui` (#256)

Every class and component under `src/js/ui/` (tests excluded) was traced on
main. I grepped for its construction (`new X`, dynamic `import()`, custom
element tags) and for calls on the instance (`game.x.method(`). A class
counts as reachable only if it is constructed **and** something a player can
trigger reaches its output. Being imported or `new`'d without use counts as
unreachable.

## 1. Reachability

| Class / component | File | Lines | Reachable | Why not / how |
|---|---|---|---|---|
| UIUpdater | `UIUpdater.js` | 978 | **yes** | `main.js` constructor; `updateAllUI`, `updateCareerScreen`, `updateShopScreen`, `updateNewspaperScreen` |
| StoryUI | `StoryUI.js` | 840 | **yes** | `initialize()`, `showDecisionModal()` (from StorylineManager), `updateStoryDisplay()` |
| SaveSlotManager | `SaveSlotManager.js` | 804 | **yes** | built in `initMenu` for the save/load slot menus |
| ResearchInboxUI | `ResearchInboxUI.js` | 447 | **yes, fallback path only** | `toggle`/`refresh`/`updateUnreadCount` are wired. Its Lit branch checks `customElements.get('research-inbox-component')`, which is never registered (nothing imports the component), so the plain-DOM fallback always renders |
| DialogueUI | `DialogueUI.js` | 444 | **yes, fallback path only** | `NPCHelpers` builds it for every NPC visit. Its `dialogue-component` branch can't run (#1154) |
| StatisticsAggregator | `StatisticsAggregator.js` | 277 | **yes** | main menu dashboard: `getStats` and `getDashboardHTML` |
| ScreenManager | `ScreenManager.js` | 259 | **yes** | `showScreen()` from MapHelpers, the menus and dev tools |
| GameEndingModal | `GameEndingModal.js` | 168 | **yes** | `createGameEndingModal()` from the ending flow in `main.js` |
| ActTransitionScreen | `ActTransitionScreen.js` | 245 | **no → fixed here** | imported but never constructed, so `StorylineManager.checkPhaseTransition()` always found `mainGame.actTransitionScreen` undefined and the act recap never showed. `main.js` now constructs it |
| LitUIManager | `LitUIManager.js` | 175 | no | constructed by UIUpdater and `initialize()` runs, but `#top-bar-container` / `#rank-progress-container` don't exist in `index.html`, so nothing mounts (#2131, #138). `createButton` has no callers (#191) |
| LocationView | `LocationView.js` | 327 | no | constructed in `main.js`, but no render method is ever called (#137, #2201) |
| TooltipManager | `TooltipManager.js` | 259 | no | constructed twice (`main.js` Phase 4 and `UnifiedMapSystem`), but `createTooltip` is never called (#2253) |
| MenuLogoDisplay | `MenuLogoDisplay.js` | 200 | no | `menuLogoDisplay` stays `null`; never constructed (#2157) |
| UILayerManager | `UILayerManager.js` | 178 | no | constructed; none of its methods is called (#193, #2400) |
| `<top-bar>` TopBar | `components/TopBar.js` | 93 | no | registered via LitUIManager's import, never mounted (#2131) |
| `<progress-bar>` ProgressBar | `components/ProgressBar.js` | 81 | no | same |
| `<location-view-component>` | `components/LocationViewComponent.js` | 171 | no | registered; only LocationView would create it (#2201) |
| `<dialogue-component>` | `components/DialogueComponent.js` | 297 | no | module never imported (#2240) |
| `<research-inbox-component>` | `components/ResearchInboxComponent.js` | 338 | no | module never imported (see ResearchInboxUI) |
| `<game-button>` Button | `components/Button.js` | 106 | no | module never imported (#191) |
| BaseComponent | `components/BaseComponent.js` | 49 | no | only extended by the components above |

## 2. Recommendation per unreachable item

| Item | Recommendation |
|---|---|
| ActTransitionScreen | **Wired in this PR**: one constructor line in `main.js`, with a test that a phase change shows the overlay |
| LitUIManager + TopBar + ProgressBar | Remove (about 350 lines). The text-mode top bar in `index.html`, updated by UIUpdater, already shows money, reputation and rank. Wiring would mean adding the two containers and deleting the duplicate DOM updates |
| LocationView + LocationViewComponent | Wire or remove as one unit with LocationDetailSystem (decision #2201/#137). About 500 lines here, plus `executeAction` |
| DialogueComponent | Remove (about 300 lines). DialogueUI's DOM path is the live, tested one. Wiring would mean importing the module and keeping two renderers in sync |
| ResearchInboxComponent | Remove (about 340 lines) together with ResearchInboxUI's Lit branch, or import it in ResearchInboxUI. The fallback is the tested path (#2134) |
| Button | Remove (about 110 lines). DevMenu has its own `createButton` |
| TooltipManager | Small wire-up: call `createTooltip` from UnifiedMapSystem's marker hover. Otherwise remove (about 260 lines) |
| UILayerManager | Remove (about 180 lines). Z-order lives in CSS tokens (see `z-index-review.md`) |
| MenuLogoDisplay | Wire in `initMenu` (one constructor line plus a container), or remove (about 200 lines) (#2157) |
| BaseComponent | Goes away with the last Lit component |

Everything except ActTransitionScreen is already filed as a delete-or-wire
decision for Ben. This audit recommends; it doesn't delete.

## 3. How much is dead, and why

- About 6,700 lines live under `src/js/ui/`.
- Before this PR, about **2,500 (37%)** were unreachable classes or
  components: the 13 rows marked "no", including ActTransitionScreen.
- With ActTransitionScreen wired, that drops to about **2,270 (34%)**.
- On top of that are the dead Lit branches inside two live files
  (ResearchInboxUI, DialogueUI).

**The pattern is one abandoned migration.** A "Phase 2/Phase 4" move to Lit
web components and a layered UI was started:

- `BaseComponent`, six components, LitUIManager, UILayerManager.
- Lit-first branches in DialogueUI and ResearchInboxUI.

The game then settled on the text-mode DOM UI driven by UIUpdater and
ScreenManager. The migration code was left in place in a half-wired state:

- constructed but with no containers in `index.html`;
- `customElements.get(...)` checks for elements that are never registered;
- managers built in the "Phase 4" dynamic-import block but never called.

The other two dead items (MenuLogoDisplay, ActTransitionScreen) are a
smaller version of the same thing: a constructor line that was never written
or was nulled out.

Cleanup should go by migration rather than file by file: decide "Lit, yes or
no" once (#2131/#2207/#2214/#2205 all hinge on it), and the components,
their manager and the fallback branches go or stay together.
