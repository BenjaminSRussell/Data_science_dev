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

/** Lawyer retainers, cheapest first; the index is the tier's rank */
export const LAWYER_TIERS = [
    { id: 'cheap', name: 'Budget Lawyer', cost: 500, reduction: 0.2 },
    { id: 'average', name: 'Solid Lawyer', cost: 2500, reduction: 0.4 },
    { id: 'expensive', name: 'Top-Tier Lawyer', cost: 10000, reduction: 0.6 }
];

/** How much a retained lawyer cuts fines and sentences (0 without one) */
export function getLawyerReduction(tier) {
    return LAWYER_TIERS.find(t => t.id === tier)?.reduction || 0;
}

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
        const rank = LAWYER_TIERS.findIndex(t => t.id === tier);
        if (rank === -1) {
            return { success: false, message: "Unknown lawyer tier." };
        }
        // Re-buying the same (or a worse) retainer would just burn money
        const currentRank = LAWYER_TIERS.findIndex(t => t.id === this.lawyer);
        if (currentRank >= rank) {
            return { success: false, message: "You already retain an equal or better lawyer." };
        }
        const cost = LAWYER_TIERS[rank].cost;
        if (this.gameState.money < cost) {
            return { success: false, message: "Cannot afford retainer." };
        }
        this.gameState.money -= cost;
        this.lawyer = tier;
        return { success: true, message: `Hired ${tier} lawyer for $${cost}.` };
    }

    /**
     * Weekly legal tick: accumulated legal trouble can trigger an audit fine
     * (a lawyer softens it); otherwise it slowly cools off (#1538)
     * @param {() => number} rng
     * @returns {{audited: boolean, fine: number, legalTrouble: number}}
     */
    processWeek(rng = Math.random) {
        const trouble = Number(this.legalTrouble) || 0;
        if (trouble <= 0) return { audited: false, fine: 0, legalTrouble: 0 };

        const reduction = getLawyerReduction(this.lawyer);
        // Up to a 50% weekly audit chance at maximum trouble
        if (rng() < trouble / 200) {
            const fullFine = Math.round(trouble * 100 * (1 - reduction));
            const fine = Math.max(0, Math.min(fullFine, Math.floor(Number(this.gameState?.money) || 0)));
            this.gameState.money = (Number(this.gameState.money) || 0) - fine;
            this.legalTrouble = Math.floor(trouble / 2);
            return { audited: true, fine, legalTrouble: this.legalTrouble };
        }

        // A lawyer makes trouble go away faster
        this.legalTrouble = Math.max(0, trouble - (5 + Math.round(reduction * 10)));
        return { audited: false, fine: 0, legalTrouble: this.legalTrouble };
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