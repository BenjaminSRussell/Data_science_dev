/**
 * gameStore.js
 * Zustand store mirroring the persisted subset of game state.
 *
 * GameState (src/js/game/GameState.js) is the live source every gameplay
 * system writes; this store is only read at startup. Its fate is tracked in
 * #1035.
 */

// Vanilla store: the game reads getState()/setState()/subscribe() directly and
// never renders React, so the React-bound `zustand` entry isn't needed (#1872)
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { RANKS } from '../data/ranks.js';

/**
 * Derived values, recomputed as plain fields on every state change. They used
 * to be object getters, which Zustand's first set() flattened into frozen
 * values (#2261, #1033). Out-of-range rank indexes fall back to RANKS[0] like
 * GameState.currentRank does (#1613).
 */
export function deriveState(state) {
    const currentRank = RANKS[state.rankIndex] || RANKS[0];
    const nextRank = RANKS[state.rankIndex + 1] || null;
    let progressToNextRank = 100;
    if (nextRank) {
        const span = nextRank.repRequired - currentRank.repRequired;
        const progress = span > 0 ? ((state.reputation - currentRank.repRequired) / span) * 100 : 100;
        progressToNextRank = Math.min(100, Math.max(0, progress));
    }
    const averageRating = state.totalRatings > 0
        ? (state.ratingSum / state.totalRatings).toFixed(1)
        : 0;
    return { currentRank, nextRank, progressToNextRank, averageRating };
}

/** Recompute derived fields after every set()/setState() */
const withDerived = (config) => (set, get, api) => {
    const setDerived = (partial, replace) => set((state) => {
        const patch = typeof partial === 'function' ? partial(state) : partial;
        const next = replace ? { ...patch } : { ...state, ...patch };
        return replace ? { ...next, ...deriveState(next) } : { ...patch, ...deriveState(next) };
    }, replace);
    api.setState = setDerived;
    const initial = config(setDerived, get, api);
    return { ...initial, ...deriveState(initial) };
};

const defaultChartConfig = () => ({
    type: 'bar',
    palette: 'corporate',
    showLegend: true,
    showGrid: true,
    showDataLabels: false,
    title: ''
});

const initialData = () => ({
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
    currentLocation: 'home',
    bank: null,

    // Unlocked content
    unlockedChartTypes: ['bar', 'line', 'pie'],
    purchasedItems: [],
    unlockedThemes: ['default'],
    unlockedTools: [],
    unlockedPerks: [],
    unlockedLibraries: [],

    chartConfig: defaultChartConfig(),
    lastScore: null,

    // Game flags
    isGameStarted: false,
    tutorialCompleted: false,

    // Settings
    soundEnabled: true,
    musicEnabled: true,
    // No theme here: it's a device preference in localStorage (#1253)
    settings: {
        autoSave: true
    }
});

/**
 * One definition shared by the persisted store and the no-persist fallback,
 * so the fallback keeps purchase effects and software bonuses (#1032).
 */
const storeConfig = (set, get) => ({
    ...initialData(),

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
        } else if (item.type === 'perk') {
            const perkId = item.perkId || item.id;
            set((s) => {
                const perks = s.unlockedPerks || [];
                if (perks.includes(perkId)) return {};
                return { unlockedPerks: [...perks, perkId] };
            });
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
    reset: () => set({ ...initialData(), startTime: Date.now() })
});

const persistOptions = {
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
        totalSpent: state.totalSpent,
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
    }),
    // Rehydrated fields need fresh derived values too
    merge: (persisted, current) => {
        const next = { ...current, ...(persisted || {}) };
        return { ...next, ...deriveState(next) };
    }
};

let useGameStore;
try {
    useGameStore = createStore(persist(withDerived(storeConfig), persistOptions));
} catch (error) {
    // No persistence available (e.g. storage blocked): same store, in memory.
    // Debug overlays used to be injected into the page here and on every
    // load (#57); errors now only go to the console.
    console.error('gameStore: persistent store unavailable, using in-memory store:', error);
    useGameStore = createStore(withDerived(storeConfig));
}

export { useGameStore };
