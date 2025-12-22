/**
 * Data Science Tasks - 1000+ Real-World Tasks
 * Organized by domain and difficulty, steadily increasing in intellectual complexity
 * Based on actual industry work across multiple sectors
 */

/**
 * Task Categories - Real-world data science domains
 */
export const DATA_SCIENCE_DOMAINS = {
    FINANCE: 'finance',
    HEALTHCARE: 'healthcare',
    ECOMMERCE: 'ecommerce',
    MARKETING: 'marketing',
    MANUFACTURING: 'manufacturing',
    TELECOMMUNICATIONS: 'telecommunications',
    TRANSPORTATION: 'transportation',
    ENERGY: 'energy',
    EDUCATION: 'education',
    SOCIAL_MEDIA: 'social_media',
    GAMING: 'gaming',
    REAL_ESTATE: 'real_estate',
    INSURANCE: 'insurance',
    LOGISTICS: 'logistics',
    FINTECH: 'fintech'
};

/**
 * Difficulty Levels (1-10)
 * Each level represents increasing intellectual complexity
 */
export const DIFFICULTY_LEVELS = {
    LEVEL_1: { min: 1, max: 1.5, name: 'Junior Analyst' },
    LEVEL_2: { min: 1.5, max: 2.5, name: 'Data Analyst' },
    LEVEL_3: { min: 2.5, max: 3.5, name: 'Senior Analyst' },
    LEVEL_4: { min: 3.5, max: 4.5, name: 'Data Scientist I' },
    LEVEL_5: { min: 4.5, max: 5.5, name: 'Data Scientist II' },
    LEVEL_6: { min: 5.5, max: 6.5, name: 'Senior Data Scientist' },
    LEVEL_7: { min: 6.5, max: 7.5, name: 'Principal Data Scientist' },
    LEVEL_8: { min: 7.5, max: 8.5, name: 'Staff Data Scientist' },
    LEVEL_9: { min: 8.5, max: 9.5, name: 'Lead Data Scientist' },
    LEVEL_10: { min: 9.5, max: 10, name: 'Chief Data Officer' }
};

/**
 * Real-World Data Science Tasks
 * Each task is specific, with clear deliverables and difficulty progression
 */
