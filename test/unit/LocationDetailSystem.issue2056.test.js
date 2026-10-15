/**
 * Roommate's Door must reach RoommateSystem (#2056).
 */

import { describe, it, expect, vi } from 'vitest';
import { LocationDetailSystem } from '../../src/js/game/locations/LocationDetailSystem.js';
import { RoommateSystem } from '../../src/js/game/social/RoommateSystem.js';

describe("Roommate's Door action (#2056)", () => {
    it('delegates the roommate feature to RoommateSystem.interact(talk)', () => {
        const gameState = {};
        const roommateSystem = new RoommateSystem(gameState);
        gameState.roommateSystem = roommateSystem;
        const spy = vi.spyOn(roommateSystem, 'interact');
        const system = new LocationDetailSystem(gameState);

        const interaction = system.interactWithFeature('home', 'roommate_door');

        expect(interaction.action).toBe('roommate');
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith('talk');
        expect(interaction.result).toBe(spy.mock.results[0].value);
        expect(interaction.result.message).toContain('Alex');
        expect(roommateSystem.relationship).toBe(32);
    });

    it('does not fall through to the generic feature message', () => {
        const system = new LocationDetailSystem({});
        const result = system.executeAction('roommate', 'home', 'roommate_door');
        expect(result.message).not.toBe('You interact with roommate_door');
        expect(result.message).toBe('Your roommate is not around');
    });
});
