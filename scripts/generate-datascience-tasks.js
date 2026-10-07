const fs = require('fs');
const path = require('path');

const TASK_TEMPLATES = {
    finance: {
        difficulty1: [
            {
                title: 'Analyze Stock Market Trends',
                description: 'Identify patterns in stock market data over the past year.',
                datasets: ['historical stock prices'],
                tools: ['Excel', 'Python'],
                deliverable: 'A report with visualizations.',
                duration: '1 week'
            }
        ],
        difficulty2: [
            {
                title: 'Credit Risk Assessment',
                description: 'Develop a model to predict credit risk based on customer data.',
                datasets: ['customer financial data', 'loan records'],
                tools: ['R', 'SQL'],
                deliverable: 'A predictive model and a presentation.',
                duration: '2 weeks'
            }
        ],
        difficulty3: [
            {
                title: 'Algorithmic Trading',
                description: 'Create an algorithm to trade stocks based on real-time market data.',
                datasets: ['real-time stock quotes'],
                tools: ['Python', 'APIs'],
                deliverable: 'A trading strategy and a backtest report.',
                duration: '3 weeks'
            }
        ],
        difficulty4: [
            {
                title: 'High-Frequency Trading System',
                description: 'Design a system for high-frequency trading in the stock market.',
                datasets: ['market depth data', 'trade history'],
                tools: ['C++', 'QuantLib'],
                deliverable: 'A trading system and a performance analysis.',
                duration: '4 weeks'
            }
        ]
    },
    healthcare: {
        difficulty1: [
            {
                title: 'Disease Outbreak Detection',
                description: 'Detect outbreaks of infectious diseases from patient records.',
                datasets: ['hospital admission records'],
                tools: ['Excel', 'Python'],
                deliverable: 'A report with visualizations.',
                duration: '1 week'
            }
        ],
        difficulty2: [
            {
                title: 'Patient Readmission Prediction',
                description: 'Develop a model to predict patient readmissions based on medical records.',
                datasets: ['patient records', 'readmission data'],
                tools: ['R', 'SQL'],
                deliverable: 'A predictive model and a presentation.',
                duration: '2 weeks'
            }
        ],
        difficulty3: [
            {
                title: 'Genetic Disease Analysis',
                description: 'Analyze genetic data to identify disease markers.',
                datasets: ['genetic sequences'],
                tools: ['Python', 'Bioinformatics tools'],
                deliverable: 'A research paper and a presentation.',
                duration: '3 weeks'
            }
        ],
        difficulty4: [
            {
                title: 'Personalized Medicine',
                description: 'Develop a system for personalized treatment plans based on genetic data.',
                datasets: ['genetic data', 'treatment outcomes'],
                tools: ['C++', 'Machine Learning libraries'],
                deliverable: 'A treatment recommendation system and a performance analysis.',
                duration: '4 weeks'
            }
        ]
    },
    ecommerce: {
        difficulty1: [
            {
                title: 'Customer Segmentation',
                description: 'Segment customers based on their purchase history.',
                datasets: ['purchase records'],
                tools: ['Excel', 'Python'],
                deliverable: 'A report with visualizations.',
                duration: '1 week'
            }
        ],
        difficulty2: [
            {
                title: 'Recommendation System',
                description: 'Develop a recommendation system to suggest products to customers.',
                datasets: ['product data', 'customer interactions'],
                tools: ['R', 'SQL'],
                deliverable: 'A recommendation system and a presentation.',
                duration: '2 weeks'
            }
        ],
        difficulty3: [
            {
                title: 'Price Optimization',
                description: 'Optimize product prices based on demand and competition.',
                datasets: ['sales data', 'competitor pricing'],
                tools: ['Python', 'APIs'],
                deliverable: 'A pricing strategy and a performance analysis.',
                duration: '3 weeks'
            }
        ],
        difficulty4: [
            {
                title: 'Inventory Management System',
                description: 'Design a system for automated inventory management in warehouses.',
                datasets: ['inventory data', 'sales forecasts'],
                tools: ['C++', 'Inventory Management tools'],
                deliverable: 'An inventory management system and a performance analysis.',
                duration: '4 weeks'
            }
        ]
    },
    energy: {
        difficulty1: [
            {
                title: 'Grid Load Forecasting',
                description: 'Forecast electricity demand for the next day.',
                datasets: ['historical load data'],
                tools: ['Excel', 'Python'],
                deliverable: 'A report with visualizations.',
                duration: '1 week'
            }
        ],
        difficulty2: [
            {
                title: 'Renewable Output Analysis',
                description: 'Analyze the output of renewable energy sources like solar and wind.',
                datasets: ['solar/wind data', 'weather data'],
                tools: ['R', 'SQL'],
                deliverable: 'A report with visualizations.',
                duration: '2 weeks'
            }
        ],
        difficulty3: [
            {
                title: 'Energy Consumption Anomaly Detection',
                description: 'Detect anomalies in energy consumption patterns.',
                datasets: ['energy consumption data'],
                tools: ['Python', 'Anomaly Detection libraries'],
                deliverable: 'A detection system and a presentation.',
                duration: '3 weeks'
            }
        ],
        difficulty4: [
            {
                title: 'Equipment Failure Prediction',
                description: 'Develop a model to predict equipment failures based on sensor data.',
                datasets: ['sensor data', 'failure records'],
                tools: ['C++', 'Machine Learning libraries'],
                deliverable: 'A predictive model and a performance analysis.',
                duration: '4 weeks'
            }
        ]
    }
};

const DATA_DIRECTORY = path.join(__dirname, '../src/js/data');

function generateTasks() {
    let tasks = [];

    for (const domain of Object.keys(TASK_TEMPLATES)) {
        for (const difficulty of Object.keys(TASK_TEMPLATES[domain])) {
            for (const template of TASK_TEMPLATES[domain][difficulty]) {
                const task = {
                    domain: domain,
                    difficulty: difficulty,
                    title: template.title,
                    description: template.description,
                    datasets: template.datasets,
                    tools: template.tools,
                    deliverable: template.deliverable,
                    duration: template.duration
                };
                tasks.push(task);
            }
        }
    }

    return tasks;
}

function writeTasksToFile(tasks) {
    const outputFilePath = path.join(DATA_DIRECTORY, 'comprehensive_datascience_tasks.js');
    const outputContent = `const comprehensiveDataScienceTasks = ${JSON.stringify(tasks, null, 2)};`;

    fs.writeFileSync(outputFilePath, outputContent);
    console.log(`Tasks generated successfully and written to ${outputFilePath}`);
}

const tasks = generateTasks();
writeTasksToFile(tasks);