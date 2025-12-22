/**
 * SimpleDialogue.js
 * Clean, direct dialogue system with big personalities
 * Easy to understand, highly responsive
 */

// Personality moods - determines NPC reactions
export const MOOD = {
    HAPPY: 'happy',
    NEUTRAL: 'neutral',
    ANNOYED: 'annoyed',
    EXCITED: 'excited',
    SAD: 'sad',
    ANGRY: 'angry',
    FLIRTY: 'flirty',
    SUSPICIOUS: 'suspicious'
};

// Personality types - big, distinct personalities
export const PERSONALITY = {
    FRIENDLY: {
        name: 'friendly',
        defaultMood: MOOD.HAPPY,
        color: '#10b981',
        emoji: '',
        greetings: {
            stranger: ["Hey there! New face around here!", "Oh hi! I don't think we've met!"],
            acquaintance: ["Hey! Good to see you again!", "Oh hey you! What's up?"],
            friend: ["There's my favorite person!", "Hey bestie! What's going on?"],
            close: ["I was just thinking about you!", "Finally! I've been waiting to see you!"]
        },
        reactions: {
            happy: { emoji: '', text: 'lights up' },
            annoyed: { emoji: '', text: 'looks a bit uncomfortable' },
            excited: { emoji: '', text: 'bounces excitedly' }
        }
    },
    PROFESSIONAL: {
        name: 'professional',
        defaultMood: MOOD.NEUTRAL,
        color: '#8b5cf6',
        emoji: '',
        greetings: {
            stranger: ["Good day. How can I help you?", "Hello. What brings you here?"],
            acquaintance: ["Ah, good to see you. What's on your mind?", "Hello again. Business as usual?"],
            friend: ["Always a pleasure. What can I do for you?", "Good timing. I was about to reach out."],
            close: ["Perfect timing as always. Come in.", "I've been expecting you."]
        },
        reactions: {
            happy: { emoji: '', text: 'nods approvingly' },
            annoyed: { emoji: '', text: 'checks their watch' },
            excited: { emoji: '', text: 'leans forward with interest' }
        }
    },
    COMPETITIVE: {
        name: 'competitive',
        defaultMood: MOOD.NEUTRAL,
        color: '#f59e0b',
        emoji: '',
        greetings: {
            stranger: ["Who are you? Another competitor?", "New blood, huh? Think you can keep up?"],
            acquaintance: ["Back for more? Glutton for punishment.", "Oh, it's you. Ready to lose again?"],
            friend: ["Finally, worthy competition!", "There's my rival! Game on."],
            close: ["The only person worth competing against.", "Ready for our rematch?"]
        },
        reactions: {
            happy: { emoji: '', text: 'smirks confidently' },
            annoyed: { emoji: '', text: 'scoffs' },
            excited: { emoji: '', text: 'gets fired up' }
        }
    },
    MYSTERIOUS: {
        name: 'mysterious',
        defaultMood: MOOD.NEUTRAL,
        color: '#8b5cf6',
        emoji: '',
        greetings: {
            stranger: ["...", "Interesting. You found me."],
            acquaintance: ["You again. The threads of fate intertwine.", "Back so soon? Curious."],
            friend: ["I knew you would come.", "The cards predicted this meeting."],
            close: ["*smiles knowingly* Right on time.", "Some things are meant to be."]
        },
        reactions: {
            happy: { emoji: '', text: 'eyes glimmer' },
            annoyed: { emoji: '', text: 'shadows seem to deepen' },
            excited: { emoji: '', text: 'aura intensifies' }
        }
    },
    GRUMPY: {
        name: 'grumpy',
        defaultMood: MOOD.ANNOYED,
        color: '#ef4444',
        emoji: '',
        greetings: {
            stranger: ["What do you want?", "Ugh, another one. What?"],
            acquaintance: ["Oh, it's you. Make it quick.", "Back again? *sighs* Fine."],
            friend: ["Yeah yeah, come in I guess.", "*grumbles* At least it's you."],
            close: ["...glad you're here. Don't make a big deal of it.", "*actually smiles* Hey."]
        },
        reactions: {
            happy: { emoji: '', text: 'softens slightly' },
            annoyed: { emoji: '', text: 'vein pops on forehead' },
            excited: { emoji: '', text: 'eyebrows raise in surprise' }
        }
    },
    GENEROUS: {
        name: 'generous',
        defaultMood: MOOD.HAPPY,
        color: '#ec4899',
        emoji: '',
        greetings: {
            stranger: ["Welcome! Can I get you anything?", "Hello dear! How can I help?"],
            acquaintance: ["So lovely to see you! Tea?", "Oh wonderful! Just in time for cookies!"],
            friend: ["My favorite visitor! I made something for you!", "Perfect timing! I have a surprise!"],
            close: ["Come here, let me hug you!", "I've been saving something special for you!"]
        },
        reactions: {
            happy: { emoji: '', text: 'beams warmly' },
            annoyed: { emoji: '', text: 'looks concerned' },
            excited: { emoji: '', text: 'claps hands together' }
        }
    }
};

