/**
 * GameState - Central game state management
 * Holds all player data, current task, and game configuration
 */

import { RANKS } from '../data/ranks.js';
import { CHART_TYPES } from '../data/chartTypes.js';

export class GameState {
    constructor() {
        this.reset();
    }

    /**
     * Reset game state to initial values
     */
    reset() {
        // Player stats
        this.money = 100;
        this.reputation = 0;
        this.rankIndex = 0;
        this.rent = 500; // Weekly rent

        // Progress tracking
        this.tasksCompleted = 0;
        this.perfectScores = 0;
        this.totalEarned = 0;
        this.totalSpent = 0;
        this.startTime = Date.now();
        this.totalRatings = 0;
        this.ratingSum = 0;

        // Current state
        this.currentTask = null;
        this.currentLocation = 'apartment'; // Start at apartment
        this.bank = null; // Bank state (savings/loan)

        // Unlocked content
        this.unlockedChartTypes = ['bar', 'line', 'pie']; // Starting charts
        this.purchasedItems = []; // Shop items
        this.unlockedThemes = ['default'];
        this.unlockedTools = []; // Software tools
        this.unlockedLibraries = [];

        // Game configuration
        this.chartConfig = {
            type: 'bar',
            palette: 'corporate',
            showLegend: true,
            showGrid: true,
            showDataLabels: false,
            title: ''
        };

        this.lastScore = null;

        // Game flags
        this.isGameStarted = false;
        this.tutorialCompleted = false;

        // Settings
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.settings = {
            soundEnabled: true,
            autoSave: true,
            theme: 'dark'
        };

        // Sub-systems storage (these are initialized externally and then linked)
        this.worldMap = null;
        this.npcManager = null;
        this.newsManager = null;
        this.stockMarket = null;
        this.crimeSystem = null;
        this.romanceSystem = null;
        this.legalSystem = null;
        this.educationSystem = null;
        this.worldEventManager = null;
        this.projectSystem = null;
        this.aiSystem = null;
        this.hardwareManager = null;
        this.timeManager = null;
        this.characterStats = null;
    }

    /**
     * Get current rank info
     */
    get currentRank() {
        return RANKS[this.rankIndex];
    }

    /**
     * Get next rank info (if exists)
     */
    get nextRank() {
        return RANKS[this.rankIndex + 1] || null;
    }

    /**
     * Calculate progress to next rank (0-100)
     */
    get progressToNextRank() {
        if (!this.nextRank) return 100;

        const currentReq = this.currentRank.repRequired;
        const nextReq = this.nextRank.repRequired;
        const progress = ((this.reputation - currentReq) / (nextReq - currentReq)) * 100;

        return Math.min(100, Math.max(0, progress));
    }

    /**
     * Get average rating
     */
    get averageRating() {
        if (this.totalRatings === 0) return 0;
        return (this.ratingSum / this.totalRatings).toFixed(1);
    }

    /**
     * Check if a chart type is unlocked
     */
    isChartTypeUnlocked(type) {
        return true; // Liberalization: All charts unlocked by default!
    }

    /**
     * Unlock a chart type
     */
    unlockChartType(type) {
        if (!this.unlockedChartTypes.includes(type)) {
            this.unlockedChartTypes.push(type);
        }
    }

    /**
     * Check if player can afford an item
     */
    canAfford(price) {
        return this.money >= price;
    }

    /**
     * Purchase an item
     */
    purchaseItem(item) {
        if (!this.canAfford(item.price)) return false;
        if (this.purchasedItems.includes(item.id)) return false;

        this.money -= item.price;
        this.purchasedItems.push(item.id);

        // Apply item effect
        if (item.type === 'chart') {
            this.unlockChartType(item.chartType);
        } else if (item.type === 'tool') {
            this.unlockedTools.push(item.toolId);
        }

        return true;
    }

    /**
     * Serialize state for saving
     */
    toJSON() {
        return {
            money: this.money,
            reputation: this.reputation,
            rankIndex: this.rankIndex,
            rent: this.rent, // Persist rent
            bank: this.bank, // Persist bank state
            tasksCompleted: this.tasksCompleted,
            perfectScores: this.perfectScores,
            totalEarned: this.totalEarned,
            totalRatings: this.totalRatings,
            ratingSum: this.ratingSum,
            unlockedChartTypes: this.unlockedChartTypes,
            unlockedTools: this.unlockedTools,
            purchasedItems: this.purchasedItems,
            isGameStarted: this.isGameStarted,
            tutorialCompleted: this.tutorialCompleted,
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            unlockedLibraries: this.unlockedLibraries || [],

            // Sub-systems
            worldMap: this.worldMap?.toJSON(),
            npcManager: this.npcManager?.toJSON(),
            stockMarket: this.stockMarket?.toJSON(),
            projectSystem: this.projectSystem?.toJSON(),
            worldEventManager: this.worldEventManager?.toJSON(),
            crimeSystem: this.crimeSystem?.toJSON(),
            educationSystem: this.educationSystem?.toJSON(),
            timeManager: this.timeManager?.toJSON(),
            aiSystem: this.aiSystem?.toJSON(),
            hardwareManager: this.hardwareManager?.toJSON() // Persist hardware
        };
    }

    /**
     * Load state from saved data
     */
    fromJSON(data) {
        if (!data) return;

        this.money = data.money ?? 100;
        this.reputation = data.reputation ?? 0;
        this.rankIndex = data.rankIndex ?? 0;
        this.rent = data.rent ?? 500; // Load rent
        this.bank = data.bank || null; // Load bank state
        this.tasksCompleted = data.tasksCompleted ?? 0;
        this.perfectScores = data.perfectScores ?? 0;
        this.totalEarned = data.totalEarned ?? 0;
        this.totalRatings = data.totalRatings ?? 0;
        this.ratingSum = data.ratingSum ?? 0;
        this.unlockedChartTypes = data.unlockedChartTypes ?? ['bar', 'line', 'pie'];
        this.unlockedTools = data.unlockedTools ?? [];
        this.purchasedItems = data.purchasedItems ?? [];
        this.isGameStarted = data.isGameStarted ?? false;
        this.tutorialCompleted = data.tutorialCompleted ?? false;
        this.soundEnabled = data.soundEnabled ?? true;
        this.musicEnabled = data.musicEnabled ?? true;
        this.unlockedLibraries = data.unlockedLibraries || [];

        // Restore sub-systems
        if (this.worldMap && data.worldMap) this.worldMap.fromJSON(data.worldMap);
        if (this.npcManager && data.npcManager) this.npcManager.fromJSON(data.npcManager);
        if (this.stockMarket && data.stockMarket) this.stockMarket.fromJSON(data.stockMarket);
        if (this.projectSystem && data.projectSystem) this.projectSystem.fromJSON(data.projectSystem);
        if (this.worldEventManager && data.worldEventManager) this.worldEventManager.fromJSON(data.worldEventManager);
        if (this.crimeSystem && data.crimeSystem) this.crimeSystem.fromJSON(data.crimeSystem);
        if (this.educationSystem && data.educationSystem) this.educationSystem.fromJSON(data.educationSystem);
        if (this.timeManager && data.timeManager) this.timeManager.fromJSON(data.timeManager);
        if (this.aiSystem && data.aiSystem) this.aiSystem.fromJSON(data.aiSystem);
        if (this.hardwareManager && data.hardwareManager) this.hardwareManager.fromJSON(data.hardwareManager);
    }
}
