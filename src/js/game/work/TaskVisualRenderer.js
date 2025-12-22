/**
 * TaskVisualRenderer.js
 * Renders different visuals for different task types
 * Each task step has its own visual representation
 */

export class TaskVisualRenderer {
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
        
        const container = document.getElementById(containerId) || document.querySelector(`#${containerId}`);
        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return null;
        }
        
        // Clear container
        container.innerHTML = '';
        container.className = `task-visual-container ${visualConfig.container}`;
        
        // Create visual elements
        const visualHTML = this.createVisualHTML(visualType, visualConfig, task, step);
        container.innerHTML = visualHTML;
        
        // Add animations
        this.addAnimations(container, visualConfig.animation);
        
        return container;
    }
    
    /**
     * Create HTML for visual
     */
    createVisualHTML(visualType, config, task, step) {
        // Base structure
        let html = `<div class="task-visual ${visualType}">`;
        html += `<div class="task-header"><h3>${step.name}</h3><p>${task.name}</p></div>`;
        html += `<div class="task-content">`;
        
        // Visual-specific content
        switch (visualType) {
            case 'code_editor':
                html += this.createCodeEditorHTML();
                break;
            case 'pipeline':
            case 'pipeline_diagram':
                html += this.createPipelineHTML(visualType);
                break;
            case 'data_table':
                html += this.createDataTableHTML();
                break;
            case 'training':
            case 'ai_lab':
                html += this.createTrainingHTML(visualType);
                break;
            case 'github':
            case 'github_issue':
            case 'github_feature':
                html += this.createGitHubHTML(visualType);
                break;
            case 'charting':
            case 'scatter_plot':
                html += this.createChartHTML();
                break;
            default:
                html += this.createDefaultVisualHTML(visualType);
        }
        
        html += `</div>`;
        html += `<div class="task-progress"><div class="progress-bar" style="width: ${this.calculateStepProgress(task, step)}%"></div></div>`;
        html += `</div>`;
        
        return html;
    }
    
    /**
     * Create code editor visual
     */
    createCodeEditorHTML() {
        return `
            <div class="code-editor">
                <div class="editor-header">
                    <span class="editor-tab active">main.py</span>
                    <span class="editor-tab">utils.py</span>
                </div>
                <div class="editor-content">
                    <div class="code-line"><span class="line-num">1</span><span class="code">import pandas as pd</span></div>
                    <div class="code-line"><span class="line-num">2</span><span class="code">import numpy as np</span></div>
                    <div class="code-line typing"><span class="line-num">3</span><span class="code">def process_data():</span></div>
                    <div class="code-line"><span class="line-num">4</span><span class="code indent">    data = pd.read_csv('data.csv')</span></div>
                    <div class="code-line"><span class="line-num">5</span><span class="code indent">    return data</span></div>
                    <div class="cursor"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * Create pipeline visual
     */
    createPipelineHTML(type) {
        const stages = type === 'pipeline_diagram' 
            ? ['Extract', 'Transform', 'Load']
            : ['Source', 'Process', 'Destination'];
            
        return `
            <div class="pipeline-diagram">
                ${stages.map((stage, i) => `
                    <div class="pipeline-stage ${i === 1 ? 'active' : ''}">
                        <div class="stage-icon">${this.getStageIcon(stage)}</div>
                        <div class="stage-label">${stage}</div>
                    </div>
                    ${i < stages.length - 1 ? '<div class="pipeline-arrow">→</div>' : ''}
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Create data table visual
     */
    createDataTableHTML() {
        return `
            <div class="data-table">
                <table>
                    <thead>
                        <tr><th>ID</th><th>Name</th><th>Value</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>1</td><td>Data Point 1</td><td>42.5</td><td class="valid"></td></tr>
                        <tr class="scanning"><td>2</td><td>Data Point 2</td><td>null</td><td class="invalid"></td></tr>
                        <tr><td>3</td><td>Data Point 3</td><td>78.2</td><td class="valid"></td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    
    /**
     * Create training visual
     */
    createTrainingHTML(type) {
        const isAILab = type === 'ai_lab';
        return `
            <div class="training-visual ${isAILab ? 'ai-lab' : ''}">
                ${isAILab ? `
                    <div class="lab-servers">
                        <div class="server active">GPU Server 1</div>
                        <div class="server active">GPU Server 2</div>
                        <div class="server">GPU Server 3</div>
                    </div>
                ` : ''}
                <div class="model-training">
                    <div class="model-architecture">
                        <div class="layer">Input Layer</div>
                        <div class="layer">Hidden Layer 1</div>
                        <div class="layer active">Hidden Layer 2</div>
                        <div class="layer">Output Layer</div>
                    </div>
                    <div class="training-progress">
                        <div class="progress-label">Training Progress</div>
                        <div class="progress-bar-large">
                            <div class="progress-fill" style="width: 45%"></div>
                        </div>
                        <div class="metrics">
                            <span>Loss: 0.234</span>
                            <span>Accuracy: 87.5%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Create GitHub visual
     */
    createGitHubHTML(type) {
        return `
            <div class="github-visual">
                <div class="github-header">
                    <div class="github-logo"></div>
                    <div class="github-title">GitHub</div>
                </div>
                <div class="github-content">
                    ${type === 'github_issue' ? `
                        <div class="issue-card">
                            <div class="issue-title"> Bug: Data processing fails on null values</div>
                            <div class="issue-body">
                                <p>When processing data with null values, the pipeline crashes.</p>
                                <div class="issue-labels">
                                    <span class="label bug">bug</span>
                                    <span class="label priority">high priority</span>
                                </div>
                            </div>
                        </div>
                    ` : type === 'github_feature' ? `
                        <div class="feature-card">
                            <div class="feature-title"> Feature: Add data validation</div>
                            <div class="feature-body">
                                <p>Implement comprehensive data validation pipeline.</p>
                                <div class="pr-status">Pull Request #42</div>
                            </div>
                        </div>
                    ` : `
                        <div class="pr-card">
                            <div class="pr-title">Pull Request #42</div>
                            <div class="pr-status open">Open</div>
                            <div class="pr-review">2 reviews requested</div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    /**
     * Create chart visual
     */
    createChartHTML() {
        return `
            <div class="chart-visual">
                <div class="chart-container">
                    <svg class="chart-svg" viewBox="0 0 400 300">
                        <rect x="50" y="50" width="300" height="200" fill="#f0f0f0"/>
                        <circle cx="100" cy="150" r="5" fill="#3498db"/>
                        <circle cx="150" cy="120" r="5" fill="#3498db"/>
                        <circle cx="200" cy="100" r="5" fill="#3498db"/>
                        <circle cx="250" cy="130" r="5" fill="#3498db"/>
                        <circle cx="300" cy="110" r="5" fill="#3498db"/>
                    </svg>
                </div>
            </div>
        `;
    }
    
    /**
     * Create default visual
     */
    createDefaultVisualHTML(type) {
        return `<div class="default-visual"><div class="visual-icon">${this.getVisualIcon(type)}</div><div class="visual-label">${type}</div></div>`;
    }
    
    /**
     * Get stage icon
     */
    getStageIcon(stage) {
        const icons = {
            'Extract': '',
            'Transform': '',
            'Load': '',
            'Source': '',
            'Process': '',
            'Destination': ''
        };
        return icons[stage] || '●';
    }
    
    /**
     * Get visual icon
     */
    getVisualIcon(type) {
        const icons = {
            'data_loading': '',
            'statistics': '',
            'pattern_analysis': '',
            'documentation': '',
            'architecture': ''
        };
        return icons[type] || '';
    }
    
    /**
     * Calculate step progress
     */
    calculateStepProgress(task, step) {
        const stepIndex = task.steps.indexOf(step);
        const totalSteps = task.steps.length;
        return ((stepIndex + 1) / totalSteps) * 100;
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

