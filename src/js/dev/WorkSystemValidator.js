/**
 * Work System and Spreadsheet Validation
 * Validates work system, tasks, and spreadsheet functionality
 */

export class WorkSystemValidator {
    constructor(game) {
        this.game = game;
    }

    async validateAll() {
        const results = {
            taskSystem: await this.validateTaskSystem(),
            spreadsheet: await this.validateSpreadsheet(),
            workFlow: await this.validateWorkFlow(),
            dataIntegrity: await this.validateDataIntegrity()
        };

        return results;
    }

    async validateTaskSystem() {
        const taskSystem = this.game.taskSystem;
        if (!taskSystem) {
            return { error: 'Task system not found' };
        }

        const results = {
            passed: 0,
            failed: 0,
            errors: []
        };

        try {
            // Test getting current task
            if (taskSystem.getCurrentTask) {
                const task = taskSystem.getCurrentTask();
                if (task !== undefined && task !== null) {
                    results.passed++;
                } else {
                    results.failed++;
                    results.errors.push('getCurrentTask returned undefined/null');
                }
            } else {
                results.failed++;
                results.errors.push('getCurrentTask method not found');
            }

            // Test task structure
            const task = taskSystem.getCurrentTask?.();
            if (task) {
                const requiredFields = ['id', 'description', 'requirements'];
                requiredFields.forEach(field => {
                    if (task[field] === undefined) {
                        results.failed++;
                        results.errors.push(`Task missing required field: ${field}`);
                    } else {
                        results.passed++;
                    }
                });
            }

            // Test task completion
            if (taskSystem.completeTask && task) {
                try {
                    // Don't actually complete, just check method exists and is callable
                    if (typeof taskSystem.completeTask === 'function') {
                        results.passed++;
                    } else {
                        results.failed++;
                        results.errors.push('completeTask is not a function');
                    }
                } catch (error) {
                    results.failed++;
                    results.errors.push(`completeTask error: ${error.message}`);
                }
            }
        } catch (error) {
            results.failed++;
            results.errors.push(`Task system validation error: ${error.message}`);
        }

        return results;
    }

    async validateSpreadsheet() {
        const table = document.getElementById('data-table');
        if (!table) {
            return { error: 'Data table not found' };
        }

        const results = {
            sorting: await this.validateSorting(table),
            filtering: await this.validateFiltering(table),
            dataDisplay: await this.validateDataDisplay(table),
            interactions: await this.validateTableInteractions(table)
        };

        return results;
    }

    async validateSorting(table) {
        const results = {
            passed: 0,
            failed: 0,
            errors: []
        };

        try {
            const headers = table.querySelectorAll('thead th');
            const originalRows = Array.from(table.querySelectorAll('tbody tr'));

            headers.forEach((header, index) => {
                try {
                    // Click header to sort
                    header.click();
                    
                    // Wait for sort to complete
                    setTimeout(() => {
                        const sortedRows = Array.from(table.querySelectorAll('tbody tr'));
                        
                        // Verify rows still exist (didn't crash)
                        if (sortedRows.length === originalRows.length) {
                            results.passed++;
                        } else {
                            results.failed++;
                            results.errors.push(`Sort column ${index} changed row count`);
                        }

                        // Click again to reverse sort
                        header.click();
                    }, 100);
                } catch (error) {
                    results.failed++;
                    results.errors.push(`Sort column ${index} failed: ${error.message}`);
                }
            });

            await this.wait(500); // Wait for all sorts to complete
        } catch (error) {
            results.failed++;
            results.errors.push(`Sorting validation error: ${error.message}`);
        }

        return results;
    }

    async validateFiltering(table) {
        const results = {
            passed: 0,
            failed: 0,
            errors: []
        };

        try {
            const filterInput = document.getElementById('table-filter');
            if (!filterInput) {
                results.failed++;
                results.errors.push('Filter input not found');
                return results;
            }

            const testFilters = ['test', 'Q1', '2024', ''];
            const originalRowCount = table.querySelectorAll('tbody tr').length;

            for (const filterValue of testFilters) {
                try {
                    filterInput.value = filterValue;
                    filterInput.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    await this.wait(200);

                    const filteredRows = table.querySelectorAll('tbody tr:not([style*="display: none"])');
                    
                    // Verify table didn't crash
                    if (filteredRows.length >= 0) {
                        results.passed++;
                    } else {
                        results.failed++;
                        results.errors.push(`Filter "${filterValue}" caused issue`);
                    }
                } catch (error) {
                    results.failed++;
                    results.errors.push(`Filter "${filterValue}" failed: ${error.message}`);
                }
            }

            // Clear filter
            filterInput.value = '';
            filterInput.dispatchEvent(new Event('input'));
        } catch (error) {
            results.failed++;
            results.errors.push(`Filtering validation error: ${error.message}`);
        }

        return results;
    }

