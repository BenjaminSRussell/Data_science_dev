/**
 * DetailedMapSystem.js
 * Insanely detailed map system - researched, not overwhelming
 * City looks like a real city, starts empty
 */

export class DetailedMapSystem {
    static STARTING_LOCATIONS = ['home', 'coffee_shop', 'office'];

    constructor(gameState) {
        this.gameState = gameState;
        this.districts = new Map();
        this.buildings = new Map();
        this.roads = [];
        this.landmarks = [];
        // Locations open from the start; unlockLocation() adds to this set
        this.unlockedLocations = new Set(DetailedMapSystem.STARTING_LOCATIONS);
        this.initializeCity();
    }
    
    /**
     * Initialize city structure (researched city layout)
     */
    initializeCity() {
        // City districts based on real city planning
        this.districts.set('downtown', {
            id: 'downtown',
            name: 'Downtown',
            type: 'commercial',
            description: 'Business district with offices and shops',
            buildings: [],
            population: 0, // Start empty
            unlocked: true
        });
        
        this.districts.set('residential', {
            id: 'residential',
            name: 'Residential District',
            type: 'residential',
            description: 'Housing and apartments',
            buildings: [],
            population: 0,
            unlocked: true
        });
        
        this.districts.set('university', {
            id: 'university',
            name: 'University District',
            type: 'education',
            description: 'Campus and student housing',
            buildings: [],
            population: 0,
            unlocked: true
        });
        
        this.districts.set('industrial', {
            id: 'industrial',
            name: 'Industrial District',
            type: 'industrial',
            description: 'Factories and warehouses',
            buildings: [],
            population: 0,
            unlocked: false
        });
        
        this.districts.set('park', {
            id: 'park',
            name: 'City Park',
            type: 'recreation',
            description: 'Green space and recreation',
            buildings: [],
            population: 0,
            unlocked: true
        });
        
        // Initialize roads (grid system like real cities)
        this.initializeRoads();
        
        // Initialize landmarks
        this.initializeLandmarks();
    }
    
    /**
     * Initialize road network (grid system)
     */
    initializeRoads() {
        // Main streets (horizontal)
        for (let y = 0; y < 10; y++) {
            this.roads.push({
                id: `street_h_${y}`,
                type: 'main',
                direction: 'horizontal',
                y: y * 10,
                width: 3
            });
        }
        
        // Cross streets (vertical)
        for (let x = 0; x < 10; x++) {
            this.roads.push({
                id: `street_v_${x}`,
                type: 'main',
                direction: 'vertical',
                x: x * 10,
                width: 3
            });
        }
        
        // Side streets (smaller) — both axes (#2635)
        for (let y = 0; y < 20; y++) {
            this.roads.push({
                id: `side_h_${y}`,
                type: 'side',
                direction: 'horizontal',
                y: y * 5,
                width: 1
            });
        }
        for (let x = 0; x < 20; x++) {
            this.roads.push({
                id: `side_v_${x}`,
                type: 'side',
                direction: 'vertical',
                x: x * 5,
                width: 1
            });
        }
    }
    
    /**
     * Initialize landmarks
     */
    initializeLandmarks() {
        this.landmarks = [
            { id: 'city_hall', name: 'City Hall', type: 'government', x: 50, y: 50 },
            { id: 'central_park', name: 'Central Park', type: 'park', x: 30, y: 30 },
            { id: 'main_plaza', name: 'Main Plaza', type: 'public', x: 70, y: 45 },
            { id: 'river', name: 'City River', type: 'natural', x: 20, y: 0, width: 5, height: 100 }
        ];
    }
    
    /**
     * Get city structure (for rendering)
     */
    getCityStructure() {
        return {
            districts: Array.from(this.districts.values()),
            roads: this.roads,
            landmarks: this.landmarks,
            buildings: Array.from(this.buildings.values())
        };
    }
    
    /**
     * Add building to district
     */
    addBuilding(districtId, building) {
        const district = this.districts.get(districtId);
        if (!district) return false;
        
        if (!this._buildingIdSeq) this._buildingIdSeq = 0;
        this._buildingIdSeq += 1;
        building.id = building.id || `building_${Date.now()}_${this._buildingIdSeq}`;
        // Re-adding an existing id moves it instead of listing it twice
        const previous = this.buildings.get(building.id);
        if (previous) {
            const oldDistrict = this.districts.get(previous.district);
            if (oldDistrict) oldDistrict.buildings = oldDistrict.buildings.filter(id => id !== building.id);
        }
        building.district = districtId;
        this.buildings.set(building.id, building);
        district.buildings.push(building.id);
        
        return true;
    }
    
    /**
     * Get buildings in district
     */
    getDistrictBuildings(districtId) {
        const district = this.districts.get(districtId);
        if (!district) return [];
        
        return district.buildings.map(id => this.buildings.get(id)).filter(Boolean);
    }
    
    /**
     * Check if location is unlocked
     */
    isLocationUnlocked(locationId) {
        return this.unlockedLocations.has(locationId);
    }
    
    /**
     * Unlock new location
     */
    unlockLocation(locationId) {
        if (typeof locationId !== 'string' || !locationId) return false;
        this.unlockedLocations.add(locationId);
        return true;
    }

    /**
     * Save/load the unlocked-location set
     */
    toJSON() {
        return { unlockedLocations: Array.from(this.unlockedLocations) };
    }

    fromJSON(data) {
        if (!data || !Array.isArray(data.unlockedLocations)) return;
        this.unlockedLocations = new Set([...DetailedMapSystem.STARTING_LOCATIONS, ...data.unlockedLocations.filter(id => typeof id === 'string')]);
    }
    
    /**
     * Get city appearance (starts empty)
     */
    getCityAppearance() {
        const knownNPCs = this.gameState.npcManager?.getMetNPCs() || [];
        const relationshipCount = knownNPCs.length;
        
        return {
            population: relationshipCount, // Only show people you know
            buildings: this.buildings.size,
            active: relationshipCount > 0,
            empty: relationshipCount === 0
        };
    }
}

