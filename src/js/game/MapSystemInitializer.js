/**
 * MapSystemInitializer.js
 * Ensures map renderer is initialized when map screen is shown
 */

import { MapRenderer } from './MapRenderer.js';

/**
 * Attach a map renderer to `game` once initialization finishes.
 * Returns true when `game.mapRenderer` is ready, false when the container
 * is missing or initialization throws so a later call can retry.
 * @param {object} game
 * @returns {boolean}
 */
export function initializeMapRenderer(game) {
    const mapContainer = document.getElementById('world-map');
    if (!mapContainer) {
        console.warn('Map container not found');
        return false;
    }

    // Already finished. A new renderer is published only after initialize()
    // returns, so a mid-init throw cannot leave a truthy broken renderer
    // that makes this guard skip every later call.
    if (game.mapRenderer) {
        return true;
    }

    try {
        const mapRenderer = new MapRenderer(mapContainer, game);
        mapRenderer.initialize();
        game.mapRenderer = mapRenderer;
        return true;
    } catch (error) {
        console.error('Failed to initialize map renderer:', error);
        return false;
    }
}
