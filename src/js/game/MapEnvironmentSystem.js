/**
 * MapEnvironmentSystem.js
 * Environmental elements system - trees, parks, green spaces, decorations
 */

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

    /**
     * Add park elements (trees, benches, etc.)
     */
    addParkElements(zone) {
        const bounds = zone.bounds;
        const treeCount = Math.floor((bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY) / 4);
        
        for (let i = 0; i < treeCount; i++) {
            const x = bounds.minX + Math.floor(Math.random() * (bounds.maxX - bounds.minX + 1));
            const y = bounds.minY + Math.floor(Math.random() * (bounds.maxY - bounds.minY + 1));
            
            // Skip if road or already occupied
            if (this.roadSystem.isRoad(x, y)) continue;
            
            const tree = {
                id: `tree-${zone.id}-${i}`,
                type: 'tree',
                x,
                y,
                width: 1,
                height: 1,
                zoneId: zone.id
            };
            
            if (this.assetPlacer.placeAsset(tree)) {
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
            
            // Check if adjacent to road
            const isNearRoad = this.roadSystem.isRoad(x - 1, y) || 
                              this.roadSystem.isRoad(x + 1, y) ||
                              this.roadSystem.isRoad(x, y - 1) ||
                              this.roadSystem.isRoad(x, y + 1);
            
            if (!isNearRoad || this.roadSystem.isRoad(x, y)) continue;
            
            const tree = {
                id: `street-tree-${zone.id}-${i}`,
                type: 'tree',
                x,
                y,
                width: 1,
                height: 1,
                zoneId: zone.id
            };
            
            if (this.assetPlacer.placeAsset(tree)) {
                this.environmentElements.push(tree);
            }
        }
    }

    /**
     * Add commercial decorations
     */
    addCommercialDecorations(zone) {
        const bounds = zone.bounds;
        const decorationCount = Math.floor((bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY) / 8);
        
        for (let i = 0; i < decorationCount; i++) {
            const x = bounds.minX + Math.floor(Math.random() * (bounds.maxX - bounds.minX + 1));
            const y = bounds.minY + Math.floor(Math.random() * (bounds.maxY - bounds.minY + 1));
            
            if (this.roadSystem.isRoad(x, y)) continue;
            
            const decoration = {
                id: `decoration-${zone.id}-${i}`,
                type: 'decoration',
                x,
                y,
                width: 1,
                height: 1,
                zoneId: zone.id
            };
            
            if (this.assetPlacer.placeAsset(decoration)) {
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
