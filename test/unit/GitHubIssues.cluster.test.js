import { describe, it, expect, vi, afterEach } from 'vitest';
import { GitHubIssuesSystem, ISSUE_REWARDS } from '../../src/js/game/github/GitHubIssuesSystem.js';

afterEach(() => vi.restoreAllMocks());

const gs = () => {
    const xp = {};
    return {
        money: 0, reputation: 0, xp,
        characterStats: {
            getStat: () => 100,
            addExperience: (stat, amount) => { xp[stat] = (xp[stat] || 0) + amount; }
        }
    };
};

describe('GitHubIssuesSystem cluster', () => {
    it('#2087 no issue title starts with a space', () => {
        const sys = new GitHubIssuesSystem(gs());
        for (let i = 0; i < 12; i++) sys.generateNewIssue();
        for (const issue of sys.openIssues) expect(issue.title).toBe(issue.title.trim());
    });

    it('#2088 repository counts match the real open issues and PRs', () => {
        const sys = new GitHubIssuesSystem(gs());
        const count = (repo) => sys.openIssues.filter(i => i.repository === repo).length;
        for (const repo of sys.repositories) {
            expect(repo.issues).toBe(count(repo.id));
            expect(repo.pullRequests).toBe(0);
        }
        sys.assignIssue('issue_1');
        sys.completeIssue('issue_1');
        const pipeline = sys.repositories.find(r => r.id === 'data_pipeline');
        expect(pipeline.issues).toBe(count('data_pipeline'));
        expect(pipeline.pullRequests).toBe(1);
    });

    it('#2089 every difficulty tier gets its own reward', () => {
        const sys = new GitHubIssuesSystem(gs());
        const seen = {};
        const rolls = [0, 0.2, 0.4, 0.55, 0.75, 0.95];
        for (const r of rolls) {
            vi.spyOn(Math, 'random').mockReturnValue(r);
            const issue = sys.generateNewIssue();
            seen[issue.difficulty] = issue.reward;
            vi.restoreAllMocks();
        }
        expect(Object.keys(seen).sort()).toEqual(Object.keys(ISSUE_REWARDS).sort());
        expect(seen.very_hard).toEqual(ISSUE_REWARDS.very_hard);
        expect(seen.extreme.money).toBeGreaterThan(seen.very_hard.money);
    });

    it('#932 completing an issue trains the stats its skills map to', () => {
        const state = gs();
        const sys = new GitHubIssuesSystem(state);
        sys.assignIssue('issue_3'); // hard: python, memory_optimization, data_processing
        const result = sys.completeIssue('issue_3');
        expect(result.xpGains).toEqual({ intelligence: 10, focus: 20 });
        expect(state.xp).toEqual({ intelligence: 10, focus: 20 });
    });
});
