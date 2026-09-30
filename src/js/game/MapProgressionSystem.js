/**
 * MapProgressionSystem.js
 * Different maps for early, mid, and end-game with new characters
 * Includes travel animations
 */

// TravelAnimationSystem - Optimized: instant travel, no delays
class TravelAnimationSystem {
    constructor() {
        this.currentAnimation = null;
    }
    
    // Instant travel - no animation delays
    async animateTravel(fromLocation, toLocation, vehicle, onComplete) {
        // Execute immediately, no animation overlay
        if (onComplete) {
            onComplete();
        }
        return Promise.resolve();
    }
    
    getVehicleIcon(vehicle) {
        const icons = {
            'walking': '/assets/icons/vehicles/walking.png',
            'bus_pass': '/assets/icons/vehicles/bus_pass.png',
            'used_car': '/assets/icons/vehicles/used_car.png',
            'luxury_car': '/assets/icons/vehicles/luxury_car.png',
            'sedan': '/assets/icons/vehicles/used_car.png',
            'sports_car': '/assets/icons/vehicles/used_car.png',
            'luxury_car': '/assets/icons/vehicles/luxury_car.png'
        };
        return icons[vehicle] || '/assets/icons/vehicles/walking.png';
    }
    
    getTravelDuration(fromLocation, toLocation, vehicle) {
        // Not used anymore, but kept for compatibility
        return 0;
    }
}

