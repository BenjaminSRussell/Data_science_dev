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
import { SaveManager, MAX_SAVE_SLOTS } from './save/SaveManager.js';
import { SaveSlotManager } from './ui/SaveSlotManager.js';
import { MenuThemeSystem } from './game/MenuThemeSystem.js';
import { MenuLogoDisplay } from './ui/MenuLogoDisplay.js';
import { StatisticsAggregator } from './ui/StatisticsAggregator.js';
import { TaskSystem } from './game/TaskSystem.js';
import { EconomySystem } from './game/EconomySystem.js';
import { BankSystem } from './game/BankSystem.js';
import { UIUpdater } from './ui/UIUpdater.js';
import { createGameEndingModal } from './ui/GameEndingModal.js';
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
import { DayNightCycle } from './game/DayNightCycle.js';
import { NotificationSystem } from './game/NotificationSystem.js';
import { LocationDetailSystem } from './game/locations/LocationDetailSystem.js';
import { OfficeManager } from './game/OfficeManager.js';
import { CompanyManagementSystem } from './game/company/CompanyManagementSystem.js';
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
import { ThreeCharacterRenderer } from './characters/ThreeCharacterRenderer.js';
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


// Hireable staff, keyed by the data-type on the Staff screen's hire cards (#2485)
export const STAFF_ROLES = {
    intern: { name: 'Intern', hireCost: 100, salary: 50, efficiency: 0.5, minOffice: 0 },
    junior_analyst: { name: 'Junior Analyst', hireCost: 300, salary: 150, efficiency: 0.8, minOffice: 0 },
    analyst: { name: 'Data Analyst', hireCost: 600, salary: 300, efficiency: 1.0, minOffice: 0 },
    data_scientist: { name: 'Data Scientist', hireCost: 1500, salary: 800, efficiency: 2.0, minOffice: 3, requiresLicense: 'business_license' }
};

// Staff capacity per office tier (index = gameState.officeIndex)
export const OFFICE_STAFF_CAPACITY = [1, 1, 2, 4, 10, 25];

export class MainGame {
    // Longest the loading screen waits for images before starting anyway (#1675)
    static ASSET_WAIT_MS = 4000;

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
        this.saveManager.onSaveError = (error) => {
            // Throttle so a full storage quota doesn't spam toasts every autosave
            const now = Date.now();
            if (now - (this._lastSaveErrorToast || 0) < 30000) return;
            this._lastSaveErrorToast = now;
            const quota = error && (error.name === 'QuotaExceededError' || /quota/i.test(error.message || ''));
            this.showToast?.(quota
                ? 'Save failed: browser storage is full. Export or delete a save slot.'
                : 'Save failed. Your latest progress was not stored.', 'error');
        };
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
        this.bankSystem = null; // Will be initialized when needed
        this.taskTimerIntervalId = null; // Track the task timer interval

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleTimeAdvance = this.handleTimeAdvance.bind(this);
        this.processTimeEvents = this.processTimeEvents.bind(this);
        // this.init = this.init.bind(this); // specific bind not needed and causing issues
        this.startNewGame = this.startNewGame.bind(this);
        this.continueGame = this.continueGame.bind(this);
        this.updateTaskTimer = this.updateTaskTimer.bind(this);
        this.startTaskTimer = this.startTaskTimer.bind(this);
        this.stopTaskTimer = this.stopTaskTimer.bind(this);

        logger.debug('MainGame constructor exit - all initialization complete', { hasSaveManager: !!this.saveManager, hasTaskSystem: !!this.taskSystem, hasScreenManager: !!this.screenManager });

