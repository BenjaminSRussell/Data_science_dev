class RealWorldTaskSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.taskTypes = {
            // ... existing task types ...
        };
        this.currentTask = null;
        this.taskHistory = [];
    }
    
    /**
     * Generate a task based on job and context
     */
    generateTask(jobId, context = {}) {
        const availableTasks = this.getAvailableTasks(jobId, context);
        if (availableTasks.length === 0) return null;
        
        const taskType = availableTasks[Math.floor(Math.random() * availableTasks.length)];
        const taskTemplate = this.taskTypes[taskType];
        
        return {
            id: `${taskType}_${Date.now()}`,
            type: taskType,
            name: taskTemplate.name,
            category: taskTemplate.category,
            steps: taskTemplate.steps.map(step => ({ ...step, completed: false })),
            currentStep: 0,
            visual: taskTemplate.visual,
            description: taskTemplate.description,
            skills: taskTemplate.skills,
            reward: taskTemplate.reward,
            requiresLab: taskTemplate.requiresLab || false,
            canTakeModel: taskTemplate.canTakeModel !== false,
            startedAt: Date.now(),
            context: context
        };
    }
    
    /**
     * Get available tasks for a job
     */
    getAvailableTasks(jobId, context = {}) {
        const allTasks = Object.keys(this.taskTypes);
        
        // Filter based on job requirements - expanded with new tasks
        const jobTasks = {
            'data_analyst': [
                'data_cleaning', 'exploratory_analysis', 'github_bug_fix',
                'data_validation', 'ab_test_design', 'time_series_analysis',
                'feature_engineering', 'model_evaluation', 'clustering_analysis'
            ],
            'data_engineer': [
                'etl_pipeline', 'data_cleaning', 'github_feature',
                'data_validation', 'database_optimization', 'api_development',
                'feature_engineering', 'pipeline_optimization'
            ],
            'ml_engineer': [
                'model_training', 'data_cleaning', 'github_feature',
                'classification_model', 'regression_model', 'hyperparameter_tuning',
                'model_evaluation', 'model_deployment', 'feature_engineering',
                'nlp_text_analysis', 'clustering_analysis'
            ],
            'research_scientist': [
                'ai_model_training', 'model_training', 'exploratory_analysis',
                'time_series_analysis', 'nlp_text_analysis', 'hyperparameter_tuning',
                'clustering_analysis', 'model_evaluation'
            ]
        };
        
        let available = jobTasks[jobId] || allTasks;
        
        // Check if in university lab for AI training
        if (context.inUniversityLab && available.includes('ai_model_training')) {
            return ['ai_model_training'];
        }
        
        // Filter out AI training if not in lab
        if (!context.inUniversityLab) {
            available = available.filter(t => t !== 'ai_model_training');
        }
        
        return available;
    }
    
    /**
     * Start a task
     */
    startTask(task) {
        if (this.currentTask) {
            return { success: false, reason: "Already working on a task." };
        }
        
        this.currentTask = task;
        this.currentTask.currentStep = 0;
        this.currentTask.startedAt = Date.now();
        return { success: true, task: this.currentTask };
    }
    
    /**
     * Complete current step
     */
    completeStep() {
        if (!this.currentTask) return null;
        
        const step = this.currentTask.steps[this.currentTask.currentStep];
        if (step) {
            step.completed = true;
            this.currentTask.currentStep++;
            
            // Check if task is complete
            if (this.currentTask.currentStep >= this.currentTask.steps.length) {
                return this.completeTask();
            }
        }
        
        return this.currentTask;
    }
    
    /**
     * Complete entire task
     */
    completeTask() {
        if (!this.currentTask) return null;
        
        const task = this.currentTask;
        this.taskHistory.push({
            ...task,
            completedAt: Date.now(),
            duration: Date.now() - task.startedAt
        });
        
        // Apply rewards
        if (task.reward) {
            if (task.reward.money && task.canTakeModel !== false) {
                this.gameState.money += task.reward.money;
            }
            if (task.reward.reputation) {
                this.gameState.reputation += task.reward.reputation;
            }
            if (task.reward.experience) {
                // Add experience to relevant skills
                task.skills.forEach(skill => {
                    if (!this.gameState.stats[skill]) {
                        this.gameState.stats[skill] = 0;
                    }
                    this.gameState.stats[skill] += Math.floor(task.reward.experience / task.skills.length);
                });
            }
        }
        
        this.currentTask = null;
        return task;
    }
    
    /**
     * Get current task
     */
    getCurrentTask() {
        return this.currentTask;
    }
    
    /**
     * Get current step visual
     */
    getCurrentStepVisual() {
        if (!this.currentTask) return null;
        
        const step = this.currentTask.steps[this.currentTask.currentStep];
        return step ? step.visual : null;
    }
    
    /**
     * Get task progress (0-100)
     */
    getTaskProgress() {
        if (!this.currentTask) return 0;
        
        const completed = this.currentTask.steps.filter(s => s.completed).length;
        return (completed / this.currentTask.steps.length) * 100;
    }
}