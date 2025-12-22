/**
 * StoryBeatsSystem.js
 * Manages specific story beats that trigger at key moments
 * Priority 2: Narrative Structure
 */

export class StoryBeatsSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.completedBeats = [];
        this.pendingBeats = [];
    }

    /**
     * Initialize story beats
     */
    initialize() {
        this.completedBeats = this.gameState.completedStoryBeats || [];
        this.updatePendingBeats();
    }

    /**
     * Get story beats for current phase
     */
    getStoryBeatsForPhase(phase) {
        const beats = {
            early: [
                {
                    id: 'first_job',
                    title: 'Your First Job',
                    description: 'You got your first job. This is where it all begins.',
                    trigger: { type: 'job_obtained', condition: true },
                    required: true
                },
                {
                    id: 'first_task_complete',
                    title: 'First Task Completed',
                    description: 'You completed your first data visualization task. The journey has truly begun.',
                    trigger: { type: 'task_completed', count: 1 },
                    required: true
                },
                {
                    id: 'first_promotion',
                    title: 'Moving Up',
                    description: 'You got promoted! Your hard work is paying off.',
                    trigger: { type: 'rank_increase', from: 0, to: 1 },
                    required: false
                },
                {
                    id: 'rent_due_first',
                    title: 'First Rent Payment',
                    description: 'Rent is due. The reality of city life sets in.',
                    trigger: { type: 'rent_paid', week: 1 },
                    required: true
                },
                {
                    id: 'meet_first_npc',
                    title: 'Making Connections',
                    description: 'You met someone new. Relationships matter in this city.',
                    trigger: { type: 'npc_met', count: 1 },
                    required: false
                }
            ],
            mid: [
                {
                    id: 'mid_career',
                    title: 'Established Professional',
                    description: 'You\'ve established yourself. People know your name.',
                    trigger: { type: 'rank_increase', from: 2, to: 3 },
                    required: false
                },
                {
                    id: 'major_decision_mid',
                    title: 'A Turning Point',
                    description: 'You face a major decision that will shape your future.',
                    trigger: { type: 'major_decision', phase: 'mid' },
                    required: true
                },
                {
                    id: 'financial_stability',
                    title: 'Financial Stability',
                    description: 'You\'ve achieved financial stability. Money is no longer a daily worry.',
                    trigger: { type: 'money_threshold', amount: 10000 },
                    required: false
                },
                {
                    id: 'reputation_rising',
                    title: 'Building Reputation',
                    description: 'Your reputation is growing. Opportunities are opening up.',
                    trigger: { type: 'reputation_threshold', amount: 500 },
                    required: false
                }
            ],
            late: [
                {
                    id: 'senior_position',
                    title: 'Senior Position',
                    description: 'You\'ve reached a senior position. The stakes are higher now.',
                    trigger: { type: 'rank_increase', from: 4, to: 5 },
                    required: false
                },
                {
                    id: 'major_decision_late',
                    title: 'The Ultimate Test',
                    description: 'Everything you\'ve built comes to a head. This is the moment of truth.',
                    trigger: { type: 'major_decision', phase: 'late' },
                    required: true
                },
                {
                    id: 'ethical_crossroads',
                    title: 'Ethical Crossroads',
                    description: 'You face a choice that will define who you are.',
                    trigger: { type: 'ethics_extreme', threshold: 30 },
                    required: false
                }
            ],
            endgame: [
                {
                    id: 'final_rank',
                    title: 'Peak Achievement',
                    description: 'You\'ve reached the pinnacle of your career.',
                    trigger: { type: 'rank_increase', to: 6 },
                    required: false
                },
                {
                    id: 'story_complete',
                    title: 'Your Story Complete',
                    description: 'Your journey in Data City has reached its conclusion.',
                    trigger: { type: 'days_threshold', days: 180 },
                    required: true
                }
            ]
        };

        return beats[phase] || [];
    }

    /**
     * Update pending beats based on current game state
     */
    updatePendingBeats() {
        const storylineManager = this.gameState.storylineManager;
        if (!storylineManager) return;

        const phase = storylineManager.storylinePhase;
        const allBeats = this.getStoryBeatsForPhase(phase);
        
        // Filter out completed beats
        this.pendingBeats = allBeats.filter(beat => 
            !this.completedBeats.includes(beat.id)
        );
    }

    /**
     * Check if a beat should trigger
     */
    checkBeatTrigger(beat) {
        const trigger = beat.trigger;
        
        switch (trigger.type) {
            case 'job_obtained':
                return this.gameState.currentJob !== null;
            
            case 'task_completed':
                const taskCount = this.gameState.tasksCompleted || 0;
                return taskCount >= (trigger.count || 1);
            
            case 'rank_increase':
                const currentRank = this.gameState.rankIndex || 0;
                if (trigger.from !== undefined) {
                    return currentRank > trigger.from;
                }
                if (trigger.to !== undefined) {
                    return currentRank >= trigger.to;
                }
                return false;
            
            case 'rent_paid':
                const timeManager = this.gameState.timeManager;
                if (!timeManager) return false;
                const weeks = Math.floor((timeManager.totalDays || 0) / 7);
                return weeks >= (trigger.week || 1);
            
            case 'npc_met':
                const npcManager = this.gameState.npcManager;
                if (!npcManager) return false;
                const metNPCs = npcManager.getMetNPCs?.() || [];
                return metNPCs.length >= (trigger.count || 1);
            
            case 'major_decision':
                const storylineManager = this.gameState.storylineManager;
                if (!storylineManager) return false;
                const decisions = storylineManager.majorDecisions || [];
                const phaseDecisions = decisions.filter(d => {
                    const decisionData = storylineManager.getDecision?.(d.decisionId);
                    return decisionData && decisionData.phase === trigger.phase;
                });
                return phaseDecisions.length > 0;
            
            case 'money_threshold':
                return (this.gameState.money || 0) >= (trigger.amount || 0);
            
            case 'reputation_threshold':
                return (this.gameState.reputation || 0) >= (trigger.amount || 0);
            
            case 'ethics_extreme':
                const characterStats = this.gameState.characterStats;
                if (!characterStats) return false;
                const ethics = characterStats.ethics || 0;
                return Math.abs(ethics) >= (trigger.threshold || 30);
            
            case 'days_threshold':
                const timeMgr = this.gameState.timeManager;
                if (!timeMgr) return false;
                return (timeMgr.totalDays || 0) >= (trigger.days || 180);
            
            default:
                return false;
        }
    }

    /**
     * Check for triggered beats
     */
    checkForTriggeredBeats() {
        this.updatePendingBeats();
        
        const triggeredBeats = this.pendingBeats.filter(beat => 
            this.checkBeatTrigger(beat)
        );

        return triggeredBeats;
    }

    /**
     * Complete a story beat
     */
    completeBeat(beatId) {
        if (this.completedBeats.includes(beatId)) return;

        this.completedBeats.push(beatId);
        this.gameState.completedStoryBeats = this.completedBeats;
        
        // Remove from pending
        this.pendingBeats = this.pendingBeats.filter(b => b.id !== beatId);
    }

    /**
     * Get beat by ID
     */
    getBeat(beatId) {
        const allPhases = ['early', 'mid', 'late', 'endgame'];
        for (const phase of allPhases) {
            const beats = this.getStoryBeatsForPhase(phase);
            const beat = beats.find(b => b.id === beatId);
            if (beat) return beat;
        }
        return null;
    }

    /**
     * Get completion status
     */
    getCompletionStatus(phase) {
        const beats = this.getStoryBeatsForPhase(phase);
        const requiredBeats = beats.filter(b => b.required);
        const completedRequired = requiredBeats.filter(b => 
            this.completedBeats.includes(b.id)
        );

        return {
            total: beats.length,
            completed: beats.filter(b => this.completedBeats.includes(b.id)).length,
            required: requiredBeats.length,
            completedRequired: completedRequired.length,
            progress: requiredBeats.length > 0 
                ? (completedRequired.length / requiredBeats.length) * 100 
                : 0
        };
    }
}
