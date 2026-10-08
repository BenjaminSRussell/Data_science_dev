/**
 * TaskSystem - Generates and manages data visualization tasks
 */

import { BOSSES } from '../data/bosses.js';
import { COMPREHENSIVE_DATA_SCIENCE_TASKS } from '../data/comprehensive_datascience_tasks.js';
import { insightHint } from './EconomySystem.js';

export class TaskSystem {
    static MAX_RANK_INDEX = 6;
    static DIFFICULTY_PER_RANK = 1.45;
    // Half-width of each rank's band; bands overlap slightly so 1.0-10 is covered
    static DIFFICULTY_TOLERANCE = 0.75;

    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Generate a new task appropriate for player's rank
     */
    generateNewTask() {
        const difficulty = this.getDifficultyForRank(this.gameState.rankIndex);

        // The task pool is the 1000 comprehensive tasks. (The old data/tasks.js
        // fallback could never be reached, #2319.)
        const allTasks = COMPREHENSIVE_DATA_SCIENCE_TASKS || [];

        // Each rank owns a band of the 1-10 difficulty scale, so every task
        // is reachable by some rank (#2141)
        const availableTasks = allTasks.filter(t => {
            const taskDiff = typeof t.difficulty === 'number' ? t.difficulty : parseFloat(t.difficulty) || 1;
            return Math.abs(taskDiff - difficulty) <= TaskSystem.DIFFICULTY_TOLERANCE;
        });

        if (availableTasks.length === 0) {
            console.warn('No tasks found for difficulty:', difficulty);
            return this.generateFallbackTask();
        }

        // Pick a random task
        const taskTemplate = availableTasks[Math.floor(Math.random() * availableTasks.length)];

        // Pick a random boss
        const boss = BOSSES[Math.floor(Math.random() * BOSSES.length)];

        return this.createTaskFromTemplate(taskTemplate, boss);
    }

    /**
     * Create task from template
     */
    createTaskFromTemplate(taskTemplate, boss = null) {
        // Generate data based on task template
        const data = this.generateData(taskTemplate);

        // Get difficulty from template
        const difficulty = typeof taskTemplate.difficulty === 'number' 
            ? taskTemplate.difficulty 
            : parseInt(taskTemplate.difficulty) || 1;
        
        // Pick boss if not provided
        if (!boss) {
            boss = BOSSES[Math.floor(Math.random() * BOSSES.length)];
        }

        // Calculate reward based on rank and difficulty
        const rank = this.gameState.currentRank;
        const baseReward = 100 * (rank?.salaryMultiplier || 1);
        const difficultyBonus = difficulty * 20;
        const potentialReward = Math.round(baseReward + difficultyBonus);

        // Create the task
        this.gameState.currentTask = {
            id: `task_${Date.now()}`,
            template: taskTemplate,
            boss: boss,
            data: data,
            requirements: taskTemplate.requirements || [],
            optimalChartTypes: taskTemplate.optimalChartTypes || ['bar'],
            acceptableChartTypes: taskTemplate.acceptableChartTypes || taskTemplate.optimalChartTypes || ['bar'],
            potentialReward: potentialReward,
            startTime: Date.now(),
            timeLimit: taskTemplate.timeLimit,
            // Include additional metadata from comprehensive tasks
            domain: taskTemplate.domain,
            skills: taskTemplate.skills,
            tools: taskTemplate.tools,
            deliverable: taskTemplate.deliverable,
            realWorldContext: taskTemplate.realWorldContext
        };

        // Update boss dialogue
        this.updateBossDialogue();

        return this.gameState.currentTask;
    }

    /**
     * The task the player is currently working on (or null).
     * Used by the dev menu / WorkSystemValidator (#1856, #2352).
     */
    getCurrentTask() {
        return this.gameState?.currentTask || null;
    }

