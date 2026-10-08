/**
 * TaskVisualRenderer.js
 * Renders different visuals for different task types
 * Each task step has its own visual representation
 */

export class TaskVisualRenderer {
    // Ids of live game elements a task visual must never take over (#2105)
    static RESERVED_CONTAINER_IDS = ['data-table-container', 'game-container', 'screen-container', 'preview-chart'];

    /**
     * Class list for a visual's container. The config names (e.g.
     * "data-table-container", "chart-container") are namespaced so they
     * can't pick up the live game's styles for those classes (#2105)
     */
    static containerClass(visualConfig) {
        const name = String(visualConfig?.container || 'default').replace(/[^a-z0-9-]/gi, '');
        return `task-visual-container task-visual--${name}`;
    }

    constructor() {
        this.visuals = this.initializeVisuals();
    }
    
    /**
     * Initialize visual templates for each task type
     */
    initializeVisuals() {
        return {
            // Pipeline visuals
            pipeline: {
                container: 'pipeline-container',
                elements: ['source', 'transform', 'destination'],
                animation: 'flow'
            },
            
            pipeline_diagram: {
                container: 'pipeline-diagram',
                elements: ['extract', 'transform', 'load'],
                animation: 'etl-flow'
            },
            
            // Data visuals
            data_table: {
                container: 'data-table-container',
                elements: ['table', 'rows', 'columns'],
                animation: 'data-scan'
            },
            
            scatter_plot: {
                container: 'chart-container',
                elements: ['chart', 'points', 'axes'],
                animation: 'plot-render'
            },
            
            transformation: {
                container: 'transformation-container',
                elements: ['input', 'process', 'output'],
                animation: 'transform'
            },
            
            quality_check: {
                container: 'quality-check-container',
                elements: ['metrics', 'validation', 'results'],
                animation: 'check'
            },
            
            // Database visuals
            database_extract: {
                container: 'database-container',
                elements: ['database', 'connection', 'query'],
                animation: 'extract'
            },
            
            database_load: {
                container: 'database-container',
                elements: ['database', 'connection', 'load'],
                animation: 'load'
            },
            
            data_transform: {
                container: 'transform-container',
                elements: ['input', 'transform', 'output'],
                animation: 'transform'
            },
            
            monitoring: {
                container: 'monitoring-container',
                elements: ['dashboard', 'metrics', 'alerts'],
                animation: 'monitor'
            },
            
            // Code visuals
            code_editor: {
                container: 'code-editor-container',
                elements: ['editor', 'code', 'syntax'],
                animation: 'typing'
            },
            
            debugging: {
                container: 'debug-container',
                elements: ['code', 'breakpoints', 'variables'],
                animation: 'debug'
            },
            
            testing: {
                container: 'test-container',
                elements: ['tests', 'results', 'coverage'],
                animation: 'test-run'
            },
            
            // GitHub visuals
            github: {
                container: 'github-container',
                elements: ['github-ui', 'pr', 'review'],
                animation: 'github-flow'
            },
            
            github_issue: {
                container: 'github-issue-container',
                elements: ['issue', 'comments', 'labels'],
                animation: 'issue-view'
            },
            
            github_feature: {
                container: 'github-feature-container',
                elements: ['feature', 'branch', 'pr'],
                animation: 'feature-flow'
            },
            
            // Documentation visuals
            documentation: {
                container: 'doc-container',
                elements: ['doc', 'text', 'formatting'],
                animation: 'writing'
            },
            
            architecture: {
                container: 'architecture-container',
                elements: ['diagram', 'components', 'connections'],
                animation: 'build'
            },
            
            // Analysis visuals
            analysis: {
                container: 'analysis-container',
                elements: ['data', 'charts', 'insights'],
                animation: 'analyze'
            },
            
            data_loading: {
                container: 'data-load-container',
                elements: ['loader', 'progress', 'data'],
                animation: 'load'
            },
            
            statistics: {
                container: 'stats-container',
                elements: ['numbers', 'calculations', 'results'],
                animation: 'calculate'
            },
            
            charting: {
                container: 'chart-container',
                elements: ['chart', 'data', 'visualization'],
                animation: 'render'
            },
            
            pattern_analysis: {
                container: 'pattern-container',
                elements: ['patterns', 'clusters', 'insights'],
                animation: 'analyze'
            },
            
            // ML/AI visuals
            data_prep: {
                container: 'data-prep-container',
                elements: ['data', 'processing', 'prepared'],
                animation: 'prepare'
            },
            
            model_selection: {
                container: 'model-select-container',
                elements: ['models', 'comparison', 'selection'],
                animation: 'select'
            },
            
            training: {
                container: 'training-container',
                elements: ['model', 'data', 'progress'],
                animation: 'train'
            },
            
            evaluation: {
                container: 'evaluation-container',
                elements: ['metrics', 'charts', 'results'],
                animation: 'evaluate'
            },
            
            hyperparameter: {
                container: 'hyperparameter-container',
                elements: ['params', 'grid', 'optimization'],
                animation: 'tune'
            },
            
            // AI Lab visuals
            ai_lab: {
                container: 'ai-lab-container',
                elements: ['servers', 'gpus', 'monitoring'],
                animation: 'lab-work'
            },
            
            data_collection: {
                container: 'data-collection-container',
                elements: ['sources', 'crawling', 'storage'],
                animation: 'collect'
            },
            
            cluster: {
                container: 'cluster-container',
                elements: ['nodes', 'network', 'compute'],
                animation: 'cluster'
            },

            // Visuals RealWorldTaskSystem's tasks and steps use (#1227)
            feature_selection: {
                container: 'feature-selection-container',
                elements: ['features', 'importance', 'selected'],
                animation: 'select'
            },
            deployment: {
                container: 'deployment-container',
                elements: ['container', 'registry', 'service'],
                animation: 'deploy'
            },
            model_training: {
                container: 'training-container',
                elements: ['data', 'model', 'loss-curve'],
                animation: 'train'
            },
            nlp: {
                container: 'nlp-container',
                elements: ['text', 'tokens', 'embeddings'],
                animation: 'tokenize'
            },
            database: {
                container: 'database-container',
                elements: ['database', 'indexes', 'query-plan'],
                animation: 'query'
            },
            api: {
                container: 'api-container',
                elements: ['client', 'endpoint', 'model'],
                animation: 'request'
            }
        };
    }
    
