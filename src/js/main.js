/**
 * Data Science Tycoon - Main Entry Point
 * Initializes the game and manages global state
 */

// Import utilities first
import { logger } from './utils/Logger.js';
import { DOMUtils } from './utils/DOMUtils.js';

logger.debug('main.js module starting to load', { timestamp: Date.now() });

// Phase 4: Use Zustand for state management
import { useGameStore } from './store/gameStore.js';

logger.debug('useGameStore imported successfully', { hasStore: typeof useGameStore !== 'undefined' });
// Keep GameState import for backward compatibility during migration
import { GameState } from './game/GameState.js';
import { ScreenManager } from './ui/ScreenManager.js';
import { ChartManager } from './charts/ChartManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { SaveManager } from './save/SaveManager.js';
import { SaveSlotManager } from './ui/SaveSlotManager.js';
import { MenuThemeSystem } from './game/MenuThemeSystem.js';
import { MenuLogoDisplay } from './ui/MenuLogoDisplay.js';
import { StatisticsAggregator } from './ui/StatisticsAggregator.js';
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
import { StoryBeatsSystem } from './game/StoryBeatsSystem.js';
import { CharacterArcSystem } from './game/CharacterArcSystem.js';
import { NPCMemorySystem } from './game/NPCMemorySystem.js';
import { StoryUI } from './ui/StoryUI.js';
import { ActTransitionScreen } from './ui/ActTransitionScreen.js';
import { IDESystem } from './game/IDESystem.js';
import { LocationBackgroundSystem } from './game/LocationBackgroundSystem.js';
import { WeeklyNewsSystem } from './game/WeeklyNewsSystem.js';
import { ScreenThemeManager } from './game/ScreenThemeManager.js';
import { MapCoordinateSystem } from './game/MapCoordinateSystem.js';
import { GameEndingSystem } from './game/GameEndingSystem.js';
import { NarrativeClaritySystem } from './game/NarrativeClaritySystem.js';
// import { VisualSystem } from './visual/VisualSystem.js';
// Phase 3: Use GSAP instead of custom AnimationManager
// import { GSAPAnimationManager } from './animation/GSAPAnimationManager.js';
// Phase 4: Use PixiJS Assets and new interaction libraries (optional - wrapped in try-catch)
// Keep old imports for fallback
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
import { RANKS } from './data/ranks.js';
import { SHOP_ITEMS } from './data/shopItems.js';
// import { SpriteSheetManager } from './assets/SpriteSheetManager.js';
// import { AnimatedCharacterRenderer } from './characters/AnimatedCharacterRenderer.js';
// import { ThreeCharacterRenderer } from './characters/ThreeCharacterRenderer.js';
// import { VisualEffectsManager } from './effects/VisualEffectsManager.js';
// import { CharacterAnimationSystem } from './characters/CharacterAnimationSystem.js';
import { LocationView } from './ui/LocationView.js';

// Helper modules - split from main.js for easier debugging
import * as MapHelpers from './helpers/MapHelpers.js';
import * as NPCHelpers from './helpers/NPCHelpers.js';
import * as StockMarketHelpers from './helpers/StockMarketHelpers.js';
import * as EducationHelpers from './helpers/EducationHelpers.js';
import * as ProjectHelpers from './helpers/ProjectHelpers.js';

let game = null; // Declare game instance

logger.debug('Module loaded - all imports successful');

// Display visible debug info on page (wait for DOM) - DISABLED
/* DISABLED - Causes clutter
if (typeof document !== 'undefined' && process.env.NODE_ENV !== 'production') {
    const showDebug = () => {
        if (document.body) {
            const debugDiv = document.createElement('div');
            debugDiv.id = 'debug-loader-info';
            debugDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.8);color:#0f0;padding:10px;font-family:monospace;font-size:12px;z-index:99999;border:2px solid #0f0;border-radius:5px;max-width:300px;';
            debugDiv.innerHTML = 'main.js module loaded';
            document.body.appendChild(debugDiv);
            setTimeout(() => debugDiv.remove(), 5000);
        } else {
            setTimeout(showDebug, 100);
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showDebug);
    } else {
        showDebug();
    }
}
*/
// #endregion

export class MainGame {
    constructor() {
        logger.debug('MainGame constructor entry');

        // Phase 4: Use Zustand store for state management
        try {
            logger.debug('Attempting to access Zustand store...');
            this.gameStore = useGameStore;
            logger.debug('Zustand store accessed successfully', { storeType: typeof this.gameStore, hasGetState: typeof this.gameStore?.getState });
        } catch (e) {
            logger.error('Zustand store access failed:', e);
            throw e;
        }

        // Keep GameState for backward compatibility during migration
        try {
            logger.debug('Attempting to create GameState...');
            this.gameState = new GameState();
            logger.debug('GameState created successfully', { money: this.gameState.money, reputation: this.gameState.reputation });
        } catch (e) {
            logger.error('GameState creation failed:', e);
            throw e;
        }

        // Sync GameState with Zustand store
        try {
            this.syncGameStateToStore();
        } catch (e) {
            logger.error('GameState sync failed:', e);
            throw e;
        }

        this.saveManager = new SaveManager();
        this.saveSlotManager = null; // Will be initialized in initMenu
        this.currentSaveSlot = 0; // Default to slot 0
        this.menuThemeSystem = new MenuThemeSystem();
        this.menuLogoDisplay = null; // Will be initialized in initMenu
        this.statisticsAggregator = new StatisticsAggregator(this.saveManager);
        this.taskSystem = new TaskSystem(this.gameState);
        this.uiUpdater = new UIUpdater(this);
        this.storyUI = new StoryUI(this);
        this.screenManager = new ScreenManager(this);
        this.chartManager = new ChartManager(this);
        this.environmentManager = new EnvironmentManager(this.gameState);
        this.audioManager = new AudioManager();

        // Critical Logic Managers
        this.timeManager = new TimeManager(this.gameState);
        this.characterStats = new CharacterStats(this.gameState);

        this.gameLoopId = null;
        this.lastTime = 0;
        this.bankSystem = null; // Will be initialized when needed

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleTimeAdvance = this.handleTimeAdvance.bind(this);
        // this.init = this.init.bind(this); // specific bind not needed and causing issues
        this.startNewGame = this.startNewGame.bind(this);
        this.continueGame = this.continueGame.bind(this);

        logger.debug('MainGame constructor exit - all initialization complete', { hasSaveManager: !!this.saveManager, hasTaskSystem: !!this.taskSystem, hasScreenManager: !!this.screenManager });

        // this.init(); // Init is called in DOMContentLoaded
    }

