class DetailedMapSystem {
    constructor() {
        this.unlockedLocations = new Set(['home', 'coffee_shop', 'office']);
    }

    isLocationUnlocked(locationId) {
        return this.unlockedLocations.has(locationId);
    }

    unlockLocation(locationId) {
        this.unlockedLocations.add(locationId);
        return true;
    }
}