import { describe, it, expect, vi, afterEach } from 'vitest';
import { NewsManager, NEWS_TEMPLATES, RANDOM_EVENTS } from '../../src/js/game/NewsManager.js';
import { WorldEventManager, MAX_EVENT_HISTORY } from '../../src/js/game/WorldEventManager.js';
import { WeeklyNewsSystem } from '../../src/js/game/WeeklyNewsSystem.js';
import { EventSystem } from '../../src/js/game/events/EventSystem.js';
import { StockMarket } from '../../src/js/game/StockMarket.js';

const tm = (totalDays = 0) => ({ totalDays, energy: 100, getDateString: () => `Day ${totalDays}` });

afterEach(() => vi.restoreAllMocks());

describe('NewsManager (#437, #1365, #2238, #1127, #1370, #216, #1701, #2111, #1366)', () => {
    it('fills every template placeholder and gives items title/description', () => {
        const nm = new NewsManager({ timeManager: tm(1) });
        for (let i = 0; i < 50; i++) {
            const item = nm.generateNewsItem();
            expect(item.text).not.toMatch(/\{\w+\}/);
            expect(item.title).toBe(item.text);
            expect(item.description.length).toBeGreaterThan(0);
        }
        expect(NEWS_TEMPLATES.length).toBeGreaterThan(0);
    });

    it('daily paper has exactly two side stories and survives save/load', () => {
        const nm = new NewsManager({ timeManager: tm(3) });
        const paper = nm.generateDailyNews();
        expect(paper.articles).toHaveLength(2);
        const nm2 = new NewsManager({ timeManager: tm(3) });
        nm2.fromJSON(JSON.parse(JSON.stringify(nm.toJSON())));
        expect(nm2.getDailyPaper().headline.title).toBe(paper.headline.title);
    });

    it('caps newsHistory at maxHistory', () => {
        const nm = new NewsManager({ timeManager: tm(1) });
        for (let i = 0; i < 40; i++) nm.generateDailyNews();
        expect(nm.newsHistory.length).toBe(nm.maxHistory);
    });

    it('requirement gating: bus pass is not a car, mentor must be met', () => {
        const gs = { worldMap: { currentVehicle: 'bus_pass' }, npcManager: { metNPCs: [] } };
        const nm = new NewsManager(gs);
        const car = RANDOM_EVENTS.find(e => e.id === 'car_trouble');
        const mentor = RANDOM_EVENTS.find(e => e.id === 'mentor_gift');
        expect(nm.checkEventRequirements(car)).toBe(false);
        gs.worldMap.currentVehicle = 'used_car';
        expect(nm.checkEventRequirements(car)).toBe(true);
        expect(nm.checkEventRequirements(mentor)).toBe(false);
        gs.npcManager.metNPCs.push('professor_higgins');
        expect(nm.checkEventRequirements(mentor)).toBe(true);
    });

    it('owning shares satisfies hasInvestments and Market Dip moves prices', () => {
        const gs = { money: 0 };
        gs.stockMarket = new StockMarket(gs);
        const nm = new NewsManager(gs);
        const dip = RANDOM_EVENTS.find(e => e.id === 'market_crash');
        expect(nm.checkEventRequirements(dip)).toBe(false);
        const stock = gs.stockMarket.stocks[0];
        gs.stockMarket.portfolio.holdings[stock.id] = 1;
        expect(nm.checkEventRequirements(dip)).toBe(true);
        const before = stock.price;
        nm.applyEventEffects(dip);
        expect(stock.price).toBeLessThan(before);
    });

    it('applyEventEffects applies money, reputation and xp', () => {
        const addExperience = vi.fn();
        const gs = { money: 0, reputation: 0, characterStats: { addExperience } };
        const nm = new NewsManager(gs);
        nm.applyEventEffects(RANDOM_EVENTS.find(e => e.id === 'referral_bonus'));
        expect(gs.money).toBe(500);
        expect(gs.reputation).toBe(10);
        nm.applyEventEffects(RANDOM_EVENTS.find(e => e.id === 'industry_insight'));
        expect(addExperience).toHaveBeenCalledWith('analytics', 10);
    });

    it('addNews makes a breaking headline and keeps two side stories', () => {
        const nm = new NewsManager({ timeManager: tm(1) });
        const old = nm.generateDailyNews().headline;
        const item = nm.addNews({ text: 'BREAKING', category: 'tech' });
        const paper = nm.getDailyPaper();
        expect(paper.headline).toBe(item);
        expect(paper.articles[0]).toBe(old);
        expect(paper.articles).toHaveLength(2);
    });

    it('market templates produce an effect StockMarket.update reads', () => {
        const up = NewsManager.marketEffectFor(NEWS_TEMPLATES[0], { direction: 'surges', percent: '20' });
        const down = NewsManager.marketEffectFor(NEWS_TEMPLATES[0], { direction: 'plummets', percent: '20' });
        expect(up.MARKET).toBe('US');
        expect(up.MAGNITUDE).toBeGreaterThan(0);
        expect(down.MAGNITUDE).toBeLessThan(0);
    });
});

