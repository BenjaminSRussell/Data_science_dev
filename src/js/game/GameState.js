class GameState {
    constructor() {
        this.money = 100;
        this.reputation = 0;
        this.rankIndex = 0;
        this.rent = 500; // Initial rent
        this.bank = null; // Bank state
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

        // Sub-systems
        this.worldMap = new WorldMap(this);
        this.npcManager = new NPCManager(this);
        this.stockMarket = new StockMarket(this);
        this.projectSystem = new ProjectSystem(this);
        this.worldEventManager = new WorldEventManager(this);
        this.crimeSystem = new CrimeSystem(this);
        this.educationSystem = new EducationSystem(this);
        this.timeManager = new TimeManager(this);
        this.aiSystem = new AI(this);
        this.hardwareManager = new HardwareManager(this);
        this.characterStats = new CharacterStats(this);
        this.jobSystem = new JobSystem(this);
        this.contractSystem = new ContractSystem(this);
        this.mapProgressionSystem = new MapProgressionSystem(this);
        this.romanceSystem = new RomanceSystem(this);
        this.legalSystem = new LegalSystem(this);
        this.bankSystem = new BankSystem(this);
        this.visualProgressionSystem = new VisualProgressionSystem(this);
        this.realWorldTaskSystem = new RealWorldTaskSystem(this);
        this.aiTrainingStoryline = new AIStoryline(this);
        this.githubIssuesSystem = new GitHubIssuesSystem(this);
        this.researchPaperSystem = new ResearchPaperSystem(this);
        this.emotionalBreakdownSystem = new EmotionalBreakdownSystem(this);
        this.performanceManager = new PerformanceManager(this);
    }

    /**
     * Save state to JSON
     */
    toJSON() {
        return {
            money: this.money,
            reputation: this.reputation,
            rankIndex: this.rankIndex,
            rent: this.rent,
            bank: this.bank,
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

export default GameState;