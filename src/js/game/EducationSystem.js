/**
 * EducationSystem.js
 * Manages university courses, degrees, and real-world exams.
 */
export class EducationSystem {
    // Share of questions needed to pass. With every course at 3+ questions
    // this is reachable without a perfect score (#1265)
    static PASS_RATIO = 0.6;

    // What a degree is worth once earned (#949)
    static DEGREE_REWARDS = {
        bootcamp: { reputation: 25, stats: { intelligence: 40 } },
        bachelors: { reputation: 60, stats: { intelligence: 80, analytics: 40 } },
        masters: { reputation: 120, stats: { intelligence: 120, analytics: 80 } }
    };

    /**
     * Correct answers needed to pass an exam of `total` questions
     */
    static requiredCorrect(total) {
        const n = Math.max(0, Number(total) || 0);
        return n === 0 ? 0 : Math.max(1, Math.ceil(n * EducationSystem.PASS_RATIO - 1e-9));
    }

    constructor(gameState) {
        this.gameState = gameState;

        this.degrees = {
            bootcamp: { name: "Data Science Bootcamp", acquired: false, reqs: ['python_101', 'sql_101'] },
            bachelors: { name: "B.S. Computer Science", acquired: false, reqs: ['python_201', 'stats_201', 'ml_intro'] },
            masters: { name: "M.S. Data Science", acquired: false, reqs: ['advanced_ml', 'deep_learning', 'ethics_ai'] }
        };

        this.completedCourses = [];

        // Question Bank
        this.courses = {
            'python_101': {
                id: 'python_101',
                name: "Python 101",
                cost: 500,
                prereqs: [],
                description: "Learn the basics of Python programming.",
                questions: [
                    { q: "What is the correct file extension for Python files?", options: [".pt", ".py", ".pyt", ".python"], correct: 1 },
                    { q: "Which of these is NOT a valid variable name?", options: ["my_var", "2variable", "_var", "var2"], correct: 1 },
                    { q: "What is the output of print(2 ** 3)?", options: ["6", "8", "9", "5"], correct: 1 }
                ]
            },
            'sql_101': {
                id: 'sql_101',
                name: "SQL Fundamentals",
                cost: 500,
                prereqs: [],
                description: "Master database querying.",
                questions: [
                    { q: "Which statement is used to extract data from a database?", options: ["GET", "OPEN", "SELECT", "EXTRACT"], correct: 2 },
                    { q: "Which clause is used to filter records?", options: ["WHERE", "FILTER", "WHEN", "IF"], correct: 0 },
                    { q: "How do you select all columns from a table named 'Users'?", options: ["SELECT all FROM Users", "SELECT * FROM Users", "SELECT Users", "GET Users"], correct: 1 }
                ]
            },
            'stats_201': {
                id: 'stats_201',
                name: "Statistics for DS",
                cost: 1000,
                prereqs: ['python_101'],
                description: "Probability distributions and hypothesis testing.",
                questions: [
                    { q: "What is the median of [1, 3, 3, 6, 7, 8, 9]?", options: ["3", "6", "7", "5.2"], correct: 1 },
                    { q: "In a normal distribution, what % of data falls within 1 SD?", options: ["50%", "68%", "95%", "99%"], correct: 1 },
                    { q: "A p-value below 0.05 usually means...", options: ["The null hypothesis is proven", "The result is statistically significant", "The sample is too small", "The effect is large"], correct: 1 }
                ]
            },
            'ml_intro': {
                id: 'ml_intro',
                name: "Intro to Machine Learning",
                cost: 1500,
                prereqs: ['python_101', 'sql_101'],
                description: "Supervised vs Unsupervised learning.",
                questions: [
                    { q: "Which of these is a Supervised Learning algorithm?", options: ["K-Means", "Linear Regression", "PCA", "Apriori"], correct: 1 },
                    { q: "What is 'Overfitting'?", options: ["Model is too simple", "Model memorizes noise", "Model is too slow", "Data is missing"], correct: 1 },
                    { q: "Why hold out a test set?", options: ["To train faster", "To estimate performance on unseen data", "To remove outliers", "To balance classes"], correct: 1 }
                ]
            },
            'python_201': {
                id: 'python_201',
                name: "Python 201",
                cost: 1000,
                description: "Advanced Python: OOP, decorators, and data structures.",
                questions: [
                    { q: "Which keyword defines a class in Python?", options: ["class", "def", "struct", "object"], correct: 0 },
                    { q: "What does a decorator do?", options: ["Deletes a function", "Modifies a function's behavior", "Compiles Python to C", "Imports a module"], correct: 1 },
                    { q: "Which of these is a mutable data structure?", options: ["tuple", "str", "list", "frozenset"], correct: 2 }
                ]
            },
            'advanced_ml': {
                id: 'advanced_ml',
                name: "Advanced Machine Learning",
                cost: 2500,
                description: "Ensembles, regularization, and model tuning.",
                questions: [
                    { q: "Which algorithm builds an ensemble of decision trees?", options: ["Random Forest", "K-Means", "Naive Bayes", "Linear Regression"], correct: 0 },
                    { q: "L2 regularization is also known as?", options: ["Ridge", "Lasso", "Dropout", "Bagging"], correct: 0 },
                    { q: "Which metric is best for imbalanced classification?", options: ["Accuracy", "F1 Score", "MSE", "R-squared"], correct: 1 }
                ]
            },
            'deep_learning': {
                id: 'deep_learning',
                name: "Deep Learning",
                cost: 3000,
                description: "Neural networks, backpropagation, and CNNs.",
                questions: [
                    { q: "What is the purpose of backpropagation?", options: ["Shuffle the data", "Update weights using gradients", "Drop out neurons", "Normalize inputs"], correct: 1 },
                    { q: "Which architecture is best for image classification?", options: ["CNN", "RNN", "Decision Tree", "SVM"], correct: 0 },
                    { q: "What does a ReLU activation output for x = -3?", options: ["-3", "3", "0", "1"], correct: 2 }
                ]
            },
            'ethics_ai': {
                id: 'ethics_ai',
                name: "Ethics in AI",
                cost: 2000,
                description: "Bias, fairness, and responsible AI practices.",
                questions: [
                    { q: "What is 'algorithmic bias'?", options: ["A bug in the code", "Systematic unfairness in model outputs", "Slow training", "Missing data"], correct: 1 },
                    { q: "Which principle requires models to be understandable to users?", options: ["Transparency", "Profitability", "Scalability", "Latency"], correct: 0 },
                    { q: "What is a key concern with training on biased data?", options: ["Faster inference", "Reinforcing existing inequalities", "Lower memory use", "Simpler models"], correct: 1 }
                ]
            }
        };
    }

