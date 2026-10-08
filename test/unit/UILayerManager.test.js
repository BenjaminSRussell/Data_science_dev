import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UILayerManager } from '../../src/js/ui/UILayerManager.js';

const el = () => ({ style: { zIndex: '' } });

describe('UILayerManager (#145)', () => {
    let m;
    let warn;
    beforeEach(() => {
        m = new UILayerManager();
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => vi.restoreAllMocks());

    it('getZIndex returns layer bases and 0 for unknown layers', () => {
        expect(m.getZIndex('background')).toBe(0);
        expect(m.getZIndex('modal')).toBe(300);
        expect(m.getZIndex('nonexistent')).toBe(0);
    });

    it('createLayer adds new layers and refuses to overwrite existing ones', () => {
        m.createLayer('overlay', 700);
        expect(m.getZIndex('overlay')).toBe(700);
        expect(m.getLayerElements('overlay')).toEqual([]);
        m.createLayer('ui', 999);
        expect(m.getZIndex('ui')).toBe(200);
        expect(warn).toHaveBeenCalledWith('Layer ui already exists');
    });

    it('addToLayer sets the z-index and tracks the element (background included)', () => {
        const a = el();
        m.addToLayer(a, 'background');
        expect(a.style.zIndex).toBe('0');
        expect(m.getLayerElements('background')).toEqual([a]);
        const b = el();
        m.addToLayer(b, 'ui');
        expect(b.style.zIndex).toBe('200');
        expect(m.getLayerElements('ui')).toEqual([b]);
    });

    it('addToLayer stacks newer elements above older ones and never double-tracks', () => {
        const a = el();
        const b = el();
        m.addToLayer(a, 'ui');
        m.addToLayer(b, 'ui');
        m.addToLayer(a, 'ui');
        expect(m.getLayerElements('ui')).toEqual([a, b]);
        expect(Number(b.style.zIndex)).toBeGreaterThan(Number(a.style.zIndex));
    });

    it('addToLayer warns for unknown layers and does not track', () => {
        const a = el();
        m.addToLayer(a, 'made-up-layer');
        expect(warn).toHaveBeenCalledWith('Layer made-up-layer does not exist');
        expect(m.getLayerElements('made-up-layer')).toEqual([]);
        expect(a.style.zIndex).toBe('');
    });

    it('bringToFront puts the element above its layer peers', () => {
        const a = el();
        const b = el();
        const c = el();
        [a, b, c].forEach(x => m.addToLayer(x, 'ui'));
        expect(m.bringToFront(a)).toBe(true);
        const zs = [a, b, c].map(x => Number(x.style.zIndex));
        expect(zs[0]).toBe(Math.max(...zs));
        expect(zs.every(z => z >= 200 && z < 300)).toBe(true);
    });

    it('bringToFront on an untracked element in an empty layer never yields -Infinity', () => {
        const a = { style: { zIndex: '200' } };
        expect(m.bringToFront(a)).toBe(true);
        expect(a.style.zIndex).toBe('200');
        expect(m.getLayerElements('ui')).toEqual([a]);
        const loose = el();
        expect(m.bringToFront(loose)).toBe(false);
        expect(loose.style.zIndex).toBe('');
    });

    it('repeated bringToFront calls stay inside the layer band', () => {
        const items = [el(), el()];
        items.forEach(x => m.addToLayer(x, 'ui'));
        for (let i = 0; i < 500; i++) m.bringToFront(items[i % 2]);
        items.forEach(x => {
            expect(Number(x.style.zIndex)).toBeGreaterThanOrEqual(200);
            expect(Number(x.style.zIndex)).toBeLessThan(300);
        });
        expect(Number(items[1].style.zIndex)).toBeGreaterThan(Number(items[0].style.zIndex));
    });

    it('bringToFront finds the layer of an element that was already raised', () => {
        const a = el();
        const b = el();
        m.addToLayer(a, 'modal');
        m.addToLayer(b, 'modal');
        m.bringToFront(a);
        m.bringToFront(b);
        expect(Number(b.style.zIndex)).toBeGreaterThan(Number(a.style.zIndex));
    });

    it('moveToLayer moves between layers and aborts for unknown targets', () => {
        const a = el();
        m.addToLayer(a, 'background');
        expect(m.moveToLayer(a, 'ui')).toBe(true);
        expect(m.getLayerElements('background')).toEqual([]);
        expect(m.getLayerElements('ui')).toEqual([a]);
        expect(m.moveToLayer(a, 'nope')).toBe(false);
        expect(m.getLayerElements('ui')).toEqual([a]);
    });

    it('clearLayer removes elements from the DOM and resets tracking', () => {
        const removeChild = vi.fn();
        const a = { style: {}, parentNode: { removeChild } };
        m.addToLayer(a, 'background');
        m.clearLayer('background');
        expect(removeChild).toHaveBeenCalledWith(a);
        expect(m.getLayerElements('background')).toEqual([]);
    });

    it('getLayerInfo reports z-index and element count', () => {
        m.addToLayer(el(), 'ui');
        m.addToLayer(el(), 'ui');
        const info = m.getLayerInfo();
        expect(info.ui).toEqual({ zIndex: 200, elementCount: 2 });
        expect(info.cursor.elementCount).toBe(0);
    });
});
