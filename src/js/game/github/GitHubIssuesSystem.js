/**
 * GitHubIssuesSystem.js
 * GitHub issues system from data science perspective
 * Real-world issues and pull requests
 */

export class GitHubIssuesSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.openIssues = [];
        this.closedIssues = [];
        this.pullRequests = [];
        this.repositories = this.initializeRepositories();
        this.generateInitialIssues();
    }
    
    /**
     * Initialize repositories
     */
    initializeRepositories() {
        return [
            {
                id: 'data_pipeline',
                name: 'data-pipeline',
                owner: 'company',
                description: 'ETL pipeline for data processing',
                stars: 42,
                issues: 8,
                pullRequests: 3
            },
            {
                id: 'ml_models',
                name: 'ml-models',
                owner: 'company',
                description: 'Machine learning model library',
                stars: 128,
                issues: 15,
                pullRequests: 7
            },
            {
                id: 'data_analysis',
                name: 'data-analysis-tools',
                owner: 'company',
                description: 'Tools for data analysis and visualization',
                stars: 89,
                issues: 12,
                pullRequests: 5
            }
        ];
    }
    
    /**
     * Generate initial GitHub issues
     */
    generateInitialIssues() {
        this.openIssues = [
            {
                id: 'issue_1',
                number: 42,
                title: ' Data processing fails on null values',
                body: 'When processing data with null values, the pipeline crashes with a KeyError. Need to handle missing data gracefully.',
                labels: ['bug', 'high-priority', 'data-pipeline'],
                assignee: null,
                repository: 'data_pipeline',
                createdAt: Date.now() - 86400000, // 1 day ago
                difficulty: 'medium',
                skills: ['python', 'pandas', 'data_cleaning'],
                reward: { money: 400, reputation: 20 }
            },
            {
                id: 'issue_2',
                number: 43,
                title: ' Add data validation pipeline',
                body: 'Implement comprehensive data validation to catch errors early in the pipeline. Should include schema validation, type checking, and range validation.',
                labels: ['enhancement', 'feature', 'data-pipeline'],
                assignee: null,
                repository: 'data_pipeline',
                createdAt: Date.now() - 172800000, // 2 days ago
                difficulty: 'hard',
                skills: ['python', 'pandas', 'data_validation'],
                reward: { money: 600, reputation: 25 }
            },
            {
                id: 'issue_3',
                number: 44,
                title: ' Memory leak in large dataset processing',
                body: 'Processing large datasets (>10GB) causes memory issues. Need to implement chunking or streaming processing.',
                labels: ['bug', 'performance', 'ml_models'],
                assignee: null,
                repository: 'ml_models',
                createdAt: Date.now() - 259200000, // 3 days ago
                difficulty: 'hard',
                skills: ['python', 'memory_optimization', 'data_processing'],
                reward: { money: 800, reputation: 30 }
            },
            {
                id: 'issue_4',
                number: 45,
                title: ' Add support for time series analysis',
                body: 'Add time series analysis capabilities to the data analysis tools. Should include trend analysis, seasonality detection, and forecasting.',
                labels: ['enhancement', 'feature', 'data_analysis'],
                assignee: null,
                repository: 'data_analysis',
                createdAt: Date.now() - 345600000, // 4 days ago
                difficulty: 'very_hard',
                skills: ['python', 'time_series', 'statistics', 'forecasting'],
                reward: { money: 1000, reputation: 35 }
            },
            {
                id: 'issue_5',
                number: 46,
                title: ' Improve model training pipeline',
                body: 'The current training pipeline is slow and inefficient. Need to optimize data loading, add distributed training support, and implement checkpointing.',
                labels: ['enhancement', 'performance', 'ml_models'],
                assignee: null,
                repository: 'ml_models',
                createdAt: Date.now() - 432000000, // 5 days ago
                difficulty: 'extreme',
                skills: ['python', 'tensorflow', 'distributed_training', 'optimization'],
                reward: { money: 1500, reputation: 50 }
            }
        ];
    }
    
    /**
     * Get open issues
     */
    getOpenIssues(filters = {}) {
        let issues = [...this.openIssues];
        
        // Filter by repository
        if (filters.repository) {
            issues = issues.filter(issue => issue.repository === filters.repository);
        }
        
        // Filter by difficulty
        if (filters.difficulty) {
            issues = issues.filter(issue => issue.difficulty === filters.difficulty);
        }
        
        // Filter by labels
        if (filters.labels && filters.labels.length > 0) {
            issues = issues.filter(issue => 
                filters.labels.some(label => issue.labels.includes(label))
            );
        }
        
        return issues;
    }
    
    /**
     * Assign issue to player
     */
    assignIssue(issueId) {
        const issue = this.openIssues.find(i => i.id === issueId);
        if (!issue) {
            return { success: false, message: 'Issue not found' };
        }
        
        if (issue.assignee) {
            return { success: false, message: 'Issue already assigned' };
        }
        
        issue.assignee = 'player';
        issue.assignedAt = Date.now();
        
        return {
            success: true,
            issue: issue,
            message: `Assigned issue #${issue.number}: ${issue.title}`
        };
    }
    
    /**
     * Complete issue (creates pull request)
     */
    completeIssue(issueId) {
        const issue = this.openIssues.find(i => i.id === issueId && i.assignee === 'player');
        if (!issue) {
            return { success: false, message: 'Issue not assigned to you' };
        }
        
        // Create pull request
        const pullRequest = {
            id: `pr_${Date.now()}`,
            number: this.pullRequests.length + 1,
            title: `Fix #${issue.number}: ${issue.title}`,
            body: `This PR addresses issue #${issue.number}.\n\n## Changes\n- Implemented fix\n- Added tests\n- Updated documentation`,
            issue: issueId,
            repository: issue.repository,
            status: 'open',
            createdAt: Date.now(),
            author: 'player',
            reviews: [],
            mergeable: true
        };
        
        this.pullRequests.push(pullRequest);
        
        // Move issue to closed
        this.openIssues = this.openIssues.filter(i => i.id !== issueId);
        issue.status = 'closed';
        issue.closedAt = Date.now();
        this.closedIssues.push(issue);
        
        // Apply rewards
        if (issue.reward) {
            if (issue.reward.money) {
                this.gameState.money += issue.reward.money;
            }
            if (issue.reward.reputation) {
                this.gameState.reputation += issue.reward.reputation;
            }
        }
        
        return {
            success: true,
            pullRequest: pullRequest,
            issue: issue,
            message: `Created pull request #${pullRequest.number} for issue #${issue.number}`
        };
    }
    
    /**
     * Get pull requests
     */
    getPullRequests(filters = {}) {
        let prs = [...this.pullRequests];
        
        if (filters.status) {
            prs = prs.filter(pr => pr.status === filters.status);
        }
        
        if (filters.repository) {
            prs = prs.filter(pr => pr.repository === filters.repository);
        }
        
        return prs;
    }
    
    /**
     * Merge pull request
     */
    mergePullRequest(prId) {
        const pr = this.pullRequests.find(p => p.id === prId);
        if (!pr) {
            return { success: false, message: 'Pull request not found' };
        }
        
        if (pr.status !== 'open') {
            return { success: false, message: 'Pull request already merged or closed' };
        }
        
        // Check if reviews are required
        if (pr.reviews.length < 1) {
            return { success: false, message: 'Pull request needs at least 1 review' };
        }
        
        pr.status = 'merged';
        pr.mergedAt = Date.now();
        
        return {
            success: true,
            pullRequest: pr,
            message: `Merged pull request #${pr.number}`
        };
    }
    
    /**
     * Generate new issue (randomly)
     */
    generateNewIssue() {
        const issueTemplates = [
            {
                title: ' Bug in data transformation',
                body: 'Data transformation step produces incorrect results for edge cases.',
                labels: ['bug', 'data-pipeline'],
                difficulty: 'medium'
            },
            {
                title: ' Add new visualization type',
                body: 'Request to add support for heatmap visualizations in the analysis tools.',
                labels: ['enhancement', 'feature', 'data_analysis'],
                difficulty: 'medium'
            },
            {
                title: ' Improve documentation',
                body: 'Documentation is outdated. Need to update examples and add more tutorials.',
                labels: ['documentation', 'enhancement'],
                difficulty: 'easy'
            },
            {
                title: ' Performance optimization needed',
                body: 'Current implementation is too slow for production use. Need optimization.',
                labels: ['performance', 'enhancement'],
                difficulty: 'hard'
            }
        ];
        
        const template = issueTemplates[Math.floor(Math.random() * issueTemplates.length)];
        const issueNumber = this.openIssues.length + this.closedIssues.length + 1;
        
        const issue = {
            id: `issue_${Date.now()}`,
            number: issueNumber,
            title: template.title,
            body: template.body,
            labels: template.labels,
            assignee: null,
            repository: this.repositories[Math.floor(Math.random() * this.repositories.length)].id,
            createdAt: Date.now(),
            difficulty: template.difficulty,
            skills: ['python', 'data_science'],
            reward: {
                money: template.difficulty === 'easy' ? 200 : template.difficulty === 'medium' ? 400 : 600,
                reputation: template.difficulty === 'easy' ? 10 : template.difficulty === 'medium' ? 20 : 30
            }
        };
        
        this.openIssues.push(issue);
        return issue;
    }
}