export const DATA_SCIENCE_TASKS = [
    // ===== DIFFICULTY 1.0-1.5: Junior Analyst Tasks =====
    // Basic data extraction, simple visualizations, routine reporting
    
    // Finance Domain - Entry Level
    {
        id: 'finance_001',
        name: 'Daily Transaction Summary Report',
        description: 'Extract daily credit card transactions from SQL database and create a summary report showing total volume, average transaction, and transaction count by merchant category code (MCC). Output: Excel spreadsheet with pivot tables.',
        domain: DATA_SCIENCE_DOMAINS.FINANCE,
        difficulty: 1.0,
        dataType: 'category_breakdown',
        requirements: ['Extract data from SQL', 'Create pivot tables', 'Calculate summary statistics'],
        optimalChartTypes: ['bar', 'pie'],
        acceptableChartTypes: ['bar', 'pie', 'table'],
        timeLimit: 300,
        skills: ['SQL', 'Excel', 'Data Extraction'],
        tools: ['PostgreSQL', 'Microsoft Excel'],
        deliverable: 'Daily transaction summary Excel file'
    },
    {
        id: 'finance_002',
        name: 'Monthly Revenue Trend Analysis',
        description: 'Pull last 12 months of revenue data from sales database, calculate month-over-month growth rate, and create a line chart showing revenue trends. Identify months with highest/lowest growth.',
        domain: DATA_SCIENCE_DOMAINS.FINANCE,
        difficulty: 1.1,
        dataType: 'trend_analysis',
        requirements: ['Calculate MoM growth', 'Identify trends', 'Highlight anomalies'],
        optimalChartTypes: ['line'],
        acceptableChartTypes: ['line', 'bar'],
        timeLimit: 300,
        skills: ['SQL', 'Excel', 'Basic Statistics'],
        tools: ['MySQL', 'Excel'],
        deliverable: 'Revenue trend analysis PowerPoint'
    },
    {
        id: 'finance_003',
        name: 'Customer Segmentation by Account Balance',
        description: 'Segment 50,000 banking customers into three tiers (Low: <$1K, Medium: $1K-$10K, High: >$10K) based on account balance. Create pie chart showing distribution and count customers in each segment.',
        domain: DATA_SCIENCE_DOMAINS.FINANCE,
        difficulty: 1.2,
        dataType: 'customer_demographics',
        requirements: ['Segment customers', 'Count by segment', 'Show distribution'],
        optimalChartTypes: ['pie', 'bar'],
        acceptableChartTypes: ['pie', 'doughnut', 'bar'],
        timeLimit: 300,
        skills: ['SQL', 'Python', 'Pandas'],
        tools: ['PostgreSQL', 'Python 3.9'],
        deliverable: 'Customer segmentation report'
    },
    
    // E-commerce Domain - Entry Level
    {
        id: 'ecommerce_001',
        name: 'Product Sales Performance Dashboard',
        description: 'Extract last 30 days of product sales data. Calculate total revenue, units sold, and average order value per product. Create bar chart ranking top 20 products by revenue.',
        domain: DATA_SCIENCE_DOMAINS.ECOMMERCE,
        difficulty: 1.0,
        dataType: 'product_comparison',
        requirements: ['Calculate product metrics', 'Rank products', 'Visualize top performers'],
        optimalChartTypes: ['bar'],
        acceptableChartTypes: ['bar', 'table'],
        timeLimit: 300,
        skills: ['SQL', 'Excel'],
        tools: ['BigQuery', 'Google Sheets'],
        deliverable: 'Product performance dashboard'
    },
    {
        id: 'ecommerce_002',
        name: 'Shopping Cart Abandonment Analysis',
        description: 'Analyze abandoned cart data from web analytics. Calculate abandonment rate by product category. Create visualization showing which categories have highest abandonment rates.',
        domain: DATA_SCIENCE_DOMAINS.ECOMMERCE,
        difficulty: 1.1,
        dataType: 'category_breakdown',
        requirements: ['Calculate abandonment rates', 'Compare categories', 'Identify problem areas'],
        optimalChartTypes: ['bar'],
        acceptableChartTypes: ['bar', 'pie'],
        timeLimit: 300,
        skills: ['SQL', 'Google Analytics API'],
        tools: ['BigQuery', 'Tableau'],
        deliverable: 'Abandonment analysis report'
    },
    
    // Marketing Domain - Entry Level
    {
        id: 'marketing_001',
        name: 'Email Campaign Open Rate Analysis',
        description: 'Pull email campaign performance data from marketing automation platform. Calculate open rates by campaign type (newsletter, promotional, transactional). Create comparison chart.',
        domain: DATA_SCIENCE_DOMAINS.MARKETING,
        difficulty: 1.0,
        dataType: 'product_comparison',
        requirements: ['Calculate open rates', 'Compare campaign types', 'Show performance'],
        optimalChartTypes: ['bar'],
        acceptableChartTypes: ['bar', 'table'],
        timeLimit: 300,
        skills: ['API Integration', 'Excel'],
        tools: ['Mailchimp API', 'Excel'],
        deliverable: 'Campaign performance report'
    },
    {
        id: 'marketing_002',
        name: 'Social Media Engagement Metrics',
        description: 'Extract last week\'s social media post data (likes, shares, comments) from Facebook, Twitter, and Instagram APIs. Calculate engagement rate per platform and create comparison visualization.',
        domain: DATA_SCIENCE_DOMAINS.MARKETING,
        difficulty: 1.2,
        dataType: 'product_comparison',
        requirements: ['Extract from multiple APIs', 'Calculate engagement rates', 'Compare platforms'],
        optimalChartTypes: ['bar'],
        acceptableChartTypes: ['bar', 'radar'],
        timeLimit: 300,
        skills: ['API Integration', 'Python', 'Pandas'],
        tools: ['Facebook API', 'Twitter API', 'Instagram API', 'Python'],
        deliverable: 'Social media engagement report'
    },
    
    // Healthcare Domain - Entry Level
    {
        id: 'healthcare_001',
        name: 'Patient Appointment No-Show Analysis',
        description: 'Analyze appointment data to identify no-show patterns. Calculate no-show rate by day of week and appointment type (routine, urgent, follow-up). Create visualization showing patterns.',
        domain: DATA_SCIENCE_DOMAINS.HEALTHCARE,
        difficulty: 1.1,
        dataType: 'category_breakdown',
        requirements: ['Calculate no-show rates', 'Identify patterns', 'Segment by variables'],
        optimalChartTypes: ['bar'],
        acceptableChartTypes: ['bar', 'line'],
        timeLimit: 300,
        skills: ['SQL', 'Excel'],
        tools: ['SQL Server', 'Excel'],
        deliverable: 'No-show analysis report'
    },
    
    // ===== DIFFICULTY 1.5-2.5: Data Analyst Tasks =====
    // Statistical analysis, hypothesis testing, correlation analysis
    
    {
        id: 'finance_101',
        name: 'Credit Risk Scoring Model Development',
        description: 'Build a binary classification model to predict loan default using customer financial history. Use logistic regression with features: credit score, debt-to-income ratio, employment length, loan amount. Evaluate using ROC-AUC and confusion matrix.',
        domain: DATA_SCIENCE_DOMAINS.FINANCE,
        difficulty: 2.0,
        dataType: 'performance_metrics',
        requirements: ['Build classification model', 'Feature engineering', 'Model evaluation'],
        optimalChartTypes: ['bar'],
        acceptableChartTypes: ['bar', 'line'],
        timeLimit: 240,
        skills: ['Python', 'Scikit-learn', 'Statistics'],
        tools: ['Python 3.9', 'Pandas', 'Scikit-learn'],
        deliverable: 'Credit risk model with evaluation metrics'
    },
    {
        id: 'ecommerce_101',
        name: 'Customer Lifetime Value (CLV) Prediction',
        description: 'Calculate CLV for e-commerce customers using historical purchase data. Use RFM (Recency, Frequency, Monetary) analysis. Segment customers into high/medium/low CLV tiers. Create visualization of CLV distribution.',
        domain: DATA_SCIENCE_DOMAINS.ECOMMERCE,
        difficulty: 2.2,
        dataType: 'customer_demographics',
        requirements: ['Calculate CLV', 'RFM analysis', 'Customer segmentation'],
        optimalChartTypes: ['bar', 'pie'],
        acceptableChartTypes: ['bar', 'pie', 'scatter'],
        timeLimit: 240,
        skills: ['Python', 'Pandas', 'Statistical Analysis'],
        tools: ['Python', 'Jupyter Notebook'],
        deliverable: 'CLV analysis with customer segments'
    },
    {
        id: 'marketing_101',
        name: 'A/B Test Statistical Analysis',
        description: 'Analyze A/B test results for website conversion rate. Test: new checkout page design vs. old design. 10,000 visitors per variant. Calculate statistical significance using chi-square test and confidence intervals. Determine winning variant.',
        domain: DATA_SCIENCE_DOMAINS.MARKETING,
        difficulty: 2.3,
        dataType: 'product_comparison',
        requirements: ['Statistical testing', 'Calculate significance', 'Determine winner'],
        optimalChartTypes: ['bar'],
        acceptableChartTypes: ['bar'],
        timeLimit: 240,
        skills: ['Statistics', 'Python', 'Hypothesis Testing'],
        tools: ['Python', 'SciPy', 'Statsmodels'],
        deliverable: 'A/B test analysis report with statistical findings'
    },
    {
        id: 'healthcare_101',
        name: 'Hospital Readmission Rate Analysis',
        description: 'Analyze 30-day readmission rates for heart failure patients. Identify factors correlated with readmission: age, comorbidities, length of stay, discharge location. Create correlation matrix and identify key risk factors.',
        domain: DATA_SCIENCE_DOMAINS.HEALTHCARE,
        difficulty: 2.1,
        dataType: 'performance_metrics',
        requirements: ['Calculate readmission rates', 'Correlation analysis', 'Identify risk factors'],
        optimalChartTypes: ['bar', 'heatmap'],
        acceptableChartTypes: ['bar'],
        timeLimit: 240,
        skills: ['SQL', 'Python', 'Statistical Analysis'],
        tools: ['SQL Server', 'Python', 'Pandas'],
        deliverable: 'Readmission risk factor analysis'
    },
    
    // ===== DIFFICULTY 2.5-3.5: Senior Analyst Tasks =====
    // Advanced statistical modeling, time series, multi-variate analysis
    
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

