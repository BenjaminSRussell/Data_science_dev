import { UILayerManager } from '../../src/js/ui/UILayerManager';
import { expect } from 'chai';
import sinon from 'sinon';

describe('UILayerManager', () => {
    let uiLayerManager;
    let consoleSpy;

    beforeEach(() => {
        uiLayerManager = new UILayerManager();
        consoleSpy = sinon.spy(console, 'warn');
    });

    afterEach(() => {
        consoleSpy.restore();
    });

    it('getZIndex(\'background\') returns 0', () => {
        expect(uiLayerManager.getZIndex('background')).to.equal(0);
    });

    it('getZIndex(\'nonexistent\') also returns 0', () => {
        expect(uiLayerManager.getZIndex('nonexistent')).to.equal(0);
    });

    it('addToLayer(element, \'background\') warns and does not track', () => {
        const element = { style: {} };
        uiLayerManager.addToLayer(element, 'background');
        expect(consoleSpy.calledOnceWithExactly('Layer \'background\' does not exist')).to.be.true;
        expect(uiLayerManager.getLayerElements('background')).to.be.empty;
    });

    it('addToLayer(element, \'ui\') sets zIndex to 200 and tracks', () => {
        const element = { style: {} };
        uiLayerManager.addToLayer(element, 'ui');
        expect(element.style.zIndex).to.equal('200');
        expect(uiLayerManager.getLayerElements('ui')).to.deep.equal([element]);
    });

    it('addToLayer(element, \'made-up-layer\') warns and does not track', () => {
        const element = { style: {} };
        uiLayerManager.addToLayer(element, 'made-up-layer');
        expect(consoleSpy.calledOnceWithExactly('Layer \'made-up-layer\' does not exist')).to.be.true;
        expect(uiLayerManager.getLayerElements('made-up-layer')).to.be.empty;
    });

    it('createLayer(\'background\', 999) silently overwrites zIndex', () => {
        uiLayerManager.createLayer('background', 999);
        expect(uiLayerManager.getZIndex('background')).to.equal(999);
        expect(consoleSpy.notCalled).to.be.true;
    });

    it('createLayer(\'ui\', 999) warns and does not overwrite zIndex', () => {
        uiLayerManager.createLayer('ui', 999);
        expect(uiLayerManager.getZIndex('ui')).to.equal(200);
        expect(consoleSpy.calledOnceWithExactly('Layer \'ui\' already exists')).to.be.true;
    });

    it('bringToFront(element) sets zIndex to \'-Infinity\' when no elements in layer', () => {
        const element = { style: {} };
        uiLayerManager.bringToFront(element);
        expect(element.style.zIndex).to.equal('-Infinity');
    });

    it('moveToLayer(element, newLayer) moves element between layers', () => {
        const element = { style: {} };
        uiLayerManager.addToLayer(element, 'background');
        uiLayerManager.moveToLayer(element, 'ui');
        expect(uiLayerManager.getLayerElements('background')).to.be.empty;
        expect(uiLayerManager.getLayerElements('ui')).to.deep.equal([element]);
    });

    it('clearLayer(layer) removes elements from DOM and resets array', () => {
        const element = { style: {}, parentNode: { removeChild: sinon.stub() } };
        uiLayerManager.addToLayer(element, 'background');
        uiLayerManager.clearLayer('background');
        expect(element.parentNode.removeChild.calledOnceWithExactly(element)).to.be.true;
        expect(uiLayerManager.getLayerElements('background')).to.be.empty;
    });

    it('getLayerInfo() returns correct zIndex/elementCount per layer', () => {
        const element1 = { style: {} };
        const element2 = { style: {} };
        uiLayerManager.addToLayer(element1, 'ui');
        uiLayerManager.addToLayer(element2, 'ui');
        const info = uiLayerManager.getLayerInfo();
        expect(info.ui.zIndex).to.equal(200);
        expect(info.ui.elementCount).to.equal(2);
    });
});