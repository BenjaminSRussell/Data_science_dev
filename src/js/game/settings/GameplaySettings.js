import { DEFAULT_SETTINGS } from './SettingsData';

export class GameplaySettings {
    constructor() {
        this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }

    toggleRelationships(enabled) {
        this.settings.relationships.enabled = enabled;
        return this.settings.relationships.enabled;
    }

    toggleRomance(enabled) {
        this.settings.relationships.romance = enabled;
        return this.settings.relationships.romance;
    }

    toggleJealousy(enabled) {
        this.settings.relationships.jealousy = enabled;
        return this.settings.relationships.jealousy;
    }

    getSetting(category, key) {
        return this.settings[category]?.[key] || null;
    }

    setSetting(category, key, value) {
        if (this.settings[category]) {
            this.settings[category][key] = value;
        }
    }

    toJSON() {
        return JSON.parse(JSON.stringify(this.settings));
    }

    fromJSON(data) {
        if (data) {
            this.settings = JSON.parse(JSON.stringify(data));
        }
    }
}