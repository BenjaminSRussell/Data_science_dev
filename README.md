# 📊 Data Science Tycoon

**Master Data. Impress Bosses. Climb the Ladder.**

A web-based simulation game where you climb the corporate data science ladder by creating stunning visualizations for your demanding bosses. Built with **WebAssembly (C++)** and **JavaScript/Chart.js** for high-performance gameplay.

![Game Screenshot](screenshot.png)

## 🎮 Gameplay

1. **📋 Get Your Task** - Your boss assigns you a data visualization challenge
2. **📊 Analyze the Data** - Study the dataset to understand what story it tells
3. **🎨 Create Your Chart** - Choose the right chart type and customize it
4. **⭐ Get Rated** - Your boss evaluates your work with a star rating
5. **📈 Climb the Ladder** - Earn money and reputation to get promoted

## 🚀 Features

- **7 Career Ranks** - From Data Entry Clerk to Chief Data Officer
- **6 Unique Bosses** - Each with their own personality and preferences
-   **7 Career Ranks** - From Data Entry Clerk to Chief Data Officer
-   **6 Unique Bosses** - Each with their own personality and preferences
-   **9+ Chart Types** - Unlock more as you progress
-   **Procedural Data Generation** - Realistic business datasets
-   **Real-time Chart Preview** - See your visualization as you build it
-   **Save System** - Your progress is automatically saved
-   **Shop System** - Unlock new tools and perks

## 🎨 Generative Asset Wishlist & roadmap
This document tracks all visual assets required for the "Recursive Generation" system.

### 1. Character Evolution Trees
Each character needs 5-6 variations:
*   **Player Character (Start)**: Young, messy, hoodie.
*   **Player Character (Good/Mid)**: Clean cut, junior analyst, cheap suit.
*   **Player Character (Good/Late)**: CEO style, bespoke suit, glowing aura.
*   **Player Character (Evil/Mid)**: Flashy, gold chains, slicked hair.
*   **Player Character (Evil/Late)**: "Wolf of Wall Street", aggressive, dark luxury.

**NPCs:**
*   **Alex Rivera (Friend)**: Young/Messy -> Start-up Founder (Good) OR Burnout (Bad).
*   **Brad Sterling (Rival)**: Cheap Suit -> Expensive Suit -> Bankrupt/Jail.
*   **Emma Bloom (Love - Good)**: Librarian -> University Dean -> Happy Mother.
*   **Bella Lux (Love - Bad)**: Influencer -> Socialite -> Trophy Wife/Scandal.
*   **Vinnie (Crime)**: Thug -> Mob Boss -> Prison Inmate.

### 2. Dynamic World Assets
Locations that change over 3 years:
*   **Empty Lot**: Weeds/Trash -> Flower Shop (Good Econ) -> Pawn Shop (Bad Econ).
*   **Main Street**: Clean -> Gentrified (Hipster Cafes) -> Decayed (Boarded up).
*   **Office**: Basement -> Shared Space -> High Rise Floor -> Full Skyscraper.

### 3. Legal & Certifications
*   **Drivers License**: Basic ID card.
*   **Series 7 License**: Official stock broker certificate.
*   **LLC Registration**: Legal document with wax seal.
*   **University Diploma**: Data Science Degree.

### 4. Event Visuals
*   **Newspaper Interaction**: Animated headlines flying in.
*   **Stock Crash**: Red arrows, panic animations.
*   **Wedding**: Ceremony visual (Good/Bad variations).

---

## 🛠 Tech Stack
-   **Frontend**: Vanilla JS + CSS (No heavy frameworks for raw performance).
-   **Art**: AI-Generated Vector Art (Vibrant Flat Style).
-   **Animation**: Pure CSS Micro-Animations.
- **Core Logic**: C++ compiled to WebAssembly via Emscripten
- **Build**: Vite for fast development and bundling
- **Storage**: LocalStorage for save data

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- (Optional) Emscripten SDK for WASM compilation

### Quick Start

```bash
# Clone the repository
cd data_science_dev_game

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Building WASM (Optional)

If you want to compile the C++ core:

```bash
# Install Emscripten (https://emscripten.org/docs/getting_started/downloads.html)
source /path/to/emsdk/emsdk_env.sh

