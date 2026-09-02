import * as PIXI from 'pixi.js';
import { MapHelpers } from './MapHelpers';

export class UnifiedMapSystem {
    constructor(gameState, containerId) {
        this.gameState = gameState;
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.app = null;
        this.rendered = false;
        this.currentView = 'world';
        this.layerOrder = ['grass', 'zones', 'parks', 'water', 'mountains', 'roads', 'buildings', 'settlements', 'locations', 'ui'];
        this.layers = {};
        this.initialize();
    }

    async initialize() {
        if (this.rendered) return;
        if (!this.container) return;

        const width = this.container.clientWidth || this.container.parentElement.clientWidth || 800;
        const height = this.container.clientHeight || this.container.parentElement.clientHeight || 600;

        this.app = new PIXI.Application({ width, height, antialias: true });
        this.container.appendChild(this.app.view);

        this.createLayers();
        this.renderWorldMap();
        this.rendered = true;

        this.app.renderer.resize(width, height);
        this.app.ticker.add(this.update.bind(this));
    }

    createLayers() {
        this.layerOrder.forEach(name => {
            this.layers[name] = new PIXI.Container();
            this.app.stage.addChild(this.layers[name]);
        });
    }

    handleResize() {
        const width = this.container.clientWidth || this.container.parentElement.clientWidth || 800;
        const height = this.container.clientHeight || this.container.parentElement.clientHeight || 600;

        if (width > 0 && height > 0) {
            this.app.renderer.resize(width, height);
            if (this.rendered) {
                this.reRender();
            }
        }
    }

    update() {
        if (!this.rendered) {
            this.initialize();
            return;
        }

        if (this.currentView === 'local') {
            this.layers.locations.removeChildren();
            this.layers.ui.removeChildren();
            this.renderLocalLocations();
            this.renderPlayerMarker();
        } else if (this.currentView === 'world') {
            // Ensure the world map is re-rendered if necessary
            this.reRender();
        }
    }

    reRender() {
        if (this.currentView === 'world') {
            this.layers.locations.removeChildren();
            this.layers.ui.removeChildren();
            this.renderWorldMap();
        }
    }

    renderWorldMap() {
        // Implementation of rendering the world map
        MapHelpers.renderMap(this.layers, 'world');
    }

    renderLocalLocations() {
        // Implementation of rendering local locations
        MapHelpers.renderLocations(this.layers, this.gameState.player.location);
    }

    renderPlayerMarker() {
        // Implementation of rendering the player marker
        MapHelpers.renderPlayerMarker(this.layers, this.gameState.player.position);
    }

    destroy() {
        if (this.app) {
            this.app.destroy(true);
            this.app = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.rendered = false;
    }
}