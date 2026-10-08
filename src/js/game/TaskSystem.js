/**
 * TaskSystem - Generates and manages data visualization tasks
 */

import { BOSSES } from '../data/bosses.js';
import { COMPREHENSIVE_DATA_SCIENCE_TASKS } from '../data/comprehensive_datascience_tasks.js';
import { insightHint, EconomySystem } from './EconomySystem.js';
import { renderTaskBrief } from './taskBrief.js';
import { isCurrencyColumn, proportionalSplit, boundedPartition } from '../utils/dataFormat.js';

export class TaskSystem {
    /**
     * Boss panel line, e.g. "Mood: Stressed · Style: Perfectionist". Moods
     * come from BOSS_MOODS in data/bosses.js (#2227)
     */
    static bossMoodText(boss) {
        const pretty = v => String(v).replace(/[-_]/g, ' ').replace(/^./, c => c.toUpperCase());
        const parts = [];
        if (boss?.mood) parts.push(`Mood: ${pretty(boss.mood)}`);
        if (boss?.personality) parts.push(`Style: ${pretty(boss.personality)}`);
        return parts.join(' · ');
    }

    static MAX_RANK_INDEX = 6;
    static DIFFICULTY_PER_RANK = 1.45;
    // Half-width of each rank's band; bands overlap slightly so 1.0-10 is covered
    static DIFFICULTY_TOLERANCE = 0.75;

    // Labels that match each task's domain, so the table fits the scenario
    // instead of always being Electronics/Clothing or Speed/Quality (#2144)
    static DOMAIN_LABELS = {
        finance: { categories: ['Retail', 'Travel', 'Dining', 'Online', 'Fuel'], items: ['Visa Gold', 'Rewards+', 'Business', 'Student', 'Platinum'], metrics: ['Fraud Recall', 'Precision', 'Approval Rate', 'Uptime', 'Compliance'], series: 'Transactions' },
        healthcare: { categories: ['Cardiology', 'Oncology', 'Pediatrics', 'Orthopedics', 'Neurology'], items: ['Clinic A', 'Clinic B', 'Clinic C', 'Clinic D', 'Clinic E'], metrics: ['Readmission Recall', 'Diagnostic Accuracy', 'Bed Utilization', 'Wait Time Score', 'Patient Satisfaction'], series: 'Admissions' },
        ecommerce: { categories: ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports'], items: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'], metrics: ['Conversion', 'Checkout Speed', 'Search Relevance', 'Recommendation CTR', 'Satisfaction'], series: 'Orders' },
        marketing: { categories: ['Search', 'Social', 'Email', 'Display', 'Referral'], items: ['Campaign A', 'Campaign B', 'Campaign C', 'Campaign D', 'Campaign E'], metrics: ['CTR', 'Conversion', 'Engagement', 'Reach', 'Brand Lift'], series: 'Leads' },
        manufacturing: { categories: ['Assembly', 'Machining', 'Painting', 'Packaging', 'QA'], items: ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'], metrics: ['OEE', 'Yield', 'Throughput', 'Defect-Free Rate', 'Uptime'], series: 'Units Produced' },
        telecommunications: { categories: ['Mobile', 'Broadband', 'TV', 'Enterprise', 'IoT'], items: ['Plan Basic', 'Plan Plus', 'Plan Pro', 'Plan Family', 'Plan Biz'], metrics: ['Network Uptime', 'Call Success', 'Churn Prediction', 'Throughput', 'Satisfaction'], series: 'Active Lines' },
        transportation: { categories: ['Freight', 'Rail', 'Air', 'Last Mile', 'Maritime'], items: ['Route A', 'Route B', 'Route C', 'Route D', 'Route E'], metrics: ['On-Time Rate', 'Fleet Utilization', 'Fuel Efficiency', 'Safety', 'Satisfaction'], series: 'Shipments' },
        energy: { categories: ['Solar', 'Wind', 'Gas', 'Hydro', 'Nuclear'], items: ['Plant A', 'Plant B', 'Plant C', 'Plant D', 'Plant E'], metrics: ['Capacity Factor', 'Forecast Accuracy', 'Grid Stability', 'Efficiency', 'Uptime'], series: 'MWh Delivered' },
        education: { categories: ['STEM', 'Humanities', 'Arts', 'Business', 'Health'], items: ['Course A', 'Course B', 'Course C', 'Course D', 'Course E'], metrics: ['Completion', 'Pass Rate', 'Engagement', 'Retention', 'Satisfaction'], series: 'Enrollments' }
    };

    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Labels for a domain (undefined domain keeps the old generic labels)
     */
    getDomainLabels(domain) {
        return TaskSystem.DOMAIN_LABELS[domain] || null;
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

        // Pick a boss whose chart tastes fit the task (#1854)
        const boss = TaskSystem.pickBossFor(taskTemplate);

        return this.createTaskFromTemplate(taskTemplate, boss);
    }

