import { ZONE_TYPES, getZoneById, getZonesByType, getZoneAt, getAllZones } from './zone-definitions';

export class MapZoneSystem {
    constructor() {
        this.zoneGrid = this.buildZoneGrid();
        this.typeMapping = {
            residence: ZONE_TYPES.RESIDENTIAL,
            shop: ZONE_TYPES.COMMERCIAL,
            social: ZONE_TYPES.COMMERCIAL,
            business: ZONE_TYPES.COMMERCIAL,
            shopping: ZONE_TYPES.COMMERCIAL,
            elite: ZONE_TYPES.FINANCE,
            investment: ZONE_TYPES.FINANCE,
            mixed: ZONE_TYPES.MIXED
        };
    }

    buildZoneGrid() {
        const grid = {};
        getAllZones().forEach(zone => {
            const { minX, maxX, minY, maxY } = zone.bounds;
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    grid[`${x},${y}`] = zone.id;
                }
            }
        });
        return grid;
    }

    getZoneAt(x, y) {
        const zoneId = this.zoneGrid[`${x},${y}`];
        return zoneId ? getZoneById(zoneId) : null;
    }

    assignLocationToZone(locationId, zoneId) {
        const zone = getZoneById(zoneId);
        if (!zone) return false;
        // Assume location assignment logic here
        return true;
    }

    getZoneForLocation(locationId) {
        // Assume location-to-zone lookup logic here
        return 'zone-id'; // Placeholder
    }

    findZoneForLocationType(locationType) {
        const zoneType = this.typeMapping[locationType] || ZONE_TYPES.MIXED;
        const zones = getZonesByType(zoneType);
        return zones.length > 0 ? zones[0] : getAllZones()[0];
    }

    isInZone(x, y, zoneId) {
        const zone = getZoneById(zoneId);
        if (!zone) return false;
        const { minX, maxX, minY, maxY } = zone.bounds;
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }

    getZonesInRect(minX, minY, maxX, maxY) {
        const zonesInRect = [];
        getAllZones().forEach(zone => {
            const { minX: zoneMinX, maxX: zoneMaxX, minY: zoneMinY, maxY: zoneMaxY } = zone.bounds;
            if (zoneMaxX < minX || zoneMinX > maxX || zoneMaxY < minY || zoneMinY > maxY) return;
            zonesInRect.push(zone);
        });
        return zonesInRect;
    }
}

// Example usage
const mapZoneSystem = new MapZoneSystem();
console.log(mapZoneSystem.getZoneAt(5, 22)); // Should return a zone object or null
console.log(mapZoneSystem.assignLocationToZone('location1', 'zone1')); // Should return true or false
console.log(mapZoneSystem.getZoneForLocation('location1')); // Should return a zone ID or null
console.log(mapZoneSystem.findZoneForLocationType('residence')); // Should return a zone object
console.log(mapZoneSystem.isInZone(5, 22, 'zone1')); // Should return true or false
console.log(mapZoneSystem.getZonesInRect(0, 0, 30, 30)); // Should return an array of zone objects