# Sprite / animation pipeline overlap (#526)

The three classes compared are `ComprehensiveSpriteSystem` (CSS), `PixiSpriteManager` (PSM) and `SpriteSheetManager` (SSM), all in `src/js/assets/`.

## 1. What live character rendering actually uses

None of the three. These are the live character and NPC visuals:

- **Dialogue portraits:** `DialogueUI.js` → `getNPCImage(npc)` from `utils/NPCImageMapper.js`, rendered as a plain `<img class="dialogue-portrait">` with an initial-letter fallback.
- **Map:** `UnifiedMapSystem.js` draws locations and markers with PixiJS directly (`new PIXI.Sprite(texture)` around line 678 for location art; Graphics for everything else). There are no animated characters on the map.

How each sprite class is wired:

| Class | Constructed? | Methods called by live code |
|---|---|---|
| ComprehensiveSpriteSystem | Yes, in `main.js` deferred systems (`new ComprehensiveSpriteSystem(this.assetManager, this.spriteSheetManager)`), and `initialize()` runs after 1s | None. `getCombinedSprite`/`getEmotionSprite`/`getBodyLanguageSprite` have no callers outside the class. `initialize()` preloads emotion and pose images; `registerSpriteSheets()` is a no-op because `this.spriteSheetManager` is `undefined` (its construction in `main.js` is commented out) |
| PixiSpriteManager | Yes, lazily in `main.js` "Phase 4 managers" (`this.pixiSpriteManager = new PixiSpriteManager()`) | None. No sheet is ever loaded; the only intended consumer, `AnimatedCharacterRenderer`, sits inside the same commented-out block |
| SpriteSheetManager | No. The import and constructor are commented out in `main.js` | None |

## 2. Is the frame math duplicated?

No. Each uses a different model:

- **SSM** computes frame rectangles itself from a uniform grid:
  ```js
  const frameIndex = base + i;              // base = row*columns + startFrame
  const col = frameIndex % sheet.columns;
  const row = Math.floor(frameIndex / sheet.columns);
  frames.push({ x: col * sheet.frameWidth, y: row * sheet.frameHeight, ... });
  ```
  (Since #2294/#1050 it honours the `animations` passed to `registerSpriteSheet`.)
- **PSM** does no frame math. It hands a TexturePacker-style JSON atlas to PixiJS: `new Spritesheet(texture, jsonData); await sheet.parse();`. Frames and animations come from the atlas (`sheet.textures[frameName]`, `sheet.animations[name]`).

So they don't delegate to each other, and they don't duplicate logic either. They solve the same problem in two incompatible input formats (grid PNG vs. JSON atlas).

## 3. Canvas vs. PixiJS: both active?

No. The canvas compositor (CSS `getCombinedSprite`) has no caller, and PixiJS sprite animation (PSM) has no loaded sheet, so neither path draws anything today. CSS's preload in `initialize()` is the only work any of them does at runtime, and it fetches images that, per #2542, mostly don't exist.

## 4. Recommendation

1. **Own sprite and animation logic with `PixiSpriteManager`.** The live map is PixiJS (UnifiedMapSystem), PSM uses Pixi's own `Spritesheet`/`AnimatedSprite` (less custom code to maintain), and it now stores `sheetId` and supports unloading (#70/#1840/#2300, #1053).
2. **Retire `SpriteSheetManager`.** Its only reason to exist is grid sheets without an atlas, and a grid can be described as a Pixi atlas (a generated JSON frame table). If grid sheets are needed, add a small `gridAtlas({ columns, frameWidth, frameHeight, animations })` helper that emits Pixi atlas JSON for PSM, reusing SSM's (now-correct) math. That's about 30 lines, and SSM (~150 lines) can go.
3. **Keep `ComprehensiveSpriteSystem`'s compositing only if emotion and pose layering is wanted.** Its job (overlaying an emotion layer on a pose) is a rendering *feature*, not a sprite store. If it's kept, re-implement `getCombinedSprite` as two stacked Pixi sprites (or a Pixi `RenderTexture`) fed by PSM textures, and drop the canvas path and its private image loader. If not, remove it and its 1-second startup preload.
4. **Wire one consumer before consolidating anything** (e.g. `AnimatedCharacterRenderer` for the player marker). Until something renders a character, all three remain dead weight. Whether to wire or delete is Ben's decision (see #465, #468, #1048), so this review doesn't remove code.
