# Sprite Download & Integration Guide

## Quick Start - Download Sprites Now

### Priority 1: Universal LPC Character Sprites ⭐

**Direct Download:**
1. Go to: https://opengameart.org/content/universal-lpc-spritesheet-character-generator
2. Click "Download" button
3. Extract the ZIP file
4. Use the character generator (web or downloaded)
5. Create character variations
6. Export sprite sheets

**File Placement:**
```
assets/characters/sprites/
  ├── character_sheet.png (main sprite sheet)
  ├── character_walk.png
  ├── character_idle.png
  ├── character_talk.png
  └── [npc_name]_sheet.png (individual NPC sheets)
```

**How to Use:**
- The game will automatically detect and use these sprites
- If missing, fallback placeholders will be used
- Sprites load in background (non-blocking)

### Priority 2: Background Sprites

**Download Sources:**
1. Itch.io - Search "cartoon background pack"
2. OpenGameArt - Search "2d background"
3. Freepik - Free account, search "game background"

**File Placement:**
```
assets/backgrounds/locations/
  ├── home.png
  ├── office.png
  ├── coffee_shop.png
  ├── university.png
  ├── university_lab.png (for AI lab)
  ├── bank.png
  └── park.png
```

### Priority 3: Icon Sprites

**Download Source:**
- Game Icons: https://game-icons.net

**File Placement:**
```
assets/icons/locations/
  ├── home_icon.png
  ├── office_icon.png
  ├── coffee_icon.png
  └── [location]_icon.png
```

## Sprite Requirements

### Character Sprites
- **Format:** PNG
- **Size:** 64x64 or 128x128 per frame
- **Animations:** Walking (4-8 frames), Idle (4 frames), Talking (4 frames)
- **Transparency:** Required
- **Style:** Consistent across all characters

### Background Sprites
- **Format:** PNG or JPG
- **Size:** 1920x1080 recommended
- **Style:** Cartoonish, colorful
- **Transparency:** Not required

### Icon Sprites
- **Format:** PNG or SVG
- **Size:** 32x32 to 64x64
- **Transparency:** Required
- **Style:** Flat design

## Testing Sprites

After placing sprites:
1. Start the game
2. Check browser console for loading messages
3. Verify sprites appear in game
4. Test animations
5. If missing, check file paths match exactly

## Current Status

- ✅ Sprite system ready
- ✅ Asset manager configured
- ✅ Fallback system working
- ⏳ Sprites need to be downloaded and placed

Once sprites are downloaded and placed in the correct directories, they will automatically work in the game!

