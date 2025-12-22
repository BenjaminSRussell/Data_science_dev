/**
 * World Map - Optimized for linear time complexity
 * Uses Maps for O(1) lookups, caches computed values
 */

// Location data - indexed by ID for O(1) access
export const LOCATIONS_MAP = new Map();
export const LOCATIONS = [
    {
        id: 'home',
        name: 'Studio Apartment',
        icon: '/assets/icons/locations/home.png',
        description: 'Your small layout. Rent is $500/week.',
        type: 'residence',
        travelTime: 0,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['work', 'rest', 'eat', 'study_books', 'online_course', 'meditation', 'presentation_practice', 'data_challenges'],
        position: { x: 12, y: 20 }, // Residential district - south area
        background: 'linear-gradient(180deg, #2d3436 0%, #1a1a2e 100%)'
    },
    {
        id: 'office',
        name: 'Your Office',
        icon: '/assets/icons/locations/office.png',
        description: 'Where you work on client jobs.',
        type: 'work',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['work', 'check_clients', 'team_meeting'],
        position: { x: 15, y: 12 }, // Commercial district - central business area
        background: 'linear-gradient(180deg, #1a1a3e 0%, #2d1b4e 100%)'
    },
    {
        id: 'library',
        name: 'Public Library',
        icon: '/assets/icons/locations/library.png',
        description: 'Free books and quiet study space.',
        type: 'education',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['study_books', 'research'],
        position: { x: 22, y: 10 }, // Education district - university area (northeast)
        background: 'linear-gradient(180deg, #8b5a2b 0%, #3c2a14 100%)'
    },
    {
        id: 'gym',
        name: 'Fitness Center',
        icon: '/assets/icons/locations/gym.png',
        description: 'Train your body, build stamina.',
        type: 'training',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['gym_workout'],
        position: { x: 7, y: 8 }, // Grid coordinates in commercial zone
        background: 'linear-gradient(180deg, #ff6b9d 0%, #c44569 100%)'
    },
    {
        id: 'coffee_shop',
        name: 'Coffee Shop',
        icon: '/assets/icons/locations/coffee_shop.png',
        description: 'Grab coffee, meet people, boost focus.',
        type: 'social',
        travelTime: 0,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['coffee_network', 'buy_coffee'],
        position: { x: 14, y: 19 }, // Commercial district - main street, accessible from residential
        background: 'linear-gradient(180deg, #ffd93d 0%, #c8a415 100%)'
    },
    {
        id: 'donut_shop',
        name: 'Donut Delights',
        icon: '/assets/icons/locations/donut_shop.png',
        description: 'Sweet treats to boost your mood and energy.',
        type: 'shop',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['buy_donut', 'eat_donut', 'buy_coffee'],
        position: { x: 10, y: 19 }, // Moved to be near other shops in starting town
        background: 'linear-gradient(180deg, #ff9ff3 0%, #f368e0 100%)',
        layoutType: 'shop'
    },
    {
        id: 'bagel_shop',
        name: 'Bagel Bros',
        icon: '/assets/icons/locations/bagel_shop.png',
        description: 'Hearty bagels for serious work sessions.',
        type: 'shop',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['buy_bagel', 'eat_bagel', 'coffee_network'],
        position: { x: 11, y: 18 }, // Commercial district - shopping strip
        background: 'linear-gradient(180deg, #feca57 0%, #ff9f43 100%)',
        layoutType: 'shop'
    },
    {
        id: 'flower_store',
        name: 'Flower Shop',
        icon: '/assets/icons/locations/flower_store.png',
        description: 'Fresh flowers. Perfect for gifts.',
        type: 'shop',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['buy_flowers', 'buy_plant'],
        position: { x: 5, y: 19 }, // Grid coordinates in commercial zone
        background: 'linear-gradient(180deg, #54a0ff 0%, #2e86de 100%)',
        layoutType: 'shop'
    },
    {
        id: 'networking_bar',
        name: 'The Data Lounge',
        icon: '',
        description: 'Upscale bar where professionals network.',
        type: 'social',
        travelTime: 2,
        requiresVehicle: false,
        unlockRequirement: { stat: 'charisma', value: 15 },
        activities: ['networking_event', 'meet_investor'],
        position: { x: 17, y: 13 }, // Commercial district - upscale area near downtown
        background: 'linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)'
    },
    {
        id: 'bank',
        name: 'First National Bank',
        icon: '/assets/icons/locations/bank.png',
        description: 'Manage savings, loans, and investments.',
        type: 'finance',
        travelTime: 2,
        requiresVehicle: 'bus',
        unlockRequirement: { money: 1000 },
        activities: ['open_savings', 'apply_loan', 'invest'],
        position: { x: 15, y: 8 }, // Grid coordinates in finance zone
        background: 'linear-gradient(180deg, #6bcb77 0%, #38a169 100%)'
    },
    {
        id: 'stock_exchange',
        name: 'Stock Exchange',
        icon: '/assets/icons/locations/stock_exchange.png',
        description: 'Trade stocks and monitor the market.',
        type: 'finance',
        travelTime: 3,
        requiresVehicle: 'bus',
        unlockRequirement: { stat: 'analytics', value: 25 },
        activities: ['buy_stocks', 'sell_stocks', 'analyze_market'],
        position: { x: 19, y: 6 }, // Finance district - downtown core, near bank
        background: 'linear-gradient(180deg, #00c853 0%, #009624 100%)'
    },
    {
        id: 'city_hall',
        name: 'City Hall',
        icon: '/assets/icons/locations/city_hall.png',
        description: 'Bureaucracy Central. Get your licenses here.',
        type: 'government',
        travelTime: 2,
        requiresVehicle: 'bus',
        unlockRequirement: null,
        activities: ['get_licenses'],
        position: { x: 23, y: 4 }, // Government district - northeast, prominent position
        background: 'linear-gradient(180deg, #607d8b 0%, #455a64 100%)'
    },
    {
        id: 'university',
        name: 'Tech University',
        icon: '/assets/icons/locations/university.png',
        description: 'Learn Data Science. Take real exams.',
        type: 'education',
        travelTime: 2,
        requiresVehicle: 'bus',
        unlockRequirement: null,
        activities: ['take_class'],
        position: { x: 23, y: 9 }, // Education district - university campus, near government
        background: 'linear-gradient(180deg, #3f51b5 0%, #1a237e 100%)'
    },
    {
        id: 'mall',
        name: 'Shopping Mall',
        icon: '',
        description: 'Buy clothes, items, and gifts.',
        type: 'shopping',
        travelTime: 2,
        requiresVehicle: 'bus',
        unlockRequirement: null,
        activities: ['buy_clothes', 'buy_gifts', 'buy_electronics'],
        position: { x: 11, y: 16 }, // Moved to be near other shops in starting town
        background: 'linear-gradient(180deg, #ff8548 0%, #e65100 100%)'
    },
    {
        id: 'car_dealership',
        name: 'Auto World',
        icon: '/assets/icons/locations/car_dealership.png',
        description: 'Buy vehicles to travel faster and impress clients.',
        type: 'shopping',
        travelTime: 3,
        requiresVehicle: 'bus',
        unlockRequirement: { money: 5000 },
        activities: ['browse_cars', 'buy_car', 'sell_car'],
        position: { x: 26, y: 23 }, // Industrial/commercial edge - car dealership on outskirts
        background: 'linear-gradient(180deg, #3498db 0%, #2980b9 100%)'
    },
    {
        id: 'downtown',
        name: 'Downtown District',
        icon: '/assets/icons/locations/downtown.png',
        description: 'Premium clients and high-stakes opportunities.',
        type: 'business',
        travelTime: 3,
        requiresVehicle: 'car',
        unlockRequirement: { reputation: 500 },
        activities: ['premium_clients', 'investor_meetings'],
        position: { x: 17, y: 6 }, // Grid coordinates in business zone
        background: 'linear-gradient(180deg, #2c3e50 0%, #1a252f 100%)'
    },
    {
        id: 'tech_hub',
        name: 'Innovation Hub',
        icon: '/assets/icons/locations/tech_hub.png',
        description: 'Startups, accelerators, and venture capitalists.',
        type: 'business',
        travelTime: 4,
        requiresVehicle: 'car',
        unlockRequirement: { stat: 'charisma', value: 40, reputation: 1000 },
        activities: ['startup_networking', 'pitch_investors', 'join_accelerator'],
        position: { x: 21, y: 8 }, // Tech district - innovation hub, near downtown and education
        background: 'linear-gradient(180deg, #9c27b0 0%, #7b1fa2 100%)'
    },
    {
        id: 'luxury_district',
        name: 'Platinum Heights',
        icon: '/assets/icons/locations/luxury_district.png',
        description: 'Ultra-wealthy clients and exclusive events.',
        type: 'elite',
        travelTime: 5,
        requiresVehicle: 'luxury_car',
        unlockRequirement: { reputation: 5000, money: 100000 },
        activities: ['vip_clients', 'gala_events', 'yacht_networking'],
        position: { x: 10, y: 8 },
        background: 'linear-gradient(180deg, #ffd700 0%, #b8860b 100%)'
    },
    {
        id: 'real_estate',
        name: 'Property Investments',
        icon: '',
        description: 'Buy commercial and residential real estate.',
        type: 'investment',
        travelTime: 3,
        requiresVehicle: 'car',
        unlockRequirement: { money: 50000 },
        activities: ['browse_properties', 'buy_property', 'collect_rent'],
        position: { x: 27, y: 14 }, // Finance district - real estate office, near downtown
        background: 'linear-gradient(180deg, #795548 0%, #5d4037 100%)'
    }
];

