/**
 * Unit tests for PositioningHelper DOM-application methods
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PositioningHelper } from '../../src/js/utils/PositioningHelper.js';

describe('PositioningHelper (DOM methods)', () => {
    let el;

    beforeEach(() => {
        el = document.createElement('div');
        document.body.appendChild(el);
    });

    afterEach(() => {
        el.remove();
    });

    describe('positionAtGrid', () => {
        it('sets absolute positioning with left/top percentages matching gridToPercent', () => {
            PositioningHelper.positionAtGrid(el, 5, 10, 30);
            const percent = PositioningHelper.gridToPercent(5, 10, 30);
            expect(el.style.position).toBe('absolute');
            expect(el.style.left).toBe(`${percent.x}%`);
            expect(el.style.top).toBe(`${percent.y}%`);
        });

        it('applies centering transform', () => {
            PositioningHelper.positionAtGrid(el, 5, 10, 30);
            expect(el.style.transform).toBe('translate(-50%, -50%)');
        });

        it('uses the provided grid size for the percentage math', () => {
            PositioningHelper.positionAtGrid(el, 1, 2, 10);
            expect(el.style.left).toBe('10%');
            expect(el.style.top).toBe('20%');
        });
    });

    describe('positionAtPercent', () => {
        it('sets left/top directly without grid math', () => {
            PositioningHelper.positionAtPercent(el, 25, 75);
            expect(el.style.position).toBe('absolute');
            expect(el.style.left).toBe('25%');
            expect(el.style.top).toBe('75%');
        });

        it('applies the same centering transform as positionAtGrid', () => {
            PositioningHelper.positionAtPercent(el, 25, 75);
            expect(el.style.transform).toBe('translate(-50%, -50%)');
        });
    });

    describe('positionAtPixels', () => {
        it('sets left/top in px units', () => {
            PositioningHelper.positionAtPixels(el, 120, 340);
            expect(el.style.position).toBe('absolute');
            expect(el.style.left).toBe('120px');
            expect(el.style.top).toBe('340px');
        });

        it('does not apply a centering transform', () => {
            PositioningHelper.positionAtPixels(el, 120, 340);
            expect(el.style.transform).toBe('');
        });
    });

    describe('centerElement', () => {
        it('centers on both axes with 50% top/left and translate', () => {
            PositioningHelper.centerElement(el);
            expect(el.style.position).toBe('absolute');
            expect(el.style.top).toBe('50%');
            expect(el.style.left).toBe('50%');
            expect(el.style.transform).toBe('translate(-50%, -50%)');
        });
    });

    describe('centerHorizontal', () => {
        it('sets only left and translateX', () => {
            PositioningHelper.centerHorizontal(el);
            expect(el.style.position).toBe('absolute');
            expect(el.style.left).toBe('50%');
            expect(el.style.transform).toBe('translateX(-50%)');
            expect(el.style.top).toBe('');
        });
    });

    describe('centerVertical', () => {
        it('sets only top and translateY', () => {
            PositioningHelper.centerVertical(el);
            expect(el.style.position).toBe('absolute');
            expect(el.style.top).toBe('50%');
            expect(el.style.transform).toBe('translateY(-50%)');
            expect(el.style.left).toBe('');
        });
    });

    describe('image position helpers', () => {
        it('setCharacterImagePosition: object-fit contain, object-position center bottom', () => {
            const img = document.createElement('img');
            PositioningHelper.setCharacterImagePosition(img);
            expect(img.style.objectFit).toBe('contain');
            expect(img.style.objectPosition).toBe('center bottom');
        });

        it('setBuildingImagePosition: object-fit contain, object-position center bottom', () => {
            const img = document.createElement('img');
            PositioningHelper.setBuildingImagePosition(img);
            expect(img.style.objectFit).toBe('contain');
            expect(img.style.objectPosition).toBe('center bottom');
        });

        it('setIconImagePosition: object-fit contain, object-position center center', () => {
            const img = document.createElement('img');
            PositioningHelper.setIconImagePosition(img);
            expect(img.style.objectFit).toBe('contain');
            expect(img.style.objectPosition).toBe('center center');
        });
    });

    describe('createPositionedElement', () => {
        const config = {
            tag: 'img',
            className: 'npc-1',
            position: { x: 5, y: 5 },
            coordinateSystem: 'grid',
            size: { width: 64, height: 'auto' },
            layer: 'ui',
            imagePosition: 'character'
        };

        it('creates a single <img class="npc-1"> positioned on the grid and centered', () => {
            const created = PositioningHelper.createPositionedElement(config);
            expect(created.tagName).toBe('IMG');
            expect(created.className).toBe('npc-1');
            const percent = PositioningHelper.gridToPercent(5, 5, 30);
            expect(created.style.position).toBe('absolute');
            expect(created.style.left).toBe(`${percent.x}%`);
            expect(created.style.top).toBe(`${percent.y}%`);
            expect(created.style.transform).toBe('translate(-50%, -50%)');
        });

        it('applies width 64px but no explicit height when height is auto', () => {
            const created = PositioningHelper.createPositionedElement(config);
            expect(created.style.width).toBe('64px');
            expect(created.style.height).toBe('');
        });

        it('sets z-index from the ui layer', () => {
            const created = PositioningHelper.createPositionedElement(config);
            expect(created.style.zIndex).toBe('200');
        });

        it('applies character image-position styles to an img element', () => {
            const created = PositioningHelper.createPositionedElement(config);
            expect(created.style.objectFit).toBe('contain');
            expect(created.style.objectPosition).toBe('center bottom');
        });

        it('does not apply image-position styles when tag is not img', () => {
            const created = PositioningHelper.createPositionedElement({ ...config, tag: 'div' });
            expect(created.tagName).toBe('DIV');
            expect(created.style.objectFit).toBe('');
            expect(created.style.objectPosition).toBe('');
        });
    });
});
