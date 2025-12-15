/**
 * Data Science Tycoon - Main Entry Point
 * Initializes the game and manages global state
 */

import { GameState } from './game/GameState.js';
import { ScreenManager } from './ui/ScreenManager.js';
import { ChartManager } from './charts/ChartManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { SaveManager } from './save/SaveManager.js';
import { TaskSystem } from './game/TaskSystem.js';
import { EconomySystem } from './game/EconomySystem.js';
import { BankSystem } from './game/BankSystem.js';
import { UIUpdater } from './ui/UIUpdater.js';
import { EnvironmentManager } from './game/EnvironmentManager.js';
import { CharacterStats, STATS, TRAINING_ACTIVITIES } from './game/CharacterStats.js';
import { TimeManager } from './game/TimeManager.js';
import { WorldMap } from './game/WorldMap.js';
import { NPCManager, NPCs } from './game/NPCManager.js';
import { NewsManager } from './game/NewsManager.js';
import { StockMarket } from './game/StockMarket.js';
import { CrimeSystem } from './game/CrimeSystem.js';
import { RomanceSystem } from './game/RomanceSystem.js';
import { LegalSystem } from './game/LegalSystem.js';
import { EducationSystem } from './game/EducationSystem.js';
import { WorldEventManager } from './game/WorldEventManager.js';
import { ProjectSystem } from './game/ProjectSystem.js';
import { AISystem } from './game/AISystem.js';
import { HardwareManager } from './game/HardwareSystems.js'; // NEW
import { LIBRARY_CONTENT, CATEGORIES } from './game/LibraryDatabase.js';

let game = null; // Declare game instance

export class MainGame {
    constructor() {
        this.gameState = new GameState();
        this.saveManager = new SaveManager();
        this.taskSystem = new TaskSystem(this.gameState);
        this.uiUpdater = new UIUpdater(this);
        this.screenManager = new ScreenManager(this);
        this.chartManager = new ChartManager(this);
        this.environmentManager = new EnvironmentManager(this.gameState);
        this.audioManager = new AudioManager();
        this.gameLoopId = null;
        this.lastTime = 0;
        this.bankSystem = null; // Initialize placeholder

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleTimeAdvance = this.handleTimeAdvance.bind(this);
        // this.init = this.init.bind(this); // specific bind not needed and causing issues
        this.startNewGame = this.startNewGame.bind(this);
        this.continueGame = this.continueGame.bind(this);

        // this.init(); // Init is called in DOMContentLoaded
    }

    /**
     * Initialize the game
     */
    async init() {
        console.log('🎮 Initializing Data Science Tycoon...');

        try {
            console.log('DEBUG: Attempting to load game...');
            // Load saved game if exists
            const hasSave = this.saveManager.loadGame(this.gameState);
            console.log('DEBUG: Game loaded (save found: ' + hasSave + ')');

            console.log('DEBUG: Initializing ScreenManager...');
            // Initialize UI
            this.screenManager.init();

            console.log('DEBUG: Initializing ChartManager...');
            this.chartManager.init();

            console.log('DEBUG: Initializing EnvironmentManager...');
            // Initialize environment (backgrounds, weather, etc.)
            this.environmentManager.init();
            console.log('DEBUG: EnvironmentManager initialized');

            // Enable continue button if save exists
            if (hasSave) {
                const continueBtn = document.getElementById('btn-continue');
                if (continueBtn) {
                    continueBtn.disabled = false;
                }
            }

            console.log('DEBUG: Setting up event listeners...');
            // Setup event listeners
            this.setupEventListeners();
            console.log('DEBUG: Event listeners set up');

            // Hide loading screen, show game
            this.showGame();

            console.log('✅ Game initialized successfully!');

        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            console.error('Stack trace:', error.stack);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Main Menu buttons
        document.getElementById('btn-new-game')?.addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('btn-continue')?.addEventListener('click', () => {
            this.continueGame();
        });

        document.getElementById('btn-tutorial')?.addEventListener('click', () => {
            this.showTutorial();
        });

        // Game screen buttons
        document.getElementById('btn-create-chart')?.addEventListener('click', () => {
            this.openChartStudio();
        });

        // Chart studio buttons
        document.getElementById('btn-back-to-office')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game');
        });

        document.getElementById('btn-submit-chart')?.addEventListener('click', () => {
            this.submitChart();
        });

        // Review screen
        document.getElementById('btn-next-task')?.addEventListener('click', () => {
            this.nextTask();
        });

