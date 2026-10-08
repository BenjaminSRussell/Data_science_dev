/**
 * IDESystem.js
 * IDE for coding yourself to earn money
 */

import { pickState, applyState } from '../utils/StateSerializer.js';

/** Intelligence needed per point of project difficulty (#1738) */
export const INTELLIGENCE_PER_DIFFICULTY = 10;
/** Days before the same project can be taken again (#1736, #1978) */
export const PROJECT_COOLDOWN_DAYS = 7;
/** Quality for submitting the starter template unchanged */
export const MIN_QUALITY = 0.3;

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
                difficulty: 1, // fresh characters start at intelligence 10 (#1395)
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
            },
            {
                id: 'data_cleaner',
                name: 'Data Cleaning Tool',
                description: 'Build a tool to clean messy datasets',
                difficulty: 4,
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
            },
            {
                id: 'web_scraper',
                name: 'Web Scraper',
                description: 'Scrape data from websites (ethically)',
                difficulty: 5,
                basePay: 800,
                skills: ['intelligence'],
                language: 'python',
                codeTemplate: `import requests
from bs4 import BeautifulSoup

def scrape_website(url):
    # Your code here
    # Remember: respect robots.txt and rate limits
    pass`,
            },
            {
                id: 'api_integration',
                name: 'API Integration',
                description: 'Integrate with third-party APIs',
                difficulty: 6,
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
            },
            {
                id: 'ml_model',
                name: 'Machine Learning Model',
                description: 'Build a predictive ML model',
                difficulty: 9,
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
            },
            {
                id: 'dashboard',
                name: 'Data Dashboard',
                description: 'Create an interactive data visualization dashboard',
                difficulty: 7,
                basePay: 1800,
                skills: ['intelligence', 'analytics'],
                language: 'javascript',
                codeTemplate: `// Create interactive dashboard
function createDashboard(data) {
    // Use Chart.js or D3.js
    // Your code here
}`,
            }
        ];
    }

    /**
     * Start a coding project
     */
    getRequiredIntelligence(project) {
        return (project?.difficulty || 0) * INTELLIGENCE_PER_DIFFICULTY;
    }

    getToday() {
        return this.gameState.timeManager?.totalDays || 1;
    }

    /**
     * Days left before a project can be repeated (0 = available)
     */
    getCooldownRemaining(projectId) {
        const last = [...this.completedProjects].reverse().find(c => c.projectId === projectId);
        if (!last || !Number.isFinite(last.day)) return 0;
        return Math.max(0, last.day + PROJECT_COOLDOWN_DAYS - this.getToday());
    }

    startProject(projectId) {
        const project = this.availableProjects.find(p => p.id === projectId);
        if (!project) {
            return { success: false, message: 'Project not found.' };
        }

        // One project at a time (#217, #1735)
        if (this.currentProject) {
            return { success: false, message: `Finish or cancel ${this.currentProject.name} first.` };
        }

        // Check if player has required skills
        const intelligence = this.gameState.characterStats?.getStat('intelligence') || 0;
        const required = this.getRequiredIntelligence(project);
        if (intelligence < required) {
            return { 
                success: false, 
                message: `You need more intelligence (${required} required).` 
            };
        }

        const cooldown = this.getCooldownRemaining(projectId);
        if (cooldown > 0) {
            return { success: false, message: `The client doesn't need another ${project.name} yet (${cooldown} day${cooldown === 1 ? '' : 's'}).` };
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

        // Guard against non-string or blank submissions (#1393, #1979, #1977)
        if (typeof code !== 'string' || code.trim() === '') {
            return { success: false, message: 'Write some code before submitting.' };
        }

        const project = this.currentProject;
        
        // Simple validation (in real game, would have actual code execution)
        const quality = this.evaluateCode(code, project);
        
        // Calculate pay based on quality
        const pay = Math.floor(project.basePay * quality);
        this.gameState.money = (Number(this.gameState.money) || 0) + pay;

        // XP rewards
        // The XP pool is split across the project's skills so multi-skill
        // projects don't pay double (#1737)
        if (Array.isArray(project.skills) && project.skills.length > 0) {
            const xpPerSkill = Math.floor(project.difficulty * 10 * quality / project.skills.length);
            project.skills.forEach(skill => {
                this.gameState.characterStats?.addExperience(skill, xpPerSkill);
            });
        }

        // Complete project
        this.completedProjects.push({
            projectId: project.id,
            completedAt: Date.now(),
            day: this.getToday(),
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
        code = typeof code === 'string' ? code : '';
        const template = project.codeTemplate || '';
        let quality = 0.5; // Base quality

        // Submitting the untouched template earns the minimum: the pattern
        // bonuses below would otherwise reward def/import lines the template
        // already contains
        if (code.trim() === '') {
            return 0;
        }
        if (code.trim() === template.trim()) {
            return MIN_QUALITY;
        }
        quality += 0.2;

        // Check code length (more code = more effort)
        const codeLength = code.split('\n').length;
        const templateLength = template.split('\n').length;
        if (codeLength > templateLength * 1.5) {
            quality += 0.1;
        }

        // Check for common patterns (simplified)
        if (code.includes('def ') || code.includes('function ')) {
            quality += 0.1;
        }
        if (code.includes('import ') || code.includes('require(')) {
            quality += 0.1;
        }

        // Random factor (simulating code quality assessment)
        quality += (Math.random() - 0.5) * 0.2;

        // Modified code scores 0.6-1.0; MIN_QUALITY is reserved for the
        // untouched template above, so only the upper bound needs clamping (#1392)
        return Math.min(1.0, quality);
    }

    /**
     * Get available projects based on skills
     */
    getAvailableProjects() {
        const intelligence = this.gameState.characterStats?.getStat('intelligence') || 0;
        
        return this.availableProjects.filter(project => {
            return intelligence >= this.getRequiredIntelligence(project);
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

    /**
     * Serialize player-visible state for saving
     */
    toJSON() {
        return pickState(this, ['currentProject', 'completedProjects']);
    }

    /**
     * Restore state from a save (missing fields keep constructor defaults)
     */
    fromJSON(data) {
        if (!data) return;
        applyState(this, data, ['currentProject', 'completedProjects']);
    }
}
