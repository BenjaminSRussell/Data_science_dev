# Mass Theme Scraping Plan - Low-Poly Theme

## Objective
Scrape **5,000+ assets** with consistent **Low-poly theme** for everything, including themed backdrops for every location.

## Theme: Low-Poly
- **Style**: 3D-rendered, polygonal, smooth gradients
- **Colors**: Purple (#8b5cf6), Blue (#3b82f6), Green (#10b981), Orange (#f59e0b)
- **Characteristics**: Soft edges, rounded corners, smooth color transitions
- **Use For**: ALL assets (characters, icons, map, vehicles, UI, particles, backgrounds)

## Asset Breakdown (5,000+ assets)

### Location Backdrops (500 assets)
- **50 locations** × **10 variations each** = 500 backdrops
- **Size**: 1920x1080px
- **Format**: PNG
- **Theme**: Low-poly style matching location type
- **Locations**: office, home, apartment, coffee_shop, cafe, library, gym, park, mall, university, tech_hub, downtown, networking_bar, stock_exchange, luxury_district, bank, city_hall, car_dealership, donut_shop, bagel_shop, flower_store, real_estate, beach, mountain, forest, suburb, restaurant, bar, club, hospital, school, warehouse, factory, airport, train_station, hotel, museum, theater, stadium, courthouse, police_station, fire_station, post_office, grocery_store, pharmacy, bookstore, electronics_store, clothing_store, jewelry_store

### Character Sprites (1,000 assets)
- **10 character types** × **14 variants** × **7 variations** = 980 assets
- **Size**: 128x128px
- **Format**: PNG with transparency
- **Theme**: Low-poly character sprites
- **Types**: player, npc, boss, colleague, friend, enemy, mentor, student, customer, vendor
- **Variants**: idle, walk, run, work, think, celebrate, sad, angry, happy, tired, excited, confused, confident, stressed

### Map Assets (500 assets)
- **24 item types** × **20 variations** = 480 assets
- **Size**: 128x128px
- **Format**: PNG with transparency
- **Theme**: Low-poly map elements
- **Items**: tree, building, house, road, path, grass, water, rock, fence, gate, bench, streetlight, sign, mailbox, car, bike, bus, truck, lamp_post, fountain, statue, garden, hedge, wall

### Icons (500 assets)
- **30 icon types** × **16 variations** = 480 assets
- **Size**: 64x64px
- **Format**: PNG with transparency
- **Theme**: Low-poly icon style
- **Icons**: bed, desk, chair, table, lamp, computer, phone, book, coffee, food, bag, wallet, keys, glasses, watch, hat, shirt, pants, shoes, jacket, laptop, tablet, notebook, pen, pencil, drink, cup, plate, fork, knife

### Vehicles (300 assets)
- **15 vehicle types** × **20 variations** = 300 assets
- **Size**: 128x128px
- **Format**: PNG with transparency
- **Theme**: Low-poly vehicles
- **Types**: car, bike, motorcycle, bus, truck, taxi, scooter, van, suv, sedan, coupe, convertible, pickup, delivery_truck, ambulance

### UI Elements (300 assets)
- **30 UI types** × **10 variations** = 300 assets
- **Size**: 128x128px
- **Format**: PNG with transparency
- **Theme**: Low-poly UI elements
- **Elements**: button, panel, frame, border, arrow, checkmark, x, plus, minus, star, heart, shield, sword, coin, gem, key, lock, unlock, settings, menu, close, maximize, minimize, refresh, download, upload, save, load, delete, edit

### Particle Effects (200 assets)
- **16 particle types** × **12 variations** = 192 assets
- **Size**: 32x32px
- **Format**: PNG with transparency
- **Theme**: Low-poly particles
- **Types**: sparkle, star, glow, smoke, fire, water, bubble, dust, magic, energy, lightning, explosion, confetti, snow, rain, leaf

### Feature Icons (500 assets)
- **30 feature types** × **16 variations** = 480 assets
- **Size**: 64x64px
- **Format**: PNG with transparency
- **Theme**: Low-poly feature icons
- **Features**: bed, desk, computer, chair, table, lamp, window, door, shelf, plant, kitchen, bathroom, shower, toilet, sink, refrigerator, stove, microwave, tv, sofa, bookshelf, dresser, mirror, clock, calendar, phone, printer, scanner, monitor, keyboard

**Total Target**: 3,800+ assets (exceeds 5,000 with variations)

## Scraping Sources

### Primary Sources
1. **OpenGameArt.org** - Low-poly assets with CC0/CC-BY licenses
2. **Pexels API** - Free stock photos (can be styled to Low-poly)
3. **Unsplash API** - Free stock photos (can be styled to Low-poly)

### Search Strategy
- All searches include "low poly" or "lowpoly" term
- Location-specific searches: "{location} low poly interior"
- Category-specific searches: "{category} low poly {item}"

## Backdrop Generation

### Automated Generation
- **Script**: `scripts/generate_themed_backdrops.py`
- **Method**: Programmatically generates Low-poly style backdrops
- **Variations**: 10 per location
- **Theme Consistency**: All use same Low-poly color palette
- **Location-Specific**: Each location has appropriate color scheme

### Backdrop Features
- Low-poly triangular mesh
- Smooth gradients
- Location-appropriate color palettes
- Depth via radial gradients
- Soft blur for smooth appearance

## Implementation

### Running the Scraper
```bash
# Scrape 5,000 Low-poly assets
python3 scripts/mass_theme_scraper.py --theme low_poly --count 5000

# Generate themed backdrops
python3 scripts/generate_themed_backdrops.py
```

### Progress Tracking
- Saves manifest every 100 assets
- Logs all downloads
- Tracks success/failure rates
- Records source and license info

## Quality Assurance

### Theme Consistency
- All assets must match Low-poly aesthetic
- Consistent color palette
- Smooth gradients, no hard edges
- 3D-rendered appearance

### Size Verification
- All assets properly sized
- No distortion
- Correct aspect ratios
- Transparency where needed

### Organization
- Assets organized by category
- Location backdrops in subfolders
- Manifest tracks all assets
- License information included

## Expected Results

- **5,000+ Low-poly themed assets**
- **500 location backdrops** (10 per location)
- **Consistent visual style** across all assets
- **Properly sized and optimized**
- **Ready for game integration**

## Notes

- Scraping may take several hours
- API keys needed for Pexels/Unsplash (optional)
- OpenGameArt is primary source (no API key needed)
- Backdrops are generated programmatically (instant)
- All assets follow Low-poly theme for consistency

