import { NEWS_TEMPLATES } from './newsTemplates';
import { RANDOM_EVENTS } from './randomEvents';

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
            ['professor_higgins', 'sarah_martinez'].includes(id)
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