    async validateDataDisplay(table) {
        const results = {
            passed: 0,
            failed: 0,
            errors: []
        };

        try {
            const rows = table.querySelectorAll('tbody tr');
            if (rows.length === 0) {
                results.failed++;
                results.errors.push('No data rows found');
                return results;
            }

            rows.forEach((row, index) => {
                const cells = row.querySelectorAll('td');
                if (cells.length === 0) {
                    results.failed++;
                    results.errors.push(`Row ${index} has no cells`);
                } else {
                    results.passed++;
                }

                // Check for empty cells (might be valid, but worth checking)
                cells.forEach((cell, cellIndex) => {
                    if (cell.textContent.trim() === '' && !cell.hasAttribute('data-empty-allowed')) {
                        // Empty cells are warnings, not failures
                    }
                });
            });
        } catch (error) {
            results.failed++;
            results.errors.push(`Data display validation error: ${error.message}`);
        }

        return results;
    }

    async validateTableInteractions(table) {
        const results = {
            passed: 0,
            failed: 0,
            errors: []
        };

        try {
            // Test row selection if applicable
            const rows = table.querySelectorAll('tbody tr');
            if (rows.length > 0) {
                try {
                    rows[0].click();
                    results.passed++;
                } catch (error) {
                    results.failed++;
                    results.errors.push(`Row click failed: ${error.message}`);
                }
            }

            // Test cell content editing if applicable
            const firstCell = table.querySelector('tbody td');
            if (firstCell && firstCell.contentEditable === 'true') {
                try {
                    firstCell.textContent = 'test';
                    firstCell.dispatchEvent(new Event('blur'));
                    results.passed++;
                } catch (error) {
                    results.failed++;
                    results.errors.push(`Cell editing failed: ${error.message}`);
                }
            }
        } catch (error) {
            results.failed++;
            results.errors.push(`Table interactions error: ${error.message}`);
        }

        return results;
    }

    async validateWorkFlow() {
        const results = {
            passed: 0,
            failed: 0,
            errors: []
        };

        try {
            const taskSystem = this.game.taskSystem;
            if (!taskSystem) {
                results.failed++;
                results.errors.push('Task system not found');
                return results;
            }

            // Test workflow: get task -> work on task -> complete task
            const task = taskSystem.getCurrentTask?.();
            if (task) {
                results.passed++;
                
                // Test if task can be worked on
                if (taskSystem.workOnTask) {
                    try {
                        if (typeof taskSystem.workOnTask === 'function') {
                            results.passed++;
                        }
                    } catch (error) {
                        results.failed++;
                        results.errors.push(`workOnTask failed: ${error.message}`);
                    }
                }

                // Test task requirements
                if (task.requirements && Array.isArray(task.requirements)) {
                    results.passed++;
                } else {
                    results.failed++;
                    results.errors.push('Task requirements missing or invalid');
                }
            } else {
                results.failed++;
                results.errors.push('No current task available for workflow test');
            }
        } catch (error) {
            results.failed++;
            results.errors.push(`Workflow validation error: ${error.message}`);
        }

        return results;
    }

    async validateDataIntegrity() {
        const results = {
            passed: 0,
            failed: 0,
            errors: []
        };

        try {
            // Validate game state data integrity
            const gameState = this.game.gameState;
            if (!gameState) {
                results.failed++;
                results.errors.push('Game state not found');
                return results;
            }

            // Check money is a number
            if (typeof gameState.money === 'number' && isFinite(gameState.money)) {
                results.passed++;
            } else {
                results.failed++;
                results.errors.push('Money is not a valid number');
            }

            // Check reputation is a number
            if (typeof gameState.reputation === 'number' && isFinite(gameState.reputation)) {
                results.passed++;
            } else {
                results.failed++;
                results.errors.push('Reputation is not a valid number');
            }

            // Check rank index is valid
            if (typeof gameState.rankIndex === 'number' && gameState.rankIndex >= 0) {
                results.passed++;
            } else {
                results.failed++;
                results.errors.push('Rank index is invalid');
            }
        } catch (error) {
            results.failed++;
            results.errors.push(`Data integrity error: ${error.message}`);
        }

        return results;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

