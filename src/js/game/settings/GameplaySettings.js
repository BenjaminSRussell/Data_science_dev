/**
 * GameplaySettings.js
 * Manages gameplay style options
 * Can turn relationship aspects on/off
 */

// Allowed ranges for numeric settings (#1073)
const NUMERIC_RANGES = {
    difficulty: {
        bossDemand: [0, 100],
        taskFrequency: [1, 10],
        competition: [0, 100]
    }
};

/**
 * Coerce a value to the type of the default it replaces. Returns
 * { ok, value }: booleans must be booleans, numbers must be finite and are
 * clamped to their range.
 */
function sanitizeSetting(category, key, value, defaultValue) {
    if (typeof defaultValue === 'boolean') {
        return typeof value === 'boolean' ? { ok: true, value } : { ok: false };
    }
    if (typeof defaultValue === 'number') {
        const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
        if (typeof n !== 'number' || !Number.isFinite(n)) return { ok: false };
        const [min, max] = NUMERIC_RANGES[category]?.[key] ?? [-Infinity, Infinity];
        return { ok: true, value: Math.min(max, Math.max(min, n)) };
    }
    return { ok: true, value };
}

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
                // Matches the boss's long-standing default demand (#1251)
                bossDemand: 70,
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
        const group = this.settings[category];
        // Unknown categories and keys are rejected (#1073)
        if (!group || !Object.prototype.hasOwnProperty.call(group, key)) return false;
        const result = sanitizeSetting(category, key, value, group[key]);
        if (!result.ok) return false;
        group[key] = result.value;
        return true;
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
                // Saved values get the same type/range checks as setSetting()
                for (const k of Object.keys(base)) {
                    if (!(k in incoming)) continue;
                    const result = sanitizeSetting(key, k, incoming[k], base[k]);
                    merged[key][k] = result.ok ? result.value : base[k];
                }
            } else {
                merged[key] = base ? { ...base } : incoming;
            }
        }
        this.settings = merged;
    }
}

