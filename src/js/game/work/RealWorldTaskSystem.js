===FILE: src/js/game/work/RealWorldTaskSystem.js===
```js
class RealWorldTaskSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentTask = null;
        this.taskHistory = [];
    }
    
    /**
     * Get available task types
     */
    getAvailableTaskTypes() {
        return Object.keys(this.taskTypes);
    }
    
    /**
     * Get task types
     */
    getTaskTypes() {
        return {
            // Data Cleaning
            data_cleaning: {
                id: 'data_cleaning',
                name: 'Data Cleaning and Preparation',
                category: 'data_preprocessing',
                steps: [
                    { id: 'load_data', name: 'Load Data', visual: 'data_load', duration: 3 },
                    { id: 'identify_issues', name: 'Identify Issues', visual: 'data_inspection', duration: 4 },
                    { id: 'fix_issues', name: 'Fix Issues', visual: 'data_transform', duration: 5 },
                    { id: 'validate_data', name: 'Validate Data', visual: 'data_validation', duration: 3 }
                ],
                visual: 'data_transform',
                description: 'Clean and prepare dataset for analysis',
                skills: ['python', 'data_cleaning', 'data_validation'],
                reward: { money: 800, reputation: 15, experience: 100 }
            },

            // Exploratory Data Analysis
            exploratory_analysis: {
                id: 'exploratory_analysis',
                name: 'Exploratory Data Analysis',
                category: 'data_analysis',
                steps: [
                    { id: 'explore_data', name: 'Explore Data', visual: 'data_explore', duration: 5 },
                    { id: 'visualize_data', name: 'Visualize Data', visual: 'data_visualize', duration: 4 },
                    { id: 'interpret_results', name: 'Interpret Results', visual: 'analysis', duration: 4 }
                ],
                visual: 'data_visualize',
                description: 'Perform exploratory data analysis',
                skills: ['python', 'data_analysis', 'visualization'],
                reward: { money: 1000, reputation: 25, experience: 120 }
            },

            // GitHub Bug Fix
            github_bug_fix: {
                id: 'github_bug_fix',
                name: 'Contribute to Open Source by Fixing a Bug',
                category: 'software_development',
                steps: [
                    { id: 'clone_repo', name: 'Clone Repository', visual: 'git_clone', duration: 2 },
                    { id: 'find_bug', name: 'Find Bug', visual: 'bug_hunting', duration: 3 },
                    { id: 'fix_bug', name: 'Fix Bug', visual: 'code_fix', duration: 4 },
                    { id: 'test_changes', name: 'Test Changes', visual: 'testing', duration: 3 },
                    { id: 'create_pr', name: 'Create Pull Request', visual: 'git_pr', duration: 2 }
                ],
                visual: 'code_fix',
                description: 'Contribute to open source by fixing a bug',
                skills: ['git', 'bug_fixing', 'software_development'],
                reward: { money: 700, reputation: 20, experience: 110 }
            },

            // Data Validation
            data_validation: {
                id: 'data_validation',
                name: 'Data Validation and Testing',
                category: 'data_quality',
                steps: [
                    { id: 'validate_structure', name: 'Validate Data Structure', visual: 'data_validation', duration: 4 },
                    { id: 'validate_values', name: 'Validate Data Values', visual: 'data_validation', duration: 4 },
                    { id: 'test_integrity', name: 'Test Data Integrity', visual: 'testing', duration: 3 }
                ],
                visual: 'data_validation',
                description: 'Validate and test dataset',
                skills: ['python', 'data_validation', 'data_integrity'],
                reward: { money: 800, reputation: 18, experience: 105 }
            },

            // Time Series Analysis
            time_series_analysis: {
                id: 'time_series_analysis',
                name: 'Time Series Analysis',
                category: 'data_analysis',
                steps: [
                    { id: 'load_data', name: 'Load Time Series Data', visual: 'data_load', duration: 3 },
                    { id: 'preprocess_data', name: 'Preprocess Time Series Data', visual: 'data_transform', duration: 4 },
                    { id: 'analyze_data', name: 'Analyze Time Series Data', visual: 'data_explore', duration: 5 },
                    { id: 'model_data', name: 'Build Forecasting Model', visual: 'model_training', duration: 6 }
                ],
                visual: 'data_explore',
                description: 'Perform time series analysis and forecasting',
                skills: ['python', 'time_series_analysis', 'modeling'],
                reward: { money: 1200, reputation: 28, experience: 140 }
            },

            // Feature Engineering
            feature_engineering: {
                id: 'feature_engineering',
                name: 'Feature Engineering',
                category: 'modeling',
                steps: [
                    { id: 'define_features', name: 'Define Features', visual: 'documentation', duration: 3 },
                    { id: 'select_features', name: 'Select Features', visual: 'feature_selection', duration: 4 },
                    { id: 'transform_features', name: 'Transform Features', visual: 'data_transform', duration: 5 }
                ],
                visual: 'data_transform',
                description: 'Perform feature engineering for model training',
                skills: ['python', 'feature_engineering', 'modeling'],
                reward: { money: 900, reputation: 22, experience: 120 }
            },

            // Model Evaluation
            model_evaluation: {
                id: 'model_evaluation',
                name: 'Evaluate Machine Learning Model',
                category: 'modeling',
                steps: [
                    { id: 'load_model', name: 'Load Model', visual: 'model_load', duration: 2 },
                    { id: 'evaluate_metrics', name: 'Evaluate Metrics', visual: 'metrics_evaluation', duration: 4 },
                    { id: 'interpret_results', name: 'Interpret Results', visual: 'analysis', duration: 3 }
                ],
                visual: 'metrics_evaluation',
                description: 'Evaluate and interpret machine learning model',
                skills: ['python', 'model_evaluation', 'modeling'],
                reward: { money: 950, reputation: 24, experience: 130 }
            },

            // Clustering Analysis
            clustering_analysis: {
                id: 'clustering_analysis',
                name: 'Clustering Analysis',
                category: 'data_analysis',
                steps: [
                    { id: 'load_data', name: 'Load Data', visual: 'data_load', duration: 3 },
                    { id: 'preprocess_data', name: 'Preprocess Data', visual: 'data_transform', duration: 4 },
                    { id: 'cluster_data', name: 'Cluster Data', visual: 'clustering', duration: 5 },
                    { id: 'interpret_clusters', name: 'Interpret Clusters', visual: 'analysis', duration: 4 }
                ],
                visual: 'clustering',
                description: 'Perform clustering analysis',
                skills: ['python', 'clustering', 'data_analysis'],
                reward: { money: 950, reputation: 26, experience: 135 }
            },

            // AI Model Training
            ai_model_training: {
                id: 'ai_model_training',
                name: 'Train AI Model',
                category: 'ai_training',
                steps: [
                    { id: 'define_problem', name: 'Define Problem', visual: 'documentation', duration: 2 },
                    { id: 'select_model', name: 'Select AI Model', visual: 'model_selection', duration: 3 },
                    { id: 'train_model', name: 'Train AI Model', visual: 'ai_training', duration: 8 },
                    { id: 'evaluate_model', name: 'Evaluate AI Model', visual: 'metrics_evaluation', duration: 4 }
                ],
                visual: 'ai_training',
                description: 'Train an AI model',
                skills: ['python', 'ai_training', 'deep_learning'],
                reward: { money: 1500, reputation: 30, experience: 180 },
                requiresLab: true
            },

            // ETL Pipeline
            etl_pipeline: {
                id: 'etl_pipeline',
                name: 'Design and Implement ETL Pipeline',
                category: 'data_engineering',
                steps: [
                    { id: 'extract_data', name: 'Extract Data', visual: 'data_extract', duration: 4 },
                    { id: 'transform_data', name: 'Transform Data', visual: 'data_transform', duration: 5 },
                    { id: 'load_data', name: 'Load Data', visual: 'data_load', duration: 4 }
                ],
                visual: 'data_load',
                description: 'Design and implement ETL pipeline',
                skills: ['python', 'etl', 'data_engineering'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // Database Optimization
            database_optimization: {
                id: 'database_optimization',
                name: 'Optimize Database Performance',
                category: 'data_engineering',
                steps: [
                    { id: 'analyze_performance', name: 'Analyze Performance', visual: 'database_inspection', duration: 4 },
                    { id: 'optimize_queries', name: 'Optimize Queries', visual: 'query_optimization', duration: 5 },
                    { id: 'test_performance', name: 'Test Performance', visual: 'testing', duration: 3 }
                ],
                visual: 'query_optimization',
                description: 'Optimize database performance',
                skills: ['sql', 'database_performance', 'data_engineering'],
                reward: { money: 1000, reputation: 22, experience: 120 }
            },

            // Model Deployment
            model_deployment: {
                id: 'model_deployment',
                name: 'Deploy Machine Learning Model',
                category: 'modeling',
                steps: [
                    { id: 'prepare_deployment', name: 'Prepare Deployment', visual: 'documentation', duration: 3 },
                    { id: 'deploy_model', name: 'Deploy Model', visual: 'model_deployment', duration: 6 },
                    { id: 'monitor_model', name: 'Monitor Model', visual: 'monitoring', duration: 4 }
                ],
                visual: 'model_deployment',
                description: 'Deploy and monitor machine learning model',
                skills: ['python', 'model_deployment', 'devops'],
                reward: { money: 1050, reputation: 27, experience: 135 }
            },

            // NLP Analysis
            nlp_analysis: {
                id: 'nlp_analysis',
                name: 'Natural Language Processing Analysis',
                category: 'data_analysis',
                steps: [
                    { id: 'load_data', name: 'Load Text Data', visual: 'data_load', duration: 3 },
                    { id: 'preprocess_text', name: 'Preprocess Text', visual: 'text_preprocessing', duration: 4 },
                    { id: 'analyze_text', name: 'Analyze Text', visual: 'data_explore', duration: 5 },
                    { id: 'model_text', name: 'Build NLP Model', visual: 'model_training', duration: 6 }
                ],
                visual: 'data_explore',
                description: 'Perform natural language processing analysis',
                skills: ['python', 'nlp', 'text_analysis'],
                reward: { money: 1250, reputation: 29, experience: 145 }
            },

            // Model Tuning
            model_tuning: {
                id: 'model_tuning',
                name: 'Tune Machine Learning Model',
                category: 'modeling',
                steps: [
                    { id: 'load_model', name: 'Load Model', visual: 'model_load', duration: 2 },
                    { id: 'tune_hyperparameters', name: 'Tune Hyperparameters', visual: 'hyperparameter_tuning', duration: 5 },
                    { id: 'evaluate_tuned_model', name: 'Evaluate Tuned Model', visual: 'metrics_evaluation', duration: 4 }
                ],
                visual: 'hyperparameter_tuning',
                description: 'Tune and evaluate machine learning model',
                skills: ['python', 'model_tuning', 'modeling'],
                reward: { money: 900, reputation: 22, experience: 120 }
            },

            // Model Interpretation
            model_interpretation: {
                id: 'model_interpretation',
                name: 'Interpret Machine Learning Model',
                category: 'modeling',
                steps: [
                    { id: 'load_model', name: 'Load Model', visual: 'model_load', duration: 2 },
                    { id: 'interpret_model', name: 'Interpret Model', visual: 'model_interpretation', duration: 5 },
                    { id: 'document_results', name: 'Document Results', visual: 'documentation', duration: 3 }
                ],
                visual: 'model_interpretation',
                description: 'Interpret and document machine learning model',
                skills: ['python', 'model_interpretation', 'modeling'],
                reward: { money: 950, reputation: 24, experience: 130 }
            },

            // AI Ethics
            ai_ethics: {
                id: 'ai_ethics',
                name: 'AI Ethics and Fairness',
                category: 'ai_training',
                steps: [
                    { id: 'study_ethics', name: 'Study AI Ethics', visual: 'documentation', duration: 3 },
                    { id: 'evaluate_model', name: 'Evaluate Model Fairness', visual: 'fairness_evaluation', duration: 4 },
                    { id: 'implement_ethics', name: 'Implement Ethical Practices', visual: 'ethics_practices', duration: 5 }
                ],
                visual: 'fairness_evaluation',
                description: 'Study AI ethics and ensure model fairness',
                skills: ['python', 'ai_ethics', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Explainability
            ai_explainability: {
                id: 'ai_explainability',
                name: 'AI Explainability',
                category: 'ai_training',
                steps: [
                    { id: 'study_explainability', name: 'Study AI Explainability', visual: 'documentation', duration: 3 },
                    { id: 'implement_explainability', name: 'Implement Explainability', visual: 'explainability', duration: 4 },
                    { id: 'test_explainability', name: 'Test Explainability', visual: 'testing', duration: 3 }
                ],
                visual: 'explainability',
                description: 'Study and implement AI explainability',
                skills: ['python', 'ai_explainability', 'deep_learning'],
                reward: { money: 1050, reputation: 27, experience: 135 }
            },

            // ML Experimentation
            ml_experimentation: {
                id: 'ml_experimentation',
                name: 'Machine Learning Experimentation',
                category: 'modeling',
                steps: [
                    { id: 'define_experiment', name: 'Define Experiment', visual: 'documentation', duration: 2 },
                    { id: 'run_experiment', name: 'Run Experiment', visual: 'experimentation', duration: 6 },
                    { id: 'analyze_results', name: 'Analyze Results', visual: 'analysis', duration: 4 }
                ],
                visual: 'experimentation',
                description: 'Conduct machine learning experiments',
                skills: ['python', 'ml_experimentation', 'modeling'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // GitHub Code Contribution
            github_code_contribution: {
                id: 'github_code_contribution',
                name: 'Contribute to Open Source by Adding New Features',
                category: 'software_development',
                steps: [
                    { id: 'clone_repo', name: 'Clone Repository', visual: 'git_clone', duration: 2 },
                    { id: 'add_features', name: 'Add New Features', visual: 'code_add', duration: 5 },
                    { id: 'test_changes', name: 'Test Changes', visual: 'testing', duration: 4 },
                    { id: 'create_pr', name: 'Create Pull Request', visual: 'git_pr', duration: 2 }
                ],
                visual: 'code_add',
                description: 'Contribute to open source by adding new features',
                skills: ['git', 'code_contribution', 'software_development'],
                reward: { money: 1000, reputation: 28, experience: 140 }
            },

            // Model Scaling
            model_scaling: {
                id: 'model_scaling',
                name: 'Scale Machine Learning Model',
                category: 'modeling',
                steps: [
                    { id: 'load_model', name: 'Load Model', visual: 'model_load', duration: 2 },
                    { id: 'scale_model', name: 'Scale Model', visual: 'model_scaling', duration: 5 },
                    { id: 'monitor_performance', name: 'Monitor Performance', visual: 'monitoring', duration: 3 }
                ],
                visual: 'model_scaling',
                description: 'Scale and monitor machine learning model',
                skills: ['python', 'model_scaling', 'modeling'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // MLOps
            mlops: {
                id: 'mlops',
                name: 'MLOps Implementation',
                category: 'modeling',
                steps: [
                    { id: 'define_mlops', name: 'Define MLOps Practices', visual: 'documentation', duration: 3 },
                    { id: 'implement_mlops', name: 'Implement MLOps', visual: 'mlops_implementation', duration: 6 },
                    { id: 'monitor_mlops', name: 'Monitor MLOps', visual: 'monitoring', duration: 4 }
                ],
                visual: 'mlops_implementation',
                description: 'Implement and monitor MLOps practices',
                skills: ['python', 'mlops', 'devops'],
                reward: { money: 1200, reputation: 28, experience: 140 }
            },

            // AI Security
            ai_security: {
                id: 'ai_security',
                name: 'AI Security',
                category: 'ai_training',
                steps: [
                    { id: 'study_security', name: 'Study AI Security', visual: 'documentation', duration: 3 },
                    { id: 'implement_security', name: 'Implement Security Measures', visual: 'security_measures', duration: 4 },
                    { id: 'test_security', name: 'Test Security', visual: 'testing', duration: 3 }
                ],
                visual: 'security_measures',
                description: 'Study and implement AI security measures',
                skills: ['python', 'ai_security', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // Federated Learning
            federated_learning: {
                id: 'federated_learning',
                name: 'Federated Learning',
                category: 'ai_training',
                steps: [
                    { id: 'study_federated', name: 'Study Federated Learning', visual: 'documentation', duration: 3 },
                    { id: 'implement_federated', name: 'Implement Federated Learning', visual: 'federated_implementation', duration: 4 },
                    { id: 'evaluate_federated', name: 'Evaluate Federated Learning', visual: 'evaluation', duration: 3 }
                ],
                visual: 'federated_implementation',
                description: 'Study and implement federated learning',
                skills: ['python', 'federated_learning', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // Reinforcement Learning
            reinforcement_learning: {
                id: 'reinforcement_learning',
                name: 'Reinforcement Learning',
                category: 'ai_training',
                steps: [
                    { id: 'study_reinforcement', name: 'Study Reinforcement Learning', visual: 'documentation', duration: 3 },
                    { id: 'implement_reinforcement', name: 'Implement Reinforcement Learning', visual: 'reinforcement_implementation', duration: 4 },
                    { id: 'evaluate_reinforcement', name: 'Evaluate Reinforcement Learning', visual: 'evaluation', duration: 3 }
                ],
                visual: 'reinforcement_implementation',
                description: 'Study and implement reinforcement learning',
                skills: ['python', 'reinforcement_learning', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Fairness
            ai_fairness: {
                id: 'ai_fairness',
                name: 'AI Fairness',
                category: 'ai_training',
                steps: [
                    { id: 'study_fairness', name: 'Study AI Fairness', visual: 'documentation', duration: 3 },
                    { id: 'implement_fairness', name: 'Implement Fairness Measures', visual: 'fairness_measures', duration: 4 },
                    { id: 'test_fairness', name: 'Test Fairness', visual: 'testing', duration: 3 }
                ],
                visual: 'fairness_measures',
                description: 'Study and implement AI fairness measures',
                skills: ['python', 'ai_fairness', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Interpretability
            ai_interpretability: {
                id: 'ai_interpretability',
                name: 'AI Interpretability',
                category: 'ai_training',
                steps: [
                    { id: 'study_interpretability', name: 'Study AI Interpretability', visual: 'documentation', duration: 3 },
                    { id: 'implement_interpretability', name: 'Implement Interpretability', visual: 'interpretability', duration: 4 },
                    { id: 'test_interpretability', name: 'Test Interpretability', visual: 'testing', duration: 3 }
                ],
                visual: 'interpretability',
                description: 'Study and implement AI interpretability',
                skills: ['python', 'ai_interpretability', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Explainability
            ai_explainability: {
                id: 'ai_explainability',
                name: 'AI Explainability',
                category: 'ai_training',
                steps: [
                    { id: 'study_explainability', name: 'Study AI Explainability', visual: 'documentation', duration: 3 },
                    { id: 'implement_explainability', name: 'Implement Explainability', visual: 'explainability', duration: 4 },
                    { id: 'test_explainability', name: 'Test Explainability', visual: 'testing', duration: 3 }
                ],
                visual: 'explainability',
                description: 'Study and implement AI explainability',
                skills: ['python', 'ai_explainability', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Privacy
            ai_privacy: {
                id: 'ai_privacy',
                name: 'AI Privacy',
                category: 'ai_training',
                steps: [
                    { id: 'study_privacy', name: 'Study AI Privacy', visual: 'documentation', duration: 3 },
                    { id: 'implement_privacy', name: 'Implement Privacy Measures', visual: 'privacy_measures', duration: 4 },
                    { id: 'test_privacy', name: 'Test Privacy', visual: 'testing', duration: 3 }
                ],
                visual: 'privacy_measures',
                description: 'Study and implement AI privacy measures',
                skills: ['python', 'ai_privacy', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Robustness
            ai_robustness: {
                id: 'ai_robustness',
                name: 'AI Robustness',
                category: 'ai_training',
                steps: [
                    { id: 'study_robustness', name: 'Study AI Robustness', visual: 'documentation', duration: 3 },
                    { id: 'implement_robustness', name: 'Implement Robustness Measures', visual: 'robustness_measures', duration: 4 },
                    { id: 'test_robustness', name: 'Test Robustness', visual: 'testing', duration: 3 }
                ],
                visual: 'robustness_measures',
                description: 'Study and implement AI robustness measures',
                skills: ['python', 'ai_robustness', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Trust
            ai_trust: {
                id: 'ai_trust',
                name: 'AI Trust',
                category: 'ai_training',
                steps: [
                    { id: 'study_trust', name: 'Study AI Trust', visual: 'documentation', duration: 3 },
                    { id: 'implement_trust', name: 'Implement Trust Measures', visual: 'trust_measures', duration: 4 },
                    { id: 'test_trust', name: 'Test Trust', visual: 'testing', duration: 3 }
                ],
                visual: 'trust_measures',
                description: 'Study and implement AI trust measures',
                skills: ['python', 'ai_trust', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Bias
            ai_bias: {
                id: 'ai_bias',
                name: 'AI Bias',
                category: 'ai_training',
                steps: [
                    { id: 'study_bias', name: 'Study AI Bias', visual: 'documentation', duration: 3 },
                    { id: 'detect_bias', name: 'Detect Bias', visual: 'bias_detection', duration: 4 },
                    { id: 'mitigate_bias', name: 'Mitigate Bias', visual: 'bias_mitigation', duration: 3 }
                ],
                visual: 'bias_mitigation',
                description: 'Study, detect, and mitigate AI bias',
                skills: ['python', 'ai_bias', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Transparency
            ai_transparency: {
                id: 'ai_transparency',
                name: 'AI Transparency',
                category: 'ai_training',
                steps: [
                    { id: 'study_transparency', name: 'Study AI Transparency', visual: 'documentation', duration: 3 },
                    { id: 'implement_transparency', name: 'Implement Transparency', visual: 'transparency', duration: 4 },
                    { id: 'test_transparency', name: 'Test Transparency', visual: 'testing', duration: 3 }
                ],
                visual: 'transparency',
                description: 'Study and implement AI transparency',
                skills: ['python', 'ai_transparency', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Accountability
            ai_accountability: {
                id: 'ai_accountability',
                name: 'AI Accountability',
                category: 'ai_training',
                steps: [
                    { id: 'study_accountability', name: 'Study AI Accountability', visual: 'documentation', duration: 3 },
                    { id: 'implement_accountability', name: 'Implement Accountability Measures', visual: 'accountability_measures', duration: 4 },
                    { id: 'test_accountability', name: 'Test Accountability', visual: 'testing', duration: 3 }
                ],
                visual: 'accountability_measures',
                description: 'Study and implement AI accountability measures',
                skills: ['python', 'ai_accountability', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Governance
            ai_governance: {
                id: 'ai_governance',
                name: 'AI Governance',
                category: 'ai_training',
                steps: [
                    { id: 'study_governance', name: 'Study AI Governance', visual: 'documentation', duration: 3 },
                    { id: 'implement_governance', name: 'Implement Governance Measures', visual: 'governance_measures', duration: 4 },
                    { id: 'test_governance', name: 'Test Governance', visual: 'testing', duration: 3 }
                ],
                visual: 'governance_measures',
                description: 'Study and implement AI governance measures',
                skills: ['python', 'ai_governance', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Compliance
            ai_compliance: {
                id: 'ai_compliance',
                name: 'AI Compliance',
                category: 'ai_training',
                steps: [
                    { id: 'study_compliance', name: 'Study AI Compliance', visual: 'documentation', duration: 3 },
                    { id: 'implement_compliance', name: 'Implement Compliance Measures', visual: 'compliance_measures', duration: 4 },
                    { id: 'test_compliance', name: 'Test Compliance', visual: 'testing', duration: 3 }
                ],
                visual: 'compliance_measures',
                description: 'Study and implement AI compliance measures',
                skills: ['python', 'ai_compliance', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Ethical AI
            ai_ethical_ai: {
                id: 'ai_ethical_ai',
                name: 'AI Ethical AI',
                category: 'ai_training',
                steps: [
                    { id: 'study_ethical_ai', name: 'Study AI Ethical AI', visual: 'documentation', duration: 3 },
                    { id: 'implement_ethical_ai', name: 'Implement Ethical AI Measures', visual: 'ethical_ai_measures', duration: 4 },
                    { id: 'test_ethical_ai', name: 'Test Ethical AI', visual: 'testing', duration: 3 }
                ],
                visual: 'ethical_ai_measures',
                description: 'Study and implement AI ethical AI measures',
                skills: ['python', 'ai_ethical_ai', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Responsible AI
            ai_responsible_ai: {
                id: 'ai_responsible_ai',
                name: 'AI Responsible AI',
                category: 'ai_training',
                steps: [
                    { id: 'study_responsible_ai', name: 'Study AI Responsible AI', visual: 'documentation', duration: 3 },
                    { id: 'implement_responsible_ai', name: 'Implement Responsible AI Measures', visual: 'responsible_ai_measures', duration: 4 },
                    { id: 'test_responsible_ai', name: 'Test Responsible AI', visual: 'testing', duration: 3 }
                ],
                visual: 'responsible_ai_measures',
                description: 'Study and implement AI responsible AI measures',
                skills: ['python', 'ai_responsible_ai', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Explainable AI
            ai_explainable_ai: {
                id: 'ai_explainable_ai',
                name: 'AI Explainable AI',
                category: 'ai_training',
                steps: [
                    { id: 'study_explainable_ai', name: 'Study AI Explainable AI', visual: 'documentation', duration: 3 },
                    { id: 'implement_explainable_ai', name: 'Implement Explainable AI Measures', visual: 'explainable_ai_measures', duration: 4 },
                    { id: 'test_explainable_ai', name: 'Test Explainable AI', visual: 'testing', duration: 3 }
                ],
                visual: 'explainable_ai_measures',
                description: 'Study and implement AI explainable AI measures',
                skills: ['python', 'ai_explainable_ai', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Fairness
            ai_fairness: {
                id: 'ai_fairness',
                name: 'AI Fairness',
                category: 'ai_training',
                steps: [
                    { id: 'study_fairness', name: 'Study AI Fairness', visual: 'documentation', duration: 3 },
                    { id: 'implement_fairness', name: 'Implement Fairness Measures', visual: 'fairness_measures', duration: 4 },
                    { id: 'test_fairness', name: 'Test Fairness', visual: 'testing', duration: 3 }
                ],
                visual: 'fairness_measures',
                description: 'Study and implement AI fairness measures',
                skills: ['python', 'ai_fairness', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Robustness
            ai_robustness: {
                id: 'ai_robustness',
                name: 'AI Robustness',
                category: 'ai_training',
                steps: [
                    { id: 'study_robustness', name: 'Study AI Robustness', visual: 'documentation', duration: 3 },
                    { id: 'implement_robustness', name: 'Implement Robustness Measures', visual: 'robustness_measures', duration: 4 },
                    { id: 'test_robustness', name: 'Test Robustness', visual: 'testing', duration: 3 }
                ],
                visual: 'robustness_measures',
                description: 'Study and implement AI robustness measures',
                skills: ['python', 'ai_robustness', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Transparency
            ai_transparency: {
                id: 'ai_transparency',
                name: 'AI Transparency',
                category: 'ai_training',
                steps: [
                    { id: 'study_transparency', name: 'Study AI Transparency', visual: 'documentation', duration: 3 },
                    { id: 'implement_transparency', name: 'Implement Transparency', visual: 'transparency', duration: 4 },
                    { id: 'test_transparency', name: 'Test Transparency', visual: 'testing', duration: 3 }
                ],
                visual: 'transparency',
                description: 'Study and implement AI transparency',
                skills: ['python', 'ai_transparency', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Ethics
            ai_ethics: {
                id: 'ai_ethics',
                name: 'AI Ethics',
                category: 'ai_training',
                steps: [
                    { id: 'study_ethics', name: 'Study AI Ethics', visual: 'documentation', duration: 3 },
                    { id: 'implement_ethics', name: 'Implement Ethics', visual: 'ethics', duration: 4 },
                    { id: 'test_ethics', name: 'Test Ethics', visual: 'testing', duration: 3 }
                ],
                visual: 'ethics',
                description: 'Study and implement AI ethics',
                skills: ['python', 'ai_ethics', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Accountability
            ai_accountability: {
                id: 'ai_accountability',
                name: 'AI Accountability',
                category: 'ai_training',
                steps: [
                    { id: 'study_accountability', name: 'Study AI Accountability', visual: 'documentation', duration: 3 },
                    { id: 'implement_accountability', name: 'Implement Accountability', visual: 'accountability', duration: 4 },
                    { id: 'test_accountability', name: 'Test Accountability', visual: 'testing', duration: 3 }
                ],
                visual: 'accountability',
                description: 'Study and implement AI accountability',
                skills: ['python', 'ai_accountability', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Compliance
            ai_compliance: {
                id: 'ai_compliance',
                name: 'AI Compliance',
                category: 'ai_training',
                steps: [
                    { id: 'study_compliance', name: 'Study AI Compliance', visual: 'documentation', duration: 3 },
                    { id: 'implement_compliance', name: 'Implement Compliance', visual: 'compliance', duration: 4 },
                    { id: 'test_compliance', name: 'Test Compliance', visual: 'testing', duration: 3 }
                ],
                visual: 'compliance',
                description: 'Study and implement AI compliance',
                skills: ['python', 'ai_compliance', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Governance
            ai_governance: {
                id: 'ai_governance',
                name: 'AI Governance',
                category: 'ai_training',
                steps: [
                    { id: 'study_governance', name: 'Study AI Governance', visual: 'documentation', duration: 3 },
                    { id: 'implement_governance', name: 'Implement Governance', visual: 'governance', duration: 4 },
                    { id: 'test_governance', name: 'Test Governance', visual: 'testing', duration: 3 }
                ],
                visual: 'governance',
                description: 'Study and implement AI governance',
                skills: ['python', 'ai_governance', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Responsible AI
            ai_responsible_ai: {
                id: 'ai_responsible_ai',
                name: 'AI Responsible AI',
                category: 'ai_training',
                steps: [
                    { id: 'study_responsible_ai', name: 'Study AI Responsible AI', visual: 'documentation', duration: 3 },
                    { id: 'implement_responsible_ai', name: 'Implement Responsible AI', visual: 'responsible_ai', duration: 4 },
                    { id: 'test_responsible_ai', name: 'Test Responsible AI', visual: 'testing', duration: 3 }
                ],
                visual: 'responsible_ai',
                description: 'Study and implement AI responsible AI',
                skills: ['python', 'ai_responsible_ai', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Explainable AI
            ai_explainable_ai: {
                id: 'ai_explainable_ai',
                name: 'AI Explainable AI',
                category: 'ai_training',
                steps: [
                    { id: 'study_explainable_ai', name: 'Study AI Explainable AI', visual: 'documentation', duration: 3 },
                    { id: 'implement_explainable_ai', name: 'Implement Explainable AI', visual: 'explainable_ai', duration: 4 },
                    { id: 'test_explainable_ai', name: 'Test Explainable AI', visual: 'testing', duration: 3 }
                ],
                visual: 'explainable_ai',
                description: 'Study and implement AI explainable AI',
                skills: ['python', 'ai_explainable_ai', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Fairness
            ai_fairness: {
                id: 'ai_fairness',
                name: 'AI Fairness',
                category: 'ai_training',
                steps: [
                    { id: 'study_fairness', name: 'Study AI Fairness', visual: 'documentation', duration: 3 },
                    { id: 'implement_fairness', name: 'Implement Fairness', visual: 'fairness', duration: 4 },
                    { id: 'test_fairness', name: 'Test Fairness', visual: 'testing', duration: 3 }
                ],
                visual: 'fairness',
                description: 'Study and implement AI fairness',
                skills: ['python', 'ai_fairness', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Robustness
            ai_robustness: {
                id: 'ai_robustness',
                name: 'AI Robustness',
                category: 'ai_training',
                steps: [
                    { id: 'study_robustness', name: 'Study AI Robustness', visual: 'documentation', duration: 3 },
                    { id: 'implement_robustness', name: 'Implement Robustness', visual: 'robustness', duration: 4 },
                    { id: 'test_robustness', name: 'Test Robustness', visual: 'testing', duration: 3 }
                ],
                visual: 'robustness',
                description: 'Study and implement AI robustness',
                skills: ['python', 'ai_robustness', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Transparency
            ai_transparency: {
                id: 'ai_transparency',
                name: 'AI Transparency',
                category: 'ai_training',
                steps: [
                    { id: 'study_transparency', name: 'Study AI Transparency', visual: 'documentation', duration: 3 },
                    { id: 'implement_transparency', name: 'Implement Transparency', visual: 'transparency', duration: 4 },
                    { id: 'test_transparency', name: 'Test Transparency', visual: 'testing', duration: 3 }
                ],
                visual: 'transparency',
                description: 'Study and implement AI transparency',
                skills: ['python', 'ai_transparency', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Ethics
            ai_ethics: {
                id: 'ai_ethics',
                name: 'AI Ethics',
                category: 'ai_training',
                steps: [
                    { id: 'study_ethics', name: 'Study AI Ethics', visual: 'documentation', duration: 3 },
                    { id: 'implement_ethics', name: 'Implement Ethics', visual: 'ethics', duration: 4 },
                    { id: 'test_ethics', name: 'Test Ethics', visual: 'testing', duration: 3 }
                ],
                visual: 'ethics',
                description: 'Study and implement AI ethics',
                skills: ['python', 'ai_ethics', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Accountability
            ai_accountability: {
                id: 'ai_accountability',
                name: 'AI Accountability',
                category: 'ai_training',
                steps: [
                    { id: 'study_accountability', name: 'Study AI Accountability', visual: 'documentation', duration: 3 },
                    { id: 'implement_accountability', name: 'Implement Accountability', visual: 'accountability', duration: 4 },
                    { id: 'test_accountability', name: 'Test Accountability', visual: 'testing', duration: 3 }
                ],
                visual: 'accountability',
                description: 'Study and implement AI accountability',
                skills: ['python', 'ai_accountability', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Compliance
            ai_compliance: {
                id: 'ai_compliance',
                name: 'AI Compliance',
                category: 'ai_training',
                steps: [
                    { id: 'study_compliance', name: 'Study AI Compliance', visual: 'documentation', duration: 3 },
                    { id: 'implement_compliance', name: 'Implement Compliance', visual: 'compliance', duration: 4 },
                    { id: 'test_compliance', name: 'Test Compliance', visual: 'testing', duration: 3 }
                ],
                visual: 'compliance',
                description: 'Study and implement AI compliance',
                skills: ['python', 'ai_compliance', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Governance
            ai_governance: {
                id: 'ai_governance',
                name: 'AI Governance',
                category: 'ai_training',
                steps: [
                    { id: 'study_governance', name: 'Study AI Governance', visual: 'documentation', duration: 3 },
                    { id: 'implement_governance', name: 'Implement Governance', visual: 'governance', duration: 4 },
                    { id: 'test_governance', name: 'Test Governance', visual: 'testing', duration: 3 }
                ],
                visual: 'governance',
                description: 'Study and implement AI governance',
                skills: ['python', 'ai_governance', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Responsible AI
            ai_responsible_ai: {
                id: 'ai_responsible_ai',
                name: 'AI Responsible AI',
                category: 'ai_training',
                steps: [
                    { id: 'study_responsible_ai', name: 'Study AI Responsible AI', visual: 'documentation', duration: 3 },
                    { id: 'implement_responsible_ai', name: 'Implement Responsible AI', visual: 'responsible_ai', duration: 4 },
                    { id: 'test_responsible_ai', name: 'Test Responsible AI', visual: 'testing', duration: 3 }
                ],
                visual: 'responsible_ai',
                description: 'Study and implement AI responsible AI',
                skills: ['python', 'ai_responsible_ai', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },

            // AI Explainable AI
            ai_explainable_ai: {
                id: 'ai_explainable_ai',
                name: 'AI Explainable AI',
                category: 'ai_training',
                steps: [
                    { id: 'study_explainable_ai', name: 'Study AI Explainable AI', visual: 'documentation', duration: 3 },
                    { id: 'implement_explainable_ai', name: 'Implement Explainable AI', visual: 'explainable_ai', duration: 4 },
                    { id: 'test_explainable_ai', name: 'Test Explainable AI', visual: 'testing', duration: 3 }
                ],
                visual: 'explainable_ai',
                description: 'Study and implement AI explainable AI',
                skills: ['python', 'ai_explainable_ai', 'deep_learning'],
                reward: { money: 1100, reputation: 25, experience: 130 }
            },
            // Add more training objects as needed
        ];
    }
}

export default TrainingData;