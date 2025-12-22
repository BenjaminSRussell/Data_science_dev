/**
 * MapZoneSystem.js
 * Zone management system for the city map
 * Handles zone queries, location-to-zone mapping, and zone visualization
 */

import { getAllZones, getZoneAt, getZoneById, getZonesByType } from '../data/mapZones.js';

export class MapZoneSystem {
    constructor(gridSystem) {
        this.gridSystem = gridSystem;
        this.zones = getAllZones();
        this.zoneGrid = new Map(); // Cache zone lookups by grid key
        this.locationZoneMap = new Map(); // Map location IDs to zones
        
        this.buildZoneGrid();
    }

    /**
     * Build zone grid for fast lookups
     */
    buildZoneGrid() {
        for (const zone of this.zones) {
            const coords = this.gridSystem.getGridRect(
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

    /**
     * Get zone at grid coordinates
     */
    getZoneAt(x, y) {
        const key = this.gridSystem.getGridKey(x, y);
        const zones = this.zoneGrid.get(key);
        if (zones && zones.length > 0) {
            // Return the first zone (or could prioritize by type)
            return zones[0];
        }
        return null;
    }

    /**
     * Get all zones
     */
    getAllZones() {
        return this.zones;
    }

    /**
     * Get zones by type
     */
    getZonesByType(type) {
        return getZonesByType(type);
    }

    /**
     * Get zone by ID
     */
    getZoneById(zoneId) {
        return getZoneById(zoneId);
    }

    /**
     * Assign location to zone
     */
    assignLocationToZone(locationId, zoneId) {
        this.locationZoneMap.set(locationId, zoneId);
    }

    /**
     * Get zone for location
     */
    getZoneForLocation(locationId) {
        const zoneId = this.locationZoneMap.get(locationId);
        if (zoneId) {
            return this.getZoneById(zoneId);
        }
        return null;
    }

    /**
     * Find appropriate zone for a location based on location type
     */
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

    /**
     * Get zone data for rendering
     */
    getZoneData() {
        return {
            zones: this.zones,
            zoneGrid: this.zoneGrid,
            locationZoneMap: Array.from(this.locationZoneMap.entries())
        };
    }

    /**
     * Check if coordinates are in a zone
     */
    isInZone(x, y, zoneId) {
        const zone = this.getZoneById(zoneId);
        if (!zone) return false;
        
        return x >= zone.bounds.minX && 
               x <= zone.bounds.maxX &&
               y >= zone.bounds.minY && 
               y <= zone.bounds.maxY;
    }

    /**
     * Get zones overlapping a rectangle
     */
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
