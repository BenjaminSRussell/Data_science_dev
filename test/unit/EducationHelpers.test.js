/**
 * Unit tests for EducationHelpers.finishExam
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { finishExam } from '../../src/js/helpers/EducationHelpers.js';

function setupDom() {
    document.body.innerHTML = `
        <div id="modal-exam">
            <div id="exam-questions"></div>
            <div id="exam-results"></div>
            <div id="exam-score"></div>
            <div id="exam-status"></div>
            <button id="btn-close-exam"></button>
        </div>
    `;
}

function makeGame({ score, total, courseId = 'course_1' } = {}) {
    const questions = Array.isArray(total) ? total : Array.from({ length: total ?? 0 }, () => ({}));
    const completeCourse = vi.fn();
    const play = vi.fn();
    const showToast = vi.fn();
    const game = {
        currentExam: {
            courseId,
            questions,
            score
        },
        gameState: {
            educationSystem: {
                completeCourse
            }
        },
        audioManager: { play },
        showToast
    };
    return { game, completeCourse, play, showToast };
}

describe('EducationHelpers.finishExam', () => {
    beforeEach(() => {
        setupDom();
    });

    it('score 7/10 -> pct exactly 70 -> passed (inclusive boundary)', () => {
        const { game, completeCourse, play, showToast } = makeGame({ score: 7, total: 10 });

        finishExam(game);

        const scoreEl = document.getElementById('exam-score');
        const statusEl = document.getElementById('exam-status');
        expect(Number(scoreEl.textContent)).toBe(70);
        expect(statusEl.textContent).toBe('PASSED!');
        expect(statusEl.className).toBe('success-text');
        expect(completeCourse).toHaveBeenCalledWith('course_1');
        expect(play).toHaveBeenCalledWith('kaching');
        expect(showToast).toHaveBeenCalledWith('Passed course_1!', 'success');
    });

    it('score 6/10 -> pct 60 -> failed, error audio and toast instead of pass path', () => {
        const { game, completeCourse, play, showToast } = makeGame({ score: 6, total: 10 });

        finishExam(game);

        const scoreEl = document.getElementById('exam-score');
        const statusEl = document.getElementById('exam-status');
        expect(Number(scoreEl.textContent)).toBe(60);
        expect(statusEl.textContent).toBe('FAILED');
        expect(statusEl.className).toBe('error-text');
        expect(completeCourse).not.toHaveBeenCalled();
        expect(play).toHaveBeenCalledWith('error');
        expect(play).not.toHaveBeenCalledWith('kaching');
        expect(showToast).toHaveBeenCalledWith('Failed the exam.', 'error');
    });

    it('score 2/3 -> Math.round(66.67) = 67 -> fails (rounding drives pass/fail, not raw fraction)', () => {
        const { game, completeCourse } = makeGame({ score: 2, total: 3 });

        finishExam(game);

        const scoreEl = document.getElementById('exam-score');
        const statusEl = document.getElementById('exam-status');
        expect(Number(scoreEl.textContent)).toBe(67);
        expect(statusEl.textContent).toBe('FAILED');
        expect(statusEl.className).toBe('error-text');
        expect(completeCourse).not.toHaveBeenCalled();
    });

    it('total 0 -> pct is 0, not NaN', () => {
        const { game, completeCourse } = makeGame({ score: 0, total: 0 });

        finishExam(game);

        const scoreEl = document.getElementById('exam-score');
        const statusEl = document.getElementById('exam-status');
        expect(Number(scoreEl.textContent)).toBe(0);
        expect(Number.isNaN(Number(scoreEl.textContent))).toBe(false);
        expect(statusEl.textContent).toBe('FAILED');
        expect(completeCourse).not.toHaveBeenCalled();
    });

    it('game.currentExam null -> returns immediately, no DOM mutation, no throw', () => {
        const { game, completeCourse, play, showToast } = makeGame({ score: 0, total: 0 });
        game.currentExam = null;
        const questionsEl = document.getElementById('exam-questions');
        const resultsEl = document.getElementById('exam-results');

        expect(() => finishExam(game)).not.toThrow();
        expect(questionsEl.classList.contains('hidden')).toBe(false);
        expect(resultsEl.classList.contains('hidden')).toBe(false);
        expect(document.getElementById('exam-score').textContent).toBe('');
        expect(document.getElementById('exam-status').textContent).toBe('');
        expect(completeCourse).not.toHaveBeenCalled();
        expect(play).not.toHaveBeenCalled();
        expect(showToast).not.toHaveBeenCalled();
    });

    it('game.currentExam undefined -> returns immediately, no DOM mutation, no throw', () => {
        const { game } = makeGame({ score: 0, total: 0 });
        delete game.currentExam;

        expect(() => finishExam(game)).not.toThrow();
        expect(document.getElementById('exam-score').textContent).toBe('');
        expect(document.getElementById('exam-status').textContent).toBe('');
    });

    it('game.currentExam.questions not an array -> returns immediately without throwing on .length', () => {
        const { game, completeCourse, play, showToast } = makeGame({ score: 0, total: 0 });
        game.currentExam.questions = 'not-an-array';

        expect(() => finishExam(game)).not.toThrow();
        expect(document.getElementById('exam-score').textContent).toBe('');
        expect(document.getElementById('exam-status').textContent).toBe('');
        expect(completeCourse).not.toHaveBeenCalled();
        expect(play).not.toHaveBeenCalled();
        expect(showToast).not.toHaveBeenCalled();
    });

    it('on pass, completeCourse is called with exam.courseId; on fail, it is NOT called', () => {
        const pass = makeGame({ score: 8, total: 10, courseId: 'course_pass' });
        finishExam(pass.game);
        expect(pass.completeCourse).toHaveBeenCalledTimes(1);
        expect(pass.completeCourse).toHaveBeenCalledWith('course_pass');

        const fail = makeGame({ score: 1, total: 10, courseId: 'course_fail' });
        finishExam(fail.game);
        expect(fail.completeCourse).not.toHaveBeenCalled();
    });
});
