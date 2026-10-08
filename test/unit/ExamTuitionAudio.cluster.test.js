import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Edu from '../../src/js/helpers/EducationHelpers.js';
import { EducationSystem } from '../../src/js/game/EducationSystem.js';
import { readFileSync } from 'node:fs';

const DOM = `
<div id="modal-exam" class="hidden"><button class="close-modal"></button>
  <h2 id="exam-title"></h2>
  <div id="exam-intro"><p id="exam-pass-requirement"></p><button id="btn-start-exam"></button></div>
  <div id="exam-questions" class="hidden"><p id="question-text"></p><div id="options-container"></div></div>
  <div id="exam-results" class="hidden"><span id="exam-score"></span><span id="exam-status"></span></div>
</div>`;

const makeGame = (money = 1000) => {
    const gameState = { money, reputation: 0 };
    gameState.educationSystem = new EducationSystem(gameState);
    return { gameState, showToast: vi.fn(), audioManager: { play: vi.fn() }, uiUpdater: { updateAllUI: vi.fn() } };
};

beforeEach(() => { document.body.innerHTML = DOM; });

describe('tuition is charged when the exam starts (#1270)', () => {
    it('opening and closing the intro costs nothing', () => {
        const g = makeGame();
        const cost = g.gameState.educationSystem.courses.python_101.cost;
        Edu.handleStartExam(g, 'python_101');
        expect(document.getElementById('modal-exam').classList.contains('active')).toBe(true);
        document.querySelector('#modal-exam .close-modal').click();
        expect(g.gameState.money).toBe(1000);
        Edu.handleStartExam(g, 'python_101');
        document.getElementById('btn-start-exam').click();
        expect(g.gameState.money).toBe(1000 - cost);
        expect(g.currentExam.paid).toBe(true);
        // A second start of the same sitting does not charge again
        Edu.startExamQuestions(g);
        expect(g.gameState.money).toBe(1000 - cost);
    });

    it('unaffordable tuition is refused before the modal opens', () => {
        const g = makeGame(1);
        Edu.handleStartExam(g, 'python_101');
        expect(g.showToast).toHaveBeenCalledWith('Tuition too high!', 'error');
        expect(g.currentExam).toBeUndefined();
        expect(g.gameState.money).toBe(1);
    });

    it('money spent between opening and starting is re-checked at Start', () => {
        const g = makeGame();
        Edu.handleStartExam(g, 'python_101');
        g.gameState.money = 5;
        document.getElementById('btn-start-exam').click();
        expect(g.gameState.money).toBe(5);
        expect(g.currentExam).toBeNull();
        expect(document.getElementById('modal-exam').classList.contains('hidden')).toBe(true);
        expect(g.showToast).toHaveBeenCalledWith('Cannot afford tuition.', 'error');
    });

    it('canEnroll mirrors enroll without charging', () => {
        const g = makeGame();
        const edu = g.gameState.educationSystem;
        expect(edu.canEnroll('python_101').success).toBe(true);
        expect(g.gameState.money).toBe(1000);
        expect(edu.canEnroll('nope').success).toBe(false);
    });
});

describe('exam answers give audio feedback (#1237)', () => {
    it('each answer plays a neutral click', () => {
        const g = makeGame(10000);
        Edu.handleStartExam(g, 'python_101');
        Edu.startExamQuestions(g);
        g.audioManager.play.mockClear();
        Edu.handleAnswerQuestion(g, 0);
        expect(g.audioManager.play).toHaveBeenCalledWith('click');
    });
});

describe('successful crimes play the money sound (#1238)', () => {
    it('the success branch plays kaching on profit', () => {
        const src = readFileSync('src/js/helpers/StockMarketHelpers.js', 'utf8');
        const i = src.indexOf('if (result.success) {', src.indexOf('commitCrime('));
        const branch = src.slice(i, src.indexOf('} else {', i));
        expect(branch).toMatch(/play\?\.\(result\.profit > 0 \? 'kaching'/);
    });
});
