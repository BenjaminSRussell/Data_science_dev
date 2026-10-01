import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorldEventManager } from '../../src/js/game/WorldEventManager.js';
import { StockMarket } from '../../src/js/game/StockMarket.js';

describe('WorldEventManager', () => {
    let mockGameState;
    let worldEventManager;

    beforeEach(() => {
        mockGameState = {
            money: 10000,
            characterStats: {
                ethics: 50
            },
            legalSystem: {
                hasLicense: vi.fn().mockReturnValue(true)
            },
            timeManager: {
                totalDays: 0
            },
            stockMarket: new StockMarket(),
            newsManager: {
                addNews: vi.fn()
            },
            worldMap: {
                updateLocation: vi.fn()
            }
        };

        // Initialize StockMarket with the mock gameState
        mockGameState.stockMarket = new StockMarket(mockGameState);

        worldEventManager = new WorldEventManager(mockGameState);
    });

    describe('market_crash event', () => {
        it('should have market_crash event in pool', () => {
            expect(worldEventManager.eventPool.market_crash).toBeDefined();
        });

        it('market_crash effect should call triggerCrash on stockMarket', () => {
            const triggerCrashSpy = vi.spyOn(mockGameState.stockMarket, 'triggerCrash');

            worldEventManager.eventPool.market_crash.effect(mockGameState);

            expect(triggerCrashSpy).toHaveBeenCalled();
            triggerCrashSpy.mockRestore();
        });

        it('market_crash effect should not throw an error', () => {
            expect(() => worldEventManager.eventPool.market_crash.effect(mockGameState)).not.toThrow();
        });

        it('market_crash effect should add news', () => {
            worldEventManager.eventPool.market_crash.effect(mockGameState);

            expect(mockGameState.newsManager.addNews).toHaveBeenCalled();
        });
    });

    describe('tech_boom event', () => {
        it('should have tech_boom event in pool', () => {
            expect(worldEventManager.eventPool.tech_boom).toBeDefined();
        });

        it('tech_boom effect should call triggerBoom on stockMarket', () => {
            const triggerBoomSpy = vi.spyOn(mockGameState.stockMarket, 'triggerBoom');

            worldEventManager.eventPool.tech_boom.effect(mockGameState);

            expect(triggerBoomSpy).toHaveBeenCalled();
            triggerBoomSpy.mockRestore();
        });

        it('tech_boom effect should not throw an error', () => {
            expect(() => worldEventManager.eventPool.tech_boom.effect(mockGameState)).not.toThrow();
        });

        it('tech_boom effect should update location', () => {
            worldEventManager.eventPool.tech_boom.effect(mockGameState);

            expect(mockGameState.worldMap.updateLocation).toHaveBeenCalled();
        });

        it('tech_boom effect should add news', () => {
            worldEventManager.eventPool.tech_boom.effect(mockGameState);

            expect(mockGameState.newsManager.addNews).toHaveBeenCalled();
        });
    });

    describe('triggerEvent integration', () => {
        it('should successfully trigger market_crash event', () => {
            const triggerCrashSpy = vi.spyOn(mockGameState.stockMarket, 'triggerCrash');

            worldEventManager.triggerEvent(worldEventManager.eventPool.market_crash);

            expect(triggerCrashSpy).toHaveBeenCalled();
            triggerCrashSpy.mockRestore();
        });

        it('should successfully trigger tech_boom event', () => {
            const triggerBoomSpy = vi.spyOn(mockGameState.stockMarket, 'triggerBoom');

            worldEventManager.triggerEvent(worldEventManager.eventPool.tech_boom);

            expect(triggerBoomSpy).toHaveBeenCalled();
            triggerBoomSpy.mockRestore();
        });

        it('should add event to events array when triggering market_crash', () => {
            const initialLength = worldEventManager.events.length;

            worldEventManager.triggerEvent(worldEventManager.eventPool.market_crash);

            expect(worldEventManager.events.length).toBe(initialLength + 1);
            expect(worldEventManager.events[worldEventManager.events.length - 1].id).toBe('market_crash');
        });

        it('should add event to events array when triggering tech_boom', () => {
            const initialLength = worldEventManager.events.length;

            worldEventManager.triggerEvent(worldEventManager.eventPool.tech_boom);

            expect(worldEventManager.events.length).toBe(initialLength + 1);
            expect(worldEventManager.events[worldEventManager.events.length - 1].id).toBe('tech_boom');
        });
    });
});
