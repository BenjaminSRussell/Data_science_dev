/**
 * EducationHelpers.js
 * Helper functions for education system, exams, and certifications
 */

/**
 * Handle starting an exam
 */
export function handleStartExam(game, courseId) {
    const course = game.gameState.educationSystem.courses[courseId];
    if (!course) {
        game.showToast('Course not found!', 'error');
        game.audioManager.play('error');
        return;
    }
    if (game.gameState.money < course.cost) {
        game.showToast('Tuition too high!', 'error');
        game.audioManager.play('error');
        return;
    }

    // Pay tuition
    game.gameState.money -= course.cost;
    game.uiUpdater.updateAllUI();

    game.currentExam = {
        courseId: courseId,
        questions: course.questions,
        currentQuestionIndex: 0,
        score: 0
    };

    // Show Modal
    const modal = document.getElementById('modal-exam');
    modal.classList.remove('hidden');
    modal.classList.add('active');

    document.getElementById('exam-title').textContent = `${course.name} Exam`;
    document.getElementById('exam-intro').classList.remove('hidden');
    document.getElementById('exam-questions').classList.add('hidden');
    document.getElementById('exam-results').classList.add('hidden');

    // Bind Start Button
    document.getElementById('btn-start-exam').onclick = () => startExamQuestions(game);

    // Bind Close Button
    document.querySelector('#modal-exam .close-modal').onclick = () => {
        modal.classList.remove('active');
        modal.classList.add('hidden');
    };
}

/**
 * Start the exam questions phase
 */
export function startExamQuestions(game) {
    document.getElementById('exam-intro').classList.add('hidden');
    document.getElementById('exam-questions').classList.remove('hidden');
    showExamQuestion(game);
}

/**
 * Show the current exam question
 */
export function showExamQuestion(game) {
    const exam = game.currentExam;
    const q = exam.questions[exam.currentQuestionIndex];

    document.getElementById('question-text').textContent = `${exam.currentQuestionIndex + 1}. ${q.q}`;

    const optsContainer = document.getElementById('options-container');
    optsContainer.textContent = '';

    q.options.forEach((opt, idx) => {
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
    const q = exam.questions[exam.currentQuestionIndex];

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
    const passed = pct >= 70;

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
            const modal = document.getElementById('modal-exam');
            if (modal) {
                modal.classList.remove('active');
                modal.classList.add('hidden');
            }
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
        game.updateMapScreen();
    } else {
        game.showToast(result.message, 'error');
        game.audioManager.play('error');
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





