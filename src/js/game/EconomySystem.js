/**
 * EconomySystem - Handles scoring, rewards, and progression
 */

import { VEHICLES } from './WorldMap.js';
import { RANKS } from '../data/ranks.js';

/**
 * Shop-perk "Data Insight": the hint shown next to the task requirements.
 * Returns null when the perk isn't owned or the task has no optimal type.
 */
export function insightHint(gameState, task) {
    if (!(gameState?.unlockedPerks || []).includes('insight')) return null;
    const best = task?.optimalChartTypes?.[0];
    return best ? `Hint: try a ${best} chart` : null;
}

export class EconomySystem {
    // Shop perk tuning (src/js/data/shopItems.js descriptions)
    static PERK_TIME_BONUS_SECONDS = 30;   // perk_time_bonus
    static PERK_BOSS_FAVOR = 0.9;          // perk_boss_favor: strictness x0.9
    static PERK_MONEY_MULTIPLIER = 1.15;   // perk_bonus_multiplier
    // Pay per star rating, applied to task.potentialReward
    static STAR_MULTIPLIERS = { 1: 0.2, 2: 0.4, 3: 0.7, 4: 1.0, 5: 1.3 };

    /**
     * What a task pays, shown before starting it. potentialReward is the
     * 4-star pay; 5 stars pay more, so say so instead of showing one number
     * that understates the top payout (#965)
     */
    static rewardRangeText(potentialReward) {
        const base = Math.round(Number(potentialReward) || 0);
        const top = Math.round(base * EconomySystem.STAR_MULTIPLIERS[5]);
        return `$${base.toLocaleString()} (up to $${top.toLocaleString()} for 5 stars)`;
    }
    static PERK_REP_MULTIPLIER = 1.2;      // perk_rep_boost
    static PERK_DISCOUNT = 0.9;            // perk_bargain_hunter

    constructor(gameState) {
        this.gameState = gameState;
    }

    // Rank perks listed in data/ranks.js (#954)
    static RANK_TIME_BONUS_SECONDS = 15;   // "Time bonus increased"
    static RANK_BOSS_TOLERANCE = 0.95;     // "Boss tolerance increased": strictness x0.95
    static RANK_PREMIUM_CLIENTS = 1.1;     // "Premium clients": +10% task pay

    /** True when the player's rank (or an earlier one) grants this perk (#954) */
    hasRankPerk(perkName) {
        const idx = Number(this.gameState?.rankIndex) || 0;
        return RANKS.slice(0, idx + 1).some(r => (r.perks || []).includes(perkName));
    }

    /** True when a shop perk has been bought (#244, #2010) */
    hasPerk(perkId) {
        return (this.gameState?.unlockedPerks || []).includes(perkId);
    }

    /**
     * Seconds the player has for a task: base time limit, +30s with the Time
     * Extension perk, stretched by software speed bonuses (AutoML, Cloud)
     * (#1310, #2011). 0 means the task is untimed.
     */
    getEffectiveTimeLimit(task) {
        const base = Number(task?.timeLimit) || 0;
        if (base <= 0) return 0;
        let limit = base;
        if (this.hasPerk('time_bonus')) limit += EconomySystem.PERK_TIME_BONUS_SECONDS;
        if (this.hasRankPerk('Time bonus increased')) limit += EconomySystem.RANK_TIME_BONUS_SECONDS;
        const speed = Number(this.gameState?.getSoftwareQualityMultiplier?.()?.speedBonus) || 0;
        return Math.round(limit * (1 + Math.max(0, speed)));
    }

