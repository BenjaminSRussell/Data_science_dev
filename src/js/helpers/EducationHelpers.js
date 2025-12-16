/**
 * EducationHelpers.js
 * Helper functions for education system, exams, and certifications
 */

/**
 * Handle starting an exam
 */
export function handleStartExam(game, courseId) {
    const course = game.gameState.educationSystem.courses[courseId];
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
    optsContainer.innerHTML = '';

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
    const exam = game.currentExam;
    const total = exam.questions.length;
    const pct = Math.round((exam.score / total) * 100);
    const passed = pct >= 70;

    document.getElementById('exam-questions').classList.add('hidden');
    document.getElementById('exam-results').classList.remove('hidden');

    document.getElementById('exam-score').textContent = pct;
    const statusEl = document.getElementById('exam-status');
    statusEl.textContent = passed ? "PASSED!" : "FAILED";
    statusEl.className = passed ? 'success-text' : 'error-text';

    if (passed) {
        game.gameState.educationSystem.completeCourse(exam.courseId);
        game.audioManager.play('kaching');
        game.showToast(`Passed ${exam.courseId}!`, 'success');
    } else {
        game.audioManager.play('error');
        game.showToast('Failed the exam.', 'error');
    }

    document.getElementById('btn-close-exam').onclick = () => {
        const modal = document.getElementById('modal-exam');
        modal.classList.remove('active');
        modal.classList.add('hidden');
        game.updateMapScreen();
    };
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