export class MapProgressionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentMap = 'early_game';
        this.unlockedMaps = ['early_game'];
        this.mapData = this.initializeMaps();
        this.travelAnimation = new TravelAnimationSystem();
    }

    /**
     * Initialize all maps
     */
    initializeMaps() {
        return {
            early_game: {
                id: 'early_game',
                name: 'Downtown District',
                description: 'Your starting neighborhood. Small apartments, local businesses.',
                phase: 'early',
                locations: [
                    { id: 'home', x: 50, y: 70 },
                    { id: 'coffee_shop', x: 45, y: 55 },
                    { id: 'library', x: 30, y: 40 },
                    { id: 'gym', x: 60, y: 35 }
                ],
                npcs: ['alex_rivera', 'professor_higgins', 'jordan_kim'],
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                theme: 'urban_starter'
            },
            mid_game: {
                id: 'mid_game',
                name: 'Business District',
                description: 'The corporate heart of the city. Skyscrapers, tech companies, opportunities.',
                phase: 'mid',
                locations: [
                    { id: 'tech_hub', x: 40, y: 50 },
                    { id: 'downtown', x: 50, y: 45 },
                    { id: 'networking_bar', x: 60, y: 40 },
                    { id: 'stock_exchange', x: 35, y: 30 },
                    { id: 'luxury_district', x: 70, y: 25 }
                ],
                npcs: ['mike_johnson', 'lisa_wong', 'david_chen', 'sarah_martinez'],
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
                theme: 'corporate',
                unlockRequirement: { days: 30, reputation: 500 }
            },
            end_game: {
                id: 'end_game',
                name: 'Elite District',
                description: 'Where the powerful live and work. Exclusive, expensive, influential.',
                phase: 'endgame',
                locations: [
                    { id: 'executive_tower', x: 50, y: 40 },
                    { id: 'private_club', x: 60, y: 35 },
                    { id: 'research_center', x: 40, y: 30 },
                    { id: 'venture_capital', x: 70, y: 25 },
                    { id: 'mansion_district', x: 30, y: 20 }
                ],
                npcs: ['victoria_sterling', 'sophia_zhang', 'judge_roberts'],
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
                theme: 'elite',
                unlockRequirement: { days: 90, reputation: 2000, money: 100000 }
            }
        };
    }

    /**
     * Check if map should unlock
     */
    checkMapUnlocks() {
        if (!this.gameState || !this.mapData) return { unlocked: false };
        
        const days = this.gameState.timeManager?.totalDays || 0;
        const reputation = this.gameState.reputation || 0;
        const money = this.gameState.money || 0;

        // Check mid-game map
        if (!this.unlockedMaps.includes('mid_game') && this.mapData.mid_game?.unlockRequirement) {
            const req = this.mapData.mid_game.unlockRequirement;
            if (days >= (req.days || 0) && reputation >= (req.reputation || 0)) {
                this.unlockMap('mid_game');
                return {
                    unlocked: true,
                    map: 'mid_game',
                    message: 'You\'ve unlocked the Business District! New opportunities await.'
                };
            }
        }

        // Check end-game map
        if (!this.unlockedMaps.includes('end_game') && this.mapData.end_game?.unlockRequirement) {
            const req = this.mapData.end_game.unlockRequirement;
            if (days >= (req.days || 0) && reputation >= (req.reputation || 0) && money >= (req.money || 0)) {
                this.unlockMap('end_game');
                return {
                    unlocked: true,
                    map: 'end_game',
                    message: 'The Elite District opens to you. You\'ve made it to the top.'
                };
            }
        }

        return { unlocked: false };
    }

    /**
     * Unlock a map
     */
    unlockMap(mapId) {
        if (!this.unlockedMaps.includes(mapId)) {
            this.unlockedMaps.push(mapId);
        }
    }

    /**
     * Switch to a different map
     */
    switchMap(mapId) {
        if (!this.unlockedMaps.includes(mapId)) {
            return { success: false, message: 'Map not unlocked yet.' };
        }

        const map = this.mapData[mapId];
        if (!map) {
            return { success: false, message: 'Map not found.' };
        }

        this.currentMap = mapId;

        // Update world map with new locations
        let locationsUpdated = true;
        if (this.gameState.worldMap) {
            locationsUpdated = this.updateWorldMapLocations(map);
        }

        // Get NPCs that will follow to the new map
        const followingNPCs = this.getNPCsThatFollow();

        // Only report success if map transition and location update completed
        if (!locationsUpdated && this.gameState.worldMap) {
            return { success: false, message: 'Failed to update map locations.' };
        }

        return {
            success: true,
            map,
            followingNPCs,
            message: `You've arrived in ${map.name}.`
        };
    }

    /**
     * Update world map with new locations
     * Merges the map's locations into the world map's locationOverrides
     */
    updateWorldMapLocations(map) {
        if (!map || !map.locations || !this.gameState.worldMap) {
            return false;
        }

        // Use the worldMap's addLocations method to merge locations
        if (typeof this.gameState.worldMap.addLocations === 'function') {
            const result = this.gameState.worldMap.addLocations(map.locations);
            // Verify that locations were actually added to locationOverrides
            if (result && map.locations.length > 0) {
                // Check that at least one location is in locationOverrides
                const firstLocId = map.locations[0].id;
                return this.gameState.worldMap.locationOverrides &&
                       this.gameState.worldMap.locationOverrides[firstLocId] !== undefined;
            }
            return result;
        }

        // Fallback: manually add locations to locationOverrides
        if (!this.gameState.worldMap.locationOverrides) {
            this.gameState.worldMap.locationOverrides = {};
        }

        let addedCount = 0;
        map.locations.forEach(loc => {
            if (loc && loc.id) {
                // Create full location object and add to locationOverrides
                this.gameState.worldMap.locationOverrides[loc.id] = {
                    id: loc.id,
                    name: loc.name || this._generateLocationName(loc.id),
                    type: loc.type || 'location',
                    position: { x: loc.x || 0, y: loc.y || 0 },
                    travelTime: loc.travelTime || 1,
                    requiresVehicle: loc.requiresVehicle || false,
                    unlockRequirement: loc.unlockRequirement || null,
                    activities: loc.activities || [],
                    background: loc.background || 'url("/assets/locations/default/background.png")',
                    ...loc
                };
                addedCount++;
            }
        });

        // Invalidate cache if locations were added
        if (addedCount > 0 && this.gameState.worldMap._invalidateCache) {
            this.gameState.worldMap._invalidateCache();
        }

        return addedCount > 0;
    }

    /**
     * Generate a display name for a location ID
     */
    _generateLocationName(id) {
        return id
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get NPCs that can follow player to new map
     */
    getNPCsThatFollow() {
        const npcManager = this.gameState.npcManager;
        if (!npcManager) return [];

        const metNPCs = npcManager?.getMetNPCs() || [];
        const followingNPCs = [];

        metNPCs?.forEach(npc => {
            const relationship = npcManager?.getRelationship(npc.id) || 0;
            
            // NPCs with high relationship might follow
            if (relationship > 70) {
                followingNPCs.push({
                    npc,
                    relationship,
                    willFollow: relationship > 85 || npc.type === 'romance'
                });
            }
        });

        return followingNPCs;
    }

    /**
     * Get current map data
     */
    getCurrentMap() {
        return this.mapData[this.currentMap];
    }

    /**
     * Get all unlocked maps
     */
    getUnlockedMaps() {
        return this.unlockedMaps.map(id => this.mapData[id]).filter(Boolean);
    }
    
    /**
     * Travel to location - instant, no animation delays
     */
    async travelToLocation(locationId, vehicle) {
        if (!this.gameState?.worldMap) return;
        
        const fromLocation = this.gameState.worldMap.getCurrentLocation?.();
        const toLocation = this.gameState.worldMap.getLocation?.(locationId);
        
        if (!fromLocation || !toLocation) return;
        
        // Instant travel - no animation
        if (this.gameState.worldMap && typeof this.gameState.worldMap.travelTo === 'function') {
            this.gameState.worldMap.travelTo(locationId);
        }
    }
    
    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            currentMap: this.currentMap,
            unlockedMaps: this.unlockedMaps,
            mapData: this.mapData
        };
    }
    
    /**
     * Load from save
     */
    fromJSON(data) {
        if (!data) return;
        this.currentMap = data.currentMap || 'early_game';
        this.unlockedMaps = data.unlockedMaps || ['early_game'];
        this.mapData = data.mapData || this.initializeMaps();
    }
}



