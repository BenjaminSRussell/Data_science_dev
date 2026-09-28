import { describe, it, expect, beforeEach } from 'vitest';
import { handleStartExam } from '../../src/js/helpers/EducationHelpers.js';
import { EducationSystem } from '../../src/js/game/EducationSystem.js';
import { GameState } from '../../src/js/game/GameState.js';

describe('handleStartExam', () => {
    let game;
    let toasts;
    let sounds;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="modal-exam" class="hidden">
                <button class="close-modal"></button>
                <h2 id="exam-title"></h2>
                <div id="exam-intro"></div>
                <div id="exam-questions"></div>
                <div id="exam-results"></div>
                <button id="btn-start-exam"></button>
            </div>`;
        toasts = [];
        sounds = [];
        const gameState = new GameState();
        gameState.educationSystem = new EducationSystem(gameState);
        gameState.money = 5000;
        game = {
            gameState,
            showToast: (message, type) => toasts.push({ message, type }),
            audioManager: { play: (sound) => sounds.push(sound) },
            uiUpdater: { updateAllUI() {} }
        };
    });

    it('charges tuition and opens the exam for a course with no prerequisites', () => {
        handleStartExam(game, 'python_101');

        expect(game.gameState.money).toBe(4500);
        expect(game.currentExam.courseId).toBe('python_101');
        expect(document.getElementById('modal-exam').classList.contains('active')).toBe(true);
        expect(toasts).toEqual([]);
    });

    it('refuses a course the player has already completed and says so', () => {
        game.gameState.educationSystem.completeCourse('python_101');

        handleStartExam(game, 'python_101');

        expect(game.gameState.money).toBe(5000);
        expect(game.currentExam).toBeUndefined();
        expect(toasts).toEqual([{ message: 'Course already completed.', type: 'error' }]);
        expect(sounds).toEqual(['error']);
    });

    it('refuses a course whose prerequisites are missing and names them', () => {
        handleStartExam(game, 'ml_intro');

        expect(game.gameState.money).toBe(5000);
        expect(game.currentExam).toBeUndefined();
        expect(toasts).toEqual([
            { message: 'Prerequisites not met: Python 101, SQL Fundamentals.', type: 'error' }
        ]);
        expect(sounds).toEqual(['error']);
    });

    it('names only the prerequisites still missing', () => {
        game.gameState.educationSystem.completeCourse('python_101');

        handleStartExam(game, 'ml_intro');

        expect(toasts).toEqual([
            { message: 'Prerequisites not met: SQL Fundamentals.', type: 'error' }
        ]);
    });

    it('opens the exam once the prerequisites are completed', () => {
        game.gameState.educationSystem.completeCourse('python_101');

        handleStartExam(game, 'stats_201');

        expect(game.gameState.money).toBe(4000);
        expect(game.currentExam.courseId).toBe('stats_201');
    });

    it('refuses when the player cannot afford tuition', () => {
        game.gameState.money = 499;

        handleStartExam(game, 'python_101');

        expect(game.gameState.money).toBe(499);
        expect(game.currentExam).toBeUndefined();
        expect(toasts).toEqual([{ message: 'Tuition too high!', type: 'error' }]);
    });
});
