class AITrainingStoryline {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentPhase = 'pre_attention';
        this.timeline = {
            pre_attention: {
                name: 'Pre-Attention Era',
                description: 'The era before AI models can focus on attention mechanisms.',
                milestones: [
                    { id: 'milestone1', name: 'Basic AI models', completed: false },
                    { id: 'milestone2', name: 'Data preparation', completed: false }
                ]
            },
            attention_era: {
                name: 'Attention Era',
                description: 'AI models start focusing on attention mechanisms.',
                milestones: [
                    { id: 'milestone3', name: 'Attention models', completed: false },
                    { id: 'milestone4', name: 'Advanced training techniques', completed: false }
                ]
            },
            post_attention: {
                name: 'Post-Attention Era',
                description: 'AI models have mastered attention mechanisms and beyond.',
                milestones: [
                    { id: 'milestone5', name: 'State-of-the-art models', completed: false },
                    { id: 'milestone6', name: 'Innovative applications', completed: false }
                ]
            }
        };
        this.researchProgress = 0;
        this.modelsTrained = [];
        this.universityLab = null;
    }
    
    /**
     * Initialize university lab
     */
    initializeUniversityLab() {
        if (this.universityLab) return this.universityLab;
        
        this.universityLab = {
            computers: {
                gpu_cluster_1: {
                    name: 'GPU Cluster 1',
                    gpus: 8,
                    memory: '128GB',
                    available: true,
                    inUse: false
                },
                gpu_cluster_2: {
                    name: 'GPU Cluster 2',
                    gpus: 16,
                    memory: '256GB',
                    available: true,
                    inUse: false
                },
                gpu_cluster_3: {
                    name: 'GPU Cluster 3',
                    gpus: 24,
                    memory: '512GB',
                    available: true,
                    inUse: false
                }
            },
            facilities: {
                canPublish: true, // Can publish research
                requiresSupervision: true
            },
            currentProjects: [],
            researchPapers: []
        };
        
        return this.universityLab;
    }
    
    /**
     * Start AI training project
     */
    startAITrainingProject(projectType) {
        if (!this.universityLab) {
            this.initializeUniversityLab();
        }
        
        // Check if in university lab
        if (this.gameState.currentLocation !== 'university') {
            return {
                success: false,
                message: 'You must be at the university lab to start AI training projects.'
            };
        }
        
        // Find available GPU cluster
        const availableCluster = Object.values(this.universityLab.computers)
            .find(cluster => cluster.available && !cluster.inUse);
        
        if (!availableCluster) {
            return {
                success: false,
                message: 'No GPU clusters available. Wait for current training to complete.'
            };
        }
        
        // Create training project
        const project = {
            id: `ai_training_${Date.now()}`,
            type: projectType,
            phase: this.currentPhase,
            cluster: availableCluster.name,
            clusterKey: Object.keys(this.universityLab.computers).find(key => this.universityLab.computers[key] === availableCluster), // Store snake_case key
            startedAt: Date.now(),
            status: 'training',
            progress: 0,
            epochs: this.getEpochsForPhase(this.currentPhase),
            currentEpoch: 0,
            canTakeModel: false // University property
        };
        
        availableCluster.inUse = true;
        this.universityLab.currentProjects.push(project);
        
        return {
            success: true,
            project: project,
            message: `Started ${projectType} training on ${availableCluster.name}`
        };
    }
    
    /**
     * Get epochs required for phase
     */
    getEpochsForPhase(phase) {
        const phases = {
            pre_attention: 50, // Very long training
            attention_era: 30,
            post_attention: 20
        };
        return phases[phase] || 30;
    }
    
    /**
     * Update training progress
     */
    updateTrainingProgress(projectId, progress) {
        const project = this.universityLab.currentProjects.find(p => p.id === projectId);
        if (!project) return;
        
        project.progress = progress;
        
        // Calculate epoch progress
        const epochProgress = (progress / 100) * project.epochs;
        project.currentEpoch = Math.floor(epochProgress);
        
        // Check if complete
        if (progress >= 100) {
            this.completeTrainingProject(projectId);
        }
    }
    
    /**
     * Complete training project
     */
    completeTrainingProject(projectId) {
        const project = this.universityLab.currentProjects.find(p => p.id === projectId);
        if (!project) return;
        
        project.status = 'completed';
        project.completedAt = Date.now();
        
        // Free up cluster
        const cluster = this.universityLab.computers[project.clusterKey]; // Use snake_case key
        if (cluster) {
            cluster.inUse = false;
        }
        
        // Add to trained models (but can't take it)
        this.modelsTrained.push({
            ...project,
            learned: true,
            canTake: false
        });
        
        // Update research progress
        this.researchProgress += 10;
        
        // Check for phase transitions
        this.checkPhaseTransition();
        
        return {
            success: true,
            message: 'Training complete! You learned from the model, but it remains university property.',
            learned: true,
            canTake: false
        };
    }
    
    /**
     * Check if phase should transition
     */
    checkPhaseTransition() {
        // Transition to attention era after certain progress
        if (this.currentPhase === 'pre_attention' && this.researchProgress >= 50) {
            this.transitionToPhase('attention_era');
        }
        
        // Transition to post-attention after attention era milestones
        if (this.currentPhase === 'attention_era') {
            const attentionMilestones = this.timeline.attention_era.milestones;
            const allCompleted = attentionMilestones.every(m => m.completed);
            if (allCompleted) {
                this.transitionToPhase('post_attention');
            }
        }
    }
    
    /**
     * Transition to new phase
     */
    transitionToPhase(phaseName) {
        this.currentPhase = phaseName;
        const phase = this.timeline[phaseName];
        
        // Show notification
        if (window.game && window.game.showToast) {
            window.game.showToast(
                ` New Era: ${phase.name}! ${phase.description}`,
                'info'
            );
        }
        
        return phase;
    }
    
    /**
     * Get current phase info
     */
    getCurrentPhase() {
        return this.timeline[this.currentPhase];
    }
    
    /**
     * Complete milestone
     */
    completeMilestone(milestoneId) {
        const phase = this.timeline[this.currentPhase];
        const milestone = phase.milestones.find(m => m.id === milestoneId);
        
        if (milestone && !milestone.completed) {
            milestone.completed = true;
            this.researchProgress += 5;
            
            // Check for phase transition
            this.checkPhaseTransition();
            
            return {
                success: true,
                message: `Milestone completed: ${milestone.name}`
            };
        }
        
        return { success: false };
    }
    
    /**
     * Use university computer
     */
    useUniversityComputer(clusterName) {
        if (!this.universityLab) {
            this.initializeUniversityLab();
        }
        
        const cluster = this.universityLab.computers[clusterName];
        if (!cluster) {
            return { success: false, message: 'Cluster not found' };
        }
        
        if (!cluster.available) {
            return { success: false, message: 'Cluster not available yet' };
        }
        
        if (cluster.inUse) {
            return { success: false, message: 'Cluster is currently in use' };
        }
        
        return {
            success: true,
            cluster: cluster,
            message: `Using ${cluster.name} (${cluster.gpus} GPUs, ${cluster.memory} memory)`
        };
    }
    
    /**
     * Learn from trained model (but can't take it)
     */
    learnFromModel(projectId) {
        const project = this.universityLab.currentProjects.find(p => p.id === projectId);
        if (!project || project.status !== 'completed') {
            return { success: false, message: 'Project not completed yet' };
        }
        
        // Gain knowledge but can't take model
        const knowledgeGain = {
            experience: 200,
            skills: ['deep_learning', 'neural_networks', 'distributed_training'],
            insights: `Learned from ${project.type} training. Model remains university property.`
        };
        
        // Apply knowledge gain
        knowledgeGain.skills.forEach(skill => {
            if (!this.gameState.stats[skill]) {
                this.gameState.stats[skill] = 0;
            }
            this.gameState.stats[skill] += 50;
        });
        
        return {
            success: true,
            knowledge: knowledgeGain,
            message: 'You have learned from the trained model.'
        };
    }
    
    /**
     * Serialize the state of the storyline
     */
    serialize() {
        return {
            currentPhase: this.currentPhase,
            timeline: this.timeline,
            researchProgress: this.researchProgress,
            modelsTrained: this.modelsTrained,
            universityLab: this.universityLab
        };
    }
    
    /**
     * Deserialize the state of the storyline
     */
    deserialize(state) {
        this.currentPhase = state.currentPhase;
        this.timeline = state.timeline;
        this.researchProgress = state.researchProgress;
        this.modelsTrained = state.modelsTrained;
        this.universityLab = state.universityLab;
    }
}