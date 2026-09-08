// TaskSystem.js - Task management and request system

import { gameState } from '../gameState';
import { tasks } from '../../data/comprehensive_datascience_tasks';

// Function to select a task based on player rank
function selectTask() {
    const rankIndex = gameState.rankIndex;
    const maxDifficulty = Math.min(9.8, 1 + rankIndex * 1.2); // Difficulty scales with rank
    const minDifficulty = Math.max(1, maxDifficulty - 2.5); // Ensure a reasonable range

    // Filter tasks within the difficulty range
    const availableTasks = tasks.filter(task => task.difficulty >= minDifficulty && task.difficulty <= maxDifficulty);

    if (availableTasks.length === 0) {
        console.warn("No tasks available within the current difficulty range.");
        return null;
    }

    // Select a random task from the available tasks
    const randomIndex = Math.floor(Math.random() * availableTasks.length);
    return availableTasks[randomIndex];
}

// Function to request a new task
export function requestTask() {
    const task = selectTask();
    if (task) {
        console.log(`Task requested: ${task.title} (Difficulty: ${task.difficulty})`);
    } else {
        console.log("Failed to request a task.");
    }
}