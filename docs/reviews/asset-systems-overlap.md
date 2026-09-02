# Code Review: Overlapping Asset/Icon-Loading Systems

## 1. Reachability Table

| Class Name                    | Live/Dead     | Usage Notes                                  |
|-------------------------------|---------------|----------------------------------------------|
| AssetManager                  | Live          | Used in `src/js/main.js` and other modules.    |
| PixiAssetManager              | Live          | Used in `src/js/main.js` and other modules.    |
| IconMapper                    | Dead          | Not used in any reachable game code path.       |
| IconRenderer                  | Live          | Used in `src/js/utils/IconRenderer.js`.        |
| NPCImageMapper                | Live          | Used in `src/js/utils/NPCImageMapper.js`.      |
| AssetResolver                 | Live          | Used in `src/js/utils/AssetResolver.js`.        |
| AssetFinder                   | Dead          | Not used in any reachable game code path.       |
| GameAssetLoader               | Live          | Used in `src/js/assets/GameAssetLoader.js`.    |
| ComprehensiveSpriteSystem     | Live          | Used in `src/js/sprites/ComprehensiveSpriteSystem.js`. |
| PixiSpriteManager             | Live          | Used in `src/js/sprites/PixiSpriteManager.js`.  |
| SpriteSheetManager            | Live          | Used in `src/js/sprites/SpriteSheetManager.js`. |
| SpriteDownloader              | Live          | Used in `src/js/sprites/SpriteDownloader.js`.   |

## 2. Overlapping Asset Types

- **NPC Icons**: `AssetManager.getNPCIcon()` and `NPCImageMapper.getNPCImage()`. These are used in different contexts and do not necessarily overlap.
- **Character Emotions**: `AssetManager.getCharacterEmotion()` and `PixiAssetManager.getCharacterEmotion()`. These are meant to be the same, but `AssetManager` is still in use.
- **Location Backgrounds**: `AssetManager.getLocationBackground()` and `PixiAssetManager.getLocationBackground()`. These are meant to be the same, but `AssetManager` is still in use.
- **General Assets**: `AssetManager.getAsset()` and `PixiAssetManager.getAsset()`. These are meant to be the same, but `AssetManager` is still in use.

## 3. Migration Status of `PixiAssetManager`

- `PixiAssetManager` is intended to replace `AssetManager`, but `AssetManager` is still in active use across the codebase.
- `PixiAssetManager` has been integrated into the main game flow but is not yet the sole asset resolution system.

## 4. Canonical Systems Proposal

### Canonical Systems

1. **PixiAssetManager**
   - **Rationale**: It is based on the modern PixiJS Assets system and is designed to replace older asset management systems.
   - **Usage**: Should be the primary system for all asset resolutions.

2. **IconRenderer**
   - **Rationale**: Handles specific icon rendering with img/emoji fallbacks, which is not directly handled by `PixiAssetManager`.
   - **Usage**: Should be used for icon rendering tasks.

3. **NPCImageMapper**
   - **Rationale**: Handles NPC-specific portrait resolution with its own hash-based fallback, which is not directly handled by `PixiAssetManager`.
   - **Usage**: Should be used for NPC portrait resolution tasks.

### Migration/Deprecation Plan

1. **Deprecate `AssetManager`**:
   - Replace all usages of `AssetManager` with `PixiAssetManager`.
   - Remove `AssetManager` class and related code once all usages are replaced.

2. **Integrate `IconRenderer`**:
   - Ensure that `IconRenderer` is fully integrated and tested.
   - Remove any duplicate icon rendering logic in other classes.

3. **Integrate `NPCImageMapper`**:
   - Ensure that `NPCImageMapper` is fully integrated and tested.
   - Remove any duplicate NPC portrait resolution logic in other classes.

4. **Remove Dead Systems**:
   - Remove `IconMapper` and `AssetFinder` as they are not used in any reachable game code path.

By following this plan, the codebase can be streamlined, and asset management can be unified under a single, modern system.