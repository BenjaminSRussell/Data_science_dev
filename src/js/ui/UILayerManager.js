/**
 * UILayerManager.js
 * Manages UI layering and z-indexing
 * Ensures proper stacking order of UI elements
 */

export class UILayerManager {
    constructor() {
        // Define base layers
        this.layers = {
            background: 0,
            map: 50,
            game: 100,
            ui: 200,
            modal: 300,
            tooltip: 400,
            debug: 500,
            cursor: 1000
        };

        // Track elements in each layer
        this.layerElements = new Map();
        Object.keys(this.layers).forEach(layer => {
            this.layerElements.set(layer, []);
        });
    }

    /**
     * Get z-index for a layer
     */
    getZIndex(layer) {
        return layer in this.layers ? this.layers[layer] : 0;
    }

    /**
     * Create a new layer
     */
    createLayer(name, zIndex) {
        if (name in this.layers) {
            console.warn(`Layer ${name} already exists`);
            return;
        }

        this.layers[name] = zIndex;
        this.layerElements.set(name, []);
    }

    /**
     * Add element to a layer
     */
    addToLayer(element, layer) {
        if (!(layer in this.layers)) {
            console.warn(`Layer ${layer} does not exist`);
            return;
        }

        const zIndex = this.getZIndex(layer);
        element.style.zIndex = zIndex;
        
        // Track element
        if (!this.layerElements.has(layer)) {
            this.layerElements.set(layer, []);
        }
        this.layerElements.get(layer).push(element);
    }

    /**
     * Bring element to front of its layer
     */
    bringToFront(element) {
        const currentZIndex = parseInt(element.style.zIndex) || 0;
        
        // Find which layer this element belongs to
        let elementLayer = null;
        for (const [layer, zIndex] of Object.entries(this.layers)) {
            if (zIndex === currentZIndex) {
                elementLayer = layer;
                break;
            }
        }

        if (elementLayer) {
            const layerElements = this.layerElements.get(elementLayer) || [];
            const maxZIndex = Math.max(...layerElements.map(el => parseInt(el.style.zIndex) || 0));
            element.style.zIndex = maxZIndex + 1;
        }
    }

    /**
     * Move element to a different layer
     */
    moveToLayer(element, newLayer) {
        // Remove from old layer
        for (const [layer, elements] of this.layerElements.entries()) {
            const index = elements.indexOf(element);
            if (index !== -1) {
                elements.splice(index, 1);
                break;
            }
        }

        // Add to new layer
        this.addToLayer(element, newLayer);
    }

    /**
     * Get all elements in a layer
     */
    getLayerElements(layer) {
        return this.layerElements.get(layer) || [];
    }

    /**
     * Clear a layer
     */
    clearLayer(layer) {
        const elements = this.layerElements.get(layer) || [];
        elements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.layerElements.set(layer, []);
    }

    /**
     * Get layer info
     */
    getLayerInfo() {
        const info = {};
        for (const [layer, zIndex] of Object.entries(this.layers)) {
            info[layer] = {
                zIndex,
                elementCount: (this.layerElements.get(layer) || []).length
            };
        }
        return info;
    }
}








