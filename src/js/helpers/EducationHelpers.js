/**
 * EducationHelpers.js
 * Helper functions for education system, exams, and certifications
 */
import * as MapHelpers from './MapHelpers.js';
import { EducationSystem } from '../game/EducationSystem.js';

let examKeyHandler = null;
let examReturnFocus = null;

/**
 * Open the exam modal as a real overlay (styled by .modal in main.css):
 * focus moves into it and Escape closes it (#2290)
 */
export function openExamModal(modal) {
    if (!modal) return;
    examReturnFocus = document.activeElement;
    modal.classList.remove('hidden');
    modal.classList.add('active');
    if (examKeyHandler) document.removeEventListener('keydown', examKeyHandler);
    examKeyHandler = (e) => {
        if (e.key === 'Escape') closeExamModal(modal);
    };
    document.addEventListener('keydown', examKeyHandler);
    modal.querySelector('button')?.focus?.();
}

/**
 * Close the exam modal and give focus back to what opened it
 */
export function closeExamModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.classList.add('hidden');
    if (examKeyHandler) {
        document.removeEventListener('keydown', examKeyHandler);
        examKeyHandler = null;
    }
    if (examReturnFocus && document.contains(examReturnFocus)) examReturnFocus.focus?.();
    examReturnFocus = null;
}


/**
 * Handle starting an exam
 */
export function handleStartExam(game, courseId) {
    const course = game.gameState?.educationSystem?.courses?.[courseId];
    if (!course) {
        game.showToast?.('Unknown course.', 'error');
        return;
    }
    const edu = game.gameState.educationSystem;
    if (edu.completedCourses.includes(courseId)) {
        game.showToast?.('Course already completed.', 'info');
        return;
    }
    if (game.gameState.money < course.cost) {
        game.showToast?.('Tuition too high!', 'error');
        game.audioManager?.play?.('error');
        return;
    }
    if (!Array.isArray(course.questions) || course.questions.length === 0) {
        game.showToast?.('This exam has no questions yet.', 'error');
        return;
    }
    // Check the exam modal exists before charging, so a missing modal can't
    // take the tuition and then throw
    const modal = document.getElementById('modal-exam');
    if (!modal) {
        game.showToast?.('Exam room unavailable right now.', 'error');
        return;
    }

    // Check enrollment (completed, prerequisites, affordability) up front,
    // but only charge tuition when the player actually starts the exam, so
    // closing the intro costs nothing (#1270, #1426, #1640)
    const check = typeof edu.canEnroll === 'function' ? edu.canEnroll(courseId) : { success: true };
    if (!check?.success) {
        game.showToast?.(check?.message || 'Cannot enroll.', 'error');
        game.audioManager?.play?.('error');
        return;
    }

    game.currentExam = {
        courseId: courseId,
        questions: course.questions,
        currentQuestionIndex: 0,
        score: 0,
        paid: false
    };

    // Show Modal
    openExamModal(modal);

    const byId = (id) => document.getElementById(id);
    if (byId('exam-title')) byId('exam-title').textContent = `${course.name} Exam`;
    byId('exam-intro')?.classList.remove('hidden');
    const passEl = byId('exam-pass-requirement');
    if (passEl) {
        const total = course.questions.length;
        passEl.textContent = `To pass: ${EducationSystem.requiredCorrect(total)} of ${total} correct`;
    }
    byId('exam-questions')?.classList.add('hidden');
    byId('exam-results')?.classList.add('hidden');

    // Bind Start Button
    const startBtn = byId('btn-start-exam');
    if (startBtn) startBtn.onclick = () => startExamQuestions(game);

    // Bind Close Button
    const closeBtn = document.querySelector('#modal-exam .close-modal');
    if (closeBtn) {
        closeBtn.onclick = () => closeExamModal(modal);
    }
}

/**
 * Start the exam questions phase
 */
export function startExamQuestions(game) {
    const exam = game?.currentExam;
    if (exam && exam.paid === false && !payTuition(game, exam)) return;
    document.getElementById('exam-intro')?.classList.add('hidden');
    document.getElementById('exam-questions')?.classList.remove('hidden');
    showExamQuestion(game);
}

/**
 * Charge tuition through EducationSystem.enroll, the one place that guards
 * completed courses, prerequisites and affordability (#1426, #1640). Called
 * when the exam starts, not when the intro opens (#1270)
 */
function payTuition(game, exam) {
    const edu = game.gameState?.educationSystem;
    const cost = edu?.courses?.[exam.courseId]?.cost || 0;
    let enrolled;
    if (typeof edu?.enroll === 'function') {
        enrolled = edu.enroll(exam.courseId);
    } else if (game.gameState.money >= cost) {
        game.gameState.money -= cost;
        enrolled = { success: true };
    } else {
        enrolled = { success: false, message: 'Cannot afford tuition.' };
    }
    if (!enrolled?.success) {
        game.showToast?.(enrolled?.message || 'Cannot enroll.', 'error');
        game.audioManager?.play?.('error');
        closeExamModal(document.getElementById('modal-exam'));
        game.currentExam = null;
        return false;
    }
    exam.paid = true;
    game.uiUpdater?.updateAllUI?.();
    return true;
}

/**
 * Show the current exam question
 */
