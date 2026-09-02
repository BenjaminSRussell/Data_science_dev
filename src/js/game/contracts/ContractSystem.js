// ... [Existing code before getContractTemplates()]

getContractTemplates(category) {
    const templates = {
        DATA_ENTRY: [
            {
                title: 'Customer Database Entry',
                description: 'Enter customer data into the database.',
                timeRequired: 1,
                difficulty: 1,
                deliverables: ['Database entries'],
                requiredStats: { intelligence: 25, attentionToDetail: 30 },
                chartType: null,
                bonusConditions: []
            }
        ],
        VISUALIZATION: [
            {
                title: 'Quarterly Sales Report',
                description: 'Create a chart showing our quarterly sales performance.',
                timeRequired: 5,
                difficulty: 2,
                deliverables: ['Sales report chart'],
                requiredStats: { intelligence: 35, creativity: 40 },
                chartType: ['Bar', 'Line'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Visualization', value: 30 },
                    { type: 'reputation_threshold', value: 2000 }
                ]
            },
            {
                title: 'Executive Dashboard',
                description: 'Design an executive dashboard with key performance indicators.',
                timeRequired: 8,
                difficulty: 3,
                deliverables: ['Dashboard'],
                requiredStats: { intelligence: 45, creativity: 50 },
                chartType: ['Pie', 'Heatmap'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Visualization', value: 40 },
                    { type: 'reputation_threshold', value: 4000 }
                ]
            },
            {
                title: 'Market Share Analysis',
                description: 'Analyze and visualize our market share against competitors.',
                timeRequired: 12,
                difficulty: 4,
                deliverables: ['Market share chart'],
                requiredStats: { intelligence: 55, creativity: 60 },
                chartType: ['Radar', 'Bubble'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Visualization', value: 50 },
                    { type: 'reputation_threshold', value: 6000 }
                ]
            }
        ],
        DATA_ANALYSIS: [
            {
                title: 'Sales Trend Analysis',
                description: 'Analyze sales trends and identify patterns.',
                timeRequired: 6,
                difficulty: 2,
                deliverables: ['Trend analysis report'],
                requiredStats: { intelligence: 35, analyticalThinking: 40 },
                chartType: ['Line', 'Scatter'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Data Analysis', value: 30 },
                    { type: 'reputation_threshold', value: 2000 }
                ]
            },
            {
                title: 'Customer Segmentation',
                description: 'Segment customers based on their behavior and preferences.',
                timeRequired: 10,
                difficulty: 3,
                deliverables: ['Customer segments report'],
                requiredStats: { intelligence: 45, analyticalThinking: 50 },
                chartType: ['Cluster', 'Heatmap'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Data Analysis', value: 40 },
                    { type: 'reputation_threshold', value: 4000 }
                ]
            },
            {
                title: 'Market Basket Analysis',
                description: 'Analyze which products are often purchased together.',
                timeRequired: 14,
                difficulty: 4,
                deliverables: ['Basket analysis report'],
                requiredStats: { intelligence: 55, analyticalThinking: 60 },
                chartType: ['Matrix', 'Network'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Data Analysis', value: 50 },
                    { type: 'reputation_threshold', value: 6000 }
                ]
            }
        ],
        REPORTING: [
            {
                title: 'Monthly Performance Report',
                description: 'Generate a detailed monthly performance report.',
                timeRequired: 7,
                difficulty: 2,
                deliverables: ['Performance report'],
                requiredStats: { intelligence: 35, writingSkills: 40 },
                chartType: ['Table', 'Bar'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Reporting', value: 30 },
                    { type: 'reputation_threshold', value: 2000 }
                ]
            },
            {
                title: 'Quarterly Business Review',
                description: 'Prepare a comprehensive quarterly business review.',
                timeRequired: 11,
                difficulty: 3,
                deliverables: ['Business review'],
                requiredStats: { intelligence: 45, writingSkills: 50 },
                chartType: ['Summary', 'Line'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Reporting', value: 40 },
                    { type: 'reputation_threshold', value: 4000 }
                ]
            },
            {
                title: 'Year-End Summary',
                description: 'Compile a year-end summary report for stakeholders.',
                timeRequired: 15,
                difficulty: 4,
                deliverables: ['Year-end summary'],
                requiredStats: { intelligence: 55, writingSkills: 60 },
                chartType: ['Summary', 'Timeline'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Reporting', value: 50 },
                    { type: 'reputation_threshold', value: 6000 }
                ]
            }
        ],
        STATISTICAL_MODELING: [
            {
                title: 'Sales Forecasting Model',
                description: 'Build a statistical model to predict future sales.',
                timeRequired: 9,
                difficulty: 2,
                deliverables: ['Forecasting model'],
                requiredStats: { intelligence: 35, statisticalSkills: 40 },
                chartType: ['Line', 'Scatter'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Statistical Modeling', value: 30 },
                    { type: 'reputation_threshold', value: 2000 }
                ]
            },
            {
                title: 'Customer Lifetime Value Analysis',
                description: 'Analyze the lifetime value of each customer.',
                timeRequired: 13,
                difficulty: 3,
                deliverables: ['Lifetime value analysis'],
                requiredStats: { intelligence: 45, statisticalSkills: 50 },
                chartType: ['Table', 'Bar'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Statistical Modeling', value: 40 },
                    { type: 'reputation_threshold', value: 4000 }
                ]
            },
            {
                title: 'Anomaly Detection',
                description: 'Identify anomalies in the data for further investigation.',
                timeRequired: 17,
                difficulty: 4,
                deliverables: ['Anomaly detection report'],
                requiredStats: { intelligence: 55, statisticalSkills: 60 },
                chartType: ['Heatmap', 'Scatter'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Statistical Modeling', value: 50 },
                    { type: 'reputation_threshold', value: 6000 }
                ]
            }
        ],
        MACHINE_LEARNING: [
            {
                title: 'Churn Prediction Model',
                description: 'Build a machine learning model to predict customer churn.',
                timeRequired: 10,
                difficulty: 3,
                deliverables: ['Churn prediction model'],
                requiredStats: { intelligence: 45, machineLearning: 50 },
                chartType: ['Bar', 'Radar'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Machine Learning', value: 40 },
                    { type: 'reputation_threshold', value: 4000 }
                ]
            },
            {
                title: 'Fraud Detection System',
                description: 'Develop a machine learning system to detect fraudulent transactions.',
                timeRequired: 14,
                difficulty: 4,
                deliverables: ['Fraud detection system'],
                requiredStats: { intelligence: 55, machineLearning: 60 },
                chartType: ['Heatmap', 'Network'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Machine Learning', value: 50 },
                    { type: 'reputation_threshold', value: 6000 }
                ]
            }
        ],
        PREDICTIVE_ANALYTICS: [
            {
                title: 'Sales Trend Forecast',
                description: 'Forecast future sales trends using predictive analytics.',
                timeRequired: 11,
                difficulty: 3,
                deliverables: ['Trend forecast report'],
                requiredStats: { intelligence: 45, predictiveAnalytics: 50 },
                chartType: ['Line', 'Scatter'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Predictive Analytics', value: 40 },
                    { type: 'reputation_threshold', value: 4000 }
                ]
            },
            {
                title: 'Supply Chain Optimization',
                description: 'Optimize the supply chain using predictive analytics.',
                timeRequired: 15,
                difficulty: 4,
                deliverables: ['Supply chain optimization report'],
                requiredStats: { intelligence: 55, predictiveAnalytics: 60 },
                chartType: ['Network', 'Heatmap'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Predictive Analytics', value: 50 },
                    { type: 'reputation_threshold', value: 6000 }
                ]
            }
        ],
        BUSINESS_INTELLIGENCE: [
            {
                title: 'Competitor Analysis',
                description: 'Analyze competitors and identify strengths and weaknesses.',
                timeRequired: 8,
                difficulty: 3,
                deliverables: ['Competitor analysis report'],
                requiredStats: { intelligence: 45, businessInsight: 50 },
                chartType: ['Summary', 'Table'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Business Intelligence', value: 40 },
                    { type: 'reputation_threshold', value: 4000 }
                ]
            },
            {
                title: 'Market Positioning Analysis',
                description: 'Analyze our market position and identify opportunities.',
                timeRequired: 12,
                difficulty: 4,
                deliverables: ['Market positioning report'],
                requiredStats: { intelligence: 55, businessInsight: 60 },
                chartType: ['Network', 'Heatmap'],
                bonusConditions: [
                    { type: 'perfect_quality', achieved: false },
                    { type: 'skill_requirement', skill: 'Business Intelligence', value: 50 },
                    { type: 'reputation_threshold', value: 6000 }
                ]
            }
        ]
    };

    return templates[category] || [];
}

// ... [Existing code after getContractTemplates()]