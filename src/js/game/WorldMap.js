/**
 * World Map - Locations the player can visit
 * Each location has activities, requirements, and visual style
 */

// Always available
export const LOCATIONS = [
    {
        id: 'home',
        name: 'Studio Apartment',
        icon: '🏢',
        description: 'Your small layout. Rent is $500/week.',
        type: 'residence',
        travelTime: 0,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['work', 'rest', 'eat', 'study_books', 'online_course', 'meditation', 'presentation_practice', 'data_challenges'],
        position: { x: 50, y: 70 },
        background: 'linear-gradient(180deg, #2d3436 0%, #1a1a2e 100%)'
    },
    {
        id: 'office',
        name: 'Your Office',
        icon: '🏢',
        description: 'Where you work on client jobs.',
        type: 'work',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['work', 'check_clients', 'team_meeting'],
        position: { x: 40, y: 50 },
        background: 'linear-gradient(180deg, #1a1a3e 0%, #2d1b4e 100%)'
    },
    {
        id: 'library',
        name: 'Public Library',
        icon: '📚',
        description: 'Free books and quiet study space.',
        type: 'education',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['study_books', 'research'],
        position: { x: 30, y: 40 },
        background: 'linear-gradient(180deg, #8b5a2b 0%, #3c2a14 100%)'
    },
    {
        id: 'gym',
        name: 'Fitness Center',
        icon: '🏋️',
        description: 'Train your body, build stamina.',
        type: 'training',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['gym_workout'],
        position: { x: 60, y: 35 },
        background: 'linear-gradient(180deg, #ff6b9d 0%, #c44569 100%)'
    },
    {
        id: 'coffee_shop',
        name: 'Coffee Shop',
        icon: '☕',
        description: 'Grab coffee, meet people, boost focus.',
        type: 'social',
        travelTime: 0,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['coffee_network', 'buy_coffee'],
        position: { x: 45, y: 55 },
        background: 'linear-gradient(180deg, #ffd93d 0%, #c8a415 100%)'
    },
    {
        id: 'donut_shop',
        name: 'Donut Delights',
        icon: '🍩',
        description: 'Sweet treats to boost your mood and energy.',
        type: 'shop',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['buy_donut', 'eat_donut', 'buy_coffee'],
        position: { x: 48, y: 58 },
        background: 'linear-gradient(180deg, #ff9ff3 0%, #f368e0 100%)',
        layoutType: 'shop'
    },
    {
        id: 'bagel_shop',
        name: 'Bagel Bros',
        icon: '🥯',
        description: 'Hearty bagels for serious work sessions.',
        type: 'shop',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['buy_bagel', 'eat_bagel', 'coffee_network'],
        position: { x: 42, y: 52 },
        background: 'linear-gradient(180deg, #feca57 0%, #ff9f43 100%)',
        layoutType: 'shop'
    },
    {
        id: 'flower_store',
        name: 'Bloom & Grow',
        icon: '💐',
        description: 'Fresh flowers. Perfect for gifts.',
        type: 'shop',
        travelTime: 1,
        requiresVehicle: false,
        unlockRequirement: null,
        activities: ['buy_flowers', 'buy_plant'],
        position: { x: 55, y: 60 },
        background: 'linear-gradient(180deg, #54a0ff 0%, #2e86de 100%)',
        layoutType: 'shop'
    },

    // Requires walking distance
    {
        id: 'networking_bar',
        name: 'The Data Lounge',
        icon: '🍸',
        description: 'Upscale bar where professionals network.',
        type: 'social',
        travelTime: 2,
        requiresVehicle: false,
        unlockRequirement: { stat: 'charisma', value: 15 },
        activities: ['networking_event', 'meet_investor'],
        position: { x: 70, y: 45 },
        background: 'linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)'
    },


    // Requires bus or car
    {
        id: 'bank',
        name: 'First National Bank',
        icon: '🏦',
        description: 'Manage savings, loans, and investments.',
        type: 'finance',
        travelTime: 2,
        requiresVehicle: 'bus',
        unlockRequirement: { money: 1000 },
        activities: ['open_savings', 'apply_loan', 'invest'],
        position: { x: 55, y: 20 },
        background: 'linear-gradient(180deg, #6bcb77 0%, #38a169 100%)'
    },
    {
        id: 'stock_exchange',
        name: 'Stock Exchange',
        icon: '📈',
        description: 'Trade stocks and monitor the market.',
        type: 'finance',
        travelTime: 3,
        requiresVehicle: 'bus',
        unlockRequirement: { stat: 'analytics', value: 25 },
        activities: ['buy_stocks', 'sell_stocks', 'analyze_market'],
        position: { x: 75, y: 25 },
        background: 'linear-gradient(180deg, #00c853 0%, #009624 100%)'
    },
    {
        id: 'city_hall',
        name: 'City Hall',
        icon: '🏛️',
        description: 'Bureaucracy Central. Get your licenses here.',
        type: 'government',
        travelTime: 2,
        requiresVehicle: 'bus',
        unlockRequirement: null,
        activities: ['get_licenses'],
        position: { x: 50, y: 10 },
        background: 'linear-gradient(180deg, #607d8b 0%, #455a64 100%)'
    },
    {
        id: 'university',
        name: 'Tech University',
        icon: '🎓',
        description: 'Learn Data Science. Take real exams.',
        type: 'education',
        travelTime: 2,
        requiresVehicle: 'bus',
        unlockRequirement: null,
        activities: ['take_class'],
        position: { x: 80, y: 20 },
        background: 'linear-gradient(180deg, #3f51b5 0%, #1a237e 100%)'
    },
    {
        id: 'mall',
        name: 'Shopping Mall',
        icon: '🏪',
        description: 'Buy clothes, items, and gifts.',
        type: 'shopping',
        travelTime: 2,
        requiresVehicle: 'bus',
        unlockRequirement: null,
        activities: ['buy_clothes', 'buy_gifts', 'buy_electronics'],
        position: { x: 80, y: 60 },
        background: 'linear-gradient(180deg, #ff8548 0%, #e65100 100%)'
    },

    // Requires car
    {
        id: 'car_dealership',
        name: 'Auto World',
        icon: '🚗',
        description: 'Buy vehicles to travel faster and impress clients.',
        type: 'shopping',
        travelTime: 3,
        requiresVehicle: 'bus',
        unlockRequirement: { money: 5000 },
        activities: ['browse_cars', 'buy_car', 'sell_car'],
        position: { x: 85, y: 75 },
        background: 'linear-gradient(180deg, #3498db 0%, #2980b9 100%)'
    },
    {
        id: 'downtown',
        name: 'Downtown District',
        icon: '🏙️',
        description: 'Premium clients and high-stakes opportunities.',
        type: 'business',
        travelTime: 3,
        requiresVehicle: 'car',
        unlockRequirement: { reputation: 500 },
        activities: ['premium_clients', 'investor_meetings'],
        position: { x: 50, y: 15 },
        background: 'linear-gradient(180deg, #2c3e50 0%, #1a252f 100%)'
    },
    {
        id: 'tech_hub',
        name: 'Innovation Hub',
        icon: '🚀',
        description: 'Startups, accelerators, and venture capitalists.',
        type: 'business',
        travelTime: 4,
        requiresVehicle: 'car',
        unlockRequirement: { stat: 'charisma', value: 40, reputation: 1000 },
        activities: ['startup_networking', 'pitch_investors', 'join_accelerator'],
        position: { x: 20, y: 10 },
        background: 'linear-gradient(180deg, #9c27b0 0%, #7b1fa2 100%)'
    },
    {
        id: 'luxury_district',
        name: 'Platinum Heights',
        icon: '💎',
        description: 'Ultra-wealthy clients and exclusive events.',
        type: 'elite',
        travelTime: 5,
        requiresVehicle: 'luxury_car',
        unlockRequirement: { reputation: 5000, money: 100000 },
        activities: ['vip_clients', 'gala_events', 'yacht_networking'],
        position: { x: 10, y: 5 },
        background: 'linear-gradient(180deg, #ffd700 0%, #b8860b 100%)'
    },
    {
        id: 'real_estate',
        name: 'Property Investments',
        icon: '🏘️',
        description: 'Buy commercial and residential real estate.',
        type: 'investment',
        travelTime: 3,
        requiresVehicle: 'car',
        unlockRequirement: { money: 50000 },
        activities: ['browse_properties', 'buy_property', 'collect_rent'],
        position: { x: 90, y: 40 },
        background: 'linear-gradient(180deg, #795548 0%, #5d4037 100%)'
    }
];

