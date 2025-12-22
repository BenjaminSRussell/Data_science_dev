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
        const containerWidth = this.container.offsetWidth || this.gridSystem.totalWidth;
        const containerHeight = this.container.offsetHeight || this.gridSystem.totalHeight;
        return this.gridSystem.gridToPercent(gridX, gridY, containerWidth, containerHeight);
    }

    /**
     * Update map (for resize, etc.)
     */
    update() {
        this.roadRenderer.update();
    }
}
