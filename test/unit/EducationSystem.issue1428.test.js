/**
 * Education System Unit Tests
 * Tests course completion rewards
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EducationSystem } from '../../src/js/game/EducationSystem.js';
import { CharacterStats } from '../../src/js/game/CharacterStats.js';

describe('EducationSystem', () => {
    let gameState;
    let educationSystem;

    beforeEach(() => {
        // Mock gameState
        gameState = {
            money: 5000,
            reputation: 0,
            characterStats: new CharacterStats(),
            newsManager: {
                addNews: () => {}
            }
        };

        educationSystem = new EducationSystem(gameState);
    });

    describe('completeCourse', () => {
        it('should add course to completedCourses', () => {
            educationSystem.completeCourse('python_101');
            expect(educationSystem.completedCourses).toContain('python_101');
        });

        it('should award money when course is completed', () => {
            const initialMoney = gameState.money;
            educationSystem.completeCourse('python_101');
            expect(gameState.money).toBeGreaterThan(initialMoney);
        });

        it('should award XP to relevant stats when python course is completed', () => {
            const initialIntelligence = gameState.characterStats.getStat('intelligence');
            const initialAnalytics = gameState.characterStats.getStat('analytics');

            educationSystem.completeCourse('python_101');

            const newIntelligence = gameState.characterStats.getStat('intelligence');
            const newAnalytics = gameState.characterStats.getStat('analytics');

            expect(newIntelligence).toBeGreaterThanOrEqual(initialIntelligence);
            expect(newAnalytics).toBeGreaterThanOrEqual(initialAnalytics);
        });

        it('should award XP to analytics when stats course is completed', () => {
            const initialAnalytics = gameState.characterStats.getStat('analytics');

            educationSystem.completeCourse('stats_201');

            const newAnalytics = gameState.characterStats.getStat('analytics');
            expect(newAnalytics).toBeGreaterThanOrEqual(initialAnalytics);
        });

        it('should award reputation when course is completed', () => {
            const initialReputation = gameState.reputation;
            educationSystem.completeCourse('python_101');
            expect(gameState.reputation).toBeGreaterThan(initialReputation);
        });

        it('should not award rewards twice for the same course', () => {
            educationSystem.completeCourse('python_101');
            const moneyAfterFirst = gameState.money;
            const reputationAfterFirst = gameState.reputation;

            educationSystem.completeCourse('python_101');

            expect(gameState.money).toBe(moneyAfterFirst);
            expect(gameState.reputation).toBe(reputationAfterFirst);
        });

        it('should award higher rewards for higher-cost courses', () => {
            gameState.money = 10000;
            gameState.reputation = 0;

            educationSystem.completeCourse('python_101'); // cost 500
            const moneyAfterPython = gameState.money;
            const reputationAfterPython = gameState.reputation;

            gameState.money = 10000;
            gameState.reputation = 0;

            educationSystem.completeCourse('ml_intro'); // cost 1500
            const moneyAfterML = gameState.money;
            const reputationAfterML = gameState.reputation;

            expect(moneyAfterML).toBeGreaterThan(moneyAfterPython);
            expect(reputationAfterML).toBeGreaterThan(reputationAfterPython);
        });
    });
});