    /**
     * Sync GameState with Zustand store (Phase 4)
     * Maintains backward compatibility during migration
     */
    syncGameStateToStore() {
        const store = this.gameStore.getState();

        // Sync Zustand store values to GameState
        this.gameState.money = store.money;
        this.gameState.reputation = store.reputation;
        this.gameState.rankIndex = store.rankIndex;
        this.gameState.rent = store.rent;
        this.gameState.bank = store.bank;
        this.gameState.tasksCompleted = store.tasksCompleted;
        this.gameState.perfectScores = store.perfectScores;
        this.gameState.totalEarned = store.totalEarned;
        this.gameState.weeklyIncome = store.weeklyIncome;
        this.gameState.totalRatings = store.totalRatings;
        this.gameState.ratingSum = store.ratingSum;
        this.gameState.unlockedChartTypes = store.unlockedChartTypes;
        this.gameState.purchasedItems = store.purchasedItems;
        this.gameState.unlockedTools = store.unlockedTools;
        this.gameState.unlockedLibraries = store.unlockedLibraries;
        this.gameState.isGameStarted = store.isGameStarted;
        this.gameState.tutorialCompleted = store.tutorialCompleted;
        this.gameState.soundEnabled = store.soundEnabled;
        this.gameState.musicEnabled = store.musicEnabled;
        this.gameState.currentLocation = store.currentLocation;
        this.gameState.chartConfig = store.chartConfig;

        // Subscribe to store changes to keep GameState in sync
        this.gameStore.subscribe((state) => {
            this.gameState.money = state.money;
            this.gameState.reputation = state.reputation;
            this.gameState.rankIndex = state.rankIndex;
            this.gameState.rent = state.rent;
            this.gameState.bank = state.bank;
            this.gameState.tasksCompleted = state.tasksCompleted;
            this.gameState.perfectScores = state.perfectScores;
            this.gameState.totalEarned = state.totalEarned;
            this.gameState.weeklyIncome = state.weeklyIncome;
            this.gameState.totalRatings = state.totalRatings;
            this.gameState.ratingSum = state.ratingSum;
            this.gameState.unlockedChartTypes = state.unlockedChartTypes;
            this.gameState.purchasedItems = state.purchasedItems;
            this.gameState.unlockedTools = state.unlockedTools;
            this.gameState.unlockedLibraries = state.unlockedLibraries;
            this.gameState.isGameStarted = state.isGameStarted;
            this.gameState.tutorialCompleted = state.tutorialCompleted;
            this.gameState.soundEnabled = state.soundEnabled;
            this.gameState.musicEnabled = state.musicEnabled;
            this.gameState.currentLocation = state.currentLocation;
            this.gameState.chartConfig = state.chartConfig;
        });
    }

