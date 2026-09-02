class GameplaySettings {
    constructor() {
        this.settings = {
            relationships: { enabled: true },
            notifications: { enabled: true },
            company: { autoAccept: true },
            market: { autoBid: false }
        };
    }

    toJSON() {
        return JSON.stringify(this.settings);
    }

    fromJSON(json) {
        try {
            const newSettings = JSON.parse(json);
            if (newSettings && typeof newSettings === 'object') {
                this.settings = { ...this.settings, ...newSettings };
            } else {
                console.error('Failed to load settings:', json);
            }
        } catch (e) {
            console.error('Failed to load settings:', e.message);
        }
    }
}