/**
 * Get relationship tier from level
 */
function getRelationshipTier(level) {
    if (level < 10) return 'stranger';
    if (level < 30) return 'acquaintance';
    if (level < 70) return 'friend';
    return 'close';
}

/**
 * SimpleDialogueManager - Clean dialogue handling
 */
export class SimpleDialogueManager {
    constructor() {
        this.currentNPC = null;
        this.currentMood = MOOD.NEUTRAL;
        this.dialogueHistory = [];
    }
    
    /**
     * Get NPC personality config
     */
    getPersonality(npc) {
        const type = npc.personality?.toUpperCase() || 'FRIENDLY';
        return PERSONALITY[type] || PERSONALITY.FRIENDLY;
    }
    
    /**
     * Get greeting based on relationship
     */
    getGreeting(npc, relationshipLevel) {
        const personality = this.getPersonality(npc);
        const tier = getRelationshipTier(relationshipLevel);
        const greetings = personality.greetings[tier];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    /**
     * Get reaction animation/text
     */
    getReaction(npc, mood) {
        const personality = this.getPersonality(npc);
        return personality.reactions[mood] || personality.reactions.happy;
    }
    
    /**
     * Start conversation
     */
    startConversation(npc, relationshipLevel) {
        this.currentNPC = npc;
        const personality = this.getPersonality(npc);
        this.currentMood = personality.defaultMood;
        
        return {
            npc: npc,
            greeting: this.getGreeting(npc, relationshipLevel),
            mood: this.currentMood,
            personality: personality,
            color: personality.color,
            emoji: personality.emoji
        };
    }
    
    /**
     * Process player choice and get NPC response
     */
    respond(choiceType, context = {}) {
        if (!this.currentNPC) return null;
        
        const personality = this.getPersonality(this.currentNPC);
        let response = { text: '', mood: this.currentMood, effect: {} };
        
        // Determine response based on choice type and personality
        switch (choiceType) {
            case 'compliment':
                response = this.handleCompliment(personality);
                break;
            case 'insult':
                response = this.handleInsult(personality);
                break;
            case 'ask_help':
                response = this.handleAskHelp(personality, context);
                break;
            case 'small_talk':
                response = this.handleSmallTalk(personality);
                break;
            case 'flirt':
                response = this.handleFlirt(personality, context);
                break;
            case 'business':
                response = this.handleBusiness(personality, context);
                break;
            default:
                response = this.handleGeneric(personality);
        }
        
        this.currentMood = response.mood;
        return response;
    }
    
    handleCompliment(personality) {
        const responses = {
            friendly: { text: "Aww, you're so sweet! That made my day!", mood: MOOD.HAPPY, effect: { relationship: 5 } },
            professional: { text: "Thank you. I appreciate the recognition.", mood: MOOD.HAPPY, effect: { relationship: 2 } },
            competitive: { text: "Obviously. But thanks for noticing.", mood: MOOD.HAPPY, effect: { relationship: 3 } },
            mysterious: { text: "*blushes slightly* The universe has been kind today.", mood: MOOD.HAPPY, effect: { relationship: 4 } },
            grumpy: { text: "...thanks, I guess. Don't make it weird.", mood: MOOD.HAPPY, effect: { relationship: 6 } },
            generous: { text: "Oh stop! You're the wonderful one!", mood: MOOD.EXCITED, effect: { relationship: 5 } }
        };
        return responses[personality.name] || responses.friendly;
    }
    
    handleInsult(personality) {
        const responses = {
            friendly: { text: "Oh... that was kind of mean. Did I do something wrong?", mood: MOOD.SAD, effect: { relationship: -5 } },
            professional: { text: "That was unprofessional. I think we're done here.", mood: MOOD.ANNOYED, effect: { relationship: -8 } },
            competitive: { text: "Wow, going for the low blows? That's pathetic.", mood: MOOD.ANGRY, effect: { relationship: -3 } },
            mysterious: { text: "Darkness begets darkness. Choose your words wisely.", mood: MOOD.SUSPICIOUS, effect: { relationship: -6 } },
            grumpy: { text: "Yeah? Well right back at you, pal!", mood: MOOD.ANGRY, effect: { relationship: -4 } },
            generous: { text: "Oh dear... are you having a bad day? Do you need to talk?", mood: MOOD.SAD, effect: { relationship: -2 } }
        };
        return responses[personality.name] || responses.friendly;
    }
    
    handleAskHelp(personality, context) {
        const responses = {
            friendly: { text: "Of course! I'd love to help! What do you need?", mood: MOOD.EXCITED, effect: { relationship: 2 } },
            professional: { text: "I may be able to assist. What's the situation?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            competitive: { text: "Help? You? ...fine, but you owe me one.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            mysterious: { text: "Help comes to those who seek it. What do you require?", mood: MOOD.NEUTRAL, effect: { relationship: 2 } },
            grumpy: { text: "*sighs* What now? Make it quick.", mood: MOOD.ANNOYED, effect: { relationship: 0 } },
            generous: { text: "Absolutely! I was hoping you'd ask! What can I do?", mood: MOOD.HAPPY, effect: { relationship: 3 } }
        };
        return responses[personality.name] || responses.friendly;
    }
    
    handleSmallTalk(personality) {
        const topics = ['weather', 'work', 'news', 'hobbies'];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        
        const responses = {
            friendly: { text: "So anyway, I was just thinking about how crazy things have been lately!", mood: MOOD.HAPPY, effect: { relationship: 1 } },
            professional: { text: "The market has been interesting lately. Have you been following the trends?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            competitive: { text: "Did you see what happened in the industry? I called it months ago.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            mysterious: { text: "The stars have been... restless lately.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            grumpy: { text: "Yeah, whatever. Things are things. Moving on.", mood: MOOD.ANNOYED, effect: { relationship: 0 } },
            generous: { text: "Oh I have so much to tell you! Let me get us some tea first.", mood: MOOD.HAPPY, effect: { relationship: 2 } }
        };
        return responses[personality.name] || responses.friendly;
    }
    
    handleFlirt(personality, context) {
        const isRomanceable = context.isRomanceable;
        
        if (!isRomanceable) {
            return {
                text: "Oh um... that's flattering but I don't think of you that way.",
                mood: MOOD.NEUTRAL,
                effect: { relationship: -2 }
            };
        }
        
        const responses = {
            friendly: { text: "*giggles* Stop it, you're making me blush!", mood: MOOD.FLIRTY, effect: { relationship: 5 } },
            professional: { text: "That's... very forward. Perhaps we should discuss this elsewhere.", mood: MOOD.NEUTRAL, effect: { relationship: 2 } },
            competitive: { text: "Trying to distract me? Interesting strategy...", mood: MOOD.FLIRTY, effect: { relationship: 3 } },
            mysterious: { text: "*smiles enigmatically* Fate has interesting plans for us.", mood: MOOD.FLIRTY, effect: { relationship: 4 } },
            grumpy: { text: "W-what?! Don't say stuff like that out of nowhere!", mood: MOOD.HAPPY, effect: { relationship: 6 } },
            generous: { text: "Oh my! How charming! You've made my heart flutter!", mood: MOOD.FLIRTY, effect: { relationship: 5 } }
        };
        return responses[personality.name] || responses.friendly;
    }
    
    handleBusiness(personality, context) {
        const responses = {
            friendly: { text: "Oh business stuff! Let me think... yeah I might know someone who can help!", mood: MOOD.HAPPY, effect: { relationship: 1 } },
            professional: { text: "Let's discuss terms. I have some opportunities that might interest you.", mood: MOOD.NEUTRAL, effect: { relationship: 2 } },
            competitive: { text: "A business proposition? This better be worth my time.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            mysterious: { text: "Business... yes. I sense profit in your future.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            grumpy: { text: "Fine, let's talk numbers. Just don't waste my time.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            generous: { text: "Of course! And don't worry about the details, I'll give you a good deal!", mood: MOOD.HAPPY, effect: { relationship: 2 } }
        };
        return responses[personality.name] || responses.friendly;
    }
    
    handleGeneric(personality) {
        return {
            text: "Hmm, interesting.",
            mood: MOOD.NEUTRAL,
            effect: { relationship: 0 }
        };
    }
}

// Export singleton
export const dialogueManager = new SimpleDialogueManager();

