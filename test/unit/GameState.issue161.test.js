/**
 * GameState Unit Tests
 * Verifies save/load symmetry for all systems
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';

describe('GameState', () => {
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
    });

    describe('githubIssuesSystem save/load symmetry (reference pattern)', () => {
        it('should save and restore all githubIssuesSystem fields', () => {
            gameState.githubIssuesSystem = {
                openIssues: [
                    { id: 'issue1', title: 'Test Issue 1', status: 'open' }
                ],
                closedIssues: [
                    { id: 'issue2', title: 'Test Issue 2', status: 'closed' }
                ],
                pullRequests: [
                    { id: 'pr1', title: 'Test PR 1', status: 'open' }
                ]
            };

            const savedData = gameState.toJSON();
            expect(savedData.githubIssuesSystem.openIssues.length).toBe(1);
            expect(savedData.githubIssuesSystem.closedIssues.length).toBe(1);
            expect(savedData.githubIssuesSystem.pullRequests.length).toBe(1);

            const gameState2 = new GameState();
            gameState2.githubIssuesSystem = {
                openIssues: [],
                closedIssues: [],
                pullRequests: []
            };
            gameState2.fromJSON(savedData);

            expect(gameState2.githubIssuesSystem.openIssues.length).toBe(1);
            expect(gameState2.githubIssuesSystem.closedIssues.length).toBe(1);
            expect(gameState2.githubIssuesSystem.pullRequests.length).toBe(1);
        });
    });
});
