import { PERSONALITY, MOOD } from '../data/Constants';

class SimpleDialogueManager {
    constructor() {
        this.currentMood = MOOD.NEUTRAL;
    }

    startConversation(npc) {
        // Initialize conversation state
        this.personality = this.getPersonality(npc);
        this.currentMood = MOOD.NEUTRAL; // Reset mood at the start of a conversation
    }

    getPersonality(npc) {
        const personality = npc.personality ? npc.personality.toUpperCase() : 'FRIENDLY';
        switch (personality) {
            case PERSONALITY.FRIENDLY:
            case PERSONALITY.PROFESSIONAL:
            case PERSONALITY.COMPETITIVE:
            case PERSONALITY.MYSTERIOUS:
            case PERSONALITY.GRUMPY:
            case PERSONALITY.GENEROUS:
                return personality;
            default:
                return PERSONALITY.FRIENDLY;
        }
    }

    getGreeting(npc, relationshipLevel) {
        const greetingTemplates = {
            [PERSONALITY.FRIENDLY]: [
                "Hi there! How's it going?",
                "Nice to see you again!",
                "Hey! What's up?"
            ],
            [PERSONALITY.PROFESSIONAL]: [
                "Good day. How can I assist you?",
                "Hello. It's a pleasure to speak with you.",
                "Hi, how can I help you today?"
            ],
            [PERSONALITY.COMPETITIVE]: [
                "Hello, rival. Let's make this interesting.",
                "Hi, let's see what we can achieve together.",
                "Hey, how's the competition?"
            ],
            [PERSONALITY.MYSTERIOUS]: [
                "*grins enigmatically* What brings you here?",
                "*sighs* You've caught my interest.",
                "*looks around* So... what do you want?"
            ],
            [PERSONALITY.GRUMPY]: [
                "*sighs* What is it?",
                "*muttering* Finally, some company.",
                "*grumbles* What brings you here?"
            ],
            [PERSONALITY.GENEROUS]: [
                "Hello! I hope you're having a wonderful day!",
                "Hi! I'm here to help with whatever you need.",
                "Hey! What can I do for you?"
            ]
        };

        const templates = greetingTemplates[this.getPersonality(npc)] || greetingTemplates[PERSONALITY.FRIENDLY];
        const greeting = templates[Math.floor(Math.random() * templates.length)];

        const relationshipTier = (relationshipLevel < 10) ? 'stranger' :
                                 (relationshipLevel < 30) ? 'acquaintance' :
                                 (relationshipLevel < 70) ? 'friend' : 'close';

        return { text: greeting, tier: relationshipTier };
    }

    respond(choiceType, context) {
        if (!this.personality) return null; // Return null if conversation hasn't started

        switch (choiceType) {
            case 'compliment':
                return this.handleCompliment(this.getPersonality(context.npc));
            case 'insult':
                return this.handleInsult(this.getPersonality(context.npc));
            case 'ask_help':
                return this.handleAskHelp(this.getPersonality(context.npc), context);
            case 'small_talk':
                return this.handleSmallTalk(this.getPersonality(context.npc));
            case 'flirt':
                return this.handleFlirt(this.getPersonality(context.npc), context);
            case 'business':
                return this.handleBusiness(this.getPersonality(context.npc), context);
            default:
                return this.handleGeneric(this.getPersonality(context.npc));
        }
    }

    handleCompliment(personality) {
        const responses = {
            friendly: { text: "You sweet! That made my day!", mood: MOOD.HAPPY, effect: { relationship: 5 } },
            professional: { text: "Thank you. I appreciate the recognition.", mood: MOOD.HAPPY, effect: { relationship: 2 } },
            competitive: { text: "Obviously. But thanks for noticing.", mood: MOOD.HAPPY, effect: { relationship: 3 } },
            mysterious: { text: "*blushes slightly* The universe has been kind today.", mood: MOOD.HAPPY, effect: { relationship: 4 } },
            grumpy: { text: "...thanks, I guess. Don't make it weird.", mood: MOOD.HAPPY, effect: { relationship: 6 } },
            generous: { text: "Oh stop! You're the wonderful one!", mood: MOOD.EXCITED, effect: { relationship: 5 } }
        };
        return responses[personality] || responses.friendly;
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
        return responses[personality] || responses.friendly;
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
        return responses[personality] || responses.friendly;
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
        return responses[personality] || responses.friendly;
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
            grumpy: { text: "*sighs* What now? Make it quick.", mood: MOOD.ANNOYED, effect: { relationship: 0 } },
            generous: { text: "Absolutely! I was hoping you'd ask! What can I do?", mood: MOOD.HAPPY, effect: { relationship: 3 } }
        };
        return responses[personality] || responses.friendly;
    }
    
    handleBusiness(personality, context) {
        const responses = {
            friendly: { text: "I'm here to help. What do you need?", mood: MOOD.EXCITED, effect: { relationship: 2 } },
            professional: { text: "Let's discuss your business needs.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            competitive: { text: "Business is business. Let's get to it.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            mysterious: { text: "What brings you here? Let's see what we can do.", mood: MOOD.NEUTRAL, effect: { relationship: 2 } },
            grumpy: { text: "Fine, what do you want?", mood: MOOD.ANNOYED, effect: { relationship: 0 } },
            generous: { text: "I'm here to assist. What can I do for you?", mood: MOOD.HAPPY, effect: { relationship: 3 } }
        };
        return responses[personality] || responses.friendly;
    }

    handleGeneric(personality) {
        const responses = {
            friendly: { text: "I'm not sure what you mean. Let's try again.", mood: MOOD.NEUTRAL, effect: { relationship: 0 } },
            professional: { text: "I'm sorry, I didn't understand that. Please clarify.", mood: MOOD.NEUTRAL, effect: { relationship: 0 } },
            competitive: { text: "What do you mean? Let's make this interesting.", mood: MOOD.NEUTRAL, effect: { relationship: 0 } },
            mysterious: { text: "*grins* I don't understand. What brings you here?", mood: MOOD.NEUTRAL, effect: { relationship: 0 } },
            grumpy: { text: "I'm not sure what you want. Let's move on.", mood: MOOD.NEUTRAL, effect: { relationship: 0 } },
            generous: { text: "I'm here to help. What can I do for you?", mood: MOOD.NEUTRAL, effect: { relationship: 0 } }
        };
        return responses[personality] || responses.friendly;
    }
}

export default new SimpleDialogueManager();