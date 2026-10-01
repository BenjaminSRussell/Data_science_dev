/**
 * Unit tests for WorldEventManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorldEventManager } from '../../src/js/game/WorldEventManager.js';

describe('WorldEventManager', () => {
    let worldEventManager;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            timeManager: {
                totalDays: 0
            },
            stockMarket: {
                triggerCrash: vi.fn(),
                triggerBoom: vi.fn()
            },
            newsManager: {
                addNews: vi.fn()
            },
            worldMap: {
                updateLocation: vi.fn()
            }
        };
        worldEventManager = new WorldEventManager(mockGameState);
    });

    describe('constructor', () => {
        it('should initialize with empty activeModifiers', () => {
            expect(worldEventManager.activeModifiers).toEqual([]);
            expect(worldEventManager.events).toEqual([]);
            expect(worldEventManager.eventPool).toBeDefined();
        });
    });

    describe('triggerEvent', () => {
        it('should add event to events list', () => {
            const event = worldEventManager.eventPool.market_crash;
            worldEventManager.triggerEvent(event);

            expect(worldEventManager.events.length).toBe(1);
            expect(worldEventManager.events[0].id).toBe(event.id);
        });

        it('should create active modifier with expiry when event triggered', () => {
            const event = worldEventManager.eventPool.market_crash;
            worldEventManager.triggerEvent(event);

            expect(worldEventManager.activeModifiers.length).toBe(1);
            expect(worldEventManager.activeModifiers[0].id).toBe(event.id);
            expect(worldEventManager.activeModifiers[0].expiry).toBeDefined();
        });

        it('should not trigger the same event twice (already active guard)', () => {
            const event = worldEventManager.eventPool.market_crash;

            // First trigger
            worldEventManager.triggerEvent(event);
            expect(worldEventManager.activeModifiers.length).toBe(1);

            // Try to trigger same event again - should not add duplicate
            worldEventManager.triggerEvent(event);
            expect(worldEventManager.activeModifiers.length).toBe(1);
        });

        it('should allow different events to be active simultaneously', () => {
            const crashEvent = worldEventManager.eventPool.market_crash;
            const boomEvent = worldEventManager.eventPool.tech_boom;

            worldEventManager.triggerEvent(crashEvent);
            worldEventManager.triggerEvent(boomEvent);

            expect(worldEventManager.activeModifiers.length).toBe(2);
        });

        it('should track event duration correctly', () => {
            const event = worldEventManager.eventPool.market_crash;
            worldEventManager.triggerEvent(event);

            const modifier = worldEventManager.activeModifiers[0];
            expect(modifier.duration).toBe(event.duration);
        });

        it('should call event effect function', () => {
            const event = worldEventManager.eventPool.market_crash;
            worldEventManager.triggerEvent(event);

            expect(mockGameState.stockMarket.triggerCrash).toHaveBeenCalled();
            expect(mockGameState.newsManager.addNews).toHaveBeenCalled();
        });
    });

    describe('processDay', () => {
        it('should remove expired modifiers', () => {
            const event = worldEventManager.eventPool.market_crash;

            // Trigger event at day 0
            worldEventManager.triggerEvent(event);
            expect(worldEventManager.activeModifiers.length).toBe(1);

            // Advance time beyond expiry (event expires at day 0 + 7 = 7, so advance to day 7 or beyond)
            mockGameState.timeManager.totalDays = 8;
            
            // Mock Math.random to prevent new events from triggering
            const originalRandom = Math.random;
            Math.random = vi.fn(() => 1.0); // Very high value to prevent any event rolls
            
            worldEventManager.processDay();

            expect(worldEventManager.activeModifiers.length).toBe(0);
            
            Math.random = originalRandom;
        });

        it('should trigger new events based on chance', () => {
            // Mock Math.random to guarantee an event is triggered
            const originalRandom = Math.random;
            Math.random = vi.fn(() => 0.0001); // Very low value to ensure event triggers

            worldEventManager.processDay();

            // Should have triggered at least one event since 0.0001 < 0.001 (market_crash chance)
            expect(worldEventManager.activeModifiers.length).toBeGreaterThan(0);

            Math.random = originalRandom;
        });

        it('should not allow event to re-trigger while active during daily check', () => {
            const event = worldEventManager.eventPool.market_crash;

            // Manually trigger an event
            worldEventManager.triggerEvent(event);
            expect(worldEventManager.activeModifiers.length).toBe(1);

            // Mock Math.random to prevent new events from triggering
            const originalRandom = Math.random;
            Math.random = vi.fn(() => 1.0); // Prevent event rolls
            
            // Simulate daily processing - event should still be active
            worldEventManager.processDay();

            // Same event should not be triggered again while active
            const activeIds = worldEventManager.activeModifiers.map(m => m.id);
            const crashCount = activeIds.filter(id => id === 'market_crash').length;
            expect(crashCount).toBe(1);
            
            Math.random = originalRandom;
        });
    });

    describe('serialization', () => {
        it('should serialize state correctly', () => {
            const event = worldEventManager.eventPool.market_crash;
            worldEventManager.triggerEvent(event);

            const json = worldEventManager.toJSON();
            expect(json.events.length).toBe(1);
            expect(json.activeModifiers.length).toBe(1);
        });

        it('should deserialize state correctly', () => {
            const event = worldEventManager.eventPool.market_crash;
            worldEventManager.triggerEvent(event);

            const json = worldEventManager.toJSON();

            const newManager = new WorldEventManager(mockGameState);
            newManager.fromJSON(json);

            expect(newManager.events.length).toBe(json.events.length);
            expect(newManager.activeModifiers.length).toBe(json.activeModifiers.length);
        });
    });
});