describe('WorldEventManager (#918, #2366, #2110, #2367, #1335, #1340, #159, #1338)', () => {
    it('events start, are reported active, cannot stack, and expire', () => {
        const gs = { timeManager: tm(10), newsManager: new NewsManager({ timeManager: tm(10) }) };
        gs.newsManager.generateDailyNews();
        const wem = new WorldEventManager(gs);
        expect(Object.keys(wem.eventPool).length).toBeGreaterThanOrEqual(5);
        expect(wem.triggerEvent('trade_war')).toBe(true);
        expect(wem.triggerEvent('trade_war')).toBe(false);
        expect(wem.getActiveEvents()).toEqual([expect.objectContaining({ type: 'trade_war', active: true })]);
        expect(gs.newsManager.getDailyPaper().headline.text).toMatch(/Tariff/);

        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        gs.timeManager.totalDays = 20;
        const { ended } = wem.processDay();
        expect(ended).toEqual(['trade_war']);
        expect(wem.getActiveEvents()).toEqual([]);
        expect(wem.events[0].ended).toBe(true);
    });

    it('processDay rolls events and market_crash works without a stock market', () => {
        const gs = { timeManager: tm(1) };
        const wem = new WorldEventManager(gs);
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const { started } = wem.processDay();
        expect(started).toContain('market_crash');
    });

    it('history stays bounded', () => {
        const gs = { timeManager: tm(0) };
        const wem = new WorldEventManager(gs);
        for (let d = 0; d < 200; d++) {
            gs.timeManager.totalDays = d * 20;
            vi.spyOn(Math, 'random').mockReturnValue(0.99);
            wem.processDay();
            wem.triggerEvent('innovation_breakthrough');
        }
        expect(wem.events.length).toBeLessThanOrEqual(MAX_EVENT_HISTORY);
    });

    it('active events drive StockMarket.update', () => {
        const gs = { timeManager: tm(1) };
        const sm = new StockMarket(gs);
        const wem = new WorldEventManager(gs);
        wem.triggerEvent('market_crash');
        sm.update([], wem.getActiveEvents());
        expect(sm.activeWorldEvents.map(e => e.type)).toContain('market_crash');
    });
});

describe('WeeklyNewsSystem (#445, #1418, #1188, #531)', () => {
    it('headlines follow the week phases', () => {
        const ws = new WeeklyNewsSystem({ timeManager: tm(0), characterStats: { ethics: 0 } });
        expect(ws.generateWeeklyNews().headline).toBe('Tech Industry Sees Record Hiring');
        ws.gameState.timeManager.totalDays = 7 * 12;
        expect(ws.generateWeeklyNews().headline).toBe('AI Revolution Transforms Data Industry');
    });

    it('main story reflects a decision the player made, by ethics', () => {
        const storylineManager = { majorDecisions: [{ decisionId: 'whistleblower', choice: 'expose', week: 0 }] };
        const ws = new WeeklyNewsSystem({ timeManager: tm(0), characterStats: { ethics: 50 }, storylineManager });
        expect(ws.generateWeeklyNews().mainStory).toMatch(/brave data scientist/);
        ws.gameState.characterStats.ethics = -50;
        storylineManager.majorDecisions[0] = { decisionId: 'criminal_opportunity', choice: 'accept', week: 0 };
        expect(ws.generateWeeklyNews().mainStory).toMatch(/illegal data trading/);
    });

    it('all five storylines advance and fromJSON never yields NaN', () => {
        const ws = new WeeklyNewsSystem({ timeManager: tm(0) });
        for (let w = 1; w <= 12; w++) { ws.weekNumber = w; ws.updateStorylineProgress(); }
        expect(Object.values(ws.storylineProgress).every(v => v > 0)).toBe(true);
        ws.fromJSON({ storylineProgress: { techRevolution: 2, marketCrash: 'x' } });
        ws.weekNumber = 12; ws.updateStorylineProgress();
        expect(Object.values(ws.storylineProgress).every(Number.isFinite)).toBe(true);
    });

    it('weekly edition leads the daily paper through addNews', () => {
        const nm = new NewsManager({ timeManager: tm(7) });
        nm.generateDailyNews();
        const ws = new WeeklyNewsSystem({ timeManager: tm(7) });
        const paper = ws.generateWeeklyNews();
        nm.addNews({ text: paper.headline, description: paper.mainStory, category: 'business' });
        expect(nm.getDailyPaper().headline.title).toBe(paper.headline);
        expect(nm.getDailyPaper().headline.description).toBe(paper.mainStory);
    });
});

describe('EventSystem.triggerEvent guard (#159)', () => {
    it('does not trigger the same event twice in a day', () => {
        const gs = { timeManager: tm(5), money: 0 };
        const es = new EventSystem(gs);
        const id = es.upcomingEvents.find(e => e.type === 'holiday').id;
        expect(es.triggerEvent(id)).not.toBeNull();
        expect(es.triggerEvent(id)).toBeNull();
        expect(es.activeEvents.filter(e => e.id === id)).toHaveLength(1);
        gs.timeManager.totalDays = 400;
        expect(es.triggerEvent(id)).not.toBeNull();
        expect(es.activeEvents).toHaveLength(1);
    });
});
