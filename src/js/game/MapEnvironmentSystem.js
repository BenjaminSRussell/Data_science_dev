/**
 * MapEnvironmentSystem.js
 * Environmental elements system - trees, parks, green spaces, decorations
 */

const PLACEMENT_RETRY_RADIUS = 3;

export class MapEnvironmentSystem {
    constructor(gridSystem, roadSystem, zoneSystem, assetPlacer) {
        this.gridSystem = gridSystem;
        this.roadSystem = roadSystem;
        this.zoneSystem = zoneSystem;
        this.assetPlacer = assetPlacer;
        this.environmentElements = [];
    }

    /**
     * Initialize environmental elements
     */
    initialize() {
        // Add trees in park zones
        const parkZones = this.zoneSystem.getZonesByType('park');
        for (const zone of parkZones) {
            this.addParkElements(zone);
        }
        
        // Add trees along residential streets
        const residentialZones = this.zoneSystem.getZonesByType('residential');
        for (const zone of residentialZones) {
            this.addStreetTrees(zone);
        }
        
        // Add decorative elements to commercial zones
        const commercialZones = this.zoneSystem.getZonesByType('commercial');
        for (const zone of commercialZones) {
            this.addCommercialDecorations(zone);
        }
    }

    isInZone(bounds, x, y) {
        return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
    }

    /**
     * Place an asset at its random spot, or the nearest acceptable free spot
     * (within PLACEMENT_RETRY_RADIUS) when that one is taken, instead of
     * silently dropping it.
     */
    placeWithRetry(asset, accept) {
        if (accept(asset.x, asset.y) && this.assetPlacer.placeAsset(asset)) {
            return true;
        }
        if (typeof this.assetPlacer.findAvailablePosition !== 'function') {
            return false;
        }
        const pos = this.assetPlacer.findAvailablePosition(
            asset.x, asset.y, asset.width ?? 1, asset.height ?? 1, PLACEMENT_RETRY_RADIUS, accept
        );
        if (!pos) return false;
        asset.x = pos.x;
        asset.y = pos.y;
        return this.assetPlacer.placeAsset(asset);
    }

    /**
     * Add park elements (trees, benches, etc.)
     */
    addParkElements(zone) {
        const bounds = zone.bounds;
        const treeCount = Math.floor((bounds.maxX - bounds.minX + 1) * (bounds.maxY - bounds.minY + 1) / 4);
        
        for (let i = 0; i < treeCount; i++) {
            const x = bounds.minX + Math.floor(Math.random() * (bounds.maxX - bounds.minX + 1));
            const y = bounds.minY + Math.floor(Math.random() * (bounds.maxY - bounds.minY + 1));
            
            const tree = {
                id: `tree-${zone.id}-${i}`,
                type: 'tree',
                x,
                y,
                width: 1,
                height: 1,
                zoneId: zone.id
            };
            
            if (this.placeWithRetry(tree, (cx, cy) => this.isInZone(bounds, cx, cy) && !this.roadSystem.isRoad(cx, cy))) {
                this.environmentElements.push(tree);
            }
        }
    }

    /**
     * Add street trees in residential zones
     */
    addStreetTrees(zone) {
        const bounds = zone.bounds;
        const treeCount = Math.floor((bounds.maxX - bounds.minX + bounds.maxY - bounds.minY) / 3);
        
        for (let i = 0; i < treeCount; i++) {
            // Place trees near roads but not on them
            const x = bounds.minX + Math.floor(Math.random() * (bounds.maxX - bounds.minX + 1));
            const y = bounds.minY + Math.floor(Math.random() * (bounds.maxY - bounds.minY + 1));
            
            // Must be adjacent to a road but not on it
            const isStreetSpot = (cx, cy) =>
                this.isInZone(bounds, cx, cy) &&
                !this.roadSystem.isRoad(cx, cy) &&
                (this.roadSystem.isRoad(cx - 1, cy) ||
                 this.roadSystem.isRoad(cx + 1, cy) ||
                 this.roadSystem.isRoad(cx, cy - 1) ||
                 this.roadSystem.isRoad(cx, cy + 1));
            
            const tree = {
                id: `street-tree-${zone.id}-${i}`,
                type: 'tree',
                x,
                y,
                width: 1,
                height: 1,
                zoneId: zone.id
            };
            
            if (this.placeWithRetry(tree, isStreetSpot)) {
                this.environmentElements.push(tree);
            }
        }
    }

    /**
     * Add commercial decorations
     */
    addCommercialDecorations(zone) {
        const bounds = zone.bounds;
        const decorationCount = Math.floor((bounds.maxX - bounds.minX + 1) * (bounds.maxY - bounds.minY + 1) / 8);
        
        for (let i = 0; i < decorationCount; i++) {
            const x = bounds.minX + Math.floor(Math.random() * (bounds.maxX - bounds.minX + 1));
            const y = bounds.minY + Math.floor(Math.random() * (bounds.maxY - bounds.minY + 1));
            
            const decoration = {
                id: `decoration-${zone.id}-${i}`,
                type: 'decoration',
                x,
                y,
                width: 1,
                height: 1,
                zoneId: zone.id
            };
            
            if (this.placeWithRetry(decoration, (cx, cy) => this.isInZone(bounds, cx, cy) && !this.roadSystem.isRoad(cx, cy))) {
                this.environmentElements.push(decoration);
            }
        }
    }

    /**
     * Get all environment elements
     */
    getAllElements() {
        return this.environmentElements;
    }

    /**
     * Get elements by type
     */
    getElementsByType(type) {
        return this.environmentElements.filter(el => el.type === type);
    }

    /**
     * Get elements in zone
     */
    getElementsInZone(zoneId) {
        return this.environmentElements.filter(el => el.zoneId === zoneId);
    }
}
