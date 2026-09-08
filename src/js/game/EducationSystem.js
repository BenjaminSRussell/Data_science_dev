/**
 * EducationSystem - Handles AI education and course enrollment
 */

export class EducationSystem {
    constructor(gameState) {
        this.gameState = gameState;

        // Default education state if not exists
        if (!this.gameState.education) {
            this.gameState.education = {
                completedCourses: [],
                currentCourses: []
            };
        }

        // Example courses (to be replaced with real data)
        this.courses = {
            'intro_ai': { name: 'Introduction to AI', cost: 500, intelligenceBonus: 1 },
            'adv_ai': { name: 'Advanced AI', cost: 2000, intelligenceBonus: 2 },
            'game_dev': { name: 'Game Development', cost: 1500, creativityBonus: 2 }
        };
    }

    /**
     * Enroll in a course
     */
    enroll(courseId) {
        if (this.gameState.education.completedCourses.includes(courseId)) return { success: false, message: "Course already completed." };
        const course = this.courses[courseId];
        if (!course) return { success: false, message: "Invalid course ID." };
        if (this.gameState.money < course.cost) return { success: false, message: "Cannot afford tuition." };

        // Deduct cost
        this.gameState.money -= course.cost;
        this.gameState.education.currentCourses.push(courseId);

        return { success: true, message: `Enrolled in ${course.name}.` };
    }

    /**
     * Complete a course
     */
    complete(courseId) {
        const index = this.gameState.education.currentCourses.indexOf(courseId);
        if (index === -1) return { success: false, message: "Course not currently enrolled." };

        // Remove from current courses
        this.gameState.education.currentCourses.splice(index, 1);
        // Add to completed courses
        this.gameState.education.completedCourses.push(courseId);

        // Apply bonuses
        const course = this.courses[courseId];
        this.gameState.ai.intelligence += course.intelligenceBonus || 0;
        this.gameState.ai.creativity += course.creativityBonus || 0;

        return { success: true, message: `Completed ${course.name}.` };
    }

    toJSON() {
        return {
            completedCourses: this.gameState.education.completedCourses,
            currentCourses: this.gameState.education.currentCourses
        };
    }

    fromJSON(data) {
        if (!data) return;
        Object.assign(this.gameState.education, data);
    }
}