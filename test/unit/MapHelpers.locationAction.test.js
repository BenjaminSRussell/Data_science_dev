/**
 * handleLocationAction shop actions (#1172)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleLocationAction } from '../../src/js/helpers/MapHelpers.js';
import { NPCManager } from '../../src/js/game/NPCManager.js';

function makeGame(money = 100) {
    return {
        gameState: { money },
        timeManager: { restoreEnergy: vi.fn() },
        uiUpdater: { updateAllUI: vi.fn() },
        audioManager: { play: vi.fn() },
        showToast: vi.fn(),
        showError: vi.fn()
    };
}

describe('handleLocationAction', () => {
    let game;
    beforeEach(() => { game = makeGame(); });

    it('unknown action leaves money alone', () => {
        handleLocationAction(game, 'not_a_real_action');
        expect(game.gameState.money).toBe(100);
        expect(game.showToast).not.toHaveBeenCalled();
    });

    it('insufficient funds shows an error and charges nothing', () => {
        game.gameState.money = 4;
        handleLocationAction(game, 'buy_donut');
        expect(game.showError).toHaveBeenCalledWith('Not enough money!');
        expect(game.gameState.money).toBe(4);
        expect(game.timeManager.restoreEnergy).not.toHaveBeenCalled();
    });

    it('buy_donut charges $5 and restores 10 energy via restoreEnergy', () => {
        handleLocationAction(game, 'buy_donut');
        expect(game.gameState.money).toBe(95);
        expect(game.timeManager.restoreEnergy).toHaveBeenCalledWith(10);
        expect(game.audioManager.play).toHaveBeenCalledWith('kaching');
    });

    it('buy_flowers charges $15 with no energy change', () => {
        handleLocationAction(game, 'buy_flowers');
        expect(game.gameState.money).toBe(85);
        expect(game.timeManager.restoreEnergy).not.toHaveBeenCalled();
    });

    it('coffee_network raises relationships with NPCs at the current location', () => {
        const gs = { money: 100, rankIndex: 10, reputation: 1e6, worldMap: { currentLocation: 'coffee_shop' } };
        const npcManager = new NPCManager(gs);
        const nearby = npcManager.getNPCsAtLocation('coffee_shop');
        expect(nearby.length).toBeGreaterThan(0);
        const before = nearby.map(n => npcManager.relationships[n.id] || 0);
        game.gameState = gs;
        game.npcManager = npcManager;
        handleLocationAction(game, 'coffee_network');
        const after = nearby.map(n => npcManager.relationships[n.id] || 0);
        after.forEach((v, i) => expect(v).toBeGreaterThanOrEqual(before[i]));
        expect(after.some((v, i) => v > before[i])).toBe(true);
        expect(game.showToast.mock.calls[0][0]).toMatch(/here\)$/);
    });

    it('boostNearbyRelationships returns 0 with no location or nobody there', () => {
        const npcManager = new NPCManager({ money: 0 });
        expect(npcManager.boostNearbyRelationships(2)).toBe(0);
        expect(npcManager.boostNearbyRelationships(2, 'nowhere')).toBe(0);
        expect(npcManager.boostNearbyRelationships(0, 'coffee_shop')).toBe(0);
    });
});
