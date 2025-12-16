/**
 * RealWorldTaskSystem.js
 * Real-world multi-step problems with different visuals for each task type
 * Teaches actual data science work
 */

export class RealWorldTaskSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentTask = null;
        this.taskHistory = [];
        this.taskTypes = this.initializeTaskTypes();
    }
    
    /**
     * Initialize task types with different visuals and workflows
     */
    initializeTaskTypes() {
        return {
            // Data Pipeline Tasks
            data_cleaning: {
                id: 'data_cleaning',
                name: 'Data Cleaning',
                category: 'pipeline',
                steps: [
                    { id: 'identify_missing', name: 'Identify Missing Values', visual: 'data_table', duration: 2 },
                    { id: 'handle_outliers', name: 'Handle Outliers', visual: 'scatter_plot', duration: 3 },
                    { id: 'normalize_data', name: 'Normalize Data', visual: 'transformation', duration: 2 },
                    { id: 'validate_quality', name: 'Validate Data Quality', visual: 'quality_check', duration: 2 }
                ],
                visual: 'pipeline',
                description: 'Clean and prepare raw data for analysis',
                skills: ['data_processing', 'python', 'pandas'],
                reward: { money: 500, reputation: 10, experience: 50 }
            },
            
            etl_pipeline: {
                id: 'etl_pipeline',
                name: 'ETL Pipeline',
                category: 'pipeline',
                steps: [
                    { id: 'extract', name: 'Extract Data from Source', visual: 'database_extract', duration: 3 },
                    { id: 'transform', name: 'Transform Data', visual: 'data_transform', duration: 4 },
                    { id: 'load', name: 'Load to Data Warehouse', visual: 'database_load', duration: 2 },
                    { id: 'monitor', name: 'Monitor Pipeline Health', visual: 'monitoring', duration: 2 }
                ],
                visual: 'pipeline_diagram',
                description: 'Build Extract-Transform-Load pipeline',
                skills: ['python', 'sql', 'airflow'],
                reward: { money: 800, reputation: 15, experience: 80 }
            },
            
            // GitHub Issues
            github_bug_fix: {
                id: 'github_bug_fix',
                name: 'Fix GitHub Issue',
                category: 'github',
                steps: [
                    { id: 'reproduce', name: 'Reproduce the Bug', visual: 'code_editor', duration: 2 },
                    { id: 'identify_root', name: 'Identify Root Cause', visual: 'debugging', duration: 3 },
                    { id: 'write_fix', name: 'Write Fix', visual: 'code_editor', duration: 3 },
                    { id: 'test_fix', name: 'Test Fix', visual: 'testing', duration: 2 },
                    { id: 'submit_pr', name: 'Submit Pull Request', visual: 'github', duration: 1 }
                ],
                visual: 'github_issue',
                description: 'Fix a bug reported in GitHub issues',
                skills: ['python', 'git', 'testing'],
                reward: { money: 400, reputation: 20, experience: 60 }
            },
            
            github_feature: {
                id: 'github_feature',
                name: 'Implement Feature Request',
                category: 'github',
                steps: [
                    { id: 'analyze_requirements', name: 'Analyze Requirements', visual: 'documentation', duration: 2 },
                    { id: 'design_solution', name: 'Design Solution', visual: 'architecture', duration: 3 },
                    { id: 'implement', name: 'Implement Feature', visual: 'code_editor', duration: 5 },
                    { id: 'write_tests', name: 'Write Tests', visual: 'testing', duration: 3 },
                    { id: 'documentation', name: 'Write Documentation', visual: 'documentation', duration: 2 },
                    { id: 'submit_pr', name: 'Submit Pull Request', visual: 'github', duration: 1 }
                ],
                visual: 'github_feature',
                description: 'Implement a new feature from GitHub issue',
                skills: ['python', 'git', 'testing', 'documentation'],
                reward: { money: 600, reputation: 25, experience: 100 }
            },
            
            // Analysis Tasks
            exploratory_analysis: {
                id: 'exploratory_analysis',
                name: 'Exploratory Data Analysis',
                category: 'analysis',
                steps: [
                    { id: 'load_data', name: 'Load Dataset', visual: 'data_loading', duration: 1 },
                    { id: 'summary_stats', name: 'Calculate Summary Statistics', visual: 'statistics', duration: 2 },
                    { id: 'visualize', name: 'Create Visualizations', visual: 'charting', duration: 4 },
                    { id: 'identify_patterns', name: 'Identify Patterns', visual: 'pattern_analysis', duration: 3 },
                    { id: 'write_report', name: 'Write Analysis Report', visual: 'documentation', duration: 3 }
                ],
                visual: 'analysis',
                description: 'Perform exploratory data analysis',
                skills: ['python', 'pandas', 'matplotlib', 'statistics'],
                reward: { money: 700, reputation: 15, experience: 90 }
            },
            
            // AI/ML Tasks
            model_training: {
                id: 'model_training',
                name: 'Train ML Model',
                category: 'ai_ml',
                steps: [
                    { id: 'prepare_data', name: 'Prepare Training Data', visual: 'data_prep', duration: 3 },
                    { id: 'select_model', name: 'Select Model Architecture', visual: 'model_selection', duration: 2 },
                    { id: 'train', name: 'Train Model', visual: 'training', duration: 10 },
                    { id: 'evaluate', name: 'Evaluate Performance', visual: 'evaluation', duration: 3 },
                    { id: 'tune_hyperparams', name: 'Tune Hyperparameters', visual: 'hyperparameter', duration: 5 },
                    { id: 'retrain', name: 'Retrain with Best Params', visual: 'training', duration: 8 }
                ],
                visual: 'model_training',
                description: 'Train a machine learning model',
                skills: ['python', 'scikit-learn', 'tensorflow', 'ml'],
                reward: { money: 1200, reputation: 30, experience: 150 }
            },
            
            // AI Training (Special - for storyline)
            ai_model_training: {
                id: 'ai_model_training',
                name: 'Train AI Model (University Lab)',
                category: 'ai_research',
                steps: [
                    { id: 'collect_dataset', name: 'Collect Massive Dataset', visual: 'data_collection', duration: 5 },
                    { id: 'preprocess', name: 'Preprocess Data', visual: 'data_prep', duration: 8 },
                    { id: 'design_architecture', name: 'Design Neural Architecture', visual: 'architecture', duration: 6 },
                    { id: 'implement_model', name: 'Implement Model', visual: 'code_editor', duration: 10 },
                    { id: 'distributed_setup', name: 'Setup Distributed Training', visual: 'cluster', duration: 8 },
                    { id: 'train_epoch_1', name: 'Train Epoch 1', visual: 'training', duration: 15 },
                    { id: 'train_epoch_2', name: 'Train Epoch 2', visual: 'training', duration: 15 },
                    { id: 'train_epoch_3', name: 'Train Epoch 3', visual: 'training', duration: 15 },
                    { id: 'evaluate', name: 'Evaluate Model', visual: 'evaluation', duration: 5 },
                    { id: 'analyze_results', name: 'Analyze Results', visual: 'analysis', duration: 4 },
                    { id: 'write_paper', name: 'Write Research Paper', visual: 'documentation', duration: 8 }
                ],
                visual: 'ai_lab',
                description: 'Train a large-scale AI model in university lab',
                skills: ['python', 'tensorflow', 'pytorch', 'research', 'distributed_computing'],
                reward: { money: 0, reputation: 100, experience: 500 }, // No money - research
                requiresLab: true,
                canTakeModel: false // Can't take the model, only learn
            }
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
            'data_analyst': ['data_cleaning', 'exploratory_analysis', 'github_bug_fix'],
            'data_engineer': ['etl_pipeline', 'data_cleaning', 'github_feature'],
            'ml_engineer': ['model_training', 'data_cleaning', 'github_feature'],
            'research_scientist': ['ai_model_training', 'model_training', 'exploratory_analysis']
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

