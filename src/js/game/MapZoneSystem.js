import { getAllZones, getZoneById, getZonesByType } from '../data/mapZones.js';

class MapZoneSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.zones = getAllZones();
        this.zoneGrid = new Map();
        this.locationZoneMap = new Map();
        this.gridSystem = gameState.gridSystem;
        this.initializeZoneGrid();
    }

    initializeZoneGrid() {
        for (const zone of this.zones) {
            const coords = this.gridSystem.getGridCoordinates(
                zone.bounds.minX,
                zone.bounds.minY,
                zone.bounds.maxX - zone.bounds.minX + 1,
                zone.bounds.maxY - zone.bounds.minY + 1
            );
            
            for (const coord of coords) {
                const key = this.gridSystem.getGridKey(coord.x, coord.y);
                if (!this.zoneGrid.has(key)) {
                    this.zoneGrid.set(key, []);
                }
                this.zoneGrid.get(key).push(zone);
            }
        }
    }

    getZoneAt(x, y) {
        const key = this.gridSystem.getGridKey(x, y);
        const zones = this.zoneGrid.get(key);
        if (zones && zones.length > 0) {
            // Return the first zone (or could prioritize by type)
            return zones[0];
        }
        return null;
    }

    getAllZones() {
        return this.zones;
    }

    getZonesByType(type) {
        return getZonesByType(type);
    }

    getZoneById(zoneId) {
        return getZoneById(zoneId);
    }

    assignLocationToZone(locationId, zoneId) {
        this.locationZoneMap.set(locationId, zoneId);
    }

    getZoneForLocation(locationId) {
        const zoneId = this.locationZoneMap.get(locationId);
        if (zoneId) {
            return this.getZoneById(zoneId);
        }
        return null;
    }

    findZoneForLocationType(locationType) {
        const typeMapping = {
            'residence': 'residential',
            'work': 'commercial',
            'education': 'education',
            'finance': 'finance',
            'government': 'government',
            'shop': 'commercial',
            'social': 'commercial',
            'training': 'education',
            'business': 'commercial',
            'elite': 'finance',
            'investment': 'finance',
            'shopping': 'commercial'
        };
        
        const targetZoneType = typeMapping[locationType] || 'mixed';
        const zones = this.getZonesByType(targetZoneType);
        
        if (zones.length > 0) {
            // Return the first zone of appropriate type
            return zones[0];
        }
        
        // Fallback to mixed use
        return this.getZonesByType('mixed')[0] || this.zones[0];
    }

    getZoneData() {
        return {
            zones: this.zones,
            zoneGrid: this.zoneGrid,
            locationZoneMap: Array.from(this.locationZoneMap.entries())
        };
    }

    isInZone(x, y, zoneId) {
        const zone = this.getZoneById(zoneId);
        if (!zone) return false;
        
        return x >= zone.bounds.minX && 
               x <= zone.bounds.maxX &&
               y >= zone.bounds.minY && 
               y <= zone.bounds.maxY;
    }

    getZonesInRect(minX, minY, maxX, maxY) {
        const overlappingZones = [];
        
        for (const zone of this.zones) {
            // Check if rectangles overlap
            if (!(zone.bounds.maxX < minX || 
                  zone.bounds.minX > maxX ||
                  zone.bounds.maxY < minY ||
                  zone.bounds.minY > maxY)) {
                overlappingZones.push(zone);
            }
        }
        
        return overlappingZones;
    }
}