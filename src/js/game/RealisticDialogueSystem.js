/**
 * RealisticDialogueSystem.js
 * Generates realistic, natural dialogue that feels authentic
 */

export class RealisticDialogueSystem {
    constructor() {
        this.dialoguePatterns = this.initializePatterns();
    }

    initializePatterns() {
        return {
            greeting: {
                casual: [
                    "Hey, what's up?",
                    "Oh hey! How's it going?",
                    "Hey there. How are you doing?",
                    "Oh, hi! I didn't expect to see you here."
                ],
                formal: [
                    "Hello, how can I help you?",
                    "Good to see you. What brings you here?",
                    "Hello there. How are things?",
                    "Hi. What can I do for you?"
                ],
                friendly: [
                    "Hey! So good to see you!",
                    "Oh my gosh, hi! How have you been?",
                    "Hey friend! What's going on?",
                    "Hi! I was just thinking about you."
                ]
            },
            concern: {
                low: [
                    "I'm a little worried about...",
                    "Something's been on my mind...",
                    "I don't want to be a bother, but...",
                    "Can I talk to you about something?"
                ],
                high: [
                    "I'm really concerned about this.",
                    "This is serious. We need to talk.",
                    "I'm worried sick about...",
                    "Something bad is happening and..."
                ]
            },
            anger: {
                mild: [
                    "I'm frustrated, okay?",
                    "This is annoying me.",
                    "I'm not happy about this.",
                    "Come on, really?"
                ],
                strong: [
                    "I'm really upset about this.",
                    "This is unacceptable.",
                    "I can't believe this is happening.",
                    "You know what? This isn't okay."
                ]
            },
            happiness: {
                mild: [
                    "That's great!",
                    "Oh nice, I'm happy for you.",
                    "That's awesome!",
                    "Cool, that sounds good."
                ],
                strong: [
                    "Oh my gosh, that's amazing!",
                    "I'm so happy for you!",
                    "That's incredible! Congratulations!",
                    "Wow, that's fantastic news!"
                ]
            },
            goodbye: {
                casual: [
                    "Alright, I'll see you later.",
                    "Okay, catch you later.",
                    "See ya!",
                    "Talk to you soon."
                ],
                formal: [
                    "Goodbye. Take care.",
                    "Have a good day.",
                    "Until next time.",
                    "Farewell."
                ],
                emotional: [
                    "I'll miss you.",
                    "Take care of yourself, okay?",
                    "I hope we can talk again soon.",
                    "Stay safe."
                ]
            }
        };
    }

    /**
     * Generate realistic dialogue based on context
     */
    generateDialogue(context) {
        const {
            speaker,
            emotion = 'neutral',
            relationship = 50,
            situation = 'casual',
            personality = 'friendly'
        } = context;

        let dialogue = "";

        // Base dialogue on emotion and relationship
        if (emotion === 'happy' && relationship > 60) {
            dialogue = this.getRandomPattern('happiness', 'strong');
        } else if (emotion === 'angry' && relationship < 30) {
            dialogue = this.getRandomPattern('anger', 'strong');
        } else if (emotion === 'worried') {
            dialogue = relationship > 50 
                ? this.getRandomPattern('concern', 'high')
                : this.getRandomPattern('concern', 'low');
        } else {
            // Default based on personality
            if (personality === 'friendly') {
                dialogue = this.getRandomPattern('greeting', 'friendly');
            } else if (personality === 'professional') {
                dialogue = this.getRandomPattern('greeting', 'formal');
            } else {
                dialogue = this.getRandomPattern('greeting', 'casual');
            }
        }

        // Add filler words and natural speech patterns
        dialogue = this.addNaturalSpeech(dialogue, personality);

        return dialogue;
    }

    /**
     * Add natural speech patterns
     */
    addNaturalSpeech(text, personality) {
        // Add "um", "like", "you know" based on personality
        if (personality === 'casual' && Math.random() > 0.7) {
            const fillers = ['um', 'like', 'you know', 'I mean'];
            const filler = fillers[Math.floor(Math.random() * fillers.length)];
            if (Math.random() > 0.5) {
                return `${text} ${filler}...`;
            } else {
                return `${filler}, ${text}`;
            }
        }

        // Add trailing off for uncertain emotions
        if (Math.random() > 0.8) {
            return `${text}...`;
        }

        return text;
    }

    /**
     * Get random pattern from category
     */
    getRandomPattern(category, intensity) {
        const patterns = this.dialoguePatterns[category]?.[intensity];
        if (!patterns || patterns.length === 0) {
            return "Hello.";
        }
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    /**
     * Generate relationship-specific dialogue
     */
    generateRelationshipDialogue(npc, relationship, situation) {
        const personality = npc.personality || 'friendly';
        const emotion = this.determineEmotion(relationship, situation);

        return this.generateDialogue({
            speaker: npc.name,
            emotion,
            relationship,
            situation,
            personality
        });
    }

    /**
     * Determine emotion based on relationship and situation
     */
    determineEmotion(relationship, situation) {
        if (relationship > 80) {
            return situation === 'crisis' ? 'worried' : 'happy';
        } else if (relationship < 30) {
            return situation === 'conflict' ? 'angry' : 'neutral';
        }
        return 'neutral';
    }

    /**
     * Generate breakup dialogue (for romantic relationships)
     */
    generateBreakupDialogue(relationship, reason) {
        if (reason === 'ethics') {
            if (relationship > 60) {
                return "I can't do this anymore. The person you're becoming... it's not who I fell in love with. I'm sorry.";
            } else {
                return "This isn't working. We want different things. I think it's best if we go our separate ways.";
            }
        } else if (reason === 'neglect') {
            return "You're never around. You're always working, always focused on your career. I need someone who's actually present.";
        } else if (reason === 'money') {
            return "I can't keep living like this. The stress, the uncertainty... I need stability. I'm leaving.";
        }
        
        return "I think we need to talk. This relationship isn't working for me anymore.";
    }

    /**
     * Generate emotional response to player actions
     */
    generateEmotionalResponse(action, npc, currentRelationship) {
        const responses = {
            'gift': {
                positive: "Oh wow, thank you! You didn't have to do that.",
                negative: "Oh... thanks, I guess. You really shouldn't have."
            },
            'betrayal': {
                high_relationship: "I can't believe you did that. I trusted you.",
                low_relationship: "I knew I couldn't trust you. This confirms it."
            },
            'help': {
                positive: "Thank you so much. I really needed that.",
                negative: "I appreciate it, but I can handle this myself."
            }
        };

        const category = responses[action];
        if (!category) return "I see.";

        if (currentRelationship > 60) {
            return category.positive || category.high_relationship || "Okay.";
        } else {
            return category.negative || category.low_relationship || "Fine.";
        }
    }
}







