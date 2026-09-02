class StatisticsAggregator {
    formatMoney(amount) {
        if (Math.abs(amount) >= 1000) {
            return `$${(amount / 1000).toFixed(2).toLocaleString()}K`;
        } else {
            return `$${amount.toLocaleString()}`;
        }
    }
    // Other methods...
}