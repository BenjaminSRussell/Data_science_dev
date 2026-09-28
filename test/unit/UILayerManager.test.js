import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UILayerManager } from '../../src/js/ui/UILayerManager.js';

describe('UILayerManager', () => {
    let uiLayerManager;
    let consoleSpy;

    beforeEach(() => {
        document.body.innerHTML = '';
        uiLayerManager = new UILayerManager();
        consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('getZIndex(\'background\') returns 0', () => {
        expect(uiLayerManager.getZIndex('background')).toBe(0);
    });

    it('getZIndex(\'nonexistent\') also returns 0', () => {
        expect(uiLayerManager.getZIndex('nonexistent')).toBe(0);
    });

    it('addToLayer(element, \'ui\') sets zIndex to 200 and tracks', () => {
        const element = document.createElement('div');
        uiLayerManager.addToLayer(element, 'ui');
        expect(element.style.zIndex).toBe('200');
        expect(uiLayerManager.getLayerElements('ui')).toEqual([element]);
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('addToLayer(element, \'made-up-layer\') warns and does not track', () => {
        const element = document.createElement('div');
        uiLayerManager.addToLayer(element, 'made-up-layer');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('Layer made-up-layer does not exist');
        expect(element.style.zIndex).toBe('');
        expect(uiLayerManager.getLayerElements('made-up-layer')).toEqual([]);
    });

    it('createLayer(\'ui\', 999) warns and does not overwrite zIndex', () => {
        uiLayerManager.createLayer('ui', 999);
        expect(uiLayerManager.getZIndex('ui')).toBe(200);
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('Layer ui already exists');
    });

    it('bringToFront(element) raises the element above the others in its layer', () => {
        const first = document.createElement('div');
        const second = document.createElement('div');
        uiLayerManager.addToLayer(first, 'ui');
        uiLayerManager.addToLayer(second, 'ui');

        uiLayerManager.bringToFront(first);

        expect(first.style.zIndex).toBe('201');
        expect(second.style.zIndex).toBe('200');
    });

    it('moveToLayer(element, newLayer) moves element between layers', () => {
        const element = document.createElement('div');
        uiLayerManager.addToLayer(element, 'game');
        expect(uiLayerManager.getLayerElements('game')).toEqual([element]);

        uiLayerManager.moveToLayer(element, 'ui');

        expect(uiLayerManager.getLayerElements('game')).toEqual([]);
        expect(uiLayerManager.getLayerElements('ui')).toEqual([element]);
        expect(element.style.zIndex).toBe('200');
    });

    it('clearLayer(layer) removes elements from DOM and resets array', () => {
        const attached = document.createElement('div');
        const detached = document.createElement('div');
        document.body.appendChild(attached);
        uiLayerManager.addToLayer(attached, 'ui');
        uiLayerManager.addToLayer(detached, 'ui');
        expect(document.body.contains(attached)).toBe(true);

        uiLayerManager.clearLayer('ui');

        expect(document.body.contains(attached)).toBe(false);
        expect(attached.parentNode).toBeNull();
        expect(uiLayerManager.getLayerElements('ui')).toEqual([]);
    });

    it('getLayerInfo() returns correct zIndex/elementCount per layer', () => {
        uiLayerManager.addToLayer(document.createElement('div'), 'ui');
        uiLayerManager.addToLayer(document.createElement('div'), 'ui');
        uiLayerManager.addToLayer(document.createElement('div'), 'modal');

        const info = uiLayerManager.getLayerInfo();

        expect(Object.keys(info)).toEqual([
            'background', 'map', 'game', 'ui', 'modal', 'tooltip', 'debug', 'cursor'
        ]);
        expect(info.ui).toEqual({ zIndex: 200, elementCount: 2 });
        expect(info.modal).toEqual({ zIndex: 300, elementCount: 1 });
        expect(info.game).toEqual({ zIndex: 100, elementCount: 0 });
        expect(info.background).toEqual({ zIndex: 0, elementCount: 0 });
    });
});
