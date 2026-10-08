import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Edu from '../../src/js/helpers/EducationHelpers.js';

const EXAM_DOM = `
<div id="modal-exam" class="hidden"><button class="close-modal"></button>
  <h2 id="exam-title"></h2>
  <div id="exam-intro"><button id="btn-start-exam"></button></div>
  <div id="exam-questions" class="hidden"><p id="question-text"></p><div id="options-container"></div></div>
  <div id="exam-results" class="hidden"><span id="exam-score"></span><span id="exam-status"></span><button id="btn-close-exam"></button></div>
</div>`;

const questions = (n) => Array.from({ length: n }, (_, i) => ({ q: `Q${i}`, options: ['a', 'b', 'c'], correct: 1 }));

function makeGame(overrides = {}) {
    return {
        gameState: {
            money: 1000,
            educationSystem: {
                courses: { stats101: { name: 'Stats 101', cost: 300, questions: questions(3) } },
                completedCourses: [],
                completeCourse: vi.fn()
            },
            unlockedLibraries: [],
            legalSystem: { acquireLicense: vi.fn() }
        },
        showToast: vi.fn(),
        showError: vi.fn(),
        audioManager: { play: vi.fn() },
        uiUpdater: { updateAllUI: vi.fn(), updateLibraryScreen: vi.fn() },
        updateMapScreen: vi.fn(),
        ...overrides
    };
}

beforeEach(() => { document.body.innerHTML = EXAM_DOM; });

describe('finishExam (#200)', () => {
    const run = (score, total, game = makeGame()) => {
        game.currentExam = { courseId: 'stats101', questions: questions(total), currentQuestionIndex: total, score };
        Edu.finishExam(game);
        return game;
    };

    it('60% passes (inclusive boundary) and completes the course (#1265)', () => {
        const g = run(6, 10);
        expect(document.getElementById('exam-score').textContent).toBe('60');
        expect(document.getElementById('exam-status').textContent).toBe('PASSED!');
        expect(document.getElementById('exam-status').className).toBe('success-text');
        expect(g.gameState.educationSystem.completeCourse).toHaveBeenCalledWith('stats101');
        expect(g.audioManager.play).toHaveBeenCalledWith('kaching');
    });

    it('50% fails, plays the error path and does not complete the course', () => {
        const g = run(5, 10);
        expect(document.getElementById('exam-status').textContent).toBe('FAILED');
        expect(document.getElementById('exam-status').className).toBe('error-text');
        expect(g.audioManager.play).toHaveBeenCalledWith('error');
        expect(g.showToast).toHaveBeenCalledWith(expect.any(String), 'error');
        expect(g.gameState.educationSystem.completeCourse).not.toHaveBeenCalled();
    });

    it('2 of 3 passes without a perfect score (#1265)', () => {
        run(2, 3);
        expect(document.getElementById('exam-score').textContent).toBe('67');
        expect(document.getElementById('exam-status').textContent).toBe('PASSED!');
    });

    it('zero questions gives 0%, not NaN', () => {
        run(0, 0);
        expect(document.getElementById('exam-score').textContent).toBe('0');
    });

    it('returns early without an exam or with bad questions', () => {
        const g = makeGame();
        expect(() => Edu.finishExam(g)).not.toThrow();
        g.currentExam = { questions: 'nope' };
        expect(() => Edu.finishExam(g)).not.toThrow();
        expect(document.getElementById('exam-results').classList.contains('hidden')).toBe(true);
        expect(() => Edu.finishExam(null)).not.toThrow();
    });

    it('the close button hides the modal and refreshes the map', () => {
        const g = run(7, 10);
        document.getElementById('btn-close-exam').click();
        expect(document.getElementById('modal-exam').classList.contains('hidden')).toBe(true);
        expect(g.updateMapScreen).toHaveBeenCalled();
    });
});

