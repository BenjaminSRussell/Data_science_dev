/**
 * gameStore.js
 * Zustand store for game state management
 * Phase 4: Replaces custom GameState class
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RANKS } from '../data/ranks.js';

// #region agent log


// Display visible debug info on page (wait for DOM)
if (typeof document !== 'undefined') {
    const showDebug = () => {
        if (document.body) {
            const debugDiv = document.createElement('div');
            debugDiv.id = 'debug-store-info';
            debugDiv.style.cssText = 'position:fixed;top:50px;right:10px;background:rgba(0,0,0,0.8);color:#a78bfa;padding:10px;font-family:monospace;font-size:12px;z-index:99999;border:2px solid #a78bfa;border-radius:5px;max-width:300px;';
            debugDiv.innerHTML = 'gameStore.js loading...';
            document.body.appendChild(debugDiv);
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

// Check localStorage availability
try {
    if (typeof localStorage === 'undefined') {
        console.error('[DEBUG] localStorage is not available!');
        if (typeof document !== 'undefined') {
            const errDiv = document.getElementById('debug-store-info');
            if (errDiv) errDiv.innerHTML = 'localStorage unavailable!';
        }
    } else {

    }
} catch (e) {
    console.error('[DEBUG] Error checking localStorage:', e);
}
// #endregion

let useGameStore;
try {

    useGameStore = create(
        persist(
            (set, get) => ({
                // Player stats
                money: 100,
                reputation: 0,
                rankIndex: 0,
                rent: 500, // Weekly rent

                // Progress tracking
                tasksCompleted: 0,
                perfectScores: 0,
                totalEarned: 0,
                totalSpent: 0,
                weeklyIncome: 0,
                startTime: Date.now(),
                totalRatings: 0,
                ratingSum: 0,

                // Current state
                currentTask: null,
                currentLocation: 'apartment',
                bank: null,

                // Unlocked content
                unlockedChartTypes: ['bar', 'line', 'pie'],
                purchasedItems: [],
                unlockedThemes: ['default'],
                unlockedTools: [],
                unlockedLibraries: [],

                // Game configuration
                chartConfig: {
                    type: 'bar',
                    palette: 'corporate',
                    showLegend: true,
                    showGrid: true,
                    showDataLabels: false,
                    title: ''
                },

                lastScore: null,

                // Game flags
                isGameStarted: false,
                tutorialCompleted: false,

                // Settings
                soundEnabled: true,
                musicEnabled: true,
                settings: {
                    soundEnabled: true,
                    autoSave: true,
                    theme: 'dark'
                },

                // Computed values (getters)
                get currentRank() {
                    return RANKS[get().rankIndex];
                },

                get nextRank() {
                    return RANKS[get().rankIndex + 1] || null;
                },

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

                // Actions
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

                isChartTypeUnlocked: (type) => {
                    // Liberalization: All charts unlocked by default!
                    return true;
                },

                canAfford: (price) => {
                    return get().money >= price;
                },

                purchaseItem: (item) => {
                    const state = get();
                    if (!state.canAfford(item.price)) return false;
                    if (state.purchasedItems.includes(item.id)) return false;

                    set({
                        money: state.money - item.price,
                        purchasedItems: [...state.purchasedItems, item.id]
                    });

                    // Apply item effect
                    if (item.type === 'chart') {
                        get().unlockChartType(item.chartType);
                    } else if (item.type === 'tool') {
                        set((s) => ({
                            unlockedTools: [...s.unlockedTools, item.toolId]
                        }));
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

                // Get software quality multiplier
                getSoftwareQualityMultiplier: () => {
                    const state = get();
                    const multipliers = {
                        visualClarity: 1.0,
                        dataAccuracy: 1.0,
                        chartAppropriateness: 1.0,
                        speedBonus: 0
                    };

                    if (state.purchasedItems.includes('soft_ide_pro')) {
                        multipliers.visualClarity += 0.05;
                        multipliers.dataAccuracy += 0.03;
                    }
                    if (state.purchasedItems.includes('soft_automl')) {
                        multipliers.speedBonus += 0.10;
                        multipliers.chartAppropriateness += 0.03;
                    }
                    if (state.purchasedItems.includes('soft_cloud_basic')) {
                        multipliers.dataAccuracy += 0.05;
                        multipliers.speedBonus += 0.05;
                    }
                    if (state.purchasedItems.includes('soft_enterprise_db')) {
                        multipliers.dataAccuracy += 0.08;
                        multipliers.chartAppropriateness += 0.02;
                    }
                    if (state.purchasedItems.includes('soft_neural_arch')) {
                        multipliers.visualClarity += 0.10;
                        multipliers.chartAppropriateness += 0.08;
                        multipliers.dataAccuracy += 0.05;
                    }

                    return multipliers;
                },

                // Reset game state
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
            }),
            {
                name: 'game-storage',
                // Only persist certain fields (exclude system references)
                partialize: (state) => ({
                    money: state.money,
                    reputation: state.reputation,
                    rankIndex: state.rankIndex,
                    rent: state.rent,
                    bank: state.bank,
                    tasksCompleted: state.tasksCompleted,
                    perfectScores: state.perfectScores,
                    totalEarned: state.totalEarned,
                    weeklyIncome: state.weeklyIncome,
                    totalRatings: state.totalRatings,
                    ratingSum: state.ratingSum,
                    unlockedChartTypes: state.unlockedChartTypes,
                    unlockedTools: state.unlockedTools,
                    purchasedItems: state.purchasedItems,
                    isGameStarted: state.isGameStarted,
                    tutorialCompleted: state.tutorialCompleted,
                    soundEnabled: state.soundEnabled,
                    musicEnabled: state.musicEnabled,
                    unlockedLibraries: state.unlockedLibraries
                })
            }
        )
    );

    // #region agent log
    if (typeof document !== 'undefined') {
        const debugDiv = document.getElementById('debug-store-info');
        if (debugDiv) debugDiv.innerHTML = ' Zustand store created';
    }
    // #endregion
} catch (error) {
    console.error('[DEBUG] CRITICAL: Failed to create Zustand store:', error);
    console.error('[DEBUG] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
    });
    // #region agent log
    if (typeof document !== 'undefined') {
        const debugDiv = document.getElementById('debug-store-info');
        if (debugDiv) {
            debugDiv.style.borderColor = '#f00';
            debugDiv.style.color = '#f00';
            debugDiv.innerHTML = `Store creation failed: ${error.message}`;
        }
        // Also show error on page
        const errDiv = document.createElement('div');
        errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,0,0,0.9);color:white;z-index:99999;padding:20px;font-family:monospace;white-space:pre-wrap;overflow:auto;';
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

            // Apply item effect
            if (item.type === 'chart') {
                get().unlockChartType(item.chartType);
            } else if (item.type === 'tool') {
                set((s) => ({
                    unlockedTools: [...s.unlockedTools, item.toolId]
                }));
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
        getSoftwareQualityMultiplier: () => {
            const state = get();
            const multipliers = {
                visualClarity: 1.0,
                dataAccuracy: 1.0,
                chartAppropriateness: 1.0,
                speedBonus: 0
            };

            if (state.purchasedItems.includes('soft_ide_pro')) {
                multipliers.visualClarity += 0.05;
                multipliers.dataAccuracy += 0.03;
            }
            if (state.purchasedItems.includes('soft_automl')) {
                multipliers.speedBonus += 0.10;
                multipliers.chartAppropriateness += 0.03;
            }
            if (state.purchasedItems.includes('soft_cloud_basic')) {
                multipliers.dataAccuracy += 0.05;
                multipliers.speedBonus += 0.05;
            }
            if (state.purchasedItems.includes('soft_enterprise_db')) {
                multipliers.dataAccuracy += 0.08;
                multipliers.chartAppropriateness += 0.02;
            }
            if (state.purchasedItems.includes('soft_neural_arch')) {
                multipliers.visualClarity += 0.10;
                multipliers.chartAppropriateness += 0.08;
                multipliers.dataAccuracy += 0.05;
            }

            return multipliers;
        },
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

    // #region agent log
    if (typeof document !== 'undefined') {
        const debugDiv = document.getElementById('debug-store-info');
        if (debugDiv) {
            debugDiv.style.borderColor = '#ff0';
            debugDiv.style.color = '#ff0';
            debugDiv.innerHTML = ' Using fallback store (no persist)';
        }
    }
    // #endregion
}

export { useGameStore };
