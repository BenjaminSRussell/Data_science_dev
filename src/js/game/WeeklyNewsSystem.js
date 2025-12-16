/**
 * WeeklyNewsSystem.js
 * Generates weekly newspapers with evolving world storylines
 * Each week has a main story arc that progresses
 */

export class WeeklyNewsSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.weekNumber = 0;
        this.storylineProgress = {
            techRevolution: 0,
            marketCrash: 0,
            corporateScandal: 0,
            startupBoom: 0,
            aiRegulation: 0
        };
        this.weeklyHeadlines = [];
    }

    /**
     * Generate weekly newspaper
     */
    generateWeeklyNews() {
        this.weekNumber = Math.floor((this.gameState.timeManager?.totalDays || 0) / 7) + 1;
        
        const paper = {
            week: this.weekNumber,
            date: this.gameState.timeManager?.getDateString() || 'Week 1',
            headline: this.generateHeadline(),
            mainStory: this.generateMainStory(),
            articles: this.generateArticles(),
            worldChanges: this.generateWorldChanges(),
            marketUpdate: this.generateMarketUpdate(),
            localNews: this.generateLocalNews()
        };

        this.weeklyHeadlines.push(paper);
        this.updateStorylineProgress();
        
        return paper;
    }

    /**
     * Generate main headline based on week and storyline
     */
    generateHeadline() {
        const week = this.weekNumber;
        
        // Week 1-4: Introduction phase
        if (week <= 4) {
            const headlines = [
                "Tech Industry Sees Record Hiring",
                "New Data Science Bootcamp Opens Downtown",
                "Local Startup Raises $5M Series A",
                "University Launches AI Research Center"
            ];
            return headlines[week - 1] || headlines[0];
        }
        
        // Week 5-8: Growth phase
        if (week <= 8) {
            const headlines = [
                "Major Tech Company Announces Expansion",
                "Data Privacy Regulations Take Effect",
                "AI Tools Become Standard in Business",
                "Freelance Market Grows 30% This Quarter"
            ];
            return headlines[(week - 5) % 4];
        }
        
        // Week 9-12: Conflict phase
        if (week <= 12) {
            const headlines = [
                "Market Volatility Hits Tech Stocks",
                "Corporate Layoffs Sweep Industry",
                "New Regulations Challenge Data Practices",
                "Competition Intensifies in Analytics Market"
            ];
            return headlines[(week - 9) % 4];
        }
        
        // Week 13+: Advanced phase
        const advancedHeadlines = [
            "AI Revolution Transforms Data Industry",
            "Major Acquisition Shakes Up Market",
            "New Technology Disrupts Traditional Methods",
            "Industry Leaders Face Regulatory Scrutiny"
        ];
        return advancedHeadlines[(week - 13) % 4];
    }

    /**
     * Generate main story with evolving narrative
     */
    generateMainStory() {
        const week = this.weekNumber;
        const ethics = this.gameState.characterStats?.getStat('ethics') || 0;
        
        // Story changes based on player's ethical choices
        if (ethics < -20) {
            return this.generateCriminalStory(week);
        } else if (ethics > 20) {
            return this.generateEthicalStory(week);
        } else {
            return this.generateNeutralStory(week);
        }
    }

    generateCriminalStory(week) {
        const stories = [
            "Underground data markets see increased activity as regulations tighten...",
            "Whistleblower reports emerge about data manipulation schemes...",
            "Authorities investigate suspicious trading patterns...",
            "Dark web data brokers face increased scrutiny..."
        ];
        return stories[(week - 1) % stories.length];
    }

    generateEthicalStory(week) {
        const stories = [
            "Ethical data practices gain recognition in the industry...",
            "Transparency initiatives show positive results...",
            "Community celebrates responsible data science leaders...",
            "New standards promote ethical AI development..."
        ];
        return stories[(week - 1) % stories.length];
    }

    generateNeutralStory(week) {
        const stories = [
            "The data science industry continues to evolve rapidly...",
            "New tools and technologies reshape the landscape...",
            "Professionals adapt to changing market demands...",
            "Innovation drives growth across all sectors..."
        ];
        return stories[(week - 1) % stories.length];
    }

    /**
     * Generate supporting articles
     */
    generateArticles() {
        const articles = [];
        const count = 3 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < count; i++) {
            articles.push({
                title: this.generateArticleTitle(),
                content: this.generateArticleContent(),
                category: ['tech', 'business', 'local', 'economy'][Math.floor(Math.random() * 4)]
            });
        }
        
        return articles;
    }

    generateArticleTitle() {
        const titles = [
            "Local Tech Meetup Draws Record Crowd",
            "New Coffee Shop Opens Near Tech Hub",
            "City Council Considers Tech Tax",
            "University Expands Data Science Program",
            "Freelancers Form New Association",
            "Startup Incubator Announces Cohort",
            "Tech Company Relocates Headquarters",
            "Data Science Conference Coming to Town"
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }

    generateArticleContent() {
        return "Industry experts discuss the latest trends and developments in data science...";
    }

    /**
     * Generate world changes that affect gameplay
     */
    generateWorldChanges() {
        const changes = [];
        const week = this.weekNumber;
        
        // Every 4 weeks, something significant happens
        if (week % 4 === 0) {
            changes.push({
                type: 'new_location',
                location: this.generateNewLocation(week)
            });
        }
        
        // Market changes
        if (week % 2 === 0) {
            changes.push({
                type: 'market_shift',
                effect: Math.random() > 0.5 ? 'boom' : 'bust',
                magnitude: 0.1 + Math.random() * 0.2
            });
        }
        
        return changes;
    }

    generateNewLocation(week) {
        const locations = [
            { id: 'innovation_hub', name: 'Innovation Hub', type: 'work' },
            { id: 'data_lounge', name: 'Data Lounge', type: 'social' },
            { id: 'tech_park', name: 'Tech Park', type: 'work' },
            { id: 'startup_incubator', name: 'Startup Incubator', type: 'work' }
        ];
        return locations[(week / 4 - 1) % locations.length];
    }

    /**
     * Generate market update
     */
    generateMarketUpdate() {
        return {
            trend: Math.random() > 0.5 ? 'up' : 'down',
            volatility: 0.1 + Math.random() * 0.3,
            topPerformer: 'TechCorp',
            worstPerformer: 'DataDynamics'
        };
    }

    /**
     * Generate local news
     */
    generateLocalNews() {
        return [
            "New networking event scheduled for this weekend",
            "Local businesses report increased demand for data services",
            "City announces new tech-friendly policies"
        ];
    }

    /**
     * Update storyline progress
     */
    updateStorylineProgress() {
        const week = this.weekNumber;
        
        // Progress different storylines based on week
        if (week % 3 === 0) {
            this.storylineProgress.techRevolution += 1;
        }
        if (week % 5 === 0) {
            this.storylineProgress.marketCrash += 1;
        }
        if (week % 7 === 0) {
            this.storylineProgress.corporateScandal += 1;
        }
    }

    /**
     * Get current storyline state
     */
    getStorylineState() {
        return {
            week: this.weekNumber,
            progress: { ...this.storylineProgress }
        };
    }

    toJSON() {
        return {
            weekNumber: this.weekNumber,
            storylineProgress: this.storylineProgress,
            weeklyHeadlines: this.weeklyHeadlines.slice(-10) // Keep last 10 weeks
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.weekNumber = data.weekNumber || 0;
        this.storylineProgress = data.storylineProgress || {};
        this.weeklyHeadlines = data.weeklyHeadlines || [];
    }
}




