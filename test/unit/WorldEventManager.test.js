/**
 * Unit tests for WorldEventManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorldEventManager } from '../../src/js/game/WorldEventManager.js';

describe('WorldEventManager', () => {
    let manager;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            stockMarket: {
                triggerCrash: vi.fn(),
                triggerBoom: vi.fn()
            },
            worldMap: {
                updateLocation: vi.fn()
            },
            newsManager: {
                addNews: vi.fn()
            },
            timeManager: {
                totalDays: 42
            }
        };
        manager = new WorldEventManager(mockGameState);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with empty events and activeModifiers', () => {
            expect(manager.events).toEqual([]);
            expect(manager.activeModifiers).toEqual([]);
        });

        it('should define market_crash and tech_boom in the event pool', () => {
            expect(manager.eventPool.market_crash.chance).toBe(0.001);
            expect(manager.eventPool.tech_boom.chance).toBe(0.005);
        });
    });

    describe('processDay', () => {
        it('should trigger tech_boom when the roll succeeds', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.001); // < 0.005
            manager.processDay();

            expect(mockGameState.stockMarket.triggerBoom).toHaveBeenCalledTimes(1);
            expect(mockGameState.newsManager.addNews).toHaveBeenCalledTimes(1);
            expect(manager.events).toContainEqual({ id: 'tech_boom', day: 42 });
        });

        it('should skip tech_boom when the roll fails', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.999); // >= 0.005
            manager.processDay();

            expect(mockGameState.stockMarket.triggerBoom).not.toHaveBeenCalled();
            expect(mockGameState.newsManager.addNews).not.toHaveBeenCalled();
            expect(manager.events).toEqual([]);
        });

        it('should skip a conditioned event without evaluating chance when condition is falsy', () => {
            const randomSpy = vi.spyOn(Math, 'random');
            manager.eventPool.throwaway = {
                id: 'throwaway',
                name: 'Throwaway',
                chance: 1,
                condition: () => false,
                effect: vi.fn()
            };

            manager.processDay();

            expect(randomSpy).not.toHaveBeenCalled();
            expect(manager.eventPool.throwaway.effect).not.toHaveBeenCalled();
            expect(manager.events).toEqual([]);
        });
    });

    describe('triggerEvent', () => {
        it('should apply the tech_boom effect and record the event with the current day', () => {
            manager.triggerEvent(manager.eventPool.tech_boom);

            expect(mockGameState.stockMarket.triggerBoom).toHaveBeenCalledTimes(1);
            expect(mockGameState.worldMap.updateLocation).toHaveBeenCalledWith('library', expect.objectContaining({
                name: 'Innovation Hub'
            }));
            expect(mockGameState.newsManager.addNews).toHaveBeenCalledWith(expect.objectContaining({
                category: 'tech',
                sentiment: 'positive'
            }));
            expect(manager.events).toContainEqual({ id: 'tech_boom', day: 42 });
        });

        it('should default the recorded day to 0 when timeManager is missing', () => {
            delete mockGameState.timeManager;
            manager.triggerEvent(manager.eventPool.tech_boom);

            expect(manager.events).toContainEqual({ id: 'tech_boom', day: 0 });
        });

        it('should apply the market_crash effect', () => {
            manager.triggerEvent(manager.eventPool.market_crash);

            expect(mockGameState.stockMarket.triggerCrash).toHaveBeenCalledTimes(1);
            expect(mockGameState.newsManager.addNews).toHaveBeenCalledWith(expect.objectContaining({
                category: 'finance',
                sentiment: 'negative'
            }));
            expect(manager.events).toContainEqual({ id: 'market_crash', day: 42 });
        });
    });

    describe('serialization', () => {
        it('should round-trip events and activeModifiers through toJSON/fromJSON', () => {
            manager.events = [{ id: 'tech_boom', day: 5 }];
            manager.activeModifiers = [{ id: 'm1', type: 'boost', value: 1, expiry: 10 }];

            const data = manager.toJSON();
            expect(data).toEqual({
                events: [{ id: 'tech_boom', day: 5 }],
                activeModifiers: [{ id: 'm1', type: 'boost', value: 1, expiry: 10 }]
            });

            const restored = new WorldEventManager(mockGameState);
            restored.fromJSON(data);
            expect(restored.events).toEqual([{ id: 'tech_boom', day: 5 }]);
            expect(restored.activeModifiers).toEqual([{ id: 'm1', type: 'boost', value: 1, expiry: 10 }]);
        });

        it('should be a no-op when fromJSON receives null', () => {
            manager.events = [{ id: 'tech_boom', day: 5 }];
            manager.activeModifiers = [{ id: 'm1' }];

            manager.fromJSON(null);

            expect(manager.events).toEqual([{ id: 'tech_boom', day: 5 }]);
            expect(manager.activeModifiers).toEqual([{ id: 'm1' }]);
        });

        it('should reset events and activeModifiers to empty arrays when fromJSON receives {}', () => {
            manager.events = [{ id: 'tech_boom', day: 5 }];
            manager.activeModifiers = [{ id: 'm1' }];

            manager.fromJSON({});

            expect(manager.events).toEqual([]);
            expect(manager.activeModifiers).toEqual([]);
        });
    });
});
