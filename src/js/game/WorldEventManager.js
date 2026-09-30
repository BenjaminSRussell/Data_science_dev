/**
 * WorldEventManager.js
 * Handles background simulation events, hidden interactions, and world state changes.
 */
export class WorldEventManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.events = [];
        this.activeModifiers = []; // { id, type, value, expiry }

        // Define possible world events
        this.eventPool = {
            market_crash: {
                id: 'market_crash',
                name: 'Market Crash',
                chance: 0.001, // Low daily chance
                duration: 7, // Days
                effect: (game) => {
                    game.stockMarket.triggerCrash();
                    game.newsManager.addNews({ text: "MARKET PLUMMETS! Panic selling everywhere.", category: 'finance', sentiment: 'negative' });
                }
            },
            tech_boom: {
                id: 'tech_boom',
                name: 'Tech Boom',
                chance: 0.005, // 0.5% daily
                duration: 14,
                effect: (game) => {
                    if (game.stockMarket) game.stockMarket.triggerBoom();

                    // Transform Library to Innovation Hub
                    game.worldMap.updateLocation('library', {
                        name: "Innovation Hub",
                        icon: "",
                        description: "Co-working space for tech founders.",
                        background: 'linear-gradient(180deg, #2196F3 0%, #0D47A1 100%)'
                    });

                    game.newsManager.addNews({ text: "Tech stocks soar! Library rebrands as Innovation Hub.", category: 'tech', sentiment: 'positive' });
                }
            },

        };
    }

    /**
     * Daily check for events
     */
    processDay() {
        // Remove expired modifiers
        const currentDay = this.gameState?.timeManager?.totalDays || 0;
        this.activeModifiers = this.activeModifiers.filter(modifier => {
            return modifier.expiry > currentDay;
        });

        // Roll for new events
        Object.values(this.eventPool).forEach(event => {
            if (event.condition && !event.condition(this.gameState)) return;

            if (Math.random() < event.chance) {
                this.triggerEvent(event);
            }
        });
    }

    triggerEvent(event) {
        // Guard: don't trigger if this event is already active
        if (this.activeModifiers.some(modifier => modifier.id === event.id)) {
            return;
        }

        event.effect(this.gameState);
        const days = this.gameState?.timeManager?.totalDays || 0;

        // Record event and track with expiry
        this.events.push({ id: event.id, day: days });
        this.activeModifiers.push({
            id: event.id,
            type: 'event',
            value: event,
            duration: event.duration || 1,
            expiry: days + (event.duration || 1)
        });
    }

    // Serialization
    toJSON() {
        return {
            events: this.events,
            activeModifiers: this.activeModifiers
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.events = data.events || [];
        this.activeModifiers = data.activeModifiers || [];
    }
}
