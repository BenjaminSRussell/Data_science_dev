import { describe, it, expect, beforeAll, afterEach } from 'vitest';

describe('main.js', () => {
    let game;

    beforeAll(async () => {
        await import('../../src/js/main.js');
        game = window.game;
    }, 60000);

    afterEach(() => {
        if (game?.gameLoopId) {
            cancelAnimationFrame(game.gameLoopId);
            game.gameLoopId = null;
        }
    });

    it('loads and starts the game', () => {
        expect(game).toBeDefined();
        expect(game.gameState.money).toBe(100);
    });

    describe('gameLoop', () => {
        it('runs a frame and schedules the next one', () => {
            expect(() => game.gameLoop(12345)).not.toThrow();
            expect(game.gameLoopId).toBeTruthy();
        });

        it('checks story beats once in a second that is a multiple of ten', () => {
            let checks = 0;
            game.storyBeatsSystem = {
                checkForTriggeredBeats() {
                    checks += 1;
                    return [];
                }
            };
            game.lastBeatCheckSecond = -1;

            game.gameLoop(20000);
            game.gameLoop(20016);
            game.gameLoop(21000);

            expect(checks).toBe(1);
        });
    });
});
