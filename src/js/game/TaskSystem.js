import { BOSSES } from './Bosses.js';
import { COMPREHENSIVE_DATA_SCIENCE_TASKS } from '../data/comprehensive_datascience_tasks.js';
import { TASKS } from '../data/tasks.js';

export class TaskSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.lastSortCol = -1;
        this.lastSortAsc = true;
        this.currentTableData = null;
        this.originalTableData = null;
    }

    /**
     * Generate a new task for the player
     */
    generateTask() {
        const allTasks = COMPREHENSIVE_DATA_SCIENCE_TASKS && COMPREHENSIVE_DATA_SCIENCE_TASKS.length > 0
            ? COMPREHENSIVE_DATA_SCIENCE_TASKS
            : TASKS; // Ensure TASKS is reachable

        const taskTemplate = this.selectTaskTemplate(allTasks);
        const task = this.createTaskFromTemplate(taskTemplate);

        this.gameState.currentTask = task;
        this.updateBossDialogue();
        return task;
    }

    /**
     * Select a task template from the available tasks
     */
    selectTaskTemplate(tasks) {
        // Randomly select a task template
        const index = Math.floor(Math.random() * tasks.length);
        return tasks[index];
    }

    /**
     * Create a task object from a template
     */
    createTaskFromTemplate(template) {
        const boss = BOSSES[Math.floor(Math.random() * BOSSES.length)];
        const data = this.generateRandomData(template.dataType);

        return {
            id: `task_${Date.now()}`,
            template: template,
            boss: boss,
            data: data,
            requirements: template.requirements,
            optimalChartTypes: template.optimalChartTypes,
            potentialReward: this.calculatePotentialReward(template.difficulty),
            startTime: Date.now()
        };
    }

    /**
     * Generate random data based on the data type
     */
    generateRandomData(dataType) {
        switch (dataType) {
            case 'quarterly_sales':
                return this.generateQuarterlySalesData();
            case 'user_growth':
                return this.generateUserGrowthData();
            case 'demographics':
                return this.generateDemographicsData();
            case 'performance_metrics':
                return this.generatePerformanceData();
            default:
                return this.generateFallbackTask().data; // Fallback to a known good task
        }
    }

    /**
     * Generate quarterly sales data
     */
    generateQuarterlySalesData() {
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        let value = this.randomRange(10000, 50000);
        const sales = quarters.map(() => {
            value = value + this.randomRange(-5000, 5000);
            return Math.max(5000, value);
        });

        return {
            columns: ['Quarter', 'Sales'],
            rows: quarters.map((q, i) => [q, sales[i]]),
            labels: quarters,
            datasets: {
                Sales: sales
            }
        };
    }

    /**
     * Generate user growth data
     */
    generateUserGrowthData() {
        const weeks = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);

        let value = this.randomRange(1000, 5000);
        const trend = weeks.map(() => {
            value = value + this.randomRange(-200, 500);
            return Math.max(500, value);
        });

        return {
            columns: ['Week', 'Users'],
            rows: weeks.map((w, i) => [w, trend[i]]),
            labels: weeks,
            datasets: {
                Users: trend
            }
        };
    }

    /**
     * Generate demographics data
     */
    generateDemographicsData() {
        const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];

        const counts = [
            this.randomRange(15, 25),
            this.randomRange(25, 35),
            this.randomRange(20, 30),
            this.randomRange(10, 20),
            this.randomRange(5, 15)
        ];

        return {
            columns: ['Age Group', 'Percentage'],
            rows: ageGroups.map((a, i) => [a, counts[i]]),
            labels: ageGroups,
            datasets: {
                Percentage: counts
            }
        };
    }

    /**
     * Generate performance metrics data
     */
    generatePerformanceData() {
        const metrics = ['Speed', 'Quality', 'Efficiency', 'Satisfaction', 'Reliability'];

        const scores = metrics.map(() => this.randomRange(60, 100));

        return {
            columns: ['Metric', 'Score'],
            rows: metrics.map((m, i) => [m, scores[i]]),
            labels: metrics,
            datasets: {
                Score: scores
            }
        };
    }

    /**
     * Generate a fallback task
     */
    generateFallbackTask() {
        return {
            id: `task_${Date.now()}`,
            template: {
                name: 'Basic Sales Report',
                description: 'Create a visualization showing quarterly sales performance.',
                dataType: 'quarterly_sales',
                requirements: ['Show trends', 'Compare values'],
                optimalChartTypes: ['bar', 'line']
            },
            boss: BOSSES[0],
            data: this.generateQuarterlySalesData(),
            requirements: ['Show trends', 'Compare values'],
            optimalChartTypes: ['bar', 'line'],
            potentialReward: 150,
            startTime: Date.now()
        };
    }

    /**
     * Update boss dialogue based on current task
     */
    updateBossDialogue() {
        const task = this.gameState.currentTask;
        if (!task) return;

        const dialogueEl = document.getElementById('boss-dialogue');
        const nameEl = document.getElementById('boss-name');
        const titleEl = document.getElementById('boss-title');
        const avatarEl = document.getElementById('boss-avatar');
        const moodEl = document.getElementById('boss-mood');

        if (dialogueEl) {
            dialogueEl.querySelector('p').textContent = task.boss.taskIntro || task.template.description;
        }
        if (nameEl) nameEl.textContent = task.boss.name;
        if (titleEl) titleEl.textContent = task.boss.title;
        if (avatarEl) avatarEl.textContent = task.boss.avatar || '';
        if (moodEl) moodEl.textContent = task.boss.mood || '';

        // Update task display
        const taskDesc = document.querySelector('.task-description');
        if (taskDesc) taskDesc.textContent = task.template.description;

        const taskReward = document.getElementById('task-reward');
        if (taskReward) taskReward.textContent = `$${task.potentialReward}`;

        // Update requirements
        const reqContainer = document.querySelector('.task-requirements');
        if (reqContainer) {
            reqContainer.innerHTML = task.requirements
                .map(r => `<span class="requirement-tag">${r}</span>`)
                .join('');
        }

        // Update data table
        this.currentTableData = JSON.parse(JSON.stringify(task.data)); // Deep copy to avoid mutating original task data permanently
        this.originalTableData = JSON.parse(JSON.stringify(task.data)); // Backup for resetting
        this.updateDataTable(this.currentTableData);
    }

    /**
     * Update the data table display
     */
    updateDataTable(data) {
        const table = document.getElementById('data-table');
        if (!table || !data) return;

        // Setup filter listener if not already done (idempotent)
        const filterInput = document.getElementById('table-filter');
        if (filterInput && !filterInput.dataset.listening) {
            filterInput.dataset.listening = 'true';
            filterInput.addEventListener('input', (e) => this.handleTableFilter(e.target.value));
        }

        // Update header
        const thead = table.querySelector('thead tr');
        thead.innerHTML = data.columns.map((c, i) =>
            `<th class="sortable-header" onclick="game.gameState.taskSystem.handleTableSort(${i})">${c} Ã¢â€ â€¢</th>`
        ).join('');

        // Update body
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = data.rows.map(row =>
            `<tr>${row.map((cell, cellIndex) => {
                if (typeof cell !== 'number') return `<td>${cell}</td>`;
                
                // Check column name to determine formatting
                const columnName = data.columns[cellIndex]?.toLowerCase() || '';
                const isCurrency = columnName.includes('revenue') || 
                                 columnName.includes('expense') || 
                                 columnName.includes('profit') || 
                                 columnName.includes('money') ||
                                 columnName.includes('cost') ||
                                 columnName.includes('price') ||
                                 columnName.includes('salary') ||
                                 columnName.includes('budget');
                
                // Format based on column type
                if (isCurrency) {
                    return `<td class="currency-cell">$${cell.toLocaleString()}</td>`;
                } else if (columnName.includes('percentage') || columnName.includes('percent')) {
                    return `<td class="percentage-cell">${cell}%</td>`;
                } else {
                    // Regular number (users, count, etc.)
                    return `<td class="number-cell">${cell.toLocaleString()}</td>`;
                }
            }).join('')}</tr>`
        ).join('');
    }

    handleTableSort(colIndex) {
        if (this.currentTableData && this.currentTableData.rows) {
            const sortedData = this.currentTableData.rows.slice().sort((a, b) => {
                if (a[colIndex] === b[colIndex]) return 0;
                if (this.lastSortCol === colIndex) {
                    return a[colIndex] < b[colIndex] ? 1 : -1;
                }
                return a[colIndex] < b[colIndex] ? -1 : 1;
            });

            this.currentTableData.rows = sortedData;
            this.updateDataTable(this.currentTableData);
            this.lastSortCol = colIndex;
            this.lastSortAsc = !this.lastSortAsc;
        }
    }

    handleTableFilter(filterValue) {
        if (this.originalTableData && this.originalTableData.rows) {
            const filteredData = {
                ...this.originalTableData,
                rows: this.originalTableData.rows.filter(row =>
                    row.some(cell => cell.toString().toLowerCase().includes(filterValue.toLowerCase()))
                )
            };
            this.updateDataTable(filteredData);
        }
    }

    /**
     * Calculate the potential reward for a task based on its difficulty
     */
    calculatePotentialReward(difficulty) {
        return (difficulty + 1) * 100;
    }
}