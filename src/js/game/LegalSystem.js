/**
 * LegalSystem.js
 * Manages licenses, lawyers, and legal consequences.
 */
export class LegalSystem {
    constructor(gameState) {
        this.gameState = gameState;

        this.licenses = {
            drivers_license: { acquired: false, cost: 200, name: "Driver's License" },
            llc_registration: { acquired: false, cost: 500, name: "LLC Registration" },
            business_license: { acquired: false, cost: 2000, name: "Business License" },
            series_7: { acquired: false, cost: 1500, name: "Series 7 License" },
            series_63: { acquired: false, cost: 1000, name: "Series 63 License" }
        };

        this.lawyer = null; // 'cheap', 'average', 'expensive'
        this.legalTrouble = 0; // 0-100% risk of lawsuit/audit
    }

    /**
     * Check if player has a specific license
     */
    hasLicense(licenseId) {
        return this.licenses[licenseId] && this.licenses[licenseId].acquired;
    }

    /**
     * Acquire a license
     */
    acquireLicense(licenseId) {
        const license = this.licenses[licenseId];
        if (!license) return { success: false, message: "Unknown license." };
        if (license.acquired) return { success: false, message: "You already have this license." };

        if (this.gameState.money < license.cost) {
            return { success: false, message: `You need $${license.cost} for a ${license.name}.` };
        }

        // Check prerequisites
        if (licenseId === 'series_7' && !this.hasLicense('llc_registration')) {
            // Maybe allow personal trading, but require LLC for business trading? 
            // Keep it simple: No prereqs for now, or maybe Series 7 needs an exam passed event?
        }

        this.gameState.money -= license.cost;
        license.acquired = true;

        return { success: true, message: `Acquired ${license.name}! You are now legally compliant.` };
    }

    /**
     * Hire a lawyer
     */
    hireLawyer(tier) {
        const costs = {
            'cheap': 500,      // Dewey, Cheatem & Howe
            'average': 2500,   // Hamlin, Hamlin & McGill
            'expensive': 10000 // Pearson Specter Litt
        };

        if (this.gameState.money < costs[tier]) return { success: false, message: "Cannot afford retainer." };

        this.gameState.money -= costs[tier];
        this.lawyer = tier;

        return { success: true, message: "Lawyer retained. You have legal protection." };
    }

    /**
     * Serialization
     */
    toJSON() {
        return {
            licenses: this.licenses,
            lawyer: this.lawyer,
            legalTrouble: this.legalTrouble
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.licenses = data.licenses || this.licenses;
        this.lawyer = data.lawyer;
        this.legalTrouble = data.legalTrouble || 0;
    }
}