    /**
     * Initialize the game
     */
    initTheme() {
        const savedTheme = localStorage.getItem('dst_theme_preference');
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            this.currentTheme = 'light';
        } else {
            document.documentElement.removeAttribute('data-theme');
            this.currentTheme = 'dark';
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.currentTheme = newTheme;

        if (newTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('dst_theme_preference', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('dst_theme_preference', 'dark');
        }

        // Update button icon
        const themeBtn = document.getElementById('btn-theme-toggle');
        if (themeBtn) {
            themeBtn.textContent = newTheme === 'light' ? '🌙' : '☀️';
        }

        // Show brief toast
        if (this.game && this.game.showToast) {
            this.game.showToast(`Switched to ${newTheme === 'light' ? 'Light' : 'Dark'} Mode`, 'info');
        }
    }

    async init() {
        logger.debug('init() method entry', { hasSaveManager: !!this.saveManager, hasGameState: !!this.gameState });

        // Show diagnostic overlay
        this.showDiagnostic('init() started');

        // Initialize Theme
        this.initTheme();

        logger.info('Initializing Data Science Tycoon...');

        try {
            logger.debug('Attempting to load game...');
            // Load saved game if exists
            // Check for saves in any slot
            const hasSave = this.saveManager.hasSave();
            if (hasSave) {
                // Try to load most recent slot, or slot 0
                const mostRecentSlot = this.saveManager.getMostRecentSlot() || 0;
                this.currentSaveSlot = mostRecentSlot;
                this.saveManager.loadGame(this.gameState, mostRecentSlot);
            }

            logger.debug(`Game loaded (save found: ${hasSave})`);

            // Initialize UI
            this.screenManager.init();

            logger.debug('Initializing ChartManager...');
            this.chartManager.init();

            logger.debug('Initializing EnvironmentManager...');

            // Initialize environment (backgrounds, weather, etc.)
            this.environmentManager.init();

            logger.debug('EnvironmentManager initialized');

            // Initialize menu
            this.initMenu(hasSave);

            logger.debug('Setting up event listeners...');
            // Setup event listeners
            this.setupEventListeners();
            logger.debug('Event listeners set up');

            // Hide loading screen, show game
            // Always show game, even if there were minor errors
            try {
                this.showGame();
            } catch (showError) {
                logger.error('Error in showGame():', showError);
                // Fallback: manually show game container
                const gameContainer = document.getElementById('game-container');
                const loadingScreen = document.getElementById('loading-screen');
                if (gameContainer) gameContainer.classList.remove('hidden');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                    loadingScreen.classList.add('hidden');
                }
            }

            logger.info('Game initialized successfully!');

            // Initialize developer tools (ONLY in dev mode - completely separate from main game)
            // Dev tools never interfere with normal gameplay - they're isolated
            const isDevMode = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                localStorage.getItem('dev_mode') === 'true' ||
                new URLSearchParams(window.location.search).has('dev');

            if (isDevMode) {
                try {
                    const { DevTools } = await import('./dev/index.js');
                    this.devTools = new DevTools(this);
                    logger.debug('Developer tools initialized (separate from main game)');
                } catch (error) {
                    // Dev tools are optional, don't fail if they don't load
                    logger.debug('Developer tools not available:', error.message);
                }
            }

        } catch (error) {
            logger.error('init() method error caught:', error);

            logger.error('Failed to initialize game:', error);
            logger.error('Stack trace:', error.stack);

            // Try to show game anyway so user can see something
            try {
                const gameContainer = document.getElementById('game-container');
                const loadingScreen = document.getElementById('loading-screen');
                if (gameContainer) gameContainer.classList.remove('hidden');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                    loadingScreen.classList.add('hidden');
                }
            } catch (e) {
                logger.error('Failed to show game container:', e);
            }

            this.showError('Failed to initialize game: ' + error.message + '. Some features may not work.');
        }
    }

    /**
     * Initialize main menu
     */
    initMenu(hasSave) {
        try {
            // Initialize theme system
            if (this.menuThemeSystem) {
                this.menuThemeSystem.init();

                // Check theme unlocks from most recent save
                if (hasSave) {
                    try {
                        const mostRecentSlot = this.saveManager.getMostRecentSlot();
                        if (mostRecentSlot !== null) {
                            const saveData = this.saveManager.getSaveData(mostRecentSlot);
                            if (saveData && saveData.state) {
                                // Create temporary gameState to check unlocks
                                const tempState = { ...saveData.state };
                                this.menuThemeSystem.checkThemeUnlocks(tempState);
                                this.menuThemeSystem.updateFromGameState(tempState);
                            }
                        }
                    } catch (e) {
                        logger.warn('Failed to check theme unlocks:', e);
                    }
                }
            }

            // Particle system disabled
            // this.initMenuParticles();

            // Initialize save slot manager
            try {
                this.saveSlotManager = new SaveSlotManager(
                    this.saveManager,
                    (slotIndex, isNewGame) => {
                        this.handleSlotSelection(slotIndex, isNewGame);
                    }
                );
                this.saveSlotManager.init();
            } catch (e) {
                logger.error('Failed to initialize save slot manager:', e);
                // Fallback: show old continue button
                const continueBtn = document.getElementById('btn-continue');
                if (continueBtn) {
                    continueBtn.style.display = '';
                }
            }

            // Initialize logo display with statistics
            try {
                if (this.menuLogoDisplay) {
                    this.menuLogoDisplay.init();
                }
            } catch (e) {
                logger.warn('Failed to initialize logo display:', e);
            }

            // Initialize and render statistics dashboard
            try {
                this.renderStatisticsDashboard();
            } catch (e) {
                logger.warn('Failed to render statistics dashboard:', e);
            }

            // Initialize essential menu enhancements (non-repetitive, unique)
            try {
                this.initMenuEnhancements();
            } catch (e) {
                logger.warn('Failed to initialize menu enhancements:', e);
            }

            // Keep old continue button hidden/disabled for backward compatibility
            const continueBtn = document.getElementById('btn-continue');
            if (continueBtn) {
                continueBtn.style.display = 'none';
            }
        } catch (error) {
            logger.error('Error in initMenu:', error);
            // Ensure game can still start even if menu enhancements fail
            const continueBtn = document.getElementById('btn-continue');
            if (continueBtn) {
                continueBtn.style.display = '';
            }
        }
    }

    /**
     * Initialize essential menu enhancements (unique, non-repetitive)
     */
    initMenuEnhancements() {
        const menuBackground = document.querySelector('.menu-background');
        const menuContainer = document.querySelector('.menu-container');

        if (!menuBackground || !menuContainer) return;

        // Time-of-day background (subtle, not repetitive)
        const hour = new Date().getHours();
        let timeOfDay = 'evening';
        if (hour >= 6 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
        else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
        else timeOfDay = 'night';
        menuBackground.setAttribute('data-time', timeOfDay);

        // Enhanced keyboard navigation
        this.setupMenuKeyboardNavigation();

        // Enhanced focus management
        this.setupMenuFocusManagement();

        // Accessibility improvements
        this.setupMenuAccessibility();
    }

    setupMenuKeyboardNavigation() {
        const buttons = document.querySelectorAll('.btn-manual-action');
        buttons.forEach((btn, index) => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' && index < buttons.length - 1) {
                    e.preventDefault();
                    buttons[index + 1].focus();
                } else if (e.key === 'ArrowUp' && index > 0) {
                    e.preventDefault();
                    buttons[index - 1].focus();
                }
            });
        });
    }

    setupMenuFocusManagement() {
        const menuScreen = document.getElementById('screen-menu');
        if (menuScreen) {
            menuScreen.setAttribute('role', 'main');
            menuScreen.setAttribute('aria-label', 'Main menu');
        }

        const buttons = document.querySelectorAll('.btn-manual-action');
        buttons.forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                const text = btn.querySelector('.btn-text')?.textContent || 'Menu button';
                btn.setAttribute('aria-label', text);
            }
        });
    }

    setupMenuAccessibility() {
        // Respect reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
        }

        // Enhanced focus indicators
        const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
        focusableElements.forEach(el => {
            el.addEventListener('focus', () => {
                el.style.outline = '2px solid rgba(139, 92, 246, 0.6)';
                el.style.outlineOffset = '2px';
            });
            el.addEventListener('blur', () => {
                el.style.outline = '';
                el.style.outlineOffset = '';
            });
        });
    }

    /**
     * Render statistics dashboard
     */
    renderStatisticsDashboard() {
        const dashboard = document.getElementById('menu-stats-dashboard');
        if (!dashboard) {
            logger.warn('Statistics dashboard element not found');
            return;
        }

        if (!this.statisticsAggregator) {
            logger.warn('Statistics aggregator not initialized');
            return;
        }

        const stats = this.statisticsAggregator.calculate();

        // Only show if there's meaningful data
        if (stats.totalPlaytime === 0 && stats.gamesCompleted === 0) {
            dashboard.style.display = 'none';
            return;
        }

        dashboard.style.display = 'grid';
        dashboard.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">Time</div>
                <div class="stat-content">
                    <div class="stat-label">Total Playtime</div>
                    <div class="stat-value">${this.statisticsAggregator.formatPlaytime(stats.totalPlaytime)}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">Trophy</div>
                <div class="stat-content">
                    <div class="stat-label">Games Completed</div>
                    <div class="stat-value">${stats.gamesCompleted}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">Chart</div>
                <div class="stat-content">
                    <div class="stat-label">Highest Rank</div>
                    <div class="stat-value">${stats.highestRankName}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">Money</div>
                <div class="stat-content">
                    <div class="stat-label">Total Money</div>
                    <div class="stat-value">${this.statisticsAggregator.formatMoney(stats.totalMoney)}</div>
                </div>
            </div>
        `;
    }

    /**
     * Handle save slot selection
     */
    handleSlotSelection(slotIndex, isNewGame) {
        this.currentSaveSlot = slotIndex;

        if (isNewGame) {
            this.startNewGame();
        } else {
            this.continueGame(slotIndex);
        }
    }

    /**
     * Initialize particle system for menu background
     */
    initMenuParticles() {
        const canvas = DOMUtils.query('#menu-particles-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const particles = [];
        const particleCount = 50;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Get theme color from CSS or use default
        const getThemeColor = () => {
            try {
                const root = document.documentElement;
                const color = getComputedStyle(root).getPropertyValue('--color-primary') ||
                    getComputedStyle(root).getPropertyValue('--primary-color') ||
                    'rgb(139, 92, 246)'; // Default purple
                return color.trim();
            } catch (e) {
                return 'rgb(139, 92, 246)'; // Default purple
            }
        };

        const themeColor = getThemeColor();

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: themeColor, // Add color property
            });
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                // Update position
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                // Draw particle with theme color
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                // Extract color and apply opacity
                if (particle.color) {
                    const colorMatch = particle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                    if (colorMatch) {
                        const r = colorMatch[1];
                        const g = colorMatch[2];
                        const b = colorMatch[3];
                        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`;
                    } else {
                        ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
                    }
                } else {
                    ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
                }
                ctx.fill();

                // Draw connections
                particles.forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        // Use theme color for connections
                        if (particle.color) {
                            const colorMatch = particle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                            if (colorMatch) {
                                const r = colorMatch[1];
                                const g = colorMatch[2];
                                const b = colorMatch[3];
                                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.1 * (1 - distance / 150)})`;
                            } else {
                                ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 150)})`;
                            }
                        } else {
                            ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 150)})`;
                        }
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Theme Toggle
        const themeBtn = document.getElementById('btn-theme-toggle');
        if (themeBtn) {
            themeBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Main Menu buttons
        document.getElementById('btn-new-game')?.addEventListener('click', () => {
            // Show save slots for new game selection
            if (this.saveSlotManager) {
                // Find first empty slot or use slot 0
                let emptySlot = null;
                for (let i = 0; i < 5; i++) {
                    if (!this.saveManager.hasSave(i)) {
                        emptySlot = i;
                        break;
                    }
                }
                // If no empty slot, use slot 0 (will overwrite)
                const slotToUse = emptySlot !== null ? emptySlot : 0;
                this.handleSlotSelection(slotToUse, true);
            } else {
                // Fallback: start game directly if SaveSlotManager not initialized
                this.startNewGame();
            }
        });

        // Continue button is now handled by SaveSlotManager
        // Keep for backward compatibility but hide it
        document.getElementById('btn-continue')?.addEventListener('click', () => {
            const mostRecentSlot = this.saveManager.getMostRecentSlot();
            if (mostRecentSlot !== null) {
                this.continueGame(mostRecentSlot);
            }
        });

        document.getElementById('btn-tutorial')?.addEventListener('click', () => {
            this.showTutorial();
        });

        // New menu buttons
        document.getElementById('btn-settings-menu')?.addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('btn-credits')?.addEventListener('click', () => {
            this.showCredits();
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

        // RPG Navigation - Map buttons (multiple buttons with same functionality)
        const mapButtonHandler = () => {
            this.screenManager.showScreen('screen-map');
            this.updateMapScreen();
        };
        document.getElementById('btn-nav-map')?.addEventListener('click', mapButtonHandler);
        document.getElementById('btn-nav-map-quick')?.addEventListener('click', mapButtonHandler);

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

        document.getElementById('btn-back-library')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game');
        });

        document.getElementById('btn-back-map')?.addEventListener('click', () => {
            this.screenManager.showScreen('screen-game');
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
            if (!this.worldMap || !this.timeManager) {
                this.showError("Game systems not ready yet.");
                return;
            }
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
                if (!this.worldMap) {
                    return;
                }
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
                if (!this.worldMap) {
                    this.showError("Game systems not ready yet.");
                    return;
                }
                const option = e.target.closest('.vehicle-option');
                if (!option) return;

                const vehicleId = option.dataset.vehicle;
                // Check if owned (ownedVehicles is a Set, use .has() not .includes())
                if (this.worldMap.ownedVehicles && this.worldMap.ownedVehicles.has(vehicleId)) {
                    this.worldMap.switchVehicle(vehicleId);
                    this.updateMapScreen();
                } else {
                    // Try to buy
                    const vehicle = this.worldMap.getVehicle(vehicleId);
                    if (!vehicle) {
                        this.showError("Vehicle not found.");
                        return;
                    }
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

        // Music Radio
        this.initMusicRadio();

        // Research inbox button
        const researchInboxHandler = () => {
            if (this.researchInboxUI) {
                this.researchInboxUI.toggle();
            } else {
                this.showToast('Research system not initialized yet', 'warning');
            }
        };
        // Try to attach immediately, and also on DOMContentLoaded if needed
        const researchInboxBtn = document.getElementById('btn-research-inbox');
        if (researchInboxBtn) {
            researchInboxBtn.addEventListener('click', researchInboxHandler);
        } else {
            // Button might not exist yet, try again when DOM is ready
            document.addEventListener('DOMContentLoaded', () => {
                document.getElementById('btn-research-inbox')?.addEventListener('click', researchInboxHandler);
            });
        }

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
                this.saveManager.saveGame(this.gameState, this.currentSaveSlot);
            }
        });

        // Listen for promotion events
        window.addEventListener('promotion', (e) => {
            const rank = e.detail.rank;
            this.showToast(`Promoted to ${rank.title}!`, 'success');
            this.audioManager.play('success');
            this.uiUpdater.updateAllUI();
        });
    }

    /**
     * Hide loading screen and show the game - Instant, no delays
     */
    showGame() {
        logger.debug('showGame() called');
        this.showDiagnostic('showGame() called');

        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');

        logger.debug('Loading screen element:', loadingScreen);
        logger.debug('Game container element:', gameContainer);

        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.classList.add('hidden');
            logger.debug('Loading screen hidden');
            this.showDiagnostic('Loading screen hidden');
        } else {
            logger.warn('Loading screen element not found!');
            this.showDiagnostic('ERROR: Loading screen not found!');
        }

        if (gameContainer) {
            gameContainer.classList.remove('hidden');
            logger.debug('Game container shown');
            this.showDiagnostic('Game container shown - SUCCESS!');
        } else {
            logger.warn('Game container element not found!');
            this.showDiagnostic('ERROR: Game container not found!');
        }

        // Update status indicator
        DOMUtils.updateElement('#js-status-indicator', {
            innerHTML: 'Game Initialized',
            style: { background: 'rgba(0,255,0,0.8)' }
        });
    }

    showDiagnostic(message) {
        // DISABLED - was creating visual clutter
        // console.log('[DIAGNOSTIC]', message);
    }

    showError(message) {
        logger.error('Game Error:', message);
        this.showDiagnostic('ERROR: ' + message);
        const errDiv = DOMUtils.createElement('div', {
            innerHTML: `<h2>Game Error</h2><p>${message}</p><button onclick="this.parentElement.remove()" style="padding:10px;margin-top:10px;">Close</button>`,
            style: {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255,0,0,0.95)',
                color: 'white',
                padding: '20px',
                fontFamily: 'monospace',
                zIndex: '99999',
                border: '3px solid #f00',
                borderRadius: '10px',
                maxWidth: '600px'
            }
        });
        document.body.appendChild(errDiv);
    }

    /**
     * Start a new game (optimized for fast loading)
     */
    startNewGame(slotIndex = null) {
        // Use provided slot or find first empty slot, default to 0
        if (slotIndex === null) {
            // Find first empty slot
            for (let i = 0; i < 5; i++) {
                if (!this.saveManager.hasSave(i)) {
                    slotIndex = i;
                    break;
                }
            }
            if (slotIndex === null) {
                slotIndex = 0; // Default to slot 0 if all are full
            }
        }

        this.currentSaveSlot = slotIndex;


        // Show loading indicator
        this.showLoadingProgress('Initializing game...', 0);

        try {
            // Reset game state
            this.gameState.reset();
            this.gameState.isGameStarted = true;
            logger.debug('gameState reset');

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
                    logger.warn('Error loading medium priority systems:', error);
                }
            }, 0);

            // LOW PRIORITY - Load last (defer)
            setTimeout(() => {
                try {
                    this.gameState.aiSystem = new AISystem(this.gameState);
                    this.gameState.hardwareManager = new HardwareManager(this.gameState);
                    this.gameState.contractSystem = new ContractSystem(this.gameState);
                    // NOTE: mapProgressionSystem is initialized later in startNewGame, don't duplicate here
                    // this.gameState.mapProgressionSystem = new MapProgressionSystem(this.gameState);
                } catch (error) {
                    logger.warn('Error loading low priority systems:', error);
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

            // Asset systems - Phase 4: Use PixiJS Assets
            this.showLoadingProgress('Preparing assets...', 70);

            // Phase 4: Use PixiJS AssetManager (with fallback - lazy load to avoid breaking game)
            this.assetManager = new AssetManager();
            this.gameState.assetManager = this.assetManager;

            // Try to load new managers asynchronously (non-blocking)
            Promise.all([
                import('./assets/PixiAssetManager.js').catch(() => null),
                import('./assets/PixiSpriteManager.js').catch(() => null),
                import('./interaction/InteractionManager.js').catch(() => null),
                import('./ui/TooltipManager.js').catch(() => null)
            ]).then(([PixiAssetManagerModule, PixiSpriteManagerModule, InteractionManagerModule, TooltipManagerModule]) => {
                // Initialize PixiAssetManager if available
                if (PixiAssetManagerModule?.PixiAssetManager) {
                    try {
                        this.pixiAssetManager = new PixiAssetManagerModule.PixiAssetManager();
                        this.gameState.pixiAssetManager = this.pixiAssetManager;
                    } catch (error) {
                        logger.warn('PixiAssetManager initialization failed:', error);
                    }
                }

                // Initialize PixiSpriteManager if available
                if (PixiSpriteManagerModule?.PixiSpriteManager) {
                    try {
                        this.pixiSpriteManager = new PixiSpriteManagerModule.PixiSpriteManager();
                        this.gameState.pixiSpriteManager = this.pixiSpriteManager;
                    } catch (error) {
                        logger.warn('PixiSpriteManager initialization failed:', error);
                    }
                }

                // Initialize InteractionManager if available
                if (InteractionManagerModule?.InteractionManager) {
                    try {
                        this.interactionManager = new InteractionManagerModule.InteractionManager();
                        this.gameState.interactionManager = this.interactionManager;
                    } catch (error) {
                        logger.warn('InteractionManager initialization failed:', error);
                    }
                }

                // Initialize TooltipManager if available
                if (TooltipManagerModule?.TooltipManager) {
                    try {
                        this.tooltipManager = new TooltipManagerModule.TooltipManager();
                        this.gameState.tooltipManager = this.tooltipManager;
                    } catch (error) {
                        logger.warn('TooltipManager initialization failed:', error);
                    }
                }
            }).catch(error => {
                logger.warn('Phase 4 managers failed to load (non-critical):', error);
            });

            /*
            // Keep old SpriteSheetManager for compatibility
            this.spriteSheetManager = new SpriteSheetManager();
            this.gameState.spriteSheetManager = this.spriteSheetManager;

            // Particle effects will be initialized when PixiJS app is ready
            this.particleEffectManager = null;

            // Use PixiSpriteManager if available, fallback to legacy SpriteSheetManager
            const spriteManager = this.pixiSpriteManager || this.spriteSheetManager;
            this.animatedCharacterRenderer = new AnimatedCharacterRenderer(spriteManager);
            this.gameState.animatedCharacterRenderer = this.animatedCharacterRenderer;
            */

            // Initialize filter manager
            import('./visual/FilterManager.js').then(({ FilterManager }) => {
                try {
                    this.filterManager = new FilterManager();
                    this.filterManager.initialize();
                    this.gameState.filterManager = this.filterManager;
                } catch (error) {
                    logger.warn('FilterManager initialization failed:', error);
                }
            }).catch(error => {
                logger.warn('FilterManager not available:', error);
            });

            // Legacy Visual Systems (Phase 4 Cleanup)
            /*
            this.characterAnimationSystem = new CharacterAnimationSystem(this.assetManager);
            this.characterRenderer = new AnimatedCharacterRenderer(this.visualSystem.startLoadingSpriteSheets());
            this.threeRenderer = new ThreeCharacterRenderer(); // Shared 3D renderer manager
            this.locationView = new LocationView(this, this.assetManager, this.characterRenderer, this.threeRenderer);
            this.gameState.locationView = this.locationView;
            */

            // Load assets in background (non-blocking, low priority)
            // Phase 4: Try PixiJS Assets first, fallback to old AssetManager
            setTimeout(async () => {
                if (this.pixiAssetManager) {
                    try {
                        const manifest = this.assetManager.getAssetManifest();
                        await this.pixiAssetManager.init(manifest);
                        await this.pixiAssetManager.loadAll();
                        logger.info('Assets loaded successfully (PixiJS)');
                    } catch (error) {
                        logger.warn('PixiJS Assets failed, using fallback:', error);
                        // Fallback to old AssetManager
                        this.assetManager?.loadAll()?.then(success => {
                            if (success) {
                                logger.info('Assets loaded successfully (fallback)');
                            }
                        }).catch(err => {
                            logger.warn('Asset loading error:', err);
                        });
                    }
                } else {
                    // Fallback to old AssetManager
                    this.assetManager?.loadAll()?.then(success => {
                        if (success) {
                            logger.info('Assets loaded successfully');
                        }
                    }).catch(err => {
                        logger.warn('Asset loading error:', err);
                    });
                }
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
            this.gameState.storyBeatsSystem = new StoryBeatsSystem(this.gameState);
            this.gameState.characterArcSystem = new CharacterArcSystem(this.gameState);
            this.gameState.npcMemorySystem = new NPCMemorySystem(this.gameState);
            this.gameState.mapProgressionSystem = new MapProgressionSystem(this.gameState);
            this.gameState.ideSystem = new IDESystem(this.gameState);
            this.gameState.locationBackgroundSystem = new LocationBackgroundSystem(this.gameState);
            this.gameState.weeklyNewsSystem = new WeeklyNewsSystem(this.gameState);
            this.gameState.screenThemeManager = new ScreenThemeManager();
            this.gameState.mapCoordinateSystem = new MapCoordinateSystem();
            this.gameState.gameEndingSystem = new GameEndingSystem(this.gameState);
            this.gameState.gameEndingSystem.gameState.mainGame = this;
            this.gameState.narrativeClaritySystem = new NarrativeClaritySystem(this.gameState);

            // DEFER Phase 1 Visual Systems - Load in background
            setTimeout(() => {
                try {
                    // this.gameState.visualSystem = new VisualSystem(this.gameState);
                    // Phase 3: Use GSAP instead of custom AnimationManager
                    // this.gameState.animationManager = new GSAPAnimationManager();
                    // Also store as gsapAnimator for easy access
                    this.gameState.gsapAnimator = this.gameState.animationManager;
                    // Phase 4: Initialize particle effects (will be set up when PixiJS app is ready)
                    this.gameState.particleEffectManager = null;
                    this.gameState.performanceManager = new PerformanceManager();
                    this.gameState.uiLayerManager = new UILayerManager();

                    // Register visual subsystems (moved inside setTimeout to avoid null reference)
                    if (this.gameState.visualSystem && this.gameState.animationManager) {
                        this.gameState.visualSystem.registerRenderer('animation', this.gameState.animationManager);
                    }

                    // Detect hardware and set quality (moved inside setTimeout to avoid null reference)
                    if (this.gameState.performanceManager) {
                        try {
                            this.gameState.performanceManager.detectHardware();
                            // Start monitoring after a short delay to ensure game loop is running
                            setTimeout(() => {
                                if (this.gameState.performanceManager) {
                                    this.gameState.performanceManager.startMonitoring();
                                }
                            }, 100);
                        } catch (error) {
                            logger.warn('Performance manager initialization failed:', error);
                        }
                    }
                } catch (error) {
                    logger.warn('Error loading visual systems:', error);
                }
            }, 300);

            // Link mainGame reference for systems that need it
            this.gameState.mainGame = this;

            logger.debug('[startNewGame]: all systems initialized');

            // Link managers to main class for easy access
            this.characterStats = this.gameState.characterStats;
            this.timeManager = this.gameState.timeManager;
            this.economySystem = this.gameState.economySystem;
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
            this.storyBeatsSystem = this.gameState.storyBeatsSystem;
            // NOTE: mapProgressionSystem already linked above, don't duplicate
            this.ideSystem = this.gameState.ideSystem;
            this.locationBackgroundSystem = this.gameState.locationBackgroundSystem;
            this.weeklyNewsSystem = this.gameState.weeklyNewsSystem;
            this.screenThemeManager = this.gameState.screenThemeManager;
            this.mapCoordinateSystem = this.gameState.mapCoordinateSystem;

            // Link Phase 1 Visual Systems
            this.visualSystem = this.gameState.visualSystem;
            this.animationManager = this.gameState.animationManager;
            // Phase 3: Also expose as gsapAnimator for easy access
            this.gsapAnimator = this.gameState.gsapAnimator || this.gameState.animationManager;
            // Phase 4: Use PixiJS AssetManager (with fallback - may be undefined if lazy load failed)
            this.pixiAssetManager = this.gameState.pixiAssetManager || null;
            this.assetManager = this.gameState.assetManager;
            this.pixiSpriteManager = this.gameState.pixiSpriteManager || null;
            this.spriteSheetManager = this.gameState.spriteSheetManager;
            // Phase 4: Interaction and tooltip managers (may be undefined if lazy load failed)
            this.interactionManager = this.gameState.interactionManager || null;
            this.tooltipManager = this.gameState.tooltipManager || null;
            this.performanceManager = this.gameState.performanceManager;
            this.uiLayerManager = this.gameState.uiLayerManager;

            // Initialize camera system for map (lazy initialization when map is accessed)
            // Camera will be initialized in updateMapScreen() when needed

            // Initialize storyline
            if (this.storylineManager) {
                this.storylineManager.initialize();
            } else {
                logger.warn('StorylineManager not initialized, skipping initialization');
            }

            // Initialize story beats system
            if (this.storyBeatsSystem) {
                this.storyBeatsSystem.initialize();
            }

            // Initialize character arc system
            if (this.characterArcSystem) {
                this.characterArcSystem.initialize();
            }

            // Initialize NPC memory system
            if (this.npcMemorySystem) {
                this.npcMemorySystem.initialize();
            }

            // Initialize story UI
            if (this.storyUI) {
                this.storyUI.initialize();
            }

            // Initialize map coordinate system with existing locations
            if (this.worldMap) {
                const locations = this.worldMap.getAccessibleLocations();
                this.mapCoordinateSystem.initializeWithLocations(locations);
            }

            logger.debug('[startNewGame]: managers linked');
            this.showLoadingProgress('Ready!', 100);
            logger.debug('[startNewGame]: core systems initialized, showing intro');

            // Hide loading and show intro flow
            setTimeout(() => {
                this.hideLoadingProgress();
                if (this.introSystem) {
                    this.introSystem.showIntro();
                } else {
                    // Fallback if intro system not available
                    this.gameState.isGameStarted = true;
                    this.screenManager.showScreen('screen-game');
                }
            }, 100);
        } catch (error) {
            logger.error(' startNewGame ERROR:', error);
            logger.error('Stack:', error.stack);
            this.showError('Failed to start game. Please refresh the page.');
        }
    }


    /**
     * Finish game start after intro/job selection
     */
    finishGameStart() {
        try {
            logger.debug('[finishGameStart]: completing game initialization');
            this.gameState.isGameStarted = true;
            this.gameState.tutorialCompleted = true;

            // Generate first task
            if (!this.taskSystem) {
                throw new Error('TaskSystem not initialized');
            }
            this.taskSystem.generateNewTask();
            logger.debug('[finishGameStart]: first task generated');

            // Update task display
            if (this.uiUpdater) {
                this.uiUpdater.updateTaskDisplay();
            }

            // Generate initial news
            if (!this.newsManager) {
                logger.warn('NewsManager not initialized, skipping news generation');
            } else {
                this.newsManager.generateDailyNews();
                logger.debug('[finishGameStart]: news generated');
            }

            // Update UI
            if (!this.uiUpdater) {
                logger.warn('UIUpdater not initialized');
            } else {
                this.uiUpdater.updateAllUI();
                logger.debug('[finishGameStart]: UI updated');
            }

            if (this.worldMap) {
                this.updateMapScreen();
                logger.debug('[finishGameStart]: map updated');
            } else {
                logger.warn('WorldMap not initialized, skipping map update');
            }

            // Update environment
            if (this.environmentManager) {
                this.environmentManager.updateLocation();
                logger.debug('[finishGameStart]: environment updated');
            } else {
                logger.warn('EnvironmentManager not initialized');
            }

            // Show map screen as main area
            if (this.screenManager) {
                this.screenManager.showScreen('screen-game');
                logger.debug('[finishGameStart]: showScreen called (map)');
            } else {
                logger.error('ScreenManager not initialized');
            }

            // Play sound
            if (this.audioManager) {
                this.audioManager.play('start');
            }

            // Show toast with job info
            const job = this.gameState.currentJob;
            if (job) {
                this.showToast(`Day 1 at ${job.company}. Let's do this!`, 'success');

                // Check for story beat (first job)
                if (this.storyBeatsSystem) {
                    const beat = this.storyBeatsSystem.getBeat('first_job');
                    if (beat) {
                        this.handleStoryBeat(beat);
                    }
                }
            } else {
                this.showToast('Welcome to your new career!', 'success');
            }

            // Start game loop
            if (!this.gameLoopId) {
                this.gameLoopId = requestAnimationFrame(this.gameLoop);
                logger.debug('[finishGameStart]: Game loop started');
            }

            logger.debug('[finishGameStart]: COMPLETE');
        } catch (error) {
            logger.error('finishGameStart ERROR:', error);
            this.showError('Failed to start game. Please refresh.');
        }
    }

    /**
     * Continue saved game
     */
    continueGame() {
        logger.debug('Continuing saved game...');

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
        logger.debug("Reloading save data for subsystems...");
        this.saveManager.loadGame(this.gameState, this.currentSaveSlot);

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
            logger.debug('[continueGame]: Game loop started');
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

    // NOTE: handleTimeAdvance is defined later in the file (line ~1595)
    // This duplicate definition has been removed to prevent method override bugs

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
        if (this.audioManager) {
            this.audioManager.play('click');
        }
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


        if (!this.economySystem) {
            this.showError('Economy system not initialized. Please refresh the page.');
            return;
        }

        if (!this.gameState.currentTask) {
            this.showError('No task available. Please start a new game.');
            return;
        }

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
            1: { text: "This is completely wrong! Did you even look at the data?" },
            2: { text: "I expected better. This needs a lot of work." },
            3: { text: "It's okay, but nothing special. Keep practicing." },
            4: { text: "Good job! This clearly shows the trends." },
            5: { text: "Excellent work! This is exactly what I needed!" }
        };

        const reaction = bossReactions[score.stars] || bossReactions[3];

        // Animate feedback
        setTimeout(() => {
            const emojiEl = document.getElementById('reaction-emoji');
            if (emojiEl) emojiEl.textContent = '';
            document.getElementById('boss-feedback').querySelector('.feedback-text').textContent = reaction.text;
        }, 500);

        // Animate stars
        const starsContainer = document.getElementById('stars-container');
        const stars = starsContainer.querySelectorAll('.star');
        stars.forEach((star, i) => {
            setTimeout(() => {
                if (i < score.stars) {
                    star.textContent = '';
                    star.classList.add('filled');
                } else {
                    star.textContent = '';
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

            // Show money particle effect if significant amount
            if (score.moneyEarned > 100 && this.unifiedMapSystem?.particleManager) {
                // Get screen center or task completion location
                const screenCenterX = window.innerWidth / 2;
                const screenCenterY = window.innerHeight / 2;
                this.unifiedMapSystem.particleManager.createMoneyEffect(
                    screenCenterX,
                    screenCenterY,
                    score.moneyEarned
                );
            }
            const oldTaskCount = this.gameState.tasksCompleted || 0;
            this.gameState.tasksCompleted++;
            this.gameState.totalEarned += score.moneyEarned;
            this.gameState.weeklyIncome += score.moneyEarned; // Track for taxes

            // Check for story beats (task completion)
            if (this.storyBeatsSystem && oldTaskCount === 0) {
                const beat = this.storyBeatsSystem.getBeat('first_task_complete');
                if (beat) {
                    this.handleStoryBeat(beat);
                }
            }

            // Check for promotion
            if (this.economySystem) {
                const oldRank = this.gameState.rankIndex;
                const promoted = this.economySystem.checkPromotion();
                if (promoted) {
                    const newRank = this.gameState.currentRank;
                    this.showToast(`PROMOTED to ${newRank.title}!`, 'success');
                    this.audioManager.play('success');
                    this.uiUpdater.updateAllUI();

                    // Check for story beats (promotion)
                    if (this.storyBeatsSystem) {
                        if (oldRank === 0) {
                            const beat = this.storyBeatsSystem.getBeat('first_promotion');
                            if (beat) this.handleStoryBeat(beat);
                        }
                        // Check for other promotion beats
                        const newRankIndex = this.gameState.rankIndex;
                        if (newRankIndex >= 2 && newRankIndex < 3) {
                            const beat = this.storyBeatsSystem.getBeat('mid_career');
                            if (beat) this.handleStoryBeat(beat);
                        }
                        if (newRankIndex >= 4 && newRankIndex < 5) {
                            const beat = this.storyBeatsSystem.getBeat('senior_position');
                            if (beat) this.handleStoryBeat(beat);
                        }
                        if (newRankIndex >= 6) {
                            const beat = this.storyBeatsSystem.getBeat('final_rank');
                            if (beat) this.handleStoryBeat(beat);
                        }
                    }
                }
            }

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
        this.uiUpdater.updateAllUI();

        // Show game screen
        this.screenManager.showScreen('screen-game');
    }

    /**
     * Show tutorial modal
     */
    showTutorial() {
        const modalContent = `
            <div class="tutorial-modal">
                <h2>How to Play</h2>
                <div class="tutorial-steps">
                    <div class="tutorial-step">
                        <span class="step-number">1</span>
                        <div class="step-content">
                            <h4> Get Your Task</h4>
                            <p>Your boss will give you data and specific requirements for a visualization.</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <span class="step-number">2</span>
                        <div class="step-content">
                            <h4>Analyze the Data</h4>
                            <p>Look at the data table and understand what story it tells.</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <span class="step-number">3</span>
                        <div class="step-content">
                            <h4>Create Your Chart</h4>
                            <p>Choose the right chart type and customize it to clearly present the data.</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <span class="step-number">4</span>
                        <div class="step-content">
                            <h4>Get Rated</h4>
                            <p>Your boss will rate your work. Better ratings mean more money and reputation!</p>
                        </div>
                    </div>
                    <div class="tutorial-step">
                        <span class="step-number">5</span>
                        <div class="step-content">
                            <h4>Climb the Ladder</h4>
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
     * Show credits modal
     */
    showCredits() {
        const modalContent = `
            <div class="credits-modal">
                <h2>Credits</h2>
                <div class="credits-content">
                    <div class="credits-section">
                        <h3>Data Science Tycoon</h3>
                        <p>A game about climbing the corporate ladder through data visualization mastery.</p>
                    </div>
                    <div class="credits-section">
                        <h3>Version 1.0.0</h3>
                        <p>Built with passion for data science enthusiasts.</p>
                    </div>
                    <div class="credits-section">
                        <h3>Technologies</h3>
                        <p>Vanilla JavaScript • Chart.js • CSS3 • WebAssembly</p>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="game.closeModal()">Close</button>
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
                <h2>Settings</h2>
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
        btn.textContent = this.audioManager.soundEnabled ? '' : '';
    }

    /**
     * Initialize music radio interface
     */
    initMusicRadio() {
        const radioBtn = document.getElementById('btn-music-radio');
        const radioMenu = document.getElementById('music-radio-menu');
        const radioStations = radioMenu?.querySelectorAll('.radio-station');

        if (!radioBtn || !radioMenu) return;

        // Toggle menu visibility
        radioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            radioMenu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!radioBtn.contains(e.target) && !radioMenu.contains(e.target)) {
                radioMenu.classList.add('hidden');
            }
        });

        // Handle station selection
        radioStations?.forEach(station => {
            station.addEventListener('click', () => {
                const stationId = station.dataset.station;
                this.switchMusicStation(stationId);
                this.updateRadioUI();
                radioMenu.classList.add('hidden');
            });
        });

        // Initialize UI
        this.updateRadioUI();
    }

    /**
     * Switch music station
     */
    switchMusicStation(stationId) {
        this.audioManager.switchStation(stationId);
    }

    /**
     * Update radio UI to reflect current station
     */
    updateRadioUI() {
        const radioStations = document.querySelectorAll('.radio-station');
        const currentStation = this.audioManager.currentStation;

        radioStations.forEach(station => {
            station.classList.remove('active');
            if (station.dataset.station === currentStation) {
                station.classList.add('active');
            }
        });
    }

    /**
     * Reset game progress
     */
    resetProgress() {
        if (confirm('Are you sure? This will delete all your progress!')) {
            this.saveManager.clearSave(this.currentSaveSlot);
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

        const cost = staffCosts[role];
        if (!cost) {
            this.showError('Invalid staff role');
            return;
        }

        if (this.gameState.money < cost) {
            this.showError(`Not enough money! Need $${cost.toLocaleString()}`);
            return;
        }

        // Deduct cost and show success
        this.gameState.money -= cost;
        this.uiUpdater.updateAllUI();
        this.showToast(`Hired ${role} staff member!`, 'success');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        // Guard against undefined messages
        if (!message || message === undefined || message === 'undefined') {
            logger.warn('showToast called with undefined message');
            return;
        }

        const container = document.getElementById('toast-container');
        if (!container) {
            logger.warn('Toast container not found');
            return;
        }

        const icons = {
            success: 'Success',
            warning: 'Warning',
            error: 'Error',
            info: 'Info'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || ''}</span>
            <span class="toast-message">${String(message)}</span>
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
        if (!message || message === undefined || message === 'undefined') {
            logger.warn('showError called with undefined message');
            return;
        }
        this.showToast(String(message), 'error');
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
     * Handle office upgrade
     */
    handleUpgradeOffice() {
        const officePrices = [0, 5000, 15000, 50000, 200000, 1000000];
        const currentOffice = this.gameState.officeIndex || 0;
        const nextOfficePrice = officePrices[currentOffice + 1];

        if (!nextOfficePrice) {
            this.showError('Office is already maxed out!');
            return;
        }

        if (this.gameState.money < nextOfficePrice) {
            this.showError(`Not enough money! Need $${nextOfficePrice.toLocaleString()}`);
            return;
        }

        this.gameState.money -= nextOfficePrice;
        this.gameState.officeIndex = currentOffice + 1;

        this.showToast(`Office upgraded!`, 'success');
        this.audioManager.play('kaching');
        this.updateOfficeScreen();
        this.uiUpdater.updateAllUI();
    }

    /**
     * Purchase a shop item
     */
    purchaseItem(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);

        if (!item) {
            this.showError('Item not found');
            return;
        }

        const success = this.gameState.purchaseItem(item);
        if (success) {
            this.showToast(`Purchased ${item.name}!`, 'success');
            this.audioManager.play('kaching');
            this.uiUpdater.updateShopScreen();
            this.uiUpdater.updateAllUI();
        } else {
            if (!this.gameState.canAfford(item.price)) {
                this.showError('Not enough money!');
            } else {
                this.showError('Item already owned or cannot be purchased');
            }
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

        const pendingEl = document.getElementById('pending-jobs-count');
        const activeEl = document.getElementById('active-jobs-count');
        const completedEl = document.getElementById('completed-jobs-count');
        if (pendingEl) pendingEl.textContent = pendingCount;
        if (activeEl) activeEl.textContent = activeCount;
        if (completedEl) completedEl.textContent = completedCount;

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

    // Map rendering handled by SimpleMapRenderer - no separate building/house rendering needed

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
        if (!this.timeManager) {
            return;
        }
        if (slots <= 0) return;

        const events = this.timeManager.advanceTime(slots);

        // Handle events (new day, etc)
        events.forEach(event => {
            if (event.type === 'new_day') {
                if (!this.newsManager) {
                } else {
                    this.newsManager.generateDailyNews();
                }
                this.showToast('A new day has begun!', 'info');

                // Expenses
                if (this.gameState.economySystem) {
                    const { expenses } = this.gameState.economySystem.processDailyFinances();
                    // Salaries
                    const salaries = (this.gameState.staff || []).reduce((sum, s) => sum + (s.salary || 0), 0);
                    this.gameState.money -= salaries;

                    if (expenses > 0) {
                        // Don't toast every day for small expenses, maybe log it or update a ticker?
                        // For now, let's just silently deduct or show if significant
                    }
                } else {
                    // Fallback if economySystem not initialized
                    const salaries = (this.gameState.staff || []).reduce((sum, s) => sum + (s.salary || 0), 0);
                    this.gameState.money -= salaries;
                }

                if (this.gameState.money < 0) {
                    this.showToast('Warning: You are in debt!', 'warning');
                }
            } else if (event.type === 'new_week') {
                const rent = this.gameState.rent || 500;
                this.gameState.money -= rent;

                // Calculate and deduct taxes based on previous week's income
                const weeklyIncome = this.gameState.weeklyIncome || 0;
                if (weeklyIncome > 0 && this.economySystem) {
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

                // Check for story beat (first rent payment)
                if (this.storyBeatsSystem) {
                    const timeManager = this.gameState.timeManager;
                    const weeks = timeManager ? Math.floor((timeManager.totalDays || 0) / 7) : 0;
                    if (weeks === 1) {
                        const beat = this.storyBeatsSystem.getBeat('rent_due_first');
                        if (beat) {
                            this.handleStoryBeat(beat);
                        }
                    }
                }

                if (this.gameState.money < -1000) {
                    this.showToast('CRITICAL: Eviction imminent! Earn money fast!', 'error');
                }

                // Check for game ending conditions
                if (this.gameState.gameEndingSystem) {
                    const ending = this.gameState.gameEndingSystem.checkVictoryConditions();
                    if (ending) {
                        this.gameState.gameEndingSystem.triggerEnding(ending);
                    }
                }
            }
        });

        this.updateMapScreen(); // Update visuals
        this.uiUpdater.updateAllUI(); // Money updated
    }

    /**
     * Show game ending screen
     */
    showGameEnding(endingData) {
        if (!endingData) return;

        // Create ending modal
        const modal = document.createElement('div');
        modal.id = 'game-ending-modal';
        modal.className = 'modal active';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: 'Arial', sans-serif;
        `;

        const stats = this.gameState.gameEndingSystem?.getEndingStats() || {};

        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px; border-radius: 20px; max-width: 600px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <h1 style="font-size: 48px; margin: 0 0 20px 0; color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);">
                    ${endingData.title || 'Victory!'}
                </h1>
                <p style="font-size: 20px; margin: 0 0 30px 0; color: #e2e8f0;">
                    ${endingData.message || 'Congratulations on completing your journey!'}
                </p>
                <div style="background: rgba(15, 23, 42, 0.8); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
                    <h3 style="margin-top: 0; color: #fbbf24;">Career Statistics</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                        <div><strong>Final Rank:</strong> ${stats.rankTitle || 'Unknown'}</div>
                        <div><strong>Days Played:</strong> ${stats.days || 0}</div>
                        <div><strong>Total Money:</strong> $${(stats.money || 0).toLocaleString()}</div>
                        <div><strong>Reputation:</strong> ${stats.reputation || 0}</div>
                        <div><strong>Tasks Completed:</strong> ${stats.tasksCompleted || 0}</div>
                        <div><strong>Perfect Scores:</strong> ${stats.perfectScores || 0}</div>
                        <div><strong>Contracts:</strong> ${stats.contractsCompleted || 0}</div>
                        <div><strong>Projects:</strong> ${stats.projectsCompleted || 0}</div>
                    </div>
                </div>
                <div style="margin-top: 30px;">
                    <button id="btn-ending-new-game" style="
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        font-size: 18px;
                        border-radius: 10px;
                        cursor: pointer;
                        margin: 0 10px;
                        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                    ">New Game</button>
                    <button id="btn-ending-continue" style="
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        font-size: 18px;
                        border-radius: 10px;
                        cursor: pointer;
                        margin: 0 10px;
                        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                    ">Continue Playing</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Button handlers
        document.getElementById('btn-ending-new-game').onclick = () => {
            if (confirm('Start a new game? Your current progress will be lost.')) {
                this.startNewGame();
                modal.remove();
            }
        };

        document.getElementById('btn-ending-continue').onclick = () => {
            modal.remove();
            // Allow player to continue playing even after ending
        };

        // Play victory sound
        if (this.audioManager?.play) {
            this.audioManager.play('kaching');
        }
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
        if (!this.characterStats) {
            this.showError('Character stats not initialized');
            return;
        }
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

        // Check for major story decisions (throttled by StorylineManager's cooldown)
        if (this.storylineManager) {
            this.storylineManager.triggerDecisionIfAvailable();
        }

        // Check for story beats (every 10 seconds, throttled)
        const seconds = Math.floor(timestamp / 1000);
        if (this.storyBeatsSystem && seconds % 10 === 0 && seconds !== (this.lastBeatCheckSecond || -1)) {
            this.lastBeatCheckSecond = seconds;
            const triggeredBeats = this.storyBeatsSystem.checkForTriggeredBeats();
            triggeredBeats.forEach(beat => {
                this.handleStoryBeat(beat);
            });
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
                logger.error('Error checking research papers:', error);
            }
        }

        /*
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
            logger.error('Error updating visual systems:', error);
        }
        */

        this.gameLoopId = requestAnimationFrame(this.gameLoop);
    }

    /**
     * Handle story beat trigger
     */
    handleStoryBeat(beat) {
        if (!beat) return;

        // Check if already completed
        if (this.storyBeatsSystem && this.storyBeatsSystem.completedBeats.includes(beat.id)) {
            return;
        }

        // Complete the beat
        if (this.storyBeatsSystem) {
            this.storyBeatsSystem.completeBeat(beat.id);
        }

        // Show notification with description
        if (this.showToast) {
            this.showToast(`Story Beat: ${beat.title} - ${beat.description}`, 'info');
        }

        // Update story UI if open
        if (this.storyUI && this.storyUI.isOpen) {
            this.storyUI.updateStoryDisplay();
        }

        // Check for phase transition after beat
        if (this.storylineManager) {
            const transition = this.storylineManager.checkPhaseTransition();
            if (transition.phaseChanged) {
                // Phase transition will show act transition screen automatically
            }
        }
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
                this.researchInboxUI.refresh();
            }
        } catch (error) {
            logger.error('Error updating inbox badge:', error);
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
                    logger.error('Error initializing research paper system:', error);
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

                } catch (error) {
                    logger.warn('Sprite system initialization error:', error);
                }
            }, 1000);

            logger.debug('Deferred systems loaded');
        } catch (error) {
            logger.error('Error loading deferred systems:', error);
        }
    }
}

// Initialize on DOM ready

const initGame = () => {

    try {
        logger.debug('DOM Content Loaded. Starting Game...');

        logger.debug('Before MainGame instantiation');

        game = new MainGame();

        window.game = game; // Expose for modal buttons
        logger.debug('MainGame instantiated. Calling init()...');

        // Show diagnostic
        if (game.showDiagnostic) {
            game.showDiagnostic('About to call game.init()');
        }

        // Call init and handle any errors
        game.init().catch(err => {
            logger.error('init() promise rejected:', err);
            if (game.showError) {
                game.showError('init() failed: ' + err.message);
            }
        });

        // Fallback: If game doesn't show after 3 seconds, force it
        setTimeout(() => {
            const gameContainer = document.getElementById('game-container');
            const loadingScreen = document.getElementById('loading-screen');
            if (gameContainer && gameContainer.classList.contains('hidden')) {
                logger.warn('Fallback: Forcing game to show after timeout');
                gameContainer.classList.remove('hidden');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                    loadingScreen.classList.add('hidden');
                }
                if (game.showDiagnostic) {
                    game.showDiagnostic('Fallback: Game forced to show');
                }
            }
        }, 3000);
    } catch (e) {
        logger.error('CRITICAL BOOT ERROR:', e);
        const errDiv = document.createElement('div');
        errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,0,0,0.9);color:white;z-index:99999;padding:20px;font-family:monospace;white-space:pre-wrap;overflow:auto;pointer-events:all;';
        errDiv.innerHTML = '<h1>CRITICAL BOOT ERROR</h1><h3>' + e.toString() + '</h3><pre>' + e.stack + '</pre>';
        document.body.appendChild(errDiv);
    }
};

// Handle both cases: DOM already loaded or still loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // DOM already loaded, call immediately
    initGame();
}


export { game };