# Build WASM
npm run build:wasm
```

### Production Build

```bash
npm run build
npm run preview
```

## 🎯 Game Mechanics

### Chart Type Scoring

| Data Type | Best Charts | Acceptable | Poor Choice |
|-----------|-------------|------------|-------------|
| Trends over time | Line, Area | Bar | Pie |
| Category comparison | Bar | Treemap | Line |
| Part-to-whole | Pie, Donut | Stacked Bar | Scatter |
| Correlations | Scatter | Heatmap | Pie |

### Career Progression

| Rank | Title | Salary Multiplier | Rep Required |
|------|-------|-------------------|--------------|
| 1 | Data Entry Clerk | 1.0x | 0 |
| 2 | Junior Analyst | 1.5x | 100 |
| 3 | Data Analyst | 2.0x | 300 |
| 4 | Senior Analyst | 3.0x | 600 |
| 5 | Lead Data Scientist | 5.0x | 1,200 |
| 6 | Principal Scientist | 8.0x | 2,500 |
| 7 | Chief Data Officer | 15.0x | 5,000 |

## 🗂️ Project Structure

```
data_science_dev_game/
├── src/
│   ├── cpp/             # C++ WASM core
│   │   ├── main.cpp
│   │   ├── game_state.*
│   │   ├── data_generator.*
│   │   ├── scorer.*
│   │   ├── economy.*
│   │   └── task_system.*
│   │
│   ├── js/              # JavaScript frontend
│   │   ├── main.js
│   │   ├── game/        # Game systems
│   │   ├── ui/          # UI components
│   │   ├── charts/      # Chart.js integration
│   │   ├── audio/       # Sound system
│   │   ├── save/        # Save/load
│   │   └── data/        # Game content
│   │
│   └── styles/          # CSS
│       ├── main.css
│       ├── components.css
│       └── animations.css
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### Education Assets
- [ ] **Professor NPC**: Older, academic look, tweed jacket. 'professor_higgins.png'.
- [ ] **Exam Icons**: Diploma, F Grade paper, A+ Grade paper.
- [ ] **University Background**: Lecture hall or campus gate.

## 🎨 Design Philosophy

- **Dark Corporate Aesthetic** - Sleek, professional look with glassmorphism
- **Low Poly Art Style** - All game assets use low poly aesthetic (no 8-bit/pixel art)
- **Micro-animations** - Satisfying feedback for every interaction
- **Responsive Design** - Playable on desktop and tablets
- **Accessibility** - Respects reduced motion preferences

### Art Style: Low Poly Theme

This game uses a **low poly aesthetic** throughout:
- **Character Assets**: 110 low poly character images (128x128+ dimensions)
- **Location Backgrounds**: 20 high-resolution backgrounds (1920x1080)
- **Map Assets**: 40 low poly map elements (trees: 128x128, roads: 256x64, buildings: 128x192, houses: 128x128)
- **No 8-bit/Pixel Art**: All assets have been curated to exclude 8-bit style sprites

All assets have been analyzed, curated, and bundled to maintain visual consistency with the low poly theme.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🎨 Asset Credits & Attribution

This game uses free and open-source game assets from various creators. All assets are properly licensed and credited below. We are grateful to the open-source game development community for making these resources available.

**All assets have been scraped, downloaded, curated, and organized from real sources - no placeholders used.**

**Asset Curation**: All assets have been analyzed and curated to maintain a consistent **low poly aesthetic**. All 8-bit/pixel art style assets (≤64x64) have been completely removed and replaced with high-quality low poly alternatives (128x128+). **Zero 8-bit assets remain in the project.**

**License Note**: This is a **non-commercial project** (not for sale), so all free assets are used regardless of license restrictions. All assets are properly credited below.

**8-Bit Asset Removal**: All 8-bit/pixel art assets (≤64x64) have been completely removed. The project now uses **100% low poly assets** (128x128+ dimensions) for a consistent visual aesthetic.

**Asset Organization**: All assets are organized in specific subfolders with meaningful names:
- `assets/icons/locations/` - Location icons (20 files)
- `assets/icons/npcs/` - NPC type icons (10 files)
- `assets/icons/ui/` - UI element icons (9 files)
- `assets/icons/vehicles/` - Vehicle icons (4 files)
- `assets/icons/items/` - Item icons (6 files)
- `assets/icons/features/` - Location feature icons (8 files)
- `assets/icons/charts/` - Chart type icons (6 files)
- `assets/backgrounds/locations/` - Location backgrounds (20 files)
- `assets/map/` - Map assets (trees, roads, buildings, houses - 40 files)
- `public/assets/npcs/` - Character images (110 files)

**Total: 233 organized assets** - All properly named and categorized for easy use in code.

### Character Assets

