# Data Science Tycoon

Web-based simulation game. Start as a Data Entry Clerk, complete data science tasks, and climb to Chief Data Officer.

## Core Gameplay

1. **Receive Task** - Boss assigns data visualization task with specific requirements
2. **Analyze Data** - Review dataset characteristics (type, size, patterns)
3. **Create Chart** - Select chart type, customize styling, configure options
4. **Submit & Score** - Boss rates work (1-5 stars) based on chart appropriateness and quality
5. **Earn & Progress** - Gain money and reputation, unlock ranks, access new locations

## Key Systems

### Task System
- **1000 data science tasks** across 9 domains (finance, healthcare, e-commerce, marketing, manufacturing, telecom, transportation, energy, education)
- Difficulty scales 1.0-9.8 with progression
- Tasks include specific numbers, tools, deliverables, and real-world context
- Each task specifies optimal/acceptable chart types

### Progression
- **7 Ranks**: Data Entry Clerk → Junior Analyst → Data Analyst → Senior Analyst → Lead Data Scientist → Principal Scientist → Chief Data Officer
- **Reputation system** unlocks promotions
- **Money system** for purchases (hardware, software, training)
- **Skill system** (Python, SQL, Statistics, ML, Communication, Charisma)

### World & Locations
- **19 locations**: Apartment, Office, Library, Gym, Coffee Shop, Park, Mall, University, Tech Hub, Downtown, Luxury District, Networking Bar, Car Dealership, Club, Forest, Real Estate, Bank
- Dynamic backgrounds with time-of-day and weather
- Map navigation system
- Location-specific activities and NPCs

### NPCs & Relationships
- Multiple NPCs with dialogue trees
- Relationship tracking with emotional states
- Romance system
- Storyline progression with branching narratives

### Time Management
- Day/night cycle (6 time slots per day)
- Activities consume time slots
- Weekly cycles with rent, events, news

### Additional Systems
- **Bank System**: Savings, loans, investments
- **Contract System**: Freelance projects with multi-stage completion
- **Stock Market**: Trading and portfolio management
- **Education System**: University courses and certifications
- **Crime System**: Optional illegal activities with consequences
- **AI Companion**: Automated work assistance
- **Hardware/Software**: Performance upgrades

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules), CSS3
- **Build Tool**: Vite
- **WASM Core**: C++ compiled to WebAssembly via Emscripten (optional)
- **Rendering**: PixiJS for sprites, Chart.js for data visualizations
- **State Management**: Zustand
- **Testing**: Vitest
- **Storage**: LocalStorage

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Build WASM (Optional)

```bash
# Requires Emscripten SDK
source /path/to/emsdk/emsdk_env.sh
npm run build:wasm
```

## Project Structure

```
src/
├── js/
│   ├── main.js              # Entry point, game initialization
│   ├── game/                # Core game systems
│   │   ├── GameState.js     # Central state management
│   │   ├── TaskSystem.js    # Task generation and management
│   │   ├── JobSystem.js     # Career progression
│   │   ├── TimeManager.js   # Day/night cycle
│   │   ├── NPCManager.js    # NPC system
│   │   ├── WorldMap.js      # Location system
│   │   └── [30+ systems]    # Specialized subsystems
│   ├── ui/                  # UI components and managers
│   ├── charts/              # Chart.js integration
│   ├── audio/               # Sound system
│   ├── save/                # Save/load system
│   ├── data/                # Game content (tasks, ranks, NPCs)
│   └── dev/                 # Developer tools and testing
├── styles/                  # CSS files (modular)
├── cpp/                     # C++ WASM core (optional)
└── assets/                  # Game assets

scripts/                     # Build and utility scripts
test/                        # Unit tests
```

## Development

- **Dev Mode**: Set `localStorage.setItem('dev_mode', 'true')` to enable dev menu
- **Testing**: `npm test` (Vitest)
- **Linting**: Custom static analysis in `scripts/static-bug-check.js`

## Key Files

- `src/js/main.js` - Game initialization and main loop
- `src/js/game/GameState.js` - Core state management
- `src/js/game/TaskSystem.js` - Task logic
- `src/js/data/comprehensive_datascience_tasks.js` - 1000 task database
- `index.html` - Main HTML structure

## Asset Management

- Large assets (sprites, backgrounds) are gitignored
- Compression scripts in `scripts/` for asset optimization
- See `ASSETS_README.md` for asset management details

## License

MIT
