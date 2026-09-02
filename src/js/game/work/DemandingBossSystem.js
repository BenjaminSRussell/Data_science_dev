/**
 * DemandingBossSystem.js
 * Manages task evaluation, boss messages, and dialogue based on employee satisfaction.
 */

export class DemandingBossSystem {
    constructor(satisfaction) {
        this.satisfaction = satisfaction;
    }

    /**
     * Evaluate task quality and timeliness
     * @param {Object} task - Task details
     * @param {number} quality - Quality score (0-100)
     * @param {boolean} onTime - Whether the task was completed on time
     */
    evaluateTask(task, quality, onTime) {
        let change = 0;

        if (quality >= 80) {
            change += 10;
        } else if (quality < 60) {
            change -= 15;
        } else {
            change += 0;
        }

        if (onTime) {
            change += 5;
        } else {
            change -= 10;
        }

        // Clamp satisfaction to [0, 100]
        this.satisfaction = Math.min(100, Math.max(0, this.satisfaction + change));
    }

    /**
     * Get boss message based on satisfaction change
     * @param {number} change - Satisfaction change
     * @returns {string} - Boss message
     */
    getBossMessage(change) {
        if (change > 5) {
            return "You're doing great!";
        } else if (change < -5) {
            return "You need to improve!";
        } else {
            return "Keep it going.";
        }
    }

    /**
     * Get boss dialogue based on current satisfaction
     * @returns {string} - Boss dialogue
     */
    getBossDialogue() {
        if (this.satisfaction < 30) {
            return "I'm disappointed in your work.";
        } else if (this.satisfaction < 60) {
            return "Your performance is average.";
        } else {
            return "You're doing a great job!";
        }
    }
}