import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { StatisticsAggregator } from '../../src/js/ui/StatisticsAggregator.js';

const stats = {
    totalPlaytime: 3, gamesCompleted: 1, highestRank: 2, highestRankName: 'Analyst <II>',
    totalMoney: 12500, totalTasks: 42, totalReputation: 1234, sessions: 3,
    averageSessionLength: 2.5, lastUpdated: 0
};

describe('Statistics dashboard shows every aggregated total (#1632)', () => {
    const agg = new StatisticsAggregator(null);

    it('builds a card for each computed field', () => {
        const cards = agg.getDashboardCards(stats);
        const byLabel = Object.fromEntries(cards.map(c => [c.label, c.value]));
        expect(byLabel['Tasks Completed']).toBe((42).toLocaleString());
        expect(byLabel['Total Reputation']).toBe((1234).toLocaleString());
        expect(byLabel['Save Slots Played']).toBe('3');
        expect(byLabel['Avg. Session']).toBe('2.5 days');
        expect(byLabel['Total Money']).toBe(agg.formatMoney(12500));
        expect(byLabel['Total Playtime']).toBe(agg.formatPlaytime(3));
    });

    it('formats the average session for edge values', () => {
        const label = (avg) => agg.getDashboardCards({ ...stats, averageSessionLength: avg })
            .find(c => c.label === 'Avg. Session').value;
        expect(label(0)).toBe('< 1 day');
        expect(label(1)).toBe('1 day');
        expect(label(4)).toBe('4 days');
        expect(label(undefined)).toBe('< 1 day');
    });

    it('renders escaped HTML with one stat-card per field', () => {
        const html = agg.getDashboardHTML(stats);
        expect(html.match(/class="stat-card"/g)).toHaveLength(8);
        expect(html).toContain('Analyst &lt;II&gt;');
        expect(html).not.toContain('<II>');
    });

    it('main.js renders the dashboard from the aggregator cards', () => {
        const src = readFileSync('src/js/main.js', 'utf8');
        const start = src.indexOf('renderStatisticsDashboard() {');
        const body = src.slice(start, src.indexOf('\n    }\n', start));
        expect(body).toContain('getDashboardHTML(stats)');
    });
});
