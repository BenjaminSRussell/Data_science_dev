/**
 * News & Events System - Random events, news ticker, market updates
 * Creates dynamic world that changes over time
 */

// News categories
export const NEWS_CATEGORIES = {
    market: { icon: '', color: '#6bcb77' },
    tech: { icon: '', color: '#4ecdc4' },
    business: { icon: '', color: '#ffd93d' },
    economy: { icon: '', color: '#ff8548' },
    local: { icon: '', color: '#a855f7' },
    personal: { icon: '', color: '#ff6b9d' }
};

// News templates
export const NEWS_TEMPLATES = [
    // Market news
    {
        category: 'market',
        template: '{company} stock {direction} {percent}% after {reason}',
        variables: {
            company: ['TechCorp', 'DataDynamics', 'AnalytiX', 'CloudFirst', 'NeuralNet Inc'],
            direction: ['surges', 'plummets', 'rises', 'drops'],
            percent: ['5', '8', '12', '15', '20'],
            reason: ['earnings report', 'new product launch', 'CEO resignation', 'acquisition rumors', 'AI breakthrough']
        },
        effects: { stockVolatility: 0.2 }
    },
    {
        category: 'market',
        template: 'Market {sentiment} as investors react to {event}',
        variables: {
            sentiment: ['rallies', 'tumbles', 'holds steady', 'shows volatility'],
            event: ['Fed rate decision', 'jobs report', 'inflation data', 'geopolitical tensions', 'tech earnings']
        },
        effects: { marketTrend: 'variable' }
    },

    // Tech news
    {
        category: 'tech',
        template: 'New {technology} tool promises to revolutionize {field}',
        variables: {
            technology: ['AI-powered', 'cloud-based', 'open-source', 'blockchain'],
            field: ['data analysis', 'visualization', 'machine learning', 'business intelligence']
        },
        effects: { trendingSkill: true }
    },
    {
        category: 'tech',
        template: '{company} releases {product} - analysts predict major industry shift',
        variables: {
            company: ['Microsoft', 'Google', 'Amazon', 'Salesforce'],
            product: ['new analytics platform', 'AI assistant', 'data lake solution', 'visualization suite']
        },
        effects: { marketOpportunity: true }
    },

    // Business news
    {
        category: 'business',
        template: 'Data science hiring {trend} by {percent}% this quarter',
        variables: {
            trend: ['surges', 'increases', 'grows'],
            percent: ['15', '20', '25', '30']
        },
        effects: { jobMarket: 'boom' }
    },
    {
        category: 'business',
        template: '{company} announces {layoffs} layoffs affecting analytics division',
        variables: {
            company: ['Major tech firm', 'Fortune 500 company', 'Leading startup'],
            layoffs: ['500', '1,000', '2,000']
        },
        effects: { jobMarket: 'bust', talentAvailable: true }
    },

    // Economy news
    {
        category: 'economy',
        template: 'Interest rates {direction} to {rate}% - {impact}',
        variables: {
            direction: ['rise', 'hold steady', 'drop'],
            rate: ['4.5', '5.0', '5.25', '5.5'],
            impact: ['borrowing costs increase', 'savers benefit', 'housing market cools']
        },
        effects: { loanRates: 'variable', savingsRates: 'variable' }
    },
    {
        category: 'economy',
        template: 'Venture capital funding {trend} in {sector} sector',
        variables: {
            trend: ['surges', 'dries up', 'stabilizes'],
            sector: ['AI/ML', 'data analytics', 'fintech', 'healthtech']
        },
        effects: { vcFunding: 'variable' }
    },

    // Local news
    {
        category: 'local',
        template: 'New {venue} opening in {area} - networking opportunity!',
        variables: {
            venue: ['co-working space', 'tech hub', 'coffee shop', 'innovation center'],
            area: ['downtown', 'tech district', 'business park']
        },
        effects: { newLocation: true }
    },
    {
        category: 'local',
        template: 'Data Science meetup this {day} at {location}',
        variables: {
            day: ['Thursday', 'Friday', 'Saturday'],
            location: ['The Data Lounge', 'Innovation Hub', 'University']
        },
        effects: { networkingEvent: true }
    }
];

