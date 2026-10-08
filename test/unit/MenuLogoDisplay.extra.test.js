/**
 * MenuLogoDisplay: click advance, retry, rank fallback, games completed (#447)
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { MenuLogoDisplay } from '../../src/js/ui/MenuLogoDisplay.js';
import { RANKS } from '../../src/js/data/ranks.js';

const sm = (slots) => ({ getSaveData: (i) => slots[i] ?? null });
const slot = (state) => ({ state: { timeManager: { totalDays: 1 }, ...state } });

describe('MenuLogoDisplay extras', () => {
    let display;
    afterEach(() => { display?.destroy(); vi.useRealTimers(); vi.restoreAllMocks(); document.body.innerHTML = ''; });

    it('aggregates across all slots: playtime, max rank, achievements, completed games, money, tasks', () => {
        display = new MenuLogoDisplay(sm([
            slot({ rankIndex: 6, money: 100, tasksCompleted: 2, completedAchievements: ['a'] }),
            null,
            slot({ rankIndex: 2, money: 50, tasksCompleted: 3, completedAchievements: ['b', 'c'], timeManager: { totalDays: 2 } }),
            { state: null },
            slot({ rankIndex: 7, money: 0 })
        ]));
        display.calculateStats();
        const v = Object.fromEntries(display.stats.map(s => [s.label, s.value]));
        // Playtime comes from StatisticsAggregator (task-based estimate), not days * 24h (#1629)
        expect(v['Total Playtime']).toBe('1h');
        expect(v['Highest Rank']).toBe(RANKS[7]?.title || 'Data Entry Clerk');
        expect(v['Games Completed']).toBe('2');
        expect(v['Total Money Earned']).toBe('$150');
        expect(v['Total Tasks']).toBe('5');
        expect(v['Total Achievements']).toBe('3');
    });

    it('falls back to Data Entry Clerk for a rank index with no RANKS entry', () => {
        display = new MenuLogoDisplay(sm([slot({ rankIndex: RANKS.length + 5 })]));
        display.calculateStats();
        expect(display.stats.find(s => s.label === 'Highest Rank').value).toBe('Data Entry Clerk');
    });

    it('formatPlaytime boundaries at 23/24/167/168', () => {
        display = new MenuLogoDisplay(sm([]));
        // Same formatter as the stats dashboard (#1629)
        expect(display.formatPlaytime(23)).toBe('23h');
        expect(display.formatPlaytime(24)).toBe('1d');
        expect(display.formatPlaytime(167)).toBe('6d 23h');
        expect(display.formatPlaytime(168)).toBe('1w');
    });

    it('render retries until the element appears, then stops retrying', () => {
        vi.useFakeTimers();
        display = new MenuLogoDisplay(sm([slot({ rankIndex: 1 })]));
        display.calculateStats();
        display.render();
        document.body.innerHTML = '<div class="menu-logo-icon"></div>';
        vi.advanceTimersByTime(100);
        expect(document.querySelector('.menu-logo-icon').textContent).toBe(display.stats[0].icon);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('render gives up after maxRenderRetries and destroy cancels a pending retry', () => {
        vi.useFakeTimers();
        display = new MenuLogoDisplay(sm([]));
        display.calculateStats();
        display.render();
        vi.advanceTimersByTime(100 * (display.maxRenderRetries + 10));
        expect(vi.getTimerCount()).toBe(0);
        expect(display.renderRetries).toBe(display.maxRenderRetries);

        const other = new MenuLogoDisplay(sm([]));
        other.render();
        expect(vi.getTimerCount()).toBe(1);
        other.destroy();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('a click advances exactly one stat even after rotation restarts', () => {
        vi.useFakeTimers();
        document.body.innerHTML = '<div class="menu-logo-icon"></div>';
        display = new MenuLogoDisplay(sm([slot({ rankIndex: 1 })]));
        display.init();
        display.startRotation();
        display.startRotation();
        const logo = document.querySelector('.menu-logo-icon');
        logo.click();
        expect(display.currentStatIndex).toBe(1);
        expect(logo.textContent).toBe(display.stats[1].icon);
        for (let i = 0; i < display.stats.length - 1; i++) logo.click();
        expect(display.currentStatIndex).toBe(0);
        // Only one rotation interval is running: one tick advances one stat.
        // (Counted by behaviour: the shared StatisticsAggregator's localStorage
        // write queues a jsdom storage-event timer of its own.)
        vi.advanceTimersByTime(display.updateInterval);
        expect(display.currentStatIndex).toBe(1);
    });

    it('update() after stats shrink keeps the index in range', () => {
        document.body.innerHTML = '<div class="menu-logo-icon"></div>';
        const slots = [slot({ rankIndex: 1 })];
        display = new MenuLogoDisplay(sm(slots));
        display.calculateStats();
        display.currentStatIndex = 4;
        slots.length = 0;
        expect(() => display.update()).not.toThrow();
        expect(document.querySelector('.menu-logo-icon').textContent).toBe('Chart');
    });
});
