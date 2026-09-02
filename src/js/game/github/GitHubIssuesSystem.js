class GitHubIssuesSystem {
    constructor() {
        this.repositories = [
            { id: 'ml_models', name: 'ML Models' },
            { id: 'data_analysis', name: 'Data Analysis' }
        ];

        this.openIssues = [
            {
                id: 'issue_1',
                number: 42,
                title: ' Fix data parsing error',
                body: 'Error occurs while parsing large JSON files. Need to add error handling.',
                labels: ['bug', 'data-pipeline'],
                assignee: null,
                repository: 'ml_models',
                createdAt: Date.now() - 86400000, // 1 day ago
                difficulty: 'medium',
                skills: ['python', 'json', 'error_handling'],
                reward: { money: 300, reputation: 15 }
            },
            {
                id: 'issue_2',
                number: 43,
                title: ' Optimize feature extraction',
                body: 'Feature extraction process is slow. Need to use more efficient algorithms.',
                labels: ['performance', 'optimization', 'ml_models'],
                assignee: 'player',
                repository: 'ml_models',
                assignedAt: Date.now() - 172800000, // 2 days ago
                difficulty: 'hard',
                skills: ['python', 'feature_extraction', 'ml_algorithms'],
                reward: { money: 600, reputation: 25 }
            }
        ];

        this.closedIssues = [];
        this.pullRequests = [];

        this.gameState = {
            money: 0,
            reputation: 0
        };
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