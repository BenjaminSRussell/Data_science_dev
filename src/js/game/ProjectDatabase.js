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
                name: 'Data Collection',
                description: 'Choose the right library to scrape Twitter.',
                options: [
                    { id: 'selenium', name: 'Selenium', result: 'slow', speedPenalty: 0.5 },
                    { id: 'tweepy', name: 'Tweepy (API)', result: 'optimal', speedBonus: 1.2 },
                    { id: 'bs4', name: 'BeautifulSoup', result: 'fail', error: 'Twitter uses dynamic JS. BS4 cannot read it.' }
                ],
                maxProgress: 100
            },
            {
                type: PROJECT_TYPES.CLEANING,
                name: 'Remove Bot Spam',
                description: 'Filter out tweets containing scam links.',
                challenge: {
                    question: "Which Regex pattern matches URLs?",
                    choices: [
                        { text: "r'http\\S+'", correct: true },
                        { text: "r'[a-z]+'", correct: false },
                        { text: "r'\\d{3}'", correct: false }
                    ]
                },
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
        reward: 2500,
        xpReward: { statistics: 40, python: 30 },
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
                challenge: {
                    question: "How to drop a column in Pandas?",
                    choices: [
                        { text: "df.drop('ssn', axis=1)", correct: true },
                        { text: "df.remove('ssn')", correct: false },
                        { text: "del df['ssn']", correct: false } // technically valid but drop is cleaner
                    ]
                },
                maxProgress: 150
            },
            {
                type: PROJECT_TYPES.MODELING,
                name: 'Train Risk Model',
                description: 'xgboost model for default probability.',
                maxProgress: 250
            }
        ]
    }
];
