/**
 * EventSystem.js
 * Manages parties, events, holidays, and stock market crashes
 */

import { pickState, applyState } from '../../utils/StateSerializer.js';

export class EventSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.upcomingEvents = [];
        this.activeEvents = [];
        this.eventHistory = [];
        this.todayEffects = null; // { day, ...merged effects } (#1704, #2414)
        this.initializeEvents();
    }

    static DAYS_PER_YEAR = 360; // 12 x 30-day months

    /** Absolute game day (TimeManager.totalDays numbering) for a year/month/day */
    static absoluteDay(year, month, day) {
        return (Math.max(1, Number(year) || 1) - 1) * EventSystem.DAYS_PER_YEAR
            + (Number(month) || 0) * 30 + (Number(day) || 1);
    }
    
    /**
     * Initialize recurring events
     */
    initializeEvents() {
        // Schedule holidays
        this.scheduleHolidays();
        
        // Schedule parties
        this.scheduleParties();
        
        // Schedule stock market events
        this.scheduleStockEvents();
    }
    
    /**
     * Schedule holidays
     */
    scheduleHolidays() {
        const holidays = [
            { id: 'new_years', name: 'New Year', month: 0, day: 1, type: 'holiday' },
            { id: 'valentines', name: "Valentine's Day", month: 1, day: 14, type: 'holiday' },
            { id: 'easter', name: 'Easter', month: 3, day: 15, type: 'holiday', variable: true },
            { id: 'independence', name: 'Independence Day', month: 6, day: 4, type: 'holiday' },
            // The game calendar has 30-day months, so Oct 31 is celebrated on the last day of October (#1459, #1707)
            { id: 'halloween', name: 'Halloween', month: 9, day: 30, type: 'holiday' },
            { id: 'thanksgiving', name: 'Thanksgiving', month: 10, day: 23, type: 'holiday', variable: true },
            { id: 'christmas', name: 'Christmas', month: 11, day: 25, type: 'holiday' }
        ];
        
        // No year pinned: holidays recur every year (#2412, #922)
        holidays.forEach(holiday => {
            this.upcomingEvents.push({
                ...holiday,
                scheduled: true
            });
        });
    }
    
    /**
     * Schedule parties
     */
    scheduleParties() {
        // Office parties (monthly)
        for (let month = 0; month < 12; month++) {
            this.upcomingEvents.push({
                id: `office_party_${month}`,
                name: 'Office Party',
                month: month,
                day: 15,
                type: 'party',
                location: 'office',
                description: 'Monthly office social event'
            });
        }
        
        // Networking events (bi-weekly)
        for (let week = 0; week < 52; week += 2) {
            this.upcomingEvents.push({
                id: `networking_${week}`,
                name: 'Networking Event',
                ...EventSystem.dayOfYearToDate(week * 7),
                type: 'party',
                location: 'coffee_shop',
                description: 'Professional networking opportunity'
            });
        }
    }
    
    /**
     * Schedule stock market events
     */
    scheduleStockEvents() {
        // Random stock market crashes (rare)
        for (let i = 0; i < 5; i++) {
            const randomDay = Math.floor(Math.random() * 365);
            this.upcomingEvents.push({
                id: `crash_${i}`,
                name: 'Stock Market Crash',
                ...EventSystem.dayOfYearToDate(randomDay),
                type: 'crash',
                severity: Math.random() * 50 + 20, // 20-70% drop
                description: 'Major market downturn'
            });
        }
        
        // Bull markets (positive events)
        for (let i = 0; i < 3; i++) {
            const randomDay = Math.floor(Math.random() * 365);
            this.upcomingEvents.push({
                id: `bull_${i}`,
                name: 'Bull Market',
                ...EventSystem.dayOfYearToDate(randomDay),
                type: 'bull',
                boost: Math.random() * 30 + 10, // 10-40% gain
                description: 'Strong market performance'
            });
        }
    }
    
    /**
     * Convert a 0-based day-of-year offset into the game's { month, day }
     * calendar (12 months x 30 days). Events must carry both, because
     * checkTodayEvents() compares against TimeManager's day-of-month (#2413).
     * @param {number} dayOfYear
     * @returns {{month: number, day: number}}
     */
    static dayOfYearToDate(dayOfYear) {
        const DAYS_PER_MONTH = 30;
        const d = Math.max(0, Math.floor(Number(dayOfYear) || 0)) % (DAYS_PER_MONTH * 12);
        return { month: Math.floor(d / DAYS_PER_MONTH), day: (d % DAYS_PER_MONTH) + 1 };
    }

    /**
     * Check for events today
     */
    checkTodayEvents() {
        if (!this.gameState.timeManager) return [];
        
        const today = {
            day: this.gameState.timeManager?.day || 1,
            month: this.gameState.timeManager?.month || 0,
            year: this.gameState.timeManager?.year || 1
        };
        
        const todayEvents = this.upcomingEvents.filter(event => {
            if (event.year && event.year !== today.year) return false;
            if (event.month !== undefined && event.month !== today.month) return false;
            if (event.day !== undefined && event.day !== today.day) return false;
            return true;
        });
        
        return todayEvents;
    }
    
    /**
     * Trigger event
     */
    triggerEvent(eventId) {
        const event = this.upcomingEvents.find(e => e.id === eventId);
        if (!event) return null;

        // Don't trigger the same event twice on one day, and let old ones
        // age out so activeEvents can't grow forever (#159)
        const today = this.gameState?.timeManager?.totalDays ?? 0;
        if (this.activeEvents.some(e => e.id === eventId && e.triggeredDay === today)) return null;
        this.activeEvents = this.activeEvents.filter(e =>
            typeof e.triggeredDay === 'number' && today - e.triggeredDay < 7);
        this.activeEvents.push({ ...event, triggeredDay: today });
        
        // Handle event based on type
        let result;
        switch (event.type) {
            case 'holiday':
                result = this.handleHoliday(event);
                break;
            case 'party':
                result = this.handleParty(event);
                break;
            case 'crash':
                result = this.handleStockCrash(event);
                break;
            case 'bull':
                result = this.handleBullMarket(event);
                break;
            default:
                result = { message: `Event: ${event.name}` };
        }
        if (result) {
            result.eventId = event.id;
            this.recordEffects(today, result.effects);
        }
        return result;
    }

    /**
     * Keep today's effects so the rest of the game can honour them instead of
     * dropping them on the floor (#1704, #2414)
     */
    recordEffects(day, effects) {
        if (!effects) return;
        if (!this.todayEffects || this.todayEffects.day !== day) this.todayEffects = { day };
        for (const [k, v] of Object.entries(effects)) {
            if (k === 'npcAvailability') {
                const prev = this.todayEffects.npcAvailability;
                this.todayEffects.npcAvailability = prev === undefined ? v : Math.min(prev, v);
            } else {
                this.todayEffects[k] = v;
            }
        }
    }

    /** Effects of events triggered today ({} on a quiet day) */
    getActiveEffects() {
        const today = this.gameState?.timeManager?.totalDays ?? 0;
        if (!this.todayEffects || this.todayEffects.day !== today) return {};
        const { day, ...effects } = this.todayEffects;
        return effects;
    }

    /** Holiday shop closures (#1704) */
    isShopClosed() {
        return this.getActiveEffects().shopsClosed === true;
    }

    /**
     * Whether an NPC is around today. With npcAvailability 0.5 about half the
     * cast is out; the pick is stable for the whole day (#1704)
     */
    isNPCAvailable(npcId) {
        const share = this.getActiveEffects().npcAvailability;
        if (share === undefined || share >= 1) return true;
        if (share <= 0) return false;
        const today = this.gameState?.timeManager?.totalDays ?? 0;
        const key = `${npcId}:${today}`;
        let h = 0;
        for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        return (h % 100) < share * 100;
    }

    /**
     * Attend or skip a party (the actions handleParty offers) (#2414).
     * Attending costs energy and warms up everyone at the venue.
     */
    resolvePartyAction(eventId, actionId) {
        const event = this.upcomingEvents.find(e => e.id === eventId);
        if (!event || event.type !== 'party') return null;
        const today = this.gameState?.timeManager?.totalDays ?? 0;
        const active = this.activeEvents.find(e => e.id === eventId && e.triggeredDay === today);
        if (!active || active.resolved) return null;
        active.resolved = actionId;
        this.eventHistory.push({ id: eventId, action: actionId, day: today });
        if (this.eventHistory.length > 100) this.eventHistory.splice(0, this.eventHistory.length - 100);

        if (actionId !== 'attend') {
            return { action: 'skip', message: `You skipped the ${event.name} and kept your energy.` };
        }
        const { energyCost = 20, relationshipBonus = 5 } = this.handleParty(event).effects;
        const tm = this.gameState?.timeManager;
        if (tm?.hasEnergy && !tm.hasEnergy(energyCost)) {
            active.resolved = null;
            this.eventHistory.pop();
            return { action: 'attend', success: false, message: 'Too tired to go out tonight.' };
        }
        tm?.useEnergy?.(energyCost);
        const boosted = this.gameState?.npcManager?.boostNearbyRelationships?.(relationshipBonus, event.location) || 0;
        return {
            action: 'attend', success: true, energyCost, relationshipBonus, boosted,
            message: boosted
                ? `Great ${event.name}! +${relationshipBonus} with ${boosted} ${boosted === 1 ? 'person' : 'people'}.`
                : `You enjoyed the ${event.name}.`
        };
    }
    
    /**
     * Handle holiday
     */
    handleHoliday(event) {
        // Holidays affect NPC availability, shops closed, etc.
        return {
            type: 'holiday',
            name: event.name,
            message: `Today is ${event.name}! Many places are closed.`,
            effects: {
                shopsClosed: true,
                npcAvailability: 0.5, // 50% of NPCs available
                mood: 'festive'
            }
        };
    }
    
    /**
     * Handle party
     */
    handleParty(event) {
        // Parties are social opportunities
        return {
            type: 'party',
            name: event.name,
            message: `${event.name} is happening at ${event.location}!`,
            effects: {
                socialOpportunities: 3,
                relationshipBonus: 5,
                energyCost: 20
            },
            actions: [
                { id: 'attend', text: 'Attend Party', reward: 'relationships' },
                { id: 'skip', text: 'Skip Party', reward: 'energy' }
            ]
        };
    }
    
    /**
     * Handle stock market crash
     */
    handleStockCrash(event) {
        if (!this.gameState.stockMarket) return null;
        
        const crashAmount = event.severity || 30;
        this.gameState.stockMarket?.crash(crashAmount);
        
        return {
            type: 'crash',
            name: event.name,
            message: `Stock market crashes! Prices drop ${crashAmount.toFixed(1)}%`,
            effects: {
                stockDrop: crashAmount,
                investorPanic: true,
                buyingOpportunity: true
            }
        };
    }
    
    /**
     * Handle bull market
     */
    handleBullMarket(event) {
        if (!this.gameState.stockMarket) return null;
        
        const boostAmount = event.boost || 20;
        this.gameState.stockMarket?.boost(boostAmount);
        
        return {
            type: 'bull',
            name: event.name,
            message: `Bull market! Prices rise ${boostAmount.toFixed(1)}%`,
            effects: {
                stockRise: boostAmount,
                investorConfidence: true,
                sellingOpportunity: true
            }
        };
    }
    
    /**
     * Get upcoming events (next 7 days)
     */
    getUpcomingEvents(days = 7, { types = null } = {}) {
        if (!this.gameState.timeManager) return [];
        
        const currentDay = this.gameState.timeManager?.totalDays || 1;
        const futureDay = currentDay + days;
        
        // Compare absolute days, so this keeps working after Year 1 (#1710)
        return this.upcomingEvents
            .filter(event => !types || types.includes(event.type))
            .map(event => ({ event, day: this.getEventDay(event, currentDay) }))
            .filter(({ day }) => day !== null && day >= currentDay && day <= futureDay)
            .sort((a, b) => a.day - b.day)
            .map(({ event, day }) => ({ ...event, occursOnDay: day, inDays: day - currentDay }));
    }
    
    /**
     * Next absolute day (TimeManager.totalDays numbering) the event happens
     * on or after `fromDay`. Events pinned to a year occur once; the rest
     * recur annually. Returns null for a pinned event that already passed.
     */
    getEventDay(event, fromDay = this.gameState?.timeManager?.totalDays || 1) {
        if (event.year) {
            const d = EventSystem.absoluteDay(event.year, event.month, event.day);
            return d >= fromDay ? d : null;
        }
        const year = Math.floor((Math.max(1, fromDay) - 1) / EventSystem.DAYS_PER_YEAR) + 1;
        const thisYear = EventSystem.absoluteDay(year, event.month, event.day);
        return thisYear >= fromDay ? thisYear : EventSystem.absoluteDay(year + 1, event.month, event.day);
    }

    /**
     * Serialize the event calendar so a reload doesn't re-roll or re-apply
     * the same day's events (#1711)
     */
    toJSON() {
        return pickState(this, ['upcomingEvents', 'activeEvents', 'eventHistory', 'todayEffects']);
    }

    /**
     * Restore the event calendar from a save
     */
    fromJSON(data) {
        if (!data) return;
        applyState(this, data, ['upcomingEvents', 'activeEvents', 'eventHistory', 'todayEffects']);
        // Older saves pinned holidays to Year 1; let them recur (#2412)
        if (Array.isArray(this.upcomingEvents)) {
            this.upcomingEvents = this.upcomingEvents.map(e =>
                e && e.type === 'holiday' && e.year ? (({ year, ...rest }) => rest)(e) : e);
        }
    }
}
