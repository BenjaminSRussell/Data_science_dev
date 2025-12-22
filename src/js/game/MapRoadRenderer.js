/**
 * MapRoadRenderer.js
 * Road rendering system for the city map
 * Creates road tiles, intersections, and markings
 */

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
     * Render a single road segment
     */
    renderRoad(road) {
        const tileSize = this.gridSystem.tileSize;
        const containerWidth = this.container.offsetWidth || this.gridSystem.totalWidth;
        const containerHeight = this.container.offsetHeight || this.gridSystem.totalHeight;
        
        // Convert grid coordinates to pixel positions
        const startPixel = this.gridSystem.gridToPixel(road.start, road.position);
        const endPixel = this.gridSystem.gridToPixel(road.end, road.position);
        
        const roadEl = document.createElement('div');
        roadEl.className = `map-road-tile ${road.type.toLowerCase()} ${road.direction}`;
        roadEl.dataset.roadId = road.id;
        
        if (road.direction === 'horizontal') {
            const width = (road.end - road.start + 1) * tileSize;
            const height = road.width * tileSize;
            const left = ((startPixel.x - width / 2) / containerWidth) * 100;
            const top = ((startPixel.y - height / 2) / containerHeight) * 100;
            roadEl.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                width: ${(width / containerWidth) * 100}%;
                height: ${(height / containerHeight) * 100}%;
                background: ${road.color};
                border: 1px solid rgba(0, 0, 0, 0.3);
                z-index: 1;
            `;
        } else { // vertical
            const width = road.width * tileSize;
            const height = (road.end - road.start + 1) * tileSize;
            const left = ((startPixel.x - width / 2) / containerWidth) * 100;
            const top = ((startPixel.y - height / 2) / containerHeight) * 100;
            roadEl.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                width: ${(width / containerWidth) * 100}%;
                height: ${(height / containerHeight) * 100}%;
                background: ${road.color};
                border: 1px solid rgba(0, 0, 0, 0.3);
                z-index: 1;
            `;
        }
        
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
