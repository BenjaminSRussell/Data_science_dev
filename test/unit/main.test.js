import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { WorldMap } from '../../src/js/game/WorldMap.js';

describe('main.js', () => {
    let game;

    beforeAll(async () => {
        document.body.innerHTML = '<div id="world-map"></div>';
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

    describe('clicking a locked location', () => {
        let messages;
        let showToast;

        beforeAll(async () => {
            // init() attaches the map's click handler; wait until it answers
            game.worldMap = new WorldMap(game.gameState);
            const original = game.showToast;
            let answered = false;
            game.showToast = () => { answered = true; };
            await vi.waitFor(() => {
                clickLocked('city_hall');
                expect(answered).toBe(true);
            });
            game.showToast = original;
            document.getElementById('world-map').innerHTML = '';
        });

        beforeEach(() => {
            messages = [];
            showToast = game.showToast;
            game.showToast = (message, type) => messages.push({ message, type });
        });

        afterEach(() => {
            game.showToast = showToast;
            document.getElementById('world-map').innerHTML = '';
        });

        function clickLocked(locationId) {
            const el = document.createElement('div');
            el.className = 'map-location locked';
            el.dataset.location = locationId;
            document.getElementById('world-map').appendChild(el);
            el.click();
        }

        it('names the stat the location needs', () => {
            clickLocked('networking_bar');
            expect(messages).toEqual([
                { message: 'This location is locked. Requires Charisma 15.', type: 'error' }
            ]);
        });

        it('names the money the location needs', () => {
            clickLocked('bank');
            expect(messages).toEqual([
                { message: 'This location is locked. Requires $1,000.', type: 'error' }
            ]);
        });

        it('lists every requirement when there are several', () => {
            clickLocked('tech_hub');
            expect(messages).toEqual([
                { message: 'This location is locked. Requires Charisma 40 and 1,000 reputation.', type: 'error' }
            ]);
        });

        it('keeps the plain message for a location with no unlock requirement', () => {
            clickLocked('city_hall');
            expect(messages).toEqual([
                { message: 'This location is locked.', type: 'error' }
            ]);
        });
    });
});
