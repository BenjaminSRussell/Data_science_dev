/**
 * MapSystemInitializer.js
 * Ensures map renderer is initialized when map screen is shown
 */

import { MapRenderer } from './MapRenderer.js';

export function initializeMapRenderer(game) {
    const mapContainer = document.getElementById('world-map');
    if (!mapContainer) {
        console.warn('Map container not found');
        return;
    }

    if (!game.mapRenderer) {
        try {
            game.mapRenderer = new MapRenderer(mapContainer, game);
            game.mapRenderer.initialize();

        } catch (error) {
            console.error('Failed to initialize map renderer:', error);
        }
    }
}
