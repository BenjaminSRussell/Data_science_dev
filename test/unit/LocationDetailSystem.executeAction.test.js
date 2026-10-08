/**
 * LocationDetailSystem.executeAction: every switch branch (#367)
 */
import { describe, it, expect } from 'vitest';
import { LocationDetailSystem } from '../../src/js/game/locations/LocationDetailSystem.js';

describe('LocationDetailSystem.executeAction', () => {
    const sys = new LocationDetailSystem({});
    const cases = [
        ['rest', { energy: 50, message: 'You rest and restore energy' }],
        ['work', { skill: 1, message: 'You work on improving your skills' }],
        ['computer', { info: true, message: 'You check your computer' }],
        ['cook', { money: -5, energy: 10, message: 'You cook a meal' }],
        ['read', { skill: 2, message: 'You read and learn' }],
        ['coffee', { energy: 20, money: -3, message: 'You get coffee' }],
        ['gossip', { relationship: 1, message: 'You chat with coworkers' }],
        ['boss', { meeting: true, message: 'You meet with your boss' }]
    ];
    for (const [action, expected] of cases) {
        it(`'${action}'`, () => {
            expect(sys.executeAction(action, 'home', 'x')).toEqual(expected);
        });
    }

    it('default interpolates the featureId, not the action or location', () => {
        expect(sys.executeAction('unrecognized', 'home', 'window')).toEqual({ message: 'You interact with window' });
    });

    it('cook costs money and read teaches double what work does', () => {
        expect(sys.executeAction('cook').money).toBeLessThan(0);
        expect(sys.executeAction('read').skill).toBe(2 * sys.executeAction('work').skill);
    });
});
