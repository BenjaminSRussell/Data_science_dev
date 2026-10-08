/**
 * WorldEventManager.js
 * Background world events (market crashes, booms, ...) that run for a number
 * of days. processDay() is called once per in-game day from main.js (#918).
 */

// How many ended events to keep in the history (#1340)
export const MAX_EVENT_HISTORY = 50;

export class WorldEventManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.events = [];          // history: { id, day, ended? }
        this.activeModifiers = []; // { id, type, value, expiry } for running events (#1335)

        // Define possible world events
        this.eventPool = {
            market_crash: {
                id: 'market_crash',
                name: 'Market Crash',
                chance: 0.001, // Low daily chance
                duration: 7, // Days
                effect: (game) => {
                    game.stockMarket?.triggerCrash?.();
                    game.newsManager?.addNews?.({ text: "MARKET PLUMMETS! Panic selling everywhere.", category: 'market', sentiment: 'negative' });
                }
            },
            tech_boom: {
                id: 'tech_boom',
                name: 'Tech Boom',
                chance: 0.005, // 0.5% daily
                duration: 14,
                effect: (game) => {
                    game.stockMarket?.triggerBoom?.();

                    // Transform Library to Innovation Hub
                    game.worldMap?.updateLocation?.('library', {
                        name: "Innovation Hub",
                        icon: "",
                        description: "Co-working space for tech founders.",
                        background: 'linear-gradient(180deg, #2196F3 0%, #0D47A1 100%)'
                    });

                    game.newsManager?.addNews?.({ text: "Tech stocks soar! Library rebrands as Innovation Hub.", category: 'tech', sentiment: 'positive' });
                },
                // Undo the re-skin when the boom is over (#1334)
                onEnd: (game) => {
                    game.worldMap?.resetLocation?.('library');
                }
            },
            // More background events (#1338)
            trade_war: {
                id: 'trade_war',
                name: 'Trade War',
                chance: 0.002,
                duration: 10,
                effect: (game) => {
                    game.newsManager?.addNews?.({ text: "Tariff fight escalates - overseas markets slide.", category: 'economy', sentiment: 'negative' });
                }
            },
            innovation_breakthrough: {
                id: 'innovation_breakthrough',
                name: 'Innovation Breakthrough',
                chance: 0.003,
                duration: 5,
                effect: (game) => {
                    game.newsManager?.addNews?.({ text: "Lab unveils breakthrough chip - tech and hardware rally.", category: 'tech', sentiment: 'positive' });
                }
            },
            hiring_freeze: {
                id: 'hiring_freeze',
                name: 'Hiring Freeze',
                chance: 0.003,
                duration: 7,
                effect: (game) => {
                    game.newsManager?.addNews?.({ text: "Big firms freeze hiring - freelancers feel the squeeze.", category: 'business', sentiment: 'negative' });
                }
            }
        };
    }

    /** Is this event running right now? */
    isActive(eventId) {
        return this.activeModifiers.some(m => m.id === eventId);
    }

    /**
     * Running events, in the shape StockMarket.update() expects for its
     * worldEvents argument ({ type, active }) (#2367, #1105)
     */
    getActiveEvents() {
        return this.activeModifiers.map(m => ({
            id: m.id,
            type: m.type,
            name: this.eventPool[m.id]?.name || m.id,
            expiry: m.expiry,
            active: true
        }));
    }

    /**
     * Daily check for events
     * @returns {{started: Array, ended: Array}}
     */
    processDay() {
        const today = this.gameState?.timeManager?.totalDays || 0;
        const ended = [];
        const started = [];

        // End events whose duration has elapsed (#1335)
        this.activeModifiers = this.activeModifiers.filter(mod => {
            if (today < mod.expiry) return true;
            const def = this.eventPool[mod.id];
            try { def?.onEnd?.(this.gameState); } catch (e) { console.warn('World event onEnd failed:', e); }
            const record = [...this.events].reverse().find(r => r.id === mod.id && !r.ended);
            if (record) record.ended = true;
            ended.push(mod.id);
            return false;
        });

        // Roll for new events; an event that's already running can't stack (#159)
        Object.values(this.eventPool).forEach(event => {
            if (this.isActive(event.id)) return;
            if (event.condition && !event.condition(this.gameState)) return;

            if (Math.random() < event.chance) {
                if (this.triggerEvent(event)) started.push(event.id);
            }
        });

        return { started, ended };
    }

    triggerEvent(event) {
        if (typeof event === 'string') event = this.eventPool[event];
        if (!event || this.isActive(event.id)) return false;

        try {
            event.effect(this.gameState);
        } catch (e) {
            console.warn('World event effect failed:', e);
        }
        const day = this.gameState?.timeManager?.totalDays || 0;
        this.events.push({ id: event.id, day });
        this.activeModifiers.push({ id: event.id, type: event.id, value: 1, expiry: day + (event.duration || 1) });

        // Keep the history bounded, but never drop a running event (#1340)
        if (this.events.length > MAX_EVENT_HISTORY) {
            const running = this.events.filter(r => !r.ended);
            const finished = this.events.filter(r => r.ended).slice(-(MAX_EVENT_HISTORY - running.length));
            this.events = [...finished, ...running].sort((a, b) => a.day - b.day);
        }
        return true;
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
        this.events = Array.isArray(data.events) ? data.events.slice(-MAX_EVENT_HISTORY) : [];
        this.activeModifiers = Array.isArray(data.activeModifiers)
            ? data.activeModifiers.filter(m => m && this.eventPool[m.id] && Number.isFinite(m.expiry))
            : [];
    }
}
