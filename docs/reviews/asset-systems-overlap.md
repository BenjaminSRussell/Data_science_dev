# Asset / icon loading systems: which is canonical? (#525)

Scope: the 11 classes named in #525, plus `MissingAssetBlocklist.js` and
`LocationBackgroundSystem.js`. Those two are not on the issue's list, but
they decide which images the live game actually shows. The sprite trio
(`ComprehensiveSpriteSystem`, `PixiSpriteManager`, `SpriteSheetManager`) has
a deeper write-up in `sprite-pipeline-overlap.md` (#526); this review only
summarises it.

Reachability was traced on main (after #2882) by grepping each class and its
instance name (`assetManager`, `pixiAssetManager`, ...) across `src/js`,
excluding tests. "Live" means constructed **and** its output reaches
something the player sees.

## 1. Reachability

| # | Class / module | Constructed? | Live? | Evidence |
|---|---|---|---|---|
| 1 | `assets/AssetManager.js` | yes (`main.js` `initializeGameSystems`) | **partly** | `loadAll()` runs from `loadAssetsInBackground()` and drives the loading progress (`loadProgress`). It downloads all 165 manifest URLs (49 are on the blocklist and are skipped). But its `Map` is read only by `ComprehensiveSpriteSystem.getAsset` (no live callers) and `getLocationBackground` (only `LocationView`, never instantiated, #2201). No live screen shows an image from it. |
| 2 | `assets/PixiAssetManager.js` | yes, lazily (`main.js` "Phase 4 managers") | **no** | `init(manifest)` registers AssetManager's manifest as Pixi bundles (#68). Nothing calls `getAsset`, `getCharacterEmotion`, `getLocationBackground` or `loadAll`. The map loads its textures with `PIXI.Assets.load(location.icon)` directly (`UnifiedMapSystem.addIconSprite`), bypassing it. |
| 3 | `utils/IconMapper.js` | module functions | **yes** | `getTextIcon` is used by `main.js` and `NPCHelpers` to turn emoji into the text-mode labels. |
| 4 | `utils/IconRenderer.js` | never imported | no | dead (#479, #2278) |
| 5 | `utils/NPCImageMapper.js` | module functions | **yes** | `getNPCImage` / `getNPCFallback` back every live NPC portrait: `DialogueUI`, `NPCHelpers`, `NPCManager`. `ConversationScreen` also imports them but is unreachable (#2316). |
| 6 | `utils/AssetResolver.js` | import commented out (`LocationDetailSystem`) | no | dead (#1046, #2246) |
| 7 | `assets/AssetFinder.js` | n/a | **removed** | deleted in fad8a277 (#2737); `test/unit/AssetFinder.test.js` guards against it coming back |
| 8 | `assets/GameAssetLoader.js` | never imported | no | dead (#2287) |
| 9 | `assets/ComprehensiveSpriteSystem.js` | yes (deferred systems) | no | `initialize()` preloads emotion and pose images, but none of its getters has a caller (#526, #1841) |
| 10 | `assets/PixiSpriteManager.js` | yes, lazily | no | no sheet is ever loaded; its consumer `AnimatedCharacterRenderer` is commented out (#2300, #468) |
| 11 | `assets/SpriteSheetManager.js` | import and constructor commented out | no | #1048, #465 |
| 12 | `assets/SpriteDownloader.js` | never imported | no | #2293 |
| + | `assets/MissingAssetBlocklist.js` | module | **yes** | `isAssetMissing` is shared by AssetManager, NPCImageMapper, LocationBackgroundSystem and AssetValidator, and stops 404s for art that was never made |
| + | `game/LocationBackgroundSystem.js` | yes | **yes** | `getLayeredBackground` is the backdrop of every live location screen, via `ScreenThemeManager` and `MapHelpers` |

Totals: of the 11 classes in #525 (plus `SpriteDownloader`), 2 are fully
live (`IconMapper`, `NPCImageMapper`), 1 is half-live (`AssetManager`: it
loads, but nothing reads what it loaded), 1 has been removed
(`AssetFinder`), and the other 8 are dead or constructed-but-unused.

## 2. Do two live systems solve the same problem?

**NPC portraits: no conflict.** `AssetManager` no longer has an NPC getter.
All three live portrait call sites go through `NPCImageMapper.getNPCImage`,
so a given NPC always resolves to the same path or the same SVG initials
placeholder.

**Location backdrops: yes, and they disagree.**

- What the player sees: `LocationBackgroundSystem.getLayeredBackground` uses
  the WorldMap's own `background` from `data/locations.js`
  (`/assets/backgrounds/locations/home.png`), layered over a
  time-of-day gradient.
- What gets downloaded: AssetManager's manifest points at a different file
  for the same place (`/assets/backgrounds/locations/home/home_backdrop_00.png`).
- Both files exist, so nothing errors. The game just preloads a set of
  backdrops it never shows, while the shown set loads lazily through CSS.
  `PixiAssetManager.getLocationBackground` would give a third answer (the
  AssetManager key) if anything called it.

**Emotion and pose art:** only the dead `ComprehensiveSpriteSystem` asks
for it. So the preload in `AssetManager.loadAll` and the second preload in
`ComprehensiveSpriteSystem.initialize` both fetch images nobody displays.

## 3. PixiAssetManager: migration target or abandoned attempt?

**It was abandoned partway.** The plan ("Phase 4") was for
`PixiAssetManager` to replace `AssetManager`. Before #68, `main.js` skipped
the legacy load whenever the Pixi manager existed, but the Pixi `init` never
ran, so nothing loaded at all. Since #68 the legacy loader always runs and
Pixi only registers the manifest. No game code ever moved to the Pixi
getters. The one real Pixi consumer, the map, calls `PIXI.Assets.load`
directly with raw paths. Usage extends no further than "constructed and
manifest registered".

## 4. Recommendation

Treat these three as **canonical**:

1. **`NPCImageMapper`** for NPC portraits (with `MissingAssetBlocklist`).
2. **`LocationBackgroundSystem`** for location backdrops (WorldMap
   `background` plus gradient).
3. **`AssetManager`**, slimmed down to the single preloader and manifest
   owner. It should preload only what live screens use: the `data/locations.js`
   backgrounds and icons, and the NPC portraits.

`IconMapper` stays as a tiny text-mode helper. It maps emoji to labels, not
assets, so it isn't really part of the overlap.

Migration / deprecation, in order:

1. **Point the preload at what is shown.** Generate AssetManager's
   `backgrounds.locations` and `icons.locations` from `data/locations.js`
   instead of hand-written paths. Drop the emotion, pose and sprite-sheet
   entries until a live screen uses them. That removes about 100 of the 165
   preloaded URLs, and with them the duplicate backdrop downloads.
2. **Retire `PixiAssetManager`.** Pixi's own `Assets` cache already serves
   the map. Either delete it, or, if Pixi textures are wanted later, have it
   wrap AssetManager's manifest rather than duplicate it.
3. **Sprite trio:** follow `sprite-pipeline-overlap.md`. Keep at most one
   (PixiSpriteManager, the only one that renders through Pixi) and only once
   an animated character exists.
4. **Remove the never-imported modules** (`IconRenderer`, `GameAssetLoader`,
   `AssetResolver`, `SpriteDownloader`). They are already filed as
   delete-or-wire decisions (#479/#2278, #2287, #1046/#2246, #2293) and are
   left to Ben.

Steps 2-4 delete code that open decision issues are still waiting on, so
this review only recommends them. Step 1 is safe today but changes the
loading screen's progress total, so it belongs in its own PR.
