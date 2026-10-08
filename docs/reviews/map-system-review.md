# Map system review (#265)

Reviewed on main at the time of PR "Fix UnifiedMapSystem render leaks, icons, colours and grid size". Reachability was traced from `src/js/main.js` and `src/js/helpers/MapHelpers.js` by following imports and call sites.

## 1. Live vs. dead

### Live chain (what a running game uses)

| Step | Code |
|------|------|
| Map screen shown / state changes | `MainGame` calls `updateMapScreen(game)` (`src/js/helpers/MapHelpers.js`) |
| First call | dynamically imports `src/js/game/UnifiedMapSystem.js` and does `game.unifiedMapSystem = new UnifiedMapSystem(#world-map, game)`, then `initialize()`. Concurrent calls now share one pending import (`game.unifiedMapSystemLoading`, #1167). |
| Later calls | `initialize()` if not yet rendered, otherwise `update()` (re-draws the locations and ui layers) |
| Resize | `UnifiedMapSystem.onResize` -> `handleResize()` -> `renderLocalMap()`; ScreenManager also calls `handleResize()` when the map screen opens |
| Teardown | `destroy()` removes the resize listener and the pulse ticker callback, and destroys the Pixi app |

Other live map pieces:
- `MapCoordinateSystem` is constructed in `main.js` (`gameState.mapCoordinateSystem`) and seeded with `initializeWithLocations()`. It builds a `MapGridSystem`, so **`MapGridSystem` is live through `MapCoordinateSystem`**, not through the renderer.
- `PositioningHelper` (utils) is live for DOM positioning.
- The DOM helpers in `MapHelpers.js` (location states, player marker, icons, lock badges) run on every `updateMapScreen`.

### Dead (verified; no live importer or caller)

| File | Why it is unreachable |
|------|----------------------|
| `MapSystemInitializer.js` | `MapHelpers.js` imports `initializeMapRenderer` but never calls it |
| `MapRenderer.js` | only imported by `MapSystemInitializer.js` |
| `MapManager.js` | only imported by `MapRenderer.js` |
| `MapRoadSystem.js`, `MapRoadRenderer.js`, `MapBlockSystem.js`, `MapBuildingSystem.js`, `MapAssetPlacer.js`, `MapEnvironmentSystem.js`, `MapNavigationSystem.js`, `MapZoneSystem.js` | only imported by `MapManager.js` |
| `CityMapRenderer.js` | no importers |
| `WorldMapRenderer.js` | no importers. `MapHelpers` still has `game.worldMapRenderer` / `game.simpleMapRenderer` fallback branches, but nothing assigns either property. |
| `TileBasedCityMap.js` | file no longer exists |

## 2. Correctness issues on the live path

Fixed in the same PR:
- Re-renders called `removeChildren()` without destroying anything, which leaked Graphics/Text objects (#1909). They now go through `clearLayer()`.
- Every `update()` added another pulse callback to the Pixi ticker (#1349). There is now one callback, removed on clear and on destroy.
- The icon condition was inverted, so image-path icons never rendered (#214). They now load through `PIXI.Assets` as sprites.
- `shopping` and `investment` buildings fell back to the business colour (#156, #1910).
- The grid size `30` was duplicated across files (#1934). It is now `WORLD_GRID_SIZE` in `src/js/config/mapGrid.js`.

Still open, not fixed here:
- `particleManager` is read from `gameState.particleEffectManager`, which `main.js` always sets to `null`. Every particle branch in `UnifiedMapSystem` is dead. `ParticleEffectManager.js` exists but nothing constructs it, and its `@pixi/particle-emitter` dependency has no Pixi v8 release (#1348, #2540). This is part of the unused-systems decision.
- `renderLocalLocations()` adds each label to the `ui` layer and its icon to the `locations` layer. `update()` clears both, so this is consistent today, but a future partial re-render of one layer would orphan labels.
- Pixi `Graphics.beginFill/lineStyle/drawCircle` are the v7-style API. They still work in v8 but are deprecated. Moving to `fill()/stroke()/circle()` is a worthwhile follow-up.

## 3. Recommendation

Delete the dead renderer chain (`MapSystemInitializer`, `MapRenderer`, `MapManager`, and the eight `Map*System`/`Map*Renderer`/`MapAssetPlacer` files it pulls in, plus `CityMapRenderer`, `WorldMapRenderer` and the `worldMapRenderer`/`simpleMapRenderer` fallback branches in `MapHelpers`). `UnifiedMapSystem` already covers what they draw.

Keep `MapGridSystem` and `MapCoordinateSystem`, since they are live.

Before deleting, port only one piece: `MapNavigationSystem.aStarPathfinding()`. It is the only logic with no equivalent in the live system, and it would be needed if travel ever animates along roads. Move it into a small standalone `src/js/utils/pathfinding.js` with tests, then delete the rest.

Deleting is a product call that is still pending (decision items #417, #1927). This review does not remove anything.
