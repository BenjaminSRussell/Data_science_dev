/**
 * LazySystemLoader.js
 * Loads systems asynchronously to prevent blocking
 * Critical systems load first, others load in background
 */

export class LazySystemLoader {
    constructor(gameState, mainGame) {
        this.gameState = gameState;
        this.mainGame = mainGame;
        this.loadedSystems = new Set();
        this.loadingQueue = [];
    }
    
    /**
     * Load critical systems immediately (required for game to start)
     */
    loadCriticalSystems() {
        // These are needed immediately
        return [
            'characterStats',
            'timeManager',
            'economySystem',
            'npcManager',
            'taskSystem',
            'uiUpdater',
            'screenManager'
        ];
    }
    
    /**
     * Load systems in background (non-blocking)
     */
    async loadSystemsInBackground() {
        const systems = [
            // High priority (load soon)
            () => this.loadHighPrioritySystems(),
            // Medium priority (load after a delay)
            () => this.loadMediumPrioritySystems(),
            // Low priority (load last)
            () => this.loadLowPrioritySystems()
        ];
        
        // Load in batches with delays
        for (let i = 0; i < systems.length; i++) {
            await this.delay(100); // Small delay between batches
            try {
                await systems[i]();
            } catch (error) {
                console.warn(`Error loading system batch ${i}:`, error);
            }
        }
    }
    
    /**
     * Load high priority systems
     */
    async loadHighPrioritySystems() {
        const systems = [
            'bankSystem',
            'worldMap',
            'newsManager',
            'stockMarket',
            'jobSystem',
            'introSystem',
            'dayNightCycle',
            'notificationSystem'
        ];
        
        await this.loadSystemBatch(systems);
    }
    
    /**
     * Load medium priority systems
     */
    async loadMediumPrioritySystems() {
        const systems = [
            'crimeSystem',
            'romanceSystem',
            'legalSystem',
            'educationSystem',
            'worldEventManager',
            'projectSystem',
            'contractSystem',
            'roommateSystem',
            'eventSystem',
            'visualProgressionSystem'
        ];
        
        await this.loadSystemBatch(systems);
    }
    
    /**
     * Load low priority systems (can wait)
     */
    async loadLowPrioritySystems() {
        const systems = [
            'aiSystem',
            'hardwareManager',
            'mapProgressionSystem',
            'detailedMapSystem',
            'roomSystem',
            'locationDetailSystem',
            'companyManagement',
            'romanceProgression',
            'jealousySystem',
            'demandingBoss',
            'gameplaySettings',
            'dirtyDataSystem',
            'realWorldTaskSystem',
            'taskVisualRenderer',
            'aiTrainingStoryline',
            'githubIssuesSystem',
            'researchPaperSystem'
        ];
        
        await this.loadSystemBatch(systems);
    }
    
    /**
     * Load a batch of systems
     */
    async loadSystemBatch(systemNames) {
        const promises = systemNames.map(name => this.loadSystem(name));
        await Promise.allSettled(promises);
    }
    
    /**
     * Load a single system
     */
    async loadSystem(systemName) {
        if (this.loadedSystems.has(systemName)) {
            return;
        }
        
        try {
            // System-specific loading logic
            await this.initializeSystem(systemName);
            this.loadedSystems.add(systemName);
        } catch (error) {
            console.warn(`Failed to load system ${systemName}:`, error);
        }
    }
    
    /**
     * Initialize specific system
     */
    async initializeSystem(systemName) {
        // This will be called by main.js with actual initialization
        // Just a placeholder for structure
        return Promise.resolve();
    }
    
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

