/**
 * IDESystem.js
 * IDE for coding yourself to earn money
 */

export class IDESystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentProject = null;
        this.completedProjects = [];
        this.availableProjects = this.initializeProjects();
    }

    /**
     * Initialize coding projects
     */
    initializeProjects() {
        return [
            {
                id: 'simple_script',
                name: 'Simple Automation Script',
                description: 'Write a Python script to automate data entry',
                difficulty: 2,
                timeRequired: 4,
                basePay: 200,
                skills: ['intelligence'],
                language: 'python',
                codeTemplate: `def automate_data_entry():
    """
    Automate data entry process.
    Read input file, process data, and write output file.
    """
    # Your code here
    pass`,
                tests: [
                    { input: 'test_data.csv', expected: 'processed_data.csv' }
                ]
            },
            {
                id: 'data_cleaner',
                name: 'Data Cleaning Tool',
                description: 'Build a tool to clean messy datasets',
                difficulty: 4,
                timeRequired: 8,
                basePay: 500,
                skills: ['intelligence', 'analytics'],
                language: 'python',
                codeTemplate: `import pandas as pd

def clean_data(df):
    # Remove duplicates
    # Fix date formats
    # Handle missing values
    # Your code here
    return df`,
                tests: [
                    { input: 'messy_data.csv', expected: 'clean_data.csv' }
                ]
            },
            {
                id: 'web_scraper',
                name: 'Web Scraper',
                description: 'Scrape data from websites (ethically)',
                difficulty: 5,
                timeRequired: 10,
                basePay: 800,
                skills: ['intelligence'],
                language: 'python',
                codeTemplate: `import requests
from bs4 import BeautifulSoup

def scrape_website(url):
    # Your code here
    # Remember: respect robots.txt and rate limits
    pass`,
                tests: [
                    { input: 'https://example.com', expected: 'scraped_data.json' }
                ]
            },
            {
                id: 'api_integration',
                name: 'API Integration',
                description: 'Integrate with third-party APIs',
                difficulty: 6,
                timeRequired: 12,
                basePay: 1200,
                skills: ['intelligence', 'analytics'],
                language: 'python',
                codeTemplate: `import requests

def integrate_api(api_key):
    # Your code here
    # Handle authentication
    # Make API calls
    # Process responses
    pass`,
                tests: [
                    { input: 'api_key', expected: 'integrated_data.json' }
                ]
            },
            {
                id: 'ml_model',
                name: 'Machine Learning Model',
                description: 'Build a predictive ML model',
                difficulty: 9,
                timeRequired: 20,
                basePay: 2500,
                skills: ['intelligence', 'analytics'],
                language: 'python',
                codeTemplate: `from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

def build_model(X, y):
    # Split data
    # Train model
    # Evaluate performance
    # Your code here
    pass`,
                tests: [
                    { input: 'training_data.csv', expected: 'model_accuracy > 0.8' }
                ]
            },
            {
                id: 'dashboard',
                name: 'Data Dashboard',
                description: 'Create an interactive data visualization dashboard',
                difficulty: 7,
                timeRequired: 16,
                basePay: 1800,
                skills: ['intelligence', 'analytics'],
                language: 'javascript',
                codeTemplate: `// Create interactive dashboard
function createDashboard(data) {
    // Use Chart.js or D3.js
    // Your code here
}`,
                tests: [
                    { input: 'data.json', expected: 'dashboard.html' }
                ]
            }
        ];
    }

    /**
     * Start a coding project
     */
    startProject(projectId) {
        const project = this.availableProjects.find(p => p.id === projectId);
        if (!project) {
            return { success: false, message: 'Project not found.' };
        }

        // Check if player has required skills
        const intelligence = this.gameState.characterStats?.getStat('intelligence') || 0;
        if (intelligence < project.difficulty * 10) {
            return { 
                success: false, 
                message: `You need more intelligence (${project.difficulty * 10} required).` 
            };
        }

        this.currentProject = {
            ...project,
            startTime: Date.now(),
            code: project.codeTemplate,
            status: 'in_progress'
        };

        return {
            success: true,
            project: this.currentProject,
            message: `Started ${project.name}. Time to code!`
        };
    }

    /**
     * Submit code for project
     */
    submitCode(code) {
        if (!this.currentProject) {
            return { success: false, message: 'No active project.' };
        }

        const project = this.currentProject;
        
        // Simple validation (in real game, would have actual code execution)
        const quality = this.evaluateCode(code, project);
        
        // Calculate pay based on quality
        const pay = Math.floor(project.basePay * quality);
        this.gameState.money += pay;

        // XP rewards
        if (project.skills) {
            project.skills?.forEach(skill => {
                const xp = project.difficulty * 10 * quality;
                this.gameState.characterStats?.addExperience(skill, Math.floor(xp));
            });
        }

        // Complete project
        this.completedProjects.push({
            projectId: project.id,
            completedAt: Date.now(),
            quality,
            pay
        });

        this.currentProject = null;

        return {
            success: true,
            quality,
            pay,
            message: quality > 0.8 
                ? `Excellent work! You earned $${pay.toLocaleString()}.`
                : quality > 0.5
                ? `Good job! You earned $${pay.toLocaleString()}.`
                : `It works, but could be better. You earned $${pay.toLocaleString()}.`
        };
    }

    /**
     * Evaluate code quality (simplified)
     */
    evaluateCode(code, project) {
        let quality = 0.3; // Base quality

        // Substantive check: the template's stub region ("# Your code here"
        // and the bare "pass" placeholder) must be replaced with real code.
        // A raw string-inequality check is defeated by a single-character edit.
        const templateLines = project.codeTemplate.split('\n');
        const codeLines = code.split('\n');
        const stubLineCount = templateLines.filter(
            line => line.trim() === 'pass' || line.trim().startsWith('# Your code here')
        ).length;
        const remainingStubLines = codeLines.filter(
            line => line.trim() === 'pass' || line.trim().startsWith('# Your code here')
        ).length;
        const stubReplaced = stubLineCount > 0
            ? remainingStubLines < stubLineCount
            : code !== project.codeTemplate;

        if (stubReplaced) {
            quality += 0.3;
        }

        // Check code length (more code = more effort)
        const codeLength = codeLines.length;
        const templateLength = templateLines.length;
        if (codeLength > templateLength * 1.5) {
            quality += 0.1;
        }

        // Check for common patterns, but only award credit for keywords the
        // player added beyond what the template already contained.
        const countOccurrences = (text, needle) =>
            text.split(needle).length - 1;

        const functionKeywords = ['def ', 'function '];
        const importKeywords = ['import ', 'require('];

        const addedFunctions = functionKeywords.reduce(
            (sum, kw) => sum + Math.max(0, countOccurrences(code, kw) - countOccurrences(project.codeTemplate, kw)),
            0
        );
        const addedImports = importKeywords.reduce(
            (sum, kw) => sum + Math.max(0, countOccurrences(code, kw) - countOccurrences(project.codeTemplate, kw)),
            0
        );

        if (addedFunctions > 0) {
            quality += 0.1;
        }
        if (addedImports > 0) {
            quality += 0.1;
        }

        // Random factor (simulating code quality assessment)
        quality += (Math.random() - 0.5) * 0.2;

        return Math.max(0.3, Math.min(1.0, quality));
    }

    /**
     * Get available projects based on skills
     */
    getAvailableProjects() {
        const intelligence = this.gameState.characterStats?.getStat('intelligence') || 0;
        
        return this.availableProjects.filter(project => {
            return intelligence >= project.difficulty * 10;
        });
    }

    /**
     * Get current project
     */
    getCurrentProject() {
        return this.currentProject;
    }

    /**
     * Cancel current project
     */
    cancelProject() {
        if (!this.currentProject) {
            return { success: false, message: 'No active project.' };
        }

        this.currentProject = null;
        return { success: true, message: 'Project cancelled.' };
    }
}





