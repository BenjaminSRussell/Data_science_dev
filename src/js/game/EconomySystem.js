// ... (rest of the file remains unchanged)

scoreChartAppropriateness(task, chartConfig) {
    const selected = chartConfig.type;
    const requiredTechnique = task.technique || null;

    // Check if the selected chart type is optimal or acceptable
    if (optimalChartTypes.includes(selected)) return 90 + Math.random() * 10;
    if (acceptableChartTypes.includes(selected)) return 60 + Math.random() * 20;

    // Check if the required technique is specified in the task
    if (requiredTechnique) {
        // Check if the chart configuration matches the required technique
        if (chartConfig.algorithm === requiredTechnique) {
            return 75 + Math.random() * 10; // Partial credit for using the correct algorithm
        }
    }

    // If none of the above conditions are met, return a low score
    return 30 + Math.random() * 10;
}

// ... (rest of the file remains unchanged)