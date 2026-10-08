/**
 * MapRoadRenderer.js
 * Road rendering system for the city map
 * Creates road tiles, intersections, and markings
 */

import { MapRoadSystem } from './MapRoadSystem.js';

export class MapRoadRenderer {
    constructor(gridSystem, roadSystem, container) {
        this.gridSystem = gridSystem;
        this.roadSystem = roadSystem;
        this.container = container;
        this.roadElements = new Map();
    }

    /**
     * Render all roads
     */
    render() {
        this.clear();
        
        const roads = this.roadSystem.getRoads();
        const intersections = this.roadSystem.getIntersections();
        
        // Render road segments
        for (const road of roads) {
            this.renderRoad(road);
        }
        
        // Render intersections
        for (const intersection of intersections) {
            this.renderIntersection(intersection);
        }
    }

    /**
     * Grid rectangle a road covers. For a horizontal road `position` is the
     * row and start/end the columns; for a vertical road `position` is the
     * column and start/end the rows. The cross-axis span uses the same width
     * offsets MapRoadSystem marks as road (#2314).
     * @returns {{x:number, y:number, width:number, height:number}}
     */
    static roadTileRect(road) {
        const offsets = MapRoadSystem.widthOffsets(road.width);
        const across = position => position + offsets[0];
        const length = road.end - road.start + 1;
        if (road.direction === 'horizontal') {
            return { x: road.start, y: across(road.position), width: length, height: offsets.length };
        }
        return { x: across(road.position), y: road.start, width: offsets.length, height: length };
    }

    /**
     * Render a single road segment
     */
    renderRoad(road) {
        const tileSize = this.gridSystem.tileSize;
        const containerWidth = this.container.offsetWidth || this.gridSystem.totalWidth;
        const containerHeight = this.container.offsetHeight || this.gridSystem.totalHeight;

        const rect = MapRoadRenderer.roadTileRect(road);
        const roadEl = document.createElement('div');
        roadEl.className = `map-road-tile ${road.type.toLowerCase()} ${road.direction}`;
        roadEl.dataset.roadId = road.id;

        // Top-left of the first tile: gridToPixel() returns tile centres
        const topLeft = this.gridSystem.gridToPixel(rect.x, rect.y);
        const left = topLeft.x - tileSize / 2;
        const top = topLeft.y - tileSize / 2;
        const width = rect.width * tileSize;
        const height = rect.height * tileSize;
        roadEl.style.cssText = `
            position: absolute;
            left: ${(left / containerWidth) * 100}%;
            top: ${(top / containerHeight) * 100}%;
            width: ${(width / containerWidth) * 100}%;
            height: ${(height / containerHeight) * 100}%;
            background: ${road.color};
            border: 1px solid rgba(0, 0, 0, 0.3);
            z-index: 1;
        `;

        this.container.appendChild(roadEl);
        this.roadElements.set(road.id, roadEl);
    }

    /**
     * Render an intersection
     */
    renderIntersection(intersection) {
        const tileSize = this.gridSystem.tileSize;
        const containerWidth = this.container.offsetWidth || this.gridSystem.totalWidth;
        const containerHeight = this.container.offsetHeight || this.gridSystem.totalHeight;
        
        const pixel = this.gridSystem.gridToPixel(intersection.x, intersection.y);
        const hRoad = intersection.horizontalRoad;
        const vRoad = intersection.verticalRoad;
        
        // Intersection size is based on road widths
        const width = Math.max(hRoad.width, vRoad.width) * tileSize;
        const height = Math.max(hRoad.width, vRoad.width) * tileSize;
        
        const intersectionEl = document.createElement('div');
        intersectionEl.className = 'map-intersection';
        intersectionEl.dataset.intersectionId = intersection.id;
        const left = ((pixel.x - width / 2) / containerWidth) * 100;
        const top = ((pixel.y - height / 2) / containerHeight) * 100;
        intersectionEl.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${top}%;
            width: ${(width / containerWidth) * 100}%;
            height: ${(height / containerHeight) * 100}%;
            background: #2a2a2a;
            border: 2px solid rgba(0, 0, 0, 0.4);
            z-index: 2;
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
        `;
        
        this.container.appendChild(intersectionEl);
        this.roadElements.set(intersection.id, intersectionEl);
    }

    /**
     * Clear all road elements
     */
    clear() {
        for (const [id, el] of this.roadElements.entries()) {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }
        this.roadElements.clear();
    }

    /**
     * Update road rendering (for container resize, etc.)
     */
    update() {
        this.render();
    }
}
