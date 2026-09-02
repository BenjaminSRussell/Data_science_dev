class TaskVisualRenderer {
    // ... (other methods remain unchanged)

    /**
     * Calculate step progress
     */
    calculateStepProgress(task, step) {
        const stepIndex = task.steps.indexOf(step);
        const totalSteps = task.steps.length;
        if (stepIndex === -1) {
            return 0;
        }
        return ((stepIndex + 1) / totalSteps) * 100;
    }
    
    /**
     * Get stage icon
     */
    getStageIcon(stage) {
        const icons = {
            'Extract': 'E',
            'Transform': 'T',
            'Load': 'L',
            'Source': 'S',
            'Process': 'P',
            'Destination': 'D'
        };
        return icons[stage] || 'Ã¢â€”ï¿½';
    }
    
    /**
     * Get visual icon
     */
    getVisualIcon(type) {
        const icons = {
            'data_loading': 'DL',
            'statistics': 'S',
            'pattern_analysis': 'PA',
            'documentation': 'D',
            'architecture': 'A'
        };
        return icons[type] || '';
    }
    
    // ... (other methods remain unchanged)
}