describe('EducationHelpers exam flow and purchases (#1269)', () => {
    it('handleStartExam charges tuition and sets up the exam', () => {
        const g = makeGame();
        Edu.handleStartExam(g, 'stats101');
        expect(g.gameState.money).toBe(700);
        expect(g.currentExam).toMatchObject({ courseId: 'stats101', currentQuestionIndex: 0, score: 0 });
        expect(g.currentExam.questions).toHaveLength(3);
        expect(document.getElementById('modal-exam').classList.contains('active')).toBe(true);
        expect(document.getElementById('exam-title').textContent).toBe('Stats 101 Exam');
    });

    it('handleStartExam refuses when tuition is too high, money untouched', () => {
        const g = makeGame();
        g.gameState.money = 299;
        Edu.handleStartExam(g, 'stats101');
        expect(g.gameState.money).toBe(299);
        expect(g.showToast).toHaveBeenCalledWith('Tuition too high!', 'error');
        expect(g.currentExam).toBeUndefined();
    });

    it('handleStartExam never charges when the modal is missing or the course is done/unknown', () => {
        const g = makeGame();
        document.body.innerHTML = '';
        Edu.handleStartExam(g, 'stats101');
        expect(g.gameState.money).toBe(1000);
        document.body.innerHTML = EXAM_DOM;
        Edu.handleStartExam(g, 'nope');
        g.gameState.educationSystem.completedCourses.push('stats101');
        Edu.handleStartExam(g, 'stats101');
        expect(g.gameState.money).toBe(1000);
    });

    it('startExamQuestions shows the first question with one button per option', () => {
        const g = makeGame();
        Edu.handleStartExam(g, 'stats101');
        document.getElementById('btn-start-exam').click();
        expect(document.getElementById('exam-intro').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('exam-questions').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('question-text').textContent).toBe('1. Q0');
        expect(document.querySelectorAll('#options-container button')).toHaveLength(3);
    });

    it('answers score only when correct, advance, and finish at the end', () => {
        const g = makeGame();
        Edu.handleStartExam(g, 'stats101');
        Edu.startExamQuestions(g);
        document.querySelectorAll('#options-container button')[1].click(); // correct
        expect(g.currentExam).toMatchObject({ score: 1, currentQuestionIndex: 1 });
        expect(document.getElementById('question-text').textContent).toBe('2. Q1');
        Edu.handleAnswerQuestion(g, 0); // wrong
        expect(g.currentExam).toMatchObject({ score: 1, currentQuestionIndex: 2 });
        Edu.handleAnswerQuestion(g, 1); // correct, last
        expect(document.getElementById('exam-score').textContent).toBe('67');
        // A stray extra click after the end is ignored
        expect(() => Edu.handleAnswerQuestion(g, 1)).not.toThrow();
        expect(g.currentExam.score).toBe(2);
    });

    it('handleBuyLicense success, failure and missing legal system', () => {
        const g = makeGame();
        g.gameState.legalSystem.acquireLicense.mockReturnValueOnce({ success: true, message: 'ok' });
        Edu.handleBuyLicense(g, 'data');
        expect(g.showToast).toHaveBeenCalledWith('ok', 'success');
        expect(g.updateMapScreen).toHaveBeenCalled();
        g.gameState.legalSystem.acquireLicense.mockReturnValueOnce({ success: false, message: 'no' });
        Edu.handleBuyLicense(g, 'data');
        expect(g.showToast).toHaveBeenCalledWith('no', 'error');
        delete g.gameState.legalSystem;
        expect(() => Edu.handleBuyLicense(g, 'data')).not.toThrow();
    });

    it('handleLearnLibrary: already owned, too poor, and success', () => {
        const libs = [{ id: 'pandas', name: 'Pandas', cost: 400 }];
        const g = makeGame();
        g.gameState.money = 300;
        Edu.handleLearnLibrary(g, 'pandas', libs);
        expect(g.showError).toHaveBeenCalled();
        expect(g.gameState.unlockedLibraries).toEqual([]);
        g.gameState.money = 500;
        Edu.handleLearnLibrary(g, 'pandas', libs);
        expect(g.gameState.money).toBe(100);
        expect(g.gameState.unlockedLibraries).toEqual(['pandas']);
        expect(g.uiUpdater.updateLibraryScreen).toHaveBeenCalled();
        Edu.handleLearnLibrary(g, 'pandas', libs);
        expect(g.gameState.money).toBe(100);
        expect(g.gameState.unlockedLibraries).toEqual(['pandas']);
    });
});