    /**
     * Evaluate a submitted chart and calculate score
     */
    evaluateChart(task, chartConfig) {
        // Score components (0-100 each)
        let chartAppropriateness = this.scoreChartAppropriateness(task, chartConfig);
        let visualClarity = this.scoreVisualClarity(chartConfig);
        let dataAccuracy = this.scoreDataAccuracy(task, chartConfig);

        // Apply software quality multipliers
        const softwareMultipliers = this.gameState.getSoftwareQualityMultiplier();
        chartAppropriateness = Math.min(100, chartAppropriateness * softwareMultipliers.chartAppropriateness);
        visualClarity = Math.min(100, visualClarity * softwareMultipliers.visualClarity);
        dataAccuracy = Math.min(100, dataAccuracy * softwareMultipliers.dataAccuracy);

        // Boss modifier: higher strictness means a HARSHER grade (#1990). bosses.js
        // gives the perfectionist 1.3 and the easygoing boss 0.8, so invert it
        // gently around 1.0: 1.3 -> 0.85, 0.8 -> 1.10.
        let strictness = Number(task?.boss?.strictness) > 0 ? Number(task.boss.strictness) : 1.0;
        // "Office Coffee": bosses are 10% more lenient (#244)
        if (this.hasPerk('boss_favor')) strictness *= EconomySystem.PERK_BOSS_FAVOR;
        if (this.hasRankPerk('Boss tolerance increased')) strictness *= EconomySystem.RANK_BOSS_TOLERANCE;
        const bossModifier = 1 - (strictness - 1) * 0.5;

        // Calculate weighted average
        const rawScore = (
            chartAppropriateness * 0.4 +
            visualClarity * 0.3 +
            dataAccuracy * 0.3
        ) * bossModifier;

        // Convert to stars (1-5)
        const stars = this.scoreToStars(rawScore);

        // Calculate rewards
        const moneyEarned = this.calculateMoneyReward(task, stars);
        const repEarned = this.calculateRepReward(stars);

        // Track stats
        this.gameState.totalRatings++;
        this.gameState.ratingSum += stars;
        if (stars === 5) {
            this.gameState.perfectScores++;
        }

        return {
            chartAppropriateness,
            visualClarity,
            dataAccuracy,
            rawScore,
            stars,
            moneyEarned,
            repEarned,
            softwareMultipliers // Include for display
        };
    }

    /**
     * Score how appropriate the chart type is for the data
     */
    scoreChartAppropriateness(task, chartConfig) {
        const selected = chartConfig.type;
        const optimal = task.optimalChartTypes || [];
        // The task's own list (which TaskSystem defaults) first, like optimal (#1313)
        const acceptable = task.acceptableChartTypes || task.template?.acceptableChartTypes || [];

        // Perfect match
        if (optimal.includes(selected)) {
            return 90 + Math.random() * 10; // 90-100
        }

        // Acceptable choice
        if (acceptable.includes(selected)) {
            return 60 + Math.random() * 20; // 60-80
        }

        // Chart type appropriateness matrix
        const appropriateness = this.getChartAppropriatenessMatrix();
        const dataType = task.template?.dataType || 'default';
        const score = appropriateness[dataType]?.[selected] || 40;

        return score + (Math.random() * 10 - 5); // Add some variance
    }

    /**
     * Get chart appropriateness matrix
     */
    getChartAppropriatenessMatrix() {
        return {
            'quarterly_sales': {
                bar: 95, line: 85, pie: 40, scatter: 30, doughnut: 45, radar: 35
            },
            'monthly_revenue': {
                bar: 75, line: 95, pie: 30, scatter: 50, doughnut: 35, radar: 40
            },
            'product_comparison': {
                bar: 95, line: 50, pie: 60, scatter: 45, doughnut: 55, radar: 70
            },
            'category_breakdown': {
                bar: 60, line: 30, pie: 95, scatter: 25, doughnut: 90, radar: 40
            },
            'trend_analysis': {
                bar: 50, line: 95, pie: 20, scatter: 70, doughnut: 25, radar: 30
            },
            'customer_demographics': {
                bar: 85, line: 40, pie: 90, scatter: 35, doughnut: 85, radar: 50
            },
            'performance_metrics': {
                bar: 70, line: 45, pie: 40, scatter: 35, doughnut: 45, radar: 95
            },
            'default': {
                bar: 70, line: 70, pie: 60, scatter: 50, doughnut: 55, radar: 50
            }
        };
    }

