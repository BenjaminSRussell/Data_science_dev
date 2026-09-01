class TaskSystem {
    constructor(game) {
        this.game = game;
        this.currentTableData = null;
        this.originalTableData = null;
        this.lastSortCol = -1;
        this.lastSortAsc = true;
    }

    /**
     * Generate quarterly sales data
     */
    generateQuarterlySalesData() {
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

        let value = this.randomRange(1000, 5000);
        const revenue = quarters.map(() => {
            value = value + this.randomRange(-200, 500);
            return Math.max(500, value);
        });

        const expenses = quarters.map((_, i) => Math.round(revenue[i] * (0.5 + Math.random() * 0.2)));
        const profit = quarters.map((_, i) => revenue[i] - expenses[i]);

        return {
            columns: ['Quarter', 'Revenue', 'Expenses', 'Profit'],
            rows: quarters.map((q, i) => [q, revenue[i], expenses[i], profit[i]]),
            labels: quarters,
            datasets: {
                Revenue: revenue,
                Expenses: expenses,
                Profit: profit
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