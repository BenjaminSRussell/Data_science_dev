/**
 * gameStore.test.js
 *
 * ⚠️ CANARY TESTS — these intentionally assert the CURRENT (BROKEN) behavior.
 *
 * The Zustand store `useGameStore` (src/js/store/gameStore.js) and the
 * `GameState` class (src/js/game/GameState.js) hold parallel copies of the
 * same economy data (money, reputation, rank, bank, ...), but they are NOT
 * kept in sync automatically. Every gameplay-facing call site in
 * src/js/**/*.js mutates `GameState` directly (e.g. BankSystem.js,
 * EconomySystem.js, StockMarket.js, main.js) and never calls a gameStore
 * action; the only sync that exists is `syncGameStateToStore()`/`subscribe()`
 * inside a running `MainGame` instance in main.js.
 *
 * These tests pin down that divergence so that:
 *   1. The broken relationship is visible and testable today.
 *   2. Whoever eventually fixes the store/gameState divergence must UPDATE
 *      (not delete) these tests — flipping the assertions to prove the two
 *      are now in sync — so a future change cannot silently reintroduce the
 *      fork without a visible test failure.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/js/store/gameStore.js';
import { GameState } from '../../src/js/game/GameState.js';

describe('gameStore vs GameState divergence (canary)', () => {
    let gameState;

    beforeEach(() => {
        // Fresh, independent instances — exactly how they exist outside a
        // running MainGame instance.
        gameState = new GameState();
        useGameStore.getState().reset();
    });

    it('mutating GameState directly (as real gameplay code does) does NOT change the store', () => {
        const storeMoneyBefore = useGameStore.getState().money;
        const storeRepBefore = useGameStore.getState().reputation;

        // Typical gameplay mutation, the way BankSystem/EconomySystem/main.js do it:
        gameState.money -= 50;
        gameState.reputation += 10;

        // The store is untouched — the two state holders are independent today.
        expect(gameState.money).toBe(50);
        expect(useGameStore.getState().money).toBe(storeMoneyBefore);
        expect(useGameStore.getState().reputation).toBe(storeRepBefore);
    });

    it('calling a store action directly does NOT change GameState', () => {
        const gameStateMoneyBefore = gameState.money;
        const gameStateRepBefore = gameState.reputation;

        // Direct store action — only MainGame's sync/subscribe would push
        // this back to GameState, and there is no MainGame running here.
        useGameStore.getState().addMoney(50);
        useGameStore.getState().addReputation(10);

        // GameState is untouched — the store action has no effect on it.
        expect(useGameStore.getState().money).toBe(gameStateMoneyBefore + 50);
        expect(gameState.money).toBe(gameStateMoneyBefore);
        expect(gameState.reputation).toBe(gameStateRepBefore);
    });
});
