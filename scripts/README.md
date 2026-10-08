# Scripts Directory

## Asset Compression

### compress-assets-for-git.js
Compresses PNG/JPEG assets to reduce size for GitHub upload.
- Ensures no file exceeds 50MB
- Compresses in-place (overwrites originals)
- Creates compression report

**Usage**: `npm run compress-assets`

### check-file-sizes.js
Scans repository for files exceeding 50MB.
- Checks all files (respects .gitignore)
- Reports files that need attention; exits 1 if any file is over the limit
- `npm run check-sizes -- --limit-mb 25` changes the limit

**Usage**: `npm run check-sizes`

## Other Scripts

### static-bug-check.js
Static code analysis to find common bugs.
- Syntax checking
- Pattern matching for bugs
- Warnings for code quality

**Usage**: `npm run check:static` (or `node scripts/static-bug-check.js`)


## Python asset tooling

These are offline, run-by-hand tools for building the asset library. Nothing in `npm run build` or the game calls them. Install the dependencies once with `pip install -r scripts/requirements.txt`, then run each script from the repo root. Tests are in `tools/tests/` (`python3 -m pytest tools/tests`).

### generators/
| Script | What it does | Output |
| --- | --- | --- |
| `storyline_dialogue.py` | Turns `story_line/*.txt` design docs into NPC dialogue modules and `CHARACTER_STORIES` entries | `src/js/game/dialogue/npcs/*.js`, `StorylineCharacterStories.js` |
| `create_game_asset_manifest.py` | Scans `downloaded_assets/` (characters, backdrops, map, icons, …) into the in-game manifest | `game_asset_manifest.json` |
| `generate_master_manifest.py` | Scans every asset, then classifies it by category and style (low-poly / pixel / realistic) | `master_asset_manifest.json` |
| `generate_asset_manifest.py` | Writes the scraping wish-list (search terms and sources per asset) that the scrapers work from | `asset_manifest.json` |
| `generate_more_low_poly.py` | Draws placeholder low-poly sprites to fill categories the scrapers didn't fill; re-runs keep adding to the numbering | `downloaded_assets/<category>/generated_low_poly_*.png` |
| `create_town_map.py` | Builds the 30×30 town grid (roads, zones, buildings, trees) and renders it | `assets/map/` |
| `generate_themed_backdrops.py` | `ThemedBackdropGenerator`: flat-colour backdrop in the low_poly / pixel_art / cartoon palettes | the `output_dir` you pass |
| `create_character_sprites.py` | `create_character_sprite()`: composites a hair layer over a body sprite | the path you pass |

### scrapers/
`python3 scripts/scrapers/run_all_scrapers.py` runs each `scraper_*.py` (characters, backdrops, map assets, icons, vehicles, UI elements, particles) in turn, with a 1-hour timeout per scraper. On timeout the scraper's whole process group is killed, so nested `git clone`s don't outlive it. Each scraper downloads into `downloaded_assets/<type>/` and writes a `manifest.json` there. `mass_theme_scraper.py` is a standalone bulk scraper driven by a themed asset list.