    /**
     * Choose a boss for a task using bosses.js preferences (#1854): skip
     * bosses who dislike one of the task's optimal chart types (unless that
     * leaves nobody), and make bosses who like one twice as likely.
     */
    static pickBossFor(taskTemplate, rng = Math.random, bosses = BOSSES) {
        const optimal = taskTemplate?.optimalChartTypes || [];
        const dislikes = b => (b.preferences?.dislikesChartTypes || []).some(t => optimal.includes(t));
        const likes = b => (b.preferences?.likesChartTypes || []).some(t => optimal.includes(t));
        const pool = bosses.filter(b => !dislikes(b));
        const candidates = pool.length ? pool : bosses;
        const weights = candidates.map(b => (likes(b) ? 2 : 1));
        let roll = rng() * weights.reduce((a, w) => a + w, 0);
        for (let i = 0; i < candidates.length; i++) {
            roll -= weights[i];
            if (roll < 0) return candidates[i];
        }
        return candidates[candidates.length - 1];
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
            boss = TaskSystem.pickBossFor(taskTemplate);
        }

        // Calculate reward based on rank and difficulty
        const rank = this.gameState.currentRank;
        const baseReward = 100 * EconomySystem.salaryMultiplierFor(rank);
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
        const labels = this.getDomainLabels(template?.domain);
        switch (template?.dataType) {
            case 'quarterly_sales':
                return this.generateQuarterlySalesData();
            case 'monthly_revenue':
                return this.generateMonthlyRevenueData();
            case 'product_comparison':
                return this.generateProductComparisonData(labels);
            case 'category_breakdown':
                return this.generateCategoryBreakdownData(labels);
            case 'trend_analysis':
                return this.generateTrendAnalysisData(labels);
            case 'customer_demographics':
                return this.generateDemographicsData();
            case 'performance_metrics':
                return this.generatePerformanceData(labels);
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
    generateProductComparisonData(labels = null) {
        const products = labels?.items || ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];

        const sales = products.map(() => this.randomRange(5000, 50000));
        // Numbers in both the table and the chart; the table used strings,
        // which broke numeric sorting and formatting (#2428)
        const ratings = products.map(() => Math.round((3 + Math.random() * 2) * 10) / 10);

        return {
            columns: ['Product', 'Sales ($)', 'Rating'],
            rows: products.map((p, i) => [p, sales[i], ratings[i]]),
            labels: products,
            datasets: {
                Sales: sales,
                Rating: ratings
            }
        };
    }

    /**
     * Generate category breakdown data
     */
    generateCategoryBreakdownData(labels = null) {
        const categories = labels?.categories || ['Electronics', 'Clothing', 'Food', 'Home & Garden', 'Sports'];

        // Shares of 10-40% that always add up to 100; the old running
        // remainder could break both bounds (#1855, #960)
        const percentages = boundedPartition(categories.length, 100, 10, 40);

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
    generateTrendAnalysisData(labels = null) {
        const weeks = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
        const series = labels?.series || 'Users';

        let value = this.randomRange(1000, 5000);
        const trend = weeks.map(() => {
            // Clamp the running walk state (not only the displayed sample)
            value = Math.max(500, value + this.randomRange(-200, 500));
            return value;
        });

        return {
            columns: ['Week', series],
            rows: weeks.map((w, i) => [w, trend[i]]),
            labels: weeks,
            datasets: {
                [series]: trend
            }
        };
    }

    /**
     * Generate demographics data
     */
    generateDemographicsData() {
        const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];

        const weights = [
            this.randomRange(15, 25),
            this.randomRange(25, 35),
            this.randomRange(20, 30),
            this.randomRange(10, 20),
            this.randomRange(5, 15)
        ];
        // Percentages of one audience must add up to 100 (#2427)
        const counts = proportionalSplit(weights, 100);

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
    generatePerformanceData(labels = null) {
        const metrics = labels?.metrics || ['Speed', 'Quality', 'Efficiency', 'Satisfaction', 'Reliability'];

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
        if (moodEl) moodEl.textContent = TaskSystem.bossMoodText(task.boss);

        // Update task display
        const taskDesc = document.querySelector('.task-description');
        if (taskDesc) taskDesc.textContent = task.template.description;

        const taskReward = document.getElementById('task-reward');
        if (taskReward) taskReward.textContent = EconomySystem.rewardRangeText(task.potentialReward);

        // Update requirements
        const reqContainer = document.querySelector('.task-requirements');
        if (reqContainer) {
            const hint = insightHint(this.gameState, task); // "Data Insight" perk
            reqContainer.innerHTML = task.requirements
                .map(r => `<span class="requirement-tag">${r}</span>`)
                .join('') + (hint ? `<span class="requirement-tag insight-hint">${hint}</span>` : '');
        }

        // Domain, tools, skills, deliverable, context (#2430)
        renderTaskBrief(task);

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
                const isCurrency = isCurrencyColumn(columnName);
                
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
        // Never invert the range (#960)
        if (min > max) [min, max] = [max, min];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
