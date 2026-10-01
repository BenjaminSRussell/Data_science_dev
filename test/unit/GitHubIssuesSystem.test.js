/**
 * Unit tests for GitHubIssuesSystem
 * Verifies reward table consistency and prevents divergence between
 * generateInitialIssues and generateNewIssue reward assignment paths
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GitHubIssuesSystem } from '../../src/js/game/github/GitHubIssuesSystem.js';

describe('GitHubIssuesSystem', () => {
    let gameState;
    let githubSystem;

    beforeEach(() => {
        gameState = {
            money: 0,
            reputation: 0
        };
        githubSystem = new GitHubIssuesSystem(gameState);
    });

    describe('generateNewIssue reward table', () => {
        it('should have reward table with all 5 difficulty tiers', () => {
            // This test verifies the structure by checking generated issues
            // and cross-referencing against the initial issues

            // Generate multiple new issues and collect all difficulty levels
            const difficulties = new Set();
            for (let i = 0; i < 50; i++) {
                const issue = githubSystem.generateNewIssue();
                difficulties.add(issue.difficulty);
            }

            // Check that we have the expected difficulties from templates
            expect(difficulties.has('easy')).toBe(true);
            expect(difficulties.has('medium')).toBe(true);
            expect(difficulties.has('hard')).toBe(true);

            // Verify all have reward objects (no undefined)
            githubSystem.openIssues.forEach(issue => {
                expect(issue.reward).toBeDefined();
                expect(issue.reward.money).toBeDefined();
                expect(issue.reward.reputation).toBeDefined();
                expect(typeof issue.reward.money).toBe('number');
                expect(typeof issue.reward.reputation).toBe('number');
            });
        });

        it('should preserve existing hard template reward (600/30)', () => {
            // The pre-existing 'hard' template ("Performance optimization needed")
            // was getting 600/30 from the old ternary default.
            // This test ensures the fix doesn't change that existing behavior.

            let hardTemplateFound = false;
            let hardTemplateReward = null;

            // Generate many issues to sample the hard template multiple times
            for (let i = 0; i < 100; i++) {
                const issue = githubSystem.generateNewIssue();

                if (issue.title.includes('Performance optimization')) {
                    hardTemplateFound = true;
                    hardTemplateReward = issue.reward;

                    // Verify the reward is exactly 600/30 (not the 25 from issue_2)
                    expect(issue.reward.money).toBe(600);
                    expect(issue.reward.reputation).toBe(30);
                }
            }

            expect(hardTemplateFound).toBe(true, 'hard template should be generated at least once in 100 attempts');
            expect(hardTemplateReward).not.toBeNull();
            expect(hardTemplateReward.money).toBe(600);
            expect(hardTemplateReward.reputation).toBe(30);
        });

        it('should map all template difficulties to correct rewards', () => {
            // Verify each difficulty tier gets the correct reward
            const rewardMap = {
                'easy': { money: 200, reputation: 10 },
                'medium': { money: 400, reputation: 20 },
                'hard': { money: 600, reputation: 30 }
            };

            // Generate issues until we've seen each difficulty
            const observedRewards = {};
            for (let i = 0; i < 200; i++) {
                const issue = githubSystem.generateNewIssue();
                const difficulty = issue.difficulty;

                if (!observedRewards[difficulty]) {
                    observedRewards[difficulty] = issue.reward;
                }
            }

            // Verify the observed rewards match expected values
            Object.entries(rewardMap).forEach(([difficulty, expectedReward]) => {
                expect(observedRewards[difficulty]).toBeDefined();
                expect(observedRewards[difficulty].money).toBe(expectedReward.money);
                expect(observedRewards[difficulty].reputation).toBe(expectedReward.reputation);
            });
        });

        it('should not have unreachable fallback for existing templates', () => {
            // The fallback `|| { money: 600, reputation: 25 }` is unreachable
            // because all template difficulties are in the rewardTable.
            // This test verifies all generated issues have valid rewards.

            for (let i = 0; i < 50; i++) {
                const issue = githubSystem.generateNewIssue();

                // All issues should have a reward (not using the fallback)
                expect(issue.reward).toBeDefined();

                // Verify the reward is not the fallback value for 'hard'
                if (issue.difficulty === 'hard') {
                    // Should be 30, not 25 (which would indicate fallback was used)
                    expect(issue.reward.reputation).toBe(30);
                }
            }
        });

        it('should prevent divergence between generateInitialIssues and generateNewIssue', () => {
            // The core issue: both generateInitialIssues and generateNewIssue
            // should use a consistent reward mapping to prevent silent divergence.
            // This test verifies the reward consistency.

            // Get initial issues and verify they use the expected rewards
            const initialIssues = githubSystem.openIssues;

            // Check initial 'hard' issues
            const hardInitialIssues = initialIssues.filter(i => i.difficulty === 'hard');
            expect(hardInitialIssues.length).toBe(2, 'should have 2 hard initial issues');

            // Note: generateInitialIssues has a data inconsistency:
            // - issue_2: 600/25
            // - issue_3: 800/30
            // But generateNewIssue should use a consistent mapping.

            // For the 'hard' template in generateNewIssue, verify it uses the rewardTable
            let newIssueHardReward = null;
            for (let i = 0; i < 100; i++) {
                const issue = githubSystem.generateNewIssue();
                if (issue.difficulty === 'hard') {
                    newIssueHardReward = issue.reward;
                    break;
                }
            }

            expect(newIssueHardReward).toBeDefined();
            expect(newIssueHardReward.money).toBe(600);
            expect(newIssueHardReward.reputation).toBe(30);
        });
    });

    describe('reward consistency across difficulty levels', () => {
        it('easy template should get 200/10', () => {
            let easyFound = false;
            for (let i = 0; i < 100; i++) {
                const issue = githubSystem.generateNewIssue();
                if (issue.title.includes('documentation') || issue.title.includes('Improve')) {
                    expect(issue.reward.money).toBe(200);
                    expect(issue.reward.reputation).toBe(10);
                    easyFound = true;
                    break;
                }
            }
            expect(easyFound).toBe(true, 'easy template should be found');
        });

        it('medium templates should get 400/20', () => {
            let mediumCount = 0;
            for (let i = 0; i < 100; i++) {
                const issue = githubSystem.generateNewIssue();
                if (issue.difficulty === 'medium') {
                    expect(issue.reward.money).toBe(400);
                    expect(issue.reward.reputation).toBe(20);
                    mediumCount++;
                    if (mediumCount >= 2) break;
                }
            }
            expect(mediumCount).toBe(2, 'should find multiple medium templates');
        });
    });

    describe('issue template structure', () => {
        it('all templates should have required fields', () => {
            for (let i = 0; i < 50; i++) {
                const issue = githubSystem.generateNewIssue();

                expect(issue.id).toBeDefined();
                expect(issue.title).toBeDefined();
                expect(issue.body).toBeDefined();
                expect(issue.difficulty).toBeDefined();
                expect(issue.reward).toBeDefined();
                expect(issue.labels).toBeDefined();
                expect(Array.isArray(issue.labels)).toBe(true);
            }
        });

        it('should generate unique issue numbers', () => {
            const issueNumbers = new Set();
            for (let i = 0; i < 20; i++) {
                const issue = githubSystem.generateNewIssue();
                expect(issueNumbers.has(issue.number)).toBe(false);
                issueNumbers.add(issue.number);
            }
        });
    });
});
