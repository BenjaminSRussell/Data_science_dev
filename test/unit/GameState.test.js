/**
 * GameState Unit Tests
 * Verifies save/load symmetry for all systems
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';
import { EmotionalBreakdownSystem } from '../../src/js/game/dialogue/EmotionalBreakdownSystem.js';

describe('GameState', () => {
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
    });

    describe('emotionalBreakdownSystem save/load symmetry', () => {
        it('should save and restore activeBreakdowns Map from emotionalBreakdownSystem', () => {
            // Initialize emotionalBreakdownSystem
            gameState.emotionalBreakdownSystem = new EmotionalBreakdownSystem(gameState);

            // Add some breakdown entries to activeBreakdowns
            const breakdown1 = {
                id: 'breakdown_npc1_1234567890',
                npcId: 'npc1',
                npc: { id: 'npc1', name: 'Test NPC', icon: '😢' },
                type: 'hurt',
                emotion: 'sad',
                quickTimeType: 'comfort',
                startedAt: 1234567890,
                stage: 'beginning',
                playerResponse: null,
                resolved: false
            };

            const breakdown2 = {
                id: 'breakdown_npc2_1234567891',
                npcId: 'npc2',
                npc: { id: 'npc2', name: 'Another NPC', icon: '😭' },
                type: 'breakdown',
                emotion: 'crying',
                quickTimeType: 'support',
                startedAt: 1234567891,
                stage: 'middle',
                playerResponse: null,
                resolved: false
            };

            // Add breakdowns to the Map
            gameState.emotionalBreakdownSystem.activeBreakdowns.set(breakdown1.id, breakdown1);
            gameState.emotionalBreakdownSystem.activeBreakdowns.set(breakdown2.id, breakdown2);
            gameState.emotionalBreakdownSystem.breakdownHistory = [breakdown1, breakdown2];

            // Verify data is in the system before save
            expect(gameState.emotionalBreakdownSystem.activeBreakdowns.size).toBe(2);
            expect(gameState.emotionalBreakdownSystem.breakdownHistory.length).toBe(2);

            // Save the state
            const savedData = gameState.toJSON();

            // Verify data was serialized
            expect(savedData.emotionalBreakdownSystem).toBeDefined();
            expect(savedData.emotionalBreakdownSystem.activeBreakdowns).toBeDefined();
            expect(Array.isArray(savedData.emotionalBreakdownSystem.activeBreakdowns)).toBe(true);
            expect(savedData.emotionalBreakdownSystem.activeBreakdowns.length).toBe(2);
            expect(savedData.emotionalBreakdownSystem.breakdownHistory.length).toBe(2);

            // Create a new gameState and load the data
            const gameState2 = new GameState();
            gameState2.emotionalBreakdownSystem = new EmotionalBreakdownSystem(gameState2);
            gameState2.fromJSON(savedData);

            // Verify data was restored
            expect(gameState2.emotionalBreakdownSystem.activeBreakdowns).toBeDefined();
            expect(gameState2.emotionalBreakdownSystem.activeBreakdowns instanceof Map).toBe(true);
            expect(gameState2.emotionalBreakdownSystem.activeBreakdowns.size).toBe(2);

            // Verify specific breakdowns are restored
            const restored1 = gameState2.emotionalBreakdownSystem.activeBreakdowns.get(breakdown1.id);
            const restored2 = gameState2.emotionalBreakdownSystem.activeBreakdowns.get(breakdown2.id);

            expect(restored1).toBeDefined();
            expect(restored1.npcId).toBe('npc1');
            expect(restored1.emotion).toBe('sad');
            expect(restored1.type).toBe('hurt');

            expect(restored2).toBeDefined();
            expect(restored2.npcId).toBe('npc2');
            expect(restored2.emotion).toBe('crying');
            expect(restored2.type).toBe('breakdown');

            // Verify breakdownHistory is also restored
            expect(gameState2.emotionalBreakdownSystem.breakdownHistory.length).toBe(2);
        });

        it('should handle empty activeBreakdowns when saving/loading', () => {
            gameState.emotionalBreakdownSystem = new EmotionalBreakdownSystem(gameState);
            gameState.emotionalBreakdownSystem.breakdownHistory = [];

            const savedData = gameState.toJSON();
            const gameState2 = new GameState();
            gameState2.emotionalBreakdownSystem = new EmotionalBreakdownSystem(gameState2);
            gameState2.fromJSON(savedData);

            expect(gameState2.emotionalBreakdownSystem.activeBreakdowns instanceof Map).toBe(true);
            expect(gameState2.emotionalBreakdownSystem.activeBreakdowns.size).toBe(0);
            expect(gameState2.emotionalBreakdownSystem.breakdownHistory.length).toBe(0);
        });

        it('should handle null emotionalBreakdownSystem when saving/loading', () => {
            gameState.emotionalBreakdownSystem = null;

            const savedData = gameState.toJSON();
            expect(savedData.emotionalBreakdownSystem).toBeNull();

            const gameState2 = new GameState();
            gameState2.emotionalBreakdownSystem = null;
            gameState2.fromJSON(savedData);

            expect(gameState2.emotionalBreakdownSystem).toBeNull();
        });
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
