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
import { ContractSystem } from './game/contracts/ContractSystem.js';
import { MapProgressionSystem } from './game/MapProgressionSystem.js';
import { dialogueTreeSystem } from './game/dialogue/DialogueTreeSystem.js';
import { ConversationScreen } from './game/dialogue/ConversationScreen.js';
import { IntroSystem } from './game/IntroSystem.js';
import { DayNightCycle, TIME_OF_DAY } from './game/DayNightCycle.js';
import { NotificationSystem } from './game/NotificationSystem.js';
import { LocationDetailSystem } from './game/locations/LocationDetailSystem.js';
import { CompanyManagementSystem } from './game/company/CompanyManagementSystem.js';
import { RomanceProgressionSystem } from './game/romance/RomanceProgressionSystem.js';
import { JealousySystem } from './game/social/JealousySystem.js';
import { DemandingBossSystem } from './game/work/DemandingBossSystem.js';
import { GameplaySettings } from './game/settings/GameplaySettings.js';
import { RoommateSystem } from './game/social/RoommateSystem.js';
import { DirtyDataSystem } from './game/data/DirtyDataSystem.js';
import { DetailedMapSystem } from './game/map/DetailedMapSystem.js';
import { RoomSystem } from './game/locations/RoomSystem.js';
import { EventSystem } from './game/events/EventSystem.js';
import { VisualProgressionSystem } from './game/visual/VisualProgressionSystem.js';
import { RealWorldTaskSystem } from './game/work/RealWorldTaskSystem.js';
import { TaskVisualRenderer } from './game/work/TaskVisualRenderer.js';
import { AITrainingStoryline } from './game/ai/AITrainingStoryline.js';
import { GitHubIssuesSystem } from './game/github/GitHubIssuesSystem.js';
import { ResearchPaperNotificationSystem } from './game/research/ResearchPaperNotificationSystem.js';
import { ResearchInboxUI } from './ui/ResearchInboxUI.js';
import { EmotionalBreakdownSystem } from './game/dialogue/EmotionalBreakdownSystem.js';
import { RelationshipDialogueSystem } from './game/dialogue/RelationshipDialogueSystem.js';
import { ComprehensiveSpriteSystem } from './assets/ComprehensiveSpriteSystem.js';
import { getTextIcon } from './utils/IconMapper.js';
import { JobSystem } from './game/JobSystem.js';
import { WorkInteractionSystem } from './game/WorkInteractionSystem.js';
import { RealisticDialogueSystem } from './game/RealisticDialogueSystem.js';
import { RelationshipEmotionSystem } from './game/RelationshipEmotionSystem.js';
import { WorldEvolutionSystem } from './game/WorldEvolutionSystem.js';
import { InvestmentEcommerceSystem } from './game/InvestmentEcommerceSystem.js';
import { StorylineManager } from './game/StorylineManager.js';
import { IDESystem } from './game/IDESystem.js';
import { LocationBackgroundSystem } from './game/LocationBackgroundSystem.js';
import { WeeklyNewsSystem } from './game/WeeklyNewsSystem.js';
import { ScreenThemeManager } from './game/ScreenThemeManager.js';
import { MapCoordinateSystem } from './game/MapCoordinateSystem.js';
import { VisualSystem } from './visual/VisualSystem.js';
import { AnimationManager } from './animation/AnimationManager.js';
import { AssetManager } from './assets/AssetManager.js';
import { PerformanceManager } from './performance/PerformanceManager.js';
import { UILayerManager } from './ui/UILayerManager.js';
import { CameraSystem } from './camera/CameraSystem.js';
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

