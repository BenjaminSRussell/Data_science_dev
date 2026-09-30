import { GameState } from '../../src/js/game/GameState.js';
import { describe, it, expect } from 'vitest';

describe('Code Review #2400 - Dead Code Removal', () => {
    it('GameState should not initialize uiLayerManager property', () => {
        const gameState = new GameState();
        expect(gameState).not.toHaveProperty('uiLayerManager');
    });

    it('GameState instance should not have uiLayerManager after construction', () => {
        const gameState = new GameState();
        const keys = Object.keys(gameState);
        expect(keys).not.toContain('uiLayerManager');
    });
});
