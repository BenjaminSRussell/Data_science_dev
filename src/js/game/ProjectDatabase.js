/**
 * ProjectDatabase.js
 * Definitions for all multi-stage contracts and projects.
 */

export const PROJECT_TYPES = {
    SCRAPING: 'scraping',
    CLEANING: 'cleaning',
    MODELING: 'modeling',
    GAME_DEV: 'game_dev'
};

export const CONTRACTS = [
    {
        id: 'crypto_scraper',
        client: 'Mike Johnson',
        title: 'Crypto Twitter Scraper',
        description: 'I need a feed of all tweets mentioning $BTC for my trading bot.',
        difficulty: 1,
        reward: 800,
        xpReward: { python: 50, data_engineering: 20 },
        stages: [
            {
                type: PROJECT_TYPES.SCRAPING,
                // JS-rendered page: BeautifulSoup's static-site bonus does not apply (#2418)
                site: 'dynamic',
                name: 'Data Collection',
                description: 'Collect tweets mentioning $BTC.',
                maxProgress: 100
            },
            {
                type: PROJECT_TYPES.CLEANING,
                name: 'Remove Bot Spam',
                description: 'Filter out tweets containing scam links.',
                maxProgress: 100
            }
        ]
    },
    {
        id: 'fashion_trends',
        client: 'Bella Lux',
        title: 'Fashion Trend Predictor',
        description: 'Tell me what colors will be hot next season based on Instagram data.',
        difficulty: 2,
        // Gated (rep 200 + GPU) and the longest grind, so it has to out-earn
        // the ungated, ethics-costing loan_risk_model on XP and stay close on
        // cash; at 2500 / 70 XP it was worse on every axis (#2172)
        reward: 3800,
        xpReward: { statistics: 60, python: 55 },
        requirements: { stat: 'reputation', value: 200 },
        stages: [
            {
                type: PROJECT_TYPES.CLEANING,
                name: 'Image Pre-processing',
                description: 'Resize and normalize 50GB of images.',
                maxProgress: 200 // Long task
            },
            {
                type: PROJECT_TYPES.MODELING,
                name: 'Train CNN Model',
                description: 'Train a Convolutional Neural Network.',
                hardwareReq: 'gpu_basic', // Requires GPU
                maxProgress: 300
            }
        ]
    },
    {
        id: 'loan_risk_model',
        client: 'Vinnie "The Shark"',
        title: 'Risk Assessor 2.0',
        description: 'Auto-approve loans for people who definitely... pay back.',
        difficulty: 3,
        reward: 5000,
        ethics: -20, // Illegal-ish
        xpReward: { statistics: 100 },
        stages: [
            {
                type: PROJECT_TYPES.CLEANING,
                name: 'Sanitize Data',
                description: 'Remove PII (Personally Identifiable Information) to stay "legal".',
                maxProgress: 150
            },
            {
                type: PROJECT_TYPES.MODELING,
                name: 'Train Risk Model',
                description: 'xgboost model for default probability.',
                maxProgress: 250
            }
        ]
    },
    {
        id: 'static_catalog_scraper',
        client: 'Luna Books',
        title: 'Static Catalog Scraper',
        description: 'Pull titles and prices from a plain HTML catalog.',
        difficulty: 1,
        reward: 500,
        xpReward: { python: 30, data_engineering: 15 },
        stages: [
            {
                type: PROJECT_TYPES.SCRAPING,
                site: 'static',
                name: 'Scrape Catalog Pages',
                description: 'Walk static HTML. BeautifulSoup is built for this.',
                maxProgress: 100
            }
        ]
    },
    {
        id: 'dynamic_storefront_scraper',
        client: 'Casey Lee',
        title: 'Dynamic Scraper Contract',
        description: 'The storefront is rendered by JavaScript. A static parser cannot see the products.',
        difficulty: 2,
        reward: 1200,
        xpReward: { python: 40, data_engineering: 30 },
        requiresLibrary: 'lib_selenium',
        stages: [
            {
                type: PROJECT_TYPES.SCRAPING,
                site: 'dynamic',
                name: 'Drive the Dynamic Page',
                description: 'Selenium loads the JavaScript storefront and collects the rows.',
                maxProgress: 140
            },
            {
                type: PROJECT_TYPES.CLEANING,
                name: 'Normalize Product Rows',
                description: 'Clean prices and drop empty listings.',
                maxProgress: 80
            }
        ]
    },
    {
        id: 'basic_regression_contract',
        client: 'Analytics Pro',
        title: 'Basic Regression Contract',
        description: 'Fit a regression on a tabular sales history.',
        difficulty: 2,
        reward: 1500,
        xpReward: { statistics: 40, machine_learning: 20 },
        requiresLibrary: 'lib_sklearn',
        stages: [
            {
                type: PROJECT_TYPES.CLEANING,
                name: 'Prepare Features',
                description: 'Clean the training table before the fit.',
                maxProgress: 80
            },
            {
                type: PROJECT_TYPES.MODELING,
                name: 'Fit Regression',
                description: 'Train a linear regression.',
                maxProgress: 120
            }
        ]
    },
    {
        id: 'basic_classification_contract',
        client: 'Insight Systems',
        title: 'Basic Classification Contract',
        description: 'Classify customers into churn and stay.',
        difficulty: 2,
        reward: 1600,
        xpReward: { statistics: 25, machine_learning: 30 },
        requiresLibrary: 'lib_sklearn',
        stages: [
            {
                type: PROJECT_TYPES.CLEANING,
                name: 'Label Cleanup',
                description: 'Fix mislabeled rows.',
                maxProgress: 90
            },
            {
                type: PROJECT_TYPES.MODELING,
                name: 'Train Classifier',
                description: 'Train a basic classifier.',
                maxProgress: 120
            }
        ]
    },
    {
        id: 'data_toy_prototype',
        client: 'Sam Taylor',
        title: 'Data Toy Prototype',
        description: 'A small playful visual. Your AI companion\'s creativity carries this one.',
        difficulty: 1,
        reward: 400,
        xpReward: { python: 60 },
        stages: [
            {
                type: PROJECT_TYPES.GAME_DEV,
                creative: true,
                name: 'Sketch the Toy',
                description: 'Prototype a tiny interactive data toy.',
                maxProgress: 120
            }
        ]
    }
];
