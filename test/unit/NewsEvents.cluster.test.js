import { describe, it, expect, vi, afterEach } from 'vitest';
import { NewsManager, RANDOM_EVENTS, NEWS_TEMPLATES } from '../../src/js/game/NewsManager.js';

afterEach(() => vi.restoreAllMocks());

const gs = (extra = {}) => ({
    money: 0, reputation: 0,
    timeManager: { totalDays: 3, timeSlot: 0, energy: 100, getDateString: () => 'Day 3', drainEnergy(n) { this.energy -= n; return n; } },
    characterStats: { addExperience: vi.fn(), getStat: () => 50 },
    ...extra
});

describe('NewsManager random events and paper (#1371, #1725, #1729, #2066, #2068)', () => {
    it('a paper never repeats a template (#2068, #1371)', () => {
        const nm = new NewsManager(gs());
        for (let i = 0; i < 30; i++) {
            const p = nm.generateDailyNews();
            const texts = [p.headline, ...p.articles].map(a => a.text);
            expect(new Set(texts).size).toBe(texts.length);
            const cats = [p.headline, ...p.articles].map(a => NEWS_TEMPLATES.findIndex(t => t.category === a.category));
            expect(cats.every(c => c >= 0)).toBe(true);
        }
    });

    it('at most one random event per day (#1729)', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0); // every roll succeeds
        const state = gs({ tasksCompleted: 10, currentTask: {} });
        const nm = new NewsManager(state);
        expect(nm.checkRandomEvents().length).toBe(1);
        expect(nm.checkRandomEvents().length).toBe(0); // same day
        state.timeManager.totalDays = 4;
        expect(nm.checkRandomEvents().length).toBe(1);
    });

    it('requirements read real state: tasksCompleted and currentTask (#2066)', () => {
        const referral = RANDOM_EVENTS.find(e => e.id === 'referral_bonus');
        const client = RANDOM_EVENTS.find(e => e.id === 'difficult_client');
        const nm = new NewsManager(gs({ tasksCompleted: 6 }));
        expect(nm.checkEventRequirements(referral)).toBe(true);
        expect(nm.checkEventRequirements(client)).toBe(false);
        nm.gameState.currentTask = { id: 't' };
        expect(nm.checkEventRequirements(client)).toBe(true);
    });

    it('every declared effect key does something (#1725)', () => {
        const npcManager = { metNPCs: [], getNPCsAtLocation: () => [{ id: 'amy' }], markNPCAsMet: vi.fn(function (id) { this.metNPCs.push(id); }) };
        const state = gs({ npcManager, worldMap: { currentLocation: 'coffee_shop' } });
        const nm = new NewsManager(state);
        const run = id => nm.applyEventEffects(RANDOM_EVENTS.find(e => e.id === id));
        expect(run('viral_chart').followers).toBe(100);
        expect(state.followers).toBe(100);
        run('award_nomination');
        expect(state.characterStats.addExperience).toHaveBeenCalledWith('charisma', 20);
        expect(run('coffee_meeting').metNPC).toBe('amy');
        expect(npcManager.metNPCs).toContain('amy');
        run('networking_lead');
        expect(state.potentialClients).toBe(1);
        run('competitor_steal');
        expect(state.potentialClients).toBe(0);
        run('difficult_client');
        expect(state.stress).toBe(10);
        expect(nm.getActiveEffects().focusPenalty).toBe(5);
        const car = run('car_trouble');
        expect(car.timeLost).toBe(1);
        expect(state.timeManager.timeSlot).toBe(1);
        expect(state.money).toBe(-200);
        // every effect key in the table is handled somewhere in applyEventEffects
        const handled = ['money', 'reputation', 'xp', 'portfolioBoost', 'portfolioLoss', 'energyPenalty', 'followers',
            'charismaXP', 'meetNPC', 'potentialClient', 'pendingJobLost', 'stressIncrease', 'focusPenalty', 'timeLost'];
        for (const e of RANDOM_EVENTS) for (const k of Object.keys(e.effects)) expect(handled).toContain(k);
    });
});
