/**
 * LegalSystem.js
 * Manages the player's legal status and licenses.
 */

export class LegalSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.licenses = {};
    }

    /**
     * Acquire a license
     * @param {string} licenseId - The ID of the license to acquire
     * @returns {object} - Result object with success status and message
     */
    acquireLicense(licenseId) {
        const license = this.getLicenseById(licenseId);

        if (!license) {
            return { success: false, message: "Unknown license." };
        }

        if (this.licenses[licenseId]) {
            return { success: false, message: "You already have this license." };
        }

        if (this.gameState.money < license.cost) {
            return { success: false, message: "Insufficient funds." };
        }

        this.gameState.money -= license.cost;
        this.licenses[licenseId] = true;
        return { success: true, message: "License acquired successfully." };
    }

    /**
     * Check if a license is owned
     * @param {string} licenseId - The ID of the license to check
     * @returns {boolean} - True if the license is owned, false otherwise
     */
    hasLicense(licenseId) {
        return this.licenses[licenseId] === true;
    }

    /**
     * Get a license by its ID
     * @param {string} licenseId - The ID of the license to get
     * @returns {object|null} - The license object or null if not found
     */
    getLicenseById(licenseId) {
        return this.gameState.licensePacks.find(l => l.id === licenseId);
    }

    toJSON() {
        return {
            licenses: this.licenses
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.licenses = data.licenses || {};
    }
}