# Specialized Scrapers Guide

## Overview

We now have **7 specialized scrapers**, each optimized for a specific asset type. Each scraper:
- Targets specific sources best for that asset type
- Uses appropriate search terms
- Resizes to correct dimensions
- Saves to organized folders
- Creates its own manifest

## Scrapers

### 1. Character Sprite Scraper (`scraper_characters.py`)
- **Target**: 1,000 character sprites
- **Size**: 128x128px
- **Sources**: OpenGameArt, GitHub repos
- **Output**: `downloaded_assets/characters/sprites/`
- **Searches**: "low poly character sprite", "lowpoly character", "3d character sprite"

### 2. Location Backdrop Scraper (`scraper_backdrops.py`)
- **Target**: All 49 locations
- **Size**: 1920x1080px
- **Sources**: Pexels API, Unsplash API, OpenGameArt
- **Output**: `downloaded_assets/backgrounds/locations/{location}/`
- **Searches**: Location-specific (e.g., "office low poly interior")

### 3. Map Asset Scraper (`scraper_map_assets.py`)
- **Target**: 500 map elements
- **Size**: 128x128px
- **Sources**: OpenGameArt
- **Output**: `downloaded_assets/map/assets/`
- **Items**: trees, buildings, houses, roads, paths, grass, water, rocks, fences, gates, benches, streetlights, signs, mailboxes, lamp posts, fountains, statues, gardens, hedges, walls

### 4. Icon Scraper (`scraper_icons.py`)
- **Target**: 500 icons
- **Size**: 64x64px
- **Sources**: Game-Icons.net (SVG), OpenGameArt (PNG)
- **Output**: `downloaded_assets/icons/items/` and `downloaded_assets/icons/features/`
- **Items**: 20 item types
- **Features**: 25 feature types

### 5. Vehicle Scraper (`scraper_vehicles.py`)
- **Target**: 300 vehicle sprites
- **Size**: 128x128px
- **Sources**: OpenGameArt
- **Output**: `downloaded_assets/vehicles/sprites/`
- **Types**: car, bike, motorcycle, bus, truck, taxi, scooter, van, suv, sedan, coupe, convertible, pickup, delivery_truck, ambulance

### 6. UI Element Scraper (`scraper_ui_elements.py`)
- **Target**: 300 UI elements
- **Size**: 128x128px
- **Sources**: OpenGameArt
- **Output**: `downloaded_assets/ui/elements/`
- **Elements**: button, panel, frame, border, arrow, checkmark, x, plus, minus, star, heart, shield, sword, coin, gem, key, lock, unlock, settings, menu, close, maximize, minimize, refresh, download, upload, save, load, delete, edit

### 7. Particle Effect Scraper (`scraper_particles.py`)
- **Target**: 200 particle effects
- **Size**: 32x32px
- **Sources**: OpenGameArt
- **Output**: `downloaded_assets/effects/particles/`
- **Types**: sparkle, star, glow, smoke, fire, water, bubble, dust, magic, energy, lightning, explosion, confetti, snow, rain, leaf

## Usage

### Run All Scrapers
```bash
python3 scripts/run_all_scrapers.py
```

### Run Individual Scraper
```bash
# Characters
python3 scripts/scraper_characters.py

# Backdrops
python3 scripts/scraper_backdrops.py

# Map Assets
python3 scripts/scraper_map_assets.py

# Icons
python3 scripts/scraper_icons.py

# Vehicles
python3 scripts/scraper_vehicles.py

# UI Elements
python3 scripts/scraper_ui_elements.py

# Particles
python3 scripts/scraper_particles.py
```

## Expected Results

### Total Assets Target: 3,800+
- Characters: 1,000
- Backdrops: 490+ (49 locations × 10+ each)
- Map Assets: 500
- Icons: 500
- Vehicles: 300
- UI Elements: 300
- Particles: 200

### Organization
```
downloaded_assets/
├── characters/
│   └── sprites/          (1,000 sprites)
│       └── manifest.json
├── backgrounds/
│   └── locations/        (490+ backdrops)
│       ├── office/
│       ├── home/
│       └── ... (49 locations)
│       └── manifest.json
├── map/
│   └── assets/           (500 map elements)
│       └── manifest.json
├── icons/
│   ├── items/            (250+ item icons)
│   ├── features/         (250+ feature icons)
│   └── manifest.json
├── vehicles/
│   └── sprites/          (300 vehicles)
│       └── manifest.json
├── ui/
│   └── elements/         (300 UI elements)
│       └── manifest.json
└── effects/
    └── particles/        (200 particles)
        └── manifest.json
```

## Features

### Each Scraper:
- ✅ Optimized for its asset type
- ✅ Proper sizing (no distortion)
- ✅ Theme consistency (Low-poly)
- ✅ Organized output folders
- ✅ Individual manifests
- ✅ Progress logging
- ✅ Error handling

### Master Scraper:
- ✅ Runs all scrapers sequentially
- ✅ Progress tracking
- ✅ Summary report
- ✅ Error handling per scraper

## API Keys (Optional)

For best results with backdrops, set API keys:
```bash
export PEXELS_API_KEY="your_key_here"
export UNSPLASH_API_KEY="your_key_here"
```

Without API keys, backdrops will use OpenGameArt only.

## Notes

- All scrapers use Low-poly theme
- All assets properly sized
- All assets saved and organized
- Each scraper creates its own manifest
- Master scraper runs everything automatically

