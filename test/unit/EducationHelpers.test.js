/**
 * Unit tests for EducationHelpers
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    handleStartExam,
    handleAnswerQuestion,
    finishExam,
    showExamQuestion
} from '../../src/js/helpers/EducationHelpers.js';

describe('EducationHelpers', () => {
    let mockGame;
    let mockAudioManager;

    beforeEach(() => {
        // Mock audio manager
        mockAudioManager = {
            play: vi.fn()
        };

        // Mock game object
        mockGame = {
            gameState: {
                money: 1000,
                educationSystem: {
                    courses: {
                        'intro_coding': {
                            id: 'intro_coding',
                            name: 'Intro to Coding',
                            cost: 100,
                            questions: [
                                {
                                    q: 'What is 2+2?',
                                    options: ['3', '4', '5'],
                                    correct: 1
                                },
                                {
                                    q: 'What is 5+5?',
                                    options: ['8', '10', '12'],
                                    correct: 1
                                }
                            ]
                        }
                    },
                    completeCourse: vi.fn()
                }
            },
            currentExam: null,
            audioManager: mockAudioManager,
            showToast: vi.fn(),
            uiUpdater: {
                updateAllUI: vi.fn()
            },
            updateMapScreen: vi.fn()
        };

        // Mock DOM
        document.body.innerHTML = `
            <div id="modal-exam" class="hidden">
                <div class="close-modal"></div>
                <div id="exam-title"></div>
                <div id="exam-intro"></div>
                <div id="exam-questions" class="hidden">
                    <div id="question-text"></div>
                    <div id="options-container"></div>
                </div>
                <div id="exam-results" class="hidden">
                    <div id="exam-score"></div>
                    <div id="exam-status"></div>
                </div>
                <button id="btn-start-exam">Start Exam</button>
                <button id="btn-close-exam">Close Exam</button>
            </div>
        `;
    });

    describe('handleAnswerQuestion', () => {
        it('should play success sound when answer is correct', () => {
            // Setup exam state
            mockGame.currentExam = {
                courseId: 'intro_coding',
                questions: mockGame.gameState.educationSystem.courses['intro_coding'].questions,
                currentQuestionIndex: 0,
                score: 0
            };

            // Answer correctly (index 1 is correct for first question)
            handleAnswerQuestion(mockGame, 1);

            // Verify audio was played
            expect(mockAudioManager.play).toHaveBeenCalledWith('success');
        });

        it('should play fail sound when answer is incorrect', () => {
            // Setup exam state
            mockGame.currentExam = {
                courseId: 'intro_coding',
                questions: mockGame.gameState.educationSystem.courses['intro_coding'].questions,
                currentQuestionIndex: 0,
                score: 0
            };

            // Answer incorrectly (index 0 is incorrect for first question)
            handleAnswerQuestion(mockGame, 0);

            // Verify audio was played
            expect(mockAudioManager.play).toHaveBeenCalledWith('fail');
        });

        it('should increment score on correct answer', () => {
            // Setup exam state
            mockGame.currentExam = {
                courseId: 'intro_coding',
                questions: mockGame.gameState.educationSystem.courses['intro_coding'].questions,
                currentQuestionIndex: 0,
                score: 0
            };

            // Answer correctly
            handleAnswerQuestion(mockGame, 1);

            // Verify score was incremented
            expect(mockGame.currentExam.score).toBe(1);
        });

        it('should not increment score on incorrect answer', () => {
            // Setup exam state
            mockGame.currentExam = {
                courseId: 'intro_coding',
                questions: mockGame.gameState.educationSystem.courses['intro_coding'].questions,
                currentQuestionIndex: 0,
                score: 0
            };

            // Answer incorrectly
            handleAnswerQuestion(mockGame, 0);

            // Verify score was not incremented
            expect(mockGame.currentExam.score).toBe(0);
        });

        it('should advance to next question when not at end', () => {
            // Setup exam state
            mockGame.currentExam = {
                courseId: 'intro_coding',
                questions: mockGame.gameState.educationSystem.courses['intro_coding'].questions,
                currentQuestionIndex: 0,
                score: 0
            };

            // Mock showExamQuestion to verify it's called
            const showSpy = vi.fn();
            global.showExamQuestion = showSpy;

            // Answer first question (not last)
            handleAnswerQuestion(mockGame, 1);

            // Verify question index was incremented
            expect(mockGame.currentExam.currentQuestionIndex).toBe(1);
        });
    });

    describe('handleStartExam', () => {
        it('should play error sound when tuition is too high', () => {
            // Set money to be less than course cost
            mockGame.gameState.money = 50;

            handleStartExam(mockGame, 'intro_coding');

            // Verify error sound was played
            expect(mockAudioManager.play).toHaveBeenCalledWith('error');
        });
    });
});
