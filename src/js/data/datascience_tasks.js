const DATA_SCIENCE_DOMAINS = {
    FINANCE: 'Finance',
    ECOMMERCE: 'Ecommerce',
    MARKETING: 'Marketing',
    HEALTHCARE: 'Healthcare'
};

const DATA_SCIENCE_TASKS = [
    {
        id: 'finance_201',
        name: 'Fraud Detection Model with Imbalanced Data',
        description: 'Build fraud detection model for credit card transactions. Dataset: 1M transactions, 0.1% fraud rate (highly imbalanced). Use SMOTE for oversampling, Random Forest classifier, and evaluate using precision-recall curve and F1-score. Handle class imbalance effectively.',
        domain: DATA_SCIENCE_DOMAINS.FINANCE,
        difficulty: 3.0,
        dataType: 'performance_metrics',
        requirements: ['Handle class imbalance', 'SMOTE oversampling', 'Precision-recall metrics'],
        optimalChartTypes: ['line', 'bar'],
        acceptableChartTypes: ['line', 'bar'],
        timeLimit: 200,
        skills: ['Python', 'Scikit-learn', 'Imbalanced Learning'],
        tools: ['Python', 'Imbalanced-learn', 'Scikit-learn'],
        deliverable: 'Fraud detection model with PR curve'
    },
    {
        id: 'ecommerce_201',
        name: 'Time Series Forecasting for Product Demand',
        description: 'Forecast next 3 months of product demand using 2 years of historical sales data. Account for seasonality (weekly and monthly patterns). Use ARIMA or Prophet model. Include confidence intervals. Evaluate using MAPE and RMSE.',
        domain: DATA_SCIENCE_DOMAINS.ECOMMERCE,
        difficulty: 3.2,
        dataType: 'trend_analysis',
        requirements: ['Time series modeling', 'Seasonality detection', 'Forecast with intervals'],
        optimalChartTypes: ['line'],
        acceptableChartTypes: ['line', 'area'],
        timeLimit: 200,
        skills: ['Time Series Analysis', 'Python', 'ARIMA/Prophet'],
        tools: ['Python', 'Statsmodels', 'Prophet'],
        deliverable: 'Demand forecast with uncertainty bounds'
    },
    {
        id: 'marketing_201',
        name: 'Multi-Touch Attribution Modeling',
        description: 'Build attribution model to assign credit to marketing touchpoints (email, social, search, display) in customer journey. Use Markov chain model to calculate contribution of each channel. Create visualization of customer journey paths.',
        domain: DATA_SCIENCE_DOMAINS.MARKETING,
        difficulty: 3.4,
        dataType: 'performance_metrics',
        requirements: ['Attribution modeling', 'Customer journey analysis', 'Channel contribution'],
        optimalChartTypes: ['bar', 'sankey'],
        acceptableChartTypes: ['bar'],
        timeLimit: 200,
        skills: ['Attribution Modeling', 'Python', 'Graph Theory'],
        tools: ['Python', 'NetworkX', 'Pandas'],
        deliverable: 'Attribution model with channel weights'
    },
    {
        id: 'healthcare_201',
        name: 'Patient Risk Stratification Using Clustering',
        description: 'Cluster diabetic patients into risk groups using clinical data (HbA1c, BMI, blood pressure, medication adherence). Use K-means clustering with optimal K selection via elbow method. Analyze cluster characteristics and create patient risk profiles.',
        domain: DATA_SCIENCE_DOMAINS.HEALTHCARE,
        difficulty: 3.1,
        dataType: 'customer_demographics',
        requirements: ['Clustering analysis', 'Optimal K selection', 'Cluster interpretation'],
        optimalChartTypes: ['scatter', 'bar'],
        acceptableChartTypes: ['scatter', 'bar'],
        timeLimit: 200,
        skills: ['Unsupervised Learning', 'Python', 'Clustering'],
        tools: ['Python', 'Scikit-learn', 'Matplotlib'],
        deliverable: 'Patient risk stratification with clusters'
    },
    
    // ===== DIFFICULTY 3.5-4.5: Data Scientist I Tasks =====
    // Machine learning models, feature engineering, model optimization
    
    {
        id: 'finance_301',
        name: 'Real-Time Transaction Anomaly Detection',
        description: 'Build real-time anomaly detection system for credit card transactions. Use Isolation Forest and Local Outlier Factor. Process streaming data. Achieve <100ms latency per transaction. Handle concept drift with adaptive thresholds.',
        domain: DATA_SCIENCE_DOMAINS.FINANCE,
        difficulty: 4.0,
        dataType: 'trend_analysis',
        requirements: ['Real-time processing', 'Anomaly detection', 'Low latency'],
        optimalChartTypes: ['line', 'scatter'],
        acceptableChartTypes: ['line'],
        timeLimit: 180,
        skills: ['Streaming Data', 'Anomaly Detection', 'Real-time Systems'],
        tools: ['Python', 'Kafka', 'Scikit-learn'],
        deliverable: 'Real-time anomaly detection pipeline'
    },
    {
        id: 'ecommerce_301',
        name: 'Product Recommendation System Using Collaborative Filtering',
        description: 'Build recommendation system using collaborative filtering. Dataset: 100K users, 10K products, 1M ratings. Use matrix factorization (SVD) to predict user-product ratings. Evaluate using precision@10 and recall@10. Handle cold start problem.',
        domain: DATA_SCIENCE_DOMAINS.ECOMMERCE,
        difficulty: 4.2,
        dataType: 'performance_metrics',
        requirements: ['Collaborative filtering', 'Matrix factorization', 'Recommendation metrics'],
        optimalChartTypes: ['bar'],
        acceptableChartTypes: ['bar'],
        timeLimit: 180,
        skills: ['Recommendation Systems', 'Matrix Factorization', 'Python'],
        tools: ['Python', 'Surprise', 'NumPy'],
        deliverable: 'Recommendation system with evaluation'
    },
    {
        id: 'marketing_301',
        name: 'Customer Churn Prediction with XGBoost',
        description: 'Predict customer churn for subscription service. Use XGBoost with 50+ features (usage patterns, payment history, engagement metrics). Perform hyperparameter tuning using Bayesian optimization. Evaluate using ROC-AUC and feature importance analysis.',
        domain: DATA_SCIENCE_DOMAINS.MARKETING,
        difficulty: 4.3,
        dataType: 'performance_metrics',
        requirements: ['XGBoost modeling', 'Hyperparameter tuning', 'Feature importance'],
        optimalChartTypes: ['bar', 'line'],
        acceptableChartTypes: ['bar'],
        timeLimit: 180,
        skills: ['XGBoost', 'Hyperparameter Tuning', 'Python'],
        tools: ['Python', 'XGBoost', 'Optuna'],
        deliverable: 'Churn prediction model with feature insights'
    },
    
    // Continue with more tasks... (This is a sample structure)
    // In production, we'll generate the full 1000 tasks
];

