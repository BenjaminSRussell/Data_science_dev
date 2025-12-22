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
                reward: { money: 0, reputation: 100, experience: 500 },
                requiresLab: true,
                canTakeModel: false
            },

            // ===== MASSIVE EXPANSION: More Data Science Tasks =====
            
            // Feature Engineering
            feature_engineering: {
                id: 'feature_engineering',
                name: 'Feature Engineering Pipeline',
                category: 'pipeline',
                steps: [
                    { id: 'analyze_features', name: 'Analyze Existing Features', visual: 'data_table', duration: 3 },
                    { id: 'create_interactions', name: 'Create Feature Interactions', visual: 'transformation', duration: 4 },
                    { id: 'domain_features', name: 'Engineer Domain Features', visual: 'data_transform', duration: 5 },
                    { id: 'select_features', name: 'Feature Selection', visual: 'feature_selection', duration: 3 },
                    { id: 'validate_features', name: 'Validate Feature Quality', visual: 'quality_check', duration: 2 }
                ],
                visual: 'pipeline',
                description: 'Engineer new features to improve model performance',
                skills: ['python', 'pandas', 'feature_engineering', 'statistics'],
                reward: { money: 900, reputation: 20, experience: 110 }
            },

            // Model Evaluation
            model_evaluation: {
                id: 'model_evaluation',
                name: 'Comprehensive Model Evaluation',
                category: 'analysis',
                steps: [
                    { id: 'split_data', name: 'Split Data for Validation', visual: 'data_prep', duration: 2 },
                    { id: 'train_test', name: 'Run Train/Test Evaluation', visual: 'evaluation', duration: 4 },
                    { id: 'cross_validate', name: 'Perform Cross-Validation', visual: 'testing', duration: 5 },
                    { id: 'metric_analysis', name: 'Calculate All Metrics', visual: 'statistics', duration: 3 },
                    { id: 'error_analysis', name: 'Error Analysis', visual: 'analysis', duration: 4 },
                    { id: 'create_report', name: 'Create Evaluation Report', visual: 'documentation', duration: 3 }
                ],
                visual: 'evaluation',
                description: 'Comprehensive evaluation of model performance',
                skills: ['python', 'scikit-learn', 'statistics', 'evaluation'],
                reward: { money: 800, reputation: 18, experience: 100 }
            },

            // Hyperparameter Tuning
            hyperparameter_tuning: {
                id: 'hyperparameter_tuning',
                name: 'Hyperparameter Optimization',
                category: 'ai_ml',
                steps: [
                    { id: 'define_search', name: 'Define Search Space', visual: 'architecture', duration: 3 },
                    { id: 'grid_search', name: 'Run Grid Search', visual: 'hyperparameter', duration: 8 },
                    { id: 'random_search', name: 'Run Random Search', visual: 'hyperparameter', duration: 6 },
                    { id: 'bayesian_opt', name: 'Bayesian Optimization', visual: 'hyperparameter', duration: 7 },
                    { id: 'analyze_results', name: 'Analyze Best Parameters', visual: 'analysis', duration: 3 },
                    { id: 'final_eval', name: 'Final Model Evaluation', visual: 'evaluation', duration: 4 }
                ],
                visual: 'hyperparameter',
                description: 'Optimize model hyperparameters for best performance',
                skills: ['python', 'scikit-learn', 'optuna', 'hyperparameter_tuning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // Data Validation
            data_validation: {
                id: 'data_validation',
                name: 'Data Quality Validation',
                category: 'pipeline',
                steps: [
                    { id: 'schema_check', name: 'Schema Validation', visual: 'quality_check', duration: 2 },
                    { id: 'type_check', name: 'Data Type Checks', visual: 'data_table', duration: 2 },
                    { id: 'range_check', name: 'Range and Constraint Checks', visual: 'statistics', duration: 3 },
                    { id: 'completeness', name: 'Completeness Analysis', visual: 'quality_check', duration: 2 },
                    { id: 'consistency', name: 'Consistency Checks', visual: 'analysis', duration: 3 },
                    { id: 'generate_report', name: 'Generate Validation Report', visual: 'documentation', duration: 2 }
                ],
                visual: 'quality_check',
                description: 'Validate data quality and integrity',
                skills: ['python', 'pandas', 'data_validation', 'quality'],
                reward: { money: 600, reputation: 12, experience: 70 }
            },

            // Time Series Analysis
            time_series_analysis: {
                id: 'time_series_analysis',
                name: 'Time Series Analysis',
                category: 'analysis',
                steps: [
                    { id: 'load_data', name: 'Load Time Series Data', visual: 'data_loading', duration: 2 },
                    { id: 'decompose', name: 'Decompose Time Series', visual: 'pattern_analysis', duration: 4 },
                    { id: 'stationarity', name: 'Check Stationarity', visual: 'statistics', duration: 3 },
                    { id: 'autocorrelation', name: 'Autocorrelation Analysis', visual: 'charting', duration: 3 },
                    { id: 'build_model', name: 'Build Time Series Model', visual: 'model_selection', duration: 5 },
                    { id: 'forecast', name: 'Generate Forecasts', visual: 'training', duration: 4 },
                    { id: 'evaluate_forecast', name: 'Evaluate Forecast Accuracy', visual: 'evaluation', duration: 3 }
                ],
                visual: 'analysis',
                description: 'Perform time series analysis and forecasting',
                skills: ['python', 'pandas', 'statsmodels', 'time_series', 'forecasting'],
                reward: { money: 1000, reputation: 22, experience: 120 }
            },

            // Classification Model
            classification_model: {
                id: 'classification_model',
                name: 'Build Classification Model',
                category: 'ai_ml',
                steps: [
                    { id: 'prepare_data', name: 'Prepare Classification Data', visual: 'data_prep', duration: 3 },
                    { id: 'balance_classes', name: 'Handle Class Imbalance', visual: 'data_transform', duration: 3 },
                    { id: 'select_algorithm', name: 'Select Classification Algorithm', visual: 'model_selection', duration: 2 },
                    { id: 'train_model', name: 'Train Classification Model', visual: 'training', duration: 6 },
                    { id: 'evaluate', name: 'Evaluate with Confusion Matrix', visual: 'evaluation', duration: 4 },
                    { id: 'optimize_threshold', name: 'Optimize Classification Threshold', visual: 'hyperparameter', duration: 3 }
                ],
                visual: 'model_training',
                description: 'Build and optimize classification model',
                skills: ['python', 'scikit-learn', 'classification', 'ml'],
                reward: { money: 1000, reputation: 22, experience: 120 }
            },

            // Regression Model
            regression_model: {
                id: 'regression_model',
                name: 'Build Regression Model',
                category: 'ai_ml',
                steps: [
                    { id: 'prepare_data', name: 'Prepare Regression Data', visual: 'data_prep', duration: 3 },
                    { id: 'check_assumptions', name: 'Check Regression Assumptions', visual: 'statistics', duration: 4 },
                    { id: 'select_algorithm', name: 'Select Regression Algorithm', visual: 'model_selection', duration: 2 },
                    { id: 'train_model', name: 'Train Regression Model', visual: 'training', duration: 6 },
                    { id: 'evaluate', name: 'Evaluate Model Performance', visual: 'evaluation', duration: 4 },
                    { id: 'residual_analysis', name: 'Residual Analysis', visual: 'analysis', duration: 3 }
                ],
                visual: 'model_training',
                description: 'Build and evaluate regression model',
                skills: ['python', 'scikit-learn', 'regression', 'statistics'],
                reward: { money: 950, reputation: 20, experience: 115 }
            },

            // Clustering Analysis
            clustering_analysis: {
                id: 'clustering_analysis',
                name: 'Clustering Analysis',
                category: 'analysis',
                steps: [
                    { id: 'prepare_data', name: 'Prepare Data for Clustering', visual: 'data_prep', duration: 3 },
                    { id: 'scale_features', name: 'Scale Features', visual: 'transformation', duration: 2 },
                    { id: 'determine_k', name: 'Determine Optimal K', visual: 'pattern_analysis', duration: 4 },
                    { id: 'run_clustering', name: 'Run Clustering Algorithm', visual: 'training', duration: 5 },
                    { id: 'analyze_clusters', name: 'Analyze Cluster Characteristics', visual: 'analysis', duration: 4 },
                    { id: 'visualize', name: 'Visualize Clusters', visual: 'charting', duration: 3 }
                ],
                visual: 'analysis',
                description: 'Perform clustering analysis to identify patterns',
                skills: ['python', 'scikit-learn', 'clustering', 'unsupervised_learning'],
                reward: { money: 850, reputation: 18, experience: 105 }
            },

            // NLP Text Analysis
            nlp_text_analysis: {
                id: 'nlp_text_analysis',
                name: 'NLP Text Analysis',
                category: 'ai_ml',
                steps: [
                    { id: 'load_text', name: 'Load Text Data', visual: 'data_loading', duration: 2 },
                    { id: 'preprocess', name: 'Text Preprocessing', visual: 'data_prep', duration: 4 },
                    { id: 'tokenize', name: 'Tokenization', visual: 'transformation', duration: 3 },
                    { id: 'vectorize', name: 'Text Vectorization', visual: 'data_transform', duration: 4 },
                    { id: 'topic_modeling', name: 'Topic Modeling', visual: 'pattern_analysis', duration: 5 },
                    { id: 'sentiment', name: 'Sentiment Analysis', visual: 'analysis', duration: 4 },
                    { id: 'visualize', name: 'Visualize Results', visual: 'charting', duration: 3 }
                ],
                visual: 'nlp',
                description: 'Perform natural language processing on text data',
                skills: ['python', 'nltk', 'spacy', 'nlp', 'text_analysis'],
                reward: { money: 1100, reputation: 24, experience: 130 }
            },

            // Database Query Optimization
            database_optimization: {
                id: 'database_optimization',
                name: 'Database Query Optimization',
                category: 'pipeline',
                steps: [
                    { id: 'analyze_queries', name: 'Analyze Slow Queries', visual: 'database_extract', duration: 3 },
                    { id: 'check_indexes', name: 'Check Index Usage', visual: 'database_load', duration: 3 },
                    { id: 'optimize_query', name: 'Optimize Query Structure', visual: 'code_editor', duration: 4 },
                    { id: 'add_indexes', name: 'Add Missing Indexes', visual: 'database_load', duration: 3 },
                    { id: 'test_performance', name: 'Test Query Performance', visual: 'monitoring', duration: 3 }
                ],
                visual: 'database',
                description: 'Optimize database queries for better performance',
                skills: ['sql', 'database', 'optimization', 'performance'],
                reward: { money: 750, reputation: 16, experience: 90 }
            },

            // API Development
            api_development: {
                id: 'api_development',
                name: 'Build Data Science API',
                category: 'github',
                steps: [
                    { id: 'design_api', name: 'Design API Endpoints', visual: 'architecture', duration: 3 },
                    { id: 'implement_endpoints', name: 'Implement API Endpoints', visual: 'code_editor', duration: 6 },
                    { id: 'add_auth', name: 'Add Authentication', visual: 'code_editor', duration: 3 },
                    { id: 'write_tests', name: 'Write API Tests', visual: 'testing', duration: 4 },
                    { id: 'documentation', name: 'Write API Documentation', visual: 'documentation', duration: 3 },
                    { id: 'deploy', name: 'Deploy API', visual: 'deployment', duration: 3 }
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

