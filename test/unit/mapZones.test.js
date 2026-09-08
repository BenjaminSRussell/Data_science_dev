import { ZONE_TYPES, ZONE_DEFINITIONS } from '../../js/data/zones.js';
import { getZoneById, getZonesByType, getZoneAt, getAllZones } from '../../js/data/mapZones.js';

describe('mapZones', () => {
    describe('getZoneById', () => {
        it('should return the matching zone for a valid id', () => {
            const zone = getZoneById('park_central');
            expect(zone).toBeDefined();
            expect(zone.id).toBe('park_central');
        });

        it('should return undefined for an unknown id', () => {
            const zone = getZoneById('unknown_id');
            expect(zone).toBeUndefined();
        });
    });

    describe('getZonesByType', () => {
        it('should return all zones of the specified type', () => {
            const zones = getZonesByType(ZONE_TYPES.RESIDENTIAL);
            expect(zones).toHaveLength(2);
            expect(zones.every(zone => zone.type === ZONE_TYPES.RESIDENTIAL)).toBe(true);
        });

        it('should return an empty array for an unknown type', () => {
            const zones = getZonesByType('unknown_type');
            expect(zones).toHaveLength(0);
        });
    });

    describe('getZoneAt', () => {
        it('should return the zone whose bounds contain the point', () => {
            const zone = getZoneAt(10, 20);
            expect(zone).toBeDefined();
            expect(zone.id).toBe('residential_central');
        });

        it('should return undefined for a point outside all zones', () => {
            const zone = getZoneAt(-5, -5);
            expect(zone).toBeUndefined();
        });

        it('should confirm inclusive comparison for boundary points', () => {
            const zone = getZoneAt(50, 0); // minX
            expect(zone).toBeDefined();
            expect(zone.id).toBe('residential_central');

            const zone2 = getZoneAt(60, 0); // maxX
            expect(zone2).toBeDefined();
            expect(zone2.id).toBe('residential_central');

            const zone3 = getZoneAt(55, 25); // minY
            expect(zone3).toBeDefined();
            expect(zone3.id).toBe('residential_central');

            const zone4 = getZoneAt(55, 35); // maxY
            expect(zone4).toBeDefined();
            expect(zone4.id).toBe('residential_central');
        });
    });

    describe('getAllZones', () => {
        it('should return the full ZONE_DEFINITIONS array', () => {
            const zones = getAllZones();
            expect(zones).toEqual(ZONE_DEFINITIONS);
        });
    });
});