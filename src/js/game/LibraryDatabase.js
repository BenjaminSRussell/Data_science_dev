/**
 * LibraryDatabase.js
 * Contains real-world technical libraries and frameworks the player can learn.
 */

export const LIBRARY_CONTENT = [
    {
        id: 'lib_soup',
        name: 'BeautifulSoup',
        category: 'scraping',
        description: 'A Python package for parsing HTML and XML documents.',
        realWorldUse: 'Used for extracting data from static web pages.',
        gameEffect: 'Scraping Speed +10% for Static Sites',
        cost: 100,
        reqLevel: 1
    },
    {
        id: 'lib_selenium',
        name: 'Selenium',
        category: 'scraping',
        description: 'A portable framework for testing web applications.',
        realWorldUse: 'Used for scraping dynamic, JavaScript-heavy websites.',
        gameEffect: 'Unlocks "Dynamic Scraper" Contracts',
        cost: 300,
        reqLevel: 2
    },
    {
        id: 'lib_pandas',
        name: 'Pandas',
        category: 'cleaning',
        description: 'Fast, flexible, and expressive data structures.',
        realWorldUse: 'The gold standard for data manipulation and analysis in Python.',
        gameEffect: 'Data Cleaning Efficiency +20%',
        cost: 200,
        reqLevel: 1
    },
    {
        id: 'lib_regex',
        name: 'RegEx (Regular Expressions)',
        category: 'cleaning',
        description: 'A sequence of characters that specifies a search pattern.',
        realWorldUse: 'Essential for pattern matching and string cleaning.',
        gameEffect: 'Reduces "Bug" chance in Cleaning Stage by 50%',
        cost: 150,
        reqLevel: 1
    },
    {
        id: 'lib_sklearn',
        name: 'Scikit-Learn',
        category: 'modeling',
        description: 'Simple and efficient tools for predictive data analysis.',
        realWorldUse: 'Standard library for classical machine learning algorithms.',
        gameEffect: 'Unlocks Basic ML Contracts (Regression, Classification)',
        cost: 400,
        reqLevel: 3
    },
    {
        id: 'lib_tensorflow',
        name: 'TensorFlow',
        category: 'ai',
        description: 'An end-to-end open source platform for machine learning.',
        realWorldUse: 'Used for building deep neural networks and complex AI models.',
        gameEffect: 'AI Companion Training Effectiveness +50%',
        cost: 1000,
        reqLevel: 5
    },
    {
        id: 'lib_pytorch',
        name: 'PyTorch',
        category: 'ai',
        description: 'An open source machine learning framework based on the Torch library.',
        realWorldUse: ' favored by researchers for its flexibility and dynamic computation graph.',
        gameEffect: 'AI Creativity +2',
        cost: 1200,
        reqLevel: 5
    }
];

export const CATEGORIES = {
    scraping: '🕷️ Scraping',
    cleaning: '🧹 Cleaning',
    modeling: '📊 Modeling',
    ai: '🧠 Deep Learning'
};
