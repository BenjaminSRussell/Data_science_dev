import { describe, it, expect, beforeEach } from 'vitest';
import { handleArrest } from '../../src/js/helpers/StockMarketHelpers.js';
import { GameState } from '../../src/js/game/GameState.js';
import { LegalSystem } from '../../src/js/game/LegalSystem.js';

describe('handleArrest', () => {
    let game;
    let toasts;

    beforeEach(() => {
        document.body.innerHTML = '<span id="jail-time-left"></span>';
        toasts = [];
        const gameState = new GameState();
        gameState.legalSystem = new LegalSystem(gameState);
        gameState.reputation = 1000;
        gameState.money = 20000;
        game = {
            gameState,
            screenManager: { showScreen() {} },
            audioManager: { play() {} },
            showToast: (message, type) => toasts.push({ message, type })
        };
    });

    function arrestWith(tier) {
        if (tier) {
            game.gameState.legalSystem.lawyer = tier;
        }
        handleArrest(game, 'insider trading');
        return game.gameState;
    }

    it('without a lawyer costs 30 days, $5,000 and half of reputation', () => {
        const state = arrestWith(null);

        expect(state.jailSentence).toBe(30);
        expect(state.money).toBe(15000);
        expect(state.reputation).toBe(500);
        expect(document.getElementById('jail-time-left').textContent).toBe('30 days');
    });

    it('with a cheap lawyer reduces every penalty by 20%', () => {
        const state = arrestWith('cheap');

        expect(state.jailSentence).toBe(24);
        expect(state.money).toBe(16000);
        expect(state.reputation).toBe(600);
    });

    it('with an average lawyer reduces every penalty by 40%', () => {
        const state = arrestWith('average');

        expect(state.jailSentence).toBe(18);
        expect(state.money).toBe(17000);
        expect(state.reputation).toBe(700);
    });

    it('with an expensive lawyer reduces every penalty by 60%', () => {
        const state = arrestWith('expensive');

        expect(state.jailSentence).toBe(12);
        expect(state.money).toBe(18000);
        expect(state.reputation).toBe(800);
    });

    it('never leaves more reputation with no lawyer than with one', () => {
        const without = arrestWith(null).reputation;

        game.gameState.reputation = 1000;
        const withCheap = arrestWith('cheap').reputation;

        expect(without).toBeLessThan(withCheap);
    });
});
