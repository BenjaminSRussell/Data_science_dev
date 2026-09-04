import { describe, it, expect, vi } from 'vitest';
import { GameEndingSystem } from '../../src/js/game/GameEndingSystem.js';
import { EducationSystem } from '../../src/js/game/EducationSystem.js';

function makeGameState() {
    return {
        rankIndex: 0,
        money: 0,
        timeManager: { totalDays: 0 },
        educationSystem: null
    };
}

describe('GameEndingSystem - Education Master ending', () => {
    it('is reachable when every course in the catalog is completed and all degrees acquired', () => {
        const gameState = makeGameState();
        gameState.educationSystem = new EducationSystem(gameState);

        // Complete every course that exists in the catalog
        for (const courseId of Object.keys(gameState.educationSystem.courses)) {
            gameState.educationSystem.completeCourse(courseId);
        }
        // Acquire all degrees (checkDegrees may have granted some already)
        for (const degree of Object.values(gameState.educationSystem.degrees)) {
            degree.acquired = true;
        }

        const system = new GameEndingSystem(gameState);
        const ending = system.checkEducationCompletion();

        expect(ending).not.toBeNull();
        expect(ending.type).toBe('education_master');
        expect(ending.title).toBe('Education Master');
        expect(ending.showEnding).toBe(true);
    });

    it('does not trigger when not all courses are completed', () => {
        const gameState = makeGameState();
        gameState.educationSystem = new EducationSystem(gameState);

        const courseIds = Object.keys(gameState.educationSystem.courses);
        // Complete all but one course
        for (const id of courseIds.slice(0, -1)) {
            gameState.educationSystem.completeCourse(id);
        }
        for (const degree of Object.values(gameState.educationSystem.degrees)) {
            degree.acquired = true;
        }

        const system = new GameEndingSystem(gameState);
        expect(system.checkEducationCompletion()).toBeNull();
    });

    it('does not trigger when not all degrees are acquired', () => {
        const gameState = makeGameState();
        gameState.educationSystem = new EducationSystem(gameState);

        for (const courseId of Object.keys(gameState.educationSystem.courses)) {
            gameState.educationSystem.completeCourse(courseId);
        }
        // Leave one degree unacquired
        const degreeKeys = Object.keys(gameState.educationSystem.degrees);
        gameState.educationSystem.degrees[degreeKeys[degreeKeys.length - 1]].acquired = false;

        const system = new GameEndingSystem(gameState);
        expect(system.checkEducationCompletion()).toBeNull();
    });
});
