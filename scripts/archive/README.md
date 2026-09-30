# Archived Scripts

This directory contains bootstrap and generation scripts that are no longer actively used in the project.

## Why These Scripts Are Archived

The generator and scraper scripts in this directory were created to bootstrap game assets and data, but:

1. **Dead Code**: The outputs of these scripts (JSON manifests, generated assets) are not consumed by the running game. The one exception (`game_asset_manifest.json`) is referenced only by `GameAssetLoader.js`, which itself has no callers in the codebase.

2. **No Integration**: These scripts have no:
   - References in `package.json`
   - npm scripts or CI hooks
   - Documentation in the main scripts README
   - Integration with the build/deployment process

3. **Manual-Only Invocation**: These scripts were designed to be run by hand when needed, with no automation or coordination with the rest of the tooling.

## Contents

### `generators/`
- `create_game_asset_manifest.py` - Generates game asset manifest (output unused)
- `create_town_map.py` - Generates town map data (output unused)
- `generate_asset_manifest.py` - Generates asset manifest (output unused)
- `generate_master_manifest.py` - Generates master asset manifest (output unused)
- `generate_more_low_poly.py` - Generates low-poly assets (output unused)
- `generate_themed_backdrops.py` - Generates backdrop themes (output unused)

### `scrapers/`
- `run_all_scrapers.py` - Orchestrator script (never called)
- `scraper_characters.py` - Scrapes character assets
- `scraper_backdrops.py` - Scrapes backdrop assets
- `scraper_map_assets.py` - Scrapes map assets
- `scraper_icons.py` - Scrapes icons
- `scraper_vehicles.py` - Scrapes vehicle assets
- `scraper_ui_elements.py` - Scrapes UI elements
- `scraper_particles.py` - Scrapes particle effects
- `mass_theme_scraper.py` - Bulk theme scraping

## Future Considerations

If these scripts become relevant again:
1. Document their purpose and outputs
2. Add npm scripts to automate them (if needed)
3. Wire their outputs into the build/asset pipeline
4. Document when and how to run them in the main scripts README

For historical context, see GitHub issue #1915.
