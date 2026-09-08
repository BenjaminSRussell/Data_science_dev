/**
 * Location Tester
 * Tests all locations for errors and allows quick navigation
 */

export class LocationTester {
    constructor(game) {
        this.game = game;
    }

    /**
     * Get all locations
     */
    getAllLocations() {
        try {
            const locations = [];
            const locationIds = new Set();
            
            // Get from WorldMap if available
            if (this.game?.gameState?.worldMap?.getLocations) {
                try {
                    const worldMapLocs = this.game.gameState.worldMap.getLocations();
                    if (Array.isArray(worldMapLocs)) {
                        worldMapLocs.forEach(loc => {
                            if (loc && loc.id && !locationIds.has(loc.id)) {
                                locations.push(loc);
                                locationIds.add(loc.id);
                            }
                        });
                    }
                } catch (error) {
                    console.warn('Error getting locations from worldMap:', error);
                }
            }

            // Add known location IDs if we don't have them yet
            const knownLocationIds = [
                'home', 'office', 'library', 'gym', 'coffee_shop', 'donut_shop',
                'bagel_shop', 'flower_store', 'networking_bar', 'bank', 'stock_exchange',
                'city_hall', 'university', 'mall', 'car_dealership', 'downtown',
                'tech_hub', 'luxury_district', 'real_estate'
            ];
            
            knownLocationIds.forEach(id => {
                if (!locationIds.has(id)) {
                    const name = id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    locations.push({ id, name });
                    locationIds.add(id);
                }
            });

            return locations;
        } catch (error) {
            console.error('Error in getAllLocations:', error);
            return [];
        }
    }

    /**
     * Test a location - navigate to it and check for errors
     */
    async testLocation(locationId) {
        const results = {
            locationId,
            success: false,
            errors: [],
            warnings: [],
            testedAt: new Date().toISOString()
        };

        try {
            if (!locationId) {
                results.errors.push('Location ID is required');
                return results;
            }

            // Try to navigate to location
            if (this.game?.gameState?.worldMap?.setCurrentLocation) {
                try {
                    this.game.gameState.worldMap.setCurrentLocation(locationId);
                    results.success = true;
                    results.message = `Successfully navigated to ${locationId}`;
                } catch (error) {
                    results.errors.push(`Error setting location: ${error.message}`);
                }
            } else if (this.game?.environmentManager) {
                // Try environment manager
                try {
                    this.game.environmentManager.updateLocation();
                    results.success = true;
                    results.message = `Updated environment for ${locationId}`;
                } catch (error) {
                    results.errors.push(`Error updating environment: ${error.message}`);
                }
            } else {
                results.warnings.push('No location system available');
            }

            // Check if location exists and is accessible
            try {
                const location = this.getAllLocations().find(l => l && l.id === locationId);
                if (!location) {
                    results.warnings.push(`Location ${locationId} not found in location list`);
                }
            } catch (error) {
                results.warnings.push(`Error checking location: ${error.message}`);
            }

            // Test if location can be rendered
            if (this.game?.screenManager?.showScreen) {
                try {
                    this.game.screenManager.showScreen('screen-map');
                } catch (error) {
                    results.warnings.push(`Error showing map screen: ${error.message}`);
                }
            }

            // Check for console errors (would need to be done in browser)
            results.consoleErrors = 'Check browser console for errors';

        } catch (error) {
            results.errors.push(error.message || 'Unknown error');
            results.stack = error.stack;
        }

        return results;
    }

    /**
     * Test all locations
     */
    async testAllLocations() {
        const locations = this.getAllLocations();
        const results = {
            total: locations.length,
            passed: 0,
            failed: 0,
            warnings: 0,
            details: []
        };

        for (const location of locations) {
            const testResult = await this.testLocation(location.id);
            results.details.push(testResult);
            
            if (testResult.success && testResult.errors.length === 0) {
                results.passed++;
            } else if (testResult.errors.length > 0) {
                results.failed++;
            } else {
                results.warnings++;
            }
        }

        return results;
    }

    /**
     * Navigate to location (quick jump)
     */
    navigateToLocation(locationId) {
        try {
            // Navigate via world map
            if (this.game.gameState?.worldMap?.setCurrentLocation) {
                this.game.gameState.worldMap.setCurrentLocation(locationId);
            }
            
            // Update environment
            if (this.game.environmentManager) {
                this.game.environmentManager.updateLocation();
            }
            
            // Show map screen
            if (this.game.screenManager) {
                this.game.screenManager.showScreen('screen-map');
            }

            return { success: true, message: `Navigated to ${locationId}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