// Build index map for O(1) lookups
LOCATIONS.forEach(loc => LOCATIONS_MAP.set(loc.id, loc));

// Vehicles indexed by ID
export const VEHICLES_MAP = new Map();
export const VEHICLES = [
    {
        id: 'walking',
        name: 'Walking',
        icon: '',
        price: 0,
        travelSpeed: 1,
        accessLevel: 0,
        reputation: 0,
        description: 'Free but limited range',
        monthlyUpkeep: 0
    },
    {
        id: 'bus_pass',
        name: 'Bus Pass',
        icon: '/assets/icons/vehicles/bus_pass.png',
        price: 50,
        travelSpeed: 2,
        accessLevel: 1,
        reputation: 0,
        description: 'Monthly pass for public transit',
        monthlyUpkeep: 50,
        isMonthly: true
    },
    {
        id: 'used_car',
        name: 'Used Honda',
        icon: '/assets/icons/locations/car_dealership.png',
        price: 5000,
        travelSpeed: 3,
        accessLevel: 2,
        reputation: 5,
        description: 'Reliable and affordable',
        monthlyUpkeep: 100
    },
    {
        id: 'sedan',
        name: 'New Sedan',
        icon: '',
        price: 25000,
        travelSpeed: 4,
        accessLevel: 2,
        reputation: 15,
        description: 'Professional appearance',
        monthlyUpkeep: 200
    },
    {
        id: 'sports_car',
        name: 'Sports Car',
        icon: '/assets/icons/vehicles/used_car.png',
        price: 80000,
        travelSpeed: 5,
        accessLevel: 2,
        reputation: 30,
        description: 'Fast and flashy',
        monthlyUpkeep: 400
    },
    {
        id: 'luxury_car',
        name: 'Luxury Car',
        icon: '/assets/icons/vehicles/luxury_car.png',
        price: 150000,
        travelSpeed: 5,
        accessLevel: 3,
        reputation: 50,
        description: 'Opens doors to elite circles',
        monthlyUpkeep: 600
    }
];

