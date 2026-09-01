import UILayerManager from '../../src/js/ui/UILayerManager';

describe('UILayerManager', () => {
    let uiLayerManager;

    beforeEach(() => {
        uiLayerManager = new UILayerManager();
    });

    describe('getZIndex', () => {
        it('returns known layer z-index', () => {
            uiLayerManager.createLayer('layer1', 10);
            expect(uiLayerManager.getZIndex('layer1')).toBe(10);
        });

        it('returns 0 for unknown layer', () => {
            expect(uiLayerManager.getZIndex('unknownLayer')).toBe(0);
        });
    });

    describe('createLayer', () => {
        it('creates a new layer with unique name', () => {
            uiLayerManager.createLayer('layer1', 10);
            expect(uiLayerManager.getZIndex('layer1')).toBe(10);
        });

        it('warns and does not overwrite existing layer', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            uiLayerManager.createLayer('layer1', 10);
            uiLayerManager.createLayer('layer1', 20);
            expect(consoleWarnSpy).toHaveBeenCalled();
            expect(uiLayerManager.getZIndex('layer1')).toBe(10);
            consoleWarnSpy.mockRestore();
        });
    });

    describe('addToLayer', () => {
        it('pushes element into the right layer and sets z-index', () => {
            const element = { style: { zIndex: '' } };
            uiLayerManager.createLayer('layer1', 10);
            uiLayerManager.addToLayer(element, 'layer1');
            expect(uiLayerManager.layers.get('layer1').elements).toContain(element);
            expect(element.style.zIndex).toBe('10');
        });

        it('warns and does nothing for unknown layer', () => {
            const element = { style: { zIndex: '' } };
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            uiLayerManager.addToLayer(element, 'unknownLayer');
            expect(consoleWarnSpy).toHaveBeenCalled();
            expect(uiLayerManager.layers.get('unknownLayer')).toBeUndefined();
            consoleWarnSpy.mockRestore();
        });
    });

    describe('bringToFront', () => {
        it('brings element to front with multiple elements in a layer', () => {
            const element1 = { style: { zIndex: '' } };
            const element2 = { style: { zIndex: '' } };
            uiLayerManager.createLayer('layer1', 10);
            uiLayerManager.addToLayer(element1, 'layer1');
            uiLayerManager.addToLayer(element2, 'layer1');
            uiLayerManager.bringToFront(element1);
            expect(parseInt(element1.style.zIndex)).toBeGreaterThan(parseInt(element2.style.zIndex));
        });

        it('handles -Infinity scenario if layer is empty', () => {
            const element = { style: { zIndex: '' } };
            uiLayerManager.createLayer('layer1', 10);
            uiLayerManager.bringToFront(element);
            expect(parseInt(element.style.zIndex)).toBe(1);
        });
    });

    describe('moveToLayer', () => {
        it('moves element from old layer to new layer', () => {
            const element = { style: { zIndex: '' } };
            uiLayerManager.createLayer('layer1', 10);
            uiLayerManager.createLayer('layer2', 20);
            uiLayerManager.addToLayer(element, 'layer1');
            uiLayerManager.moveToLayer(element, 'layer2');
            expect(uiLayerManager.layers.get('layer1').elements).not.toContain(element);
            expect(uiLayerManager.layers.get('layer2').elements).toContain(element);
            expect(parseInt(element.style.zIndex)).toBe(20);
        });
    });

    describe('clearLayer', () => {
        it('removes all elements from layer', () => {
            const element1 = { style: { zIndex: '' } };
            const element2 = { style: { zIndex: '' } };
            uiLayerManager.createLayer('layer1', 10);
            uiLayerManager.addToLayer(element1, 'layer1');
            uiLayerManager.addToLayer(element2, 'layer1');
            uiLayerManager.clearLayer('layer1');
            expect(uiLayerManager.layers.get('layer1').elements.length).toBe(0);
        });
    });
});