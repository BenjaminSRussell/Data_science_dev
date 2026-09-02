class EconomySystem {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Score data accuracy (mostly simulated)
     */
    scoreDataAccuracy(task, chartConfig) {
        let score = 0;

        // Check chart type
        const optimalChart = task.optimalChart || 'bar';
        const acceptableCharts = task.acceptableCharts || [optimalChart];
        if (acceptableCharts.includes(chartConfig.chartType)) {
            score += 20;
        }

        // Check data columns mapped
        if (task.dataColumns && task.dataColumns.length > 0) {
            const correctColumns = task.dataColumns.every(column => chartConfig.columns.includes(column));
            if (correctColumns) {
                score += 20;
            }
        }

        // Check axis/label choices
        if (task.axisLabels) {
            const correctLabels = task.axisLabels.every(label => chartConfig.labels.includes(label));
            if (correctLabels) {
                score += 10;
            }
        }

        // Check for any additional constraints
        if (task.constraints) {
            task.constraints.forEach(constraint => {
                if (constraint.type === 'valueRange') {
                    const values = chartConfig.data.map(d => d[constraint.column]);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    if (min >= constraint.min && max <= constraint.max) {
                        score += 5;
                    }
                }
                // Add more constraint types as needed
            });
        }

        // Add some randomness
        score += Math.random() * 5 - 2.5;

        return Math.min(100, Math.max(0, score));
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