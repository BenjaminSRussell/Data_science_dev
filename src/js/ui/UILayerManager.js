class UILayerManager {
    constructor() {
        this.layers = {
            background: document.getElementById('background-layer'),
            foreground: document.getElementById('foreground-layer')
        };
    }

    createLayer(layerName, container) {
        if (this.layers[layerName]) {
            console.warn(`Layer ${layerName} already exists`);
            return;
        }
        const newLayer = document.createElement('div');
        newLayer.id = layerName;
        container.appendChild(newLayer);
        this.layers[layerName] = newLayer;
    }

    addToLayer(element, layer) {
        if (!(layer in this.layers)) {
            console.warn(`Layer ${layer} does not exist`);
            return;
        }
        this.layers[layer].appendChild(element);
    }

    removeElementFromLayer(element, layer) {
        if (!(layer in this.layers)) {
            console.warn(`Layer ${layer} does not exist`);
            return;
        }
        this.layers[layer].removeChild(element);
    }

    clearLayer(layer) {
        if (!(layer in this.layers)) {
            console.warn(`Layer ${layer} does not exist`);
            return;
        }
        while (this.layers[layer].firstChild) {
            this.layers[layer].removeChild(this.layers[layer].firstChild);
        }
    }
}