**Intersect Game Engine Assets**
- **Source**: [AscensionGameDev/Intersect-Assets](https://github.com/AscensionGameDev/Intersect-Assets) on GitHub
- **License**: Free for commercial use
- **Usage**: Character sprites, equipment, and accessories
- **Files**: All files in `public/assets/npcs/` (except existing custom assets)
- **Credits**: AscensionGameDev

**Universal LPC Spritesheet**
- **Source**: [Universal-LPC-Spritesheet](https://github.com/jrconway3/Universal-LPC-Spritesheet) on GitHub
- **License**: CC-BY-SA 3.0 / GPL 3.0
- **Usage**: Base character sprites and modular character parts
- **Credits**: Universal LPC Spritesheet contributors

**GDQuest Game Sprites**
- **Source**: [GDQuest/game-sprites](https://github.com/GDQuest/game-sprites) on GitHub
- **License**: CC0 (Public Domain)
- **Usage**: Additional character sprites and UI elements
- **Credits**: GDQuest

**Custom Character Assets**
- `alex_young.png` - Custom asset
- `player_young.png` - Custom asset
- `loan_shark.png` - Custom asset
- `the_broker.png` - Custom asset
- `the_hacker.png` - Custom asset
- `npc_good_character_1765747743170.png` - Custom asset

### Location Background Assets

**LPC Spritesheet Assets**
- **Source**: [Universal-LPC-Spritesheet](https://github.com/jrconway3/Universal-LPC-Spritesheet) on GitHub
- **License**: CC-BY-SA 3.0 / GPL 3.0
- **Usage**: Location background images (processed and resized)
- **Files**: All files in `assets/backgrounds/locations/`
- **Credits**: Universal LPC Spritesheet contributors

**Intersect Game Engine Assets**
- **Source**: [AscensionGameDev/Intersect-Assets](https://github.com/AscensionGameDev/Intersect-Assets) on GitHub
- **License**: Free for commercial use
- **Usage**: Additional background elements and textures
- **Credits**: AscensionGameDev

### Map Assets (Low Poly Style)

**Map Tiles (Trees, Roads, Buildings, Houses)**
- **Source**: Created from Intersect Assets and LPC Sprites (large format images)
- **License**: Same as source assets (Free for commercial use / CC-BY-SA 3.0)
- **Usage**: World map rendering - trees, roads, buildings, and houses
- **Style**: Low poly (trees: 128x128, roads: 256x64, buildings: 128x192, houses: 128x128)
- **Files**: `assets/map/trees/`, `assets/map/roads/`, `assets/map/buildings/`, `assets/map/houses/`
- **Credits**: Derived from Intersect Assets and Universal LPC Spritesheet
- **Curation**: All 8-bit style map assets have been replaced with low poly versions

**House Simple SVG**
- **Source**: Custom/Internal
- **License**: Internal use
- **Usage**: Fallback location background
- **File**: `assets/backgrounds/locations/house_simple.svg`

### Asset Organization

- **Character Images**: `public/assets/npcs/`
  - Organized by type: `{type}_{variant}.png` (e.g., `mentor_0.png`, `business_1.png`)
  - Types: mentor, business, investor, shopkeeper, friend, rival, criminal, romance, authority, service
  
- **Location Backgrounds**: `assets/backgrounds/locations/`
  - Named by location ID: `{location_id}.png` (e.g., `home.png`, `office.png`)
  - All 19 locations have unique backgrounds

- **Map Assets**: `assets/map/`
  - Trees, roads, buildings, and houses for world map rendering

### License Compliance

All assets used in this project comply with their respective licenses:
- **CC0**: Public domain, no attribution required
- **CC-BY-SA 3.0**: Attribution and share-alike required
- **Free for Commercial Use**: As specified by creators
- **Custom Assets**: Internal use only

### Character Theme Organization

Characters are organized into consistent themes for visual coherence:

- **Professional Theme**: mentor, business, investor, authority (40 files)
  - Business attire, formal appearance
  - Suits, professional clothing
  
- **Casual Theme**: friend, shopkeeper, service (30 files)
  - Everyday clothing, relaxed appearance
  - Casual wear, friendly appearance
  
- **Competitive Theme**: rival (10 files)
  - Competitive appearance
  - Sharp, determined look
  
- **Criminal Theme**: criminal (10 files)
  - Shady appearance
  - Darker tones, mysterious look
  
- **Romance Theme**: romance (10 files)
  - Attractive, appealing appearance
  - Warm, friendly appearance

All characters within each theme share a consistent visual style to maintain game aesthetic coherence.

### Free Asset Sources Used (Non-Commercial Project)

Since this is a non-commercial project, we've utilized free assets from multiple sources:

**Primary Sources:**
- **Intersect Game Engine Assets** (GitHub) - Character sprites, equipment, large format images
- **Universal LPC Spritesheet** (GitHub) - Modular character system, character parts
- **GDQuest Game Sprites** (GitHub) - Additional character sprites, CC0 license

**Additional Free Resources Available:**
- **Poly Haven** (polyhaven.com) - CC0 3D models, textures, HDRIs
- **Quaternius** (quaternius.com) - CC0 low poly 3D models
- **Kenney.nl** - Free game assets (CC0)
- **OpenGameArt.org** - Free game assets repository

All assets have been curated to maintain a consistent low poly aesthetic (128x128+ dimensions).

### Special Thanks

We thank all the open-source game asset creators who make projects like this possible:
- **AscensionGameDev** for Intersect Assets (character sprites, equipment)
- **Universal LPC Spritesheet contributors** for modular character system
- **GDQuest** for free game sprites (CC0)
- **Poly Haven** for CC0 3D assets
- **Quaternius** for CC0 low poly models
- **Kenney.nl** for free game assets
- All other asset creators who share their work freely

Without the generosity of the open-source game development community, projects like this would not be possible.

---

## 📄 License

MIT License - feel free to use this project for learning and fun!

---

Made with 📊 and ☕ by Data Science Enthusiasts
# Data_science_dev
# Data_science_dev
# Data_science_dev
# Data_science_dev
