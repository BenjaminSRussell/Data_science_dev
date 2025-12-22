/**
 * WorldMapRenderer.js
 * Stub implementation - disabled to prevent import errors
 * This file is kept for backward compatibility but is not actively used
 */

export class WorldMapRenderer {
    constructor(container, game) {
        this.container = container;
        this.game = game;
        this.rendered = false;
    }

    initialize() {
        console.warn('WorldMapRenderer is disabled - use UnifiedMapSystem instead');
        this.rendered = true;
    }

    update() {
        // No-op
    }

    zoomToLocalMap(area) {
        console.warn('WorldMapRenderer is disabled - use UnifiedMapSystem instead');
    }

    showWorldMap() {
        console.warn('WorldMapRenderer is disabled - use UnifiedMapSystem instead');
    }
}
