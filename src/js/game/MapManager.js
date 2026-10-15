/**
 * MapManager.js
 * Main map manager that integrates all map systems
 * Coordinates grid, roads, zones, blocks, buildings, and rendering
 */

import { MapGridSystem } from './MapGridSystem.js';
import { MapRoadSystem } from './MapRoadSystem.js';
import { MapRoadRenderer } from './MapRoadRenderer.js';
import { MapZoneSystem } from './MapZoneSystem.js';
import { MapBlockSystem } from './MapBlockSystem.js';
import { MapBuildingSystem } from './MapBuildingSystem.js';
import { MapAssetPlacer } from './MapAssetPlacer.js';
import { MapEnvironmentSystem } from './MapEnvironmentSystem.js';
import { MapNavigationSystem } from './MapNavigationSystem.js';
import { LOCATIONS } from './WorldMap.js';

export class MapManager {
    constructor(container, config = {}) {
        this.container = container;
        
        // Initialize grid system
        this.gridSystem = new MapGridSystem(config.grid || {});
        
        // Initialize road system
        this.roadSystem = new MapRoadSystem(this.gridSystem);
        
        // Initialize zone system
        this.zoneSystem = new MapZoneSystem(this.gridSystem);
        
        // Initialize block system
        this.blockSystem = new MapBlockSystem(this.gridSystem, this.roadSystem, this.zoneSystem);
        
        // Initialize building system (needs zoneSystem reference)
        this.buildingSystem = new MapBuildingSystem(this.gridSystem, this.roadSystem, this.blockSystem, this.zoneSystem);
        
        // Initialize asset placer
        this.assetPlacer = new MapAssetPlacer(this.gridSystem, this.roadSystem, this.buildingSystem);
        this.buildingSystem.setAssetPlacer?.(this.assetPlacer);
        
        // Initialize environment system
        this.environmentSystem = new MapEnvironmentSystem(this.gridSystem, this.roadSystem, this.zoneSystem, this.assetPlacer);
        
        // Initialize navigation system
        this.navigationSystem = new MapNavigationSystem(this.gridSystem, this.roadSystem);
        
        // Initialize road renderer
        this.roadRenderer = new MapRoadRenderer(this.gridSystem, this.roadSystem, this.container);
        
        // Place all locations
        this.placeLocations();
        
        // Initialize environment
        this.environmentSystem.initialize();
    }

    /**
     * Place all locations on the map
     */
    placeLocations() {
        for (const location of LOCATIONS) {
            // All locations use grid coordinates (0-30)
            if (!location.position) {
                continue;
            }
            
            // Assign location to zone based on its position
            const zone = this.zoneSystem.getZoneAt(location.position.x, location.position.y);
            if (zone) {
                this.zoneSystem.assignLocationToZone(location.id, zone.id);
                
                // Find block at location's position
                let block = this.blockSystem.getBlockAt(location.position.x, location.position.y);
                if (!block) {
                    // Try to find an available block in the zone
                    block = this.blockSystem.findAvailableBlock(zone.type, 1);
                }
                
                if (block) {
                    this.blockSystem.assignLocationToBlock(location.id, block.id);
                    
                    // Place building
                    this.buildingSystem.placeBuilding(location);
                }
            } else {
                // No zone found - try to find zone by type
                const zoneByType = this.zoneSystem.findZoneForLocationType(location.type);
                if (zoneByType) {
                    this.zoneSystem.assignLocationToZone(location.id, zoneByType.id);
                    const block = this.blockSystem.findAvailableBlock(zoneByType.type, 1);
                    if (block) {
                        this.blockSystem.assignLocationToBlock(location.id, block.id);
                        this.buildingSystem.placeBuilding(location);
                    }
                }
            }
        }
    }

    /**
     * Render the entire map
     */
    render() {
        // Render roads
        this.roadRenderer.render();
        
        // Zones, blocks, buildings, and environment are rendered separately
        // by MapHelpers or other rendering systems
    }

    /**
     * Get grid system
     */
    getGridSystem() {
        return this.gridSystem;
    }

    /**
     * Get road system
     */
    getRoadSystem() {
        return this.roadSystem;
    }

    /**
     * Get zone system
     */
    getZoneSystem() {
        return this.zoneSystem;
    }

    /**
     * Get block system
     */
    getBlockSystem() {
        return this.blockSystem;
    }

    /**
     * Get building system
     */
    getBuildingSystem() {
        return this.buildingSystem;
    }

    /**
     * Get navigation system
     */
    getNavigationSystem() {
        return this.navigationSystem;
    }

    /**
     * Convert grid coordinates to percentage for rendering
     */
    gridToPercent(gridX, gridY) {
        // A percent of the grid's own logical size: gridToPercent's contract
        // needs containerWidth === totalWidth, and percent positioning then
        // scales with whatever size the container really is (#1933)
        return this.gridSystem.gridToPercent(gridX, gridY, this.gridSystem.totalWidth, this.gridSystem.totalHeight);
    }

    /**
     * Update map (for resize, etc.)
     */
    update() {
        this.roadRenderer.update();
    }

    /**
     * One city for travel. WorldMap asks this instance so pathfinding runs on
     * the same roads and grid the map systems place locations on (#1966).
     */
    static shared() {
        if (!MapManager._shared) {
            MapManager._shared = new MapManager(null);
        }
        return MapManager._shared;
    }

    /**
     * Raw path time is in tiles (often 4–30). A day is 6 slots, so each slot
     * covers this many tiles of calculateTravelTime(); the longest walk then
     * still fits in one day instead of several.
     */
    static TILES_PER_SLOT = 6;

    static slotsForRoute(path, raw) {
        if (!Array.isArray(path) || path.length < 2) return 0;
        const tiles = Number(raw);
        if (!(tiles > 0)) return 0;
        return Math.max(1, Math.ceil(tiles / MapManager.TILES_PER_SLOT));
    }

    /**
     * Road route between two grid cells. Travel time comes from
     * navigationSystem, not from a flat per-location table (#1966).
     */
    planTravel(start, end, vehicleSpeed = 1) {
        const path = this.navigationSystem.findPath(start.x, start.y, end.x, end.y);
        const raw = this.navigationSystem.calculateTravelTime(path, vehicleSpeed);
        const visuals = this.navigationSystem.getPathVisualData(path);
        return { path, raw, visuals, slots: MapManager.slotsForRoute(path, raw) };
    }
}
