class TaskVisualRenderer {
    constructor(config) {
        this.config = config;
    }

    renderTaskVisual(task, stepIndex, containerId) {
        if (!task) {
            console.warn('Task is undefined or null');
            this.renderDefaultVisual(containerId);
            return null;
        }
        if (!task.steps || stepIndex >= task.steps.length) {
            console.warn('Invalid stepIndex for task');
            this.renderDefaultVisual(containerId);
            return null;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id ${containerId} not found`);
            return null;
        }

        const step = task.steps[stepIndex];
        const visualType = step.visualType;
        const visualConfig = this.config.visuals[visualType];

        if (!visualConfig) {
            console.warn(`No visual configuration found for type: ${visualType}`);
            this.renderDefaultVisual(containerId);
            return null;
        }

        const visualHTML = this.createVisualHTML(step, visualType, visualConfig);
        container.innerHTML = visualHTML;
        container.className = `task-visual-container ${visualConfig.container}`;
        this.addAnimations(container, visualConfig.animationType);
    }

    createVisualHTML(step, visualType, visualConfig) {
        switch (visualType) {
            case 'data_loading':
                return this.createDataLoadingHTML(step);
            case 'statistics':
                return this.createStatisticsHTML(step);
            case 'pattern_analysis':
                return this.createPatternAnalysisHTML(step);
            case 'documentation':
                return this.createDocumentationHTML(step);
            case 'architecture':
                return this.createArchitectureHTML(step);
            case 'pipeline':
                return this.createPipelineHTML(visualType);
            case 'pipeline_diagram':
                return this.createPipelineHTML(visualType);
            case 'data_table':
                return this.createDataTableHTML(step);
            case 'training':
                return this.createTrainingHTML(visualType);
            case 'ai_lab':
                return this.createTrainingHTML(visualType);
            case 'github_issue':
                return this.createGitHubHTML(visualType);
            case 'github_feature':
                return this.createGitHubHTML(visualType);
            case 'github_pull_request':
                return this.createGitHubHTML(visualType);
            case 'chart':
                return this.createChartHTML(step);
            default:
                return this.createDefaultVisualHTML(visualType);
        }
    }

    createDataLoadingHTML(step) {
        // Implementation for data loading HTML
    }

    createStatisticsHTML(step) {
        // Implementation for statistics HTML
    }

    createPatternAnalysisHTML(step) {
        // Implementation for pattern analysis HTML
    }

    createDocumentationHTML(step) {
        // Implementation for documentation HTML
    }

    createArchitectureHTML(step) {
        // Implementation for architecture HTML
    }

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
                    ${i < stages.length - 1 ? '<div class="pipeline-arrow">Ã¢â€ â€™</div>' : ''}
                `).join('')}
            </div>
        `;
    }
    
    createDataTableHTML(step) {
        // Implementation for data table HTML
    }

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

    createChartHTML(step) {
        // Implementation for chart HTML
    }

    createDefaultVisualHTML(type) {
        return `<div class="default-visual"><div class="visual-icon">${this.getVisualIcon(type)}</div><div class="visual-label">${type}</div></div>`;
    }

    getStageIcon(stage) {
        const icons = {
            'Extract': '',
            'Transform': '',
            'Load': '',
            'Source': '',
            'Process': '',
            'Destination': ''
        };
        return icons[stage] || 'Ã¢â€”ï¿½';
    }

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

    addAnimations(container, animationType) {
        container.classList.add(`animate-${animationType}`);
    }

    renderDefaultVisual(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="default-task-visual">Working...</div>';
        }
    }
}