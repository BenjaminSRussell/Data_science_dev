class WeeklyNewsSystem {
    constructor(storylineManager) {
        this.storylineManager = storylineManager;
        this.headlines = [
            "Local Hero Saves Cat!",
            "New Cafe Opens in Town!",
            "Town Hall Meeting Discusses Future Plans",
            "Annual Festival Celebrates Local Heritage"
        ];
        this.advancedHeadlines = [
            "Tech Innovation Changes the Game!",
            "Market Shift Affects Local Businesses",
            "Corporate Scandal Rocks the Community",
            "Environmental Initiative Gains Momentum"
        ];
        this.stories = [
            "This week, the town hall meeting focused on future plans for the community.",
            "The new cafe, 'Brew & Bites', opened this week and is already a hit.",
            "A local hero saved a cat stuck in a tree, inspiring the town.",
            "The annual festival celebrated local heritage and traditions."
        ];
        this.criminalStories = [
            "A local citizen reported a suspicious activity.",
            "A local business faced a sudden market downturn."
        ];
        this.recentDecisions = new Map();
        this.techRevolution = 0;
        this.marketCrash = 0;
        this.corporateScandal = 0;
    }

    generateHeadline(week) {
        if (week >= 1 && week <= 4) {
            return this.headlines[week - 1];
        } else if (week >= 5 && week <= 8) {
            return this.headlines[(week - 5) % 4];
        } else if (week >= 9 && week <= 12) {
            return this.headlines[(week - 9) % 4];
        } else {
            return this.advancedHeadlines[(week - 13) % 4];
        }
    }

    generateMainStory(week, characterStats) {
        const ethics = characterStats?.ethics || 0;
        if (ethics < -20) {
            return "The town is facing increasing criminal activity, affecting local residents.";
        } else if (ethics > 20) {
            return "The town is thriving under ethical leadership, with community initiatives flourishing.";
        } else {
            return this.stories[(week - 1) % this.stories.length];
        }
    }

    generateCriminalStory(week, recentDecisions) {
        const decision = recentDecisions.get('criminal_opportunity');
        if (decision && decision.choice === 'accept') {
            return "The local business successfully seized the criminal opportunity, boosting profits.";
        } else {
            return this.stories[(week - 1) % this.stories.length];
        }
    }

    generateWorldChanges(weekNumber) {
        const changes = [];
        if (weekNumber % 4 === 0) {
            changes.push("new_location");
        }
        if (weekNumber % 2 === 0) {
            changes.push("market_shift");
        }
        return changes;
    }

    updateStorylineProgress(week) {
        if (week % 3 === 0) {
            this.techRevolution++;
        }
        if (week % 5 === 0) {
            this.marketCrash++;
        }
        if (week % 7 === 0) {
            this.corporateScandal++;
        }
    }

    getRecentDecisions(storylineManager) {
        if (!storylineManager || !storylineManager.majorDecisions) {
            return [];
        }
        const currentWeek = storylineManager.currentWeek;
        return storylineManager.majorDecisions.filter(decision => currentWeek - decision.week <= 2);
    }
}