// Helper modules - split from main.js for easier debugging
import * as MapHelpers from './helpers/MapHelpers.js';
import * as NPCHelpers from './helpers/NPCHelpers.js';
import * as StockMarketHelpers from './helpers/StockMarketHelpers.js';
import * as EducationHelpers from './helpers/EducationHelpers.js';
import * as ProjectHelpers from './helpers/ProjectHelpers.js';

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
            this.screenManager.showScreen('screen-game');
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
            this.screenManager.showScreen('screen-game');
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
     * Start a new game (optimized for fast loading)
     */
    startNewGame() {
        console.log('🚀 Starting new game...');
        
        // Show loading indicator
        this.showLoadingProgress('Initializing game...', 0);

        try {
            // Reset game state
            this.gameState.reset();
            this.gameState.isGameStarted = true;
            console.log('DEBUG [startNewGame]: gameState reset');

            // CRITICAL SYSTEMS - Load immediately (required for game to start)
            this.showLoadingProgress('Loading core systems...', 10);
            this.gameState.characterStats = new CharacterStats();
            this.gameState.timeManager = new TimeManager();
            this.gameState.economySystem = new EconomySystem(this.gameState);
            this.bankSystem = new BankSystem(this.gameState);
            this.gameState.worldMap = new WorldMap(this.gameState);
            this.gameState.npcManager = new NPCManager(this.gameState);
            
            // HIGH PRIORITY - Load next
            this.showLoadingProgress('Loading game systems...', 30);
            this.gameState.newsManager = new NewsManager(this.gameState);
            this.gameState.stockMarket = new StockMarket(this.gameState);
            
            // MEDIUM PRIORITY - Load in background (defer)
            setTimeout(() => {
                try {
                    this.gameState.crimeSystem = new CrimeSystem(this.gameState);
                    this.gameState.romanceSystem = new RomanceSystem(this.gameState);
                    this.gameState.legalSystem = new LegalSystem(this.gameState);
                    this.gameState.educationSystem = new EducationSystem(this.gameState);
                    this.gameState.worldEventManager = new WorldEventManager(this.gameState);
                    this.gameState.projectSystem = new ProjectSystem(this.gameState);
                } catch (error) {
                    console.warn('Error loading medium priority systems:', error);
                }
            }, 0);
            
            // LOW PRIORITY - Load last (defer)
            setTimeout(() => {
                try {
                    this.gameState.aiSystem = new AISystem(this.gameState);
                    this.gameState.hardwareManager = new HardwareManager(this.gameState);
                    this.gameState.contractSystem = new ContractSystem(this.gameState);
                    this.gameState.mapProgressionSystem = new MapProgressionSystem(this.gameState);
                } catch (error) {
                    console.warn('Error loading low priority systems:', error);
                }
            }, 100);
            
            // HIGH PRIORITY - Needed for intro
            this.showLoadingProgress('Loading UI systems...', 50);
            this.conversationScreen = new ConversationScreen(this);
            this.gameState.conversationScreen = this.conversationScreen;
            
            this.introSystem = new IntroSystem(this);
            this.gameState.introSystem = this.introSystem;
            
            this.gameState.dayNightCycle = new DayNightCycle(this.gameState);
            this.dayNightCycle = this.gameState.dayNightCycle;
            
            this.gameState.notificationSystem = new NotificationSystem(this.gameState);
            this.notificationSystem = this.gameState.notificationSystem;
            this.notificationSystem.scheduleDefaultNotifications();
            
            // DEFER ALL OTHER SYSTEMS - Load in background
            setTimeout(() => this.loadDeferredSystems(), 50);
            
            // Asset systems - Initialize but don't load assets yet
            this.showLoadingProgress('Preparing assets...', 70);
            this.assetManager = new AssetManager();
            this.gameState.assetManager = this.assetManager;
            
            this.spriteSheetManager = new SpriteSheetManager();
            this.gameState.spriteSheetManager = this.spriteSheetManager;
            
            this.animatedCharacterRenderer = new AnimatedCharacterRenderer(this.spriteSheetManager);
            this.gameState.animatedCharacterRenderer = this.animatedCharacterRenderer;
            
            this.characterAnimationSystem = new CharacterAnimationSystem(this.assetManager);
            this.gameState.characterAnimationSystem = this.characterAnimationSystem;
            
            this.locationView = new LocationView(this, this.assetManager, this.characterAnimationSystem);
            this.gameState.locationView = this.locationView;
            
            // Load assets in background (non-blocking, low priority)
            setTimeout(() => {
                this.assetManager.loadAll().then(success => {
                    if (success) {
                        console.log('Assets loaded successfully');
                    } else {
                        console.warn('Some assets failed to load, using fallbacks');
                    }
                }).catch(err => {
                    console.warn('Asset loading error (using fallbacks):', err);
                });
            }, 500);
            
            // Make game accessible globally for intro callbacks
            window.game = this;
            
            // Initialize all new integrated systems
            this.gameState.jobSystem = new JobSystem(this.gameState);
            this.gameState.workInteractionSystem = new WorkInteractionSystem(this.gameState);
            this.gameState.realisticDialogueSystem = new RealisticDialogueSystem();
            this.gameState.relationshipEmotionSystem = new RelationshipEmotionSystem(this.gameState);
            this.gameState.worldEvolutionSystem = new WorldEvolutionSystem(this.gameState);
            this.gameState.investmentEcommerceSystem = new InvestmentEcommerceSystem(this.gameState);
            this.gameState.storylineManager = new StorylineManager(this.gameState);
            this.gameState.mapProgressionSystem = new MapProgressionSystem(this.gameState);
            this.gameState.ideSystem = new IDESystem(this.gameState);
            this.gameState.locationBackgroundSystem = new LocationBackgroundSystem(this.gameState);
            this.gameState.weeklyNewsSystem = new WeeklyNewsSystem(this.gameState);
            this.gameState.screenThemeManager = new ScreenThemeManager();
            this.gameState.mapCoordinateSystem = new MapCoordinateSystem();
            
            // DEFER Phase 1 Visual Systems - Load in background
            setTimeout(() => {
                try {
                    this.gameState.visualSystem = new VisualSystem(this.gameState);
                    this.gameState.animationManager = new AnimationManager();
                    this.gameState.performanceManager = new PerformanceManager();
                    this.gameState.uiLayerManager = new UILayerManager();
                } catch (error) {
                    console.warn('Error loading visual systems:', error);
                }
            }, 300);
            
            // Register visual subsystems
            this.gameState.visualSystem.registerRenderer('animation', this.gameState.animationManager);
            
            // Detect hardware and set quality
            try {
                this.gameState.performanceManager.detectHardware();
                // Start monitoring after a short delay to ensure game loop is running
                setTimeout(() => {
                    if (this.gameState.performanceManager) {
                        this.gameState.performanceManager.startMonitoring();
                    }
                }, 100);
            } catch (error) {
                console.warn('Performance manager initialization failed:', error);
            }
            
            // Link mainGame reference for systems that need it
            this.gameState.mainGame = this;
            
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
            this.hardwareManager = this.gameState.hardwareManager;
            this.contractSystem = this.gameState.contractSystem;
            this.mapProgressionSystem = this.gameState.mapProgressionSystem;
            
            // Link new systems
            this.jobSystem = this.gameState.jobSystem;
            this.workInteractionSystem = this.gameState.workInteractionSystem;
            this.realisticDialogueSystem = this.gameState.realisticDialogueSystem;
            this.relationshipEmotionSystem = this.gameState.relationshipEmotionSystem;
            this.worldEvolutionSystem = this.gameState.worldEvolutionSystem;
            this.investmentEcommerceSystem = this.gameState.investmentEcommerceSystem;
            this.storylineManager = this.gameState.storylineManager;
            this.mapProgressionSystem = this.gameState.mapProgressionSystem;
            this.ideSystem = this.gameState.ideSystem;
            this.locationBackgroundSystem = this.gameState.locationBackgroundSystem;
            this.weeklyNewsSystem = this.gameState.weeklyNewsSystem;
            this.screenThemeManager = this.gameState.screenThemeManager;
            this.mapCoordinateSystem = this.gameState.mapCoordinateSystem;
            
            // Link Phase 1 Visual Systems
            this.visualSystem = this.gameState.visualSystem;
            this.animationManager = this.gameState.animationManager;
            this.assetManager = this.gameState.assetManager;
            this.performanceManager = this.gameState.performanceManager;
            this.uiLayerManager = this.gameState.uiLayerManager;
            
            // Initialize camera system for map (lazy initialization when map is accessed)
            // Camera will be initialized in updateMapScreen() when needed
            
            // Initialize storyline
            this.storylineManager.initialize();
            
            // Initialize map coordinate system with existing locations
            if (this.worldMap) {
                const locations = this.worldMap.getAccessibleLocations();
                this.mapCoordinateSystem.initializeWithLocations(locations);
            }
            
            console.log('DEBUG [startNewGame]: managers linked');
            this.showLoadingProgress('Ready!', 100);
            console.log('DEBUG [startNewGame]: core systems initialized, showing intro');
            
            // Hide loading, show intro
            setTimeout(() => {
                this.hideLoadingProgress();
                // Show intro instead of jumping directly to game
                this.introSystem.showIntro();
            }, 100);
        } catch (error) {
            console.error('❌ startNewGame ERROR:', error);
            console.error('Stack:', error.stack);
            this.showError('Failed to start game. Please refresh the page.');
        }
    }


    /**
     * Finish game start after intro/job selection
     */
    finishGameStart() {
        try {
            console.log('DEBUG [finishGameStart]: completing game initialization');
            
            // Generate first task
            this.taskSystem.generateNewTask();
            console.log('DEBUG [finishGameStart]: first task generated');

            // Generate initial news
            this.newsManager.generateDailyNews();
            console.log('DEBUG [finishGameStart]: news generated');

            // Update UI
            this.uiUpdater.updateAllUI();
            console.log('DEBUG [finishGameStart]: UI updated');

            this.updateMapScreen();
            console.log('DEBUG [finishGameStart]: map updated');

            // Update environment
            this.environmentManager.updateLocation();
            console.log('DEBUG [finishGameStart]: environment updated');

            // Show map screen as main area
            this.screenManager.showScreen('screen-game');
            console.log('DEBUG [finishGameStart]: showScreen called (map)');

            // Play sound
            this.audioManager.play('start');

            // Show toast with job info
            const job = this.gameState.currentJob;
            if (job) {
                this.showToast(`Day 1 at ${job.company}. Let's do this!`, 'success');
            } else {
                this.showToast('Welcome to your new career!', 'success');
            }
            
            // Start game loop
            if (!this.gameLoopId) {
                this.gameLoopId = requestAnimationFrame(this.gameLoop);
                console.log('DEBUG [finishGameStart]: Game loop started');
            }
            
            console.log('DEBUG [finishGameStart]: COMPLETE');
        } catch (error) {
            console.error('❌ finishGameStart ERROR:', error);
            this.showError('Failed to start game. Please refresh.');
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

        // Start game loop if not already running
        if (!this.gameLoopId) {
            this.gameLoopId = requestAnimationFrame(this.gameLoop);
            console.log('DEBUG [continueGame]: Game loop started');
        }

        // Show toast
        this.showToast('Welcome back!', 'success');
    }

    // ... (existing helper methods)

    /* =====================================================
       RPG UPDATE METHODS
       ===================================================== */

    // ... (existing methods)

    // Append this to end or inside class

    // ========== STOCK MARKET METHODS (delegated to StockMarketHelpers) ==========
    
    updateStockMarketScreen() {
        StockMarketHelpers.updateStockMarketScreen(this);
    }

    handleCrime(type, params) {
        StockMarketHelpers.handleCrime(this, type, params);
    }

    handleArrest(reason) {
        StockMarketHelpers.handleArrest(this, reason);
    }

    handleServeJailTime() {
        StockMarketHelpers.handleServeJailTime(this);
    }

    handleBribeGuard() {
        StockMarketHelpers.handleBribeGuard(this);
    }

    handleBuyStock(stockId) {
        StockMarketHelpers.handleBuyStock(this, stockId);
    }

    handleSellStock(stockId) {
        StockMarketHelpers.handleSellStock(this, stockId);
    }

    // ========== NPC METHODS (delegated to NPCHelpers) ==========

    handleVisitNPC(npcId) {
        NPCHelpers.handleVisitNPC(this, npcId);
    }

    handleNPCTalk(npcId) {
        NPCHelpers.handleNPCTalk(this, npcId);
    }

    handleNPCResponse(result) {
        NPCHelpers.handleNPCResponse(this, result);
    }

    handleNPCGift(npcId) {
        NPCHelpers.handleNPCGift(this, npcId);
    }

    // ========== STATS SCREEN ==========
    
    updateStatsScreen() {
        ProjectHelpers.updateStatsScreen(this);
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

        // Update software display
        this.uiUpdater.updateSoftwareDisplay();
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
            this.gameState.weeklyIncome += score.moneyEarned; // Track for taxes

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
        ProjectHelpers.updateOfficeScreen(this);
    }

    handleTrainAI() {
        ProjectHelpers.handleTrainAI(this);
    }

    handleLearnLibrary(libId) {
        EducationHelpers.handleLearnLibrary(this, libId, LIBRARY_CONTENT);
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

    // ========== MAP METHODS (delegated to MapHelpers) ==========

    updateMapScreen() {
        MapHelpers.updateMapScreen(this);
    }

    renderMapBuildings() {
        MapHelpers.renderMapBuildings(this);
    }

    renderNPCHouses() {
        MapHelpers.renderNPCHouses(this);
    }

    handleBuyLicense(licenseId) {
        EducationHelpers.handleBuyLicense(this, licenseId);
    }

    // ========== EDUCATION METHODS (delegated to EducationHelpers) ==========

    handleStartExam(courseId) {
        EducationHelpers.handleStartExam(this, courseId);
    }

    startExamQuestions() {
        EducationHelpers.startExamQuestions(this);
    }

    showExamQuestion() {
        EducationHelpers.showExamQuestion(this);
    }

    handleAnswerQuestion(answerIndex) {
        EducationHelpers.handleAnswerQuestion(this, answerIndex);
    }

    finishExam() {
        EducationHelpers.finishExam(this);
    }

    updateRelationshipsScreen() {
        NPCHelpers.updateRelationshipsScreen(this);
    }

    interactWithNPC(npcId) {
        NPCHelpers.interactWithNPC(this, npcId);
    }

    handleTravel(locationId) {
        MapHelpers.handleTravel(this, locationId);
    }

    handleLocationAction(action) {
        MapHelpers.handleLocationAction(this, action);
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

                // Calculate and deduct taxes based on previous week's income
                const weeklyIncome = this.gameState.weeklyIncome || 0;
                if (weeklyIncome > 0) {
                    const tax = this.economySystem.calculateTax(weeklyIncome);
                    if (tax > 0) {
                        this.gameState.money -= tax;
                        this.showToast(`Taxes paid: -$${tax.toLocaleString()}`, 'warning');
                    }
                }

                // Reset weekly income tracker
                this.gameState.weeklyIncome = 0;

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
        MapHelpers.updateEnvironmentForLocation(this, locationId);
    }

    checkForCharacterEvolution() {
        ProjectHelpers.checkForCharacterEvolution(this);
    }

    updatePlayerAvatar() {
        ProjectHelpers.updatePlayerAvatar(this);
    }

    // ========== PROJECT METHODS (delegated to ProjectHelpers) ==========

    handleStartProject(contractId) {
        ProjectHelpers.handleStartProject(this, contractId);
    }

    handleWorkOnProject() {
        ProjectHelpers.handleWorkOnProject(this);
    }

    startWorkingSession(hours) {
        ProjectHelpers.startWorkingSession(this, hours);
    }
    /**
     * Main Game Loop
     */
    gameLoop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Update day/night cycle
        if (this.dayNightCycle) {
            this.dayNightCycle.update();
        }
        
        // Check notifications
        if (this.notificationSystem) {
            this.notificationSystem.checkNotifications();
        }
        
        // Check for events (once per day)
        if (this.eventSystem && this.gameState.timeManager) {
            const currentDay = this.gameState.timeManager.totalDays || 1;
            const lastEventCheck = this.gameState.lastEventCheck || 0;
            
            if (currentDay > lastEventCheck) {
                const todayEvents = this.eventSystem.checkTodayEvents();
                todayEvents.forEach(event => {
                    const result = this.eventSystem.triggerEvent(event.id);
                    if (result && this.showToast) {
                        this.showToast(result.message, result.type === 'crash' ? 'error' : 'info');
                    }
                });
                this.gameState.lastEventCheck = currentDay;
            }
        }
        
        // Check visual progression milestones
        if (this.visualProgressionSystem) {
            this.visualProgressionSystem.checkMilestones();
        }
        
        // Check for new research papers (only if game is started)
        if (this.researchPaperSystem && this.gameState.isGameStarted) {
            try {
                this.researchPaperSystem.checkForNewPapers();
                
                // Update inbox button badge
                this.updateInboxBadge();
            } catch (error) {
                console.error('Error checking research papers:', error);
            }
        }

        // Update Phase 1 Visual Systems
        try {
            if (this.visualSystem) {
                this.visualSystem.update(deltaTime);
            }
            
            // Update camera system
            if (this.cameraSystem) {
                this.cameraSystem.update();
            }
            
            // Update animated characters
            if (this.animatedCharacterRenderer) {
                this.animatedCharacterRenderer.updateAll(deltaTime);
            }
        } catch (error) {
            console.error('Error updating visual systems:', error);
        }

        this.gameLoopId = requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Update inbox badge with unread count
     */
    updateInboxBadge() {
        try {
            if (!this.researchPaperSystem || !this.researchInboxUI) return;
            
            const unreadCount = this.researchPaperSystem.getUnreadCount();
            const badge = document.getElementById('inbox-unread-badge');
            const button = document.getElementById('btn-research-inbox');
            
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    badge.classList.remove('hidden');
                    if (button) button.classList.add('has-unread');
                } else {
                    badge.classList.add('hidden');
                    if (button) button.classList.remove('has-unread');
                }
            }
            
            // Update inbox UI if open
            if (this.researchInboxUI && this.researchInboxUI.isOpen) {
                this.researchInboxUI.updateUnreadCount();
            }
        } catch (error) {
            console.error('Error updating inbox badge:', error);
        }
    }


    finishWorkingSession(ticks, totalTicks) {
        ProjectHelpers.finishWorkingSession(this, ticks, totalTicks);
    }

    simulateWorkTick() {
        ProjectHelpers.simulateWorkTick(this);
    }
    
    /**
     * Show loading progress
     */
    showLoadingProgress(message, percent) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            const text = loadingScreen.querySelector('.loading-text');
            const bar = loadingScreen.querySelector('.loading-bar-fill');
            if (text) text.textContent = message || 'Loading...';
            if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        }
    }
    
    /**
     * Hide loading progress
     */
    hideLoadingProgress() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }
    
    /**
     * Load deferred systems in background
     */
    loadDeferredSystems() {
        try {
            // Location detail system
            if (!this.gameState.locationDetailSystem) {
                this.gameState.locationDetailSystem = new LocationDetailSystem(this.gameState);
                this.locationDetailSystem = this.gameState.locationDetailSystem;
            }
            
            // Company management
            if (!this.gameState.companyManagement) {
                this.gameState.companyManagement = new CompanyManagementSystem(this.gameState);
                this.companyManagement = this.gameState.companyManagement;
            }
            
            // Romance progression
            if (!this.gameState.romanceProgression) {
                this.gameState.romanceProgression = new RomanceProgressionSystem(this.gameState);
                this.romanceProgression = this.gameState.romanceProgression;
            }
            
            // Jealousy system
            if (!this.gameState.jealousySystem) {
                this.gameState.jealousySystem = new JealousySystem(this.gameState);
                this.jealousySystem = this.gameState.jealousySystem;
            }
            
            // Demanding boss
            if (!this.gameState.demandingBoss) {
                this.gameState.demandingBoss = new DemandingBossSystem(this.gameState);
                this.demandingBoss = this.gameState.demandingBoss;
                this.demandingBoss.initializeBoss({
                    name: 'Mr. Anderson',
                    title: 'Department Head',
                    demandLevel: 70
                });
            }
            
            // Gameplay settings
            if (!this.gameState.gameplaySettings) {
                this.gameState.gameplaySettings = new GameplaySettings();
                this.gameplaySettings = this.gameState.gameplaySettings;
            }
            
            // Roommate system
            if (!this.gameState.roommateSystem) {
                this.gameState.roommateSystem = new RoommateSystem(this.gameState);
                this.roommateSystem = this.gameState.roommateSystem;
            }
            
            // Dirty data system
            if (!this.gameState.dirtyDataSystem) {
                this.gameState.dirtyDataSystem = new DirtyDataSystem(this.gameState);
                this.dirtyDataSystem = this.gameState.dirtyDataSystem;
            }
            
            // Detailed map system
            if (!this.gameState.detailedMapSystem) {
                this.gameState.detailedMapSystem = new DetailedMapSystem(this.gameState);
                this.detailedMapSystem = this.gameState.detailedMapSystem;
            }
            
            // Room system
            if (!this.gameState.roomSystem) {
                this.gameState.roomSystem = new RoomSystem(this.gameState);
                this.roomSystem = this.gameState.roomSystem;
            }
            
            // Event system
            if (!this.gameState.eventSystem) {
                this.gameState.eventSystem = new EventSystem(this.gameState);
                this.eventSystem = this.gameState.eventSystem;
            }
            
            // Visual progression system
            if (!this.gameState.visualProgressionSystem) {
                this.gameState.visualProgressionSystem = new VisualProgressionSystem(this.gameState);
                this.visualProgressionSystem = this.gameState.visualProgressionSystem;
            }
            
            // Real-world task system
            if (!this.gameState.realWorldTaskSystem) {
                this.gameState.realWorldTaskSystem = new RealWorldTaskSystem(this.gameState);
                this.realWorldTaskSystem = this.gameState.realWorldTaskSystem;
            }
            
            // Task visual renderer
            if (!this.gameState.taskVisualRenderer) {
                this.taskVisualRenderer = new TaskVisualRenderer();
                this.gameState.taskVisualRenderer = this.taskVisualRenderer;
            }
            
            // AI training storyline
            if (!this.gameState.aiTrainingStoryline) {
                this.gameState.aiTrainingStoryline = new AITrainingStoryline(this.gameState);
                this.aiTrainingStoryline = this.gameState.aiTrainingStoryline;
            }
            
            // GitHub issues system
            if (!this.gameState.githubIssuesSystem) {
                this.gameState.githubIssuesSystem = new GitHubIssuesSystem(this.gameState);
                this.githubIssuesSystem = this.gameState.githubIssuesSystem;
            }
            
            // Research paper notification system
            if (!this.gameState.researchPaperSystem) {
                try {
                    this.gameState.researchPaperSystem = new ResearchPaperNotificationSystem(this.gameState);
                    this.researchPaperSystem = this.gameState.researchPaperSystem;
                    
                    this.researchInboxUI = new ResearchInboxUI(this.researchPaperSystem);
                    this.gameState.researchInboxUI = this.researchInboxUI;
                } catch (error) {
                    console.error('Error initializing research paper system:', error);
                    this.researchPaperSystem = null;
                    this.researchInboxUI = null;
                }
            }
            
            // Initialize emotional breakdown system
            this.gameState.emotionalBreakdownSystem = new EmotionalBreakdownSystem(this.gameState);
            this.emotionalBreakdownSystem = this.gameState.emotionalBreakdownSystem;
            
            // Initialize relationship dialogue system
            this.gameState.relationshipDialogueSystem = new RelationshipDialogueSystem(this.gameState);
            this.relationshipDialogueSystem = this.gameState.relationshipDialogueSystem;
            
            // Initialize comprehensive sprite system
            this.comprehensiveSpriteSystem = new ComprehensiveSpriteSystem(
                this.assetManager,
                this.spriteSheetManager
            );
            this.gameState.comprehensiveSpriteSystem = this.comprehensiveSpriteSystem;
            
            // Initialize sprite system in background
            setTimeout(async () => {
                try {
                    await this.comprehensiveSpriteSystem.initialize();
                    console.log('✅ Comprehensive sprite system loaded');
                } catch (error) {
                    console.warn('Sprite system initialization error:', error);
                }
            }, 1000);
            
            console.log('✅ Deferred systems loaded');
        } catch (error) {
            console.error('Error loading deferred systems:', error);
        }
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
