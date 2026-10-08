/**
 * WorldEvolutionSystem.js
 * World changes: businesses closing, new ones opening, economic shifts
 */

/** Cap on the persistent world-event log */
const MAX_EVENTS = 50;

/** Names for businesses that open during play (#1085) */
const NEW_BUSINESS_NAMES = ['Quantum Insights', 'ByteBrew Labs', 'Pixel & Pivot', 'Neural Nest', 'Signal Forge', 'Tensor Table'];
const NEW_BUSINESS_LOCATIONS = ['tech_hub', 'downtown'];

export class WorldEvolutionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.worldState = {
            week: 0,
            businesses: [],
            economicClimate: 'stable', // stable, boom, recession, depression
            unemploymentRate: 5.0,
            laidOff: 0,
            events: []
        };
        this.businesses = this.initializeBusinesses();
    }

    /**
     * Initialize businesses in the world
     */
    initializeBusinesses() {
        return [
            { id: 'techcorp', name: 'TechCorp', type: 'tech', health: 100, employees: 500 },
            { id: 'datadynamics', name: 'DataDynamics', type: 'analytics', health: 80, employees: 200 },
            { id: 'local_coffee', name: 'Corner Coffee', type: 'retail', health: 60, employees: 5 },
            { id: 'startup_alpha', name: 'Startup Alpha', type: 'startup', health: 40, employees: 15 },
            { id: 'consulting_firm', name: 'McKinsey Analytics', type: 'consulting', health: 90, employees: 300 }
        ];
    }

    /**
     * Process weekly world changes
     */
    processWeeklyChanges() {
        this.worldState.week++;
        const changes = [];

        // Economic climate changes
        this.updateEconomicClimate();

        // Business health changes (closed businesses stay closed) (#1083)
        this.businesses.forEach(business => {
            if (business.closed) return;
            const change = this.updateBusinessHealth(business);
            if (change) changes.push(change);
        });

        // Random events
        const event = this.generateRandomEvent();
        if (event) {
            if (event.type === 'new_business') {
                const business = this.openNewBusiness();
                changes.push({ ...event, business: business.name, message: `${business.name} opened in ${business.location.replace('_', ' ')}. Job opportunities available!` });
            } else {
                changes.push(event);
            }
        }

        // Update unemployment based on business health
        this.updateUnemploymentRate();

        // Persistent log of what happened (#1085)
        for (const change of changes) {
            this.worldState.events.push({ week: this.worldState.week, type: change.type, message: change.message });
        }
        if (this.worldState.events.length > MAX_EVENTS) {
            this.worldState.events.splice(0, this.worldState.events.length - MAX_EVENTS);
        }

        return {
            week: this.worldState.week,
            changes,
            economicClimate: this.worldState.economicClimate,
            unemploymentRate: this.worldState.unemploymentRate
        };
    }

    /**
     * Update economic climate
     */
    updateEconomicClimate() {
        const week = this.worldState.week;
        const random = Math.random();

        // Economic cycles
        if (week % 20 === 0 && random > 0.7) {
            // Recession hits
            this.worldState.economicClimate = 'recession';
        } else if (week % 15 === 0 && random > 0.6) {
            // Economic boom
            this.worldState.economicClimate = 'boom';
        } else if (week % 10 === 0) {
            // Return to stability
            this.worldState.economicClimate = 'stable';
        }
    }

    /**
     * Update business health
     */
    updateBusinessHealth(business) {
        const climate = this.worldState.economicClimate;
        let healthChange = 0;

        // Economic impact
        if (climate === 'recession') {
            healthChange -= 5 + Math.random() * 5;
        } else if (climate === 'boom') {
            healthChange += 3 + Math.random() * 3;
        } else {
            healthChange += (Math.random() - 0.5) * 2; // Small random variation
        }

        // Business type vulnerability
        if (business.type === 'startup' && climate === 'recession') {
            healthChange -= 10; // Startups are vulnerable
        }
        if (business.type === 'retail' && climate === 'recession') {
            healthChange -= 8; // Retail suffers
        }

        business.health = Math.max(0, Math.min(100, business.health + healthChange));

        // Check for business closure
        if (business.health <= 0 && !business.closed) {
            business.closed = true;
            business.closedWeek = this.worldState.week;
            return {
                type: 'business_closed',
                business: business.name,
                message: `${business.name} has closed its doors. ${business.employees} people lost their jobs.`,
                impact: {
                    unemployment: business.employees,
                    locationAffected: this.getBusinessLocation(business.id)
                }
            };
        }

        // Check for layoffs
        if (business.health < 30 && business.health > 0 && Math.random() > 0.7) {
            // At least 1 when any staff exist — floor(0.1*N) was 0 for N<10 (#2632)
            const layoffs = business.employees > 0
                ? Math.max(1, Math.floor(business.employees * 0.1))
                : 0;
            if (layoffs === 0) return null;
            business.employees -= layoffs;
            this.worldState.laidOff = (this.worldState.laidOff || 0) + layoffs;
            return {
                type: 'layoffs',
                business: business.name,
                message: `${business.name} announced layoffs. ${layoffs} employees lost their jobs.`,
                impact: {
                    unemployment: layoffs
                }
            };
        }

        return null;
    }

    /**
     * Generate random world event
     */
    generateRandomEvent() {
        const events = [
            {
                type: 'new_business',
                message: 'A new tech startup opened downtown. Job opportunities available!',
                impact: { jobs: 10 }
            },
            {
                type: 'industry_award',
                message: 'Local data scientist wins prestigious industry award. Inspiration for all!',
                impact: { morale: 10 }
            },
            {
                type: 'scandal',
                message: 'Major corporation involved in data privacy scandal. Public trust erodes.',
                impact: { reputation: -5 }
            },
            {
                type: 'innovation',
                message: 'Breakthrough in AI technology announced. New opportunities emerge.',
                impact: { techAdvancement: true }
            }
        ];

        if (Math.random() > 0.7) {
            return events[Math.floor(Math.random() * events.length)];
        }

        return null;
    }

    /**
     * Open a new business (from a 'new_business' event) so the roster can grow
     */
    openNewBusiness() {
        const opened = this.businesses.filter(b => b.spawned).length;
        const name = NEW_BUSINESS_NAMES[opened % NEW_BUSINESS_NAMES.length] + (opened >= NEW_BUSINESS_NAMES.length ? ` ${Math.floor(opened / NEW_BUSINESS_NAMES.length) + 1}` : '');
        const business = {
            id: `new_business_${this.worldState.week}_${opened + 1}`,
            name,
            type: 'startup',
            health: 50,
            employees: 10,
            location: NEW_BUSINESS_LOCATIONS[opened % NEW_BUSINESS_LOCATIONS.length],
            openedWeek: this.worldState.week,
            spawned: true
        };
        this.businesses.push(business);
        return business;
    }

    /**
     * Update unemployment rate. Counts staff lost to closures and to layoffs
     * at businesses that stayed open (#1084); new businesses rehire some.
     */
    updateUnemploymentRate() {
        const closedEmployees = this.businesses.filter(b => b.closed).reduce((sum, b) => sum + b.employees, 0);
        const newJobs = this.businesses.filter(b => b.spawned && !b.closed).reduce((sum, b) => sum + b.employees, 0);
        const jobless = Math.max(0, closedEmployees + (this.worldState.laidOff || 0) - newJobs);

        // Simplified unemployment calculation
        const baseRate = 5.0;
        const unemployment = (jobless / 1000) * 10; // Rough estimate
        this.worldState.unemploymentRate = Math.min(20, baseRate + unemployment);
    }

    /**
     * Get business location (for map updates)
     */
    getBusinessLocation(businessId) {
        const locationMap = {
            'techcorp': 'downtown',
            'datadynamics': 'tech_hub',
            'local_coffee': 'coffee_shop',
            'startup_alpha': 'tech_hub',
            'consulting_firm': 'downtown'
        };
        const spawned = this.businesses.find(b => b.id === businessId)?.location;
        return locationMap[businessId] || spawned || 'downtown';
    }

    /**
     * Get current world state
     */
    getWorldState() {
        return {
            ...this.worldState,
            businesses: this.businesses.map(b => ({
                id: b.id,
                name: b.name,
                health: b.health,
                closed: b.closed || false
            }))
        };
    }

    /**
     * Save the world simulation so it doesn't reset on load
     */
    toJSON() {
        return {
            worldState: { ...this.worldState, events: [...this.worldState.events] },
            businesses: this.businesses.map(b => ({ ...b }))
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return;
        if (data.worldState && typeof data.worldState === 'object') {
            this.worldState = {
                ...this.worldState,
                ...data.worldState,
                events: Array.isArray(data.worldState.events) ? data.worldState.events : []
            };
        }
        if (Array.isArray(data.businesses) && data.businesses.length > 0) {
            this.businesses = data.businesses;
        }
    }
}








