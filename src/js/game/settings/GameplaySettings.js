/**
 * GameplaySettings.js
 * Manages gameplay style options
 * Can turn relationship aspects on/off
 */

export class GameplaySettings {
    constructor() {
        this.settings = {
            relationships: {
                enabled: true,
                romance: true,
                jealousy: true,
                social: true
            },
            company: {
                enabled: true,
                hiring: true,
                clients: true,
                management: true
            },
            difficulty: {
                bossDemand: 50,
                taskFrequency: 3,
                competition: 50
            },
            visuals: {
                lowPoly: true,
                animations: true,
                details: true
            }
        };
    }
    
    /**
     * Toggle relationship aspects
     */
    toggleRelationships(enabled) {
        this.settings.relationships.enabled = enabled;
        return this.settings.relationships.enabled;
    }
    
    /**
     * Toggle romance
     */
    toggleRomance(enabled) {
        this.settings.relationships.romance = enabled;
        return this.settings.relationships.romance;
    }
    
    /**
     * Toggle jealousy
     */
    toggleJealousy(enabled) {
        this.settings.relationships.jealousy = enabled;
        return this.settings.relationships.jealousy;
    }
    
    /**
     * Get setting value
     */
    getSetting(category, key) {
        return this.settings[category]?.[key] ?? null;
    }
    
    /**
     * Set setting value
     */
    setSetting(category, key, value) {
        if (this.settings[category]) {
            this.settings[category][key] = value;
        }
    }
    
    /**
     * Export settings
     */
    toJSON() {
        return JSON.stringify(this.settings);
    }
    
    /**
     * Import settings
     */
    fromJSON(json) {
        try {
            this.settings = JSON.parse(json);
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }
}