// Vehicles and their travel capabilities
export const VEHICLES = [
    {
        id: 'walking',
        name: 'Walking',
        icon: '🚶',
        price: 0,
        travelSpeed: 1,
        accessLevel: 0, // Can only access locations with requiresVehicle: false
        reputation: 0,
        description: 'Free but limited range',
        monthlyUpkeep: 0
    },
    {
        id: 'bus_pass',
        name: 'Bus Pass',
        icon: '🚌',
        price: 50,
        travelSpeed: 2,
        accessLevel: 1, // Can access 'bus' locations
        reputation: 0,
        description: 'Monthly pass for public transit',
        monthlyUpkeep: 50,
        isMonthly: true
    },
    {
        id: 'used_car',
        name: 'Used Honda',
        icon: '🚗',
        price: 5000,
        travelSpeed: 3,
        accessLevel: 2, // Can access 'car' locations
        reputation: 5,
        description: 'Reliable and affordable',
        monthlyUpkeep: 100
    },
    {
        id: 'sedan',
        name: 'New Sedan',
        icon: '🚙',
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
        icon: '🏎️',
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
        icon: '🚘',
        price: 150000,
        travelSpeed: 5,
        accessLevel: 3, // Can access 'luxury_car' locations
        reputation: 50,
        description: 'Opens doors to elite circles',
        monthlyUpkeep: 600
    }
];