    /**
     * Score visual clarity of the chart
     */
    scoreVisualClarity(chartConfig) {
        // Base 55 so a bare chart (no legend/grid/labels/title) scores
        // meaningfully lower; a fully dressed chart still reaches ~95 (#957).
        let score = 55; // Base score

        // Legend helps readability
        if (chartConfig.showLegend) {
            score += 12;
        }

        // Grid helps precision reading
        if (chartConfig.showGrid) {
            score += 8;
        }

        // Data labels can help (but can also clutter)
        if (chartConfig.showDataLabels) {
            score += 5;
        }

        // Having a title is important
        if (chartConfig.title && chartConfig.title.trim().length > 0) {
            score += 15;
        }

        // Add some randomness
        score += Math.random() * 5 - 2.5;

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Score data accuracy (mostly simulated)
     */
    scoreDataAccuracy(task, chartConfig) {
        // Reward real chart wiring when present; small jitter only as tie-break (#25).
        let score = 70;
        const cfg = chartConfig || {};
        const req = task?.requirements || task?.requiredFields || {};
        if (cfg.type || cfg.chartType) score += 8;
        if (cfg.xField || cfg.xAxis || cfg.x) score += 6;
        if (cfg.yField || cfg.yAxis || cfg.y) score += 6;
        if (Array.isArray(cfg.datasets) && cfg.datasets.length) score += 5;
        if (Array.isArray(cfg.data) && cfg.data.length) score += 5;
        // Soft match against task hints when provided
        const wantType = req.chartType || req.type;
        if (wantType && (cfg.type === wantType || cfg.chartType === wantType)) score += 10;
        const wantX = req.xField || req.x;
        if (wantX && (cfg.xField === wantX || cfg.x === wantX)) score += 5;
        const wantY = req.yField || req.y;
        if (wantY && (cfg.yField === wantY || cfg.y === wantY)) score += 5;
        score += Math.random() * 4 - 2;
        return Math.min(100, Math.max(40, Math.round(score)));
    }

    /**
     * Convert raw score (0-100) to stars (1-5)
     */
    scoreToStars(rawScore) {
        if (rawScore >= 90) return 5;
        if (rawScore >= 75) return 4;
        if (rawScore >= 55) return 3;
        if (rawScore >= 40) return 2;
        return 1;
    }

    /**
     * Calculate money reward
     */
    calculateMoneyReward(task, stars) {
        const baseReward = task.potentialReward;

        // Star multiplier
        const multiplier = EconomySystem.STAR_MULTIPLIERS[stars] || 1.0;

        // Time bonus (if completed quickly)
        let timeBonus = 1.0;
        const timeLimit = this.getEffectiveTimeLimit(task);
        if (timeLimit && task.startTime) {
            const elapsed = (Date.now() - task.startTime) / 1000;
            // 1.2x multiplier if completed in half the time limit or less.
            // "Maximum bonuses" (top rank): any on-time finish earns it (#954)
            const window = this.hasRankPerk('Maximum bonuses') ? timeLimit : timeLimit / 2;
            timeBonus = elapsed < window ? 1.2 : 1.0;
        }

        // "Negotiation Skills": +15% money from tasks
        const perkBonus = this.hasPerk('bonus_multiplier') ? EconomySystem.PERK_MONEY_MULTIPLIER : 1.0;
        // "Premium clients" rank perk: better-paying work (#954)
        const premium = this.hasRankPerk('Premium clients') ? EconomySystem.RANK_PREMIUM_CLIENTS : 1.0;

        return Math.round((Number(baseReward) || 0) * multiplier * timeBonus * perkBonus * premium);
    }

    /**
     * Calculate reputation reward
     */
    calculateRepReward(stars) {
        const repRewards = {
            1: 2,
            2: 5,
            3: 10,
            4: 18,
            5: 30
        };

        const base = repRewards[stars] || 10;
        // "Networking": +20% reputation from tasks
        return this.hasPerk('rep_boost') ? Math.round(base * EconomySystem.PERK_REP_MULTIPLIER) : base;
    }

    /**
     * Check if player should be promoted
     */
    checkPromotion() {
        // Climb every rank the reputation already covers, not just one per
        // call (#1312). Called after tasks and once a day, so reputation from
        // contracts, events, etc. promotes too (#856).
        let promoted = false;
        let nextRank = this.gameState.nextRank;
        while (nextRank && this.gameState.reputation >= nextRank.repRequired) {
            this.gameState.rankIndex++;
            promoted = true;
            nextRank = this.gameState.nextRank;
        }

        if (promoted) this.showPromotionNotification(this.gameState.currentRank);
        return promoted;
    }

    /**
     * Show promotion notification
     */
    showPromotionNotification(newRank) {
        // This will be handled by the main game class through toast/modal


        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('promotion', {
            detail: { rank: newRank }
        }));
    }

