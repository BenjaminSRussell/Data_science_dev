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
- **Micro-animations** - Satisfying feedback for every interaction
- **Responsive Design** - Playable on desktop and tablets
- **Accessibility** - Respects reduced motion preferences

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning and fun!

---

Made with 📊 and ☕ by Data Science Enthusiasts
# Data_science_dev
# Data_science_dev
# Data_science_dev