/**
 * WorldMap class - manages locations and travel
 */
export class WorldMap {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentLocation = 'home';
        this.currentVehicle = 'walking';
        this.ownedVehicles = ['walking'];
        this.visitedLocations = ['home'];
    }

    /**
     * Get location by ID
     */
    getLocation(locationId) {
        return LOCATIONS.find(l => l.id === locationId);
    }

    /**
     * Get current location data
     */
    getCurrentLocation() {
        return LOCATIONS.find(l => l.id === this.currentLocation);
    }


    /**
     * Get all accessible locations
     */
    getAccessibleLocations() {
        const vehicle = VEHICLES.find(v => v.id === this.currentVehicle);
        const accessLevel = vehicle?.accessLevel || 0;

        // Iterate all VALID IDs from LOCATIONS constant
        return LOCATIONS.map(l => this.getLocation(l.id)).filter(location => {
            // Check vehicle requirement
            if (location.requiresVehicle === 'car' && accessLevel < 2) return false;
            if (location.requiresVehicle === 'luxury_car' && accessLevel < 3) return false;
            if (location.requiresVehicle === 'bus' && accessLevel < 1) return false;

            // Unlock check
            if (location.unlockRequirement) {
                const req = location.unlockRequirement;
                // Stat check
                if (req.stat) {
                    const statVal = this.gameState.characterStats.getStat(req.stat);
                    if (statVal < req.value) return false;
                }
                // Reputation check
                if (req.reputation && this.gameState.reputation < (req.reputation || 0)) return false;
                // Net Worth check (new feature?)
                if (req.netWorth && this.gameState.money < req.netWorth) return false;
            }
            return true;
        });
    }

    /**
     * Get current location object
     */
    getCurrentLocation() {
        return this.getLocation(this.currentLocation);
    }

    /**
     * Check if can travel to location
     */
    canTravelTo(locationId) {
        const location = this.getLocation(locationId);
        if (!location) return { can: false, reason: 'Unknown location' };

        const accessible = this.getAccessibleLocations();
        if (!accessible.find(l => l.id === locationId)) {
            return { can: false, reason: 'Location not accessible with current vehicle/stats' };
        }

        return { can: true, travelTime: location.travelTime };
    }

    /**
     * Travel to a location
     */
    travelTo(locationId) {
        const check = this.canTravelTo(locationId);
        if (!check.can) return check;

        const location = this.getLocation(locationId);
        const vehicle = VEHICLES.find(v => v.id === this.currentVehicle);

        // Calculate travel time (reduced by vehicle speed)
        const baseTravelTime = location.travelTime;
        const actualSlots = Math.max(0, Math.ceil(baseTravelTime / vehicle.travelSpeed));

        this.currentLocation = locationId;

        // Track visited locations
        if (!this.visitedLocations.includes(locationId)) {
            this.visitedLocations.push(locationId);
        }

        return {
            success: true,
            location,
            timeCost: actualSlots
        };
    }

    /**
     * Get vehicle details
     */
    getVehicle(vehicleId) {
        return VEHICLES.find(v => v.id === vehicleId);
    }

    /**
     * Buy a vehicle
     */
    buyVehicle(vehicleId) {
        const vehicle = VEHICLES.find(v => v.id === vehicleId);
        if (!vehicle) return { success: false, reason: 'Unknown vehicle' };

        if (this.gameState.money < vehicle.price) {
            return { success: false, reason: 'Not enough money' };
        }

        if (this.ownedVehicles.includes(vehicleId)) {
            return { success: false, reason: 'Already own this vehicle' };
        }

        this.gameState.money -= vehicle.price;
        this.ownedVehicles.push(vehicleId);
        this.currentVehicle = vehicleId;

        // Add reputation
        this.gameState.reputation += vehicle.reputation;

        return { success: true, vehicle };
    }

    /**
     * Switch to a different owned vehicle
     */
    switchVehicle(vehicleId) {
        if (!this.ownedVehicles.includes(vehicleId)) {
            return { success: false, reason: 'You don\'t own this vehicle' };
        }

        this.currentVehicle = vehicleId;
        return { success: true };
    }

    /**
     * Get activities available at current location
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
            ownedVehicles: this.ownedVehicles,
            visitedLocations: this.visitedLocations,
            locationOverrides: this.locationOverrides
        };
    }

    /**
     * Load from saved data
     */
    fromJSON(data) {
        if (!data) return;
        Object.assign(this, data);
        if (!this.locationOverrides) this.locationOverrides = {};
    }
}
