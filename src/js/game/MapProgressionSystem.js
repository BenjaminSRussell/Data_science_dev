/**
 * MapProgressionSystem.js
 * Different maps for early, mid, and end-game with new characters
 * Includes travel animations
 */

// TravelAnimationSystem - handles travel between locations
class TravelAnimationSystem {
    constructor() {
        this.currentAnimation = null;
    }
    
    async animateTravel(fromLocation, toLocation, vehicle, onComplete) {
        const overlay = document.createElement('div');
        overlay.className = 'travel-overlay';
        overlay.innerHTML = `
            <div class="travel-content">
                <div class="travel-vehicle">${this.getVehicleIcon(vehicle)}</div>
                <div class="travel-route">
                    <div class="travel-from">${fromLocation?.name || 'Here'}</div>
                    <div class="travel-path"></div>
                    <div class="travel-to">${toLocation?.name || 'There'}</div>
                </div>
                <div class="travel-progress">
                    <div class="travel-progress-bar">
                        <div class="travel-progress-fill"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        return new Promise((resolve) => {
            const progressBar = overlay.querySelector('.travel-progress-fill');
            const duration = this.getTravelDuration(fromLocation, toLocation, vehicle);
            let progress = 0;
            
            const interval = setInterval(() => {
                progress += 100 / (duration / 50);
                progressBar.style.width = `${Math.min(progress, 100)}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    overlay.remove();
                    if (onComplete) onComplete();
                    resolve();
                }
            }, 50);
        });
    }
    
    getVehicleIcon(vehicle) {
        const icons = {
            'walking': '🚶', 'bus_pass': '🚌', 'used_car': '🚗',
            'sedan': '🚙', 'sports_car': '🏎️', 'luxury_car': '🚘'
        };
        return icons[vehicle] || '🚶';
    }
    
    getTravelDuration(fromLocation, toLocation, vehicle) {
        if (!fromLocation?.position || !toLocation?.position) return 1000;
        const dx = fromLocation.position.x - toLocation.position.x;
        const dy = fromLocation.position.y - toLocation.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speeds = { 'walking': 1, 'bus_pass': 2, 'used_car': 3, 'sedan': 4, 'sports_car': 5, 'luxury_car': 5 };
        return Math.max(1000, distance * 200 / (speeds[vehicle] || 1));
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
        const days = this.gameState.timeManager?.totalDays || 0;
        const reputation = this.gameState.reputation || 0;
        const money = this.gameState.money || 0;

        // Check mid-game map
        if (!this.unlockedMaps.includes('mid_game')) {
            const req = this.mapData.mid_game.unlockRequirement;
            if (days >= req.days && reputation >= req.reputation) {
                this.unlockMap('mid_game');
                return {
                    unlocked: true,
                    map: 'mid_game',
                    message: 'You\'ve unlocked the Business District! New opportunities await.'
                };
            }
        }

        // Check end-game map
        if (!this.unlockedMaps.includes('end_game')) {
            const req = this.mapData.end_game.unlockRequirement;
            if (days >= req.days && reputation >= req.reputation && money >= req.money) {
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
        if (this.gameState.worldMap) {
            this.updateWorldMapLocations(map);
        }

        return {
            success: true,
            map,
            message: `You've arrived in ${map.name}.`
        };
    }

    /**
     * Update world map with new locations
     */
    updateWorldMapLocations(map) {
        // This would integrate with WorldMap to add/update locations
        map.locations.forEach(loc => {
            // Add location to world map if it doesn't exist
            // Implementation depends on WorldMap structure
        });
    }

    /**
     * Get NPCs that can follow player to new map
     */
    getNPCsThatFollow() {
        const npcManager = this.gameState.npcManager;
        if (!npcManager) return [];

        const metNPCs = npcManager.getMetNPCs();
        const followingNPCs = [];

        metNPCs.forEach(npc => {
            const relationship = npcManager.getRelationship(npc.id);
            
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
     * Travel to location with animation
     */
    async travelToLocation(locationId, vehicle) {
        const fromLocation = this.gameState.worldMap?.getCurrentLocation();
        const toLocation = this.gameState.worldMap?.getLocation(locationId);
        
        if (!fromLocation || !toLocation) return;
        
        // Show travel animation
        await this.travelAnimation.animateTravel(
            fromLocation,
            toLocation,
            vehicle || 'walking',
            () => {
                // Travel complete
                if (this.gameState.worldMap) {
                    this.gameState.worldMap.travelTo(locationId);
                }
            }
        );
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