export function showExamQuestion(game) {
    const exam = game.currentExam;
    const q = exam?.questions?.[exam.currentQuestionIndex];
    if (!q) return;

    const textEl = document.getElementById('question-text');
    if (textEl) textEl.textContent = `${exam.currentQuestionIndex + 1}. ${q.q}`;

    const optsContainer = document.getElementById('options-container');
    if (!optsContainer) return;
    optsContainer.textContent = '';

    (q.options || []).forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-cartoon';
        btn.textContent = opt;
        btn.onclick = () => handleAnswerQuestion(game, idx);
        optsContainer.appendChild(btn);
    });
}

/**
 * Handle answering a question
 */
export function handleAnswerQuestion(game, answerIndex) {
    const exam = game.currentExam;
    const q = exam?.questions?.[exam.currentQuestionIndex];
    // Ignore stray clicks after the exam ended (double-click on the last answer)
    if (!q) return;

    // Neutral click for each answer, so the final result isn't given away (#1237)
    game.audioManager?.play?.('click');

    if (answerIndex === q.correct) {
        exam.score++;
    }

    exam.currentQuestionIndex++;

    if (exam.currentQuestionIndex < exam.questions.length) {
        showExamQuestion(game);
    } else {
        finishExam(game);
    }
}

/**
 * Finish the exam and show results
 */
export function finishExam(game) {
    if (!game || !game.currentExam) return;

    const exam = game.currentExam;
    if (!exam.questions || !Array.isArray(exam.questions)) return;

    const total = exam.questions.length;
    const score = exam.score || 0;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    // Pass on a count of correct answers, matching what the intro shows (#1265)
    const passed = total > 0 && score >= EducationSystem.requiredCorrect(total);

    const questionsEl = document.getElementById('exam-questions');
    const resultsEl = document.getElementById('exam-results');
    const scoreEl = document.getElementById('exam-score');
    const statusEl = document.getElementById('exam-status');

    if (questionsEl) questionsEl.classList.add('hidden');
    if (resultsEl) resultsEl.classList.remove('hidden');
    if (scoreEl) scoreEl.textContent = pct;

    if (statusEl) {
        statusEl.textContent = passed ? "PASSED!" : "FAILED";
        statusEl.className = passed ? 'success-text' : 'error-text';
    }

    if (passed && game.gameState?.educationSystem && exam.courseId) {
        if (game.gameState.educationSystem.completeCourse) {
            game.gameState.educationSystem.completeCourse(exam.courseId);
        }
        if (game.audioManager?.play) {
            game.audioManager.play('kaching');
        }
        if (game.showToast) {
            game.showToast(`Passed ${exam.courseId}!`, 'success');
        }
    } else if (!passed) {
        if (game.audioManager?.play) {
            game.audioManager.play('error');
        }
        if (game.showToast) {
            game.showToast('Failed the exam.', 'error');
        }
    }

    const closeBtn = document.getElementById('btn-close-exam');
    if (closeBtn) {
        closeBtn.onclick = () => {
            closeExamModal(document.getElementById('modal-exam'));
            if (game.updateMapScreen) {
                game.updateMapScreen();
            }
        };
    }
}

/**
 * Handle buying a license
 */
export function handleBuyLicense(game, licenseId) {
    if (!game.gameState.legalSystem) return;
    const result = game.gameState.legalSystem.acquireLicense(licenseId);
    if (result.success) {
        game.showToast(result.message, 'success');
        game.audioManager.play('kaching');
        // Rebuild City Hall's buttons so the purchase shows as owned (#1163, #2377)
        MapHelpers.refreshLocationActions?.(game);
        game.updateMapScreen();
        game.uiUpdater?.updateAllUI?.();
    } else {
        game.showToast(result.message, 'error');
        game.audioManager.play('error');
    }
}

/**
 * Handle retaining a lawyer at City Hall (#1535)
 */
export function handleHireLawyer(game, tier) {
    const legal = game.gameState.legalSystem;
    if (!legal) return;
    const result = legal.hireLawyer(tier);
    if (result.success) {
        game.showToast(`${result.message} Arrest fines, sentences and audit fines are now reduced.`, 'success');
        game.audioManager?.play?.('kaching');
        MapHelpers.refreshLocationActions?.(game);
        game.uiUpdater?.updateAllUI?.();
    } else {
        game.showToast(result.message, 'error');
        game.audioManager?.play?.('error');
    }
}

/**
 * Handle learning a library skill
 */
export function handleLearnLibrary(game, libId, LIBRARY_CONTENT) {
    if (!game.gameState.unlockedLibraries) game.gameState.unlockedLibraries = [];
    if (game.gameState.unlockedLibraries.includes(libId)) return;

    const lib = LIBRARY_CONTENT.find(l => l.id === libId);
    if (!lib) return;

    // The rank requirement was only a disabled button; enforce it here (#1267)
    const rankIndex = Number(game.gameState.rankIndex) || 0;
    if (rankIndex < (Number(lib.reqLevel) || 1) - 1) {
        game.showError(`Requires a higher rank to learn ${lib.name}.`);
        return;
    }

    if (game.gameState.money < lib.cost) {
        game.showError("Not enough money!");
        return;
    }

    game.gameState.money -= lib.cost;
    game.gameState.unlockedLibraries.push(libId);

    game.showToast(`Learned ${lib.name}!`, 'success');
    game.audioManager.play('kaching');
    game.uiUpdater.updateAllUI();
    game.uiUpdater.updateLibraryScreen();
}





