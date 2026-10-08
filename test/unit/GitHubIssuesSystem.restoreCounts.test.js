/**
 * Restoring GitHubIssuesSystem from a save recounts repository issue/PR
 * totals from the restored lists (#528)
 */
import { describe, it, expect } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';
import { GitHubIssuesSystem } from '../../src/js/game/github/GitHubIssuesSystem.js';

describe('GitHubIssuesSystem save/restore (#528)', () => {
    it('round-trips the lists and recounts repositories', () => {
        const source = new GameState();
        source.githubIssuesSystem = new GitHubIssuesSystem(source);
        const repo = source.githubIssuesSystem.repositories[0].id;
        source.githubIssuesSystem.openIssues = [{ id: 'i1', number: 1, repository: repo }];
        source.githubIssuesSystem.pullRequests = [{ id: 'p1', repository: repo, status: 'open' }];
        const data = JSON.parse(JSON.stringify(source.serialize ? source.serialize() : source.toJSON()));

        const target = new GameState();
        target.githubIssuesSystem = new GitHubIssuesSystem(target);
        (target.deserialize ? target.deserialize(data) : target.fromJSON(data));
        const gh = target.githubIssuesSystem;
        expect(gh.openIssues.map(i => i.id)).toEqual(['i1']);
        expect(gh.pullRequests.map(p => p.id)).toEqual(['p1']);
        const restoredRepo = gh.repositories.find(r => r.id === repo);
        expect(restoredRepo.issues).toBe(1);
        expect(restoredRepo.pullRequests).toBe(1);
        expect(gh.repositories.filter(r => r.id !== repo).every(r => r.issues === 0)).toBe(true);
    });
});