    enroll(courseId) {
        if (this.completedCourses.includes(courseId)) return { success: false, message: "Course already completed." };

        const course = this.courses[courseId];
        if (!course) return { success: false, message: "Unknown course." };
        const missingPrereqs = (course.prereqs || []).filter(p => !this.completedCourses.includes(p));
        if (missingPrereqs.length > 0) {
            const names = missingPrereqs.map(p => this.courses[p]?.name || p).join(', ');
            return { success: false, message: `Prerequisites not met: ${names}.` };
        }
        if (this.gameState.money < course.cost) return { success: false, message: "Cannot afford tuition." };

        this.gameState.money -= course.cost;
        return { success: true, message: `Enrolled in ${course.name}. Good luck!` };
    }

    completeCourse(courseId) {
        // Only real catalog courses count (#1424)
        if (!this.courses[courseId]) return false;
        if (!this.completedCourses.includes(courseId)) {
            this.completedCourses.push(courseId);

            // Award direct rewards based on course
            const course = this.courses[courseId];
            if (course) {
                const reward = this.calculateCourseReward(course);

                // Award XP to relevant stats
                if (this.gameState.characterStats) {
                    for (const [stat, xp] of Object.entries(reward.stats)) {
                        this.gameState.characterStats.addExperience(stat, xp);
                    }
                }

                // Award money
                this.gameState.money += reward.money;

                // Award reputation
                this.gameState.reputation += reward.reputation;
            }

            this.checkDegrees();
            return true;
        }
        return false;
    }

    calculateCourseReward(course) {
        // Map course ID to reward based on course subject and cost
        const rewardMap = {
            'python_101': { stats: { intelligence: 50, analytics: 30 }, money: 100, reputation: 10 },
            'sql_101': { stats: { intelligence: 50, analytics: 30 }, money: 100, reputation: 10 },
            'stats_201': { stats: { analytics: 80, intelligence: 40 }, money: 200, reputation: 20 },
            'ml_intro': { stats: { intelligence: 80, analytics: 60 }, money: 250, reputation: 25 }
        };

        return rewardMap[course.id] || { stats: { intelligence: 30, analytics: 20 }, money: 50, reputation: 5 };
    }

    checkDegrees({ silent = false } = {}) {
        const earned = [];
        for (const [key, degree] of Object.entries(this.degrees)) {
            if (!degree.acquired && degree.reqs.every(r => this.completedCourses.includes(r))) {
                degree.acquired = true;
                earned.push(key);
                if (silent) continue; // re-deriving on load: no news, no double rewards
                this.gameState.newsManager?.addNews({ text: `Player earned a ${degree.name}!`, category: 'career', sentiment: 'positive' });
                this.applyDegreeReward(key);
            }
        }
        return earned;
    }

    /** A degree now pays off: reputation plus stat XP (#949) */
    applyDegreeReward(key) {
        const reward = EducationSystem.DEGREE_REWARDS[key];
        if (!reward || !this.gameState) return null;
        this.gameState.reputation = (Number(this.gameState.reputation) || 0) + reward.reputation;
        const stats = this.gameState.characterStats;
        if (typeof stats?.addExperience === 'function') {
            for (const [stat, xp] of Object.entries(reward.stats)) stats.addExperience(stat, xp);
        }
        this.gameState.showToast?.(`${this.degrees[key]?.name}: +${reward.reputation} reputation`, 'success');
        return reward;
    }

    hasDegree(key) {
        return !!this.degrees[key]?.acquired;
    }

    // Serialization
    toJSON() {
        return {
            completedCourses: this.completedCourses,
            degrees: this.degrees
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return;
        // Tolerate a corrupt list: keep unique catalog course ids only (#1425)
        const list = Array.isArray(data.completedCourses) ? data.completedCourses : [];
        this.completedCourses = [...new Set(list.filter(id => typeof id === 'string' && this.courses[id]))];
        // Merge degree progress; a bad entry must not abort the load (#2164)
        if (data.degrees && typeof data.degrees === 'object') {
            for (const key in data.degrees) {
                const saved = data.degrees[key];
                if (this.degrees[key] && saved && typeof saved === 'object') {
                    this.degrees[key].acquired = saved.acquired === true;
                }
            }
        }
        // Re-derive from completed courses rather than trusting a frozen flag (#2163)
        this.checkDegrees({ silent: true });
    }
}