// Build vehicle index
VEHICLES.forEach(v => VEHICLES_MAP.set(v.id, v));

/**
 * WorldMap class - Optimized for linear time complexity
 */
export class WorldMap {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentLocation = 'home';
        this.currentVehicle = 'walking';
        this.ownedVehicles = new Set(['walking']); // Use Set for O(1) lookups
        this.visitedLocations = new Set(['home']); // Use Set for O(1) lookups
        this.locationOverrides = {};
        
        // Cache for accessible locations (invalidated on state change)
        this._accessibleCache = null;
        this._cacheInvalid = true;
    }

    /**
     * Get location by ID - O(1) lookup
     */
    getLocation(locationId) {
        return LOCATIONS_MAP.get(locationId);
    }

    /**
     * Get current location data - O(1)
     */
    getCurrentLocation() {
        return LOCATIONS_MAP.get(this.currentLocation);
    }

    /**
     * Invalidate cache when state changes
     */
    _invalidateCache() {
        this._cacheInvalid = true;
        this._accessibleCache = null;
    }

    /**
     * Get all accessible locations - O(n) with caching
     */
    getAccessibleLocations() {
        // Return cached result if valid
        if (!this._cacheInvalid && this._accessibleCache) {
            return this._accessibleCache;
        }

        const vehicle = VEHICLES_MAP.get(this.currentVehicle);
        const accessLevel = vehicle?.accessLevel || 0;
        const accessible = [];

        // Single pass through locations - O(n)
        for (const location of LOCATIONS) {
            // Check vehicle requirement - O(1)
            if (location.requiresVehicle === 'car' && accessLevel < 2) continue;
            if (location.requiresVehicle === 'luxury_car' && accessLevel < 3) continue;
            if (location.requiresVehicle === 'bus' && accessLevel < 1) continue;

            // Unlock check - O(1)
            if (location.unlockRequirement) {
                const req = location.unlockRequirement;
                if (req.stat) {
                    const statVal = this.gameState.characterStats?.getStat(req.stat) || 0;
                    if (statVal < req.value) continue;
                }
                if (req.reputation && this.gameState.reputation < (req.reputation || 0)) continue;
                if (req.money && this.gameState.money < req.money) continue;
            }
            
            accessible.push(location);
        }

        // Cache result
        this._accessibleCache = accessible;
        this._cacheInvalid = false;
        
        return accessible;
    }

    /**
     * Check if can travel to location - O(1)
     */
    canTravelTo(locationId) {
        const location = LOCATIONS_MAP.get(locationId);
        if (!location) return { can: false, reason: 'Unknown location' };

        // Check if accessible using cached list
        const accessible = this.getAccessibleLocations();
        const isAccessible = accessible.some(l => l.id === locationId);
        
        if (!isAccessible) {
            return { can: false, reason: 'Location not accessible with current vehicle/stats' };
        }

        return { can: true, travelTime: location.travelTime };
    }

    /**
     * Travel to a location - O(1)
     */
    travelTo(locationId) {
        const check = this.canTravelTo(locationId);
        if (!check.can) return check;

        const location = LOCATIONS_MAP.get(locationId);
        const vehicle = VEHICLES_MAP.get(this.currentVehicle);

        // Calculate travel time
        const baseTravelTime = location.travelTime;
        const actualSlots = Math.max(0, Math.ceil(baseTravelTime / vehicle.travelSpeed));

        this.currentLocation = locationId;
        this.visitedLocations.add(locationId); // Set.add is O(1)
        
        // Invalidate cache
        this._invalidateCache();

        return {
            success: true,
            location,
            timeCost: actualSlots
        };
    }

    /**
     * Get vehicle details - O(1)
     */
    getVehicle(vehicleId) {
        return VEHICLES_MAP.get(vehicleId);
    }

    /**
     * Buy a vehicle - O(1)
     */
    buyVehicle(vehicleId) {
        const vehicle = VEHICLES_MAP.get(vehicleId);
        if (!vehicle) return { success: false, reason: 'Unknown vehicle' };

        if (this.gameState.money < vehicle.price) {
            return { success: false, reason: 'Not enough money' };
        }

        if (this.ownedVehicles.has(vehicleId)) { // Set.has is O(1)
            return { success: false, reason: 'Already own this vehicle' };
        }

        this.gameState.money -= vehicle.price;
        this.ownedVehicles.add(vehicleId); // Set.add is O(1)
        this.currentVehicle = vehicleId;
        
        // Invalidate cache (vehicle change affects accessibility)
        this._invalidateCache();

        // Add reputation
        this.gameState.reputation += vehicle.reputation;

        return { success: true, vehicle };
    }

    /**
     * Switch to a different owned vehicle - O(1)
     */
    switchVehicle(vehicleId) {
        if (!this.ownedVehicles.has(vehicleId)) { // Set.has is O(1)
            return { success: false, reason: 'You don\'t own this vehicle' };
        }

        this.currentVehicle = vehicleId;
        this._invalidateCache(); // Vehicle change affects accessibility
        
        return { success: true };
    }

    /**
     * Get activities available at current location - O(1)
     */
    getCurrentActivities() {
        const location = this.getCurrentLocation();
        return location?.activities || [];
    }

    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            currentLocation: this.currentLocation,
            currentVehicle: this.currentVehicle,
            ownedVehicles: Array.from(this.ownedVehicles), // Convert Set to Array
            visitedLocations: Array.from(this.visitedLocations), // Convert Set to Array
            locationOverrides: this.locationOverrides
        };
    }

    /**
     * Load from saved data
     */
    fromJSON(data) {
        if (!data) return;
        this.currentLocation = data.currentLocation || 'home';
        this.currentVehicle = data.currentVehicle || 'walking';
        this.ownedVehicles = new Set(data.ownedVehicles || ['walking']);
        this.visitedLocations = new Set(data.visitedLocations || ['home']);
        this.locationOverrides = data.locationOverrides || {};
        this._invalidateCache();
    }
}
