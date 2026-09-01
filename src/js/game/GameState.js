import { CHART_TYPES } from '../data/chartTypes.js';

class GameState {
    constructor() {
        this.money = 100;
        this.reputation = 0;
        this.rankIndex = 0;
        this.rent = 500;
        this.bank = null;
        this.tasksCompleted = 0;
        this.perfectScores = 0;
        this.totalEarned = 0;
        this.weeklyIncome = 0;
        this.totalRatings = 0;
        this.ratingSum = 0;
        this.unlockedChartTypes = ['bar', 'line', 'pie'];
        this.unlockedTools = [];
        this.purchasedItems = [];
        this.isGameStarted = false;
        this.tutorialCompleted = false;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.unlockedLibraries = [];

        // Initialize sub-systems
        this.worldMap = null;
        this.npcManager = null;
        this.stockMarket = null;
        this.projectSystem = null;
        this.worldEventManager = null;
        this.crimeSystem = null;
        this.educationSystem = null;
        this.timeManager = null;
        this.aiSystem = null;
        this.hardwareManager = null;
        this.characterStats = null;
        this.jobSystem = null;
        this.contractSystem = null;
        this.mapProgressionSystem = null;
        this.romanceSystem = null;
        this.legalSystem = null;
        this.bankSystem = null;
        this.visualProgressionSystem = null;
        this.realWorldTaskSystem = null;
        this.aiTrainingStoryline = null;
        this.githubIssuesSystem = null;
        this.researchPaperSystem = null;
        this.emotionalBreakdownSystem = null;
        this.performanceManager = null;
    }

    // Other methods and logic remain unchanged
}

export { GameState };