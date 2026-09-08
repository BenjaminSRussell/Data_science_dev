/**
 * Unit tests for MapRoadRenderer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MapRoadRenderer } from '../../src/js/game/MapRoadRenderer.js';

describe('MapRoadRenderer', () => {
    let renderer;
    let gridSystem;
    let roadSystem;
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        gridSystem = {
            getRoads: () => [],
            getIntersections: () => []
        };

        roadSystem = {
            tileSize: 32
        };

        renderer = new MapRoadRenderer(container, gridSystem, roadSystem);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('render', () => {
        it('should clear existing road elements', () => {
            const roadElement = document.createElement('div');
            roadElement.id = 'road-1';
            container.appendChild(roadElement);

            renderer.render();
            expect(container.children.length).toBe(0);
        });

        it('should render roads', () => {
            const road = { id: 'road-1', type: 'horizontal', x: 0, y: 0, length: 100 };
            gridSystem.getRoads = () => [road];

            renderer.render();
            expect(container.children.length).toBe(1);
            expect(container.children[0].id).toBe('road-1');
            expect(container.children[0].style.width).toBe('100px');
            expect(container.children[0].style.height).toBe('32px');
        });

        it('should render intersections', () => {
            const intersection = { id: 'intersection-1', x: 0, y: 0, hRoad: { width: 100 }, vRoad: { width: 50 } };
            gridSystem.getIntersections = () => [intersection];

            renderer.render();
            expect(container.children.length).toBe(1);
            expect(container.children[0].id).toBe('intersection-1');
            expect(container.children[0].style.width).toBe('100px');
            expect(container.children[0].style.height).toBe('100px');
        });
    });

    describe('renderRoad', () => {
        it('should render horizontal road', () => {
            const road = { id: 'road-1', type: 'horizontal', x: 0, y: 0, length: 100 };
            renderer.renderRoad(road);
            expect(container.children.length).toBe(1);
            expect(container.children[0].id).toBe('road-1');
            expect(container.children[0].style.width).toBe('100px');
            expect(container.children[0].style.height).toBe('32px');
        });

        it('should render vertical road', () => {
            const road = { id: 'road-2', type: 'vertical', x: 0, y: 0, length: 100 };
            renderer.renderRoad(road);
            expect(container.children.length).toBe(1);
            expect(container.children[0].id).toBe('road-2');
            expect(container.children[0].style.width).toBe('32px');
            expect(container.children[0].style.height).toBe('100px');
        });
    });

    describe('renderIntersection', () => {
        it('should render intersection with max road width', () => {
            const intersection = { id: 'intersection-1', x: 0, y: 0, hRoad: { width: 100 }, vRoad: { width: 50 } };
            renderer.renderIntersection(intersection);
            expect(container.children.length).toBe(1);
            expect(container.children[0].id).toBe('intersection-1');
            expect(container.children[0].style.width).toBe('100px');
            expect(container.children[0].style.height).toBe('100px');
        });
    });

    describe('clear', () => {
        it('should remove all DOM nodes', () => {
            const roadElement = document.createElement('div');
            roadElement.id = 'road-1';
            container.appendChild(roadElement);

            renderer.clear();
            expect(container.children.length).toBe(0);
        });
    });
});