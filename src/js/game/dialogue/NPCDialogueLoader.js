/**
 * NPCDialogueLoader.js
 * Loads individual dialogue files for each NPC
 * Supports both .js and .json formats
 * Each NPC has their own dialogue file
 */

export class NPCDialogueLoader {
    constructor() {
        this.loadedDialogues = new Map();
        this.loadingPromises = new Map();
    }
    
    /**
     * Load dialogue for NPC
     */
    async loadNPCDialogue(npcId) {
        // Check if already loaded
        if (this.loadedDialogues.has(npcId)) {
            return this.loadedDialogues.get(npcId);
        }
        
        // Check if currently loading
        if (this.loadingPromises.has(npcId)) {
            return this.loadingPromises.get(npcId);
        }
        
        // Try to load dialogue file
        const loadPromise = this.loadDialogueFile(npcId);
        this.loadingPromises.set(npcId, loadPromise);
        
        try {
            const dialogue = await loadPromise;
            this.loadedDialogues.set(npcId, dialogue);
            this.loadingPromises.delete(npcId);
            return dialogue;
        } catch (error) {
            console.warn(`Failed to load dialogue for ${npcId}, using fallback:`, error);
            this.loadingPromises.delete(npcId);
            return this.getFallbackDialogue(npcId);
        }
    }
    
    /**
     * Load dialogue file (try .js first, then .json)
     */
    async loadDialogueFile(npcId) {
        // Try .js file first
        try {
            const jsModule = await import(`/src/js/game/dialogue/npcs/${npcId}.js`);
            if (jsModule && jsModule.default) {
                return jsModule.default;
            }
        } catch (error) {
            // .js not found, try .json
        }
        
        // Try .json file
        try {
            const response = await fetch(`/src/js/game/dialogue/npcs/${npcId}.json`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            // .json not found
        }
        
        throw new Error(`No dialogue file found for ${npcId}`);
    }
    
    /**
     * Get fallback dialogue if file not found
     */
    getFallbackDialogue(npcId) {
        return {
            npcId: npcId,
            stages: {
                stranger: {
                    greeting: "Hello.",
                    topics: []
                },
                acquaintance: {
                    greeting: "Hey.",
                    topics: []
                },
                friend: {
                    greeting: "Hi there!",
                    topics: []
                }
            },
            breakdowns: [],
            emotionalTriggers: []
        };
    }
    
    /**
     * Get dialogue for relationship stage
     */
    getDialogueForStage(npcId, relationshipLevel) {
        const dialogue = this.loadedDialogues.get(npcId);
        if (!dialogue) return null;
        
        // Determine stage based on relationship
        let stage = 'stranger';
        if (relationshipLevel >= 80) stage = 'close_friend';
        else if (relationshipLevel >= 60) stage = 'friend';
        else if (relationshipLevel >= 40) stage = 'acquaintance';
        else if (relationshipLevel >= 20) stage = 'friendly';
        
        return dialogue.stages[stage] || dialogue.stages.stranger;
    }
    
    /**
     * Get age-appropriate dialogue
     */
    getAgeAppropriateDialogue(npcId, npcAge, relationshipLevel) {
        const dialogue = this.loadedDialogues.get(npcId);
        if (!dialogue) return null;
        
        const stage = this.getRelationshipStage(relationshipLevel);
        const stageDialogue = dialogue.stages[stage];
        
        if (!stageDialogue) return null;
        
        // Filter by age appropriateness
        const ageGroup = this.getAgeGroup(npcAge);
        return stageDialogue.ageGroups?.[ageGroup] || stageDialogue;
    }
    
    /**
     * Get relationship stage
     */
    getRelationshipStage(relationshipLevel) {
        if (relationshipLevel >= 80) return 'close_friend';
        if (relationshipLevel >= 60) return 'friend';
        if (relationshipLevel >= 40) return 'acquaintance';
        if (relationshipLevel >= 20) return 'friendly';
        return 'stranger';
    }
    
    /**
     * Get age group
     */
    getAgeGroup(age) {
        if (age < 25) return 'young';
        if (age < 40) return 'adult';
        if (age < 60) return 'middle_aged';
        return 'elderly';
    }
}

export const npcDialogueLoader = new NPCDialogueLoader();

