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
        return this.layers[layer] || 0;
    }

    /**
     * Create a new layer
     */
    createLayer(name, zIndex) {
        if (Object.prototype.hasOwnProperty.call(this.layers, name)) {
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
        if (!Object.prototype.hasOwnProperty.call(this.layers, layer)) {
            console.warn(`Layer ${layer} does not exist`);
            return;
        }

        // Track element (once) in this layer only
        for (const [name, elements] of this.layerElements.entries()) {
            if (name === layer) continue;
            const index = elements.indexOf(element);
            if (index !== -1) elements.splice(index, 1);
        }
        if (!this.layerElements.has(layer)) {
            this.layerElements.set(layer, []);
        }
        const elements = this.layerElements.get(layer);
        if (!elements.includes(element)) elements.push(element);

        // Newer elements stack above older ones within the layer band
        element.style.zIndex = String(this.getZIndex(layer) + elements.indexOf(element));
    }

    /**
     * Bring element to front of its layer
     */
    bringToFront(element) {
        if (!element || !element.style) return false;

        // Prefer the layer the element is tracked in; otherwise pick the layer
        // whose band contains its z-index (highest base <= z-index)
        let elementLayer = null;
        for (const [layer, elements] of this.layerElements.entries()) {
            if (elements.includes(element)) {
                elementLayer = layer;
                break;
            }
        }
        if (!elementLayer) {
            const z = parseInt(element.style.zIndex, 10);
            if (!Number.isFinite(z)) return false;
            for (const [layer, base] of Object.entries(this.layers)) {
                if (base <= z && (elementLayer === null || base > this.layers[elementLayer])) {
                    elementLayer = layer;
                }
            }
        }
        if (!elementLayer) return false;

        // Re-stack the layer with this element on top. Indexes stay packed
        // just above the layer base, so repeated calls never drift into the
        // next layer and an empty layer can't produce -Infinity
        if (!this.layerElements.has(elementLayer)) this.layerElements.set(elementLayer, []);
        const peers = this.layerElements.get(elementLayer).filter(el => el !== element);
        peers.push(element);
        this.layerElements.set(elementLayer, peers);
        const base = this.layers[elementLayer];
        peers.forEach((el, index) => {
            el.style.zIndex = String(base + index);
        });
        return true;
    }

    /**
     * Move element to a different layer
     */
    moveToLayer(element, newLayer) {
        // Validate target first so we never strand the element (#2640)
        if (!Object.prototype.hasOwnProperty.call(this.layers, newLayer)) {
            console.warn(`Layer ${newLayer} does not exist — move aborted`);
            return false;
        }

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
        return true;
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








