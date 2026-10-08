/**
 * LegalSystem.js
 * Manages the player's legal status and licenses.
 */

/**
 * License catalog. getLicenseById() used to read gameState.licensePacks, which
 * nothing ever defines, so every City Hall purchase threw a TypeError.
 */
export const LICENSES = [
    { id: 'drivers_license', name: "Driver's License", cost: 200 },
    { id: 'llc_registration', name: 'LLC Registration', cost: 500 },
    { id: 'business_license', name: 'Business License', cost: 2000 },
    { id: 'series_7', name: 'Series 7 License', cost: 1500 },
    { id: 'series_63', name: 'Series 63 License', cost: 1000 }
];

export class LegalSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.licenses = {};
        this.lawyer = null;
        // Recorded legal problems (data violations etc.) (#1173, #2074)
        this.legalIssues = [];
        this.legalTrouble = 0; // 0-100
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
        return { success: true, message: `Acquired ${license.name}!` };
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

    /**
     * Hire a lawyer retainer (cheap / average / expensive).
     * Invalid tiers must not touch money (#12).
     */
    hireLawyer(tier) {
        const costs = { cheap: 500, average: 2500, expensive: 10000 };
        if (!Object.prototype.hasOwnProperty.call(costs, tier)) {
            return { success: false, message: "Unknown lawyer tier." };
        }
        const cost = costs[tier];
        if (this.gameState.money < cost) {
            return { success: false, message: "Cannot afford retainer." };
        }
        this.gameState.money -= cost;
        this.lawyer = tier;
        return { success: true, message: `Hired ${tier} lawyer for $${cost}.` };
    }

    getLicenseById(licenseId) {
        const packs = Array.isArray(this.gameState?.licensePacks) ? this.gameState.licensePacks : [];
        return LICENSES.find(l => l.id === licenseId) || packs.find(l => l.id === licenseId) || null;
    }

    /**
     * Record a legal issue (e.g. getting caught selling data). Raises legal
     * trouble and regulator heat (#1173, #2074).
     * @param {{type: string, severity?: number, description?: string}} issue
     */
    addLegalIssue(issue = {}) {
        const severity = Math.max(0, Number(issue.severity) || 0);
        const entry = {
            type: issue.type || 'unknown',
            severity,
            description: issue.description || '',
            day: this.gameState?.timeManager?.totalDays || 1
        };
        this.legalIssues.push(entry);
        if (this.legalIssues.length > 50) this.legalIssues.shift();
        this.legalTrouble = Math.min(100, (this.legalTrouble || 0) + severity);
        this.gameState?.crimeSystem?.addHeat?.(Math.ceil(severity / 2));
        return entry;
    }

    toJSON() {
        return {
            licenses: this.licenses,
            lawyer: this.lawyer || null,
            legalIssues: this.legalIssues,
            legalTrouble: this.legalTrouble
        };
    }

    fromJSON(data) {
        if (!data) return;
        // Merge into the live map, and accept the older
        // { id: { acquired: true } } save shape (#1539)
        const saved = data.licenses && typeof data.licenses === 'object' ? data.licenses : {};
        for (const [id, value] of Object.entries(saved)) {
            const owned = value === true || (value && typeof value === 'object' && value.acquired === true);
            if (owned) this.licenses[id] = true;
            else delete this.licenses[id];
        }
        this.lawyer = data.lawyer || null;
        this.legalIssues = Array.isArray(data.legalIssues) ? data.legalIssues : [];
        this.legalTrouble = Number(data.legalTrouble) || 0;
    }
}