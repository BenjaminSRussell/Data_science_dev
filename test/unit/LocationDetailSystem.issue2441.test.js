/**
 * Location tier must change numeric feature rewards (#2441).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LocationDetailSystem } from '../../src/js/game/locations/LocationDetailSystem.js';

describe('LocationDetailSystem.executeAction location tiers', () => {
    let system;

    beforeEach(() => {
        system = new LocationDetailSystem({});
    });

    it('assigns a prestige tier to every location', () => {
        for (const id of system.locationDetails.keys()) {
            expect(LocationDetailSystem.locationTier(id)).toBeGreaterThan(0);
            expect(LocationDetailSystem.LOCATION_TIERS[id]).toBe(LocationDetailSystem.locationTier(id));
        }
    });

    it('keeps starter work at skill 1 and pays more at the executive tower', () => {
        const home = system.interactWithFeature('home', 'desk');
        const tower = system.interactWithFeature('executive_tower', 'penthouse_office');

        expect(home.action).toBe('work');
        expect(tower.action).toBe('work');
        expect(home.result).toEqual({ skill: 1, message: 'You work on improving your skills' });
        expect(tower.result).toEqual({ skill: 3, message: 'You work on improving your skills' });
        expect(tower.result.skill).toBeGreaterThan(home.result.skill);
    });

    it('restores more energy in the mansion than in the starter apartment', () => {
        const home = system.interactWithFeature('home', 'bed');
        const mansion = system.interactWithFeature('mansion_district', 'your_mansion');

        expect(home.action).toBe('rest');
        expect(mansion.action).toBe('rest');
        expect(home.result).toEqual({ energy: 50, message: 'You rest and restore energy' });
        expect(mansion.result).toEqual({ energy: 150, message: 'You rest and restore energy' });
    });

    it('does not pay the same coffee reward at the office and the donut shop', () => {
        const office = system.interactWithFeature('office', 'coffee_machine');
        const donut = system.interactWithFeature('donut_shop', 'coffee');

        expect(office.action).toBe('coffee');
        expect(donut.action).toBe('coffee');
        expect(donut.result).toEqual({ energy: 20, money: -3, message: 'You get coffee' });
        expect(office.result).toEqual({ energy: 40, money: -6, message: 'You get coffee' });
        expect(office.result).not.toEqual(donut.result);
    });

    it('leaves tier-1 payout literals unchanged when locationId is missing or unknown', () => {
        expect(system.executeAction('work', undefined, 'desk')).toEqual({
            skill: 1,
            message: 'You work on improving your skills'
        });
        expect(system.executeAction('cook', 'not_a_place', 'kitchen')).toEqual({
            money: -5,
            energy: 10,
            message: 'You cook a meal'
        });
        expect(system.executeAction('read', 'home', 'bookshelf')).toEqual({
            skill: 2,
            message: 'You read and learn'
        });
        expect(system.executeAction('gossip', 'donut_shop', 'counter')).toEqual({
            relationship: 1,
            message: 'You chat with coworkers'
        });
    });

    it('does not scale flags or the default message', () => {
        expect(system.executeAction('computer', 'executive_tower', 'computer')).toEqual({
            info: true,
            message: 'You check your computer'
        });
        expect(system.executeAction('boss', 'mansion_district', 'boss_office')).toEqual({
            meeting: true,
            message: 'You meet with your boss'
        });
        expect(system.executeAction('unrecognized', 'executive_tower', 'window')).toEqual({
            message: 'You interact with window'
        });
    });

    it('scales read skill at the research center above the apartment bookshelf', () => {
        const home = system.executeAction('read', 'home', 'bookshelf');
        const lab = system.executeAction('read', 'research_center', 'library');
        expect(home.skill).toBe(2);
        expect(lab.skill).toBe(6);
        expect(lab.message).toBe(home.message);
    });
});
