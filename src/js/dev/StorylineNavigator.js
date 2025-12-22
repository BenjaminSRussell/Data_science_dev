/**
 * Storyline Navigator
 * Allows devs to jump to any story beat and test storyline progression
 */

export class StorylineNavigator {
    constructor(game) {
        this.game = game;
    }

    /**
     * Get all story beats organized by phase
     */
    getAllStoryBeats() {
        try {
            const storyBeatsSystem = this.game?.gameState?.storyBeatsSystem;
            if (!storyBeatsSystem) {
                console.warn('StoryBeatsSystem not available');
                return {};
            }

            const phases = ['early', 'mid', 'late', 'endgame'];
            const allBeats = {};

            phases.forEach(phase => {
                try {
                    allBeats[phase] = storyBeatsSystem.getStoryBeatsForPhase?.(phase) || [];
                } catch (error) {
                    console.warn(`Error getting beats for phase ${phase}:`, error);
                    allBeats[phase] = [];
                }
            });

            return allBeats;
        } catch (error) {
            console.error('Error in getAllStoryBeats:', error);
            return {};
        }
    }

    /**
     * Trigger a specific story beat
     */
    triggerStoryBeat(beatId) {
        try {
            const storyBeatsSystem = this.game.gameState?.storyBeatsSystem;
            if (!storyBeatsSystem) {
                throw new Error('StoryBeatsSystem not initialized');
            }

            // Find the beat
            const phases = ['early', 'mid', 'late', 'endgame'];
            let foundBeat = null;

            for (const phase of phases) {
                const beats = storyBeatsSystem.getStoryBeatsForPhase?.(phase) || [];
                foundBeat = beats.find(b => b.id === beatId);
                if (foundBeat) break;
            }

            if (!foundBeat) {
                throw new Error(`Story beat "${beatId}" not found`);
            }

            // Trigger the beat
            if (this.game.handleStoryBeat) {
                this.game.handleStoryBeat(foundBeat);
                return { success: true, message: `Triggered story beat: ${foundBeat.title}` };
            } else {
                // Manual trigger
                storyBeatsSystem.completedBeats = storyBeatsSystem.completedBeats || [];
                if (!storyBeatsSystem.completedBeats.includes(beatId)) {
                    storyBeatsSystem.completedBeats.push(beatId);
                }
                return { success: true, message: `Marked story beat as completed: ${foundBeat.title}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Set storyline phase
     */
    setStorylinePhase(phase) {
        try {
            const storylineManager = this.game.gameState?.storylineManager;
            if (!storylineManager) {
                throw new Error('StorylineManager not initialized');
            }

            const validPhases = ['early', 'mid', 'late', 'endgame'];
            if (!validPhases.includes(phase)) {
                throw new Error(`Invalid phase: ${phase}. Must be one of: ${validPhases.join(', ')}`);
            }

            storylineManager.storylinePhase = phase;
            return { success: true, message: `Storyline phase set to: ${phase}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current storyline state
     */
    getStorylineState() {
        try {
            const storylineManager = this.game?.gameState?.storylineManager;
            const storyBeatsSystem = this.game?.gameState?.storyBeatsSystem;

            if (!storylineManager) {
                return { 
                    error: 'StorylineManager not initialized',
                    phase: 'unknown',
                    progress: 0,
                    currentArc: null,
                    completedDecisions: [],
                    completedBeats: [],
                    pendingBeats: []
                };
            }

            return {
                phase: storylineManager.storylinePhase || 'unknown',
                progress: storylineManager.storylineProgress || 0,
                currentArc: storylineManager.getCurrentArc?.() || null,
                completedDecisions: storylineManager.majorDecisions || [],
                completedBeats: storyBeatsSystem?.completedBeats || [],
                pendingBeats: storyBeatsSystem?.pendingBeats || []
            };
        } catch (error) {
            console.error('Error getting storyline state:', error);
            return {
                error: error.message,
                phase: 'unknown',
                progress: 0,
                currentArc: null,
                completedDecisions: [],
                completedBeats: [],
                pendingBeats: []
            };
        }
    }
}