// Random events that can happen to the player
export const RANDOM_EVENTS = [
    // Positive events
    {
        id: 'referral_bonus',
        type: 'positive',
        title: ' Referral Bonus!',
        description: 'A satisfied client referred you to a colleague. +$500 bonus!',
        probability: 0.05,
        requirements: { completedJobs: 5 },
        effects: { money: 500, reputation: 10 }
    },
    {
        id: 'viral_chart',
        type: 'positive',
        title: ' Your Chart Went Viral!',
        description: 'One of your visualizations got shared widely on LinkedIn!',
        probability: 0.03,
        requirements: { analytics: 30 },
        effects: { reputation: 50, followers: 100 }
    },
    {
        id: 'mentor_gift',
        type: 'positive',
        title: ' Mentor\'s Gift',
        description: 'A mentor gave you their old professional reference books.',
        probability: 0.04,
        requirements: { hasMetMentor: true },
        effects: { xp: { intelligence: 50 } }
    },
    {
        id: 'lucky_investment',
        type: 'positive',
        title: ' Lucky Break!',
        description: 'That risky investment paid off! Your portfolio is up.',
        probability: 0.02,
        requirements: { hasInvestments: true },
        effects: { portfolioBoost: 0.1 }
    },
    {
        id: 'award_nomination',
        type: 'positive',
        title: ' Award Nomination!',
        description: 'You\'ve been nominated for an industry award!',
        probability: 0.02,
        requirements: { reputation: 500 },
        effects: { reputation: 100, charismaXP: 20 }
    },

    // Neutral events
    {
        id: 'coffee_meeting',
        type: 'neutral',
        title: ' Chance Encounter',
        description: 'You bumped into someone interesting at the coffee shop.',
        probability: 0.08,
        requirements: {},
        effects: { meetNPC: true }
    },
    {
        id: 'industry_insight',
        type: 'neutral',
        title: ' Industry Insight',
        description: 'You read an interesting article about emerging trends.',
        probability: 0.10,
        requirements: {},
        effects: { xp: { analytics: 10 } }
    },
    {
        id: 'networking_lead',
        type: 'neutral',
        title: ' Networking Lead',
        description: 'Someone at a meetup mentioned they might need help.',
        probability: 0.06,
        requirements: {},
        effects: { potentialClient: true }
    },

    // Negative events
    {
        id: 'car_trouble',
        type: 'negative',
        title: ' Car Trouble',
        description: 'Your car needs repairs. -$200',
        probability: 0.04,
        requirements: { hasCar: true },
        effects: { money: -200, timeLost: 1 }
    },
    {
        id: 'sick_day',
        type: 'negative',
        title: ' Under the Weather',
        description: 'You\'re not feeling well. Energy reduced today.',
        probability: 0.05,
        requirements: {},
        effects: { energyPenalty: 30 }
    },
    {
        id: 'difficult_client',
        type: 'negative',
        title: ' Difficult Client',
        description: 'A client is being unreasonable with demands.',
        probability: 0.06,
        requirements: { hasActiveJobs: true },
        effects: { stressIncrease: 10, focusPenalty: 5 }
    },
    {
        id: 'market_crash',
        type: 'negative',
        title: ' Market Dip',
        description: 'Your investments took a hit today.',
        probability: 0.03,
        requirements: { hasInvestments: true },
        effects: { portfolioLoss: 0.08 }
    },
    {
        id: 'competitor_steal',
        type: 'negative',
        title: ' Lost a Client',
        description: 'A competitor poached one of your potential clients.',
        probability: 0.04,
        requirements: { reputation: 100 },
        effects: { reputation: -20, pendingJobLost: true }
    }
];

/**
 * NewsManager class - handles news ticker and random events
 */
export class NewsManager {
    constructor(gameState) {
        this.gameState = gameState;

        // News history
        this.newsHistory = [];
        this.maxHistory = 50;

        // Events history
        this.eventHistory = [];

        // Current effects in play
        this.activeEffects = {};

        // News update frequency
        this.newsPerDay = 3;
    }

    /**
     * Add a news item to the history (e.g. from world events).
     * Accepts a partial item and fills in defaults.
     */
    addNews(newsItem) {
        if (!newsItem) return;

        const item = {
            id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            category: 'general',
            text: '',
            timestamp: this.gameState.timeManager?.getDateString() || 'Today',
            effects: null,
            read: false,
            ...newsItem
        };

        this.newsHistory.unshift(item);

        // Respect the history cap
        if (this.newsHistory.length > this.maxHistory) {
            this.newsHistory.length = this.maxHistory;
        }

        return item;
    }

    /**
     * Generate news for the day
     */
    /**
     * Generate daily newspaper
     */
    generateDailyNews() {
        this.dailyPaper = {
            date: this.gameState.timeManager?.getDateString() || '',
            headline: null,
            articles: [],
            weather: 'Clear', // To be linked with EnvironmentManager
            horoscope: 'Stars align for data analysis today.'
        };

        // Generate 1 Main Headline
        const headline = this.generateNewsItem();
        this.dailyPaper.headline = headline;
        this.newsHistory.unshift(headline); //Keep history for now/legacy support

        // Generate 2-3 smaller articles
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            const article = this.generateNewsItem();
            this.dailyPaper.articles.push(article);
            this.newsHistory.unshift(article);
        }