    /**
     * Render visual for current task step
     */
    renderTaskVisual(task, stepIndex, containerId) {
        if (!task || !task.steps || stepIndex >= task.steps.length) {
            return null;
        }
        
        const step = task.steps[stepIndex];
        const visualType = step.visual;
        const visualConfig = this.visuals[visualType];
        
        if (!visualConfig) {
            console.warn(`Visual config not found for: ${visualType}`);
            return this.renderDefaultVisual(containerId);
        }
        
        // Never wipe a live game element such as the task data table (#2105)
        if (TaskVisualRenderer.RESERVED_CONTAINER_IDS.includes(containerId)) {
            console.error(`Refusing to render a task visual into live element #${containerId}`);
            return null;
        }
        const container = document.getElementById(containerId) || document.querySelector(`#${containerId}`);
        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return null;
        }
        
        // Clear container
        container.innerHTML = '';
        container.className = TaskVisualRenderer.containerClass(visualConfig);
        
        // Create visual elements
        const visualHTML = this.createVisualHTML(visualType, visualConfig, task, step);
        container.innerHTML = visualHTML;
        
        // Add animations
        this.addAnimations(container, visualConfig.animation);
        
        return container;
    }
    
    /**
     * Create HTML for visual. Every generator receives the task and step, so
     * the visual reflects the actual work (#2104)
     */
    createVisualHTML(visualType, config, task, step) {
        const esc = TaskVisualRenderer.escape;
        const progress = this.calculateStepProgress(task, step);
        let html = `<div class="task-visual ${esc(visualType)}">`;
        html += `<div class="task-header"><h3>${esc(step?.name)}</h3><p>${esc(task?.name)}</p></div>`;
        html += `<div class="task-content">`;

        switch (visualType) {
            case 'code_editor':
            case 'debugging':
            case 'testing':
                html += this.createCodeEditorHTML(task, step);
                break;
            case 'pipeline':
            case 'pipeline_diagram':
                html += this.createPipelineHTML(visualType, task, step);
                break;
            case 'data_table':
                html += this.createDataTableHTML(task, step);
                break;
            case 'training':
            case 'model_training':
            case 'ai_lab':
                html += this.createTrainingHTML(visualType, task, step);
                break;
            case 'github':
            case 'github_issue':
            case 'github_feature':
                html += this.createGitHubHTML(visualType, task, step);
                break;
            case 'charting':
            case 'scatter_plot':
                html += this.createChartHTML(task, step);
                break;
            default:
                // Every other registered type renders its own configured
                // elements instead of one shared placeholder (#2103)
                html += config?.elements?.length
                    ? this.createElementsHTML(visualType, config, task, step)
                    : this.createDefaultVisualHTML(visualType);
        }

        html += `</div>`;
        // Track plus fill, so the fill grows inside a full-width bar (#1061)
        html += `<div class="task-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}">`
            + `<div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div></div>`;
        html += `</div>`;

        return html;
    }

    static escape(value) {
        return String(value ?? '').replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    /** Index of the step within the task, 0 when unknown */
    stepIndex(task, step) {
        const i = task?.steps?.indexOf?.(step);
        return i > 0 ? i : 0;
    }

    /**
     * Generic visual from a type's configured elements: one stage per element,
     * with the stage matching the step's position highlighted (#2103)
     */
    createElementsHTML(visualType, config, task, step) {
        const esc = TaskVisualRenderer.escape;
        const elements = config.elements;
        const total = task?.steps?.length || 1;
        const active = Math.min(elements.length - 1,
            Math.floor((this.stepIndex(task, step) / total) * elements.length));
        return `
            <div class="element-visual animate-${esc(config.animation)}" data-visual="${esc(visualType)}">
                <div class="visual-icon">${this.getVisualIcon(visualType)}</div>
                <div class="element-stages">
                    ${elements.map((el, i) => `
                        <div class="element-stage${i === active ? ' active' : ''}${i < active ? ' done' : ''}">${esc(el.replace(/[-_]/g, ' '))}</div>
                    `).join('')}
                </div>
                ${step?.description ? `<p class="element-note">${esc(step.description)}</p>` : ''}
            </div>
        `;
    }

    /**
     * Code editor: shows the step's own code lines when it has them
     */
    createCodeEditorHTML(task, step) {
        const esc = TaskVisualRenderer.escape;
        const fallback = [
            'import pandas as pd',
            'import numpy as np',
            `def ${String(step?.name || 'process_data').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'process_data'}():`,
            "    data = pd.read_csv('data.csv')",
            '    return data'
        ];
        const lines = Array.isArray(step?.code) ? step.code
            : typeof step?.code === 'string' ? step.code.split('\n') : fallback;
        const file = step?.file || 'main.py';
        return `
            <div class="code-editor">
                <div class="editor-header">
                    <span class="editor-tab active">${esc(file)}</span>
                </div>
                <div class="editor-content">
                    ${lines.map((line, i) => `<div class="code-line${i === lines.length - 1 ? ' typing' : ''}"><span class="line-num">${i + 1}</span><span class="code">${esc(line)}</span></div>`).join('')}
                    <div class="cursor"></div>
                </div>
            </div>
        `;
    }

    /**
     * Pipeline: the step's stages if given; the active stage follows the step
     */
    createPipelineHTML(type, task, step) {
        const esc = TaskVisualRenderer.escape;
        const stages = Array.isArray(step?.stages) && step.stages.length ? step.stages
            : type === 'pipeline_diagram'
                ? ['Extract', 'Transform', 'Load']
                : ['Source', 'Process', 'Destination'];
        const total = task?.steps?.length || 1;
        const active = Math.min(stages.length - 1,
            Math.floor((this.stepIndex(task, step) / total) * stages.length));

        return `
            <div class="pipeline-diagram">
                ${stages.map((stage, i) => `
                    <div class="pipeline-stage ${i === active ? 'active' : ''}">
                        <div class="stage-icon">${this.getStageIcon(stage)}</div>
                        <div class="stage-label">${esc(stage)}</div>
                    </div>
                    ${i < stages.length - 1 ? '<div class="pipeline-arrow">→</div>' : ''}
                `).join('')}
            </div>
        `;
    }

    /**
     * Data table: the step's rows/columns when provided
     */
    createDataTableHTML(task, step) {
        const esc = TaskVisualRenderer.escape;
        const columns = Array.isArray(step?.columns) && step.columns.length
            ? step.columns : ['ID', 'Name', 'Value', 'Status'];
        const rows = Array.isArray(step?.rows) && step.rows.length ? step.rows : [
            [1, 'Data Point 1', 42.5, 'valid'],
            [2, 'Data Point 2', null, 'invalid'],
            [3, 'Data Point 3', 78.2, 'valid']
        ];
        return `
            <div class="data-table">
                <table>
                    <thead><tr>${columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
                    <tbody>
                        ${rows.map(row => {
                            const cells = Array.isArray(row) ? row : columns.map(c => row?.[c]);
                            const bad = cells.some(v => v === null || v === undefined || v === 'invalid');
                            return `<tr class="${bad ? 'scanning' : ''}">${cells.map(v => `<td>${v === null || v === undefined ? 'null' : esc(v)}</td>`).join('')}</tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Training: progress and metrics come from the task/step (#2104)
     */
    createTrainingHTML(type, task, step) {
        const esc = TaskVisualRenderer.escape;
        const isAILab = type === 'ai_lab';
        const progress = Math.round(this.calculateStepProgress(task, step));
        const metrics = step?.metrics || {};
        const loss = Number.isFinite(metrics.loss) ? metrics.loss : Math.max(0.05, 1 - progress / 100 * 0.9);
        const accuracy = Number.isFinite(metrics.accuracy) ? metrics.accuracy : 50 + progress * 0.45;
        const layers = Array.isArray(step?.layers) && step.layers.length
            ? step.layers : ['Input Layer', 'Hidden Layer 1', 'Hidden Layer 2', 'Output Layer'];
        const activeLayer = Math.min(layers.length - 1, Math.floor(progress / 100 * layers.length));
        const gpus = Number.isInteger(step?.gpus) && step.gpus > 0 ? step.gpus : 3;
        return `
            <div class="training-visual ${isAILab ? 'ai-lab' : ''}">
                ${isAILab ? `
                    <div class="lab-servers">
                        ${Array.from({ length: gpus }, (_, i) => `<div class="server${i < Math.ceil(gpus * progress / 100) ? ' active' : ''}">GPU Server ${i + 1}</div>`).join('')}
                    </div>
                ` : ''}
                <div class="model-training">
                    <div class="model-architecture">
                        ${layers.map((l, i) => `<div class="layer${i === activeLayer ? ' active' : ''}">${esc(l)}</div>`).join('')}
                    </div>
                    <div class="training-progress">
                        <div class="progress-label">Training Progress</div>
                        <div class="progress-bar-large">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="metrics">
                            <span>Loss: ${loss.toFixed(3)}</span>
                            <span>Accuracy: ${accuracy.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * GitHub: titles come from the step/task
     */
    createGitHubHTML(type, task, step) {
        const esc = TaskVisualRenderer.escape;
        const title = esc(step?.title || step?.name || task?.name || '');
        const body = esc(step?.description || task?.description || '');
        const number = Number.isInteger(step?.prNumber) ? step.prNumber : 42;
        return `
            <div class="github-visual">
                <div class="github-header">
                    <div class="github-logo"></div>
                    <div class="github-title">GitHub</div>
                </div>
                <div class="github-content">
                    ${type === 'github_issue' ? `
                        <div class="issue-card">
                            <div class="issue-title">Bug: ${title}</div>
                            <div class="issue-body">
                                <p>${body}</p>
                                <div class="issue-labels">
                                    ${(step?.labels || ['bug']).map(l => `<span class="label">${esc(l)}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    ` : type === 'github_feature' ? `
                        <div class="feature-card">
                            <div class="feature-title">Feature: ${title}</div>
                            <div class="feature-body">
                                <p>${body}</p>
                                <div class="pr-status">Pull Request #${number}</div>
                            </div>
                        </div>
                    ` : `
                        <div class="pr-card">
                            <div class="pr-title">Pull Request #${number}: ${title}</div>
                            <div class="pr-status open">Open</div>
                            <div class="pr-review">${Number.isInteger(step?.reviews) ? step.reviews : 2} reviews requested</div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * Chart: plots the step's data points when it has them
     */
    createChartHTML(task, step) {
        const values = Array.isArray(step?.data) && step.data.length
            ? step.data.map(Number).filter(Number.isFinite)
            : [150, 120, 100, 130, 110].map(y => 250 - y);
        const max = Math.max(...values, 1);
        const min = Math.min(...values, 0);
        const span = max - min || 1;
        const n = values.length;
        const points = values.map((v, i) => {
            const cx = 50 + (n === 1 ? 150 : (i * 300) / (n - 1));
            const cy = 250 - ((v - min) / span) * 200;
            return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" class="chart-point"/>`;
        }).join('');
        return `
            <div class="chart-visual">
                <div class="chart-container">
                    <svg class="chart-svg" viewBox="0 0 400 300">
                        <rect x="50" y="50" width="300" height="200" class="chart-bg"/>
                        ${points}
                    </svg>
                </div>
            </div>
        `;
    }

    /**
     * Create default visual
     */
    createDefaultVisualHTML(type) {
        const esc = TaskVisualRenderer.escape;
        return `<div class="default-visual"><div class="visual-icon">${this.getVisualIcon(type)}</div><div class="visual-label">${esc(type)}</div></div>`;
    }

    /**
     * Stage icon: text glyphs; the old table held only empty strings (#2102)
     */
    getStageIcon(stage) {
        const icons = {
            'Extract': '⇩',
            'Transform': '⟳',
            'Load': '⇧',
            'Source': '◉',
            'Process': '⚙',
            'Destination': '◎'
        };
        return icons[stage] || '●';
    }

    /**
     * Visual icon: text glyphs per type, with a generic fallback (#2102)
     */
    getVisualIcon(type) {
        const icons = {
            'data_loading': '⇩',
            'statistics': 'Σ',
            'pattern_analysis': '⁂',
            'documentation': '¶',
            'architecture': '⌂',
            'analysis': '⌕',
            'quality_check': '✓',
            'monitoring': '◔',
            'database': '⛁',
            'database_extract': '⛁',
            'database_load': '⛁',
            'deployment': '⇪',
            'api': '⇄',
            'nlp': '¶',
            'evaluation': '✓',
            'hyperparameter': '⚙',
            'cluster': '⁘'
        };
        return icons[type] || '◆';
    }

    /**
     * Calculate step progress
     */
    calculateStepProgress(task, step) {
        const steps = task?.steps;
        if (!Array.isArray(steps) || steps.length === 0) return 0;
        const stepIndex = steps.indexOf(step);
        return ((stepIndex + 1) / steps.length) * 100;
    }
    
    /**
     * Add animations
     */
    addAnimations(container, animationType) {
        container.classList.add(`animate-${animationType}`);
    }
    
    /**
     * Render default visual
     */
    renderDefaultVisual(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="default-task-visual">Working...</div>';
        }
    }
}

