/**
 * EconomySystem - Handles scoring, rewards, and progression
 */

import { RANKS } from '../data/ranks.js';

export class EconomySystem {
    constructor(gameState) {
        this.gameState = gameState;
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

        // Boss modifier (some bosses are stricter)
        const bossModifier = task.boss.strictness || 1.0;

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
        const acceptable = task.template?.acceptableChartTypes || [];

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
        let score = 70; // Base score

        // Legend helps readability
        if (chartConfig.showLegend) {
            score += 10;
        }

        // Grid helps precision reading
        if (chartConfig.showGrid) {
            score += 5;
        }

        // Data labels can help (but can also clutter)
        if (chartConfig.showDataLabels) {
            score += 3;
        }

        // Having a title is important
        if (chartConfig.title && chartConfig.title.trim().length > 0) {
            score += 10;
        }

        // Add some randomness
        score += Math.random() * 5 - 2.5;

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Score data accuracy (mostly simulated)
     */
    scoreDataAccuracy(task, chartConfig) {
        // In a full implementation, this would check:
        // - Correct data columns mapped
        // - No data missing/truncated
        // - Proper axis scales

        // For now, we'll give a good base score with variance
        const baseScore = 80;
        const variance = Math.random() * 20 - 5;

        return Math.min(100, Math.max(60, baseScore + variance));
    }

    /**
     * Convert raw score (0-100) to stars (1-5)
     */
    scoreToStars(rawScore) {
        if (rawScore >= 90) return 5;
        if (rawScore >= 75) return 4;
        if (rawScore >= 55) return 3;
        if (rawScore >= 35) return 2;
        return 1;
    }

    /**
     * Calculate money reward
     */
    calculateMoneyReward(task, stars) {
        const baseReward = task.potentialReward;

        // Star multiplier
        const starMultipliers = {
            1: 0.2,
            2: 0.4,
            3: 0.7,
            4: 1.0,
            5: 1.3
        };

        const multiplier = starMultipliers[stars] || 1.0;

        // Time bonus (if completed quickly)
        // const elapsed = (Date.now() - task.startTime) / 1000;
        // const timeBonus = elapsed < task.timeLimit / 2 ? 1.2 : 1.0;

        return Math.round(baseReward * multiplier);
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

        return repRewards[stars] || 10;
    }

    /**
     * Check if player should be promoted
     */
    checkPromotion() {
        const nextRank = this.gameState.nextRank;

        if (!nextRank) return false; // Already max rank

        if (this.gameState.reputation >= nextRank.repRequired) {
            this.gameState.rankIndex++;

            // Notify player
            this.showPromotionNotification(this.gameState.currentRank);

            return true;
        }

        return false;
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

        // Check for discount perks
        if (this.gameState.unlockedTools?.includes('bargain_hunter')) {
            price = Math.round(price * 0.9); // 10% discount
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
        const foodBase = this.gameState.currentLocation === 'apartment' ? 15 : 25;
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

        const vehicle = this.gameState.worldMap?.currentVehicle || 'walking';

        if (vehicle === 'walking') {
            return 0; // Free
        } else if (vehicle === 'bus_pass') {
            return 2; // $2/day for bus pass
        } else if (vehicle === 'used_car' || vehicle === 'car') {
            return 5 + Math.floor(Math.random() * 10); // Gas, maintenance: $5-15/day
        }

        return 0;
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