        return this.dailyPaper;
    }

    /**
     * Get the current daily paper
     */
    getDailyPaper() {
        return this.dailyPaper;
    }

    /**
     * Generate a single news item
     */
    generateNewsItem() {
        const template = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];

        // Fill in the template
        let text = template.template;
        for (const [key, options] of Object.entries(template.variables)) {
            const value = options[Math.floor(Math.random() * options.length)];
            text = text.replace(`{${key}}`, value);
        }

        const newsItem = {
            id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            category: template.category,
            text,
            timestamp: this.gameState.timeManager?.getDateString() || 'Today',
            effects: template.effects,
            read: false
        };

        // Apply any immediate effects
        this.applyNewsEffects(newsItem);

        return newsItem;
    }

    /**
     * Apply effects from news
     */
    applyNewsEffects(newsItem) {
        if (newsItem.effects.stockVolatility) {
            this.activeEffects.stockVolatility = (this.activeEffects.stockVolatility || 0) +
                newsItem.effects.stockVolatility;
        }

        if (newsItem.effects.networkingEvent) {
            this.activeEffects.networkingEventActive = true;
        }
    }

    /**
     * Check for random events
     */
    checkRandomEvents() {
        const triggeredEvents = [];

        for (const event of RANDOM_EVENTS) {
            // Check probability
            if (Math.random() > event.probability) continue;

            // Check requirements
            if (!this.checkEventRequirements(event)) continue;

            // Event triggers!
            triggeredEvents.push(event);
            this.eventHistory.push({
                ...event,
                triggeredAt: this.gameState.timeManager?.getDateString() || 'Today'
            });
        }

        return triggeredEvents;
    }

    /**
     * Check if event requirements are met
     */
    checkEventRequirements(event) {
        const req = event.requirements;

        if (req.completedJobs && (this.gameState.completedJobs || 0) < req.completedJobs) {
            return false;
        }

        if (req.analytics && this.gameState.characterStats?.getStat('analytics') < req.analytics) {
            return false;
        }

        if (req.reputation && (this.gameState.reputation || 0) < req.reputation) {
            return false;
        }

        if (req.hasCar && this.gameState.worldMap?.currentVehicle === 'walking') {
            return false;
        }

        if (req.hasInvestments && !this.gameState.hasInvestments) {
            return false;
        }

        if (req.hasActiveJobs && (this.gameState.activeJobs?.length || 0) === 0) {
            return false;
        }

        if (req.hasMetMentor && !this.gameState.npcManager?.metNPCs.some(id =>
            ['professor_chen', 'sarah_martinez'].includes(id)
        )) {
            return false;
        }

        return true;
    }

    /**
     * Apply event effects
     */
    applyEventEffects(event) {
        const effects = event.effects;
        const results = {};

        if (effects.money) {
            this.gameState.money = (this.gameState.money || 0) + effects.money;
            results.money = effects.money;
        }

        if (effects.reputation) {
            this.gameState.reputation = (this.gameState.reputation || 0) + effects.reputation;
            results.reputation = effects.reputation;
        }

        if (effects.xp) {
            for (const [stat, amount] of Object.entries(effects.xp)) {
                this.gameState.characterStats?.addExperience(stat, amount);
            }
            results.xp = effects.xp;
        }

        if (effects.energyPenalty && this.gameState.timeManager) {
            if (this.gameState?.timeManager) {
                this.gameState.timeManager.energy = (this.gameState.timeManager.energy || 0) - (effects.energyPenalty || 0);
            }
            results.energyLost = effects.energyPenalty;
        }

        return results;
    }

    /**
     * Get recent news
     */
    getRecentNews(count = 5) {
        return this.newsHistory.slice(0, count);
    }

    /**
     * Get unread news count
     */
    getUnreadCount() {
        return this.newsHistory.filter(n => !n.read).length;
    }

    /**
     * Mark news as read
     */
    markAsRead(newsId) {
        const news = this.newsHistory.find(n => n.id === newsId);
        if (news) news.read = true;
    }

    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            newsHistory: this.newsHistory,
            eventHistory: this.eventHistory,
            activeEffects: this.activeEffects
        };
    }

    /**
     * Load from saved data
     */
    fromJSON(data) {
        if (!data) return;
        this.newsHistory = data.newsHistory || [];
        this.eventHistory = data.eventHistory || [];
        this.activeEffects = data.activeEffects || {};
    }
}
