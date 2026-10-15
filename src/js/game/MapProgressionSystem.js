/**
 * MapProgressionSystem.js
 * Different maps for early, mid, and end-game with new characters.
 * Location travel goes through WorldMap.travelTo, not this system.
 * travelTo calls bringFollowingNPCs so companions come along (#1705).
 */

export class MapProgressionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentMap = 'early_game';
        this.unlockedMaps = ['early_game'];
        this.mapData = this.initializeMaps();
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
        if (this.gameState.worldMap) {
            this.updateWorldMapLocations(map);
        }

        // Companions who will follow move onto the new map (#1705)
        const followers = this.bringFollowingNPCs(this.followerDestination(map));

        return {
            success: true,
            map,
            followers,
            message: `You've arrived in ${map.name}.`
        };
    }

    /**
     * Update world map with new locations
     */
    updateWorldMapLocations(map) {
        // This would integrate with WorldMap to add/update locations
        map?.locations?.forEach(loc => {
            // Add location to world map if it doesn't exist
            // Implementation depends on WorldMap structure
        });
    }

    /**
     * Get NPCs that can follow player to new map
     */
    getNPCsThatFollow() {
        const npcManager = this.gameState?.npcManager;
        if (!npcManager?.getMetNPCs) return [];

        const metNPCs = npcManager.getMetNPCs() || [];
        const followingNPCs = [];

        metNPCs.forEach(npc => {
            if (!npc?.id) return;
            const raw = npcManager.getRelationship?.(npc.id);
            const relationship = Number.isFinite(Number(raw)) ? Number(raw) : (Number(npc.relationship) || 0);
            const romance = npc.type === 'romance';
            // Romance partners follow at any relationship. The old `> 70`
            // gate ran first, so this clause never saw a partner at 70 or
            // below (#1705). Everyone else follows only above 85.
            const willFollow = relationship > 85 || romance;
            if (relationship > 70 || romance) {
                followingNPCs.push({ npc, relationship, willFollow });
            }
        });

        return followingNPCs;
    }

    /**
     * Place every companion with willFollow at locationId.
     * Writes through NPCManager so getNPCsAtLocation sees them (#1705).
     * @returns {string[]} ids that moved
     */
    bringFollowingNPCs(locationId) {
        if (typeof locationId !== 'string' || !locationId) return [];
        const npcManager = this.gameState?.npcManager;
        if (typeof npcManager?.setNPCLocation !== 'function') return [];

        const moved = [];
        this.getNPCsThatFollow().forEach(entry => {
            if (!entry?.willFollow || !entry.npc?.id) return;
            if (npcManager.setNPCLocation(entry.npc.id, locationId)) {
                moved.push(entry.npc.id);
            }
        });
        return moved;
    }

    /**
     * A location on `map` the player can actually meet someone at.
     * Prefer where the player already is, then the first real world location.
     */
    followerDestination(map) {
        const here = this.gameState?.worldMap?.currentLocation || this.gameState?.currentLocation || null;
        const ids = (map?.locations || []).map(loc => loc?.id).filter(id => typeof id === 'string');
        if (here && ids.includes(here)) return here;
        const known = this.gameState?.worldMap?.getLocation
            ? ids.find(id => this.gameState.worldMap.getLocation(id))
            : null;
        if (known) return known;
        // end_game pins are not world-map locations; stay with the player
        if (typeof here === 'string' && here) return here;
        return ids[0] || null;
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
     * Serialize for saving
     */
    toJSON() {
        // Only progress is saved; the map catalog is static code data, so
        // later changes to thresholds/content reach existing saves (#2013)
        return {
            currentMap: this.currentMap,
            unlockedMaps: this.unlockedMaps
        };
    }
    
    /**
     * Load from save
     */
    fromJSON(data) {
        if (!data) return;
        // Always rebuild the catalog from code; older saves carried a frozen
        // copy in data.mapData, which is ignored now (#2013)
        this.mapData = this.initializeMaps();
        const known = (id) => typeof id === 'string' && Object.prototype.hasOwnProperty.call(this.mapData, id);
        const unlocked = Array.isArray(data.unlockedMaps) ? [...new Set(data.unlockedMaps.filter(known))] : [];
        if (!unlocked.includes('early_game')) unlocked.unshift('early_game');
        // Being on a map means it was unlocked
        this.currentMap = known(data.currentMap) ? data.currentMap : 'early_game';
        if (!unlocked.includes(this.currentMap)) unlocked.push(this.currentMap);
        this.unlockedMaps = unlocked;
    }
}



