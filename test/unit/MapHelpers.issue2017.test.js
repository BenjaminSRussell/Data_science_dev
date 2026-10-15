/**
 * updatePlayerMarker used a game.mapManager branch nothing in the live app sets (#2017)
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { playerMarkerPercent } from '../../src/js/helpers/MapHelpers.js';
import { WORLD_GRID_SIZE } from '../../src/js/config/mapGrid.js';

describe('player marker grid (#2017)', () => {
    it('uses UnifiedMapSystem.gridSize and ignores game.mapManager', () => {
        const game = {
            mapManager: { gridToPercent: () => ({ x: 1, y: 2 }) },
            unifiedMapSystem: { gridSize: 40 }
        };
        expect(playerMarkerPercent(game, { x: 10, y: 20 })).toEqual({ x: 25, y: 50 });
    });

    it('uses WORLD_GRID_SIZE when the live map is not constructed yet', () => {
        const game = { mapManager: { gridToPercent: () => ({ x: 1, y: 1 }) } };
        expect(playerMarkerPercent(game, { x: 15, y: 0 })).toEqual({
            x: (15 / WORLD_GRID_SIZE) * 100,
            y: 0
        });
        expect(playerMarkerPercent(null, { x: 0, y: WORLD_GRID_SIZE })).toEqual({ x: 0, y: 100 });
    });

    it('updatePlayerMarker no longer branches on game.mapManager', () => {
        const src = fs.readFileSync('src/js/helpers/MapHelpers.js', 'utf8');
        const start = src.indexOf('function updatePlayerMarker');
        const end = src.indexOf('function updateVehicleDisplay');
        const body = src.slice(start, end);
        expect(start).toBeGreaterThan(-1);
        expect(body).not.toMatch(/mapManager/);
        expect(body).toMatch(/playerMarkerPercent\(game,/);
    });
});
