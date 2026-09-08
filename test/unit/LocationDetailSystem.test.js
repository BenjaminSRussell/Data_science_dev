/**
 * Unit tests for LocationDetailSystem.executeAction
 * Full branch coverage of the switch statement (8 named cases + default)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LocationDetailSystem } from '../../src/js/game/locations/LocationDetailSystem.js';

describe('LocationDetailSystem.executeAction', () => {
    let system;

    beforeEach(() => {
        system = new LocationDetailSystem({});
    });

    it("'rest' returns { energy: 50, message: 'You rest and restore energy' }", () => {
        expect(system.executeAction('rest', 'home', 'bed')).toEqual({
            energy: 50,
            message: 'You rest and restore energy'
        });
    });

    it("'work' returns { skill: 1, message: 'You work on improving your skills' }", () => {
        expect(system.executeAction('work', 'home', 'desk')).toEqual({
            skill: 1,
            message: 'You work on improving your skills'
        });
    });

    it("'computer' returns { info: true, message: 'You check your computer' }", () => {
        expect(system.executeAction('computer', 'home', 'computer')).toEqual({
            info: true,
            message: 'You check your computer'
        });
    });

    it("'cook' returns { money: -5, energy: 10, message: 'You cook a meal' }", () => {
        expect(system.executeAction('cook', 'home', 'kitchen')).toEqual({
            money: -5,
            energy: 10,
            message: 'You cook a meal'
        });
    });

    it("'read' returns { skill: 2, message: 'You read and learn' }", () => {
        expect(system.executeAction('read', 'home', 'bookshelf')).toEqual({
            skill: 2,
            message: 'You read and learn'
        });
    });

    it("'coffee' returns { energy: 20, money: -3, message: 'You get coffee' }", () => {
        expect(system.executeAction('coffee', 'office', 'coffee_machine')).toEqual({
            energy: 20,
            money: -3,
            message: 'You get coffee'
        });
    });

    it("'gossip' returns { relationship: 1, message: 'You chat with coworkers' }", () => {
        expect(system.executeAction('gossip', 'office', 'water_cooler')).toEqual({
            relationship: 1,
            message: 'You chat with coworkers'
        });
    });

    it("'boss' returns { meeting: true, message: 'You meet with your boss' }", () => {
        expect(system.executeAction('boss', 'office', 'boss_office')).toEqual({
            meeting: true,
            message: 'You meet with your boss'
        });
    });

    it("default: 'unrecognized' returns { message: 'You interact with window' } using featureId", () => {
        expect(system.executeAction('unrecognized', 'home', 'window')).toEqual({
            message: 'You interact with window'
        });
    });
});
