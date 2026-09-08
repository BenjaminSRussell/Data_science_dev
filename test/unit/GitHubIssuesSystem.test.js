import { describe, it, expect, vi } from 'vitest';
import { GitHubIssuesSystem } from '../../src/js/systems/GitHubIssuesSystem.js';

describe('GitHubIssuesSystem', () => {
    let issuesSystem;

    beforeEach(() => {
        issuesSystem = new GitHubIssuesSystem();
    });

    describe('assignIssue', () => {
        it('should return success false and message "Issue not found" for unknown issueId', () => {
            const result = issuesSystem.assignIssue(999);
            expect(result).toEqual({ success: false, message: 'Issue not found' });
        });

        it('should assign issue to player and set assignedAt for valid unassigned issue', () => {
            const issueId = 1;
            issuesSystem.issues.push({ id: issueId, title: 'Test Issue', assignee: null, assignedAt: null });
            const result = issuesSystem.assignIssue(issueId);
            expect(result).toEqual({ success: true });
            const issue = issuesSystem.issues.find(i => i.id === issueId);
            expect(issue.assignee).toBe('player');
            expect(issue.assignedAt).toBeInstanceOf(Date);
        });

        it('should return success false and message "Issue already assigned" for already-assigned issue', () => {
            const issueId = 1;
            issuesSystem.issues.push({ id: issueId, title: 'Test Issue', assignee: 'otherPlayer', assignedAt: new Date() });
            const result = issuesSystem.assignIssue(issueId);
            expect(result).toEqual({ success: false, message: 'Issue already assigned' });
            const issue = issuesSystem.issues.find(i => i.id === issueId);
            expect(issue.assignee).toBe('otherPlayer');
            expect(issue.assignedAt).toBeInstanceOf(Date);
        });
    });
});