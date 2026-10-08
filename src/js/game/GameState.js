/**
 * GameState - Central game state management
 * Holds all player data, current task, and game configuration
 */

import { AchievementSystem } from './AchievementSystem.js';
import { RANKS } from '../data/ranks.js';
import { normalizePortfolio } from './Portfolio.js';


export class GameState {
    // Quality bonuses per software item (fractions added to the multipliers)
    static SOFTWARE_EFFECTS = {
        soft_ide_pro: { visualClarity: 0.05, dataAccuracy: 0.03 },
        soft_automl: { speedBonus: 0.10, chartAppropriateness: 0.03 },
        soft_cloud_basic: { dataAccuracy: 0.05, speedBonus: 0.05 },
        soft_enterprise_db: { dataAccuracy: 0.08, chartAppropriateness: 0.02 },
        soft_neural_arch: { visualClarity: 0.10, chartAppropriateness: 0.08, dataAccuracy: 0.05 }
    };

    static SOFTWARE_STAT_LABELS = {
        visualClarity: 'Visual Clarity',
        dataAccuracy: 'Data Accuracy',
        chartAppropriateness: 'Chart Appropriateness',
        speedBonus: 'Speed'
    };

    /** Fresh Chart Studio settings (used on reset and for every new task, #1682). */
    static defaultChartConfig() {
        return {
            type: 'bar',
            palette: 'corporate',
            showLegend: true,
            showGrid: true,
            showDataLabels: false,
            title: ''
        };
    }

    constructor() {
        this.reset();
    }

