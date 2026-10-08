/**
 * NPCDialogueLoader.js
 * Loads individual dialogue files for each NPC
 * Supports both .js and .json formats
 * Each NPC has their own dialogue file
 */

// Bundle every per-NPC dialogue file. A @vite-ignore'd template import is
// never bundled, so it only worked under the dev server (#817-#842).
import { relationshipStage, RELATIONSHIP_STAGES } from '../../data/relationshipStages.js';

const NPC_DIALOGUE_MODULES = import.meta.glob('./npcs/*.js');
const STAGE_KEYS = RELATIONSHIP_STAGES.map(s => s.tier);

export class NPCDialogueLoader {
    constructor() {
        this.loadedDialogues = new Map();
        this.loadingPromises = new Map();
    }
    
    /**
     * Load dialogue for NPC
     */
    loadNPCDialogue(npcId) {
        // Check if already loaded
        if (this.loadedDialogues.has(npcId)) {
            return Promise.resolve(this.loadedDialogues.get(npcId));
        }

        // Concurrent callers share one in-flight promise. This method is not
        // async, so it hands back that exact promise instead of a new wrapper.
        if (this.loadingPromises.has(npcId)) {
            return this.loadingPromises.get(npcId);
        }

        let raw;
        try {
            raw = Promise.resolve(this.loadDialogueFile(npcId));
        } catch (error) {
            raw = Promise.reject(error);
        }
        const loadPromise = raw
            .then(dialogue => {
                this.loadedDialogues.set(npcId, dialogue);
                this.loadingPromises.delete(npcId);
                return dialogue;
            }, () => {
                // Failed to load dialogue. Cache the fallback too, so the
                // cache-reading getters (getAgeAppropriateDialogue,
                // getDialogueForStage) see it instead of null (#2184)
                const fallback = this.getFallbackDialogue(npcId);
                this.loadedDialogues.set(npcId, fallback);
                this.loadingPromises.delete(npcId);
                return fallback;
            });
        this.loadingPromises.set(npcId, loadPromise);
        return loadPromise;
    }

    /**
     * Load dialogue file (try .js first, then .json)
     */
    async loadDialogueFile(npcId) {
        // Try .js file first
        const loadModule = NPC_DIALOGUE_MODULES[`./npcs/${npcId}.js`];
        if (loadModule) {
            try {
                const jsModule = await loadModule();
                if (jsModule && jsModule.default) {
                    return jsModule.default;
                }
            } catch (error) {
                // The file exists, so this is a real bug in it, not a missing
                // file: say so instead of silently falling back (#2186)
                console.error(`Dialogue file for ${npcId} failed to load:`, error);
            }
        }
        
        // Try .json file
        try {
            const response = await fetch(new URL(`./npcs/${npcId}.json`, import.meta.url).href);
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
        // Every stage getRelationshipStage() can return, so a friendly or
        // close-friend NPC isn't answered with null/stranger lines (#2317)
        const greetings = {
            stranger: ['Hello.'],
            friendly: ['Hey, good to see you.'],
            acquaintance: ['Hey.'],
            friend: ['Hi there!'],
            close_friend: ['There you are! I was hoping you would stop by.']
        };
        const stages = {};
        for (const key of STAGE_KEYS) stages[key] = { greeting: greetings[key], topics: {} };
        return {
            npcId: npcId,
            stages,
            breakdowns: {},
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
        
        // Filter by age appropriateness. Callers pass the age of the player
        // being spoken to (#2081)
        const ageGroup = this.getAgeGroup(npcAge);
        return stageDialogue.ageGroups?.[ageGroup] || stageDialogue;
    }
    
    /**
     * Get relationship stage
     */
    getRelationshipStage(relationshipLevel) {
        // Shared scale with NPCManager and RoommateSystem (#916, #566)
        return relationshipStage(relationshipLevel).tier;
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

