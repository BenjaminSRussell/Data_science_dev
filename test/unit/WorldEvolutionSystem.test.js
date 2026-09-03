/**
 * Unit tests for WorldEvolutionSystem
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorldEvolutionSystem } from '../../src/js/game/WorldEvolutionSystem.js';

describe('WorldEvolutionSystem', () => {
    let system;
    let mockGameState;
    let randomSpy;

    beforeEach(() => {
        mockGameState = {};
        system = new WorldEvolutionSystem(mockGameState);
        randomSpy = vi.spyOn(Math, 'random');
    });

    afterEach(() => {
        randomSpy.mockRestore();
    });

    describe('constructor', () => {
        it('should initialize world state with defaults', () => {
            expect(system.worldState.week).toBe(0);
            expect(system.worldState.economicClimate).toBe('stable');
            expect(system.worldState.unemploymentRate).toBe(5.0);
            expect(system.worldState.events).toEqual([]);
        });

        it('should seed 5 businesses', () => {
            expect(system.businesses).toHaveLength(5);
            expect(system.businesses.map(b => b.id)).toEqual([
                'techcorp', 'datadynamics', 'local_coffee', 'startup_alpha', 'consulting_firm'
            ]);
        });
    });

    describe('updateEconomicClimate', () => {
        it('should enter recession when week%20===0 and random>0.7', () => {
            system.worldState.week = 20;
            randomSpy.mockReturnValue(0.8);

            system.updateEconomicClimate();

            expect(system.worldState.economicClimate).toBe('recession');
        });

        it('should enter boom when week%15===0 and random>0.6 (and not a recession week)', () => {
            system.worldState.week = 15;
            randomSpy.mockReturnValue(0.65);

            system.updateEconomicClimate();

            expect(system.worldState.economicClimate).toBe('boom');
        });

        it('should return to stable when week%10===0 (and no recession/boom trigger)', () => {
            system.worldState.week = 10;
            randomSpy.mockReturnValue(0.5);

            system.updateEconomicClimate();

            expect(system.worldState.economicClimate).toBe('stable');
        });

        it('should not change climate on a non-cycle week', () => {
            system.worldState.week = 7;
            randomSpy.mockReturnValue(0.99);

            system.updateEconomicClimate();

            expect(system.worldState.economicClimate).toBe('stable');
        });
    });

    describe('updateBusinessHealth', () => {
        it('should apply recession penalty plus -10 for startups and clamp to [0,100]', () => {
            system.worldState.economicClimate = 'recession';
            randomSpy.mockReturnValue(0.0); // healthChange = -5, then -10 startup penalty => -15
            const startup = system.businesses.find(b => b.type === 'startup');
            const before = startup.health;

            const result = system.updateBusinessHealth(startup);

            expect(startup.health).toBe(before - 15);
            expect(result).toBeNull();
        });

        it('should apply recession penalty plus -8 for retail', () => {
            system.worldState.economicClimate = 'recession';
            randomSpy.mockReturnValue(0.0); // healthChange = -5, then -8 retail penalty => -13
            const retail = system.businesses.find(b => b.type === 'retail');
            const before = retail.health;

            const result = system.updateBusinessHealth(retail);

            expect(retail.health).toBe(before - 13);
            expect(result).toBeNull();
        });

        it('should clamp health at 0', () => {
            system.worldState.economicClimate = 'recession';
            randomSpy.mockReturnValue(0.0);
            const startup = system.businesses.find(b => b.type === 'startup');
            startup.health = 5;

            system.updateBusinessHealth(startup);

            expect(startup.health).toBe(0);
        });

        it('should clamp health at 100 during boom', () => {
            system.worldState.economicClimate = 'boom';
            randomSpy.mockReturnValue(1.0); // healthChange = +6
            const tech = system.businesses.find(b => b.type === 'tech');
            tech.health = 99;

            system.updateBusinessHealth(tech);

            expect(tech.health).toBe(100);
        });
    });

    describe('closure path', () => {
        it('should close a business when health hits 0 and report unemployment impact', () => {
            system.worldState.economicClimate = 'recession';
            system.worldState.week = 3;
            randomSpy.mockReturnValue(0.0);
            const startup = system.businesses.find(b => b.type === 'startup');
            startup.health = 5; // -5 -10 => -15 => clamped to 0
            const employees = startup.employees;

            const result = system.updateBusinessHealth(startup);

            expect(startup.closed).toBe(true);
            expect(startup.closedWeek).toBe(3);
            expect(result).toEqual({
                type: 'business_closed',
                business: startup.name,
                message: `${startup.name} has closed its doors. ${employees} people lost their jobs.`,
                impact: {
                    unemployment: employees,
                    locationAffected: 'tech_hub'
                }
            });
        });

        it('should not re-trigger closure on an already-closed business', () => {
            system.worldState.economicClimate = 'recession';
            randomSpy.mockReturnValue(0.0);
            const startup = system.businesses.find(b => b.type === 'startup');
            startup.health = 5;

            const first = system.updateBusinessHealth(startup);
            expect(first.type).toBe('business_closed');

            const second = system.updateBusinessHealth(startup);

            expect(second).toBeNull();
        });
    });

    describe('layoffs path', () => {
        it('should reduce employees by floor(employees*0.1) when health in (0,30) and random>0.7', () => {
            system.worldState.economicClimate = 'stable';
            randomSpy.mockReturnValue(0.5); // stable: (0.5-0.5)*2 = 0 change
            const startup = system.businesses.find(b => b.type === 'startup');
            startup.health = 20;
            const before = startup.employees;

            // First Math.random() call is the health variation, second is the layoffs roll
            randomSpy.mockReturnValueOnce(0.5).mockReturnValueOnce(0.8);

            const result = system.updateBusinessHealth(startup);

            const layoffs = Math.floor(before * 0.1);
            expect(startup.employees).toBe(before - layoffs);
            expect(result).toEqual({
                type: 'layoffs',
                business: startup.name,
                message: `${startup.name} announced layoffs. ${layoffs} employees lost their jobs.`,
                impact: { unemployment: layoffs }
            });
        });

        it('should not trigger layoffs when random<=0.7', () => {
            system.worldState.economicClimate = 'stable';
            const startup = system.businesses.find(b => b.type === 'startup');
            startup.health = 20;

            randomSpy.mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);

            const result = system.updateBusinessHealth(startup);

            expect(result).toBeNull();
        });
    });

    describe('processWeeklyChanges', () => {
        it('should increment week, update climate, collect changes, and return summary', () => {
            randomSpy.mockReturnValue(0.5); // no recession/boom, no random event, no layoffs

            const result = system.processWeeklyChanges();

            expect(result.week).toBe(1);
            expect(result.economicClimate).toBe('stable');
            expect(result.unemploymentRate).toBe(5.0);
            expect(Array.isArray(result.changes)).toBe(true);
        });

        it('should append a random event when Math.random()>0.7', () => {
            // climate: 0.5 (no change), business health variations: 0.5 x5, event roll: 0.8, event pick: 0.0
            randomSpy
                .mockReturnValueOnce(0.5) // climate
                .mockReturnValueOnce(0.5)
                .mockReturnValueOnce(0.5)
                .mockReturnValueOnce(0.5)
                .mockReturnValueOnce(0.5)
                .mockReturnValueOnce(0.5) // 5 businesses
                .mockReturnValueOnce(0.8) // event roll
                .mockReturnValueOnce(0.0); // event index

            const result = system.processWeeklyChanges();

            expect(result.changes.some(c => c.type === 'new_business')).toBe(true);
        });
    });

    describe('updateUnemploymentRate', () => {
        it('should raise unemployment when businesses close', () => {
            const startup = system.businesses.find(b => b.type === 'startup');
            startup.closed = true;

            system.updateUnemploymentRate();

            expect(system.worldState.unemploymentRate).toBeGreaterThan(5.0);
        });
    });
});
