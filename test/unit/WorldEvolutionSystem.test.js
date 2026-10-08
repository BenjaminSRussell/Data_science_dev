/**
 * WorldEvolutionSystem weekly simulation (#426 #1083 #1084 #1085 #2258 #511)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorldEvolutionSystem } from '../../src/js/game/WorldEvolutionSystem.js';
import { GameState } from '../../src/js/game/GameState.js';

describe('WorldEvolutionSystem', () => {
    let wes;
    let rand;
    beforeEach(() => {
        wes = new WorldEvolutionSystem({});
        rand = vi.spyOn(Math, 'random');
    });
    afterEach(() => vi.restoreAllMocks());

    describe('updateEconomicClimate', () => {
        it('recession on week%20 with random > 0.7', () => {
            wes.worldState.week = 20; rand.mockReturnValue(0.8);
            wes.updateEconomicClimate();
            expect(wes.worldState.economicClimate).toBe('recession');
        });
        it('boom on week%15 with random > 0.6', () => {
            wes.worldState.week = 15; rand.mockReturnValue(0.65);
            wes.updateEconomicClimate();
            expect(wes.worldState.economicClimate).toBe('boom');
        });
        it('stable on week%10 otherwise', () => {
            wes.worldState.economicClimate = 'boom';
            wes.worldState.week = 10; rand.mockReturnValue(0.1);
            wes.updateEconomicClimate();
            expect(wes.worldState.economicClimate).toBe('stable');
        });
        it('week 20 with a low roll falls through to stable', () => {
            wes.worldState.economicClimate = 'recession';
            wes.worldState.week = 20; rand.mockReturnValue(0.1);
            wes.updateEconomicClimate();
            expect(wes.worldState.economicClimate).toBe('stable');
        });
    });

    describe('updateBusinessHealth', () => {
        it('recession hurts startups and retail extra, clamped to [0,100]', () => {
            wes.worldState.economicClimate = 'recession';
            rand.mockReturnValue(0); // base -5, no layoffs roll
            const startup = { id: 's', name: 'S', type: 'startup', health: 50, employees: 10 };
            const retail = { id: 'r', name: 'R', type: 'retail', health: 50, employees: 10 };
            const tech = { id: 't', name: 'T', type: 'tech', health: 50, employees: 10 };
            wes.updateBusinessHealth(startup);
            wes.updateBusinessHealth(retail);
            wes.updateBusinessHealth(tech);
            expect(startup.health).toBe(35);
            expect(retail.health).toBe(37);
            expect(tech.health).toBe(45);
        });

        it('boom raises health but never past 100', () => {
            wes.worldState.economicClimate = 'boom';
            rand.mockReturnValue(1);
            const b = { id: 'b', name: 'B', type: 'tech', health: 98, employees: 1 };
            wes.updateBusinessHealth(b);
            expect(b.health).toBe(100);
        });

        it('closure fires once with unemployment impact', () => {
            wes.worldState.economicClimate = 'recession';
            wes.worldState.week = 7;
            rand.mockReturnValue(0);
            const b = { id: 'local_coffee', name: 'Corner Coffee', type: 'retail', health: 5, employees: 5 };
            const r = wes.updateBusinessHealth(b);
            expect(r.type).toBe('business_closed');
            expect(r.impact).toEqual({ unemployment: 5, locationAffected: 'coffee_shop' });
            expect(b.closed).toBe(true);
            expect(b.closedWeek).toBe(7);
            expect(wes.updateBusinessHealth(b)).toBeNull();
        });

        it('layoffs below 30 health on a high roll', () => {
            wes.worldState.economicClimate = 'stable';
            rand.mockReturnValue(0.9);
            const b = { id: 'x', name: 'X', type: 'tech', health: 20, employees: 200 };
            const r = wes.updateBusinessHealth(b);
            expect(r.type).toBe('layoffs');
            expect(r.impact.unemployment).toBe(20);
            expect(b.employees).toBe(180);
            expect(wes.worldState.laidOff).toBe(20);
        });
    });

    describe('processWeeklyChanges', () => {
        it('increments week and reports climate and unemployment', () => {
            rand.mockReturnValue(0.5);
            const r = wes.processWeeklyChanges();
            expect(r.week).toBe(1);
            expect(r).toHaveProperty('economicClimate', 'stable');
            expect(r.unemploymentRate).toBe(5);
        });

        it('closed businesses get no more updates or phantom layoffs', () => {
            const coffee = wes.businesses.find(b => b.id === 'local_coffee');
            coffee.closed = true; coffee.health = 0; coffee.employees = 5;
            rand.mockReturnValue(0.99);
            for (let i = 0; i < 3; i++) {
                const r = wes.processWeeklyChanges();
                expect(r.changes.some(c => c.business === 'Corner Coffee')).toBe(false);
            }
            expect(coffee.health).toBe(0);
        });

        it('layoffs at open businesses raise unemployment', () => {
            wes.worldState.laidOff = 500;
            wes.updateUnemploymentRate();
            expect(wes.worldState.unemploymentRate).toBe(10);
        });

        it('a new_business event opens a real business and everything is logged', () => {
            // climate stable, health jitter, no layoffs, event roll > 0.7, pick index 0
            rand.mockImplementation(() => 0.5);
            const event = vi.spyOn(wes, 'generateRandomEvent').mockReturnValue({ type: 'new_business', message: 'x', impact: { jobs: 10 } });
            const before = wes.businesses.length;
            const r = wes.processWeeklyChanges();
            expect(event).toHaveBeenCalled();
            expect(wes.businesses.length).toBe(before + 1);
            const opened = wes.businesses[wes.businesses.length - 1];
            expect(opened.spawned).toBe(true);
            expect(wes.getBusinessLocation(opened.id)).toBe(opened.location);
            expect(r.changes.find(c => c.type === 'new_business').business).toBe(opened.name);
            expect(wes.worldState.events.at(-1)).toMatchObject({ week: 1, type: 'new_business' });
        });

        it('event log is capped', () => {
            vi.spyOn(wes, 'generateRandomEvent').mockReturnValue({ type: 'scandal', message: 's' });
            rand.mockReturnValue(0.5);
            for (let i = 0; i < 60; i++) wes.processWeeklyChanges();
            expect(wes.worldState.events.length).toBe(50);
        });
    });

    it('saves and restores the simulation, and is in the save list', () => {
        rand.mockReturnValue(0.5);
        wes.processWeeklyChanges();
        wes.businesses[0].health = 12;
        const restored = new WorldEvolutionSystem({});
        restored.fromJSON(JSON.parse(JSON.stringify(wes.toJSON())));
        expect(restored.worldState.week).toBe(1);
        expect(restored.businesses[0].health).toBe(12);
        expect(() => restored.fromJSON(null)).not.toThrow();
        expect(GameState.SERIALIZABLE_SUBSYSTEMS).toContain('worldEvolutionSystem');
    });
});
