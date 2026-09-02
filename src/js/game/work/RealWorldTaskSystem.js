class RealWorldTaskSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.taskTypes = this.initializeTaskTypes();
        this.currentTask = null;
        this.taskHistory = [];
    }
    
    initializeTaskTypes() {
        return {
            // ETL Pipeline
            etl_pipeline: {
                id: 'etl_pipeline',
                name: 'Design and Implement ETL Pipeline',
                category: 'data_engineering',
                steps: [
                    { id: 'define_data_sources', name: 'Define Data Sources', visual: 'data_transform', duration: 3 },
                    { id: 'data_cleaning', name: 'Data Cleaning', visual: 'data_cleaning', duration: 4 },
                    { id: 'transform_data', name: 'Transform Data', visual: 'data_transform', duration: 4 },
                    { id: 'load_data', name: 'Load Data', visual: 'data_load', duration: 3 },
                    { id: 'validate_pipeline', name: 'Validate Pipeline', visual: 'testing', duration: 3 }
                ],
                visual: 'data_pipeline',
                description: 'Design, implement, and validate an ETL pipeline for data processing',
                skills: ['python', 'sql', 'etl', 'data_engineering'],
                reward: { money: 1200, reputation: 25, experience: 140 }
            },
            
            // Database Optimization
            database_optimization: {
                id: 'database_optimization',
                name: 'Optimize Database Performance',
                category: 'data_engineering',
                steps: [
                    { id: 'analyze_queries', name: 'Analyze Query Performance', visual: 'database_analysis', duration: 4 },
                    { id: 'index_optimization', name: 'Optimize Indexes', visual: 'database_optimization', duration: 4 },
                    { id: 'query_optimization', name: 'Optimize Queries', visual: 'database_optimization', duration: 4 },
                    { id: 'monitor_performance', name: 'Monitor Performance', visual: 'monitoring', duration: 3 },
                    { id: 'implement_changes', name: 'Implement Changes', visual: 'code_editor', duration: 3 }
                ],
                visual: 'database',
                description: 'Optimize database performance through query analysis and index management',
                skills: ['sql', 'database_design', 'performance_tuning', 'data_engineering'],
                reward: { money: 1100, reputation: 22, experience: 130 }
            },
            
            // Pipeline Optimization
            pipeline_optimization: {
                id: 'pipeline_optimization',
                name: 'Optimize Data Pipeline',
                category: 'data_engineering',
                steps: [
                    { id: 'analyze_pipeline', name: 'Analyze Current Pipeline', visual: 'data_pipeline', duration: 4 },
                    { id: 'identify_bottlenecks', name: 'Identify Bottlenecks', visual: 'performance_analysis', duration: 4 },
                    { id: 'optimize_performance', name: 'Optimize Performance', visual: 'data_pipeline', duration: 4 },
                    { id: 'reduce_costs', name: 'Reduce Costs', visual: 'cost_analysis', duration: 3 },
                    { id: 'ensure_reliability', name: 'Ensure Reliability', visual: 'data_pipeline', duration: 3 },
                    { id: 'validate_changes', name: 'Validate Changes', visual: 'testing', duration: 3 }
                ],
                visual: 'data_pipeline',
                description: 'Optimize an existing data pipeline for performance, cost, and reliability',
                skills: ['python', 'sql', 'etl', 'data_engineering', 'performance_tuning'],
                reward: { money: 1300, reputation: 24, experience: 135 }
            },
            
            // More task types can be added here...
        };
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
        
        // Filter based on job requirements
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
        this.currentTask = task;
        this.currentTask.currentStep = 0;
        this.currentTask.startedAt = Date.now();
        return this.currentTask;
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