    /**
     * Get difficulty level based on rank
     */
    getDifficultyForRank(rankIndex) {
        // Spread the 7 ranks (0-6) across the task scale 1.0-9.7, so the top
        // ranks get the hard tasks instead of stopping at 4 (#2141)
        const r = Math.min(TaskSystem.MAX_RANK_INDEX, Math.max(0, Number(rankIndex) || 0));
        return Math.round((1 + r * TaskSystem.DIFFICULTY_PER_RANK) * 100) / 100;
    }

    /**
     * Generate data based on task template
     */
    generateData(template) {
        switch (template.dataType) {
            case 'quarterly_sales':
                return this.generateQuarterlySalesData();
            case 'monthly_revenue':
                return this.generateMonthlyRevenueData();
            case 'product_comparison':
                return this.generateProductComparisonData();
            case 'category_breakdown':
                return this.generateCategoryBreakdownData();
            case 'trend_analysis':
                return this.generateTrendAnalysisData();
            case 'customer_demographics':
                return this.generateDemographicsData();
            case 'performance_metrics':
                return this.generatePerformanceData();
            default:
                return this.generateQuarterlySalesData();
        }
    }

    /**
     * Generate quarterly sales data
     */
    generateQuarterlySalesData() {
        const quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
        const baseRevenue = this.randomRange(80000, 150000);

        const rows = quarters.map((q, i) => {
            const growth = 1 + (i * 0.05) + (Math.random() * 0.1);
            const revenue = Math.round(baseRevenue * growth);
            const expenses = Math.round(revenue * (0.5 + Math.random() * 0.2));
            const profit = revenue - expenses;

            return [q, revenue, expenses, profit];
        });

        // Datasets come from the same rows the table shows (#110)
        return {
            columns: ['Quarter', 'Revenue', 'Expenses', 'Profit'],
            rows,
            labels: quarters,
            datasets: {
                Revenue: rows.map(r => r[1]),
                Expenses: rows.map(r => r[2]),
                Profit: rows.map(r => r[3])
            }
        };
    }

    /**
     * Generate monthly revenue data
     */
    generateMonthlyRevenueData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const baseRevenue = this.randomRange(50000, 100000);

        const revenues = months.map((_, i) => {
            const seasonal = Math.sin((i / 12) * Math.PI * 2) * 0.2;
            const growth = 1 + (i * 0.02) + seasonal + (Math.random() * 0.1);
            return Math.round(baseRevenue * growth);
        });

