/**
 * Crime System - Handles all illegal activities within the game
 * Allows for various criminal activities with different outcomes and consequences
 */

import { gameState } from './gameState';
import { Character } from './Character';
import { triggerInvestigation, handleArrest } from './InvestigationSystem';

// Crime types
export const CRIME_TYPES = {
    PUMP_AND_DUMP: 'pump_dump',
    INSIDER_TRADING: 'insider_trading',
    RAT_HOLE: 'rathole',
    FABRICATE_DATA: 'fabricate_data'
};

// CrimeSystem class
export class CrimeSystem {
    constructor() {
        this.heat = 0;
        this.crimesCommitted = 0;
    }

    /**
     * Commit a crime of the specified type with given parameters
     * @param {string} type - Type of crime to commit
     * @param {Object} params - Parameters specific to the crime
     * @returns {Object} - Result of the crime attempt
     */
    commitCrime(type, params) {
        if (!CRIME_TYPES[type]) {
            return { success: false, message: 'Unknown crime.' };
        }

        switch (type) {
            case CRIME_TYPES.PUMP_AND_DUMP:
                return this.executePumpAndDump(params);
            case CRIME_TYPES.INSIDER_TRADING:
                return this.executeInsiderTrading(params);
            case CRIME_TYPES.RAT_HOLE:
                return this.executeRathole(params);
            case CRIME_TYPES.FABRICATE_DATA:
                return this.executeFabricateData(params);
            default:
                return { success: false, message: 'Unknown crime.' };
        }
    }

    /**
     * Execute pump and dump scheme
     * @param {Object} params - Parameters specific to the crime
     * @returns {Object} - Result of the crime attempt
     */
    executePumpAndDump(params) {
        const risk = 30 + (this.heat / 2);
        const success = Math.random() > (risk / 100);

        if (success) {
            gameState.money += params.amount * 0.1;
            gameState.reputation -= 50;
            this.crimesCommitted++;
            this.heat += 5;
            gameState.characterStats.modifyEthics(-15);
        } else {
            triggerInvestigation();
        }

        return { success };
    }

    /**
     * Execute insider trading
     * @param {Object} params - Parameters specific to the crime
     * @returns {Object} - Result of the crime attempt
     */
    executeInsiderTrading(params) {
        const risk = 20 + (this.heat / 2);
        const success = Math.random() > (risk / 100);

        if (success) {
            gameState.money += params.amount * 0.2;
            gameState.reputation -= 20;
            this.crimesCommitted++;
            this.heat += 7;
            gameState.characterStats.modifyEthics(-10);
        } else {
            triggerInvestigation();
        }

        return { success };
    }

    /**
     * Execute rathole scheme
     * @param {Object} params - Parameters specific to the crime
     * @returns {Object} - Result of the crime attempt
     */
    executeRathole(params) {
        const risk = 10 + (this.heat / 2);
        const success = Math.random() > (risk / 100);

        if (success) {
            gameState.money += params.amount * 0.2;
            this.crimesCommitted++;
            this.heat += 10;
            gameState.characterStats.modifyEthics(-10);
        } else {
            triggerInvestigation();
        }

        return { success };
    }

    /**
     * Execute fabricate data scheme
     * @param {Object} params - Parameters specific to the crime
     * @returns {Object} - Result of the crime attempt
     */
    executeFabricateData(params) {
        const risk = 40 + (this.heat / 2);
        const success = Math.random() > (risk / 100);

        if (success) {
            gameState.money += 5000;
            gameState.reputation += 100;
            this.crimesCommitted++;
            this.heat += 15;
            gameState.characterStats.modifyEthics(-20);
        } else {
            handleArrest();
            return { success: false, caught: true };
        }

        return { success };
    }

    /**
     * Add heat to the crime system
     * @param {number} amount - Amount of heat to add
     */
    addHeat(amount) {
        this.heat = Math.min(100, this.heat + amount);
    }

    /**
     * Reduce heat from the crime system
     * @param {number} amount - Amount of heat to reduce
     */
    reduceHeat(amount) {
        this.heat = Math.max(0, this.heat - amount);
    }
}