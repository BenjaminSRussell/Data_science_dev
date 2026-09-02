import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { RANKS } from '../data/ranks.js'; // Assuming RANKS is defined in this file

let useGameStore;

try {
    useGameStore = create(
        persist(
            devtools(
                (set, get) => ({
                    money: 100,
                    reputation: 0,
                    rankIndex: 0,
                    rent: 500,
                    tasksCompleted: 0,
                    perfectScores: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                    weeklyIncome: 0,
                    startTime: Date.now(),
                    totalRatings: 0,
                    ratingSum: 0,
                    currentTask: null,
                    currentLocation: 'apartment',
                    bank: null,
                    unlockedChartTypes: ['bar', 'line', 'pie'],
                    purchasedItems: [],
                    unlockedThemes: ['default'],
                    unlockedTools: [],
                    unlockedLibraries: [],
                    chartConfig: {
                        type: 'bar',
                        palette: 'corporate',
                        showLegend: true,
                        showGrid: true,
                        showDataLabels: false,
                        title: ''
                    },
                    lastScore: null,
                    isGameStarted: false,
                    tutorialCompleted: false,
                    soundEnabled: true,
                    musicEnabled: true,
                    settings: {
                        soundEnabled: true,
                        autoSave: true,
                        theme: 'dark'
                    },
                    get currentRank() { return RANKS[get().rankIndex]; },
                    get nextRank() { return RANKS[get().rankIndex + 1] || null; },
                    get progressToNextRank() {
                        const state = get();
                        if (!state.nextRank) return 100;
                        const currentReq = state.currentRank.repRequired;
                        const nextReq = state.nextRank.repRequired;
                        const progress = ((state.reputation - currentReq) / (nextReq - currentReq)) * 100;
                        return Math.min(100, Math.max(0, progress));
                    },
                    get averageRating() {
                        const state = get();
                        if (state.totalRatings === 0) return 0;
                        return (state.ratingSum / state.totalRatings).toFixed(1);
                    },
                    setMoney: (amount) => set({ money: amount }),
                    addMoney: (amount) => set((state) => ({ money: state.money + amount })),
                    subtractMoney: (amount) => set((state) => ({ money: Math.max(0, state.money - amount) })),
                    setReputation: (amount) => set({ reputation: amount }),
                    addReputation: (amount) => set((state) => ({ reputation: state.reputation + amount })),
                    setRankIndex: (index) => set({ rankIndex: index }),
                    incrementRank: () => set((state) => ({ rankIndex: Math.min(state.rankIndex + 1, RANKS.length - 1) })),
                    setCurrentTask: (task) => set({ currentTask: task }),
                    setCurrentLocation: (location) => set({ currentLocation: location }),
                    setBank: (bankData) => set({ bank: bankData }),
                    unlockChartType: (type) => set((state) => {
                        if (!state.unlockedChartTypes.includes(type)) {
                            return { unlockedChartTypes: [...state.unlockedChartTypes, type] };
                        }
                        return state;
                    }),
                    isChartTypeUnlocked: () => true,
                    canAfford: (price) => get().money >= price,
                    purchaseItem: (item) => {
                        const state = get();
                        if (!state.canAfford(item.price)) return false;
                        if (state.purchasedItems.includes(item.id)) return false;
                        set({
                            money: state.money - item.price,
                            purchasedItems: [...state.purchasedItems, item.id]
                        });
                        if (item.type === 'chart') {
                            set((state) => ({ unlockedChartTypes: [...state.unlockedChartTypes, item.chartType] }));
                        } else if (item.type === 'tool') {
                            set((state) => ({ unlockedTools: [...state.unlockedTools, item.toolId] }));
                        }
                        return true;
                    },
                    incrementTasksCompleted: () => set((state) => ({ tasksCompleted: state.tasksCompleted + 1 })),
                    incrementPerfectScores: () => set((state) => ({ perfectScores: state.perfectScores + 1 })),
                    addToTotalEarned: (amount) => set((state) => ({ totalEarned: state.totalEarned + amount })),
                    addToTotalSpent: (amount) => set((state) => ({ totalSpent: state.totalSpent + amount })),
                    addRating: (rating) => set((state) => ({
                        totalRatings: state.totalRatings + 1,
                        ratingSum: state.ratingSum + rating
                    })),
                    setLastScore: (score) => set({ lastScore: score }),
                    setGameStarted: (started) => set({ isGameStarted: started }),
                    setTutorialCompleted: (completed) => set({ tutorialCompleted: completed }),
                    setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
                    setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
                    updateSettings: (newSettings) => set((state) => ({
                        settings: { ...state.settings, ...newSettings }
                    })),
                    updateChartConfig: (config) => set((state) => ({
                        chartConfig: { ...state.chartConfig, ...config }
                    })),
                    getSoftwareQualityMultiplier: () => ({
                        visualClarity: 1.0,
                        dataAccuracy: 1.0,
                        chartAppropriateness: 1.0,
                        speedBonus: 0
                    }),
                    reset: () => set({
                        money: 100,
                        reputation: 0,
                        rankIndex: 0,
                        rent: 500,
                        tasksCompleted: 0,
                        perfectScores: 0,
                        totalEarned: 0,
                        totalSpent: 0,
                        weeklyIncome: 0,
                        startTime: Date.now(),
                        totalRatings: 0,
                        ratingSum: 0,
                        currentTask: null,
                        currentLocation: 'apartment',
                        bank: null,
                        unlockedChartTypes: ['bar', 'line', 'pie'],
                        purchasedItems: [],
                        unlockedThemes: ['default'],
                        unlockedTools: [],
                        unlockedLibraries: [],
                        chartConfig: {
                            type: 'bar',
                            palette: 'corporate',
                            showLegend: true,
                            showGrid: true,
                            showDataLabels: false,
                            title: ''
                        },
                        lastScore: null,
                        isGameStarted: false,
                        tutorialCompleted: false,
                        soundEnabled: true,
                        musicEnabled: true,
                        settings: {
                            soundEnabled: true,
                            autoSave: true,
                            theme: 'dark'
                        }
                    })
                })
            ),
            {
                name: 'game-storage',
                partialize: (state) => ({
                    money: state.money,
                    reputation: state.reputation,
                    rankIndex: state.rankIndex,
                    rent: state.rent,
                    tasksCompleted: state.tasksCompleted,
                    perfectScores: state.perfectScores,
                    totalEarned: state.totalEarned,
                    weeklyIncome: state.weeklyIncome,
                    bank: state.bank,
                    unlockedChartTypes: state.unlockedChartTypes,
                    purchasedItems: state.purchasedItems,
                    unlockedTools: state.unlockedTools,
                    unlockedLibraries: state.unlockedLibraries
                })
            }
        )
    );
} catch (error) {
    // #region agent log
    if (typeof document !== 'undefined') {
        const errDiv = document.createElement('div');
        errDiv.style.cssText = 'position:absolute;top:0;left:0;width:100%;background:rgba(255,0,0,0.9);color:white;z-index:99999;padding:20px;font-family:monospace;white-space:pre-wrap;overflow:auto;';
        errDiv.innerHTML = `<h1>CRITICAL: Zustand Store Creation Failed</h1><h3>${error.message}</h3><pre>${error.stack}</pre>`;
        document.body.appendChild(errDiv);
    }
    // #endregion
    // Create a fallback store without persist

    useGameStore = create((set, get) => ({
        money: 100,
        reputation: 0,
        rankIndex: 0,
        rent: 500,
        tasksCompleted: 0,
        perfectScores: 0,
        totalEarned: 0,
        totalSpent: 0,
        weeklyIncome: 0,
        startTime: Date.now(),
        totalRatings: 0,
        ratingSum: 0,
        currentTask: null,
        currentLocation: 'apartment',
        bank: null,
        unlockedChartTypes: ['bar', 'line', 'pie'],
        purchasedItems: [],
        unlockedThemes: ['default'],
        unlockedTools: [],
        unlockedLibraries: [],
        chartConfig: {
            type: 'bar',
            palette: 'corporate',
            showLegend: true,
            showGrid: true,
            showDataLabels: false,
            title: ''
        },
        lastScore: null,
        isGameStarted: false,
        tutorialCompleted: false,
        soundEnabled: true,
        musicEnabled: true,
        settings: {
            soundEnabled: true,
            autoSave: true,
            theme: 'dark'
        },
        get currentRank() { return RANKS[get().rankIndex]; },
        get nextRank() { return RANKS[get().rankIndex + 1] || null; },
        get progressToNextRank() {
            const state = get();
            if (!state.nextRank) return 100;
            const currentReq = state.currentRank.repRequired;
            const nextReq = state.nextRank.repRequired;
            const progress = ((state.reputation - currentReq) / (nextReq - currentReq)) * 100;
            return Math.min(100, Math.max(0, progress));
        },
        get averageRating() {
            const state = get();
            if (state.totalRatings === 0) return 0;
            return (state.ratingSum / state.totalRatings).toFixed(1);
        },
        setMoney: (amount) => set({ money: amount }),
        addMoney: (amount) => set((state) => ({ money: state.money + amount })),
        subtractMoney: (amount) => set((state) => ({ money: Math.max(0, state.money - amount) })),
        setReputation: (amount) => set({ reputation: amount }),
        addReputation: (amount) => set((state) => ({ reputation: state.reputation + amount })),
        setRankIndex: (index) => set({ rankIndex: index }),
        incrementRank: () => set((state) => ({ rankIndex: Math.min(state.rankIndex + 1, RANKS.length - 1) })),
        setCurrentTask: (task) => set({ currentTask: task }),
        setCurrentLocation: (location) => set({ currentLocation: location }),
        setBank: (bankData) => set({ bank: bankData }),
        unlockChartType: (type) => set((state) => {
            if (!state.unlockedChartTypes.includes(type)) {
                return { unlockedChartTypes: [...state.unlockedChartTypes, type] };
            }
            return state;
        }),
        isChartTypeUnlocked: () => true,
        canAfford: (price) => get().money >= price,
        purchaseItem: (item) => {
            const state = get();
            if (!state.canAfford(item.price)) return false;
            if (state.purchasedItems.includes(item.id)) return false;
            set({
                money: state.money - item.price,
                purchasedItems: [...state.purchasedItems, item.id]
            });
            if (item.type === 'chart') {
                set((state) => ({ unlockedChartTypes: [...state.unlockedChartTypes, item.chartType] }));
            } else if (item.type === 'tool') {
                set((state) => ({ unlockedTools: [...state.unlockedTools, item.toolId] }));
            }
            return true;
        },
        incrementTasksCompleted: () => set((state) => ({ tasksCompleted: state.tasksCompleted + 1 })),
        incrementPerfectScores: () => set((state) => ({ perfectScores: state.perfectScores + 1 })),
        addToTotalEarned: (amount) => set((state) => ({ totalEarned: state.totalEarned + amount })),
        addToTotalSpent: (amount) => set((state) => ({ totalSpent: state.totalSpent + amount })),
        addRating: (rating) => set((state) => ({
            totalRatings: state.totalRatings + 1,
            ratingSum: state.ratingSum + rating
        })),
        setLastScore: (score) => set({ lastScore: score }),
        setGameStarted: (started) => set({ isGameStarted: started }),
        setTutorialCompleted: (completed) => set({ tutorialCompleted: completed }),
        setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
        setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
        updateSettings: (newSettings) => set((state) => ({
            settings: { ...state.settings, ...newSettings }
        })),
        updateChartConfig: (config) => set((state) => ({
            chartConfig: { ...state.chartConfig, ...config }
        })),
        getSoftwareQualityMultiplier: () => ({
            visualClarity: 1.0,
            dataAccuracy: 1.0,
            chartAppropriateness: 1.0,
            speedBonus: 0
        }),
        reset: () => set({
            money: 100,
            reputation: 0,
            rankIndex: 0,
            rent: 500,
            tasksCompleted: 0,
            perfectScores: 0,
            totalEarned: 0,
            totalSpent: 0,
            weeklyIncome: 0,
            startTime: Date.now(),
            totalRatings: 0,
            ratingSum: 0,
            currentTask: null,
            currentLocation: 'apartment',
            bank: null,
            unlockedChartTypes: ['bar', 'line', 'pie'],
            purchasedItems: [],
            unlockedThemes: ['default'],
            unlockedTools: [],
            unlockedLibraries: [],
            chartConfig: {
                type: 'bar',
                palette: 'corporate',
                showLegend: true,
                showGrid: true,
                showDataLabels: false,
                title: ''
            },
            lastScore: null,
            isGameStarted: false,
            tutorialCompleted: false,
            soundEnabled: true,
            musicEnabled: true,
            settings: {
                soundEnabled: true,
                autoSave: true,
                theme: 'dark'
            }
        })
    }));
}

export default useGameStore;