        return {
            columns: ['Month', 'Revenue'],
            rows: months.map((m, i) => [m, revenues[i]]),
            labels: months,
            datasets: {
                Revenue: revenues
            }
        };
    }

    /**
     * Generate product comparison data
     */
    generateProductComparisonData() {
        const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];

        const sales = products.map(() => this.randomRange(5000, 50000));
        const ratings = products.map(() => (3 + Math.random() * 2).toFixed(1));

        return {
            columns: ['Product', 'Sales ($)', 'Rating'],
            rows: products.map((p, i) => [p, sales[i], ratings[i]]),
            labels: products,
            datasets: {
                Sales: sales,
                Rating: ratings.map(r => parseFloat(r))
            }
        };
    }

    /**
     * Generate category breakdown data
     */
    generateCategoryBreakdownData() {
        const categories = ['Electronics', 'Clothing', 'Food', 'Home & Garden', 'Sports'];

        // Generate random percentages that sum to 100
        let remaining = 100;
        const percentages = categories.map((_, i) => {
            if (i === categories.length - 1) return remaining;
            const val = this.randomRange(10, Math.min(40, remaining - (categories.length - i - 1) * 5));
            remaining -= val;
            return val;
        });

        return {
            columns: ['Category', 'Percentage', 'Revenue'],
            rows: categories.map((c, i) => [c, percentages[i], percentages[i] * 1000]),
            labels: categories,
            datasets: {
                Percentage: percentages,
                Revenue: percentages.map(p => p * 1000)
            }
        };
    }

    /**
     * Generate trend analysis data
     */
    generateTrendAnalysisData() {
        const weeks = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);

        let value = this.randomRange(1000, 5000);
        const trend = weeks.map(() => {
            // Clamp the running walk state (not only the displayed sample)
            value = Math.max(500, value + this.randomRange(-200, 500));
            return value;
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
        // Through createTaskFromTemplate, so gameState.currentTask and the
        // boss panel are set like any other task
        return this.createTaskFromTemplate({
            name: 'Basic Sales Report',
            description: 'Create a visualization showing quarterly sales performance.',
            dataType: 'quarterly_sales',
            difficulty: 1,
            requirements: ['Show trends', 'Compare values'],
            optimalChartTypes: ['bar', 'line']
        }, BOSSES[0]);
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
        // avatar is an image path: show it as an image, never as text (#2210)
        if (avatarEl) {
            avatarEl.textContent = '';
            if (task.boss.avatar) {
                const img = document.createElement('img');
                img.src = task.boss.avatar;
                img.alt = task.boss.name || '';
                img.addEventListener('error', () => img.remove());
                avatarEl.appendChild(img);
            }
        }
        // Text-mode panel: show the boss's style (#2210)
        if (moodEl) {
            const style = task.boss.mood || task.boss.personality || '';
            moodEl.textContent = style
                ? `Style: ${String(style).replace(/[-_]/g, ' ').replace(/^./, c => c.toUpperCase())}`
                : '';
        }

        // Update task display
        const taskDesc = document.querySelector('.task-description');
        if (taskDesc) taskDesc.textContent = task.template.description;

        const taskReward = document.getElementById('task-reward');
        if (taskReward) taskReward.textContent = `$${task.potentialReward}`;

        // Update requirements
        const reqContainer = document.querySelector('.task-requirements');
        if (reqContainer) {
            const hint = insightHint(this.gameState, task); // "Data Insight" perk
            reqContainer.innerHTML = task.requirements
                .map(r => `<span class="requirement-tag">${r}</span>`)
                .join('') + (hint ? `<span class="requirement-tag insight-hint">${hint}</span>` : '');
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

        // Update header. Sorting is delegated from the table itself; the old
        // inline onclick pointed at game.gameState.taskSystem, which is never
        // set, so every header click threw (#959)
        const thead = table.querySelector('thead tr');
        thead.innerHTML = data.columns.map((c, i) => {
            const arrow = this.lastSortCol === i ? (this.lastSortAsc ? ' ▲' : ' ▼') : ' ↕';
            return `<th class="sortable-header" data-col="${i}" tabindex="0" role="button">${c}${arrow}</th>`;
        }).join('');
        if (!table.dataset.sortListening) {
            table.dataset.sortListening = 'true';
            const sortFromEvent = (e) => {
                const th = e.target.closest?.('th[data-col]');
                if (th) this.handleTableSort(Number(th.dataset.col));
            };
            table.addEventListener('click', sortFromEvent);
            table.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (e.target.closest?.('th[data-col]')) e.preventDefault();
                    sortFromEvent(e);
                }
            });
        }

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
        if (!this.currentTableData) return;

        const isAscending = this.lastSortCol === colIndex ? !this.lastSortAsc : true;
        this.lastSortCol = colIndex;
        this.lastSortAsc = isAscending;

        this.currentTableData.rows.sort((a, b) => {
            const valA = a[colIndex];
            const valB = b[colIndex];

            if (typeof valA === 'number' && typeof valB === 'number') {
                return isAscending ? valA - valB : valB - valA;
            }
            return isAscending ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
        });

        this.updateDataTable(this.currentTableData);
    }

    handleTableFilter(query) {
        if (!this.originalTableData) return;

        const lowerQuery = query.toLowerCase();

        // Filter from ORIGINAL data to allow un-filtering
        this.currentTableData.rows = this.originalTableData.rows.filter(row =>
            row.some(cell => String(cell).toLowerCase().includes(lowerQuery))
        );

        this.updateDataTable(this.currentTableData);
    }

    /**
     * Helper: random number in range
     */
    randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
