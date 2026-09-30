import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DayNightCycle } from '../../src/js/game/DayNightCycle.js';

describe('DayNightCycle', () => {
    let gameState;
    let dayNightCycle;

    beforeEach(() => {
        gameState = {
            timeManager: {
                timeSlot: 0
            }
        };
        dayNightCycle = new DayNightCycle(gameState);

        // Mock document methods
        document.body.className = '';
        document.querySelector = vi.fn(() => null);
        document.body.classList = {
            add: vi.fn(),
            remove: vi.fn()
        };
    });

    it('should return correct time of day based on slot', () => {
        gameState.timeManager.timeSlot = 0;
        expect(dayNightCycle.getTimeOfDay()).toBe('morning');

        gameState.timeManager.timeSlot = 1;
        expect(dayNightCycle.getTimeOfDay()).toBe('morning');

        gameState.timeManager.timeSlot = 2;
        expect(dayNightCycle.getTimeOfDay()).toBe('noon');

        gameState.timeManager.timeSlot = 3;
        expect(dayNightCycle.getTimeOfDay()).toBe('noon');

        gameState.timeManager.timeSlot = 4;
        expect(dayNightCycle.getTimeOfDay()).toBe('night');

        gameState.timeManager.timeSlot = 5;
        expect(dayNightCycle.getTimeOfDay()).toBe('night');
    });

    it('should update current time of day when changed', () => {
        gameState.timeManager.timeSlot = 0;
        dayNightCycle.update();
        expect(dayNightCycle.currentTimeOfDay).toBe('morning');

        gameState.timeManager.timeSlot = 2;
        dayNightCycle.update();
        expect(dayNightCycle.currentTimeOfDay).toBe('noon');
    });

    it('should not have dead code methods getBackgroundColor and getMapOverlay', () => {
        expect(dayNightCycle.getBackgroundColor).toBeUndefined();
        expect(dayNightCycle.getMapOverlay).toBeUndefined();
    });

    it('should not have onTimeChange callback property', () => {
        expect(dayNightCycle.onTimeChange).toBeUndefined();
    });

    it('should only export getTimeOfDay and update as public API', () => {
        const publicMethods = Object.getOwnPropertyNames(
            Object.getPrototypeOf(dayNightCycle)
        ).filter(name => name !== 'constructor');

        expect(publicMethods).toContain('getTimeOfDay');
        expect(publicMethods).toContain('update');
        expect(publicMethods).toContain('updateMapAppearance');

        // Dead code should not exist
        expect(publicMethods).not.toContain('getBackgroundColor');
        expect(publicMethods).not.toContain('getMapOverlay');
    });
});