        // Navigation buttons
        document.getElementById('btn-nav-career')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-career');
            this.uiUpdater.updateCareerScreen();
        });

        document.getElementById('btn-nav-shop')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-shop');
            this.uiUpdater.updateShopScreen();
        });

        document.getElementById('btn-nav-newspaper')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-newspaper');
            this.uiUpdater.updateNewspaperScreen();
        });

        // New tycoon navigation
        document.getElementById('btn-nav-office')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-office');
            this.updateOfficeScreen();
        });

        document.getElementById('btn-nav-clients')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-clients');
            this.updateClientsScreen();
        });

        document.getElementById('btn-nav-staff')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-staff');
            this.updateStaffScreen();
        });

        // RPG Navigation
        document.getElementById('btn-nav-map')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-map');
            this.updateMapScreen();
        });

        document.getElementById('btn-nav-stats')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-stats');
            this.updateStatsScreen();
        });

        // Back buttons
        document.getElementById('btn-back-career')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game');
        });

        document.getElementById('btn-back-shop')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game');
        });

        document.getElementById('btn-back-office')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game');
        });

        document.getElementById('btn-back-clients')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game');
        });

        document.getElementById('btn-back-staff')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game');
        });

        document.getElementById('btn-back-map')?.addEventListener('click', () => {
            const loc = this.worldMap.currentLocation;
            const locData = this.worldMap.getLocation(loc);
            if (locData && locData.type === 'shop') {
                this.screenManager.showScreen('screen-office');
                this.updateOfficeScreen();
            } else {
                this.screenManager.showScreen('screen-game');
            }
        });

        document.getElementById('btn-back-stats')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game');
        });

        document.getElementById('btn-close-paper')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game');
        });

        document.getElementById('btn-back-relationships')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-stats');
        });

        document.getElementById('btn-back-market')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-map');
            this.updateMapScreen();
        });

        // Stats/Relationship internal nav
        document.getElementById('btn-view-relationships')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-relationships');
            this.updateRelationshipsScreen();
        });

        // Map Interactions
        document.getElementById('btn-sleep')?.addEventListener('click', () => {
            if (this.worldMap.currentLocation !== 'home') {
                this.showError("You can only sleep at home! Travel home first.");
                return;
            }
            const result = this.timeManager.sleep();
            this.handleTimeAdvance(result.slotsSkipped); // triggers new day
            this.updateMapScreen();
            this.showToast('You slept well and feel refreshed!', 'success');
        });

        const mapContainer = document.getElementById('world-map');
        if (mapContainer) {
            mapContainer.addEventListener('click', (e) => {
                const locationEl = e.target.closest('.map-location');
                if (locationEl && !locationEl.classList.contains('locked')) {
                    this.handleTravel(locationEl.dataset.location);
                } else if (locationEl && locationEl.classList.contains('locked')) {
                    // Show requirement info?
                    const locId = locationEl.dataset.location;
                    const loc = this.worldMap?.getAccessibleLocations().find(l => l.id === locId);
                    if (!loc && this.worldMap) {
                        // Find why it's locked from full list
                        // For now just generic message
                        this.showError("This location is locked.");
                    }
                }
            });
        }

        // Vehicle selection
        const vehicleOptions = document.getElementById('vehicle-options');
        if (vehicleOptions) {
            vehicleOptions.addEventListener('click', (e) => {
                const option = e.target.closest('.vehicle-option');
                if (!option) return;

                const vehicleId = option.dataset.vehicle;
                // Check if owned
                if (this.worldMap.ownedVehicles.includes(vehicleId)) {
                    this.worldMap.switchVehicle(vehicleId);
                    this.updateMapScreen();
                } else {
                    // Try to buy
                    const vehicle = this.worldMap.getVehicle(vehicleId);
                    if (confirm(`Buy ${vehicle.name} for $${vehicle.price}?`)) {
                        const result = this.worldMap.buyVehicle(vehicleId);
                        if (result.success) {
                            this.showToast(`Bought ${vehicle.name}!`, 'success');
                            this.updateMapScreen();
                        } else {
                            this.showError(result.reason);
                        }
                    }
                }
            });
        }

        // Training buttons
        const trainingGrid = document.getElementById('training-grid');
        if (trainingGrid) {
            trainingGrid.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const card = e.target.closest('.training-card');
                    if (card) {
                        this.handleTraining(card.dataset.activity);
                    }
                }
            });
        }

        // Chart type selection
        document.getElementById('chart-type-grid')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.chart-type-btn');
            if (btn && !btn.classList.contains('locked')) {
                this.selectChartType(btn.dataset.type);
            }
        });

        // Color palette selection
        document.getElementById('color-palette')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.palette-btn');
            if (btn) {
                this.selectColorPalette(btn.dataset.palette);
            }
        });

        // Chart customization toggles
        document.getElementById('show-legend')?.addEventListener('change', () => {
            this.updateChartPreview();
        });

        document.getElementById('show-grid')?.addEventListener('change', () => {
            this.updateChartPreview();
        });

        document.getElementById('show-data-labels')?.addEventListener('change', () => {
            this.updateChartPreview();
        });

        document.getElementById('chart-title')?.addEventListener('input', () => {
            this.updateChartPreview();
        });

        // Settings & Sound
        document.getElementById('btn-settings')?.addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('btn-sound')?.addEventListener('click', () => {
            this.toggleSound();
        });

        // Shop category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.uiUpdater.updateShopScreen(btn.dataset.category);
            });
        });

        // --- Bank System Listeners ---
        document.getElementById('btn-nav-bank')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-bank');
            this.uiUpdater.updateBankScreen();
        });

        document.getElementById('btn-close-bank')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game'); // Return to office
        });

        // Bank Actions
        const handleBankAction = (action, inputId) => {
            const input = document.getElementById(inputId);
            const amount = parseInt(input?.value || 0);

            if (!this.bankSystem) return;
            if (isNaN(amount) || amount <= 0) {
                this.showToast('Invalid amount', 'error');
                return;
            }

            let result;
            if (action === 'deposit') result = this.bankSystem.deposit(amount);
            else if (action === 'withdraw') result = this.bankSystem.withdraw(amount);
            else if (action === 'loan') result = this.bankSystem.takeLoan(amount);
            else if (action === 'repay') result = this.bankSystem.repayLoan(amount);

            if (result.success) {
                this.showToast(result.message, 'success');
                this.audioManager.play('kaching');
                input.value = ''; // Clear input
                this.uiUpdater.updateAllUI(); // Updates top bar and bank screen
            } else {
                this.showToast(result.message, 'error');
                this.audioManager.play('error');
            }
        };

        document.getElementById('btn-bank-deposit')?.addEventListener('click', () => handleBankAction('deposit', 'bank-deposit-input'));
        document.getElementById('btn-bank-withdraw')?.addEventListener('click', () => handleBankAction('withdraw', 'bank-withdraw-input'));
        document.getElementById('btn-bank-take-loan')?.addEventListener('click', () => handleBankAction('loan', 'bank-loan-input'));
        document.getElementById('btn-bank-repay')?.addEventListener('click', () => handleBankAction('repay', 'bank-repay-input'));

        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState.isGameStarted) {
                this.saveManager.saveGame(this.gameState);
            }
        });
    }

    /**
     * Hide loading screen and show the game
     */
    showGame() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const gameContainer = document.getElementById('game-container');

            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                }, 300);
            }

            if (gameContainer) {
                gameContainer.classList.remove('hidden');
            }
        }, 2000); // Show loading screen for 2 seconds
    }

    /**
     * Start a new game
     */
    /**
     * Start a new game
     */
    startNewGame() {
        console.log('🚀 Starting new game...');

        try {
            // Reset game state
            this.gameState.reset();
            this.gameState.isGameStarted = true;
            console.log('DEBUG [startNewGame]: gameState reset');

            // Initialize RPG systems
            this.gameState.characterStats = new CharacterStats();
            this.gameState.timeManager = new TimeManager();
            this.gameState.economySystem = new EconomySystem(this.gameState);
            this.bankSystem = new BankSystem(this.gameState); // Initialize BankSystem
            this.gameState.worldMap = new WorldMap(this.gameState);
            this.gameState.npcManager = new NPCManager(this.gameState);
            this.gameState.newsManager = new NewsManager(this.gameState);
            this.gameState.stockMarket = new StockMarket(this.gameState);
            this.gameState.crimeSystem = new CrimeSystem(this.gameState);
            this.gameState.romanceSystem = new RomanceSystem(this.gameState);
            this.gameState.legalSystem = new LegalSystem(this.gameState);
            this.gameState.educationSystem = new EducationSystem(this.gameState);
            this.gameState.worldEventManager = new WorldEventManager(this.gameState);
            this.gameState.projectSystem = new ProjectSystem(this.gameState);
            this.gameState.aiSystem = new AISystem(this.gameState);
            this.gameState.hardwareManager = new HardwareManager(this.gameState); // NEW
            console.log('DEBUG [startNewGame]: all systems initialized');

            // Link managers to main class for easy access
            this.characterStats = this.gameState.characterStats;
            this.timeManager = this.gameState.timeManager;
            this.worldMap = this.gameState.worldMap;
            this.npcManager = this.gameState.npcManager;
            this.newsManager = this.gameState.newsManager;
            this.stockMarket = this.gameState.stockMarket;
            this.crimeSystem = this.gameState.crimeSystem;
            this.romanceSystem = this.gameState.romanceSystem;
            this.legalSystem = this.gameState.legalSystem;
            this.educationSystem = this.gameState.educationSystem;
            this.worldEventManager = this.gameState.worldEventManager;
            this.projectSystem = this.gameState.projectSystem;
            this.aiSystem = this.gameState.aiSystem;
            this.hardwareManager = this.gameState.hardwareManager; // NEW
            console.log('DEBUG [startNewGame]: managers linked');

            // Generate first task
            this.taskSystem.generateNewTask();
            console.log('DEBUG [startNewGame]: first task generated');

            // Generate initial news
            this.newsManager.generateDailyNews();
            console.log('DEBUG [startNewGame]: news generated');

            // Update UI
            this.uiUpdater.updateAllUI();
            console.log('DEBUG [startNewGame]: UI updated');

            this.updateMapScreen(); // Initial map update
            console.log('DEBUG [startNewGame]: map updated');

            // Update environment (office location, weather)
            this.environmentManager.updateLocation();
            console.log('DEBUG [startNewGame]: environment updated');

            // Show game screen
            this.screenManager.showScreen('screen-game');
            console.log('DEBUG [startNewGame]: showScreen called');

            // Play sound
            this.audioManager.play('start');

            // Show toast
            this.showToast('Welcome to your new career!', 'success');
            console.log('DEBUG [startNewGame]: COMPLETE');
        } catch (error) {
            console.error('❌ startNewGame ERROR:', error);
            console.error('Stack:', error.stack);
        }
    }


    /**
     * Continue saved game
     */
    continueGame() {
        console.log('💼 Continuing saved game...');

        // Initialize RPG systems if they don't exist (migration)
        if (!this.gameState.characterStats) this.gameState.characterStats = new CharacterStats();
        else {
            const stats = new CharacterStats();
            stats.fromJSON(this.gameState.characterStats);
            this.gameState.characterStats = stats;
        }

        if (!this.gameState.timeManager) this.gameState.timeManager = new TimeManager();
        else {
            const time = new TimeManager();
            time.fromJSON(this.gameState.timeManager);
            this.gameState.timeManager = time;
        }

        if (!this.gameState.worldMap) this.gameState.worldMap = new WorldMap(this.gameState);
        else {
            const map = new WorldMap(this.gameState);
            map.fromJSON(this.gameState.worldMap);
            this.gameState.worldMap = map;
        }

        if (!this.gameState.npcManager) this.gameState.npcManager = new NPCManager(this.gameState);
        else {
            const npc = new NPCManager(this.gameState);
            npc.fromJSON(this.gameState.npcManager);
            this.gameState.npcManager = npc;
        }

        if (!this.gameState.newsManager) this.gameState.newsManager = new NewsManager(this.gameState);
        else {
            const news = new NewsManager(this.gameState);
            news.fromJSON(this.gameState.newsManager);
            this.gameState.newsManager = news;
        }

        if (!this.gameState.stockMarket) this.gameState.stockMarket = new StockMarket(this.gameState);
        else {
            const market = new StockMarket(this.gameState);
            market.fromJSON(this.gameState.stockMarket);
            this.gameState.stockMarket = market;
        }

        if (!this.gameState.crimeSystem) this.gameState.crimeSystem = new CrimeSystem(this.gameState);
        else {
            const crime = new CrimeSystem(this.gameState);
            crime.fromJSON(this.gameState.crimeSystem);
            this.gameState.crimeSystem = crime;
        }

        if (!this.gameState.romanceSystem) this.gameState.romanceSystem = new RomanceSystem(this.gameState);
        else {
            const romance = new RomanceSystem(this.gameState);
            romance.fromJSON(this.gameState.romanceSystem);
            this.gameState.romanceSystem = romance;
        }

        if (!this.gameState.legalSystem) this.gameState.legalSystem = new LegalSystem(this.gameState);
        else {
            const legal = new LegalSystem(this.gameState);
            legal.fromJSON(this.gameState.legalSystem);
            this.gameState.legalSystem = legal;
        }

        if (!this.gameState.worldEventManager) this.gameState.worldEventManager = new WorldEventManager(this.gameState);
        else {
            const worldEvents = new WorldEventManager(this.gameState);
            worldEvents.fromJSON(this.gameState.worldEventManager);
            this.gameState.worldEventManager = worldEvents;
        }

        if (!this.gameState.educationSystem) this.gameState.educationSystem = new EducationSystem(this.gameState);
        else {
            const edu = new EducationSystem(this.gameState);
            edu.fromJSON(this.gameState.educationSystem);
            this.gameState.educationSystem = edu;
        }

        // Link managers
        this.characterStats = this.gameState.characterStats;
        this.timeManager = this.gameState.timeManager;
        this.worldMap = this.gameState.worldMap;
        this.npcManager = this.gameState.npcManager;
        this.newsManager = this.gameState.newsManager;
        this.stockMarket = this.gameState.stockMarket;
        this.crimeSystem = this.gameState.crimeSystem;
        this.romanceSystem = this.gameState.romanceSystem;
        this.legalSystem = this.gameState.legalSystem;
        this.educationSystem = this.gameState.educationSystem;
        this.worldEventManager = this.gameState.worldEventManager;
        this.projectSystem = this.gameState.projectSystem;
        this.projectSystem = this.gameState.projectSystem;
        this.aiSystem = this.gameState.aiSystem;

        // Initialize BankSystem
        this.bankSystem = new BankSystem(this.gameState);
        // Link specific bank state if needed, but BankSystem constructor uses gameState directly

        // Reload save data now that subsystems are initialized
        console.log("DEBUG: Reloading save data for subsystems...");
        this.saveManager.loadGame(this.gameState);

        // Generate a new task if none exists
        if (!this.gameState.currentTask) {
            this.taskSystem.generateNewTask();
        }

        // Update UI with loaded state
        this.uiUpdater.updateAllUI();
        this.updateMapScreen();

        // Update environment (may have promoted since last save)
        this.environmentManager.updateLocation();

        // Show game screen
        this.screenManager.showScreen('screen-game');

        // Show toast
        this.showToast('Welcome back!', 'success');
    }

    // ... (existing helper methods)

    /* =====================================================
       RPG UPDATE METHODS
       ===================================================== */

    // ... (existing methods)

    // Append this to end or inside class

    updateStockMarketScreen() {
        if (!this.stockMarket) return;

        const grid = document.getElementById('stock-grid');
        if (!grid) return;

        grid.innerHTML = '';

        this.stockMarket.stocks.forEach(stock => {
            const owned = this.stockMarket.portfolio.getQuantity(stock.id);
            const card = document.createElement('div');
            card.className = 'stock-card';

            // Calculate change (mock for now, or based on history)
            const lastPrice = stock.history.length > 1 ? stock.history[stock.history.length - 2] : stock.price;
            const change = ((stock.price - lastPrice) / lastPrice) * 100;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSymbol = change >= 0 ? '▲' : '▼';

            // Illegal Actions Check
            let illegalActionsHtml = '';
            // If Ethics < -10, show Pump & Dump option
            // If Ethics < -30, show Insider Pump (needs NPC?)
            if (this.characterStats.ethics < -10) {
                illegalActionsHtml = `
                    <div class="stock-actions-illegal" style="margin-top: 5px; border-top: 1px dashed red; padding-top: 5px;">
                        <button class="btn-cartoon btn-sm btn-danger" onclick="game.handleCrime('pump_dump', '${stock.id}')">⚡ Pump & Dump</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="stock-header">
                    <div class="stock-ticker">${stock.ticker}</div>
                    <div class="stock-price">$${stock.price.toFixed(2)}</div>
                </div>
                <div class="stock-name">${stock.name}</div>
                <div class="stock-change ${changeClass}">${changeSymbol} ${Math.abs(change).toFixed(2)}%</div>
                <div class="stock-holdings">Owned: ${owned}</div>
                <div class="stock-actions">
                    <button class="btn-cartoon btn-sm" onclick="game.handleBuyStock('${stock.id}')">Buy</button>
                    <button class="btn-cartoon btn-sm" onclick="game.handleSellStock('${stock.id}')">Sell</button>
                </div>
                ${illegalActionsHtml}
            `;
            grid.appendChild(card);
        });

        // Update portfolio summary
        document.getElementById('portfolio-value').textContent = `$${this.stockMarket.getPortfolioValue().toFixed(2)}`;
        document.getElementById('liquid-cash').textContent = `$${this.gameState.money.toFixed(2)}`;

        // Show Heat if active
        // Maybe add Heat Display to market screen?
    }

    handleCrime(type, params) {
        if (!confirm("⚠️ This is illegal! If caught, you could go to jail. Proceed?")) return;

        const result = this.crimeSystem.commitCrime(type, params);
        if (result.success) {
            this.showToast(result.message, 'success');
            if (result.profit) {
                this.showToast(`Profit: $${result.profit}`, 'success');
            }
            this.updateStockMarketScreen();
            this.uiUpdater.updateAllUI();
        } else {
            if (result.caught) {
                this.handleArrest(result.message);
            } else {
                this.showToast(result.message, 'warning');
            }
        }
    }

    updateStatsScreen() {
        const stats = this.characterStats.stats;
        const level = this.characterStats.level;
        const xp = this.characterStats.experience;
        const xpNext = this.characterStats.xpPerLevel;

        document.getElementById('stats-level').textContent = `Level ${level}`;
        document.getElementById('stats-ethics').textContent = `Ethics: ${this.characterStats.ethics}`;

        // Character Image (Dynamic)
        // For now, use the static start image but apply "Alive" class
        const charContainer = document.getElementById('character-preview'); // Ensure this ID exists in HTML
        if (charContainer) {
            let playerImage = '/assets/npcs/player_young.png';
            // Logic to switch image based on evolution would go here
            // e.g. if (this.characterStats.physics.clothes === 'expensive_suit') playerImage = '/assets/npcs/player_evil.png';

            charContainer.innerHTML = `
                <img src="${playerImage}" class="char-sprite char-alive" alt="Player Character">
            `;
        }

        // ... existing stat updates ...
    }

    // ... existing relationship update ...

    handleVisitNPC(npcId) {
        // Show modal with full body
        const npc = this.gameState.npcManager.getNPC(npcId);
        if (!npc) return;

        const tier = this.gameState.npcManager.getRelationshipTier(npc.id);

        // Create or get modal
        let modal = document.getElementById('npc-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'npc-modal';
            modal.className = 'modal screen active'; // Re-use screen styles or custom modal
            document.body.appendChild(modal);
        }

        modal.className = 'modal active'; // Show it

        // Content
        modal.innerHTML = `
            <div class="modal-content" style="background: var(--cartoon-bg-primary); padding: 20px; border-radius: 15px; max-width: 600px; margin: 100px auto; text-align: center; position: relative;">
                <button class="btn-close" onclick="document.getElementById('npc-modal').className='modal hidden'" style="position: absolute; top: 10px; right: 10px;">❌</button>
                
                <h2 style="font-family: 'Bangers', cursive; font-size: 2.5rem; color: var(--cartoon-text); margin-bottom: 5px;">${npc.name}</h2>
                <div style="color: grey; margin-bottom: 20px;">${npc.title} | ${tier.label}</div>
                
                <div class="character-display" style="height: 350px; margin-bottom: 20px;">
                     <img src="${npc.image || npc.icon}" class="char-sprite char-alive ${npc.id === this.currentTalkingNPC ? 'char-talking' : ''}" style="height: 100%;">
                </div>
                
                <div class="dialogue-box" id="npc-dialogue-area" style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px; min-height: 80px;">
                    "Hey there! What's new?"
                </div>
                
                <div class="npc-actions">
                     <button class="btn-cartoon" onclick="game.handleNPCTalk('${npc.id}')">💬 Chat</button>
                     <button class="btn-cartoon" onclick="game.handleNPCGift('${npc.id}')">🎁 Gift</button>
                     <button class="btn-cartoon btn-danger" onclick="document.getElementById('npc-modal').className='modal hidden'">Leave</button>
                </div>
            </div>
         `;

        this.currentTalkingNPC = npc.id;
    }

    handleNPCTalk(npcId) {
        const convo = this.gameState.npcManager.startConversation(npcId);
        if (!convo) return;

        const dialogArea = document.getElementById('npc-dialogue-area');
        dialogArea.innerHTML = `"${convo.greeting}"`;

        // Update actions to choices
        const actionsDiv = document.querySelector('#npc-modal .npc-actions');
        actionsDiv.innerHTML = '';

        convo.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-cartoon btn-sm';
            btn.textContent = choice.text;
            btn.onclick = () => {
                const result = this.gameState.npcManager.makeChoice(index);
                this.handleNPCResponse(result);
            };
            actionsDiv.appendChild(btn);
        });
    }

    handleNPCResponse(result) {
        if (!result) return;
        const dialogArea = document.getElementById('npc-dialogue-area');
        // Simple response for now
        dialogArea.innerHTML = "Interesting... (Relationship Changed)";

        // Reset buttons after short delay or immediately
        setTimeout(() => {
            // Close or return to main menu? For now close
            document.getElementById('npc-modal').className = 'modal hidden';
            this.showToast('Conversation finished.', 'success');
        }, 1500);
    }

    handleNPCGift(npcId) {
        // Simple gift logic for MVP
        const result = this.gameState.npcManager.giveGift(npcId, 'coffee'); // Default gift
        const dialogArea = document.getElementById('npc-dialogue-area');
        if (result.liked) dialogArea.innerHTML = "Wow! I love this! Thanks!";
        else dialogArea.innerHTML = "Oh... thanks, I guess.";
    }

    handleArrest(reason) {
        // Send to jail
        this.gameState.jailSentence = 30; // 30 days
        this.screenManager.showScreen('screen-jail');
        document.getElementById('jail-time-left').textContent = `${this.gameState.jailSentence} days`;

        // Penalty
        this.gameState.reputation = Math.floor(this.gameState.reputation / 2);
        this.gameState.money -= 5000; // Legal fees
        this.showToast("You've been arrested! Reputation halved.", 'error');
        this.audioManager.play('error');
    }

    handleServeJailTime() {
        if (this.gameState.jailSentence <= 0) {
            this.showToast("You are free to go!", 'success');
            this.screenManager.showScreen('screen-game');
            return;
        }

        this.handleTimeAdvance(6); // Advance full day
        this.gameState.jailSentence--;
        document.getElementById('jail-time-left').textContent = `${this.gameState.jailSentence} days`;

        if (this.gameState.jailSentence <= 0) {
            this.showToast("You served your time.", 'info');
            this.screenManager.showScreen('screen-game');
        }
    }

    handleBribeGuard() {
        if (this.gameState.money < 5000) {
            this.showToast("Not enough money!", 'error');
            return;
        }

        this.gameState.money -= 5000;
        const success = Math.random() > 0.5;

        if (success) {
            this.gameState.jailSentence = 0;
            this.showToast("The guard looks the other way...", 'success');
            this.screenManager.showScreen('screen-game');
            this.characterStats.modifyEthics(-10);
        } else {
            this.gameState.jailSentence += 7;
            this.showToast("Bribe failed! Sentence extended.", 'error');
            document.getElementById('jail-time-left').textContent = `${this.gameState.jailSentence} days`;
        }
        this.uiUpdater.updateAllUI();
    }

    handleBuyStock(stockId) {
        // Simplified buy 10 shares for now or prompt
        const qty = parseInt(prompt("How many shares to buy?", "10"));
        if (!qty || qty <= 0) return;

        const result = this.stockMarket.buyStock(stockId, qty);
        if (result.success) {
            this.showToast(`Bought ${qty} shares of ${result.stock.ticker}`, 'success');
            this.updateStockMarketScreen();
            this.uiUpdater.updateAllUI(); // Update money
        } else {
            this.showError(result.reason);
        }
    }

    handleSellStock(stockId) {
        const qty = parseInt(prompt("How many shares to sell?", "10"));
        if (!qty || qty <= 0) return;

        const result = this.stockMarket.sellStock(stockId, qty);
        if (result.success) {
            this.showToast(`Sold ${qty} shares of ${result.stock.ticker}`, 'success');
            this.updateStockMarketScreen();
            this.uiUpdater.updateAllUI(); // Update money
        } else {
            this.showError(result.reason);
        }
    }

    // Updated time advance to update market
    handleTimeAdvance(hours) {
        if (!this.timeManager) return;

        const dayBefore = this.timeManager.totalDays;
        this.timeManager.advanceTime(hours);
        const dayAfter = this.timeManager.totalDays;

        // New Day Check for RPG systems
        if (dayAfter > dayBefore) {
            // New Day Logic
            this.showToast('A new day has begun!', 'info');

            // 1. News
            this.newsManager.generateDailyNews();
            const dailyNews = this.newsManager.getRecentNews(3);

            // 2. World Events
            if (this.worldEventManager) {
                this.worldEventManager.processDay();
            }

            // 3. Stock Market
            if (this.stockMarket) {
                this.stockMarket.update(dailyNews);
            }

            // 4. Expenses
            // Marketing
            if (this.gameState.dailyMarketingCost) {
                this.gameState.money -= this.gameState.dailyMarketingCost;
            }
            // Salaries
            if (this.gameState.staff) {
                const salaries = this.gameState.staff.reduce((sum, s) => sum + (s.salary || 0), 0);
                this.gameState.money -= salaries;
            }

            if (this.gameState.money < 0) {
                this.showToast('Warning: You are in debt!', 'warning');
            }

            // 5. Character Evolution Check
            this.checkForCharacterEvolution();
        }

        this.updateMapScreen(); // Update visuals
        this.uiUpdater.updateAllUI(); // Update money/date
    }

    /**
     * Open the chart studio
     */
    openChartStudio() {
        this.screenManager.showScreen('screen-chart-studio');

        // Initialize chart preview with current data
        this.chartManager.createPreviewChart(
            this.gameState.currentTask.data,
            this.gameState.chartConfig
        );
    }

    /**
     * Select a chart type
     */
    selectChartType(type) {
        // Update active state in UI
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            }
        });

        // Update game state
        this.gameState.chartConfig.type = type;

        // Update preview
        this.updateChartPreview();

        // Play sound
        this.audioManager.play('click');
    }

    /**
     * Select a color palette
     */
    selectColorPalette(palette) {
        // Update active state
        document.querySelectorAll('.palette-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.palette === palette) {
                btn.classList.add('active');
            }
        });

        // Update game state
        this.gameState.chartConfig.palette = palette;

        // Update preview
        this.updateChartPreview();
    }

    /**
     * Update the chart preview
     */
    updateChartPreview() {
        const config = {
            type: this.gameState.chartConfig.type,
            palette: this.gameState.chartConfig.palette,
            showLegend: document.getElementById('show-legend')?.checked ?? true,
            showGrid: document.getElementById('show-grid')?.checked ?? true,
            showDataLabels: document.getElementById('show-data-labels')?.checked ?? false,
            title: document.getElementById('chart-title')?.value ?? ''
        };

        this.gameState.chartConfig = { ...this.gameState.chartConfig, ...config };

        this.chartManager.updatePreviewChart(
            this.gameState.currentTask.data,
            this.gameState.chartConfig
        );
    }

    /**
     * Submit the chart for boss review
     */
    submitChart() {
        console.log('📤 Submitting chart for review...');

        // Calculate score
        const score = this.economySystem.evaluateChart(
            this.gameState.currentTask,
            this.gameState.chartConfig
        );

        // Store score for display
        this.gameState.lastScore = score;

        // Show review screen
        this.screenManager.showScreen('screen-review');

        // Copy chart to review screen
        this.chartManager.copyToReviewChart();

        // Animate the review
        this.animateReview(score);
    }

    /**
     * Animate the boss review
     */
    animateReview(score) {
        const bossReactions = {
            1: { emoji: '😠', text: "This is completely wrong! Did you even look at the data?" },
            2: { emoji: '😕', text: "I expected better. This needs a lot of work." },
            3: { emoji: '😐', text: "It's okay, but nothing special. Keep practicing." },
            4: { emoji: '😊', text: "Good job! This clearly shows the trends." },
            5: { emoji: '🤩', text: "Excellent work! This is exactly what I needed!" }
        };

        const reaction = bossReactions[score.stars] || bossReactions[3];

        // Animate feedback
        setTimeout(() => {
            document.getElementById('reaction-emoji').textContent = reaction.emoji;
            document.getElementById('boss-feedback').querySelector('.feedback-text').textContent = reaction.text;
        }, 500);

        // Animate stars
        const starsContainer = document.getElementById('stars-container');
        const stars = starsContainer.querySelectorAll('.star');
        stars.forEach((star, i) => {
            setTimeout(() => {
                if (i < score.stars) {
                    star.textContent = '★';
                    star.classList.add('filled');
                } else {
                    star.textContent = '☆';
                    star.classList.remove('filled');
                }
            }, 800 + (i * 200));
        });

        // Animate score breakdown
        setTimeout(() => {
            const scoreFills = document.querySelectorAll('.score-fill');
            scoreFills[0].style.width = `${score.chartAppropriateness}%`;
            scoreFills[1].style.width = `${score.visualClarity}%`;
            scoreFills[2].style.width = `${score.dataAccuracy}%`;
        }, 1500);

        // Animate rewards
        setTimeout(() => {
            document.getElementById('reward-money').textContent = `+$${score.moneyEarned.toLocaleString()}`;
            document.getElementById('reward-rep').textContent = `+${score.repEarned} Rep`;

            // Apply rewards to game state
            this.gameState.money += score.moneyEarned;
            this.gameState.reputation += score.repEarned;
            this.gameState.tasksCompleted++;
            this.gameState.totalEarned += score.moneyEarned;

            // Check for promotion
            this.economySystem.checkPromotion();

            // Update top bar
            this.uiUpdater.updateTopBar();

            // Play sound
            if (score.stars >= 4) {
                this.audioManager.play('success');
            } else if (score.stars <= 2) {
                this.audioManager.play('fail');
            } else {
                this.audioManager.play('complete');
            }

            // Auto-save
            this.saveManager.saveGame(this.gameState);

        }, 2000);
    }

    /**
     * Move to the next task
     */
    nextTask() {
        // Generate new task
        this.taskSystem.generateNewTask();

        // Update UI
        this.uiUpdater.updateTaskDisplay();

        // Show game screen
        this.screenManager.showScreen('screen-game');
    }

    /**
     * Show tutorial modal
     */
    showTutorial() {
        const modalContent = `
            <div class="tutorial-modal">
                <h2>📚 How to Play</h2>
                <div class="tutorial-steps">
                    <div class="tutorial-step">
                        <span class="step-number">1</span>
                        <div class="step-content">
                            <h4>📋 Get Your Task</h4>
                            <p>Your boss will give you data and specific requirements for a visualization.</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <span class="step-number">2</span>
                        <div class="step-content">
                            <h4>📊 Analyze the Data</h4>
                            <p>Look at the data table and understand what story it tells.</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <span class="step-number">3</span>
                        <div class="step-content">
                            <h4>🎨 Create Your Chart</h4>
                            <p>Choose the right chart type and customize it to clearly present the data.</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <span class="step-number">4</span>
                        <div class="step-content">
                            <h4>⭐ Get Rated</h4>
                            <p>Your boss will rate your work. Better ratings mean more money and reputation!</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <span class="step-number">5</span>
                        <div class="step-content">
                            <h4>📈 Climb the Ladder</h4>
                            <p>Earn reputation to get promoted. Unlock new chart types and tools in the shop!</p>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="game.closeModal()">Got it!</button>
            </div>
        `;

        this.showModal(modalContent);
    }

    /**
     * Show settings modal
     */
    showSettings() {
        const modalContent = `
            <div class="settings-modal">
                <h2>⚙️ Settings</h2>
                <div class="settings-options">
                    <div class="option-group">
                        <label>Sound Effects</label>
                        <label class="toggle">
                            <input type="checkbox" id="settings-sound" ${this.audioManager.soundEnabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="option-group">
                        <label>Music</label>
                        <label class="toggle">
                            <input type="checkbox" id="settings-music" ${this.audioManager.musicEnabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="settings-danger">
                    <button class="btn btn-danger" onclick="game.resetProgress()">Reset Progress</button>
                </div>
                <button class="btn btn-secondary" onclick="game.closeModal()">Close</button>
            </div>
        `;

        this.showModal(modalContent);
    }

    /**
     * Toggle sound on/off
     */
    toggleSound() {
        this.audioManager.toggleSound();
        const btn = document.getElementById('btn-sound');
        btn.textContent = this.audioManager.soundEnabled ? '🔊' : '🔇';
    }

    /**
     * Reset game progress
     */
    resetProgress() {
        if (confirm('Are you sure? This will delete all your progress!')) {
            this.saveManager.clearSave();
            this.gameState.reset();
            this.closeModal();
            this.screenManager.showScreen('screen-menu');
            document.getElementById('btn-continue').disabled = true;
            this.showToast('Progress reset.', 'warning');
        }
    }

    /**
     * Show modal with content
     */
    showModal(content) {
        const container = document.getElementById('modal-container');
        const modalContent = document.getElementById('modal-content');

        modalContent.innerHTML = content;
        container.classList.remove('hidden');

        // Close on backdrop click
        container.querySelector('.modal-backdrop').onclick = () => this.closeModal();
    }

    /**
     * Close modal
     */
    closeModal() {
        const container = document.getElementById('modal-container');
        container.classList.add('hidden');
    }

    /**
     * Handle hiring staff
     */
    handleHireStaff(role) {
        // Legal Check: Need LLC to hire staff
        if (this.legalSystem && !this.legalSystem.hasLicense('llc_registration')) {
            this.showToast("You need an LLC Registration to hire employees!", 'error');
            return;
        }

        const staffCosts = {
            'junior': 2000,
            'senior': 5000,
            'expert': 15000
        };
        // ... rest of logic
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');

        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * Handle buying specific hardware
     */
    handleBuyHardware(type, partId) {
        if (!this.gameState.hardwareManager) return;

        const result = this.gameState.hardwareManager.buyPart(type, partId);

        if (result.success) {
            this.showToast(result.message, 'success');
            this.audioManager.play('kaching');
            this.uiUpdater.updateOfficeEquipment(); // Refresh grid
            this.uiUpdater.updateTopBar(); // Update money
        } else {
            this.showToast(result.message, 'error');
            this.audioManager.play('error');
        }
    }

    /**
     * Update Office Screen with current equipment and office status
     */
    updateOfficeScreen() {
        // Update office badge
        const officeNames = ['Bedroom Corner', 'Home Office', 'Co-working Space', 'Small Office', 'Office Floor', 'Company HQ'];
        const officeIcons = ['🛏️', '🏠', '👥', '🏢', '🏛️', '🏰'];
        const currentOffice = this.gameState.officeIndex || 0;

        document.getElementById('current-office-name').textContent = officeNames[currentOffice];
        document.querySelector('.office-badge .office-icon').textContent = officeIcons[currentOffice];

        // Update equipment levels (Delegated to HardwareManager/UIUpdater)
        if (this.uiUpdater && this.uiUpdater.updateOfficeEquipment) {
            this.uiUpdater.updateOfficeEquipment();
        }

        // Check layout visibility
        const locId = this.worldMap.currentLocation;
        this.uiUpdater.updateLocationLayout(locId);

        const nextBtn = document.getElementById('upgrade-office');
        const officePrices = [0, 5000, 15000, 50000, 200000, 1000000]; // Prices for office upgrades

        if (nextBtn) {
            const nextOfficePrice = officePrices[currentOffice + 1];
            nextBtn.textContent = `$${nextOfficePrice.toLocaleString()}`;
            nextBtn.onclick = () => this.handleUpgradeOffice();

            if (currentOffice >= officeNames.length - 1) {
                nextBtn.textContent = 'MAXED';
                nextBtn.disabled = true;
                document.getElementById('next-office-info').classList.add('hidden');
            } else if (this.gameState.money < nextOfficePrice) {
                nextBtn.disabled = true;
            } else {
                nextBtn.disabled = false;
            }
        }

        // --- AI System Update ---
        if (this.aiSystem) {
            const ai = this.aiSystem;
            const aiSection = document.querySelector('.ai-console-section');
            if (aiSection) aiSection.classList.remove('hidden');

            document.getElementById('ai-name').textContent = ai.name;
            document.getElementById('ai-level').textContent = ai.level;

            document.getElementById('ai-stat-int').textContent = ai.intelligence;
            document.getElementById('ai-stat-spd').textContent = ai.speed;

            const xpPct = (ai.xp / ai.xpToNextLevel) * 100;
            document.getElementById('ai-xp-fill').style.width = `${xpPct}%`;

            const trainBtn = document.getElementById('btn-train-ai');
            if (trainBtn) {
                trainBtn.onclick = () => this.handleTrainAI();
            }
        }

        // Update next office info
        if (currentOffice < officeNames.length - 1) {
            document.getElementById('next-office-icon').textContent = officeIcons[currentOffice + 1];
            document.getElementById('next-office-name').textContent = officeNames[currentOffice + 1];
        }
    }

    handleTrainAI() {
        if (!this.aiSystem) return;

        // Cost: 20 Energy + $50 Cloud Cost
        const energyCost = 20;
        const moneyCost = 50;

        if (!this.timeManager.hasEnergy(energyCost)) {
            this.showError("Too tired to train AI!");
            return;
        }

        if (this.gameState.money < moneyCost) {
            this.showError("Need $50 for Cloud Compute!");
            return;
        }

        this.timeManager.useEnergy(energyCost);
        this.gameState.money -= moneyCost;
        this.handleTimeAdvance(2); // 2 hours

        const result = this.aiSystem.train(10); // 10 Base XP

        this.showToast(`Trained AI! Gained ${result.xpGained} XP.`, 'success');
        this.audioManager.play('keyboard_typing') || this.audioManager.play('click');

        if (this.aiSystem.checkLevelUp()) {
            this.showToast(`AI LEVEL UP! Now Level ${this.aiSystem.level}`, 'success');
            this.audioManager.play('kaching');
        }

        this.updateOfficeScreen();
        this.uiUpdater.updateAllUI();
    }

    handleLearnLibrary(libId) {
        if (!this.gameState.unlockedLibraries) this.gameState.unlockedLibraries = [];
        if (this.gameState.unlockedLibraries.includes(libId)) return;

        const lib = LIBRARY_CONTENT.find(l => l.id === libId);
        if (!lib) return;

        if (this.gameState.money < lib.cost) {
            this.showError("Not enough money!");
            return;
        }

        // Pay
        this.gameState.money -= lib.cost;
        this.gameState.unlockedLibraries.push(libId);

        this.showToast(`Learned ${lib.name}!`, 'success');
        this.audioManager.play('kaching');
        this.uiUpdater.updateAllUI();
        this.uiUpdater.updateLibraryScreen();
    }

    /**
     * Update Clients Screen with pending and active jobs
     */
    updateClientsScreen() {
        // Update job counts
        const pendingCount = this.gameState.pendingJobs?.length || 0;
        const activeCount = this.gameState.activeJobs?.length || 0;
        const completedCount = this.gameState.completedJobs || 0;

        document.getElementById('pending-jobs-count').textContent = pendingCount;
        document.getElementById('active-jobs-count').textContent = activeCount;
        document.getElementById('completed-jobs-count').textContent = completedCount;

        // Update client badge on nav
        const badge = document.getElementById('clients-badge');
        if (badge) {
            if (pendingCount > 0) {
                badge.textContent = pendingCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    /**
     * Update Staff Screen with current team and expenses
     */
    updateStaffScreen() {
        const staff = this.gameState.staff || [];
        const officeCapacity = [1, 1, 2, 4, 10, 25][this.gameState.officeIndex || 0];

        // Update capacity
        document.getElementById('staff-capacity').textContent = `${staff.length} / ${officeCapacity}`;
        const capacityPct = officeCapacity > 0 ? (staff.length / officeCapacity) * 100 : 0;
        document.getElementById('capacity-progress').style.width = `${capacityPct}%`;

        // Update expenses
        const staffCost = staff.reduce((sum, s) => sum + (s.salary || 0), 0);
        const marketingCost = this.gameState.dailyMarketingCost || 0;

        document.getElementById('daily-salaries').textContent = `$${staffCost}`;
        document.getElementById('daily-marketing').textContent = `$${marketingCost}`;
        document.getElementById('daily-total').textContent = `$${staffCost + marketingCost}`;
    }

    /* =====================================================
       RPG UPDATE METHODS
       ===================================================== */

    updateMapScreen() {
        if (!this.worldMap || !this.timeManager) return;

        // Update time display
        const timeSlot = this.timeManager.getCurrentSlot();
        document.getElementById('current-time-slot').textContent = timeSlot.name;
        document.getElementById('time-slot-icon').textContent = timeSlot.icon;
        document.getElementById('current-date').textContent = this.timeManager.getDateString();

        // Update energy
        const energyPct = this.timeManager.getEnergyPercent();
        document.getElementById('energy-fill').style.width = `${energyPct}%`;
        document.getElementById('energy-text').textContent = `${Math.floor(this.timeManager.energy)}/${this.timeManager.maxEnergy}`;

        // Update news ticker
        if (this.newsManager) {
            const latestNews = this.newsManager.getRecentNews(5);
            const newsEl = document.getElementById('news-ticker-content');
            if (latestNews.length > 0 && newsEl) {
                const newsText = latestNews.map(n => `[${n.category}] ${n.text}`).join('    •    ');
                newsEl.textContent = newsText + '    •    ' + newsText;
            }
        }

        // Location Actions
        const actionsEl = document.getElementById('location-actions');
        if (actionsEl) {
            actionsEl.innerHTML = '';
            const locId = this.worldMap.currentLocation;

            if (locId === 'stock_exchange') {
                const btn = document.createElement('button');
                btn.className = 'btn-cartoon';
                btn.textContent = '📈 Enter Stock Exchange';
                btn.onclick = () => {
                    this.screenManager.showScreen('screen-stock-market');
                    this.updateStockMarketScreen();
                };
                actionsEl.appendChild(btn);
            } else if (locId === 'gym') {
                const btn = document.createElement('button');
                btn.className = 'btn-cartoon';
                btn.textContent = '🏋️ Workout ($20 / 2h)';
                btn.onclick = () => {
                    this.handleTraining('gym_workout');
                };
                actionsEl.appendChild(btn);
            } else if (locId === 'library') {
                const btnStudy = document.createElement('button');
                btnStudy.className = 'btn-cartoon';
                btnStudy.textContent = '📚 Study (2h)';
                btnStudy.onclick = () => {
                    this.handleTraining('study_books');
                };
                actionsEl.appendChild(btnStudy);

                const btnGrimoire = document.createElement('button');
                btnGrimoire.className = 'btn-cartoon btn-special';
                btnGrimoire.textContent = '📖 Open Manual';
                btnGrimoire.onclick = () => {
                    this.screenManager.showScreen('screen-library');
                    this.uiUpdater.updateLibraryScreen();
                };
                actionsEl.appendChild(btnGrimoire);
            } else if (locId === 'city_hall') {
                // Show License Buttons
                const llcOwned = this.gameState.legalSystem.hasLicense('llc_registration');
                const series7Owned = this.gameState.legalSystem.hasLicense('series_7');

                const llcBtn = document.createElement('button');
                llcBtn.className = `btn-cartoon ${llcOwned ? 'disabled' : ''}`;
                llcBtn.innerHTML = llcOwned ? '✅ LLC Registered' : '📝 Register LLC ($500)';
                if (!llcOwned) llcBtn.onclick = () => this.handleBuyLicense('llc_registration');
                actionsEl.appendChild(llcBtn);

                const s7Btn = document.createElement('button');
                s7Btn.className = `btn-cartoon ${series7Owned ? 'disabled' : ''}`;
                s7Btn.innerHTML = series7Owned ? '✅ Series 7 Active' : '📜 Take Series 7 Exam ($1,500)';
                if (!series7Owned) s7Btn.onclick = () => this.handleBuyLicense('series_7');
                actionsEl.appendChild(s7Btn);
            }
        }
        // ... rest of function

        // Update map locations
        const accessible = this.worldMap.getAccessibleLocations();
        document.querySelectorAll('.map-location').forEach(el => {
            const id = el.dataset.location;
            if (!id) return;

            const isAccessible = accessible.some(l => l.id === id);
            if (isAccessible) {
                el.classList.remove('locked');
            } else {
                el.classList.add('locked');
            }

            // Highlight current location
            if (this.worldMap.currentLocation === id) {
                el.classList.add('current');
            } else {
                el.classList.remove('current');
            }
        });

        // Update player marker position
        const currentLocation = this.worldMap.getCurrentLocation();
        if (currentLocation && currentLocation.position) {
            const marker = document.getElementById('player-marker');
            marker.style.left = `${currentLocation.position.x}%`;
            marker.style.top = `${currentLocation.position.y}%`;
        }

        // Update vehicles
        document.querySelectorAll('.vehicle-option').forEach(el => {
            const id = el.dataset.vehicle;
            if (!id) return;

            // Check if owned
            if (this.worldMap.ownedVehicles.includes(id)) {
                el.classList.remove('locked');
                const priceEl = el.querySelector('.vehicle-price');
                if (priceEl) priceEl.textContent = 'Owned';
            }

            // Highlight active
            if (this.worldMap.currentVehicle === id) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    handleBuyLicense(licenseId) {
        if (!this.gameState.legalSystem) return;
        const result = this.gameState.legalSystem.acquireLicense(licenseId);
        if (result.success) {
            this.showToast(result.message, 'success');
            this.audioManager.play('kaching'); // Or distinct sound
            this.updateMapScreen(); // Refresh buttons
        } else {
            this.showToast(result.message, 'error');
            this.audioManager.play('error');
        }
    }

    handleStartExam(courseId) {
        const course = this.gameState.educationSystem.courses[courseId];
        if (this.gameState.money < course.cost) {
            this.showToast('Tuition too high!', 'error');
            this.audioManager.play('error');
            return;
        }

        // Pay tuition (or exam fee)
        this.gameState.money -= course.cost;
        this.uiUpdater.updateAllUI();

        this.currentExam = {
            courseId: courseId,
            questions: course.questions,
            currentQuestionIndex: 0,
            score: 0
        };

        // Show Modal
        const modal = document.getElementById('modal-exam');
        modal.classList.remove('hidden');
        modal.classList.add('active');

        document.getElementById('exam-title').textContent = `${course.name} Exam`;
        document.getElementById('exam-intro').classList.remove('hidden');
        document.getElementById('exam-questions').classList.add('hidden');
        document.getElementById('exam-results').classList.add('hidden');

        // Bind Start Button
        const startBtn = document.getElementById('btn-start-exam');
        startBtn.onclick = () => this.startExamQuestions();

        // Bind Close Button
        document.querySelector('#modal-exam .close-modal').onclick = () => {
            modal.classList.remove('active');
            modal.classList.add('hidden');
        };
    }

    startExamQuestions() {
        document.getElementById('exam-intro').classList.add('hidden');
        document.getElementById('exam-questions').classList.remove('hidden');
        this.showExamQuestion();
    }

    showExamQuestion() {
        const exam = this.currentExam;
        const q = exam.questions[exam.currentQuestionIndex];

        document.getElementById('question-text').textContent = `${exam.currentQuestionIndex + 1}. ${q.q}`;

        const optsContainer = document.getElementById('options-container');
        optsContainer.innerHTML = '';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-cartoon';
            btn.textContent = opt;
            btn.onclick = () => this.handleAnswerQuestion(idx);
            optsContainer.appendChild(btn);
        });
    }

    handleAnswerQuestion(answerIndex) {
        const exam = this.currentExam;
        const q = exam.questions[exam.currentQuestionIndex];

        if (answerIndex === q.correct) {
            exam.score++;
        }

        exam.currentQuestionIndex++;

        if (exam.currentQuestionIndex < exam.questions.length) {
            this.showExamQuestion();
        } else {
            this.finishExam();
        }
    }

    finishExam() {
        const exam = this.currentExam;
        const total = exam.questions.length;
        const pct = Math.round((exam.score / total) * 100);
        const passed = pct >= 70;

        document.getElementById('exam-questions').classList.add('hidden');
        document.getElementById('exam-results').classList.remove('hidden');

        document.getElementById('exam-score').textContent = pct;
        const statusEl = document.getElementById('exam-status');
        statusEl.textContent = passed ? "PASSED!" : "FAILED";
        statusEl.className = passed ? 'success-text' : 'error-text';

        if (passed) {
            this.gameState.educationSystem.completeCourse(exam.courseId);
            this.audioManager.play('kaching'); // Success sound
            this.showToast(`Passed ${exam.courseId}!`, 'success');
        } else {
            this.audioManager.play('error');
            this.showToast('Failed the exam.', 'error');
        }

        document.getElementById('btn-close-exam').onclick = () => {
            const modal = document.getElementById('modal-exam');
            modal.classList.remove('active');
            modal.classList.add('hidden');
            this.updateMapScreen(); // Refresh finished status
        };
    }

    updateStatsScreen() {
        if (!this.characterStats) return;

        // Update overview
        const charName = this.gameState.playerName || 'New Player';
        document.getElementById('stats-name').textContent = charName;
        // document.getElementById('stats-title').textContent = this.gameState.ranks[this.gameState.rankIndex].title;

        // Update stat bars
        this.characterStats.getAllStats().forEach(stat => {
            const el = document.querySelector(`.stat-card[data-stat="${stat.id}"]`);
            if (el) {
                el.querySelector('.stat-value').textContent = stat.value;
                el.querySelector('.stat-bar-fill').style.width = `${(stat.value / stat.maxLevel) * 100}%`;
                el.querySelector('.stat-xp').textContent = `XP: ${Math.floor(stat.xp)}/${stat.xpNeeded}`;
            }
        });

        // Calculate total level
        const totalLevel = this.characterStats.getAllStats().reduce((sum, s) => sum + s.value, 0);
        document.getElementById('total-level').textContent = totalLevel;
    }

    updateRelationshipsScreen() {
        if (!this.npcManager) return;

        const npcs = this.npcManager.getMetNPCs();
        const grid = document.getElementById('npc-grid');
        grid.innerHTML = '';

        // Show met NPCs
        npcs.forEach(npc => {
            const card = document.createElement('div');
            card.className = 'npc-card';
            card.dataset.npc = npc.id;
            card.innerHTML = `
                <div class="npc-avatar">${npc.icon}</div>
                <div class="npc-info">
                    <div class="npc-name">${npc.name}</div>
                    <div class="npc-title">${npc.title}</div>
                </div>
                <div class="relationship-bar">
                    <div class="relationship-fill" style="width: ${npc.relationship}%"></div>
                </div>
                <div class="relationship-tier">${npc.tier.label}</div>
            `;

            card.addEventListener('click', () => {
                this.interactWithNPC(npc.id);
            });

            grid.appendChild(card);
        });

        // Show unknown/locked NPCs
        const allNPCs = this.npcManager.gameState.npcManager.getAllNPCs ?
            this.npcManager.gameState.npcManager.getAllNPCs() : NPCs; // Hack access to raw list

        // Use raw list from imported module if needed, or implement getAllNPCs
        // Ideally NPCManager should have getAllNPCs
    }

    interactWithNPC(npcId) {
        // Simple interaction for now
        const conversation = this.npcManager.startConversation(npcId);
        if (!conversation) return;

        // Check if we should move to location
        if (conversation.npc.location !== this.worldMap.currentLocation) {
            const confirmMove = confirm(`${conversation.npc.name} is at ${conversation.npc.location}. Travel there?`);
            if (confirmMove) {
                this.handleTravel(conversation.npc.location);
            }
            return;
        }

        // Show dialog modal (simplified for now)
        alert(`${conversation.npc.name} says: "${conversation.greeting}"`);

        // TODO: Implement full dialogue UI
        this.npcManager.makeChoice(0); // Default friendly response
        this.showToast(`Relationship with ${conversation.npc.name} improved!`, 'success');
        this.updateRelationshipsScreen();
    }

    handleTravel(locationId) {
        const result = this.worldMap.travelTo(locationId);

        if (result.success) {
            // Advance time based on travel
            this.handleTimeAdvance(result.timeCost);
            this.updateMapScreen();
            this.updateEnvironmentForLocation(locationId);
            this.uiUpdater.updateLocationLayout(locationId); // Visual update
            this.showToast(`Traveled to ${result.location.name}`, 'success');

            // Switch to location view
            setTimeout(() => {
                this.screenManager.showScreen('screen-office');
            }, 500);
        } else {
            this.showError(result.reason);
        }
    }

    /**
     * Handle Location Actions (Shop interactions)
     */
    handleLocationAction(action) {
        let cost = 0;
        let message = '';
        let energyGain = 0;
        let moodGain = 0;

        switch (action) {
            case 'buy_donut':
                cost = 5;
                if (this.gameState.money < cost) {
                    this.showError("Not enough money!");
                    return;
                }
                energyGain = 10;
                message = "Yummy donut! +10 Energy";
                break;
            case 'eat_donut':
                // Contextual (if inventory existed), for now same as buy
                cost = 5;
                energyGain = 10;
                message = "Yum!";
                break;
            case 'buy_coffee':
                cost = 4;
                if (this.gameState.money < cost) {
                    this.showError("Not enough money!");
                    return;
                }
                energyGain = 15;
                message = "Caffeine boost! +15 Energy";
                break;
            case 'buy_bagel':
                cost = 6;
                if (this.gameState.money < cost) {
                    this.showError("Not enough money!");
                    return;
                }
                energyGain = 12;
                message = "Tasty bagel! +12 Energy";
                break;
            case 'buy_flowers':
                cost = 15;
                if (this.gameState.money < cost) {
                    this.showError("Not enough money!");
                    return;
                }
                moodGain = 10; // Placeholder for mood
                message = "Smells nice! You feel happier.";
                break;
            case 'buy_plant':
                cost = 25;
                if (this.gameState.money < cost) {
                    this.showError("Not enough money!");
                    return;
                }
                // Add decoration logic later
                message = "A nice plant for your office. (Visual only for now)";
                break;
            default:
                console.log("Unknown action:", action);
                return;
        }

        // Apply effects
        this.gameState.money -= cost;
        if (energyGain > 0) this.timeManager.gainEnergy(energyGain);
        // if (moodGain > 0) ... // Mood system not fully exposed in TimeManager? 

        this.uiUpdater.updateAllUI();
        this.updateMapScreen(); // Update money
        this.showToast(message, 'success');
        this.audioManager.play('kaching');
    }

    handleTimeAdvance(slots) {
        if (slots <= 0) return;

        const events = this.timeManager.advanceTime(slots);

        // Handle events (new day, etc)
        events.forEach(event => {
            if (event.type === 'new_day') {
                this.newsManager.generateDailyNews();
                this.showToast('A new day has begun!', 'info');

                // Expenses
                const { expenses } = this.gameState.economySystem.processDailyFinances();
                // Salaries
                const salaries = (this.gameState.staff || []).reduce((sum, s) => sum + (s.salary || 0), 0);
                this.gameState.money -= salaries;

                if (expenses > 0) {
                    // Don't toast every day for small expenses, maybe log it or update a ticker?
                    // For now, let's just silently deduct or show if significant
                }

                if (this.gameState.money < 0) {
                    this.showToast('Warning: You are in debt!', 'warning');
                }
            } else if (event.type === 'new_week') {
                const rent = this.gameState.rent || 500;
                this.gameState.money -= rent;

                // Bank Interest
                if (this.bankSystem) {
                    const interest = this.bankSystem.processWeeklyInterest();
                    if (interest.savingsInterest > 0) {
                        this.showToast(`Savings Interest: +$${interest.savingsInterest}`, 'success');
                    }
                    if (interest.loanInterest > 0) {
                        this.showToast(`Loan Interest: -$${interest.loanInterest}`, 'warning');
                    }
                }

                this.showToast(`Paid weekly rent: -$${rent}`, 'warning');
                this.audioManager.play('kaching'); // Or a sad sound?

                if (this.gameState.money < -1000) {
                    this.showToast('CRITICAL: Eviction imminent! Earn money fast!', 'error');
                }
            }
        });

        this.uiUpdater.updateAllUI(); // Money updated
    }

    handleTraining(activityId) {
        // Check energy/time first
        const activity = TRAINING_ACTIVITIES.find(a => a.id === activityId);
        if (!activity) return;

        const check = this.timeManager.canPerformAction(activity.timeSlots, activity.energyCost);
        if (!check.can) {
            this.showError(check.reason);
            return;
        }

        // Pay cost
        if (this.gameState.money < activity.cost) {
            this.showError("Not enough money!");
            return;
        }
        this.gameState.money -= activity.cost;

        // Do training
        this.timeManager.useEnergy(activity.energyCost);
        const results = this.characterStats.train(activityId);

        this.handleTimeAdvance(activity.timeSlots);

        // Show results
        let msg = `Trained ${activity.name}! `;
        for (const [stat, gain] of Object.entries(results.gains)) {
            msg += `+${gain} ${STATS[stat].name} XP. `;
        }

        if (results.levelUps.length > 0) {
            msg += " LEVEL UP!";
            this.audioManager.play('success'); // Assuming success sound exists
        }

        this.showToast(msg, 'success');
        this.updateStatsScreen();
        this.updateMapScreen(); // Update energy
    }

    updateEnvironmentForLocation(locationId) {
        // Map simplified locations to environment types
        const map = {
            'home': 'home',
            'office': 'office',
            'downtown': 'city',
            'library': 'city', // Use city for now
            'gym': 'city'
        };
        // This is separate from background rendering, just updates GameState context
    }
    checkForCharacterEvolution() {
        if (!this.gameState.characterStats) return;

        const evolution = this.gameState.characterStats.checkEvolution(this.gameState.money);
        if (evolution.evolved) {
            this.showToast(`Character Evolved: ${evolution.stage.replace(/_/g, ' ').toUpperCase()}!`, 'success');
            this.audioManager.play('kaching'); // Evolution sound
            this.updatePlayerAvatar();
        }
    }

    updatePlayerAvatar() {
        if (!this.gameState.characterStats) return;

        // Map stage to emoji for now (until assets ready)
        const stage = this.gameState.characterStats.visualStage;
        let icon = '👤'; // level_1 default

        if (stage === 'level_2_good') icon = '🤵';
        if (stage === 'level_2_evil') icon = '😎'; // Leather jacket vibe
        if (stage === 'level_3_good') icon = '🦸'; // Visionary
        if (stage === 'level_3_evil') icon = '🦹'; // Villain

        const markers = document.querySelectorAll('.player-icon');
        markers.forEach(el => el.textContent = icon);
    }

    handleStartProject(contractId) {
        if (!this.projectSystem) return;

        const result = this.projectSystem.startProject(contractId);
        if (result.success) {
            this.showToast(`Accepted Contract: ${result.project.title}`, 'success');
            this.uiUpdater.updateCareerScreen();
        } else {
            this.showError(result.reason);
        }
    }

    handleWorkOnProject() {
        if (!this.projectSystem || !this.projectSystem.activeProject) return;

        // Energy Check
        const energyCost = 15;
        if (!this.timeManager.hasEnergy(energyCost)) {
            this.showError("You are too exhausted to code. Go sleep!");
            return;
        }

        this.timeManager.useEnergy(energyCost);

        // Trigger Fast Forward Session (3 hours work in 3 seconds)
        this.startWorkingSession(3);
    }

    startWorkingSession(hours) {
        const overlay = document.getElementById('working-overlay');
        overlay.classList.remove('hidden');

        const tickRate = 100; // ms per tick
        const ticksPerHour = 10;
        const totalTicks = hours * ticksPerHour;
        let currentTick = 0;

        // Disable Stop button for first second? No.
        document.getElementById('btn-stop-work').onclick = () => {
            this.finishWorkingSession(currentTick, totalTicks);
        };

        this.workInterval = setInterval(() => {
            currentTick++;

            // Advance small time
            this.handleTimeAdvance(0.1); // 0.1 hours

            // Add Progress
            this.simulateWorkTick();

            // Update UI
            const pct = (currentTick / totalTicks) * 100;
            document.getElementById('work-progress-fill').style.width = `${pct}%`;
            document.getElementById('work-progress-text').textContent = `${Math.round(pct)}%`;

            const hoursPassed = Math.floor(currentTick / ticksPerHour);
            const minsPassed = Math.round((currentTick % ticksPerHour) * (60 / ticksPerHour));
            document.getElementById('work-time-passed').textContent = `${hoursPassed}h ${minsPassed}m`;

            // Random Events (Bug, Epiphany)
            if (Math.random() < 0.02) { // 2% chance per tick
                this.showToast("Bug found! Fixing...", "warning");
                // Maybe pause? For now just visual.
            }

            if (currentTick >= totalTicks) {
                this.finishWorkingSession(currentTick, totalTicks);
            }

            // Check if stage completed early
            if (this.projectSystem.activeProject.stageProgress >=
                this.projectSystem.activeProject.stages[this.projectSystem.activeProject.currentStageIndex].maxProgress) {
                this.finishWorkingSession(currentTick, totalTicks);
            }

        }, tickRate);
    }
    /**
     * Main Game Loop
     */
    gameLoop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Future: Update animations or continuous logic here

        this.gameLoopId = requestAnimationFrame(this.gameLoop);
    }


    finishWorkingSession(ticks, totalTicks) {
        clearInterval(this.workInterval);
        document.getElementById('working-overlay').classList.add('hidden');

        // Final UI Update
        this.uiUpdater.updateCareerScreen();
        this.uiUpdater.updateAllUI();

        // Check completion status via ProjectSystem
        const result = this.projectSystem.checkProgress();

        if (result && result.status === 'project_complete') {
            this.showToast(`PROJECT COMPLETE! Earned $${result.reward}`, 'success');
            this.audioManager.play('kaching');
            this.uiUpdater.updateCareerScreen();
        } else if (result && result.status === 'stage_complete') {
            this.showToast(`Stage Complete! Next: ${result.nextStage.name}`, 'info');
            this.uiUpdater.updateCareerScreen();
        }
    }

    simulateWorkTick() {
        // Calculate work output per tick
        let basePower = 5; // Power per hour approx
        // Stats
        if (this.characterStats) {
            basePower += (this.characterStats.getStat('intelligence') * 0.5);
        }

        // Per tick (assuming 1 tick = 0.1 hour)
        let tickPower = basePower * 0.1;

        const result = this.projectSystem.workOnProject(tickPower);
        // result handling is done in finish currently, but we update state here.
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 DOM Content Loaded. Starting Game...');
        game = new MainGame();
        window.game = game; // Expose for modal buttons
        console.log('✅ MainGame instantiated. Calling init()...');
        game.init();
    } catch (e) {
        console.error('CRITICAL BOOT ERROR:', e);
        const errDiv = document.createElement('div');
        errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,0,0,0.9);color:white;z-index:99999;padding:20px;font-family:monospace;white-space:pre-wrap;overflow:auto;pointer-events:all;';
        errDiv.innerHTML = '<h1>CRITICAL BOOT ERROR</h1><h3>' + e.toString() + '</h3><pre>' + e.stack + '</pre>';
        document.body.appendChild(errDiv);
    }
});

export { game };
