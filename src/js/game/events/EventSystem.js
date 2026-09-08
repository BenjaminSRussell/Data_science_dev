/**
 * EventSystem.js
 * Manages parties, events, holidays, and stock market crashes
 */

export class EventSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.upcomingEvents = [];
        this.activeEvents = [];
        this.eventHistory = [];
        this.initializeEvents();
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
            { id: 'halloween', name: 'Halloween', month: 9, day: 31, type: 'holiday' },
            { id: 'thanksgiving', name: 'Thanksgiving', month: 10, day: 23, type: 'holiday', variable: true },
            { id: 'christmas', name: 'Christmas', month: 11, day: 25, type: 'holiday' }
        ];
        
        holidays.forEach(holiday => {
            this.upcomingEvents.push({
                ...holiday,
                scheduled: true,
                year: this.gameState.timeManager?.year || 1
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
                day: week * 7,
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
                day: randomDay,
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
                day: randomDay,
                type: 'bull',
                boost: Math.random() * 30 + 10, // 10-40% gain
                description: 'Strong market performance'
            });
        }
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
        
        // Already active — don't re-trigger
        if (this.activeEvents.some(e => e.id === eventId)) return null;
        
        this.activeEvents.push(event);
        
        // Handle event based on type
        switch (event.type) {
            case 'holiday':
                return this.handleHoliday(event);
            case 'party':
                return this.handleParty(event);
            case 'crash':
                return this.handleStockCrash(event);
            case 'bull':
                return this.handleBullMarket(event);
            default:
                return { message: `Event: ${event.name}` };
        }
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
    getUpcomingEvents(days = 7) {
        if (!this.gameState.timeManager) return [];
        
        const currentDay = this.gameState.timeManager?.totalDays || 1;
        const futureDay = currentDay + days;
        
        return this.upcomingEvents.filter(event => {
            const eventDay = this.getEventDay(event);
            return eventDay >= currentDay && eventDay <= futureDay;
        });
    }
    
    /**
     * Get event day number
     */
    getEventDay(event) {
        // Calculate day number from month/day
        const daysPerMonth = 30;
        return (event.month || 0) * daysPerMonth + (event.day || 1);
    }
}

