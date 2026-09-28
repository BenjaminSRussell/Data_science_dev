const GitHubIssuesSystem = require('../../src/js/game/github/GitHubIssuesSystem');

describe('GitHubIssuesSystem', () => {
    let system;

    beforeEach(() => {
        const gameState = { money: 0, reputation: 0 };
        system = new GitHubIssuesSystem(gameState);
    });

    describe('getOpenIssues', () => {
        it('should return all issues without filters', () => {
            const issues = system.getOpenIssues();
            expect(issues).toHaveLength(5);
            expect(issues).not.toBe(system.openIssues);
        });

        it('should filter by repository', () => {
            const issues = system.getOpenIssues({ repository: 'ml_models' });
            expect(issues).toHaveLength(2);
            issues.forEach(issue => {
                expect(issue.repository).toBe('ml_models');
            });
        });

        it('should filter by difficulty', () => {
            const issues = system.getOpenIssues({ difficulty: 'hard' });
            expect(issues).toHaveLength(2);
            issues.forEach(issue => {
                expect(issue.difficulty).toBe('hard');
            });
        });

        it('should filter by labels using .some()', () => {
            const issues = system.getOpenIssues({ labels: ['bug'] });
            expect(issues).toHaveLength(2);
            issues.forEach(issue => {
                expect(issue.labels.some(label => label === 'bug')).toBe(true);
            });
        });

        it('should apply conjunctive filters', () => {
            const issues = system.getOpenIssues({
                repository: 'ml_models',
                difficulty: 'hard',
                labels: ['bug']
            });
            expect(issues).toHaveLength(1);
            issues.forEach(issue => {
                expect(issue.repository).toBe('ml_models');
                expect(issue.difficulty).toBe('hard');
                expect(issue.labels.some(label => label === 'bug')).toBe(true);
            });
        });
    });

    describe('getPullRequests', () => {
        it('should filter by status', () => {
            const pr1 = { status: 'merged' };
            const pr2 = { status: 'open' };
            system.pullRequests.push(pr1, pr2);
            const prs = system.getPullRequests({ status: 'merged' });
            expect(prs).toHaveLength(1);
            expect(prs[0]).toBe(pr1);
        });

        it('should filter by repository', () => {
            const pr1 = { repository: 'ml_models' };
            const pr2 = { repository: 'backend' };
            system.pullRequests.push(pr1, pr2);
            const prs = system.getPullRequests({ repository: 'ml_models' });
            expect(prs).toHaveLength(1);
            expect(prs[0]).toBe(pr1);
        });
    });
});