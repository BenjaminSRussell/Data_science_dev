import { describe, it, expect, vi } from 'vitest';
import { WeeklyNewsSystem } from '../../src/js/game/WeeklyNewsSystem.js';
import { OFFICE_LOCATIONS } from '../../src/js/data/locations.js';
import { IntroSystem } from '../../src/js/game/IntroSystem.js';

describe('weekly "new location" uses real office ids (#1192)', () => {
    it('every generated location exists in OFFICE_LOCATIONS and is selectable', () => {
        const news = new WeeklyNewsSystem({});
        const ids = new Set(OFFICE_LOCATIONS.filter(l => !l.hidden).map(l => l.id));
        for (const week of [4, 8, 12, 16, 20, 24, 28, 32]) {
            const loc = news.generateNewLocation(week);
            expect(ids.has(loc.id), `week ${week}`).toBe(true);
            expect(loc.name).toBeTruthy();
        }
    });

    it('publishWeeklyEdition announces the location in the news feed', async () => {
        const src = (await import('node:fs')).readFileSync('src/js/main.js', 'utf8');
        const i = src.indexOf('publishWeeklyEdition() {');
        const body = src.slice(i, src.indexOf('\n    }\n', i));
        expect(body).toMatch(/change\.type === 'new_location'/);
    });
});

describe('weekly market update reports the real market (#1194)', () => {
    const stock = (name, history, volatility = 0.05) => ({ name, price: history.at(-1), history, volatility });

    it('names the best and worst stock of the week and the overall trend', () => {
        const stockMarket = { stocks: [
            stock('Alpha', [100, 100, 100, 100, 100, 100, 100, 120]),
            stock('Beta', [50, 50, 50, 50, 50, 50, 50, 40]),
            stock('Gamma', [10, 10, 10, 10, 10, 10, 10, 10.5])
        ] };
        const update = new WeeklyNewsSystem({ stockMarket }).generateMarketUpdate();
        expect(update.topPerformer).toBe('Alpha');
        expect(update.worstPerformer).toBe('Beta');
        expect(update.trend).toBe('up');
        expect(update.volatility).toBeCloseTo(0.05);
        expect(update.topPerformer).not.toBe('TechCorp');
    });

    it('a falling market reports down; no market reports flat with no names', () => {
        const stockMarket = { stocks: [stock('A', [10, 8]), stock('B', [10, 9])] };
        expect(new WeeklyNewsSystem({ stockMarket }).generateMarketUpdate().trend).toBe('down');
        const none = new WeeklyNewsSystem({}).generateMarketUpdate();
        expect(none).toMatchObject({ trend: 'flat', topPerformer: null, worstPerformer: null });
    });
});

describe('job cards show skills and perks (#1070)', () => {
    it('renders every starter job with its skills and perks, escaped', () => {
        const intro = Object.create(IntroSystem.prototype);
        for (const job of intro.getStarterJobs()) {
            const html = intro.renderJobCard(job);
            for (const s of job.skills || []) expect(html).toContain(s);
            for (const p of job.perks || []) expect(html).toContain(p);
        }
        const html = intro.renderJobCard({ id: 'x', title: 't', company: 'c', description: '', salary: 1, hours: 1, difficulty: 1, skills: ['<b>'], perks: [] });
        expect(html).toContain('&lt;b&gt;');
        expect(html).not.toContain('Perks');
    });
});