        // this.init(); // Init is called in DOMContentLoaded
    }

    /**
     * Sync GameState with Zustand store (Phase 4)
     * Maintains backward compatibility during migration
     */
    syncGameStateToStore() {
        const store = this.gameStore.getState();

        // Sync Zustand store values to GameState. Arrays and objects are
        // copied, not shared, so in-place gameplay mutations of gameState
        // can't silently rewrite the store's state (#1612)
        MainGame.STORE_SYNC_FIELDS.forEach(field => {
            this.gameState[field] = MainGame.copyStoreValue(store[field]);
        });
        this.gameState.bank = MainGame.copyStoreValue(store.bank);

        // Subscribe to store changes to keep GameState in sync.
        // NOTE: bank is intentionally NOT synced from the store here. The store
        // never legitimately owns bank state (nothing calls setBank()), so
        // copying it back would let the async persist rehydration clobber the
        // bank object that BankSystem constructs during startNewGame().
        this.gameStore.subscribe((state) => {
            MainGame.STORE_SYNC_FIELDS.forEach(field => {
                this.gameState[field] = MainGame.copyStoreValue(state[field]);
            });
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

        // Chart.js draws text on the canvas, so redraw it in the new colours (#1893)
        this.chartManager?.refreshTheme?.();

        // Update button icon
        const themeBtn = document.getElementById('btn-theme-toggle');
        if (themeBtn) {
            themeBtn.textContent = newTheme === 'light' ? '🌙' : '☀️';
        }

        // Show brief toast
        // MainGame owns showToast; there is no this.game here (#90)
        this.showToast?.(`Switched to ${newTheme === 'light' ? 'Light' : 'Dark'} Mode`, 'info');
    }

    async init() {
        logger.debug('init() method entry', { hasSaveManager: !!this.saveManager, hasGameState: !!this.gameState });

        // Show diagnostic overlay
        this.showDiagnostic('init() started');

        // Initialize Theme
        this.initTheme();

        logger.info('Initializing Data Science Tycoon...');

        try {
            // Each startup step is guarded on its own: one failing step (say a
            // corrupt save) must not skip wiring every button in the game (#1657)
            this.initErrors = [];
            const step = (name, fn) => {
                try {
                    return fn();
                } catch (error) {
                    logger.error(`init step "${name}" failed:`, error);
                    this.initErrors.push(name);
                    return undefined;
                }
            };

            logger.debug('Attempting to load game...');
            // Load saved game if exists (check every slot, use the most recent)
            let hasSave = false;
            step('load save', () => {
                hasSave = this.saveManager.hasSave();
                if (hasSave) {
                    const mostRecentSlot = this.saveManager.getMostRecentSlot() || 0;
                    this.currentSaveSlot = mostRecentSlot;
                    this.saveManager.loadGame(this.gameState, mostRecentSlot);
                }
            });
            logger.debug(`Game loaded (save found: ${hasSave})`);

            // Initialize UI
            step('screens', () => this.screenManager.init());
            step('charts', () => this.chartManager.init());
            // Initialize environment (backgrounds, weather, etc.)
            step('environment', () => this.environmentManager.init());

            // Finish menu setup (awaited, in case any part is async) before
            // the menu is revealed (#1473)
            try {
                await this.initMenu(hasSave);
            } catch (error) {
                logger.error('init step "menu" failed:', error);
                this.initErrors.push('menu');
            }

            logger.debug('Setting up event listeners...');
            step('event listeners', () => this.setupEventListeners());
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
            const { isDevModeEnabled } = await import('./dev/devMode.js');

            if (isDevModeEnabled()) {
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
                                // updateFromGameState runs checkThemeUnlocks itself (#1474)
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
            let saveSlotManagerReady = false;
            try {
                this.saveSlotManager = new SaveSlotManager(
                    this.saveManager,
                    (slotIndex, isNewGame) => {
                        this.handleSlotSelection(slotIndex, isNewGame);
                    },
                    this
                );
                this.saveSlotManager.init();
                saveSlotManagerReady = true;
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

            // Keep old continue button hidden only when the slot dropdown replaced it;
            // otherwise the catch-block fallback above must stay visible (#1470)
            if (saveSlotManagerReady) {
                const continueBtn = document.getElementById('btn-continue');
                if (continueBtn) {
                    continueBtn.style.display = 'none';
                }
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
        // The old .menu-background/.menu-container markup is gone; gating on it
        // meant none of this ever ran (#1320, #2212). Work on #screen-menu.
        const menuScreen = document.getElementById('screen-menu');
        if (!menuScreen) return;

        // Time-of-day hint for menu styling
        const hour = new Date().getHours();
        let timeOfDay = 'night';
        if (hour >= 6 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
        else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
        menuScreen.setAttribute('data-time', timeOfDay);

        this.setupMenuKeyboardNavigation(menuScreen);
        this.setupMenuFocusManagement(menuScreen);
        this.setupMenuAccessibility();
    }

    /**
     * Buttons the menu's arrow keys move between: only the menu's own,
     * visible, enabled buttons (#2474)
     */
    getMenuNavButtons(menuScreen = document.getElementById('screen-menu')) {
        if (!menuScreen) return [];
        return [...menuScreen.querySelectorAll('button')].filter(btn =>
            !btn.disabled && !btn.closest('.hidden') && btn.style.display !== 'none');
    }

    setupMenuKeyboardNavigation(menuScreen = document.getElementById('screen-menu')) {
        if (!menuScreen || menuScreen.dataset.keyNavBound) return;
        menuScreen.dataset.keyNavBound = 'true';
        // One delegated listener, scoped to the menu, that re-reads the
        // buttons each time so shown/hidden buttons (Continue) are handled
        menuScreen.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            const buttons = this.getMenuNavButtons(menuScreen);
            const index = buttons.indexOf(document.activeElement);
            if (index === -1) return;
            const next = e.key === 'ArrowDown' ? index + 1 : index - 1;
            if (next < 0 || next >= buttons.length) return;
            e.preventDefault();
            buttons[next].focus();
        });
    }

    setupMenuFocusManagement(menuScreen = document.getElementById('screen-menu')) {
        if (!menuScreen) return;
        menuScreen.setAttribute('role', 'main');
        menuScreen.setAttribute('aria-label', 'Main menu');

        // Only label buttons that have no visible text; a generic label would
        // replace a button's real name for screen readers (#2474)
        menuScreen.querySelectorAll('button').forEach(btn => {
            if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
                btn.setAttribute('aria-label', btn.title || 'Menu button');
            }
        });
    }

    setupMenuAccessibility() {
        // Respect reduced motion (CSS keys off this attribute); focus rings
        // come from the :focus-visible rule in main.css
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        if (prefersReducedMotion) {
            document.documentElement.setAttribute('data-reduced-motion', 'true');
        }
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

        const stats = this.statisticsAggregator.getStats();

        // Only show if there's meaningful data
        if (stats.totalPlaytime === 0 && stats.gamesCompleted === 0) {
            dashboard.style.display = 'none';
            return;
        }

        dashboard.style.display = 'grid';
        // All aggregated totals, not just the first four (#1632)
        dashboard.innerHTML = this.statisticsAggregator.getDashboardHTML(stats);
    }

    /**
     * Handle save slot selection
     */
    handleSlotSelection(slotIndex, isNewGame) {
        this.currentSaveSlot = slotIndex;

        if (isNewGame) {
            // Start in the slot the player actually picked (#1661)
            this.startNewGame(slotIndex);
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
        // Reset guard — repeated init must not accumulate particles (#2641)
        if (this._menuParticlesCleanup) {
            this._menuParticlesCleanup();
            this._menuParticlesCleanup = null;
        }

        const ctx = canvas.getContext('2d');
        const particles = [];
        const particleCount = 50;
        let rafId = 0;
        let alive = true;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const parseCssColor = (raw) => {
            const c = (raw || '').trim();
            if (!c) return null;
            const rgb = c.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            if (rgb) return `rgb(${rgb[1]}, ${rgb[2]}, ${rgb[3]})`;
            const hex = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
            if (hex) {
                let h = hex[1];
                if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
                const n = parseInt(h, 16);
                return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
            }
            return null;
        };

        // Get theme color from CSS vars the app actually sets (#2642)
        const getThemeColor = () => {
            try {
                const root = document.documentElement;
                const style = getComputedStyle(root);
                const keys = [
                    '--color-accent-primary', '--color-primary', '--primary',
                    '--primary-color', '--accent', '--accent-color',
                    '--theme-primary', '--brand', '--link-color',
                    '--color-text-accent'
                ];
                for (const k of keys) {
                    const parsed = parseCssColor(style.getPropertyValue(k));
                    if (parsed) return parsed;
                }
                return 'rgb(139, 92, 246)';
            } catch (e) {
                return 'rgb(139, 92, 246)';
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
            if (!alive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, i) => {
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

                // Draw connections once per pair (i < j) — avoid double brightness (#2643)
                particles.forEach((otherParticle, j) => {
                    if (j <= i) return;
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

            rafId = requestAnimationFrame(animate);
        };

        animate();

        this._menuParticlesCleanup = () => {
            alive = false;
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resizeCanvas);
            particles.length = 0;
            try { ctx.clearRect(0, 0, canvas.width, canvas.height); } catch (_) {}
        };
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
                // First empty slot, or confirm overwriting the least recently played one
                const slotToUse = this.saveSlotManager.pickNewGameSlot();
                if (slotToUse !== null) {
                    this.handleSlotSelection(slotToUse, true);
                }
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
            // Holidays close the shops (#1704)
            if (this.eventSystem?.isShopClosed?.()) {
                this.showToast('The shop is closed for the holiday. Come back tomorrow.', 'info');
                return;
            }
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
            // sleep() already advances to the next morning; only apply the
            // resulting new-day/new-week effects (#917, #1249, #2396)
            const result = this.timeManager.sleep();
            this.processTimeEvents(result.events);
            this.updateMapScreen();
            this.showToast('You slept well and feel refreshed!', 'success');
        });

        // World map travel, vehicle, training and shop category clicks (#1100)
        this.setupWorldInputs();

        // Dataset panel Sort/Filter buttons (#2334)
        document.getElementById('btn-sort')?.addEventListener('click', () => {
            const ts = this.taskSystem;
            const cols = ts?.currentTableData?.columns?.length || 0;
            if (!cols) return;
            // Re-sort the last sorted column in the other direction, or start with
            // the first numeric column
            let col = ts.lastSortCol;
            if (col === undefined || col === null) {
                const row = ts.currentTableData.rows?.[0] || [];
                col = Math.max(0, row.findIndex(v => typeof v === 'number'));
            }
            ts.handleTableSort(col);
        });
        document.getElementById('btn-filter')?.addEventListener('click', () => {
            const input = document.getElementById('table-filter');
            if (!input) return;
            input.focus();
            input.select?.();
        });

        // Staff hiring / firing (#2485)
        document.getElementById('hire-staff-grid')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            const card = e.target.closest('.hire-card');
            if (btn && card && !btn.disabled) this.handleHireStaff(card.dataset.type);
        });
        document.getElementById('current-staff-grid')?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-fire-staff]');
            if (btn) this.handleFireStaff(btn.dataset.fireStaff);
        });

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
        this.bindPerformanceEvents();

        document.getElementById('btn-sound')?.addEventListener('click', () => {
            this.toggleSound();
        });
        this.updateSoundButton();

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
        // Delegate from document so the handler works even if the button is
        // rendered later; the old DOMContentLoaded fallback could never fire
        // because setupEventListeners() runs after that event (#1652, #1097)
        document.addEventListener('click', (e) => {
            if (e.target?.closest?.('#btn-research-inbox')) researchInboxHandler();
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

            if (!result) return;
            if (result.success) {
                this.showToast(result.message, 'success');
                this.audioManager.play('kaching');
                if (input) input.value = ''; // Clear input
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

        // Enter in a bank amount field submits that action (#1098)
        [['bank-deposit-input', 'deposit'], ['bank-withdraw-input', 'withdraw'],
            ['bank-loan-input', 'loan'], ['bank-repay-input', 'repay']].forEach(([inputId, action]) => {
            document.getElementById(inputId)?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleBankAction(action, inputId);
                }
            });
        });

        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState.isGameStarted) {
                this.saveManager.saveGame(this.gameState, this.currentSaveSlot);
            }
        });

        // Listen for promotion events
        window.addEventListener('promotion', (e) => {
            const rank = e.detail.rank;
            // Show the full promotion moment, falling back to a toast (#1486)
            if (!this.uiUpdater?.showPromotionAnimation?.(rank)) {
                this.showToast(`Promoted to ${rank.title}!`, 'success');
            }
            this.audioManager?.play?.('promotion');
            this.uiUpdater?.updateAllUI?.();
        });
    }

    /**
     * Resolve once assets finish loading or after `maxWaitMs`, whichever is
     * first, updating the loading bar from 70% toward 99% meanwhile (#1675)
     */
    waitForAssets(maxWaitMs = MainGame.ASSET_WAIT_MS) {
        const load = Promise.resolve(this.loadAssetsInBackground?.()).catch(() => false);
        let timer = null;
        let poll = null;
        const timeout = new Promise(resolve => { timer = setTimeout(() => resolve('timeout'), maxWaitMs); });
        poll = setInterval(() => {
            const p = Number(this.assetManager?.loadProgress) || 0;
            this.showLoadingProgress?.(`Loading assets... ${Math.round(p)}%`, 70 + Math.min(29, Math.round(p * 0.29)));
        }, 150);
        return Promise.race([load, timeout]).finally(() => {
            clearTimeout(timer);
            clearInterval(poll);
        });
    }

    /**
     * Load game assets once per session. Waits for the PixiJS managers to
     * finish importing so a slow import can't force the legacy pipeline
     * (#1049), and does nothing if a previous game already loaded them (#1679).
     */
    loadAssetsInBackground() {
        if (this.assetLoadPromise) return this.assetLoadPromise;
        const legacyLoad = () => Promise.resolve(this.assetManager?.loadAll?.())
            .then(success => {
                if (success) logger.info('Assets loaded successfully');
                return !!success;
            })
            .catch(err => {
                logger.warn('Asset loading error:', err);
                return false;
            });
        this.assetLoadPromise = Promise.resolve(this.phase4ManagersReady)
            .catch(() => null)
            .then(async () => {
                // Game code reads images from this.assetManager, so it always
                // loads them. The old code skipped it whenever PixiAssetManager
                // existed, but Pixi's init never ran (#68), so nothing loaded.
                // Pixi only registers the same manifest so its getters resolve
                // once something loads a bundle, without downloading everything twice.
                if (this.pixiAssetManager) {
                    try {
                        const ok = await this.pixiAssetManager.init(this.assetManager.getAssetManifest());
                        if (!ok) logger.warn('PixiJS Assets manifest was not registered');
                    } catch (error) {
                        logger.warn('PixiJS Assets init failed:', error);
                    }
                }
                return legacyLoad();
            });
        // A failed load can be retried by the next game
        this.assetLoadPromise.then(ok => { if (!ok) this.assetLoadPromise = null; });
        return this.assetLoadPromise;
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
            // Fade, then hide: adding .hidden (display:none) in the same tick
            // made the opacity change invisible (#1064)
            MainGame.fadeOutElement(loadingScreen);
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


    /**
     * Start a new game (optimized for fast loading)
     */
    startNewGame(slotIndex = null) {
        // Use provided slot or find first empty slot, default to 0
        if (slotIndex === null) {
            // Find first empty slot
            for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
                if (!this.saveManager.hasSave(i)) {
                    slotIndex = i;
                    break;
                }
            }
            if (slotIndex === null) {
                // Every slot is full: overwrite only with the player's OK (#874)
                const fallback = this.saveManager.getMostRecentSlot?.() ?? 0;
                const ok = typeof confirm === 'function'
                    ? confirm(`All save slots are full. Overwrite Save Slot ${fallback + 1}?`)
                    : false;
                if (!ok) return false;
                slotIndex = fallback;
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
                    // Re-link now that the systems exist; the synchronous link below
                    // ran before this callback and copied undefined (#1660)
                    this.linkSessionSystems();
                } catch (error) {
                    logger.warn('Error loading medium priority systems:', error);
                }
            }, 0);

            // LOW PRIORITY - Load last (defer). Each system is built on its own
            // so one failing constructor can't silently take its siblings down (#2039)
            setTimeout(() => {
                const lowPriority = {
                    aiSystem: () => new AISystem(this.gameState),
                    hardwareManager: () => new HardwareManager(this.gameState),
                    contractSystem: () => new ContractSystem(this.gameState)
                };
                // NOTE: mapProgressionSystem is initialized later in startNewGame, don't duplicate here
                for (const [key, create] of Object.entries(lowPriority)) {
                    try {
                        this.gameState[key] = create();
                    } catch (error) {
                        logger.warn(`Error loading low priority system ${key}:`, error);
                    }
                }
                this.linkSessionSystems(); // (#1660)
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
            // Reuse the AssetManager (and its loaded images) when a new game
            // starts mid-session instead of re-fetching the manifest (#1679)
            if (!this.assetManager) this.assetManager = new AssetManager();
            this.gameState.assetManager = this.assetManager;

            // Try to load new managers asynchronously (non-blocking). Keep the
            // promise so the asset loader can wait for it (#1049)
            this.phase4ManagersReady = Promise.all([
                import('./assets/PixiAssetManager.js').catch(() => null),
                import('./assets/PixiSpriteManager.js').catch(() => null),
                import('./interaction/InteractionManager.js').catch(() => null),
                import('./ui/TooltipManager.js').catch(() => null)
            ]).then(([PixiAssetManagerModule, PixiSpriteManagerModule, InteractionManagerModule, TooltipManagerModule]) => {
                // Initialize PixiAssetManager if available
                // Keep the already-loaded manager across games (#1679)
                if (PixiAssetManagerModule?.PixiAssetManager && !this.pixiAssetManager) {
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
            setTimeout(() => this.loadAssetsInBackground(), 500);

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
            this.gameState.screenThemeManager = new ScreenThemeManager(this.environmentManager);
            this.gameState.mapCoordinateSystem = new MapCoordinateSystem();
            this.gameState.gameEndingSystem = new GameEndingSystem(this.gameState);
            this.gameState.gameEndingSystem.gameState.mainGame = this;
            this.gameState.narrativeClaritySystem = new NarrativeClaritySystem(this.gameState);

            // DEFER Phase 1 Visual Systems - Load in background
            setTimeout(() => {
                try {
                    // this.gameState.visualSystem = new VisualSystem(this.gameState);
                    // Screen transitions are CSS-only (ScreenManager, #2295)
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
            this.characterArcSystem = this.gameState.characterArcSystem;
            this.npcMemorySystem = this.gameState.npcMemorySystem;
            this.gameEndingSystem = this.gameState.gameEndingSystem;
            // NOTE: mapProgressionSystem already linked above, don't duplicate
            this.ideSystem = this.gameState.ideSystem;
            this.locationBackgroundSystem = this.gameState.locationBackgroundSystem;
            this.weeklyNewsSystem = this.gameState.weeklyNewsSystem;
            this.screenThemeManager = this.gameState.screenThemeManager;
            this.mapCoordinateSystem = this.gameState.mapCoordinateSystem;

            // Link Phase 1 Visual Systems
            this.visualSystem = this.gameState.visualSystem;
            this.animationManager = this.gameState.animationManager;
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

            // Don't claim "Ready! 100%" before any image has loaded (#1675):
            // wait for the asset load (capped, so a slow network never blocks
            // the game) while the bar tracks real progress
            this.waitForAssets().then(() => {
            this.showLoadingProgress('Ready!', 100);
            logger.debug('[startNewGame]: core systems initialized, showing intro');

            // Hide loading and show intro flow
            setTimeout(() => {
                this.hideLoadingProgress();
                if (this.introSystem) {
                    // The menu closes when the intro takes over (#1360)
                    this.screenManager?.hideCurrentScreen?.();
                    this.introSystem.showIntro();
                } else {
                    // Fallback if intro system not available
                    this.gameState.isGameStarted = true;
                    this.screenManager.showScreen('screen-game');
                }
            }, 100);
            });
        } catch (error) {
            logger.error(' startNewGame ERROR:', error);
            logger.error('Stack:', error.stack);
            this.handleStartFailure('Failed to start the game. Please try again or refresh the page.');
        }
    }

    /**
     * A start that throws must not leave the player on a frozen loading
     * screen: hide it, go back to the menu and say what happened (#1678)
     */
    handleStartFailure(message) {
        try {
            this.hideLoadingProgress();
        } catch (e) {
            logger.warn('Could not hide loading screen:', e);
        }
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.add('hidden');
        }
        document.getElementById('game-container')?.classList.remove('hidden');
        try {
            this.screenManager?.showScreen?.('screen-menu');
        } catch (e) {
            logger.warn('Could not return to menu:', e);
        }
        this.showError(message);
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
                this.updateNewsBadge();
                logger.debug('[finishGameStart]: news generated');
            }

            // Update UI
            if (!this.uiUpdater) {
                logger.warn('UIUpdater not initialized');
            } else {
                this.uiUpdater.updateAllUI();
                logger.debug('[finishGameStart]: UI updated');
            }

            // Start task timer if task has a time limit
            this.startTaskTimer();

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

            // Periodic autosave into the slot being played (#872)
            this.saveManager.startAutoSave(this.gameState, 60000, this.currentSaveSlot ?? 0);

            logger.debug('[finishGameStart]: COMPLETE');
        } catch (error) {
            logger.error('finishGameStart ERROR:', error);
            this.showError('Failed to start game. Please refresh.');
        }
    }

    /**
     * Create any session subsystem that doesn't exist yet. Mirrors the set
     * startNewGame() builds so a continued save has the same features.
     */
    ensureSessionSystems() {
        const gs = this.gameState;
        const factories = {
            economySystem: () => new EconomySystem(gs),
            projectSystem: () => new ProjectSystem(gs),
            aiSystem: () => new AISystem(gs),
            hardwareManager: () => new HardwareManager(gs),
            contractSystem: () => new ContractSystem(gs),
            jobSystem: () => new JobSystem(gs),
            workInteractionSystem: () => new WorkInteractionSystem(gs),
            realisticDialogueSystem: () => new RealisticDialogueSystem(),
            relationshipEmotionSystem: () => new RelationshipEmotionSystem(gs),
            worldEvolutionSystem: () => new WorldEvolutionSystem(gs),
            investmentEcommerceSystem: () => new InvestmentEcommerceSystem(gs),
            storylineManager: () => new StorylineManager(gs),
            storyBeatsSystem: () => new StoryBeatsSystem(gs),
            characterArcSystem: () => new CharacterArcSystem(gs),
            npcMemorySystem: () => new NPCMemorySystem(gs),
            mapProgressionSystem: () => new MapProgressionSystem(gs),
            ideSystem: () => new IDESystem(gs),
            locationBackgroundSystem: () => new LocationBackgroundSystem(gs),
            weeklyNewsSystem: () => new WeeklyNewsSystem(gs),
            screenThemeManager: () => new ScreenThemeManager(this.environmentManager),
            mapCoordinateSystem: () => new MapCoordinateSystem(),
            gameEndingSystem: () => new GameEndingSystem(gs),
            dayNightCycle: () => new DayNightCycle(gs),
            // Created before the reload so the saved quality setting is applied (#1256)
            performanceManager: () => {
                const pm = new PerformanceManager();
                try { pm.detectHardware?.(); } catch (_) { /* keep defaults */ }
                return pm;
            },
            notificationSystem: () => {
                const ns = new NotificationSystem(gs);
                ns.scheduleDefaultNotifications?.();
                return ns;
            }
        };
        for (const [key, create] of Object.entries(factories)) {
            if (gs[key]) continue;
            try {
                gs[key] = create();
            } catch (error) {
                logger.warn(`[ensureSessionSystems] Failed to create ${key}:`, error);
            }
        }
        // StorylineManager's constructor clears mainGame; restore the link
        gs.mainGame = this;
    }

    /**
     * Mirror gameState subsystems onto MainGame for convenient access
     */
    linkSessionSystems() {
        const keys = [
            'characterStats', 'timeManager', 'economySystem', 'worldMap', 'npcManager', 'newsManager',
            'stockMarket', 'crimeSystem', 'romanceSystem', 'legalSystem', 'educationSystem',
            'worldEventManager', 'projectSystem', 'aiSystem', 'hardwareManager', 'contractSystem',
            'mapProgressionSystem', 'jobSystem', 'workInteractionSystem', 'realisticDialogueSystem',
            'relationshipEmotionSystem', 'worldEvolutionSystem', 'investmentEcommerceSystem',
            'storylineManager', 'storyBeatsSystem', 'characterArcSystem', 'npcMemorySystem',
            'ideSystem', 'locationBackgroundSystem', 'weeklyNewsSystem', 'screenThemeManager',
            'mapCoordinateSystem', 'gameEndingSystem', 'dayNightCycle', 'notificationSystem',
            'narrativeClaritySystem', 'companyManagement', 'demandingBoss', 'performanceManager'
        ];
        for (const key of keys) {
            if (this.gameState[key]) this[key] = this.gameState[key];
        }
    }

    /**
     * Run the story systems' initialize() hooks (safe to call after a load)
     */
    initializeStorySystems() {
        for (const key of ['storylineManager', 'storyBeatsSystem', 'characterArcSystem', 'npcMemorySystem']) {
            const system = this[key];
            if (system && typeof system.initialize === 'function') {
                try {
                    system.initialize();
                } catch (error) {
                    logger.warn(`[initializeStorySystems] ${key}.initialize failed:`, error);
                }
            }
        }
        if (this.worldMap && this.mapCoordinateSystem?.initializeWithLocations) {
            try {
                this.mapCoordinateSystem.initializeWithLocations(this.worldMap.getAccessibleLocations());
            } catch (error) {
                logger.warn('[initializeStorySystems] map coordinates failed:', error);
            }
        }
    }

    /**
     * Continue saved game
     */
    continueGame(slotIndex = null) {
        logger.debug('Continuing saved game...');
        // Honour the slot callers pass in (#95, #1662)
        if (slotIndex !== null && slotIndex !== undefined) {
            this.currentSaveSlot = slotIndex;
        }

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

        // Story panel depends on this — must reconstruct after load (#2627)
        if (!this.gameState.narrativeClaritySystem) {
            this.gameState.narrativeClaritySystem = new NarrativeClaritySystem(this.gameState);
        } else if (!(this.gameState.narrativeClaritySystem instanceof NarrativeClaritySystem)) {
            const ncs = new NarrativeClaritySystem(this.gameState);
            if (typeof ncs.fromJSON === 'function' && this.gameState.narrativeClaritySystem) {
                try { ncs.fromJSON(this.gameState.narrativeClaritySystem); } catch (_) {}
            }
            this.gameState.narrativeClaritySystem = ncs;
        }

        if (!this.gameState.educationSystem) this.gameState.educationSystem = new EducationSystem(this.gameState);
        else {
            const edu = new EducationSystem(this.gameState);
            edu.fromJSON(this.gameState.educationSystem);
            this.gameState.educationSystem = edu;
        }

        // Construct every subsystem a new game gets, so features don't silently
        // die after Continue (#94, #1258, #1985, #2049, #2050, #2037, #2372, ...)
        this.ensureSessionSystems();
        try {
            this.loadDeferredSystems();
        } catch (error) {
            logger.warn('[continueGame] loadDeferredSystems failed:', error);
        }

        // Reload save data now that subsystems are initialized
        logger.debug("Reloading save data for subsystems...");
        const loaded = this.saveManager.loadGame(this.gameState, this.currentSaveSlot);
        if (!loaded && this.saveManager.hasSave(this.currentSaveSlot ?? 0)) {
            // Corrupt/unsupported save: don't start the session (autosave would
            // overwrite the original bytes with a fresh game)
            this.saveManager.stopAutoSave();
            this.showError('This save could not be loaded. It has been left untouched.');
            this.screenManager.showScreen('screen-menu');
            return;
        }

        // Initialize BankSystem AFTER the reload: it fills in default bank state
        // when the save has none, which the reload would otherwise null out (#937)
        this.bankSystem = new BankSystem(this.gameState);

        // Link managers
        this.linkSessionSystems();
        this.initializeStorySystems();

        // Generate a new task if none exists
        if (!this.gameState.currentTask) {
            this.taskSystem.generateNewTask();
        }

        // Start task timer if task has a time limit
        this.startTaskTimer();

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

        // Periodic autosave into the slot being played (#872)
        this.saveManager.startAutoSave(this.gameState, 60000, this.currentSaveSlot ?? 0);

        // FPS monitoring/auto-adjust for continued sessions too (#1256)
        try { this.performanceManager?.startMonitoring?.(); } catch (_) { /* optional */ }

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
        // A submitted task can't be reopened for a second payout (#1226)
        if (!this.gameState.currentTask || this.gameState.currentTask.submitted) {
            this.taskSystem?.generateNewTask();
            this.uiUpdater?.updateTaskDisplay?.();
            this.startTaskTimer?.();
        }
        if (!this.gameState.currentTask) {
            this.showError('No task available.');
            return;
        }

        this.screenManager.showScreen('screen-chart-studio');
        this.syncChartStudioUI();

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
        MainGame.syncPaletteButtons(palette);

        // Update game state
        this.gameState.chartConfig.palette = palette;

        // Update preview
        this.updateChartPreview();
    }

    /**
     * Copy the Chart Studio form controls into gameState.chartConfig.
     * Called before previewing AND before scoring, so what the player sees is
     * exactly what gets scored (#1681).
     */
    readChartStudioForm() {
        const cfg = this.gameState.chartConfig || (this.gameState.chartConfig = GameState.defaultChartConfig());
        const legend = document.getElementById('show-legend');
        const grid = document.getElementById('show-grid');
        const labels = document.getElementById('show-data-labels');
        const title = document.getElementById('chart-title');
        this.gameState.chartConfig = {
            ...cfg,
            showLegend: legend ? legend.checked : (cfg.showLegend ?? true),
            showGrid: grid ? grid.checked : (cfg.showGrid ?? true),
            showDataLabels: labels ? labels.checked : (cfg.showDataLabels ?? false),
            title: title ? title.value : (cfg.title ?? '')
        };
        return this.gameState.chartConfig;
    }

    /**
     * Make the Chart Studio controls reflect gameState.chartConfig (after a
     * load or a per-task reset) (#1495, #1682).
     */
    syncChartStudioUI() {
        const cfg = this.gameState.chartConfig || GameState.defaultChartConfig();
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === cfg.type);
        });
        MainGame.syncPaletteButtons(cfg.palette);
        const set = (id, prop, value) => { const el = document.getElementById(id); if (el) el[prop] = value; };
        set('show-legend', 'checked', !!cfg.showLegend);
        set('show-grid', 'checked', !!cfg.showGrid);
        set('show-data-labels', 'checked', !!cfg.showDataLabels);
        set('chart-title', 'value', cfg.title || '');
    }

    /**
     * Update the chart preview
     */
    updateChartPreview() {
        this.readChartStudioForm();

        this.chartManager.updatePreviewChart(
            this.gameState.currentTask.data,
            this.gameState.chartConfig
        );
        this.updateMappingPanel();
    }

    /**
     * Show which columns the preview plots in the MAPPING panel. It used to
     * be hardcoded to Quarter / Revenue for every task (#1494)
     */
    updateMappingPanel() {
        const data = this.gameState?.currentTask?.data;
        if (!data || !this.chartManager?.describeMapping) return;
        const mapping = this.chartManager.describeMapping(data, this.gameState.chartConfig || {});
        const xEl = document.getElementById('x-axis-value');
        const yEl = document.getElementById('y-axis-value');
        if (xEl) xEl.textContent = mapping.x;
        if (yEl) yEl.textContent = mapping.y;
    }

    /**
     * Submit the chart for boss review
     */
    submitChart() {


        if (!this.economySystem) {
            this.showError('Economy system not initialized. Please refresh the page.');
            return;
        }

        const task = this.gameState.currentTask;
        if (!task) {
            this.showError('No task available. Please start a new game.');
            return;
        }

        // A task can only be paid out once (#1226)
        if (task.submitted) {
            this.showToast('This task was already submitted. Grab the next task.', 'warning');
            return;
        }

        // Building and submitting a chart is work: it costs time and energy
        // like every other activity (#1229)
        const work = MainGame.taskWorkCost(task);
        if (this.timeManager?.canPerformAction) {
            const check = this.timeManager.canPerformAction(work.timeSlots, work.energy);
            if (!check.can) {
                this.showError(`${check.reason}. Rest before submitting this chart.`);
                return;
            }
        }

        // Stop the task timer when submitting
        this.stopTaskTimer();

        // Score exactly what the form shows (#1681)
        this.readChartStudioForm();

        // Calculate score
        const score = this.economySystem.evaluateChart(
            task,
            this.gameState.chartConfig
        );
        task.submitted = true;

        // Store score for display
        this.gameState.lastScore = score;

        // Apply rewards now, in the same tick as the rating stats that
        // evaluateChart() just recorded, so the outcome is atomic (#1311).
        this.applyTaskRewards(score);

        if (this.timeManager?.useEnergy) {
            this.timeManager.useEnergy(work.energy);
            this.handleTimeAdvance?.(work.timeSlots);
        }

        // Show review screen
        this.screenManager.showScreen('screen-review');

        // Copy chart to review screen
        this.chartManager.copyToReviewChart();

        // Animate the review (presentation only)
        this.animateReview(score);
    }

    /**
     * Apply money/reputation/progress for a scored task, check promotion and
     * story beats, and autosave. Runs synchronously from submitChart().
     */
    applyTaskRewards(score) {
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
        // The boss notices: strong work builds promotion readiness and goodwill (#1543, #1542)
        this.gameState.workInteractionSystem?.recordTaskResult?.(score.stars);
        // The demanding boss reviews it too; crossing a satisfaction line
        // changes reputation (#1014, #1779)
        const bossTask = this.gameState.currentTask;
        const bossResult = this.gameState.demandingBoss?.recordTaskResult?.(bossTask, score, {
            timeLimit: this.economySystem?.getEffectiveTimeLimit?.(bossTask) || null
        });
        if (bossResult?.consequence?.message) {
            this.showToast(bossResult.consequence.message, bossResult.consequence.type === 'praise' ? 'success' : 'warning');
        }

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
                // Career wins make competitive colleagues jealous (#915)
                this.gameState.jealousySystem?.checkJealousy?.({ type: 'career', level: 15 });
                this.showToast(`PROMOTED to ${newRank.title}!`, 'success');
                this.audioManager.play('success');
                this.uiUpdater.updateAllUI();
                // Announce the promotion milestone to assistive technology
                this.uiUpdater.announceRankPromotion(newRank);

                // Check for story beats (promotion)
                if (this.storyBeatsSystem) {
                    // One rank rule, shared with StoryBeatsSystem.checkBeatTrigger (#1498)
                    for (const id of ['first_promotion', 'mid_career', 'senior_position', 'final_rank']) {
                        const beat = this.storyBeatsSystem.getBeat(id);
                        if (beat && this.storyBeatsSystem.checkBeatTrigger(beat)) this.handleStoryBeat(beat);
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

        // Auto-save into the slot being played, not always slot 0 (#871)
        this.saveManager.saveGame(this.gameState, this.currentSaveSlot ?? 0);
    }

    /**
     * Human-readable summary of what purchased software added to a score.
     */
    formatSoftwareBonus(mult) {
        if (!mult) return '';
        const parts = [];
        const pct = v => Math.round((v - 1) * 100);
        if (mult.chartAppropriateness > 1) parts.push(`+${pct(mult.chartAppropriateness)}% appropriateness`);
        if (mult.visualClarity > 1) parts.push(`+${pct(mult.visualClarity)}% clarity`);
        if (mult.dataAccuracy > 1) parts.push(`+${pct(mult.dataAccuracy)}% accuracy`);
        return parts.length ? `Software bonus: ${parts.join(', ')}` : 'Software bonus: none (buy software in the shop)';
    }

    /**
     * Animate the boss review (visual only — rewards are already applied)
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
        const stars = Math.max(0, Math.min(5, Math.round(score.stars || 0)));

        // Reset presentation from any previous review
        const starsContainer = document.getElementById('stars-container');
        if (starsContainer) {
            starsContainer.textContent = '☆☆☆☆☆';
            starsContainer.setAttribute('aria-label', `${stars} out of 5 stars`);
        }
        const scoreFills = document.querySelectorAll('#review-score .text-progress-filled, #review-score .score-fill');
        scoreFills.forEach(fill => { fill.style.width = '0%'; });
        const moneyEl = document.getElementById('reward-money');
        const repEl = document.getElementById('reward-rep');
        if (moneyEl) moneyEl.textContent = '+$0';
        if (repEl) repEl.textContent = '+0 Rep';

        // Animate feedback
        setTimeout(() => {
            const emojiEl = document.getElementById('reaction-emoji');
            if (emojiEl) emojiEl.textContent = '';
            const feedbackText = document.getElementById('boss-feedback')?.querySelector('.feedback-text');
            if (feedbackText) feedbackText.textContent = reaction.text;
        }, 500);

        // Animate stars: #stars-container is a text node, fill one star at a time (#1684)
        if (starsContainer) {
            for (let i = 1; i <= stars; i++) {
                setTimeout(() => {
                    starsContainer.textContent = '★'.repeat(i) + '☆'.repeat(5 - i);
                }, 800 + ((i - 1) * 200));
            }
        }

        // Animate score breakdown bars (#2209, #1683: the bars are .text-progress-filled)
        setTimeout(() => {
            const values = [score.chartAppropriateness, score.visualClarity, score.dataAccuracy];
            scoreFills.forEach((fill, i) => {
                const v = Math.max(0, Math.min(100, Number(values[i]) || 0));
                fill.style.width = `${v}%`;
            });
        }, 1500);

        // Software contribution (#1315)
        const bonusEl = document.getElementById('review-software-bonus');
        if (bonusEl) bonusEl.textContent = this.formatSoftwareBonus(score.softwareMultipliers);

        // Reveal rewards
        setTimeout(() => {
            if (moneyEl) moneyEl.textContent = `+$${(score.moneyEarned || 0).toLocaleString()}`;
            if (repEl) repEl.textContent = `+${score.repEarned || 0} Rep`;
        }, 2000);
    }

    /**
     * Move to the next task
     */
    nextTask() {
        // Generate new task
        this.taskSystem.generateNewTask();

        // Each task starts from a clean Chart Studio (#1682)
        this.gameState.chartConfig = GameState.defaultChartConfig();
        this.syncChartStudioUI();

        // Update UI
        this.uiUpdater.updateTaskDisplay();
        this.uiUpdater.updateAllUI();

        // Start task timer if task has a time limit
        this.startTaskTimer();

        // Show game screen
        this.screenManager.showScreen('screen-game');
    }

    /**
     * Start the task timer countdown
     */
    startTaskTimer() {
        // Stop any existing timer
        this.stopTaskTimer();

        const task = this.gameState.currentTask;
        if (!task || !task.timeLimit) {
            return; // No timer needed if task has no time limit
        }

        // Get the timer element
        const timerElement = document.getElementById('task-timer');
        if (!timerElement) {
            return; // No timer element in DOM
        }

        // Unhide the timer
        timerElement.classList.remove('hidden');

        // Update timer immediately
        this.updateTaskTimer();

        // Start interval to update timer every second
        this.taskTimerIntervalId = setInterval(() => {
            this.updateTaskTimer();
        }, 1000);
    }

    /**
     * Update the task timer display
     */
    updateTaskTimer() {
        const task = this.gameState.currentTask;
        const timerElement = document.getElementById('task-timer');

        if (!task || !task.timeLimit || !timerElement) {
            return;
        }

        // Calculate remaining time (perks/software extend the limit, #1310)
        const limit = this.economySystem?.getEffectiveTimeLimit?.(task) || task.timeLimit;
        const elapsed = (Date.now() - task.startTime) / 1000;
        const remaining = Math.max(0, limit - elapsed);

        // Format as MM:SS
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining % 60);
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Stop timer if time is up
        if (remaining <= 0) {
            this.stopTaskTimer();
            timerElement.classList.add('time-expired');
        }
    }

    /**
     * Stop the task timer
     */
    stopTaskTimer() {
        if (this.taskTimerIntervalId) {
            clearInterval(this.taskTimerIntervalId);
            this.taskTimerIntervalId = null;
        }

        const timerElement = document.getElementById('task-timer');
        if (timerElement) {
            timerElement.classList.add('hidden');
        }
    }

    /**
     * Show tutorial modal
     */
    showTutorial() {
        const modalContent = `
            <div class="howto-modal">
                <h2>How to Play</h2>
                <div class="howto-steps">
                    <div class="howto-step">
                        <span class="howto-step-number">1</span>
                        <div class="howto-step-content">
                            <h4> Get Your Task</h4>
                            <p>Your boss will give you data and specific requirements for a visualization.</p>
                        </div>
                    </div>
                    <div class="howto-step">
                        <span class="howto-step-number">2</span>
                        <div class="howto-step-content">
                            <h4>Analyze the Data</h4>
                            <p>Look at the data table and understand what story it tells.</p>
                        </div>
                    </div>
                    <div class="howto-step">
                        <span class="howto-step-number">3</span>
                        <div class="howto-step-content">
                            <h4>Create Your Chart</h4>
                            <p>Choose the right chart type and customize it to clearly present the data.</p>
                        </div>
                    </div>
                    <div class="howto-step">
                        <span class="howto-step-number">4</span>
                        <div class="howto-step-content">
                            <h4>Get Rated</h4>
                            <p>Your boss will rate your work. Better ratings mean more money and reputation!</p>
                        </div>
                    </div>
                    <div class="howto-step">
                        <span class="howto-step-number">5</span>
                        <div class="howto-step-content">
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
     * React to PerformanceManager events: keep the settings control in sync
     * when the level changes (#1446) and surface low-FPS warnings (#1445)
     */
    bindPerformanceEvents() {
        if (this._performanceEventsBound || typeof window === 'undefined') return;
        this._performanceEventsBound = true;
        window.addEventListener('qualityChanged', () => this.updateQualitySetting());
        window.addEventListener('performanceWarning', (e) => {
            if (e.detail?.message) this.showToast(e.detail.message, 'warning');
        });
    }

    /**
     * Label for the graphics setting, e.g. "Auto (currently high)"
     */
    describeQualitySetting(pm = this.gameState?.performanceManager) {
        if (!pm) return 'Unavailable';
        const level = pm.getEffectiveLevel?.() || pm.level;
        if (pm.quality === 'auto') return level ? `Auto (currently ${level})` : 'Auto';
        return pm.quality.charAt(0).toUpperCase() + pm.quality.slice(1);
    }

    updateQualitySetting() {
        const pm = this.gameState?.performanceManager;
        const select = document.getElementById('settings-quality');
        if (select && pm) select.value = pm.quality;
        const label = document.getElementById('settings-quality-current');
        if (label) label.textContent = this.describeQualitySetting(pm);
    }

    /**
     * Show settings modal
     */
    showSettings() {
        const modalContent = `
            <div class="settings-modal">
                <h2 id="modal-title">Settings</h2>
                <div class="settings-options">
                    <div class="settings-row">
                        <label class="settings-label" for="settings-sound">Sound Effects</label>
                        <label class="toggle">
                            <input type="checkbox" id="settings-sound" ${this.audioManager.soundEnabled ? 'checked' : ''}>
                            <span class="toggle-slider" aria-hidden="true"></span>
                        </label>
                    </div>
                    <div class="settings-row">
                        <label class="settings-label" for="settings-music">Music</label>
                        <label class="toggle">
                            <input type="checkbox" id="settings-music" ${this.audioManager.musicEnabled ? 'checked' : ''}>
                            <span class="toggle-slider" aria-hidden="true"></span>
                        </label>
                    </div>
                    <div class="settings-row">
                        <label class="settings-label" for="settings-music-volume">Music Volume</label>
                        <input type="range" id="settings-music-volume" min="0" max="100" value="${Math.round(this.audioManager.musicVolume * 100)}">
                    </div>
                    <div class="settings-row">
                        <label class="settings-label" for="settings-sound-volume">Sound Effects Volume</label>
                        <input type="range" id="settings-sound-volume" min="0" max="100" value="${Math.round(this.audioManager.soundVolume * 100)}">
                    </div>
                    <div class="settings-row">
                        <label class="settings-label" for="settings-quality">Graphics Quality</label>
                        <select id="settings-quality" aria-describedby="settings-quality-current">
                            ${['auto', 'low', 'medium', 'high', 'ultra'].map(q =>
                                `<option value="${q}" ${this.gameState?.performanceManager?.quality === q ? 'selected' : ''}>${q.charAt(0).toUpperCase() + q.slice(1)}</option>`).join('')}
                        </select>
                        <span id="settings-quality-current" class="settings-hint">${MainGame.prototype.describeQualitySetting.call(this)}</span>
                    </div>
                </div>
                <div class="settings-danger">
                    <button class="btn btn-danger" onclick="game.resetProgress()">Reset Progress</button>
                </div>
                <button class="btn btn-secondary" onclick="game.closeModal()">Close</button>
            </div>
        `;

        this.showModal(modalContent);

        // Wire the controls to AudioManager (#869). The checkboxes set the
        // state they show instead of blindly toggling, so they can't drift
        // out of sync; the sound checkbox had no listener at all before.
        const am = this.audioManager;
        document.getElementById('settings-sound')?.addEventListener('change', (e) => {
            if (e.target.checked !== !!am.soundEnabled) this.toggleSound();
        });
        document.getElementById('settings-music')?.addEventListener('change', (e) => {
            if (e.target.checked !== !!am.musicEnabled) am.toggleMusic();
            this.updateRadioUI?.();
        });
        document.getElementById('settings-music-volume')?.addEventListener('input', (e) => {
            am.setMusicVolume(Number(e.target.value) / 100);
        });
        document.getElementById('settings-sound-volume')?.addEventListener('input', (e) => {
            am.setSoundVolume(Number(e.target.value) / 100);
        });
        // Let the player pick graphics quality themselves (#1449)
        document.getElementById('settings-quality')?.addEventListener('change', (e) => {
            this.gameState?.performanceManager?.setQuality(e.target.value);
            MainGame.prototype.updateQualitySetting.call(this);
        });
    }

    /**
     * Toggle sound on/off
     */
    toggleSound() {
        this.audioManager.toggleSound();
        this.updateSoundButton();
    }

    /**
     * Reflect the sound-effects state on the toolbar button (#1092)
     */
    updateSoundButton() {
        const btn = document.getElementById('btn-sound');
        if (!btn) return;
        const on = !!this.audioManager?.soundEnabled;
        btn.textContent = on ? 'SFX: ON' : 'SFX: OFF';
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    /**
     * Initialize music radio interface
     */
    initMusicRadio() {
        const radioBtn = document.getElementById('btn-music-radio');
        const radioMenu = document.getElementById('music-radio-menu');
        const radioStations = radioMenu?.querySelectorAll('.radio-station');

        if (!radioBtn || !radioMenu) return;
        // Bind once; a second call would stack another set of listeners and
        // make the button toggle the menu open and shut in one click
        if (radioBtn.dataset.radioBound) {
            this.updateRadioUI();
            return;
        }
        radioBtn.dataset.radioBound = 'true';

        // Disclosure state for screen readers, focus in/out, Escape (#879)
        const setOpen = (open, { returnFocus = false } = {}) => {
            radioMenu.classList.toggle('hidden', !open);
            radioBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                radioMenu.querySelector('.radio-station')?.focus?.();
            } else if (returnFocus) {
                radioBtn.focus?.();
            }
        };

        // Toggle menu visibility
        radioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setOpen(radioMenu.classList.contains('hidden'));
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!radioBtn.contains(e.target) && !radioMenu.contains(e.target)) {
                setOpen(false);
            }
        });

        // Escape closes and returns focus; arrows move between stations
        radioMenu.addEventListener('keydown', (e) => {
            const items = [...radioMenu.querySelectorAll('button')];
            const index = items.indexOf(document.activeElement);
            if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false, { returnFocus: true });
            } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && index !== -1) {
                e.preventDefault();
                const next = (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
                items[next].focus();
            }
        });

        // Handle station selection
        radioStations?.forEach(station => {
            station.addEventListener('click', () => {
                const stationId = station.dataset.station;
                this.switchMusicStation(stationId);
                this.updateRadioUI();
                setOpen(false, { returnFocus: true });
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

        // The toolbar button shows what is playing instead of a fixed
        // "MUSIC: OFF" label (#866)
        const radioBtn = document.getElementById('btn-music-radio');
        if (radioBtn) {
            const on = this.audioManager.musicEnabled && currentStation !== 'off';
            radioBtn.textContent = on ? `MUSIC: ${this.audioManager.getCurrentStationName()}` : 'MUSIC: OFF';
        }

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
            this.saveManager.stopAutoSave();
            this.saveManager.clearSave(this.currentSaveSlot);
            // A reset is a fresh start: stop the radio too (#1292)
            this.audioManager?.stopCurrentMusic?.();
            this.updateRadioUI?.();
            this.gameState.reset();
            this.closeModal();
            this.screenManager.showScreen('screen-menu');
            const continueBtn = document.getElementById('btn-continue');
            if (continueBtn) continueBtn.disabled = true;
            this.saveSlotManager?.renderSlots?.();
            this.showToast('Progress reset.', 'warning');
        }
    }

    /**
     * Let the player attend or skip a party that's happening today (#2414)
     */
    offerPartyChoice(result) {
        // Don't stomp on a dialog the player already has open
        const container = document.getElementById('modal-container');
        if (!container || !container.classList.contains('hidden')) {
            this.showToast?.(result.message, 'info');
            return;
        }
        const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const cost = result.effects?.energyCost ?? 20;
        const bonus = result.effects?.relationshipBonus ?? 5;
        this.showModal(`
            <h2 id="modal-title">${esc(result.name)}</h2>
            <p>${esc(result.message)}</p>
            <p class="party-terms">Attending costs ${esc(cost)} energy and gives +${esc(bonus)} relationship with everyone there.</p>
            <div class="modal-actions">
                ${(result.actions || []).map(a => `<button class="btn-primary" data-party-action="${esc(a.id)}">${esc(a.text)}</button>`).join('')}
            </div>
        `);
        document.querySelectorAll('#modal-content [data-party-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const outcome = this.eventSystem?.resolvePartyAction?.(result.eventId, btn.dataset.partyAction);
                this.closeModal();
                if (outcome?.message) this.showToast(outcome.message, outcome.success === false ? 'warning' : 'success');
                this.uiUpdater?.updateAllUI?.();
            });
        });
    }

    /**
     * Show modal with content
     */
    showModal(content) {
        const container = document.getElementById('modal-container');
        const modalContent = document.getElementById('modal-content');
        if (!container || !modalContent) return;

        // Remember what had focus so closing hands it back (#1254)
        if (container.classList.contains('hidden')) {
            this.modalReturnFocus = document.activeElement;
        }

        modalContent.innerHTML = content;
        container.classList.remove('hidden');
        modalContent.setAttribute('role', 'dialog');
        modalContent.setAttribute('aria-modal', 'true');
        modalContent.setAttribute('tabindex', '-1');
        if (modalContent.querySelector('#modal-title')) {
            modalContent.setAttribute('aria-labelledby', 'modal-title');
        } else {
            modalContent.removeAttribute('aria-labelledby');
        }

        // Close on backdrop click
        const backdrop = container.querySelector('.modal-backdrop');
        if (backdrop) backdrop.onclick = () => this.closeModal();

        // Escape closes, Tab stays inside the dialog (#1254, #1879)
        if (!this.modalKeyHandler) {
            this.modalKeyHandler = (e) => this.handleModalKeydown(e);
            document.addEventListener('keydown', this.modalKeyHandler);
        }

        const focusables = this.getModalFocusables();
        (focusables[0] || modalContent).focus?.();
    }

    /**
     * Focusable elements inside the shared modal
     */
    getModalFocusables() {
        const modalContent = document.getElementById('modal-content');
        if (!modalContent) return [];
        return Array.from(modalContent.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled);
    }

    handleModalKeydown(e) {
        const container = document.getElementById('modal-container');
        if (!container || container.classList.contains('hidden')) return;
        if (e.key === 'Escape') {
            e.preventDefault?.();
            this.closeModal();
            return;
        }
        if (e.key !== 'Tab') return;
        const focusables = this.getModalFocusables();
        if (focusables.length === 0) {
            e.preventDefault?.();
            return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        const inside = document.getElementById('modal-content')?.contains(active);
        if (e.shiftKey && (active === first || !inside)) {
            e.preventDefault?.();
            last.focus();
        } else if (!e.shiftKey && (active === last || !inside)) {
            e.preventDefault?.();
            first.focus();
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const container = document.getElementById('modal-container');
        if (!container) return;
        container.classList.add('hidden');
        if (this.modalKeyHandler) {
            document.removeEventListener('keydown', this.modalKeyHandler);
            this.modalKeyHandler = null;
        }
        const returnTo = this.modalReturnFocus;
        this.modalReturnFocus = null;
        if (returnTo && document.contains(returnTo)) returnTo.focus?.();
    }

    /**
     * Handle hiring staff
     */
    /**
     * Delegated click handling for the world map, vehicle picker, training
     * grid and shop categories. Split out of setupEventListeners so it can be
     * tested on its own (#1100)
     */
    setupWorldInputs() {
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
                    // Show requirement info
                    const locId = locationEl.dataset.location;
                    const loc = this.worldMap?.getLocation(locId);
                    if (loc && loc.unlockRequirement) {
                        this.showError(`This location is locked. ${this._formatUnlockRequirement(loc.unlockRequirement)}`);
                    } else {
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
                    // Cars are sold only at Auto World, so the dealership's
                    // money/bus gate actually matters (#1703)
                    if (MapHelpers.vehicleRequiresDealership(vehicle) && this.worldMap.currentLocation !== 'car_dealership') {
                        this.showError('Cars are sold at Auto World. Travel to the car dealership to buy one.');
                        return;
                    }
                    if (confirm(`Buy ${vehicle.name} for $${vehicle.price}?`)) {
                        const result = this.worldMap.buyVehicle(vehicleId);
                        if (result.success) {
                            this.showToast(result.switched === false
                                ? `Bought ${vehicle.name}! (still driving your faster vehicle — click it to switch)`
                                : `Bought ${vehicle.name}!`, 'success');
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
                // closest() so a click on text/icon inside the button counts too
                const btn = e.target.closest?.('button');
                if (!btn || btn.disabled) return;
                const card = btn.closest('.training-card');
                if (card) {
                    this.handleTraining(card.dataset.activity);
                }
            });
        }

        // Shop category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.uiUpdater?.updateShopScreen?.(btn.dataset.category);
            });
        });
    }

    handleHireStaff(role) {
        const spec = STAFF_ROLES[role];
        if (!spec) {
            this.showError('Invalid staff role');
            return false;
        }

        // Legal Check: Need LLC to hire staff
        // Fail closed: no legal system loaded means no LLC on record (#1541)
        const legal = this.legalSystem || this.gameState.legalSystem;
        if (!legal?.hasLicense?.('llc_registration')) {
            this.showToast("You need an LLC Registration to hire employees!", 'error');
            return false;
        }

        // Senior hires also need a Business License from City Hall (#1536)
        if (spec.requiresLicense && !legal.hasLicense(spec.requiresLicense)) {
            const name = legal.getLicenseById?.(spec.requiresLicense)?.name || spec.requiresLicense;
            this.showToast(`You need a ${name} to hire a ${spec.name}.`, 'error');
            return false;
        }

        const officeIndex = this.gameState.officeIndex || 0;
        if (officeIndex < (spec.minOffice || 0)) {
            this.showError(`${spec.name}s require a bigger office.`);
            return false;
        }

        if (!Array.isArray(this.gameState.staff)) this.gameState.staff = [];
        const capacity = OFFICE_STAFF_CAPACITY[officeIndex] ?? 1;
        if (this.gameState.staff.length >= capacity) {
            this.showError('Your office is full. Upgrade your office to hire more staff.');
            return false;
        }

        if (this.gameState.money < spec.hireCost) {
            this.showError(`Not enough money! Need $${spec.hireCost.toLocaleString()}`);
            return false;
        }

        this.gameState.money -= spec.hireCost;
        this.gameState.totalSpent = (this.gameState.totalSpent || 0) + spec.hireCost;
        this.gameState.staff.push({
            id: `staff_${Date.now()}_${this.gameState.staff.length}`,
            role,
            name: spec.name,
            salary: spec.salary,
            efficiency: spec.efficiency,
            hiredDay: this.gameState.timeManager?.totalDays || 0
        });
        this.uiUpdater?.updateAllUI?.();
        this.updateStaffScreen();
        this.showToast(`Hired a ${spec.name}! Salary: $${spec.salary}/day`, 'success');
        return true;
    }

    /**
     * Let a staff member go
     */
    handleFireStaff(staffId) {
        const staff = this.gameState.staff || [];
        const idx = staff.findIndex(s => s.id === staffId);
        if (idx === -1) return false;
        const [removed] = staff.splice(idx, 1);
        this.updateStaffScreen();
        this.showToast(`${removed.name} has left the team.`, 'info');
        return true;
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

        // Keep the stack readable when many events land at once (e.g. a new
        // week): at most MAX_TOASTS on screen, oldest leave first, and longer
        // messages stay up longer (#1246)
        const MAX_TOASTS = 4;
        const live = Array.from(container.querySelectorAll('.toast:not(.leaving)'));
        live.slice(0, Math.max(0, live.length - MAX_TOASTS)).forEach(old => this.dismissToast(old));

        const duration = Math.min(8000, 3000 + String(message).length * 40);
        toast._dismissTimer = setTimeout(() => this.dismissToast(toast), duration);
        return toast;
    }

    dismissToast(toast) {
        if (!toast || toast.classList.contains('leaving')) return;
        clearTimeout(toast._dismissTimer);
        toast.classList.add('leaving');
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }

    /**
     * Show error message
     */
    showError(message) {
        if (!message || message === undefined || message === 'undefined') {
            logger.warn('showError called with undefined message');
            return;
        }
        logger.error('Game Error:', message);
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
            this.audioManager.play('purchase');
            this.uiUpdater.updateOfficeEquipment(); // Refresh grid
            this.uiUpdater.updateTopBar(); // Update money
        } else {
            this.showToast(result.message, 'error');
            this.audioManager.play('error');
        }
    }

    /**
     * Switch back to a hardware part you already own (#1331)
     */
    handleEquipHardware(type, partId) {
        const result = this.gameState.hardwareManager?.equipPart(type, partId);
        if (!result) return;
        this.showToast(result.message, result.success ? 'success' : 'error');
        if (result.success) this.uiUpdater.updateOfficeEquipment();
    }

    /**
     * Handle office upgrade
     */
    handleUpgradeOffice() {
        const officePrices = ProjectHelpers.getOfficePrices(); // canonical OFFICES pricing (#1767)
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
        this.audioManager.play('purchase');
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

        const price = this.economySystem?.getItemPrice?.(item) ?? item.price;
        const success = this.gameState.purchaseItem(item, price);
        if (success) {
            this.showToast(`Purchased ${item.name}!`, 'success');
            this.audioManager.play('purchase');
            this.uiUpdater.updateShopScreen();
            this.uiUpdater.updateAllUI();
        } else {
            if (!this.gameState.canAfford(price)) {
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
        const officeIndex = this.gameState.officeIndex || 0;
        const officeCapacity = OFFICE_STAFF_CAPACITY[officeIndex] ?? 1;

        // Update capacity
        const capacityEl = document.getElementById('staff-capacity');
        if (capacityEl) capacityEl.textContent = `${staff.length} / ${officeCapacity}`;
        const capacityPct = officeCapacity > 0 ? Math.min(100, (staff.length / officeCapacity) * 100) : 0;
        const progressEl = document.getElementById('capacity-progress');
        if (progressEl) progressEl.style.width = `${capacityPct}%`;

        // Update expenses
        const staffCost = staff.reduce((sum, s) => sum + (s.salary || 0), 0);
        const marketingCost = this.gameState.dailyMarketingCost || 0;
        const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
        setText('daily-salaries', `$${staffCost}`);
        setText('daily-marketing', `$${marketingCost}`);
        setText('daily-total', `$${staffCost + marketingCost}`);

        // Current team
        const teamGrid = document.getElementById('current-staff-grid');
        if (teamGrid) {
            teamGrid.innerHTML = '';
            if (staff.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'empty-state';
                empty.innerHTML = '<p>No employees yet!</p><p class="empty-hint">Hire staff below (requires an LLC registration).</p>';
                teamGrid.appendChild(empty);
            } else {
                staff.forEach(member => {
                    const card = document.createElement('div');
                    card.className = 'staff-card';
                    const name = document.createElement('div');
                    name.className = 'staff-name';
                    name.textContent = member.name;
                    const salary = document.createElement('div');
                    salary.className = 'staff-salary';
                    salary.textContent = `$${member.salary}/day`;
                    const fire = document.createElement('button');
                    fire.className = 'btn-cartoon';
                    fire.dataset.fireStaff = member.id;
                    fire.textContent = 'Let go';
                    card.append(name, salary, fire);
                    teamGrid.appendChild(card);
                });
            }
        }

        // Hire cards: lock state and capacity
        document.querySelectorAll('#hire-staff-grid .hire-card').forEach(card => {
            const spec = STAFF_ROLES[card.dataset.type];
            const btn = card.querySelector('button');
            if (!spec || !btn) return;
            const locked = officeIndex < (spec.minOffice || 0);
            card.classList.toggle('locked', locked);
            btn.disabled = locked || staff.length >= officeCapacity;
            btn.textContent = locked ? 'Requires Bigger Office' : `Hire - $${spec.hireCost.toLocaleString()}`;
            if (!locked) btn.classList.add('btn-cartoon-success');
        });
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

    handleHireLawyer(tier) {
        EducationHelpers.handleHireLawyer(this, tier);
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
        this.processTimeEvents(events);
    }

    /**
     * Publish the weekly edition: its headline leads the newspaper and its
     * market shift nudges prices (#920, #2237)
     */
    publishWeeklyEdition() {
        const weekly = this.gameState.weeklyNewsSystem;
        if (!weekly?.generateWeeklyNews) return null;
        const paper = weekly.generateWeeklyNews();
        this.newsManager?.addNews?.({
            text: paper.headline,
            title: paper.headline,
            description: paper.mainStory,
            category: 'business'
        });
        (paper.worldChanges || []).forEach(change => {
            if (change.type === 'market_shift' && this.gameState.stockMarket?.applyMarketShock) {
                // magnitude 0.1-0.3 maps to a 1-3% move
                const move = (change.magnitude || 0) / 10;
                this.gameState.stockMarket.applyMarketShock(change.effect === 'bust' ? -move : move);
            }
        });
        this.updateNewsBadge?.();
        this.showToast?.(`Weekly edition: ${paper.headline}`, 'info');
        return paper;
    }

    /**
     * Apply the side effects of time events (new day/week) that TimeManager
     * already produced. Used by sleep(), which advances the clock itself, so
     * the day isn't advanced a second time (#917, #1249, #2396).
     * @param {Array} events
     */
    processTimeEvents(events = []) {
        // Office lighting follows the in-game clock (#921)
        this.environmentManager?.updateTimeOfDay?.();

        let checkEndings = false;

        // Handle events (new day, etc)
        (events || []).forEach(event => {
            if (event.type === 'new_day') {
                // New weather every morning (#1184)
                this.environmentManager?.updateWeather?.();
                // Daily high/low-water marks for the weekly ending check (#1134)
                this.gameState.gameEndingSystem?.trackMarks?.();
                // Districts unlock as days/reputation/money grow, so the
                // Elite District ending is reachable (#1986)
                const mapUnlock = this.gameState.mapProgressionSystem?.checkMapUnlocks?.();
                if (mapUnlock?.unlocked) this.showToast(mapUnlock.message, 'success');
                // Reputation from contracts, events, dates, ... promotes too (#856)
                if (this.economySystem?.checkPromotion?.()) {
                    const rank = this.gameState.currentRank;
                    this.showToast(`PROMOTED to ${rank?.title}!`, 'success');
                    this.uiUpdater?.announceRankPromotion?.(rank);
                }
                // Jealousy cools off a little every day (#915)
                this.gameState.jealousySystem?.decayAll?.(2);
                // Neglected relationships cool off and can end (#1076)
                const breakups = this.gameState.relationshipEmotionSystem?.processDailyUpdates?.() || [];
                for (const b of breakups) {
                    const who = b.npc?.name || 'Your partner';
                    const extra = b.divorceCost > 0 ? ` The divorce cost you $${b.divorceCost.toLocaleString()}.` : '';
                    this.showToast(`${who} ended things: "${b.dialogue}"${extra}`, 'error');
                }
                if (this.newsManager) {
                    this.newsManager.generateDailyNews();
                    this.updateNewsBadge();
                }
                this.showToast('A new day has begun!', 'info');

                // Random life events: referral bonuses, car trouble, ... (#919)
                if (this.newsManager?.checkRandomEvents) {
                    this.newsManager.checkRandomEvents().forEach(ev => {
                        this.newsManager.applyEventEffects(ev);
                        const kind = ev.type === 'positive' ? 'success' : ev.type === 'negative' ? 'warning' : 'info';
                        this.showToast(`${(ev.title || '').trim()}: ${ev.description}`, kind);
                    });
                }

                // Background world events (crashes, booms, ...) (#918, #2366, #2110)
                const worldEvents = this.gameState.worldEventManager?.processDay?.() || { started: [], ended: [] };
                worldEvents.started.forEach(id => {
                    const name = this.gameState.worldEventManager.eventPool[id]?.name || id;
                    this.showToast(`World event: ${name}!`, 'warning');
                });
                worldEvents.ended.forEach(id => {
                    const name = this.gameState.worldEventManager.eventPool[id]?.name || id;
                    this.showToast(`${name} is over.`, 'info');
                });
                if (worldEvents.started.length) this.updateNewsBadge?.();

                // Update stock market with today's news events
                if (this.gameState.stockMarket) {
                    // Gather news events from the daily paper
                    const dailyPaper = this.newsManager?.getDailyPaper();
                    const newsEvents = [];
                    if (dailyPaper?.headline) newsEvents.push(dailyPaper.headline);
                    if (dailyPaper?.articles) newsEvents.push(...dailyPaper.articles);

                    // Update stock market prices based on news and running world events
                    const activeWorld = this.gameState.worldEventManager?.getActiveEvents?.() || [];
                    this.gameState.stockMarket.update(newsEvents, activeWorld);
                }

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

                // Heat cools off; open investigations escalate or get dropped
                const crimeOutcome = this.gameState.crimeSystem?.processDay?.() || {};
                if (crimeOutcome.arrested) {
                    this.handleArrest(crimeOutcome.reason);
                } else if (crimeOutcome.cleared) {
                    this.showToast('The investigation into you was dropped for lack of evidence.', 'success');
                }
            } else if (event.type === 'new_week') {
                this.publishWeeklyEdition();
                // The roommate covers their half (#2055, #1716)
                const fullRent = this.gameState.rent || 500;
                const rent = this.gameState.roommateSystem?.playerRentShare?.(fullRent) ?? fullRent;
                const roommateRent = fullRent - rent;
                this.gameState.money -= rent;

                // Starter-job paycheck from onboarding (#1071)
                const pay = IntroSystem.weeklyPay(this.gameState.currentJob);
                if (pay > 0) {
                    this.gameState.money += pay;
                    this.gameState.weeklyIncome = (this.gameState.weeklyIncome || 0) + pay;
                    this.showToast(`Paycheck from ${this.gameState.currentJob.company}: +$${pay.toLocaleString()}`, 'success');
                }

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

                // Legal trouble can turn into an audit (#1538)
                const legalWeek = this.gameState.legalSystem?.processWeek?.();
                if (legalWeek?.audited) {
                    this.showToast(`Audited! Regulators fined you $${legalWeek.fine.toLocaleString()} over your legal trouble.`, 'error');
                }

                // The world simulation moves on: closures, layoffs, openings (#2258)
                const world = this.gameState.worldEvolutionSystem?.processWeeklyChanges?.();
                for (const change of world?.changes || []) {
                    if (change.type === 'business_closed' || change.type === 'layoffs') {
                        this.showToast(change.message, 'warning');
                    } else if (change.type === 'new_business') {
                        this.showToast(change.message, 'info');
                    }
                }

                // Company payroll and client retainers (no-op without a company)
                if (this.companyManagement?.playerCompany) {
                    const week = this.companyManagement.processWeek();
                    if (week.payroll > 0) this.showToast(`Company payroll: -$${week.payroll.toLocaleString()}`, 'warning');
                    if (week.revenue > 0) this.showToast(`Client retainers: +$${week.revenue.toLocaleString()}`, 'success');
                    week.lostClients.forEach(name => this.showToast(`${name} dropped your company after being neglected.`, 'error'));
                }

                // Bank Interest
                if (this.bankSystem) {
                    const interest = this.bankSystem.processWeeklyInterest();
                    if (interest.savingsInterest > 0) {
                        this.showToast(`Savings Interest: +$${interest.savingsInterest}`, 'success');
                    }
                    if (interest.loanInterest > 0) {
                        this.showToast(`Loan Interest: -$${interest.loanInterest}`, 'warning');
                    }
                    if (interest.defaulted) {
                        this.showToast('You defaulted on your loan! Credit score and reputation took a hit.', 'error');
                    } else if (interest.missedWeeks) {
                        this.showToast(`Missed a loan payment (${interest.missedWeeks} week${interest.missedWeeks === 1 ? '' : 's'}). Your credit score dropped.`, 'warning');
                    }
                }

                this.showToast(`Paid weekly rent: -$${rent}${roommateRent > 0 ? ` (${this.gameState.roommateSystem?.roommate?.name || 'Your roommate'} covered $${roommateRent})` : ''}`, 'warning');
                this.audioManager.play('expense');

                // Rent was actually charged: count it for the story beat (#1497)
                this.gameState.rentPaymentsMade = (Number(this.gameState.rentPaymentsMade) || 0) + 1;

                // Weekly story check: refresh the act, then fire every beat whose
                // trigger is now met (rent, money, reputation, ethics, days...) (#1970)
                if (this.storyBeatsSystem) {
                    this.storylineManager?.checkPhaseTransition?.();
                    for (const beat of this.storyBeatsSystem.checkForTriggeredBeats()) {
                        this.handleStoryBeat(beat);
                    }
                }

                if (this.gameState.money < -1000) {
                    this.showToast('CRITICAL: Eviction imminent! Earn money fast!', 'error');
                }

                // Ending checks run after every event is processed (#1514)
                checkEndings = true;
            } else if (event.type === 'new_month') {
                // Month/year events used to be dropped on the floor (#1462)
                this.showToast(`A new month begins: ${event.data?.month || ''}`.trim(), 'info');
            } else if (event.type === 'new_year') {
                this.showToast(`Happy New Year! Welcome to Year ${event.data?.year ?? ''}`.trim(), 'success');
            }
        });

        this.updateMapScreen(); // Update visuals
        this.uiUpdater.updateAllUI(); // Money updated

        // Endings are checked once, after the week's events and UI have
        // settled, so the ending screen shows the final state (#1514)
        if (checkEndings && this.gameState.gameEndingSystem) {
            const ending = this.gameState.gameEndingSystem.checkVictoryConditions();
            if (ending) this.gameState.gameEndingSystem.triggerEnding(ending);
        }
    }

    /**
     * Show game ending screen
     */
    showGameEnding(endingData) {
        createGameEndingModal(endingData, this);
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

        // Validate everything before mutating any state (#93)
        if (!this.characterStats) {
            this.showError('Character stats not initialized');
            return;
        }
        if (this.gameState.money < activity.cost) {
            this.showError("Not enough money!");
            return;
        }

        // Pay cost
        this.gameState.money -= activity.cost;

        // Do training (negative energyCost, e.g. Meditation, restores energy)
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

    handleCancelProject() {
        ProjectHelpers.handleCancelProject(this);
    }

    handleWorkOnProject() {
        ProjectHelpers.handleWorkOnProject(this);
    }

    startWorkingSession(hours) {
        ProjectHelpers.startWorkingSession(this, hours);
    }
    /**
     * Main Game Loop. requestAnimationFrame passes a high-resolution timestamp;
     * the tick is wrapped so one throwing subsystem can't freeze the loop (#1656).
     */
    gameLoop(timestamp = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
        try {
            this.gameLoopTick(timestamp);
        } catch (error) {
            logger.error('Error in game loop tick:', error);
        }
        this.gameLoopId = requestAnimationFrame(this.gameLoop);
    }

    /**
     * One frame of game-loop work
     * @param {number} timestamp - rAF timestamp in ms
     */
    gameLoopTick(timestamp) {
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
                    if (!result) return;
                    // Parties offer attend/skip instead of a passing toast (#2414)
                    if (result.type === 'party' && Array.isArray(result.actions)) {
                        this.offerPartyChoice(result);
                    } else if (this.showToast) {
                        this.showToast(result.message, result.type === 'crash' ? 'error' : 'info');
                    }
                });
                // Heads-up for tomorrow's holidays (#1710)
                const tomorrow = this.eventSystem.getUpcomingEvents?.(1, { types: ['holiday'] }) || [];
                tomorrow.filter(e => e.inDays === 1).forEach(e => {
                    this.showToast?.(`Tomorrow is ${e.name}. Many places will be closed.`, 'info');
                });
                this.gameState.lastEventCheck = currentDay;
            }
        }

        // Check visual progression milestones (throttled to once per second, #1574)
        if (this.visualProgressionSystem && seconds !== this.lastMilestoneCheckSecond) {
            this.lastMilestoneCheckSecond = seconds;
            this.visualProgressionSystem.checkMilestones();
        }

        // Check for new research papers (only if game is started), throttled
        // to once per second like the milestone check above (#1324)
        if (this.researchPaperSystem && this.gameState.isGameStarted && seconds !== this.lastResearchCheckSecond) {
            this.lastResearchCheckSecond = seconds;
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
                this.researchInboxUI.updateUnreadCount();
            }
        } catch (error) {
            logger.error('Error updating inbox badge:', error);
        }
    }

    updateNewsBadge() {
        try {
            if (!this.newsManager) return;

            const unreadCount = this.newsManager.getUnreadCount();
            const badge = document.getElementById('news-unread-badge');
            const button = document.getElementById('btn-nav-newspaper');

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
        } catch (error) {
            logger.error('Error updating news badge:', error);
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
        if (loadingScreen) MainGame.fadeOutElement(loadingScreen);
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

            // Office manager (documented tycoon system)
            if (!this.gameState.officeManager) {
                this.gameState.officeManager = new OfficeManager(this.gameState);
                this.officeManager = this.gameState.officeManager;
            }

            // Company management
            if (!this.gameState.companyManagement) {
                this.gameState.companyManagement = new CompanyManagementSystem(this.gameState);
                this.companyManagement = this.gameState.companyManagement;
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
                    title: 'Department Head'
                    // demandLevel comes from GameplaySettings' difficulty (#1251)
                });
            }

            // Gameplay settings
            if (!this.gameState.gameplaySettings) {
                this.gameState.gameplaySettings = new GameplaySettings();
                this.gameplaySettings = this.gameState.gameplaySettings;
                // Settings restored from a save before this system existed (#1250)
                if (this.gameState.pendingGameplaySettings) {
                    this.gameplaySettings.fromJSON(this.gameState.pendingGameplaySettings);
                    this.gameState.pendingGameplaySettings = null;
                }
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

/**
 * Time slots and energy a chart task takes, from its 1-10 difficulty (#1229)
 */
MainGame.taskWorkCost = function (task) {
    const raw = Number(task?.difficulty);
    const difficulty = Number.isFinite(raw) ? Math.max(1, Math.min(10, raw)) : 1;
    return {
        timeSlots: difficulty <= 3 ? 1 : (difficulty <= 7 ? 2 : 3),
        energy: Math.round(5 + difficulty * 2)
    };
};

/**
 * Palette picker buttons: swatch painted from the real chart palette (#1892),
 * and the selection exposed to screen readers (#1881)
 */
MainGame.syncPaletteButtons = function (selected) {
    document.querySelectorAll('.palette-btn').forEach(btn => {
        const active = btn.dataset.palette === selected;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        const swatch = ChartManager.paletteSwatch(btn.dataset.palette);
        if (swatch) btn.style.background = swatch;
    });
};

// Store fields mirrored into GameState (bank is only copied once at startup)
// currentTask, unlockedThemes, lastScore and settings were missing (#1036)
MainGame.STORE_SYNC_FIELDS = [
    'money', 'reputation', 'rankIndex', 'rent', 'tasksCompleted', 'perfectScores',
    'totalEarned', 'weeklyIncome', 'totalRatings', 'ratingSum', 'unlockedChartTypes',
    'purchasedItems', 'unlockedTools', 'unlockedLibraries', 'isGameStarted',
    'tutorialCompleted', 'soundEnabled', 'musicEnabled', 'currentLocation', 'chartConfig',
    'currentTask', 'unlockedThemes', 'lastScore', 'settings'
];

MainGame.FADE_MS = 400;

/**
 * Fade an element out over FADE_MS, then hide it (display:none + .hidden)
 */
MainGame.fadeOutElement = function fadeOutElement(element, ms = MainGame.FADE_MS) {
    if (!element || element.dataset.fading === 'true') return;
    element.dataset.fading = 'true';
    element.style.transition = `opacity ${ms}ms ease`;
    // Let the browser paint the current opacity before changing it
    const start = () => { element.style.opacity = '0'; };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(start);
    else start();
    setTimeout(() => {
        element.classList.add('hidden');
        element.style.display = 'none';
        delete element.dataset.fading;
    }, ms);
};

MainGame.copyStoreValue = function copyStoreValue(value) {
    if (Array.isArray(value)) return value.map(item => MainGame.copyStoreValue(item));
    if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
        const out = {};
        for (const [key, item] of Object.entries(value)) out[key] = MainGame.copyStoreValue(item);
        return out;
    }
    return value;
};

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
// Unit tests import MainGame without booting a whole game by setting
// globalThis.__DSD_NO_AUTOBOOT__ before the import (#527)
if (globalThis.__DSD_NO_AUTOBOOT__) {
    // no-op: the importer drives MainGame directly
} else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // DOM already loaded, call immediately
    initGame();
}


export { game };
