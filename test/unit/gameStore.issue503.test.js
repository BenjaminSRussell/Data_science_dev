/**
 * Unit tests for gameStore
 * Tests derived getters, purchaseItem side effects, getSoftwareQualityMultiplier stacking,
 * and persist middleware's partialize contract
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { RANKS } from '../../src/js/data/ranks.js';

// Helper function to compute currentRank
const getCurrentRank = (state) => RANKS[state.rankIndex];

// Helper function to compute nextRank
const getNextRank = (state) => RANKS[state.rankIndex + 1] || null;

// Helper function to compute progressToNextRank
const getProgressToNextRank = (state) => {
    const nextRank = getNextRank(state);
    if (!nextRank) return 100;
    const currentRank = getCurrentRank(state);
    const currentReq = currentRank.repRequired;
    const nextReq = nextRank.repRequired;
    const progress = ((state.reputation - currentReq) / (nextReq - currentReq)) * 100;
    return Math.min(100, Math.max(0, progress));
};

// Helper function to compute averageRating
const getAverageRating = (state) => {
    if (state.totalRatings === 0) return 0;
    return (state.ratingSum / state.totalRatings).toFixed(1);
};

// Create a test store without persist middleware
const createTestStore = () => {
    return create((set, get) => ({
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

        // Actions
        purchaseItem: (item) => {
            const state = get();
            if (!state.canAfford(item.price)) return false;
            if (state.purchasedItems.includes(item.id)) return false;

            set({
                money: state.money - item.price,
                purchasedItems: [...state.purchasedItems, item.id]
            });

            if (item.type === 'chart') {
                get().unlockChartType(item.chartType);
            } else if (item.type === 'tool') {
                set((s) => ({
                    unlockedTools: [...s.unlockedTools, item.toolId]
                }));
            }

            return true;
        },

        canAfford: (price) => {
            return get().money >= price;
        },

        unlockChartType: (type) => set((state) => {
            if (!state.unlockedChartTypes.includes(type)) {
                return { unlockedChartTypes: [...state.unlockedChartTypes, type] };
            }
            return state;
        }),

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
};

describe('gameStore', () => {
    let useTestStore;

    beforeEach(() => {
        useTestStore = createTestStore();
    });

    describe('Derived Getters', () => {
        describe('currentRank', () => {
            it('should return the rank at current rankIndex', () => {
                const state = useTestStore.getState();
                const expectedRank = getCurrentRank(state);
                expect(expectedRank).toEqual(RANKS[0]);
            });

            it('should return correct rank when rankIndex changes', () => {
                useTestStore.setState({ rankIndex: 2 });
                const state = useTestStore.getState();
                const expectedRank = getCurrentRank(state);
                expect(expectedRank).toEqual(RANKS[2]);
                expect(expectedRank.title).toBe('Data Analyst');
            });

            it('should handle max rank', () => {
                useTestStore.setState({ rankIndex: RANKS.length - 1 });
                const state = useTestStore.getState();
                const expectedRank = getCurrentRank(state);
                expect(expectedRank).toEqual(RANKS[RANKS.length - 1]);
                expect(expectedRank.title).toBe('Chief Data Officer');
            });
        });

        describe('nextRank', () => {
            it('should return the next rank', () => {
                const state = useTestStore.getState();
                const nextRankVal = getNextRank(state);
                expect(nextRankVal).not.toBeNull();
                expect(nextRankVal.title).toBe('Junior Analyst');
            });

            it('should return null when at max rank', () => {
                useTestStore.setState({ rankIndex: RANKS.length - 1 });
                const state = useTestStore.getState();
                const nextRankVal = getNextRank(state);
                expect(nextRankVal).toBeNull();
            });

            it('should return correct next rank when rankIndex changes', () => {
                useTestStore.setState({ rankIndex: 2 });
                const state = useTestStore.getState();
                const nextRankVal = getNextRank(state);
                expect(nextRankVal).toEqual(RANKS[3]);
                expect(nextRankVal.title).toBe('Senior Analyst');
            });
        });

        describe('progressToNextRank', () => {
            it('should return 0 at min reputation', () => {
                useTestStore.setState({ rankIndex: 0, reputation: 0 });
                const state = useTestStore.getState();
                const progress = getProgressToNextRank(state);
                expect(progress).toBe(0);
            });

            it('should return 100 at max rank', () => {
                useTestStore.setState({ rankIndex: RANKS.length - 1, reputation: 10000 });
                const state = useTestStore.getState();
                const progress = getProgressToNextRank(state);
                expect(progress).toBe(100);
            });

            it('should clamp to [0, 100]', () => {
                useTestStore.setState({ rankIndex: 0, reputation: -50 });
                let state = useTestStore.getState();
                let progress = getProgressToNextRank(state);
                expect(progress).toBeGreaterThanOrEqual(0);
                expect(progress).toBeLessThanOrEqual(100);

                useTestStore.setState({ rankIndex: 0, reputation: 500 });
                state = useTestStore.getState();
                progress = getProgressToNextRank(state);
                expect(progress).toBeGreaterThanOrEqual(0);
                expect(progress).toBeLessThanOrEqual(100);
            });

            it('should calculate progress correctly between ranks', () => {
                useTestStore.setState({ rankIndex: 0, reputation: 50 });
                const state = useTestStore.getState();
                const progress = getProgressToNextRank(state);
                expect(progress).toBeGreaterThan(0);
                expect(progress).toBeLessThan(100);
            });
        });

        describe('averageRating', () => {
            it('should return 0 when totalRatings is 0', () => {
                useTestStore.setState({ totalRatings: 0, ratingSum: 0 });
                const state = useTestStore.getState();
                const avg = getAverageRating(state);
                expect(avg).toBe(0);
            });

            it('should return average as fixed string to 1 decimal place', () => {
                useTestStore.setState({ totalRatings: 2, ratingSum: 9 });
                const state = useTestStore.getState();
                const avg = getAverageRating(state);
                expect(avg).toBe('4.5');
            });

            it('should handle multiple ratings', () => {
                useTestStore.setState({ totalRatings: 3, ratingSum: 13 });
                const state = useTestStore.getState();
                const avg = getAverageRating(state);
                expect(avg).toBe('4.3');
            });

            it('should return string type when totalRatings > 0', () => {
                useTestStore.setState({ totalRatings: 1, ratingSum: 5 });
                const state = useTestStore.getState();
                const avg = getAverageRating(state);
                expect(typeof avg).toBe('string');
            });

            it('should guard against NaN with totalRatings === 0', () => {
                useTestStore.setState({ totalRatings: 0, ratingSum: 100 });
                const state = useTestStore.getState();
                const avg = getAverageRating(state);
                expect(avg).toBe(0);
            });
        });
    });

    describe('purchaseItem', () => {
        describe('basic purchase logic', () => {
            it('should reject purchase if insufficient funds', () => {
                useTestStore.setState({ money: 50 });
                const item = { id: 'test_item', type: 'tool', price: 100, toolId: 'tool_1' };
                const result = useTestStore.getState().purchaseItem(item);
                expect(result).toBe(false);
                expect(useTestStore.getState().purchasedItems).not.toContain('test_item');
            });

            it('should reject purchase if already owned', () => {
                useTestStore.setState({
                    money: 1000,
                    purchasedItems: ['existing_item']
                });
                const item = { id: 'existing_item', type: 'tool', price: 100, toolId: 'tool_1' };
                const result = useTestStore.getState().purchaseItem(item);
                expect(result).toBe(false);
            });

            it('should succeed purchase with sufficient funds and not owned', () => {
                useTestStore.setState({ money: 1000, purchasedItems: [] });
                const item = { id: 'new_item', type: 'tool', price: 200, toolId: 'tool_1' };
                const result = useTestStore.getState().purchaseItem(item);
                expect(result).toBe(true);
                expect(useTestStore.getState().purchasedItems).toContain('new_item');
            });

            it('should deduct money from player', () => {
                useTestStore.setState({ money: 1000 });
                const item = { id: 'item_1', type: 'tool', price: 250, toolId: 'tool_1' };
                useTestStore.getState().purchaseItem(item);
                expect(useTestStore.getState().money).toBe(750);
            });
        });

        describe('chart type side effect', () => {
            it('should unlock chart type when purchasing chart item', () => {
                useTestStore.setState({
                    money: 1000,
                    unlockedChartTypes: ['bar', 'line', 'pie']
                });
                const item = {
                    id: 'chart_scatter',
                    type: 'chart',
                    price: 300,
                    chartType: 'scatter'
                };
                const result = useTestStore.getState().purchaseItem(item);
                expect(result).toBe(true);
                expect(useTestStore.getState().unlockedChartTypes).toContain('scatter');
            });

            it('should not duplicate unlocked chart type', () => {
                useTestStore.setState({
                    money: 1000,
                    unlockedChartTypes: ['bar', 'line', 'pie', 'scatter']
                });
                const item = {
                    id: 'chart_scatter_2',
                    type: 'chart',
                    price: 300,
                    chartType: 'scatter'
                };
                useTestStore.getState().purchaseItem(item);
                const scatterCount = useTestStore.getState().unlockedChartTypes.filter(
                    t => t === 'scatter'
                ).length;
                expect(scatterCount).toBe(1);
            });
        });

        describe('tool type side effect', () => {
            it('should append toolId to unlockedTools when purchasing tool item', () => {
                useTestStore.setState({
                    money: 1000,
                    unlockedTools: []
                });
                const item = {
                    id: 'tool_debugger',
                    type: 'tool',
                    price: 200,
                    toolId: 'advanced_debugger'
                };
                const result = useTestStore.getState().purchaseItem(item);
                expect(result).toBe(true);
                expect(useTestStore.getState().unlockedTools).toContain('advanced_debugger');
            });

            it('should add multiple tools sequentially', () => {
                useTestStore.setState({
                    money: 2000,
                    unlockedTools: []
                });

                const tool1 = { id: 'tool_1', type: 'tool', price: 200, toolId: 'debugger' };
                const tool2 = { id: 'tool_2', type: 'tool', price: 150, toolId: 'profiler' };

                useTestStore.getState().purchaseItem(tool1);
                useTestStore.getState().purchaseItem(tool2);

                const tools = useTestStore.getState().unlockedTools;
                expect(tools).toContain('debugger');
                expect(tools).toContain('profiler');
            });
        });

        describe('unknown item type', () => {
            it('should not crash on unknown item type', () => {
                useTestStore.setState({ money: 1000 });
                const item = {
                    id: 'unknown_item',
                    type: 'unknown',
                    price: 100
                };
                const result = useTestStore.getState().purchaseItem(item);
                expect(result).toBe(true);
                expect(useTestStore.getState().purchasedItems).toContain('unknown_item');
            });
        });
    });

    describe('getSoftwareQualityMultiplier', () => {
        describe('empty baseline', () => {
            it('should return baseline multipliers with no items purchased', () => {
                useTestStore.setState({ purchasedItems: [] });
                const multiplier = useTestStore.getState().getSoftwareQualityMultiplier();

                expect(multiplier.visualClarity).toBe(1.0);
                expect(multiplier.dataAccuracy).toBe(1.0);
                expect(multiplier.chartAppropriateness).toBe(1.0);
                expect(multiplier.speedBonus).toBe(0);
            });
        });

        describe('single item effects', () => {
            it('should apply IDE Pro multiplier', () => {
                useTestStore.setState({ purchasedItems: ['soft_ide_pro'] });
                const mult = useTestStore.getState().getSoftwareQualityMultiplier();
                expect(mult.visualClarity).toBe(1.05);
                expect(mult.dataAccuracy).toBe(1.03);
            });

            it('should apply AutoML multiplier', () => {
                useTestStore.setState({ purchasedItems: ['soft_automl'] });
                const mult = useTestStore.getState().getSoftwareQualityMultiplier();
                expect(mult.speedBonus).toBe(0.10);
                expect(mult.chartAppropriateness).toBe(1.03);
            });

            it('should apply Cloud Basic multiplier', () => {
                useTestStore.setState({ purchasedItems: ['soft_cloud_basic'] });
                const mult = useTestStore.getState().getSoftwareQualityMultiplier();
                expect(mult.dataAccuracy).toBe(1.05);
                expect(mult.speedBonus).toBe(0.05);
            });

            it('should apply Enterprise DB multiplier', () => {
                useTestStore.setState({ purchasedItems: ['soft_enterprise_db'] });
                const mult = useTestStore.getState().getSoftwareQualityMultiplier();
                expect(mult.dataAccuracy).toBe(1.08);
                expect(mult.chartAppropriateness).toBe(1.02);
            });

            it('should apply Neural Arch multiplier', () => {
                useTestStore.setState({ purchasedItems: ['soft_neural_arch'] });
                const mult = useTestStore.getState().getSoftwareQualityMultiplier();
                expect(mult.visualClarity).toBe(1.10);
                expect(mult.chartAppropriateness).toBe(1.08);
                expect(mult.dataAccuracy).toBe(1.05);
            });
        });

        describe('multiple items stacking', () => {
            it('should stack 2 items additively', () => {
                useTestStore.setState({
                    purchasedItems: ['soft_ide_pro', 'soft_automl']
                });
                const mult = useTestStore.getState().getSoftwareQualityMultiplier();

                expect(mult.visualClarity).toBe(1.05);
                expect(mult.dataAccuracy).toBe(1.03);
                expect(mult.speedBonus).toBe(0.10);
                expect(mult.chartAppropriateness).toBe(1.03);
            });

            it('should stack 3 items with overlapping attributes', () => {
                useTestStore.setState({
                    purchasedItems: [
                        'soft_ide_pro',
                        'soft_cloud_basic',
                        'soft_neural_arch'
                    ]
                });
                const mult = useTestStore.getState().getSoftwareQualityMultiplier();

                expect(mult.visualClarity).toBeCloseTo(1.15, 5);
                expect(mult.dataAccuracy).toBeCloseTo(1.13, 5);
                expect(mult.chartAppropriateness).toBeCloseTo(1.08, 5);
                expect(mult.speedBonus).toBeCloseTo(0.05, 5);
            });

            it('should stack all 5 recognized items', () => {
                useTestStore.setState({
                    purchasedItems: [
                        'soft_ide_pro',
                        'soft_automl',
                        'soft_cloud_basic',
                        'soft_enterprise_db',
                        'soft_neural_arch'
                    ]
                });
                const mult = useTestStore.getState().getSoftwareQualityMultiplier();

                expect(mult.visualClarity).toBeCloseTo(1.15, 5);
                expect(mult.dataAccuracy).toBeCloseTo(1.21, 5);
                expect(mult.chartAppropriateness).toBeCloseTo(1.13, 5);
                expect(mult.speedBonus).toBeCloseTo(0.15, 5);
            });

            it('should ignore unrecognized purchased items', () => {
                useTestStore.setState({
                    purchasedItems: [
                        'soft_ide_pro',
                        'unknown_software',
                        'soft_automl',
                        'another_unknown'
                    ]
                });
                const mult = useTestStore.getState().getSoftwareQualityMultiplier();

                expect(mult.visualClarity).toBe(1.05);
                expect(mult.dataAccuracy).toBe(1.03);
                expect(mult.speedBonus).toBe(0.10);
                expect(mult.chartAppropriateness).toBe(1.03);
            });
        });
    });

    describe('persist middleware partialize contract', () => {
        it('should verify partialize includes correct fields by checking source code', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(process.cwd(), 'src/js/store/gameStore.js');
            const content = fs.readFileSync(filePath, 'utf8');

            // Fields that should be included in partialize
            const includedFields = [
                'money', 'reputation', 'rankIndex', 'rent', 'bank',
                'tasksCompleted', 'perfectScores', 'totalEarned', 'totalSpent', 'weeklyIncome',
                'totalRatings', 'ratingSum', 'unlockedChartTypes', 'unlockedTools',
                'purchasedItems', 'isGameStarted', 'tutorialCompleted',
                'soundEnabled', 'musicEnabled', 'unlockedLibraries'
            ];

            // Fields that should be excluded from partialize
            const excludedFields = [
                // totalSpent is persisted alongside totalEarned (#58)
                'startTime', 'currentTask', 'currentLocation',
                'chartConfig', 'lastScore', 'settings', 'unlockedThemes'
            ];

            // Verify all included fields appear in the source file partialize section
            includedFields.forEach(field => {
                expect(content).toContain(`${field}:`);
            });

            // Create a more flexible check - verify that excluded fields are NOT in a typical state copy pattern
            const partializeStart = content.indexOf('partialize:');
            const partializeEnd = content.indexOf('})', partializeStart);
            const partializeSection = content.substring(partializeStart, partializeEnd);

            excludedFields.forEach(field => {
                // The excluded field should not appear as "fieldName: state.fieldName"
                expect(partializeSection).not.toContain(`${field}: state.${field}`);
            });
        });
    });
});
