import { GENERATED_DATA_SCIENCE_TASKS } from '../data/generated_datascience_tasks.js';
import { BOSSES } from '../data/bosses.js';
import { generateBossTask, getDifficultyRangeForRank } from './TaskUtils.js';

class TaskSystem {
    constructor(playerRank) {
        this.playerRank = playerRank;
        this.currentTask = null;
        this.availableTasks = this.getAvailableTasksForRank();
    }

    getAvailableTasksForRank() {
        const { minDifficulty, maxDifficulty } = getDifficultyRangeForRank(this.playerRank);
        return GENERATED_DATA_SCIENCE_TASKS.filter(task => task.difficulty >= minDifficulty && task.difficulty <= maxDifficulty);
    }

    assignNewTask() {
        if (this.availableTasks.length === 0) {
            console.error('No available tasks for the current player rank.');
            return;
        }

        const randomIndex = Math.floor(Math.random() * this.availableTasks.length);
        this.currentTask = this.availableTasks[randomIndex];
        this.availableTasks.splice(randomIndex, 1);

        console.log(`Assigned new task: ${this.currentTask.name} (Difficulty: ${this.currentTask.difficulty})`);
    }

    completeCurrentTask(success) {
        if (!this.currentTask) {
            console.error('No current task to complete.');
            return;
        }

        const boss = BOSSES.find(boss => boss.id === this.currentTask.assignedBy);
        if (!boss) {
            console.error('No boss found for the current task.');
            return;
        }

        if (success) {
            console.log(boss.successResponses[Math.floor(Math.random() * boss.successResponses.length)]);
        } else {
            console.log(boss.failResponses[Math.floor(Math.random() * boss.failResponses.length)]);
        }

        this.assignNewTask();
    }
}

export default TaskSystem;