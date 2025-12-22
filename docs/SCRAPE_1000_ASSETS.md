# Scraping 1000 Additional Assets

## Quick Start

### Option 1: Using the runner script (Recommended)
```bash
./scripts/run_1000_scraper.sh
```

### Option 2: Manual setup
```bash
# Install dependencies
pip3 install -r scripts/requirements.txt

# Run scraper
python3 scripts/scrape_1000_assets.py
```

## What Gets Scraped

The scraper will download **1000 assets** in the following categories:

1. **Character Sprites** (200 assets)
   - Size: 128x128px with transparency
   - Variants: idle, walk, run, work, think, celebrate, emotions
   - Types: player, NPC, boss, colleague, friend, enemy, mentor, student

2. **Location Backgrounds** (150 assets)
   - Size: 1920x1080px (exact)
   - Locations: office, home, coffee shop, library, gym, park, mall, university, tech hub, downtown, etc.

3. **Feature Icons** (200 assets)
   - Size: 64x64px with transparency (exact)
   - Features: bed, desk, computer, chair, kitchen, bathroom, etc.

4. **Map Assets** (150 assets)
   - Size: 128x128px with transparency (exact)
   - Items: trees, buildings, houses, roads, paths, grass, water, rocks, etc.

5. **Vehicle Sprites** (100 assets)
   - Size: 128x128px with transparency (exact)
   - Types: car, bike, motorcycle, bus, truck, taxi, scooter, van, etc.

6. **Item Icons** (100 assets)
   - Size: 64x64px with transparency (exact)
   - Items: laptop, phone, tablet, book, notebook, pen, coffee, food, etc.

7. **UI Elements** (100 assets)
   - Size: 128x128px with transparency (exact)
   - Elements: buttons, panels, frames, arrows, checkmarks, icons, etc.

8. **Particle Effects** (100 assets)
   - Size: 32x32px with transparency (exact)
   - Effects: sparkle, star, glow, smoke, fire, water, bubble, dust, magic, energy

## Asset Sources

The scraper uses multiple sources with fallback:
- **OpenGameArt.org** - CC0/CC-BY licensed assets
- **Game-Icons.net** - CC-BY 3.0 icons
- **Kenney.nl** - CC0 Public Domain asset packs
- **Unsplash** (placeholder - requires API key)
- **Pexels** (placeholder - requires API key)

## Output Structure

```
downloaded_assets/
├── characters/
│   └── sprites/          (200 character sprites)
├── backgrounds/
│   └── locations/        (150 location backgrounds)
├── icons/
│   ├── features/          (200 feature icons)
│   └── items/             (100 item icons)
├── map/
│   └── assets/            (150 map assets)
├── vehicles/
│   └── sprites/           (100 vehicle sprites)
├── ui/
│   └── elements/         (100 UI elements)
├── effects/
│   └── particles/         (100 particle effects)
├── manifest_1000.json     (Download manifest)
└── scraping_report_1000.md (Scraping report)
```

## Size Requirements

All assets are automatically resized to the correct dimensions:
- **Character Sprites**: 128x128px (maintains aspect ratio)
- **Location Backgrounds**: 1920x1080px (exact)
- **Feature Icons**: 64x64px (exact)
- **Map Assets**: 128x128px (exact)
- **Vehicle Sprites**: 128x128px (exact)
- **Item Icons**: 64x64px (exact)
- **UI Elements**: 128x128px (exact)
- **Particle Effects**: 32x32px (exact)

## Progress Tracking

The scraper:
- Saves progress every 50 assets
- Logs all downloads to `asset_scraping_1000.log`
- Creates a manifest with all downloaded assets
- Generates a report with success/failure statistics

## License Compliance

All downloaded assets are tracked in `manifest_1000.json` with:
- Source URL
- License type
- Attribution requirements

## Notes

- The scraper includes polite delays between requests (1-3 seconds)
- Failed downloads are logged for manual review
- All images are automatically resized to requirements
- Transparency is preserved where needed
- SVG icons are converted to PNG when size requirements are specified

## Troubleshooting

### Dependencies not installing
```bash
pip3 install --upgrade pip
pip3 install -r scripts/requirements.txt
```

### Permission errors
```bash
chmod +x scripts/scrape_1000_assets.py
chmod +x scripts/run_1000_scraper.sh
```

### Low success rate
- Some sources may be rate-limited
- Try running at different times
- Check internet connection
- Review `asset_scraping_1000.log` for specific errors

## Expected Runtime

- **Full run**: 2-4 hours (depending on internet speed and source availability)
- **Progress saves**: Every 50 assets (can resume if interrupted)
- **Estimated success rate**: 30-60% (varies by source availability)

