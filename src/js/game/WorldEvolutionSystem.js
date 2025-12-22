/**
 * WorldEvolutionSystem.js
 * World changes: businesses closing, new ones opening, economic shifts
 */

export class WorldEvolutionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.worldState = {
            week: 0,
            businesses: [],
            economicClimate: 'stable', // stable, boom, recession, depression
            unemploymentRate: 5.0,
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

        // Business health changes
        this.businesses.forEach(business => {
            const change = this.updateBusinessHealth(business);
            if (change) changes.push(change);
        });

        // Random events
        const event = this.generateRandomEvent();
        if (event) changes.push(event);

        // Update unemployment based on business health
        this.updateUnemploymentRate();

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
            const layoffs = Math.floor(business.employees * 0.1);
            business.employees -= layoffs;
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
     * Update unemployment rate
     */
    updateUnemploymentRate() {
        const totalEmployees = this.businesses.reduce((sum, b) => sum + (b.closed ? 0 : b.employees), 0);
        const closedEmployees = this.businesses.filter(b => b.closed).reduce((sum, b) => sum + b.employees, 0);
        
        // Simplified unemployment calculation
        const baseRate = 5.0;
        const unemploymentFromClosures = (closedEmployees / 1000) * 10; // Rough estimate
        this.worldState.unemploymentRate = Math.min(20, baseRate + unemploymentFromClosures);
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
        return locationMap[businessId] || 'downtown';
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
}







