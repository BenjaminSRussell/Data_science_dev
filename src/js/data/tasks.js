/**
 * Task Templates - Different visualization challenges
 * Wide variety of business scenarios for endless gameplay variety
 */

export const TASKS = [
    // Difficulty 1: Entry level tasks
    {
        id: "quarterly_sales_basic",
        name: "Quarterly Sales Report",
        description: "Create a chart showing our quarterly sales performance.",
        difficulty: 1,
        dataType: "quarterly_sales",
        requirements: [" Show comparison", " Display trends"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 300
    },
    {
        id: "category_breakdown_basic",
        name: "Sales by Category",
        description: "Visualize how sales are distributed across product categories.",
        difficulty: 1,
        dataType: "category_breakdown",
        requirements: [" Show proportions", " Compare categories"],
        optimalChartTypes: ["pie", "doughnut"],
        acceptableChartTypes: ["pie", "doughnut", "bar"],
        timeLimit: 300
    },
    {
        id: "monthly_trend_basic",
        name: "Monthly Revenue Trend",
        description: "Show how our revenue has changed over the past year.",
        difficulty: 1,
        dataType: "monthly_revenue",
        requirements: [" Show trend over time", " Highlight changes"],
        optimalChartTypes: ["line"],
        acceptableChartTypes: ["line", "bar", "area"],
        timeLimit: 300
    },
    {
        id: "website_traffic",
        name: "Website Traffic Overview",
        description: "Show our website visitor trends for the team meeting.",
        difficulty: 1,
        dataType: "trend_analysis",
        requirements: [" Show visitor counts", " Highlight growth"],
        optimalChartTypes: ["line"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 300
    },
    {
        id: "budget_breakdown",
        name: "Department Budget Allocation",
        description: "Visualize how our budget is split across departments.",
        difficulty: 1,
        dataType: "category_breakdown",
        requirements: [" Show budget split", " Clear comparison"],
        optimalChartTypes: ["pie", "doughnut"],
        acceptableChartTypes: ["pie", "doughnut", "bar"],
        timeLimit: 300
    },

    // Difficulty 2: Mid-level tasks
    {
        id: "product_comparison_mid",
        name: "Product Performance Analysis",
        description: "Compare our top products by sales and customer ratings.",
        difficulty: 2,
        dataType: "product_comparison",
        requirements: [" Compare multiple products", " Include ratings data"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 240
    },
    {
        id: "trend_analysis_mid",
        name: "User Growth Analysis",
        description: "Analyze user growth patterns over the past quarter.",
        difficulty: 2,
        dataType: "trend_analysis",
        requirements: [" Show growth trajectory", " Identify patterns"],
        optimalChartTypes: ["line", "area"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 240
    },
    {
        id: "demographics_mid",
        name: "Customer Demographics",
        description: "Visualize our customer base by age group distribution.",
        difficulty: 2,
        dataType: "customer_demographics",
        requirements: [" Show age distribution", " Compare segments"],
        optimalChartTypes: ["pie", "bar"],
        acceptableChartTypes: ["pie", "doughnut", "bar"],
        timeLimit: 240
    },
    {
        id: "marketing_roi",
        name: "Marketing Campaign ROI",
        description: "Show the return on investment for our marketing channels.",
        difficulty: 2,
        dataType: "product_comparison",
        requirements: [" Show ROI", " Compare channels"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 240
    },
    {
        id: "employee_satisfaction",
        name: "Employee Satisfaction Survey",
        description: "Visualize results from the annual employee satisfaction survey.",
        difficulty: 2,
        dataType: "performance_metrics",
        requirements: [" Show satisfaction levels", " Compare departments"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 240
    },
    {
        id: "sales_regional",
        name: "Regional Sales Comparison",
        description: "Compare sales performance across different regions.",
        difficulty: 2,
        dataType: "product_comparison",
        requirements: [" Compare regions", " Show differences"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "pie"],
        timeLimit: 240
    },

    // Difficulty 3: Senior level tasks
    {
        id: "performance_radar",
        name: "Team Performance Metrics",
        description: "Create a comprehensive view of team performance across key metrics.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Multi-dimensional view", " Show strengths/weaknesses"],
        optimalChartTypes: ["radar"],
        acceptableChartTypes: ["radar", "bar"],
        timeLimit: 200
    },
    {
        id: "quarterly_detailed",
        name: "Executive Summary Chart",
        description: "Create a board-ready visualization of quarterly financial performance.",
        difficulty: 3,
        dataType: "quarterly_sales",
        requirements: [" Executive ready", " Clear insights", " Show profitability"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 200
    },
    {
        id: "trend_forecast",
        name: "Growth Trend Presentation",
        description: "Visualize user growth for investor presentation.",
        difficulty: 3,
        dataType: "trend_analysis",
        requirements: [" Investment grade", " Professional quality"],
        optimalChartTypes: ["line"],
        acceptableChartTypes: ["line", "area"],
        timeLimit: 180
    },
    {
        id: "competitor_analysis",
        name: "Competitive Landscape Analysis",
        description: "Compare our performance against key competitors.",
        difficulty: 3,
        dataType: "product_comparison",
        requirements: [" Competitor comparison", " Clear positioning"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 200
    },
    {
        id: "customer_journey",
        name: "Customer Conversion Funnel",
        description: "Visualize the customer journey from awareness to purchase.",
        difficulty: 3,
        dataType: "category_breakdown",
        requirements: [" Show funnel stages", " Display drop-off"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar"],
        timeLimit: 200
    },
    {
        id: "kpi_dashboard",
        name: "KPI Dashboard Overview",
        description: "Create a comprehensive view of our key performance indicators.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Show all KPIs", " Highlight targets vs actuals"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 180
    },

    // Difficulty 4: Expert level tasks
    {
        id: "complex_multivar",
        name: "Comprehensive Market Analysis",
        description: "Create publication-quality visualization for the annual report.",
        difficulty: 4,
        dataType: "product_comparison",
        requirements: [" Multi-variable analysis", " Award-winning quality", " Clear narrative"],
        optimalChartTypes: ["bar", "scatter"],
        acceptableChartTypes: ["bar"],
        timeLimit: 180
    },
    {
        id: "executive_dashboard",
        name: "C-Suite Financial Dashboard",
        description: "Create a visualization for the CEO's quarterly business review.",
        difficulty: 4,
        dataType: "quarterly_sales",
        requirements: [" CEO level", " Perfect accuracy", " Actionable insights"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 150
    },
    {
        id: "investor_deck",
        name: "Series B Investor Pitch",
        description: "Create the key metrics visualization for our funding round.",
        difficulty: 4,
        dataType: "trend_analysis",
        requirements: [" Investor grade", " Growth story", " Compelling narrative"],
        optimalChartTypes: ["line"],
        acceptableChartTypes: ["line", "area"],
        timeLimit: 150
    },
    {
        id: "board_presentation",
        name: "Board of Directors Report",
        description: "Prepare the annual performance visualization for the board.",
        difficulty: 4,
        dataType: "quarterly_sales",
        requirements: [" Board level", " Strategic insights", " Professional quality"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 150
    },
    {
        id: "strategic_planning",
        name: "5-Year Strategic Outlook",
        description: "Visualize our strategic roadmap for executive leadership.",
        difficulty: 4,
        dataType: "trend_analysis",
        requirements: [" Strategic clarity", " Long-term vision", " Executive quality"],
        optimalChartTypes: ["line", "area"],
        acceptableChartTypes: ["line", "area"],
        timeLimit: 150
    },

    // ===== MASSIVE DATA SCIENCE TASK EXPANSION =====
    // Entry Level Data Science Tasks (Difficulty 1)
    {
        id: "customer_churn_analysis",
        name: "Customer Churn Analysis",
        description: "Analyze customer churn rates by segment to identify at-risk customers.",
        difficulty: 1,
        dataType: "category_breakdown",
        requirements: [" Show churn rates", " Identify segments"],
        optimalChartTypes: ["bar", "pie"],
        acceptableChartTypes: ["bar", "pie", "doughnut"],
        timeLimit: 300
    },
    {
        id: "sales_by_region_basic",
        name: "Sales Performance by Region",
        description: "Compare sales across different geographic regions.",
        difficulty: 1,
        dataType: "product_comparison",
        requirements: [" Compare regions", " Show differences"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "pie"],
        timeLimit: 300
    },
    {
        id: "inventory_levels",
        name: "Inventory Level Monitoring",
        description: "Track current inventory levels across product categories.",
        difficulty: 1,
        dataType: "category_breakdown",
        requirements: [" Show inventory levels", " Compare categories"],
        optimalChartTypes: ["bar", "pie"],
        acceptableChartTypes: ["bar", "pie"],
        timeLimit: 300
    },
    {
        id: "user_acquisition",
        name: "User Acquisition Metrics",
        description: "Visualize new user signups over the past quarter.",
        difficulty: 1,
        dataType: "monthly_revenue",
        requirements: [" Show signup trends", " Highlight growth"],
        optimalChartTypes: ["line", "bar"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 300
    },
    {
        id: "conversion_rates",
        name: "Conversion Rate Analysis",
        description: "Analyze conversion rates across different marketing channels.",
        difficulty: 1,
        dataType: "product_comparison",
        requirements: [" Compare channels", " Show conversion rates"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "pie"],
        timeLimit: 300
    },
    {
        id: "daily_active_users",
        name: "Daily Active Users Dashboard",
        description: "Track daily active users over the past month.",
        difficulty: 1,
        dataType: "trend_analysis",
        requirements: [" Show daily trends", " Highlight patterns"],
        optimalChartTypes: ["line"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 300
    },
    {
        id: "product_categories",
        name: "Product Category Performance",
        description: "Compare sales performance across product categories.",
        difficulty: 1,
        dataType: "category_breakdown",
        requirements: [" Compare categories", " Show performance"],
        optimalChartTypes: ["pie", "bar"],
        acceptableChartTypes: ["pie", "doughnut", "bar"],
        timeLimit: 300
    },
    {
        id: "customer_segments",
        name: "Customer Segment Analysis",
        description: "Break down customer base by demographic segments.",
        difficulty: 1,
        dataType: "customer_demographics",
        requirements: [" Show segments", " Compare sizes"],
        optimalChartTypes: ["pie", "bar"],
        acceptableChartTypes: ["pie", "doughnut", "bar"],
        timeLimit: 300
    },
    {
        id: "weekly_revenue",
        name: "Weekly Revenue Report",
        description: "Track weekly revenue for the past quarter.",
        difficulty: 1,
        dataType: "trend_analysis",
        requirements: [" Show weekly trends", " Highlight changes"],
        optimalChartTypes: ["line", "bar"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 300
    },
    {
        id: "feature_usage",
        name: "Feature Usage Statistics",
        description: "Analyze which features users use most frequently.",
        difficulty: 1,
        dataType: "category_breakdown",
        requirements: [" Show usage rates", " Compare features"],
        optimalChartTypes: ["bar", "pie"],
        acceptableChartTypes: ["bar", "pie"],
        timeLimit: 300
    },

    // Mid-Level Data Science Tasks (Difficulty 2)
    {
        id: "predictive_churn",
        name: "Predictive Churn Model",
        description: "Build a model to predict which customers are likely to churn.",
        difficulty: 2,
        dataType: "performance_metrics",
        requirements: [" Show model performance", " Highlight risk factors"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 240
    },
    {
        id: "cohort_analysis",
        name: "Cohort Analysis",
        description: "Analyze customer cohorts to understand retention patterns.",
        difficulty: 2,
        dataType: "trend_analysis",
        requirements: [" Show cohort trends", " Identify patterns"],
        optimalChartTypes: ["line", "area"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 240
    },
    {
        id: "ab_test_analysis",
        name: "A/B Test Results",
        description: "Analyze results from A/B testing campaign effectiveness.",
        difficulty: 2,
        dataType: "product_comparison",
        requirements: [" Compare variants", " Show statistical significance"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 240
    },
    {
        id: "funnel_analysis",
        name: "Conversion Funnel Analysis",
        description: "Analyze the customer journey through conversion funnel stages.",
        difficulty: 2,
        dataType: "category_breakdown",
        requirements: [" Show funnel stages", " Identify drop-offs"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar"],
        timeLimit: 240
    },
    {
        id: "correlation_analysis",
        name: "Feature Correlation Analysis",
        description: "Identify correlations between product features and user engagement.",
        difficulty: 2,
        dataType: "performance_metrics",
        requirements: [" Show correlations", " Highlight relationships"],
        optimalChartTypes: ["radar", "bar"],
        acceptableChartTypes: ["radar", "bar"],
        timeLimit: 240
    },
    {
        id: "seasonality_analysis",
        name: "Seasonality Pattern Detection",
        description: "Identify seasonal patterns in sales data.",
        difficulty: 2,
        dataType: "trend_analysis",
        requirements: [" Show seasonal patterns", " Highlight cycles"],
        optimalChartTypes: ["line", "area"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 240
    },
    {
        id: "customer_lifetime_value",
        name: "Customer Lifetime Value Calculation",
        description: "Calculate and visualize customer lifetime value by segment.",
        difficulty: 2,
        dataType: "product_comparison",
        requirements: [" Show CLV by segment", " Compare segments"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 240
    },
    {
        id: "price_elasticity",
        name: "Price Elasticity Analysis",
        description: "Analyze how price changes affect demand across products.",
        difficulty: 2,
        dataType: "product_comparison",
        requirements: [" Show price sensitivity", " Compare products"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 240
    },
    {
        id: "market_segmentation",
        name: "Market Segmentation Analysis",
        description: "Segment market based on customer behavior and demographics.",
        difficulty: 2,
        dataType: "customer_demographics",
        requirements: [" Show segments", " Compare characteristics"],
        optimalChartTypes: ["pie", "bar", "radar"],
        acceptableChartTypes: ["pie", "bar", "radar"],
        timeLimit: 240
    },
    {
        id: "retention_analysis",
        name: "Customer Retention Analysis",
        description: "Analyze customer retention rates by acquisition channel.",
        difficulty: 2,
        dataType: "performance_metrics",
        requirements: [" Show retention rates", " Compare channels"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 240
    },
    {
        id: "engagement_metrics",
        name: "User Engagement Deep Dive",
        description: "Analyze detailed user engagement metrics across features.",
        difficulty: 2,
        dataType: "performance_metrics",
        requirements: [" Show engagement metrics", " Compare features"],
        optimalChartTypes: ["radar", "bar"],
        acceptableChartTypes: ["radar", "bar"],
        timeLimit: 240
    },
    {
        id: "revenue_forecast",
        name: "Revenue Forecasting",
        description: "Create a forecast for next quarter's revenue based on trends.",
        difficulty: 2,
        dataType: "trend_analysis",
        requirements: [" Show forecast", " Include historical data"],
        optimalChartTypes: ["line", "area"],
        acceptableChartTypes: ["line", "area"],
        timeLimit: 240
    },

    // Senior Level Data Science Tasks (Difficulty 3)
    {
        id: "ml_classification_model",
        name: "Customer Classification Model",
        description: "Build ML model to classify customers into high-value segments.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Show model accuracy", " Display feature importance"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 200
    },
    {
        id: "time_series_forecast",
        name: "Time Series Sales Forecast",
        description: "Build time series model to forecast future sales.",
        difficulty: 3,
        dataType: "trend_analysis",
        requirements: [" Show forecast", " Include confidence intervals"],
        optimalChartTypes: ["line", "area"],
        acceptableChartTypes: ["line", "area"],
        timeLimit: 200
    },
    {
        id: "clustering_analysis",
        name: "Customer Clustering Analysis",
        description: "Use clustering to identify distinct customer groups.",
        difficulty: 3,
        dataType: "customer_demographics",
        requirements: [" Show clusters", " Display characteristics"],
        optimalChartTypes: ["radar", "bar"],
        acceptableChartTypes: ["radar", "bar"],
        timeLimit: 200
    },
    {
        id: "recommendation_system",
        name: "Recommendation System Performance",
        description: "Analyze performance of product recommendation engine.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Show metrics", " Compare recommendations"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 200
    },
    {
        id: "anomaly_detection",
        name: "Anomaly Detection Analysis",
        description: "Identify anomalies in transaction data that might indicate fraud.",
        difficulty: 3,
        dataType: "trend_analysis",
        requirements: [" Show anomalies", " Highlight patterns"],
        optimalChartTypes: ["line", "scatter"],
        acceptableChartTypes: ["line", "scatter"],
        timeLimit: 200
    },
    {
        id: "multi_variate_analysis",
        name: "Multi-Variate Analysis",
        description: "Analyze relationships between multiple variables simultaneously.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Show relationships", " Display correlations"],
        optimalChartTypes: ["radar", "bar"],
        acceptableChartTypes: ["radar", "bar"],
        timeLimit: 200
    },
    {
        id: "nlp_sentiment_analysis",
        name: "Sentiment Analysis of Reviews",
        description: "Analyze customer sentiment from product reviews using NLP.",
        difficulty: 3,
        dataType: "product_comparison",
        requirements: [" Show sentiment scores", " Compare products"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 200
    },
    {
        id: "optimization_model",
        name: "Pricing Optimization Model",
        description: "Build optimization model to determine optimal pricing strategy.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Show optimal prices", " Display impact"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 200
    },
    {
        id: "survival_analysis",
        name: "Customer Survival Analysis",
        description: "Analyze customer retention using survival analysis techniques.",
        difficulty: 3,
        dataType: "trend_analysis",
        requirements: [" Show survival curves", " Identify factors"],
        optimalChartTypes: ["line"],
        acceptableChartTypes: ["line", "area"],
        timeLimit: 200
    },
    {
        id: "ensemble_model",
        name: "Ensemble Model Performance",
        description: "Build and evaluate ensemble model combining multiple algorithms.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Show model comparison", " Display ensemble performance"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 200
    },
    {
        id: "deep_learning_model",
        name: "Deep Learning Model Evaluation",
        description: "Evaluate performance of deep neural network model.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Show accuracy metrics", " Display learning curves"],
        optimalChartTypes: ["line", "bar"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 200
    },
    {
        id: "feature_engineering",
        name: "Feature Engineering Impact",
        description: "Analyze impact of feature engineering on model performance.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Compare feature sets", " Show improvements"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 200
    },

    // Expert Level Data Science Tasks (Difficulty 4)
    {
        id: "production_ml_system",
        name: "Production ML System Monitoring",
        description: "Monitor and analyze production ML system performance and drift.",
        difficulty: 4,
        dataType: "performance_metrics",
        requirements: [" Show system health", " Identify drift", " Executive quality"],
        optimalChartTypes: ["bar", "line", "radar"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 180
    },
    {
        id: "reinforcement_learning",
        name: "Reinforcement Learning Model",
        description: "Train and evaluate reinforcement learning model for optimization.",
        difficulty: 4,
        dataType: "performance_metrics",
        requirements: [" Show learning progress", " Display performance", " Research quality"],
        optimalChartTypes: ["line", "bar"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 180
    },
    {
        id: "causal_inference",
        name: "Causal Inference Analysis",
        description: "Perform causal inference to understand true cause-effect relationships.",
        difficulty: 4,
        dataType: "performance_metrics",
        requirements: [" Show causal effects", " Include confidence", " Publication quality"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar"],
        timeLimit: 180
    },
    {
        id: "graph_analytics",
        name: "Graph Network Analysis",
        description: "Analyze network graphs to identify influential nodes and communities.",
        difficulty: 4,
        dataType: "performance_metrics",
        requirements: [" Show network structure", " Identify patterns", " Advanced visualization"],
        optimalChartTypes: ["radar", "bar"],
        acceptableChartTypes: ["radar", "bar"],
        timeLimit: 180
    },
    {
        id: "automl_system",
        name: "AutoML System Evaluation",
        description: "Evaluate and compare AutoML system performance vs custom models.",
        difficulty: 4,
        dataType: "performance_metrics",
        requirements: [" Compare approaches", " Show trade-offs", " Executive summary"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 180
    },
    {
        id: "federated_learning",
        name: "Federated Learning System",
        description: "Design and evaluate federated learning system for distributed data.",
        difficulty: 4,
        dataType: "performance_metrics",
        requirements: [" Show distributed performance", " Privacy metrics", " Research quality"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 180
    },
    {
        id: "explainable_ai",
        name: "Explainable AI Analysis",
        description: "Implement and visualize explainable AI techniques for model interpretability.",
        difficulty: 4,
        dataType: "performance_metrics",
        requirements: [" Show explanations", " Display feature importance", " Stakeholder ready"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 180
    },
    {
        id: "real_time_ml",
        name: "Real-Time ML Pipeline",
        description: "Design and monitor real-time machine learning inference pipeline.",
        difficulty: 4,
        dataType: "performance_metrics",
        requirements: [" Show latency metrics", " Display throughput", " System health"],
        optimalChartTypes: ["line", "bar"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 180
    },
    {
        id: "transfer_learning",
        name: "Transfer Learning Evaluation",
        description: "Evaluate transfer learning approach for domain adaptation.",
        difficulty: 4,
        dataType: "performance_metrics",
        requirements: [" Show adaptation performance", " Compare domains", " Research quality"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar"],
        timeLimit: 180
    },
    {
        id: "mlops_dashboard",
        name: "MLOps Dashboard Design",
        description: "Create comprehensive MLOps dashboard for model lifecycle management.",
        difficulty: 4,
        dataType: "performance_metrics",
        requirements: [" Show full lifecycle", " Monitor all metrics", " Production ready"],
        optimalChartTypes: ["bar", "line", "radar"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 150
    }
];

