/**
 * WorldEvolutionSystem.js
 * Handles the weekly business health simulation and evolution of the game world.
 */

import { GameState } from '../GameState.js';
import { Economy } from '../Economy.js';
import { NewsManager } from '../NewsManager.js';
import { MapManager } from '../MapManager.js';

class WorldEvolutionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.economy = new Economy();
        this.newsManager = new NewsManager();
        this.mapManager = new MapManager();

        // Initialize business locations
        this.businessLocations = this.getBusinessLocation();
    }

    /**
     * Process weekly changes in the game world.
     */
    processWeeklyChanges() {
        this.economy.updateEconomicClimate();
        this.applyBusinessHealthChanges();
        this.checkForClosuresAndLayoffs();
        this.generateNewsEvents();
    }

    /**
     * Update the game world.
     */
    update() {
        this.processWeeklyChanges();
    }

    /**
     * Apply health changes to businesses.
     */
    applyBusinessHealthChanges() {
        for (const location of this.gameState.locations) {
            const business = location.business;
            if (business) {
                business.health += this.economy.getWeeklyHealthChange();
                business.health = Math.max(0, Math.min(100, business.health));
            }
        }
    }

    /**
     * Check for business closures and layoffs.
     */
    checkForClosuresAndLayoffs() {
        for (const location of this.gameState.locations) {
            const business = location.business;
            if (business) {
                if (business.health <= this.economy.getClosureThreshold()) {
                    this.closeBusiness(location);
                } else if (business.health <= this.economy.getLayoffThreshold()) {
                    this.layoffEmployees(location);
                }
            }
        }
    }

    /**
     * Close a business.
     * @param {Object} location - The location where the business is located.
     */
    closeBusiness(location) {
        const business = location.business;
        business.status = 'closed';
        this.newsManager.reportBusinessClosure(business.name);
    }

    /**
     * Lay off employees at a business.
     * @param {Object} location - The location where the business is located.
     */
    layoffEmployees(location) {
        const business = location.business;
        const layoffs = Math.floor(business.employees * 0.2);
        business.employees -= layoffs;
        this.newsManager.reportLayoffs(business.name, layoffs);
    }

    /**
     * Generate news events based on the current game state.
     */
    generateNewsEvents() {
        for (const event of this.newsManager.generateEvents(this.gameState)) {
            this.newsManager.addEvent(event);
        }
    }

    /**
     * Get the business location mapping.
     * @returns {Object} - The business location mapping.
     */
    getBusinessLocation() {
        const businessLocations = {
            'business1': { x: 10, y: 10 },
            'business2': { x: 15, y: 15 },
            'business3': { x: 20, y: 20 },
            'business4': { x: 25, y: 25 },
            'business5': { x: 30, y: 30 }
        };

        // Reconcile with actual map location data
        for (const [businessId, position] of Object.entries(businessLocations)) {
            const zone = this.mapManager.getZoneSystem().getZoneAt(position.x, position.y);
            if (zone) {
                const block = this.mapManager.getBlockSystem().getBlockAt(position.x, position.y);
                if (block) {
                    this.mapManager.getBuildingSystem().placeBuilding({
                        id: businessId,
                        type: 'business',
                        position: position
                    });
                }
            }
        }

        return businessLocations;
    }
}

export default WorldEvolutionSystem;