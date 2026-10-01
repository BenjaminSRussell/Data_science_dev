/**
 * #2654: purchased shop perks must change gameplay.
 * Each test buys the perk through GameState.purchaseItem() and compares the
 * outcome with an identical run without the perk.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';
import { TimeManager } from '../../src/js/game/TimeManager.js';
import { SHOP_ITEMS, PERK_EFFECTS } from '../../src/js/data/shopItems.js';
import { TASKS } from '../../src/js/data/tasks.js';
import { BOSSES } from '../../src/js/data/bosses.js';

const perkItem = (perkId) => SHOP_ITEMS.find(i => i.type === 'perk' && i.perkId === perkId);

function buy(gameState, perkId) {
    gameState.money = 100000;
    expect(gameState.purchaseItem(perkItem(perkId))).toBe(true);
}

describe('Shop perks (#2654)', () => {
    let gameState;
    let economy;
    let tasks;
    const timedTemplate = TASKS.find(t => t.timeLimit);
    const neutralBoss = BOSSES.find(b => b.strictness === 1.0);

    beforeEach(() => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        gameState = new GameState();
        economy = new EconomySystem(gameState);
        tasks = new TaskSystem(gameState);
        vi.spyOn(tasks, 'updateBossDialogue').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('every perk in the shop has a defined effect', () => {
        const perkIds = SHOP_ITEMS.filter(i => i.type === 'perk').map(i => i.perkId);
        expect(perkIds.length).toBe(6);
        perkIds.forEach(id => expect(PERK_EFFECTS[id]).toBeDefined());
    });

    it('time_bonus adds 30 seconds to timed tasks', () => {
        const before = tasks.createTaskFromTemplate(timedTemplate, neutralBoss).timeLimit;
        buy(gameState, 'time_bonus');
        const after = tasks.createTaskFromTemplate(timedTemplate, neutralBoss).timeLimit;

        expect(before).toBe(timedTemplate.timeLimit);
        expect(after).toBe(timedTemplate.timeLimit + 30);
    });

    it('time_bonus leaves untimed tasks untimed', () => {
        buy(gameState, 'time_bonus');
        const task = tasks.createTaskFromTemplate({ ...timedTemplate, timeLimit: undefined }, neutralBoss);
        expect(task.timeLimit).toBeUndefined();
    });

    it('bonus_multiplier pays 15% more money', () => {
        const task = { potentialReward: 1000 };
        const base = economy.calculateMoneyReward(task, 4);
        buy(gameState, 'bonus_multiplier');
        expect(economy.calculateMoneyReward(task, 4)).toBe(Math.round(base * 1.15));
    });

    it('rep_boost gives 20% more reputation', () => {
        const base = economy.calculateRepReward(5);
        buy(gameState, 'rep_boost');
        expect(economy.calculateRepReward(5)).toBe(Math.round(base * 1.2));
    });

    it('boss_favor makes the boss score 10% more lenient', () => {
        const task = tasks.createTaskFromTemplate(timedTemplate, neutralBoss);
        const config = { type: 'pie', showLegend: false, showGrid: false, title: '' };

        const base = economy.evaluateChart(task, config).rawScore;
        buy(gameState, 'boss_favor');
        const favored = economy.evaluateChart(task, config).rawScore;

        expect(favored).toBeCloseTo(Math.min(100, base * 1.1), 5);
        expect(favored).toBeGreaterThan(base);
    });

    it('insight shows the optimal chart type hint in the requirements', () => {
        const task = tasks.createTaskFromTemplate(timedTemplate, neutralBoss);
        const container = document.createElement('div');

        tasks.appendChartInsight(container, task);
        expect(container.querySelector('.insight-hint')).toBeNull();

        buy(gameState, 'insight');
        tasks.appendChartInsight(container, task);
        const hint = container.querySelector('.insight-hint');
        expect(hint).not.toBeNull();
        task.optimalChartTypes.forEach(type => expect(hint.textContent).toContain(type));
    });

    describe('second_chance', () => {
        beforeEach(() => {
            gameState.timeManager = new TimeManager();
            tasks.createTaskFromTemplate(timedTemplate, neutralBoss);
            gameState.lastScore = { moneyEarned: 50, repEarned: 5 };
        });

        it('cannot retry without the perk', () => {
            expect(tasks.retryCurrentTask()).toBe(false);
        });

        it('allows exactly one retry per in-game day', () => {
            buy(gameState, 'second_chance');
            expect(gameState.canUseSecondChance()).toBe(true);
            expect(tasks.retryCurrentTask()).toBe(true);
            expect(tasks.retryCurrentTask()).toBe(false);

            gameState.timeManager.day += 1; // next in-game day
            expect(gameState.canUseSecondChance()).toBe(true);
        });

        it('only pays the improvement over the first attempt', () => {
            buy(gameState, 'second_chance');
            tasks.retryCurrentTask();
            const task = gameState.currentTask;
            expect(task.previousReward).toEqual({ money: 50, rep: 5 });

            const score = economy.evaluateChart(task, { type: task.optimalChartTypes[0], showLegend: true, showGrid: true, title: 'T' });
            const gross = economy.calculateMoneyReward(task, score.stars);
            expect(score.moneyEarned).toBe(Math.max(0, gross - 50));
            expect(score.repEarned).toBe(Math.max(0, economy.calculateRepReward(score.stars) - 5));
        });

        it('remembers the day it was used across save/load', () => {
            buy(gameState, 'second_chance');
            tasks.retryCurrentTask();

            const restored = new GameState();
            restored.timeManager = new TimeManager();
            restored.fromJSON(gameState.toJSON());
            expect(restored.canUseSecondChance()).toBe(false);
        });
    });
});
