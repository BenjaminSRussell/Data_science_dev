import { DIALOGUE_TEMPLATES, DIALOGUE_CHOICES, DIALOGUE_TREES } from './npcData';
import { PERSONALITY_TRAITS } from './npcData';

export class NPCManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.npcs = [];
        this.metNPCs = [];
        this.relationships = {};
        this.npcStates = {};
        this.currentConversation = null;
    }

    addNPC(npc) {
        this.npcs.push(npc);
        this.relationships[npc.id] = 0;
        this.npcStates[npc.id] = { currentNode: 'root' };
    }

    getNPC(npcId) {
        return this.npcs.find(npc => npc.id === npcId);
    }

    markNPCAsMet(npcId) {
        if (!this.metNPCs.includes(npcId)) {
            this.metNPCs.push(npcId);
        }
    }

    modifyRelationship(npcId, amount) {
        const npc = this.getNPC(npcId);
        if (!npc) return;
        const personality = PERSONALITY_TRAITS[npc.personality] || PERSONALITY_TRAITS.friendly;
        const adjustedAmount = Math.floor(amount * personality.relationshipGain);
        this.relationships[npcId] = Math.max(0, Math.min(100, this.relationships[npcId] + adjustedAmount));
    }

    getRelationship(npcId) {
        return this.relationships[npcId] || 0;
    }

    getRelationshipTier(npcId) {
        const relationship = this.getRelationship(npcId);
        if (relationship >= 80) return 'max_relationship';
        if (relationship >= 50) return 'high_relationship';
        if (relationship >= 20) return 'medium_relationship';
        if (relationship >= 10) return 'low_relationship';
        return 'first_meeting';
    }

    startConversation(npcId) {
        const npc = this.getNPC(npcId);
        if (!npc) return null;
        this.currentConversation = {
            npc,
            stage: 'greeting',
            relationship: this.relationships[npcId]
        };
        this.markNPCAsMet(npcId);
        return npc;
    }

    endConversation() {
        this.currentConversation = null;
    }

    getGreeting() {
        if (!this.currentConversation) return '';

        const npc = this.currentConversation.npc;
        const relationship = this.currentConversation.relationship;
        const personalityGreetings = {
            friendly: [
                "Hi there! What brings you here?",
                "Hey! How can I help you today?",
                "Hello! Nice to see you."
            ],
            professional: [
                "Good day. What business do you have?",
                "Greetings. How may I assist you?",
                "Hello! What can I do for you?"
            ],
            competitive: [
                "Welcome, competitor. What brings you here?",
                "A pleasure to see you. What can I do for you?",
                "Hello! I'm still trying to keep up."
            ],
            mysterious: [
                "...",
                "You again.",
                "*nods silently*"
            ],
            generous: [
                "Hello! I'm here to help!",
                "Hi! Need anything?",
                "Welcome! What can I do for you?"
            ]
        };

        const greetings = personalityGreetings[npc.personality] || personalityGreetings.friendly;
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    getGreetingPool(relationship, isFirstMeeting) {
        if (isFirstMeeting) {
            return DIALOGUE_TEMPLATES.first_meeting;
        } else if (relationship < 20) {
            return DIALOGUE_TEMPLATES.low_relationship;
        } else if (relationship < 50) {
            return DIALOGUE_TEMPLATES.medium_relationship;
        } else if (relationship < 80) {
            return DIALOGUE_TEMPLATES.high_relationship;
        } else {
            return DIALOGUE_TEMPLATES.max_relationship;
        }
    }

    getAvailableChoices(stage, relationship) {
        // Tree Logic
        const npcId = this.currentConversation ? this.currentConversation.npc.id : null;
        if (npcId && DIALOGUE_TREES[npcId]) {
            const state = this.getNPCState(npcId);
            const node = DIALOGUE_TREES[npcId][state.currentNode || 'root'];

            if (node) {
                // Filter choices by requirements
                return node.choices.filter(c => {
                    let met = true;
                    if (c.requiredRelationship && relationship < c.requiredRelationship) met = false;
                    return met;
                });
            }
        }

        // Fallback to legacy choices
        const choices = DIALOGUE_CHOICES[stage] || DIALOGUE_CHOICES['greeting'];

        // Filter by relationship requirement
        return choices.filter(c => {
            if (!c.requiredRelationship) return true;
            return relationship >= c.requiredRelationship;
        });
    }

    makeChoice(choiceIndex) {
        if (!this.currentConversation) return null;

        // Re-get choices to include dynamic ones
        let choices = this.getAvailableChoices(this.currentConversation.stage, this.currentConversation.relationship);

        // Dynamic Choices injection logic
        // 1. Ask Date (if single)
        if (!this.gameState.romanceSystem?.partnerId &&
            this.currentConversation.npc.romanceOptions &&
            this.currentConversation.relationship >= 30) {
            choices.push({
                text: "Would you like to go on a date?",
                action: 'date_ask',
                effect: { relationship: 0 }
            });
        }

        // 2. Date Night (if partner)
        if (this.gameState.romanceSystem?.partnerId === this.currentConversation.npc.id) {
            choices.push(
                { text: "Let's grab a coffee ($20)", action: 'date_coffee', effect: { relationship: 0 } },
                { text: "Dinner tonight? ($100)", action: 'date_dinner', effect: { relationship: 0 } },
                { text: "Weekend Trip! ($2000)", action: 'date_vacation', effect: { relationship: 0 } }
            );
            // Propose logic
            if (this.gameState.romanceSystem?.relationshipStatus === 'dating' && this.gameState.romanceSystem?.relationshipScore > 80) {
                choices.push({ text: "I have a question... (Propose)", action: 'date_propose', effect: { relationship: 0 } });
            }
        }

        const choice = choices[choiceIndex];
        if (!choice) return null;

        // Handle special actions
        if (choice.action === 'date_ask') {
            const result = this.gameState.romanceSystem?.askOnDate(this.currentConversation.npc.id);
            return {
                success: result.success,
                text: result.message,
                effects: {},
                newRelationship: this.relationships[this.currentConversation.npc.id],
                isSpecialAction: true
            };
        }

        // Handle Dating Actions
        if (choice.action && choice.action.startsWith('date_')) {
            let result;
            if (choice.action === 'date_propose') {
                result = this.gameState.romanceSystem?.propose();
            } else {
                const type = choice.action.replace('date_', '');
                result = this.gameState.romanceSystem?.goOnDate(type);
            }

            return {
                success: result.success,
                text: result.message,
                effects: {},
                newRelationship: this.relationships[this.currentConversation.npc.id],
                isSpecialAction: true
            };
        }

        // Apply choice effects
        const effects = choice.effect || {};
        this.applyChoiceEffects(effects);

        // Return result
        return {
            success: true,
            text: choice.text,
            effects,
            newRelationship: this.relationships[this.currentConversation.npc.id],
            tier: this.getRelationshipTier(this.currentConversation.npc.id),
            isTreeAction: false
        };
    }

    /**
     * Apply choice effects
     */
    applyChoiceEffects(effects) {
        const npcId = this.currentConversation.npc.id;

        // Apply relationship change
        if (effects.relationship) {
            this.modifyRelationship(npcId, effects.relationship);
        }

        // XP rewards
        if (effects.xp) {
            const amount = effects.xpAmount || 20;
            this.gameState.characterStats?.addExperience(effects.xp, amount);
        }

        // Ethics change
        if (effects.ethics) {
            this.gameState.characterStats?.modifyEthics(effects.ethics);
        }

        // Money change
        if (effects.money) {
            this.gameState.money += effects.money;
        }

        // Flags (Quest tracking)
        if (effects.flag) {
            const state = this.getNPCState(npcId);
            if (!state.flags) state.flags = {};
            state.flags[effects.flag] = true;
        }
    }

    /**
     * Give gift to NPC
     */
    giveGift(npcId, giftId) {
        const npc = this.getNPC(npcId);
        if (!npc) return { success: false, reason: 'NPC not found' };

        // Mark as met if not already
        if (!this.metNPCs.includes(npcId)) {
            this.markNPCAsMet(npcId);
        }

        const likesGift = npc.gifts.includes(giftId);
        const relationshipGain = likesGift ? 15 : 5; // Liked gift gives more relationship points

        // Apply relationship change
        this.modifyRelationship(npcId, relationshipGain);

        return { success: true, newRelationship: this.relationships[npcId] };
    }

    getNPCState(npcId) {
        return this.npcStates[npcId] || { currentNode: 'root' };
    }

    setNPCState(npcId, state) {
        this.npcStates[npcId] = state;
    }
}