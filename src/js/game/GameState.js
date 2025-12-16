/**
 * GameState - Central game state management
 * Holds all player data, current task, and game configuration
 */

import { RANKS } from '../data/ranks.js';
import { CHART_TYPES } from '../data/chartTypes.js';
import { JobSystem } from './JobSystem.js';
import { WorkInteractionSystem } from './WorkInteractionSystem.js';
import { RealisticDialogueSystem } from './RealisticDialogueSystem.js';
import { RelationshipEmotionSystem } from './RelationshipEmotionSystem.js';
import { WorldEvolutionSystem } from './WorldEvolutionSystem.js';
import { InvestmentEcommerceSystem } from './InvestmentEcommerceSystem.js';
import { StorylineManager } from './StorylineManager.js';
import { MapProgressionSystem } from './MapProgressionSystem.js';
import { IDESystem } from './IDESystem.js';
import { LocationBackgroundSystem } from './LocationBackgroundSystem.js';
import { WeeklyNewsSystem } from './WeeklyNewsSystem.js';
import { ScreenThemeManager } from './ScreenThemeManager.js';
import { MapCoordinateSystem } from './MapCoordinateSystem.js';

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
        this.weeklyIncome = 0; // Track income for tax calculation
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
        
        // New integrated systems
        this.jobSystem = null;
        this.workInteractionSystem = null;
        this.realisticDialogueSystem = null;
        this.relationshipEmotionSystem = null;
        this.worldEvolutionSystem = null;
        this.investmentEcommerceSystem = null;
        this.storylineManager = null;
        this.mapProgressionSystem = null;
        this.ideSystem = null;
        this.locationBackgroundSystem = null;
        this.weeklyNewsSystem = null;
        this.screenThemeManager = null;
        this.mapCoordinateSystem = null;
        this.contractSystem = null; // New contract system
        this.bankSystem = null; // Bank system
        
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
     * Get software quality multiplier based on purchased software
     * Returns an object with quality bonuses
     */
    getSoftwareQualityMultiplier() {
        const multipliers = {
            visualClarity: 1.0,
            dataAccuracy: 1.0,
            chartAppropriateness: 1.0,
            speedBonus: 0  // Percentage bonus (0.1 = 10%)
        };

        // Software quality effects
        if (this.purchasedItems.includes('soft_ide_pro')) {
            multipliers.visualClarity += 0.05; // +5% visual clarity (fewer bugs)
            multipliers.dataAccuracy += 0.03; // +3% accuracy (better code)
        }

        if (this.purchasedItems.includes('soft_automl')) {
            multipliers.speedBonus += 0.10; // +10% speed bonus
            multipliers.chartAppropriateness += 0.03; // +3% (auto-selection helps)
        }

        if (this.purchasedItems.includes('soft_cloud_basic')) {
            multipliers.dataAccuracy += 0.05; // +5% (better processing power)
            multipliers.speedBonus += 0.05; // +5% speed
        }

        if (this.purchasedItems.includes('soft_enterprise_db')) {
            multipliers.dataAccuracy += 0.08; // +8% (better data handling)
            multipliers.chartAppropriateness += 0.02; // +2%
        }

        if (this.purchasedItems.includes('soft_neural_arch')) {
            multipliers.visualClarity += 0.10; // +10% (AI-optimized)
            multipliers.chartAppropriateness += 0.08; // +8% (better selection)
            multipliers.dataAccuracy += 0.05; // +5%
        }

        return multipliers;
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
        } else if (item.type === 'software') {
            // Software items are tracked in purchasedItems, no additional action needed
            // Software quality effects are calculated dynamically
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
            weeklyIncome: this.weeklyIncome,
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
            hardwareManager: this.hardwareManager?.toJSON(),
            characterStats: this.characterStats?.toJSON(),
            jobSystem: this.jobSystem?.toJSON(),
            contractSystem: this.contractSystem?.toJSON(),
            mapProgressionSystem: this.mapProgressionSystem?.toJSON(),
            romanceSystem: this.romanceSystem?.toJSON(),
            legalSystem: this.legalSystem?.toJSON(),
            bankSystem: this.bankSystem?.toJSON(),
            visualProgressionSystem: this.visualProgressionSystem?.toJSON(),
            realWorldTaskSystem: this.realWorldTaskSystem ? {
                currentTask: this.realWorldTaskSystem.currentTask,
                taskHistory: this.realWorldTaskSystem.taskHistory
            } : null,
            aiTrainingStoryline: this.aiTrainingStoryline?.toJSON(),
            githubIssuesSystem: this.githubIssuesSystem ? {
                openIssues: this.githubIssuesSystem.openIssues,
                closedIssues: this.githubIssuesSystem.closedIssues,
                pullRequests: this.githubIssuesSystem.pullRequests
            } : null,
            researchPaperSystem: this.researchPaperSystem?.toJSON(),
            emotionalBreakdownSystem: this.emotionalBreakdownSystem ? {
                activeBreakdowns: Array.from(this.emotionalBreakdownSystem.activeBreakdowns.values()),
                breakdownHistory: this.emotionalBreakdownSystem.breakdownHistory
            } : null,
            
            // Phase 1 Visual Systems (save quality settings)
            performanceManager: this.performanceManager ? {
                quality: this.performanceManager.quality
            } : null
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
        this.weeklyIncome = data.weeklyIncome ?? 0;
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
        if (this.characterStats && data.characterStats) this.characterStats.fromJSON(data.characterStats);
        if (this.jobSystem && data.jobSystem) this.jobSystem.fromJSON(data.jobSystem);
        if (this.contractSystem && data.contractSystem) this.contractSystem.fromJSON(data.contractSystem);
        if (this.mapProgressionSystem && data.mapProgressionSystem) this.mapProgressionSystem.fromJSON(data.mapProgressionSystem);
        if (this.romanceSystem && data.romanceSystem) this.romanceSystem.fromJSON(data.romanceSystem);
        if (this.legalSystem && data.legalSystem) this.legalSystem.fromJSON(data.legalSystem);
        if (this.bankSystem && data.bankSystem) this.bankSystem.fromJSON(data.bankSystem);
        if (this.visualProgressionSystem && data.visualProgressionSystem) this.visualProgressionSystem.fromJSON(data.visualProgressionSystem);
        if (this.realWorldTaskSystem && data.realWorldTaskSystem) {
            this.realWorldTaskSystem.currentTask = data.realWorldTaskSystem.currentTask;
            this.realWorldTaskSystem.taskHistory = data.realWorldTaskSystem.taskHistory || [];
        }
        if (this.aiTrainingStoryline && data.aiTrainingStoryline) this.aiTrainingStoryline.fromJSON(data.aiTrainingStoryline);
        if (this.githubIssuesSystem && data.githubIssuesSystem) {
            this.githubIssuesSystem.openIssues = data.githubIssuesSystem.openIssues || [];
            this.githubIssuesSystem.closedIssues = data.githubIssuesSystem.closedIssues || [];
            this.githubIssuesSystem.pullRequests = data.githubIssuesSystem.pullRequests || [];
        }
        if (this.researchPaperSystem && data.researchPaperSystem) {
            this.researchPaperSystem.fromJSON(data.researchPaperSystem);
        }
        if (this.emotionalBreakdownSystem && data.emotionalBreakdownSystem) {
            // Restore breakdown history
            this.emotionalBreakdownSystem.breakdownHistory = data.emotionalBreakdownSystem.breakdownHistory || [];
        }
        
        // Restore Phase 1 Visual Systems settings
        if (this.performanceManager && data.performanceManager) {
            this.performanceManager.setQuality(data.performanceManager.quality || 'auto');
        }
    }
}