    /**
     * Get item price (can be modified by perks)
     */
    getItemPrice(item) {
        let price = item.price;

        // "Coupon Clipper" perk: 10% off everything else in the shop (#1988, #1309)
        if (item.id !== 'perk_bargain_hunter' && this.hasPerk('bargain_hunter')) {
            price = Math.round(price * EconomySystem.PERK_DISCOUNT);
        }

        return price;
    }

    /**
     * Calculate salary bonus for current rank
     */
    getSalaryMultiplier() {
        return this.gameState.currentRank?.salaryMultiplier || 1;
    }

    /**
     * Calculate tax on income (progressive brackets)
     * @param {number} income - Weekly income to tax
     * @returns {number} Tax amount
     */
    calculateTax(income) {
        if (income <= 0) return 0;

        let tax = 0;

        // Progressive tax brackets (based on weekly income)
        // $0-$10k/year = $0-$192/week: 0%
        // $10k-$50k/year = $192-$962/week: 10%
        // $50k-$100k/year = $962-$1,923/week: 20%
        // $100k+/year = $1,923+/week: 30%

        if (income > 1923) {
            // Top bracket: $100k+/year
            tax += (income - 1923) * 0.30;
            income = 1923;
        }
        if (income > 962) {
            // $50k-$100k bracket: 20%
            tax += (income - 962) * 0.20;
            income = 962;
        }
        if (income > 192) {
            // $10k-$50k bracket: 10%
            tax += (income - 192) * 0.10;
            income = 192;
        }
        // First $192/week ($0-$10k/year) is tax-free

        return Math.floor(tax);
    }

    /**
     * Get daily living expenses (enhanced with variable costs)
     */
    getDailyExpenses() {
        let dailyCost = 0;

        // Food expenses: $15-50/day based on lifestyle/location
        const foodBase = this.gameState.currentLocation === 'home' ? 15 : 25;
        const foodCost = foodBase + Math.floor(Math.random() * (foodBase * 2));
        dailyCost += foodCost;

        // Utilities: $5-15/day (electricity, water, internet)
        const utilities = 5 + Math.floor(Math.random() * 10);
        dailyCost += utilities;

        // Transportation: Based on vehicle owned
        // Walking is free, bus pass is $2/day, car has gas/maintenance
        const transportation = this.getTransportationCost();
        dailyCost += transportation;

        return Math.floor(dailyCost);
    }

    /**
     * Get daily transportation cost based on current vehicle
     */
    getTransportationCost() {
        if (!this.gameState.worldMap) return 0;

        const vehicleId = this.gameState.worldMap?.currentVehicle || 'walking';
        if (vehicleId === 'walking') return 0; // Free

        // Price every vehicle from its catalog upkeep instead of a hard-coded
        // id list that missed sedan/sports_car/luxury_car (#1700)
        const vehicle = VEHICLES.find(v => v.id === vehicleId);
        if (!vehicle) return 0;
        const dailyUpkeep = (vehicle.monthlyUpkeep || 0) / 30;
        if (vehicle.isMonthly) {
            return Math.max(1, Math.round(dailyUpkeep)); // transit pass, no fuel
        }
        // Cars: upkeep plus fuel that scales with speed
        const fuel = vehicle.travelSpeed * (1 + Math.floor(Math.random() * 3));
        return Math.round(dailyUpkeep + fuel);
    }

    /**
     * Process daily finances (expenses)
     */
    processDailyFinances() {
        const expenses = this.getDailyExpenses();
        this.gameState.money -= expenses;
        return { expenses };
    }
}
