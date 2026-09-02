class EconomySystem {
    // ... (existing code)

    /**
     * Score the quality of the chart
     */
    scoreChart(task, chartConfig) {
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

        // Apply boss favor perk adjustment
        if (this.gameState.purchasedItems.includes('perk_boss_favor')) {
            // Reduce strictness by 10% (e.g., if strictness was 1.2, it becomes 1.08)
            const strictnessAdjustment = 0.90;
            score *= strictnessAdjustment;
        }

        return Math.min(100, Math.max(0, score));
    }

    // ... (existing code)
}