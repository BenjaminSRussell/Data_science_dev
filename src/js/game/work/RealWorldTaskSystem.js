class RealWorldTaskSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.taskTypes = this.initializeTaskTypes();
        this.currentTask = null;
        this.taskHistory = [];
    }
    
    /**
     * Initialize task types
     */
    initializeTaskTypes() {
        return {
            // Data Cleaning
            data_cleaning: {
                id: 'data_cleaning',
                name: 'Data Cleaning and Preprocessing',
                category: 'data_management',
                steps: [
                    { id: 'load_data', name: 'Load Data', visual: 'data_collection', duration: 3 },
                    { id: 'inspect_data', name: 'Inspect Data', visual: 'data_inspection', duration: 2 },
                    { id: 'handle_missing', name: 'Handle Missing Values', visual: 'data_transform', duration: 3 },
                    { id: 'normalize_data', name: 'Normalize Data', visual: 'data_transform', duration: 2 },
                    { id: 'validate_data', name: 'Validate Data', visual: 'data_validation', duration: 2 },
                    { id: 'save_data', name: 'Save Cleaned Data', visual: 'data_collection', duration: 2 }
                ],
                visual: 'data_transform',
                description: 'Clean and preprocess data for analysis',
                skills: ['python', 'pandas', 'data_cleaning', 'data_management'],
                reward: { money: 600, reputation: 15, experience: 80 }
            },

            // Exploratory Analysis
            exploratory_analysis: {
                id: 'exploratory_analysis',
                name: 'Exploratory Data Analysis',
                category: 'analysis',
                steps: [
                    { id: 'load_data', name: 'Load Data', visual: 'data_collection', duration: 2 },
                    { id: 'plot_data', name: 'Plot Data', visual: 'visualization', duration: 3 },
                    { id: 'correlation', name: 'Correlation Analysis', visual: 'statistics', duration: 2 },
                    { id: 'summary_stats', name: 'Summary Statistics', visual: 'statistics', duration: 2 },
                    { id: 'identify_patterns', name: 'Identify Patterns', visual: 'analysis', duration: 2 },
                    { id: 'report_findings', name: 'Report Findings', visual: 'documentation', duration: 2 }
                ],
                visual: 'visualization',
                description: 'Perform exploratory data analysis to identify patterns and insights',
                skills: ['python', 'matplotlib', 'seaborn', 'exploratory_analysis'],
                reward: { money: 700, reputation: 18, experience: 90 }
            },

            // GitHub Bug Fix
            github_bug_fix: {
                id: 'github_bug_fix',
                name: 'Fix GitHub Issue',
                category: 'development',
                steps: [
                    { id: 'triage_issue', name: 'Triage Issue', visual: 'documentation', duration: 2 },
                    { id: 'reproduce_error', name: 'Reproduce Error', visual: 'testing', duration: 3 },
                    { id: 'debug_code', name: 'Debug Code', visual: 'code_editor', duration: 4 },
                    { id: 'write_test', name: 'Write Test', visual: 'testing', duration: 2 },
                    { id: 'commit_changes', name: 'Commit Changes', visual: 'code_editor', duration: 2 },
                    { id: 'push_changes', name: 'Push Changes', visual: 'code_editor', duration: 1 }
                ],
                visual: 'code_editor',
                description: 'Fix a bug reported on GitHub',
                skills: ['python', 'github', 'bug_fixing', 'development'],
                reward: { money: 800, reputation: 25, experience: 120 }
            },

            // Data Validation
            data_validation: {
                id: 'data_validation',
                name: 'Data Validation',
                category: 'data_management',
                steps: [
                    { id: 'load_data', name: 'Load Data', visual: 'data_collection', duration: 2 },
                    { id: 'check_integrity', name: 'Check Data Integrity', visual: 'data_validation', duration: 3 },
                    { id: 'validate_constraints', name: 'Validate Constraints', visual: 'data_validation', duration: 2 },
                    { id: 'generate_report', name: 'Generate Validation Report', visual: 'documentation', duration: 2 }
                ],
                visual: 'data_validation',
                description: 'Validate data against defined constraints and integrity rules',
                skills: ['python', 'data_validation', 'data_management'],
                reward: { money: 600, reputation: 15, experience: 80 }
            },

            // Database Optimization
            database_optimization: {
                id: 'database_optimization',
                name: 'Optimize Database Performance',
                category: 'data_management',
                steps: [
                    { id: 'analyze_queries', name: 'Analyze Queries', visual: 'database', duration: 3 },
                    { id: 'optimize_tables', name: 'Optimize Tables', visual: 'database', duration: 4 },
                    { id: 'index_data', name: 'Index Data', visual: 'database', duration: 3 },
                    { id: 'test_performance', name: 'Test Performance', visual: 'testing', duration: 3 }
                ],
                visual: 'database',
                description: 'Optimize database performance for faster query execution',
                skills: ['python', 'sql', 'database_optimization', 'data_management'],
                reward: { money: 750, reputation: 17, experience: 95 }
            },

            // API Development
            api_development: {
                id: 'api_development',
                name: 'Develop RESTful API',
                category: 'development',
                steps: [
                    { id: 'define_endpoints', name: 'Define API Endpoints', visual: 'documentation', duration: 2 },
                    { id: 'write_code', name: 'Write API Code', visual: 'code_editor', duration: 5 },
                    { id: 'test_api', name: 'Test API', visual: 'testing', duration: 3 },
                    { id: 'deploy_api', name: 'Deploy API', visual: 'deployment', duration: 3 }
                ],
                visual: 'api',
                description: 'Build RESTful API for data science models',
                skills: ['python', 'flask', 'fastapi', 'api', 'deployment'],
                reward: { money: 1200, reputation: 28, experience: 140 }
            },

            // Model Deployment
            model_deployment: {
                id: 'model_deployment',
                name: 'Deploy ML Model to Production',
                category: 'ai_ml',
                steps: [
                    { id: 'serialize_model', name: 'Serialize Model', visual: 'model_selection', duration: 2 },
                    { id: 'create_service', name: 'Create Prediction Service', visual: 'code_editor', duration: 5 },
                    { id: 'add_monitoring', name: 'Add Monitoring', visual: 'monitoring', duration: 4 },
                    { id: 'containerize', name: 'Containerize Service', visual: 'deployment', duration: 4 },
                    { id: 'deploy', name: 'Deploy to Production', visual: 'deployment', duration: 4 },
                    { id: 'test_production', name: 'Test Production Service', visual: 'testing', duration: 3 }
                ],
                visual: 'deployment',
                description: 'Deploy machine learning model to production',
                skills: ['python', 'docker', 'kubernetes', 'mlops', 'deployment'],
                reward: { money: 1400, reputation: 32, experience: 160 }
            },

            // A/B Test Design
            ab_test_design: {
                id: 'ab_test_design',
                name: 'Design and Analyze A/B Test',
                category: 'analysis',
                steps: [
                    { id: 'define_hypothesis', name: 'Define Hypothesis', visual: 'documentation', duration: 2 },
                    { id: 'calculate_sample', name: 'Calculate Sample Size', visual: 'statistics', duration: 3 },
                    { id: 'randomize', name: 'Randomize Users', visual: 'data_transform', duration: 2 },
                    { id: 'run_test', name: 'Run A/B Test', visual: 'testing', duration: 7 },
                    { id: 'collect_data', name: 'Collect Results', visual: 'data_collection', duration: 2 },
                    { id: 'statistical_test', name: 'Statistical Significance Test', visual: 'statistics', duration: 4 },
                    { id: 'interpret', name: 'Interpret Results', visual: 'analysis', duration: 3 }
                ],
                visual: 'testing',
                description: 'Design and analyze A/B test experiment',
                skills: ['python', 'statistics', 'hypothesis_testing', 'experimental_design'],
                reward: { money: 900, reputation: 20, experience: 110 }
            }
        };
    }
    
    /**
     * Generate a task based on job and context
     */
    generateTask(jobId, context = {}) {
        const availableTasks = this.getAvailableTasks(jobId, context);
        if (availableTasks.length === 0) {
            return null;
        }
        const taskType = availableTasks[Math.floor(Math.random() * availableTasks.length)];
        const task = {
            id: this.taskHistory.length + 1,
            type: taskType.id,
            name: taskType.name,
            category: taskType.category,
            steps: taskType.steps.map(step => ({ ...step, completed: false })),
            visual: taskType.visual,
            description: taskType.description,
            skills: taskType.skills,
            reward: taskType.reward,
            startTime: new Date()
        };
        this.currentTask = task;
        return task;
    }
    
    /**
     * Get available tasks for a given job
     */
    getAvailableTasks(jobId, context = {}) {
        const taskTypes = Object.values(this.taskTypes);
        const availableTasks = taskTypes.filter(taskType => {
            if (taskType.category === 'ai_ml' && !context.hasMachineLearning) {
                return false;
            }
            if (taskType.category === 'development' && !context.hasDevelopmentTools) {
                return false;
            }
            if (taskType.category === 'data_management' && !context.hasDataManagement) {
                return false;
            }
            if (taskType.category === 'analysis' && !context.hasAnalysisTools) {
                return false;
            }
            return true;
        });
        return availableTasks;
    }
    
    /**
     * Start a task
     */
    startTask(taskId) {
        const task = this.taskHistory.find(task => task.id === taskId);
        if (!task) {
            return false;
        }
        task.startTime = new Date();
        return true;
    }
    
    /**
     * Complete a task step
     */
    completeTaskStep(taskId, stepId) {
        const task = this.taskHistory.find(task => task.id === taskId);
        if (!task) {
            return false;
        }
        const step = task.steps.find(step => step.id === stepId);
        if (!step) {
            return false;
        }
        step.completed = true;
        return true;
    }
    
    /**
     * Complete a task
     */
    completeTask(taskId) {
        const task = this.taskHistory.find(task => task.id === taskId);
        if (!task) {
            return false;
        }
        const allStepsCompleted = task.steps.every(step => step.completed);
        if (!allStepsCompleted) {
            return false;
        }
        task.completed = true;
        task.endTime = new Date();
        this.gameState.reputation += task.reward.reputation;
        this.gameState.experience += task.reward.experience;
        return true;
    }
    
    /**
     * Get task history
     */
    getTaskHistory() {
        return this.taskHistory;
    }
}