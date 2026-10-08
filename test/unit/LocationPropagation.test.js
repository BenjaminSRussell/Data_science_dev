// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';
import { WorldMap } from '../../src/js/game/WorldMap.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { AITrainingStoryline } from '../../src/js/game/ai/AITrainingStoryline.js';
import { handleTravel } from '../../src/js/helpers/MapHelpers.js';

function makeGame() {
    const gameState = new GameState();
    const worldMap = new WorldMap(gameState);
    gameState.worldMap = worldMap;
    const setCurrentLocation = vi.fn();
    return {
        gameState, worldMap, setCurrentLocation,
        gameStore: { getState: () => ({ setCurrentLocation }) },
        handleTimeAdvance: vi.fn(), showToast: vi.fn(), showError: vi.fn(),
        screenManager: { showScreen: vi.fn() },
        uiUpdater: { updateLocationLayout: vi.fn() }
    };
}

function travel(game, id) {
    // Force reachability so these tests stay about state propagation (#990)
    game.worldMap.canTravelTo = () => ({ can: true });
    handleTravel(game, id);
}

describe('travel propagates currentLocation (#982, #990, #1987)', () => {
    it('gameState.currentLocation follows handleTravel and the store is updated', () => {
        const game = makeGame();
        travel(game, 'university');
        expect(game.gameState.currentLocation).toBe('university');
        expect(game.setCurrentLocation).toHaveBeenCalledWith('university');
    });

    it('the AI training gate sees the university', () => {
        const game = makeGame();
        travel(game, 'university');
        const ai = new AITrainingStoryline(game.gameState);
        const r = ai.startAITrainingProject('image_classifier');
        expect(r?.message || '').not.toMatch(/must be at the university/);
    });

    it('daily food cost reflects the current location', () => {
        const game = makeGame();
        const econ = new EconomySystem(game.gameState);
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const homeCost = econ.getDailyExpenses();
        travel(game, 'university');
        expect(econ.getDailyExpenses()).toBeGreaterThan(homeCost);
        vi.restoreAllMocks();
    });

    it('worldMap and gameState agree after every successful travel', () => {
        const game = makeGame();
        for (const id of ['university', 'coffee_shop', 'home']) {
            if (!game.worldMap.getLocation(id)) continue;
            travel(game, id);
            expect(game.gameState.currentLocation).toBe(game.worldMap.currentLocation);
            expect(game.gameState.currentLocation).toBe(id);
        }
    });

    it('falls back to the stored value before the map exists, and saves it', () => {
        const gs = new GameState();
        expect(gs.currentLocation).toBe('home');
        gs.currentLocation = 'office';
        expect(gs.currentLocation).toBe('office');
        expect(gs.toJSON().currentLocation).toBe('office');
    });
});