    /**
     * Reset game state to initial values
     */
    reset() {
        // Player stats
        // Shown on the Stats screen; set with setPlayerName() (#1295)
        this.playerName = '';
        this.money = 100;
        this.reputation = 0;
        this.rankIndex = 0;
        this.rent = 500; // Weekly rent

        // Progress tracking
        this.tasksCompleted = 0;
        this.perfectScores = 0;
        // Earned achievements, { id, day, earnedAt } (#258)
        this.completedAchievements = [];
        // Scored chart submissions, newest last (#2715, #2717)
        this.portfolio = [];
        this.totalEarned = 0;
        this.totalSpent = 0;
        this.weeklyIncome = 0; // Track income for tax calculation
        this.startTime = Date.now();
        this.totalRatings = 0;
        this.ratingSum = 0;

        // Current state
        this.currentTask = null;
        this.jailSentence = 0;
        this.staff = [];
        this.dailyMarketingCost = 0;
        this.npcMemories = null;
        this.completedStoryBeats = null;
        this._currentLocation = 'home'; // Start at home (see currentLocation getter)
        this.bank = null; // Bank state (savings/loan)

        // Unlocked content
        this.unlockedChartTypes = ['bar', 'line', 'pie']; // Starting charts
        this.purchasedItems = []; // Shop items
        this.unlockedThemes = ['default'];
        this.unlockedTools = []; // Software tools
        this.unlockedPerks = []; // Shop perks
        this.unlockedLibraries = [];

        // Game configuration
        this.chartConfig = GameState.defaultChartConfig();

        this.lastScore = null;

        // Game flags
        this.isGameStarted = false;
        this.officeEventBonus = null; // "Urgent Deadline" office event (#2434)
        this.tutorialCompleted = false;

        // Settings
        this.soundEnabled = true;
        this.musicEnabled = true;
        // The colour theme is a device preference (localStorage
        // 'dst_theme_preference', see MainGame.initTheme), not part of a save;
        // the old settings.theme here was never read (#1253)
        this.settings = {
            soundEnabled: true,
            autoSave: true
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
        this.romanceProgressionSystem = null;
        this.companyManagement = null;
        this.demandingBoss = null;
        
        // New integrated systems
        this.jobSystem = null;
        this.workInteractionSystem = null;
        this.realisticDialogueSystem = null;
        this.relationshipEmotionSystem = null;
        this.worldEvolutionSystem = null;
        this.investmentEcommerceSystem = null;
        this.storylineManager = null;
        this.storyBeatsSystem = null;
        this.characterArcSystem = null;
        this.npcMemorySystem = null;
        this.filterManager = null;
        this.mapProgressionSystem = null;
        this.ideSystem = null;
        this.locationBackgroundSystem = null;
        this.weeklyNewsSystem = null;
        this.screenThemeManager = null;
        this.mapCoordinateSystem = null;
        this.contractSystem = null; // New contract system
        this.gameEndingSystem = null; // Game ending system
        this.gameEnding = null; // Current ending state
        
        // Phase 1 Visual Systems
        this.visualSystem = null;
        this.animationManager = null;
        this.assetManager = null;
        this.performanceManager = null;
        this.uiLayerManager = null;
        this.cameraSystem = null;
        
        // Additional state
        this.currentJob = null;
        this.housingLevel = 'apartment';
        this.officeLevel = 'small';
        this.mainGame = null; // Reference to MainGame instance
    }

    /**
     * Get current rank info
     */
    get currentRank() {
        return RANKS[this.rankIndex] || RANKS[0];
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
     * Get software quality multiplier based on purchased software
     * Returns an object with quality bonuses
     */
    /**
     * Where the player is. The world map owns travel, so read through to it;
     * the stored value is only a fallback before the map exists (#982, #1987).
     */
    get currentLocation() {
        return this.worldMap?.currentLocation || this._currentLocation;
    }

    set currentLocation(locationId) {
        this._currentLocation = locationId;
    }

    getSoftwareQualityMultiplier() {
        const multipliers = {
            visualClarity: 1.0,
            dataAccuracy: 1.0,
            chartAppropriateness: 1.0,
            speedBonus: 0  // Percentage bonus (0.1 = 10%)
        };

        // One table drives both the scoring and the text shown in Chart
        // Studio, so they can't drift apart (#1484)
        for (const [id, effects] of Object.entries(GameState.SOFTWARE_EFFECTS)) {
            if (!this.purchasedItems.includes(id)) continue;
            for (const [stat, amount] of Object.entries(effects)) {
                multipliers[stat] += amount;
            }
        }

        return multipliers;
    }

    /**
     * Player-facing bonus text for a software item, e.g. "+5% Visual Clarity"
     */
    static describeSoftwareEffects(id) {
        const effects = GameState.SOFTWARE_EFFECTS[id];
        if (!effects) return [];
        return Object.entries(effects).map(([stat, amount]) =>
            `+${Math.round(amount * 100)}% ${GameState.SOFTWARE_STAT_LABELS[stat] || stat}`);
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
    purchaseItem(item, price = item.price) {
        // price comes from EconomySystem.getItemPrice() so discounts apply (#1309)
        if (!this.canAfford(price)) return false;
        if (this.purchasedItems.includes(item.id)) return false;

        this.money -= price;
        this.totalSpent = (this.totalSpent || 0) + price;
        this.purchasedItems.push(item.id);

        // Apply item effect
        if (item.type === 'chart') {
            this.unlockChartType(item.chartType);
        } else if (item.type === 'tool') {
            this.unlockedTools.push(item.toolId);
        } else if (item.type === 'software') {
            // Software items are tracked in purchasedItems, no additional action needed
            // Software quality effects are calculated dynamically
        } else if (item.type === 'perk') {
            if (!this.unlockedPerks) this.unlockedPerks = [];
            const perkId = item.perkId || item.id;
            if (!this.unlockedPerks.includes(perkId)) {
                this.unlockedPerks.push(perkId);
            }
        }

        return true;
    }

    /**
     * Subsystems that expose their own toJSON()/fromJSON() pair.
     * Order matters on restore: characterStats and timeManager come first so
     * systems that read stats/time while restoring (e.g. ProjectSystem's
     * contract refresh) see the loaded values rather than defaults.
     */
    static get SERIALIZABLE_SUBSYSTEMS() {
        return [
            'characterStats',
            'timeManager',
            'worldMap',
            'npcManager',
            'stockMarket',
            'projectSystem',
            'worldEventManager',
            'crimeSystem',
            'educationSystem',
            'aiSystem',
            'hardwareManager',
            'jobSystem',
            'contractSystem',
            'mapProgressionSystem',
            'romanceSystem',
            'romanceProgressionSystem',
            'legalSystem',
            'visualProgressionSystem',
            'aiTrainingStoryline',
            'researchPaperSystem',
            'weeklyNewsSystem',
            'gameEndingSystem',
            'newsManager',
            'ideSystem',
            'investmentEcommerceSystem',
            'companyManagement',
            'relationshipEmotionSystem',
            'storylineManager',
            'storyBeatsSystem',
            'characterArcSystem',
            'npcMemorySystem',
            'workInteractionSystem',
            'demandingBoss',
            'roommateSystem',
            'jealousySystem',
            'eventSystem',
            'dirtyDataSystem',
            'detailedMapSystem',
            'worldEvolutionSystem'
        ];
    }

    /**
     * Run one subsystem's save/load step without letting a single failure
     * abort the rest of the save or load (#1222).
     */
    _safeSubsystemStep(name, fn) {
        try {
            return fn();
        } catch (error) {
            console.error(`[GameState] Failed to ${name}:`, error);
            return null;
        }
    }

    /**
     * Serialize the in-progress task. The wall-clock startTime is converted to
     * elapsed time so a timed task doesn't instantly expire after a reload.
     */
    _serializeCurrentTask() {
        if (!this.currentTask) return null;
        const task = { ...this.currentTask };
        if (typeof task.startTime === 'number') {
            task.elapsedMs = Math.max(0, Date.now() - task.startTime);
            delete task.startTime;
        }
        return task;
    }

    _restoreCurrentTask(task) {
        if (!task || typeof task !== 'object') return null;
        const restored = { ...task };
        if (typeof restored.elapsedMs === 'number') {
            restored.startTime = Date.now() - restored.elapsedMs;
            delete restored.elapsedMs;
        } else if (typeof restored.startTime !== 'number') {
            restored.startTime = Date.now();
        }
        return restored;
    }

    /**
     * Serialize state for saving
     */
    /**
     * Set the name shown on the Stats screen. Returns the stored name
     */
    setPlayerName(name) {
        this.playerName = GameState.cleanPlayerName(name);
        return this.playerName;
    }

    /**
     * Trim, drop control characters and cap at 24 characters
     */
    static cleanPlayerName(name) {
        if (typeof name !== 'string') return '';
        // eslint-disable-next-line no-control-regex
        return name.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
    }

    toJSON() {
        const data = {
            money: this.money,
            reputation: this.reputation,
            rankIndex: this.rankIndex,
            rent: this.rent, // Persist rent
            bank: this.bank, // Persist bank state (BankSystem keeps all of its state here)
            tasksCompleted: this.tasksCompleted,
            perfectScores: this.perfectScores,
            completedAchievements: this.completedAchievements || [],
            portfolio: this.portfolio,
            totalEarned: this.totalEarned,
            totalSpent: this.totalSpent,
            weeklyIncome: this.weeklyIncome,
            startTime: this.startTime,
            totalRatings: this.totalRatings,
            ratingSum: this.ratingSum,
            currentTask: this._serializeCurrentTask(),
            currentLocation: this.currentLocation,
            jailSentence: this.jailSentence ?? 0,
            unlockedChartTypes: this.unlockedChartTypes,
            unlockedThemes: this.unlockedThemes,
            unlockedTools: this.unlockedTools,
            unlockedPerks: this.unlockedPerks || [],
            purchasedItems: this.purchasedItems,
            chartConfig: this.chartConfig,
            isGameStarted: this.isGameStarted,
            tutorialCompleted: this.tutorialCompleted,
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            settings: this.settings,
            unlockedLibraries: this.unlockedLibraries || [],
            housingLevel: this.housingLevel,
            officeLevel: this.officeLevel,
            officeIndex: this.officeIndex ?? 0,
            staff: Array.isArray(this.staff) ? this.staff : [],
            dailyMarketingCost: this.dailyMarketingCost || 0,
            lastEventCheck: this.lastEventCheck ?? 0,
            officeEventBonus: this.officeEventBonus ?? null,
            npcMemories: this.npcMemories || null,
            completedStoryBeats: this.completedStoryBeats || null,
            playerName: this.playerName || ''
        };

        // Sub-systems with their own toJSON()
        for (const key of GameState.SERIALIZABLE_SUBSYSTEMS) {
            const system = this[key];
            data[key] = (system && typeof system.toJSON === 'function')
                ? this._safeSubsystemStep(`save ${key}`, () => system.toJSON())
                : undefined;
        }

        data.realWorldTaskSystem = this.realWorldTaskSystem ? this._safeSubsystemStep('save realWorldTaskSystem', () => ({
            currentTask: this.realWorldTaskSystem.currentTask,
            // Bounded so saves don't grow forever (#2096)
            taskHistory: (this.realWorldTaskSystem.taskHistory || []).slice(-GameState.MAX_TASK_HISTORY)
        })) : null;
        data.githubIssuesSystem = this.githubIssuesSystem ? this._safeSubsystemStep('save githubIssuesSystem', () => ({
            openIssues: this.githubIssuesSystem.openIssues,
            closedIssues: this.githubIssuesSystem.closedIssues,
            pullRequests: this.githubIssuesSystem.pullRequests
        })) : null;
        data.emotionalBreakdownSystem = this.emotionalBreakdownSystem ? this._safeSubsystemStep('save emotionalBreakdownSystem', () => ({
            activeBreakdowns: Array.from(this.emotionalBreakdownSystem.activeBreakdowns.values()),
            breakdownHistory: this.emotionalBreakdownSystem.breakdownHistory
        })) : null;

        // Phase 1 Visual Systems (save quality settings)
        data.performanceManager = this.performanceManager ? {
            quality: this.performanceManager.quality
        } : null;

        // Gameplay settings (relationships, romance, difficulty...) were
        // never saved (#1250). Keep a pending copy if the system isn't built yet.
        data.gameplaySettings = this.gameplaySettings?.settings
            ? JSON.parse(JSON.stringify(this.gameplaySettings.settings))
            : (this.pendingGameplaySettings || null);

        return data;
    }

    static get MAX_TASK_HISTORY() {
        return 100;
    }

    /**
     * Load state from saved data
     */
    fromJSON(data) {
        if (!data) return;

        this.money = data.money ?? 100;
        this.playerName = GameState.cleanPlayerName(data.playerName);
        this.reputation = data.reputation ?? 0;
        this.rankIndex = data.rankIndex ?? 0;
        this.rent = data.rent ?? 500; // Load rent
        this.bank = data.bank || null; // Load bank state (BankSystem re-applies defaults when null)
        this.tasksCompleted = data.tasksCompleted ?? 0;
        this.perfectScores = data.perfectScores ?? 0;
        this.completedAchievements = AchievementSystem.normalize(data.completedAchievements);
        this.portfolio = normalizePortfolio(data.portfolio);
        this.totalEarned = data.totalEarned ?? 0;
        this.totalSpent = data.totalSpent ?? 0;
        this.weeklyIncome = data.weeklyIncome ?? 0;
        if (typeof data.startTime === 'number') this.startTime = data.startTime;
        this.totalRatings = data.totalRatings ?? 0;
        this.ratingSum = data.ratingSum ?? 0;
        if (data.currentTask !== undefined) this.currentTask = this._restoreCurrentTask(data.currentTask);
        if (data.currentLocation) this.currentLocation = data.currentLocation;
        this.jailSentence = data.jailSentence ?? 0;
        this.unlockedChartTypes = data.unlockedChartTypes ?? ['bar', 'line', 'pie'];
        if (Array.isArray(data.unlockedThemes)) this.unlockedThemes = data.unlockedThemes;
        this.unlockedTools = data.unlockedTools ?? [];
        this.unlockedPerks = data.unlockedPerks ?? this.unlockedPerks ?? [];
        this.purchasedItems = data.purchasedItems ?? [];
        if (data.chartConfig && typeof data.chartConfig === 'object') {
            this.chartConfig = { ...this.chartConfig, ...data.chartConfig };
        }
        this.isGameStarted = data.isGameStarted ?? false;
        this.tutorialCompleted = data.tutorialCompleted ?? false;
        this.soundEnabled = data.soundEnabled ?? true;
        this.musicEnabled = data.musicEnabled ?? true;
        if (data.settings && typeof data.settings === 'object') {
            // Drop the legacy, never-read settings.theme from old saves (#1253)
            this.settings = { ...this.settings, ...data.settings };
            delete this.settings.theme;
        }
        this.unlockedLibraries = data.unlockedLibraries || [];
        if (data.housingLevel) this.housingLevel = data.housingLevel;
        if (data.officeLevel) this.officeLevel = data.officeLevel;
        this.officeIndex = Number.isInteger(data.officeIndex) ? data.officeIndex : 0;
        this.staff = Array.isArray(data.staff) ? data.staff : [];
        this.dailyMarketingCost = typeof data.dailyMarketingCost === 'number' ? data.dailyMarketingCost : 0;
        this.lastEventCheck = typeof data.lastEventCheck === 'number' ? data.lastEventCheck : 0;
        // Pending "Urgent Deadline" pay bonus (#2434)
        this.officeEventBonus = Number(data.officeEventBonus) > 1 ? Math.min(2, Number(data.officeEventBonus)) : null;
        if (data.npcMemories) this.npcMemories = data.npcMemories;
        if (data.completedStoryBeats) this.completedStoryBeats = data.completedStoryBeats;

        // Restore sub-systems; each is isolated so one bad blob can't
        // truncate the rest of the load (#1222)
        for (const key of GameState.SERIALIZABLE_SUBSYSTEMS) {
            const system = this[key];
            if (system && typeof system.fromJSON === 'function' && data[key]) {
                this._safeSubsystemStep(`restore ${key}`, () => system.fromJSON(data[key]));
            }
        }

        if (this.realWorldTaskSystem && data.realWorldTaskSystem) {
            this._safeSubsystemStep('restore realWorldTaskSystem', () => {
                this.realWorldTaskSystem.currentTask = data.realWorldTaskSystem.currentTask;
                this.realWorldTaskSystem.taskHistory = (data.realWorldTaskSystem.taskHistory || []).slice(-GameState.MAX_TASK_HISTORY);
            });
        }
        if (this.githubIssuesSystem && data.githubIssuesSystem) {
            this._safeSubsystemStep('restore githubIssuesSystem', () => {
                this.githubIssuesSystem.openIssues = data.githubIssuesSystem.openIssues || [];
                this.githubIssuesSystem.closedIssues = data.githubIssuesSystem.closedIssues || [];
                this.githubIssuesSystem.pullRequests = data.githubIssuesSystem.pullRequests || [];
                // Repository counts are derived from the lists; recount after
                // restoring them instead of keeping the fresh-game numbers (#528)
                this.githubIssuesSystem.refreshRepositoryCounts?.();
            });
        }
        if (this.emotionalBreakdownSystem && data.emotionalBreakdownSystem) {
            this._safeSubsystemStep('restore emotionalBreakdownSystem', () => {
                // Restore active breakdowns (Map reconstruction from saved array)
                this.emotionalBreakdownSystem.activeBreakdowns = new Map(
                    (data.emotionalBreakdownSystem.activeBreakdowns || []).map(breakdown => [breakdown.id, breakdown])
                );
                this.emotionalBreakdownSystem.breakdownHistory = data.emotionalBreakdownSystem.breakdownHistory || [];
            });
        }

        // Restore Phase 1 Visual Systems settings
        if (data.gameplaySettings && typeof data.gameplaySettings === 'object') {
            if (this.gameplaySettings?.fromJSON) {
                this._safeSubsystemStep('restore gameplaySettings', () => {
                    this.gameplaySettings.fromJSON(data.gameplaySettings);
                });
            } else {
                // Applied when GameplaySettings is constructed later
                this.pendingGameplaySettings = data.gameplaySettings;
            }
        }

        if (this.performanceManager && data.performanceManager) {
            this._safeSubsystemStep('restore performanceManager', () => {
                this.performanceManager.setQuality(data.performanceManager.quality || 'auto');
            });
        }
    }
}
