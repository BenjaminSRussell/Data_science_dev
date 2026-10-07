/**
 * GameState.purchaseItem edge-case tests
 *
 * Covers:
 *  - exact-affordability boundary (money === price succeeds, money === price - 1 fails)
 *  - duplicate purchase rejection even when affordable
 *  - type: 'chart' branch calling through to unlockChartType (no duplicate)
 *  - type: 'tool' branch pushing into unlockedTools
 *  - no partial mutation on any failure path
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';

describe('GameState.purchaseItem', () => {
    let state;

    beforeEach(() => {
        state = new GameState();
    });

    describe('affordability boundary', () => {
        it('succeeds when money === item.price exactly', () => {
            state.money = 50;
            const item = { id: 'item_a', price: 50, type: 'software' };

            expect(state.purchaseItem(item)).toBe(true);
            expect(state.money).toBe(0);
            expect(state.purchasedItems).toContain('item_a');
        });

        it('fails when money === item.price - 1', () => {
            state.money = 49;
            const item = { id: 'item_a', price: 50, type: 'software' };

            expect(state.purchaseItem(item)).toBe(false);
            expect(state.money).toBe(49);
            expect(state.purchasedItems).toEqual([]);
        });

        it('succeeds when money > item.price', () => {
            state.money = 100;
            const item = { id: 'item_a', price: 50, type: 'software' };

            expect(state.purchaseItem(item)).toBe(true);
            expect(state.money).toBe(50);
            expect(state.purchasedItems).toContain('item_a');
        });
    });

    describe('duplicate purchase', () => {
        it('rejects re-purchasing an already-owned item.id even when affordable', () => {
            state.money = 1000;
            const item = { id: 'item_a', price: 50, type: 'software' };

            expect(state.purchaseItem(item)).toBe(true);
            expect(state.purchaseItem(item)).toBe(false);

            // Money only deducted once
            expect(state.money).toBe(950);
            expect(state.purchasedItems.filter(id => id === 'item_a')).toHaveLength(1);
        });

        it('leaves state completely unchanged on duplicate rejection', () => {
            state.money = 1000;
            const item = { id: 'item_a', price: 50, type: 'chart', chartType: 'radar' };

            expect(state.purchaseItem(item)).toBe(true);
            const moneyBefore = state.money;
            const chartsBefore = [...state.unlockedChartTypes];
            const itemsBefore = [...state.purchasedItems];

            expect(state.purchaseItem(item)).toBe(false);
            expect(state.money).toBe(moneyBefore);
            expect(state.unlockedChartTypes).toEqual(chartsBefore);
            expect(state.purchasedItems).toEqual(itemsBefore);
        });
    });

    describe("type: 'chart' branch", () => {
        it('unlocks the chart type via unlockChartType', () => {
            state.money = 100;
            const item = { id: 'chart_radar', price: 30, type: 'chart', chartType: 'radar' };

            expect(state.purchaseItem(item)).toBe(true);
            expect(state.unlockedChartTypes).toContain('radar');
            expect(state.money).toBe(70);
            expect(state.purchasedItems).toContain('chart_radar');
        });

        it('does not duplicate a chart type already present in unlockedChartTypes', () => {
            state.money = 100;
            state.unlockedChartTypes.push('radar');
            const item = { id: 'chart_radar', price: 30, type: 'chart', chartType: 'radar' };

            expect(state.purchaseItem(item)).toBe(true);
            expect(state.unlockedChartTypes.filter(t => t === 'radar')).toHaveLength(1);
        });
    });

    describe("type: 'tool' branch", () => {
        it('pushes the toolId into unlockedTools', () => {
            state.money = 100;
            const item = { id: 'tool_export', price: 25, type: 'tool', toolId: 'high_res_export' };

            expect(state.purchaseItem(item)).toBe(true);
            expect(state.unlockedTools).toContain('high_res_export');
            expect(state.money).toBe(75);
            expect(state.purchasedItems).toContain('tool_export');
        });
    });

    describe('failure paths leave state unchanged', () => {
        it('unaffordable purchase does not mutate money, purchasedItems, or unlocks', () => {
            state.money = 10;
            const item = { id: 'chart_radar', price: 50, type: 'chart', chartType: 'radar' };

            expect(state.purchaseItem(item)).toBe(false);
            expect(state.money).toBe(10);
            expect(state.purchasedItems).toEqual([]);
            expect(state.unlockedChartTypes).not.toContain('radar');
            expect(state.unlockedTools).toEqual([]);
        });

        it('unaffordable tool purchase does not push into unlockedTools', () => {
            state.money = 5;
            const item = { id: 'tool_export', price: 25, type: 'tool', toolId: 'high_res_export' };

            expect(state.purchaseItem(item)).toBe(false);
            expect(state.money).toBe(5);
            expect(state.purchasedItems).toEqual([]);
            expect(state.unlockedTools).toEqual([]);
        });
    });
});
