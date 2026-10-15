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

/**
 * Boolean gameplay flag. Missing settings stay on so systems built before
 * the settings object, and tests that never set one, keep current behavior.
 * An explicit false turns the feature off (#2276).
 */
export function readGameplayFlag(gameState, category, key) {
    const group = gameState?.gameplaySettings?.settings?.[category];
    if (!group || typeof group !== 'object') return true;
    if (!Object.prototype.hasOwnProperty.call(group, key)) return true;
    return group[key] !== false;
}

/**
 * Finite numeric setting, or fallback when the player has not set one.
 */
export function readGameplayNumber(gameState, category, key, fallback) {
    const value = gameState?.gameplaySettings?.settings?.[category]?.[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Relationship sub-feature. The master switch turns every one of them off. */
export function relationshipFeature(gameState, key) {
    return readGameplayFlag(gameState, 'relationships', 'enabled')
        && readGameplayFlag(gameState, 'relationships', key);
}

/** Company sub-feature. The master switch turns every one of them off. */
export function companyFeature(gameState, key) {
    return readGameplayFlag(gameState, 'company', 'enabled')
        && readGameplayFlag(gameState, 'company', key);
}

// Rows the settings modal renders. Defaults match the constructor (#2276).
const CONTROL_SPECS = [
    { type: 'check', category: 'relationships', key: 'enabled', label: 'Relationships' },
    { type: 'check', category: 'relationships', key: 'romance', label: 'Romance' },
    { type: 'check', category: 'relationships', key: 'jealousy', label: 'Jealousy' },
    { type: 'check', category: 'relationships', key: 'social', label: 'Social life' },
    { type: 'check', category: 'company', key: 'enabled', label: 'Company' },
    { type: 'check', category: 'company', key: 'hiring', label: 'Hiring' },
    { type: 'check', category: 'company', key: 'clients', label: 'Clients' },
    { type: 'check', category: 'company', key: 'management', label: 'Management' },
    { type: 'range', category: 'difficulty', key: 'bossDemand', label: 'Boss demand', min: 0, max: 100, step: 1 },
    { type: 'range', category: 'difficulty', key: 'taskFrequency', label: 'Task frequency', min: 1, max: 10, step: 1 },
    { type: 'range', category: 'difficulty', key: 'competition', label: 'Competition', min: 0, max: 100, step: 1 },
    { type: 'check', category: 'visuals', key: 'lowPoly', label: 'Low-poly look' },
    { type: 'check', category: 'visuals', key: 'animations', label: 'Animations' },
    { type: 'check', category: 'visuals', key: 'details', label: 'Extra detail' }
];

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
        if (category === 'visuals') this.applyVisuals();
        return true;
    }

    /**
     * Markup for the settings modal. Uses gameplay-settings-row, not
     * settings-row, so the audio/quality rows stay a separate group.
     */
    renderControls() {
        return CONTROL_SPECS.map((spec) => {
            const id = `gp-${spec.category}-${spec.key}`;
            const current = this.getSetting(spec.category, spec.key);
            if (spec.type === 'range') {
                return `<div class="gameplay-settings-row">
                        <label class="settings-label" for="${id}">${spec.label}</label>
                        <input type="range" id="${id}" min="${spec.min}" max="${spec.max}" step="${spec.step}" value="${current}" data-gp-cat="${spec.category}" data-gp-key="${spec.key}">
                        <span class="settings-hint" id="${id}-value">${current}</span>
                    </div>`;
            }
            const checked = current !== false ? 'checked' : '';
            return `<div class="gameplay-settings-row">
                    <label class="settings-label" for="${id}">${spec.label}</label>
                    <label class="toggle">
                        <input type="checkbox" id="${id}" data-gp-cat="${spec.category}" data-gp-key="${spec.key}" ${checked}>
                        <span class="toggle-slider" aria-hidden="true"></span>
                    </label>
                </div>`;
        }).join('');
    }

    /**
     * Push visuals onto the document. Classes are added only for the
     * non-default states, so a fresh game looks the same as before.
     */
    applyVisuals(root) {
        const el = root || (typeof document !== 'undefined' ? document.documentElement : null);
        if (!el?.classList) return;
        const visuals = this.settings?.visuals || {};
        el.classList.toggle('gp-no-animations', visuals.animations === false);
        el.classList.toggle('gp-no-details', visuals.details === false);
        el.classList.toggle('gp-smooth', visuals.lowPoly === false);
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
        this.applyVisuals();
    }
}

