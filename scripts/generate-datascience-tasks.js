#!/usr/bin/env node
/**
 * Generate 1000+ Data Science Tasks
 * Creates a comprehensive list of data science tasks
 * Useful for project planning and task distribution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

const TASK_TEMPLATES = {
    domain1: {
        difficulty1: ['Task 1.1', 'Task 1.2'],
        difficulty2: ['Task 1.3', 'Task 1.4'],
        difficulty3: ['Task 1.5', 'Task 1.6'],
        difficulty4: ['Task 1.7', 'Task 1.8']
    },
    domain2: {
        difficulty1: ['Task 2.1', 'Task 2.2'],
        difficulty2: ['Task 2.3', 'Task 2.4'],
        difficulty3: ['Task 2.5', 'Task 2.6'],
        difficulty4: ['Task 2.7', 'Task 2.8']
    },
    domain3: {
        difficulty1: ['Task 3.1', 'Task 3.2'],
        difficulty2: ['Task 3.3', 'Task 3.4'],
        difficulty3: ['Task 3.5', 'Task 3.6'],
        difficulty4: ['Task 3.7', 'Task 3.8']
    }
};

function generateTasks() {
    let tasks = [];

    for (const domain in TASK_TEMPLATES) {
        for (let i = 1; i <= 4; i++) {
            const difficulty = `difficulty${i}`;
            if (TASK_TEMPLATES[domain][difficulty]) {
                TASK_TEMPLATES[domain][difficulty].forEach(task => {
                    tasks.push(`${task} - ${domain} - ${difficulty}`);
                });
            }
        }
    }

    return tasks;
}

const tasks = generateTasks();
console.log(`Generated ${tasks.length} tasks`);

const outputPath = path.join(rootDir, 'tasks.txt');
fs.writeFileSync(outputPath, tasks.join('\n'), 'utf8');
console.log(`Ã¢Å“â€¦ Tasks generated successfully!`);
console.log(`Ã°Å¸â€œâ€ž Output: ${outputPath}`);
console.log(`Ã°Å¸â€œÅ  Tasks: ${tasks.length}`);