/**
 * Task Generator - Generates tasks based on parameters
 */
export class DataScienceTaskGenerator {
    constructor() {
        this.taskIdCounter = DATA_SCIENCE_TASKS.length;
    }

    /**
     * Get tasks by difficulty range
     */
    getTasksByDifficulty(minDifficulty, maxDifficulty) {
        return DATA_SCIENCE_TASKS.filter(task => 
            task.difficulty >= minDifficulty && task.difficulty <= maxDifficulty
        );
    }

    /**
     * Get tasks by domain
     */
    getTasksByDomain(domain) {
        return DATA_SCIENCE_TASKS.filter(task => task.domain === domain);
    }

    /**
     * Get random task in difficulty range
     */
    getRandomTask(minDifficulty, maxDifficulty) {
        const tasks = this.getTasksByDifficulty(minDifficulty, maxDifficulty);
        if (tasks.length === 0) return null;
        return tasks[Math.floor(Math.random() * tasks.length)];
    }

    /**
     * Generate task ID
     */
    generateTaskId(domain, sequence) {
        const domainPrefix = domain.substring(0, 3).toLowerCase();
        return `${domainPrefix}_${sequence.toString().padStart(3, '0')}`;
    }
}

// Export singleton instance
export const dataScienceTaskGenerator = new DataScienceTaskGenerator();