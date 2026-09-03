/**
 * mapZones.js
 * Zone definitions for the city map
 * Defines residential, commercial, industrial, education, finance, government, and park zones
 */

export const ZONE_TYPES = {
    RESIDENTIAL: 'residential',
    COMMERCIAL: 'commercial',
    INDUSTRIAL: 'industrial',
    EDUCATION: 'education',
    FINANCE: 'finance',
    GOVERNMENT: 'government',
    PARK: 'park',
    MIXED: 'mixed'
};

export const ZONE_DEFINITIONS = [
    {
        id: 'residential_central',
        name: 'Central Residential',
        type: ZONE_TYPES.RESIDENTIAL,
        bounds: { minX: 11, maxX: 17, minY: 15, maxY: 25 },
        color: '#4a5568',
        backgroundColor: 'rgba(74, 85, 104, 0.1)',
        borderColor: 'rgba(74, 85, 104, 0.3)',
        description: 'Residential area with apartments and houses'
    },
    {
        id: 'residential_north',
        name: 'North Residential',
        type: ZONE_TYPES.RESIDENTIAL,
        bounds: { minX: 5, maxX: 9, minY: 5, maxY: 12 },
        color: '#4a5568',
        backgroundColor: 'rgba(74, 85, 104, 0.1)',
        borderColor: 'rgba(74, 85, 104, 0.3)',
        description: 'Quiet residential neighborhood'
    },
    {
        id: 'commercial_downtown',
        name: 'Downtown Commercial',
        type: ZONE_TYPES.COMMERCIAL,
        bounds: { minX: 10, maxX: 20, minY: 8, maxY: 15 },
        color: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        description: 'Main shopping and business district'
    },
    {
        id: 'commercial_strip',
        name: 'Commercial Strip',
        type: ZONE_TYPES.COMMERCIAL,
        bounds: { minX: 6, maxX: 8, minY: 12, maxY: 20 },
        color: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        description: 'Local shops and services'
    },
    {
        id: 'education_campus',
        name: 'Education Campus',
        type: ZONE_TYPES.EDUCATION,
        bounds: { minX: 21, maxX: 28, minY: 5, maxY: 11 },
        color: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        description: 'University and library district'
    },
    {
        id: 'finance_district',
        name: 'Financial District',
        type: ZONE_TYPES.FINANCE,
        bounds: { minX: 18, maxX: 24, minY: 13, maxY: 18 },
        color: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        description: 'Banks and financial institutions'
    },
    {
        id: 'government_center',
        name: 'Government Center',
        type: ZONE_TYPES.GOVERNMENT,
        bounds: { minX: 12, maxX: 18, minY: 2, maxY: 8 },
        color: '#607d8b',
        backgroundColor: 'rgba(96, 125, 139, 0.1)',
        borderColor: 'rgba(96, 125, 139, 0.3)',
        description: 'City hall and government buildings'
    },
    {
        id: 'park_central',
        name: 'Central Park',
        type: ZONE_TYPES.PARK,
        bounds: { minX: 5, maxX: 9, minY: 20, maxY: 25 },
        color: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.4)',
        description: 'Public park and recreation area'
    },
    {
        id: 'park_north',
        name: 'North Park',
        type: ZONE_TYPES.PARK,
        bounds: { minX: 22, maxX: 28, minY: 18, maxY: 25 },
        color: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.4)',
        description: 'Green space and walking trails'
    },
    {
        id: 'industrial_east',
        name: 'Industrial Zone',
        type: ZONE_TYPES.INDUSTRIAL,
        bounds: { minX: 25, maxX: 29, minY: 12, maxY: 20 },
        color: '#64748b',
        backgroundColor: 'rgba(100, 116, 139, 0.1)',
        borderColor: 'rgba(100, 116, 139, 0.3)',
        description: 'Warehouses and industrial facilities'
    },
    {
        id: 'mixed_west',
        name: 'Mixed Use',
        type: ZONE_TYPES.MIXED,
        bounds: { minX: 0, maxX: 5, minY: 10, maxY: 20 },
        color: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        borderColor: 'rgba(167, 139, 250, 0.3)',
        description: 'Mixed residential and commercial'
    }
];

/**
 * Get zone by ID
 */
export function getZoneById(zoneId) {
    return ZONE_DEFINITIONS.find(zone => zone.id === zoneId);
}

/**
 * Get zones by type
 */
export function getZonesByType(type) {
    return ZONE_DEFINITIONS.filter(zone => zone.type === type);
}

/**
 * Get zone at grid coordinates
 */
export function getZoneAt(x, y) {
    return ZONE_DEFINITIONS.find(zone => 
        x >= zone.bounds.minX && 
        x <= zone.bounds.maxX &&
        y >= zone.bounds.minY && 
        y <= zone.bounds.maxY
    );
}

/**
 * Get all zones
 */
export function getAllZones() {
    return ZONE_DEFINITIONS;
}
