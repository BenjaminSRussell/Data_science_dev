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
        // True toggle: omitted/undefined flips current value (#2630)
        if (typeof enabled !== 'boolean') {
            enabled = !this.settings.relationships.enabled;
        }
        this.settings.relationships.enabled = enabled;
        return this.settings.relationships.enabled;
    }
    
    /**
     * Toggle romance
     */
    toggleRomance(enabled) {
        // True toggle: omitted/undefined flips current value (#2630)
        if (typeof enabled !== 'boolean') {
            enabled = !this.settings.relationships.romance;
        }
        this.settings.relationships.romance = enabled;
        return this.settings.relationships.romance;
    }
    
    /**
     * Toggle jealousy
     */
    toggleJealousy(enabled) {
        // True toggle: omitted/undefined flips current value (#2630)
        if (typeof enabled !== 'boolean') {
            enabled = !this.settings.relationships.jealousy;
        }
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
        let parsed;
        try {
            parsed = typeof json === 'string' ? JSON.parse(json) : json;
        } catch (e) {
            console.error('Failed to load settings:', e);
            return;
        }
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            console.error('Failed to load settings:', new TypeError('settings must be an object'));
            return;
        }
        // Merge each category over the defaults so a partial or older save
        // can't wipe out categories it doesn't mention
        const defaults = new GameplaySettings().settings;
        const merged = {};
        for (const key of new Set([...Object.keys(defaults), ...Object.keys(parsed)])) {
            const base = defaults[key];
            const incoming = parsed[key];
            if (base && incoming && typeof incoming === 'object' && !Array.isArray(incoming)) {
                merged[key] = { ...base, ...incoming };
            } else {
                merged[key] = base ? { ...base } : incoming;
            }
        }
        this.settings = merged;
    }
}

