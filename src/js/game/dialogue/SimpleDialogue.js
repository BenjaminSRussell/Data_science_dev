class SimpleDialogueManager {
    constructor() {
        this.currentMood = MOOD.NEUTRAL;
    }
    
    generateResponse(personality, context) {
        let response;
        switch (context.type) {
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
            friendly: {
                weather: { text: "So anyway, I was just thinking about how crazy the weather has been lately!", mood: MOOD.HAPPY, effect: { relationship: 1 } },
                work: { text: "Have you been having a good week at work?", mood: MOOD.HAPPY, effect: { relationship: 1 } },
                news: { text: "Did you hear the latest news? Pretty interesting stuff!", mood: MOOD.HAPPY, effect: { relationship: 1 } },
                hobbies: { text: "Oh, what do you like to do in your free time?", mood: MOOD.HAPPY, effect: { relationship: 1 } }
            },
            professional: {
                weather: { text: "The weather's been quite unpredictable lately. What about you?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
                work: { text: "The market has been interesting lately. Have you been following the trends?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
                news: { text: "The news today was... varied. What have you been reading?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
                hobbies: { text: "I'm always interested in what others do for fun. What do you like?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } }
            },
            competitive: {
                weather: { text: "The weather's been tough lately. Have you had any interesting adventures?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
                work: { text: "Did you see what happened in the industry? I called it months ago.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
                news: { text: "The news today was... varied. What have you been reading?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
                hobbies: { text: "I'm always interested in what others do for fun. What do you like?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } }
            },
            mysterious: {
                weather: { text: "The stars have been... restless lately. What about you?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
                work: { text: "The market has been interesting lately. Have you been following the trends?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
                news: { text: "The news today was... varied. What have you been reading?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
                hobbies: { text: "I'm always interested in what others do for fun. What do you like?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } }
            },
            grumpy: {
                weather: { text: "Yeah, whatever. Things are things. Moving on.", mood: MOOD.ANNOYED, effect: { relationship: 0 } },
                work: { text: "Yeah, whatever. Things are things. Moving on.", mood: MOOD.ANNOYED, effect: { relationship: 0 } },
                news: { text: "Yeah, whatever. Things are things. Moving on.", mood: MOOD.ANNOYED, effect: { relationship: 0 } },
                hobbies: { text: "Yeah, whatever. Things are things. Moving on.", mood: MOOD.ANNOYED, effect: { relationship: 0 } }
            },
            generous: {
                weather: { text: "Oh I have so much to tell you! Let me get us some tea first.", mood: MOOD.HAPPY, effect: { relationship: 2 } },
                work: { text: "Oh I have so much to tell you! Let me get us some tea first.", mood: MOOD.HAPPY, effect: { relationship: 2 } },
                news: { text: "Oh I have so much to tell you! Let me get us some tea first.", mood: MOOD.HAPPY, effect: { relationship: 2 } },
                hobbies: { text: "Oh I have so much to tell you! Let me get us some tea first.", mood: MOOD.HAPPY, effect: { relationship: 2 } }
            }
        };
        
        const responseByTopic = responses[personality.name] || responses.friendly;
        return responseByTopic[topic] || responseByTopic.weather;
    }
    
    handleFlirt(personality, context) {
        const isRomanceable = context.isRomanceable;
        
        if (!isRomanceable) {
            return {
                text: "I'm sorry, but I don't feel comfortable with that.",
                mood: MOOD.NEUTRAL,
                effect: { relationship: -1 }
            };
        }
        
        const responses = {
            friendly: { text: "You're so sweet! I'd love to get to know you better.", mood: MOOD.EXCITED, effect: { relationship: 3 } },
            professional: { text: "It's nice to see you smile. Perhaps we can catch up sometime.", mood: MOOD.NEUTRAL, effect: { relationship: 2 } },
            competitive: { text: "You're quite the catch. I admire your confidence.", mood: MOOD.NEUTRAL, effect: { relationship: 2 } },
            mysterious: { text: "Your presence is intoxicating. I feel a connection with you.", mood: MOOD.HAPPY, effect: { relationship: 3 } },
            grumpy: { text: "I appreciate the compliment, but I'm not really in the mood for small talk.", mood: MOOD.NEUTRAL, effect: { relationship: 0 } },
            generous: { text: "You're so kind! I feel lucky to know you.", mood: MOOD.EXCITED, effect: { relationship: 3 } }
        };
        
        return responses[personality.name] || responses.friendly;
    }
    
    handleBusiness(personality, context) {
        const responses = {
            friendly: { text: "Of course, I'd be happy to help with that. What do you need?", mood: MOOD.EXCITED, effect: { relationship: 2 } },
            professional: { text: "I can certainly assist with that. What do you need help with?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            competitive: { text: "I can handle that. What do you need help with?", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            mysterious: { text: "Help comes to those who ask. What do you need assistance with?", mood: MOOD.NEUTRAL, effect: { relationship: 2 } },
            grumpy: { text: "I suppose I can help. What do you need?", mood: MOOD.ANNOYED, effect: { relationship: 0 } },
            generous: { text: "Absolutely, I'd be happy to help. What do you need assistance with?", mood: MOOD.EXCITED, effect: { relationship: 3 } }
        };
        
        return responses[personality.name] || responses.friendly;
    }
    
    handleGeneric(personality) {
        const responses = {
            friendly: { text: "That's interesting! What would you like to talk about?", mood: MOOD.HAPPY, effect: { relationship: 1 } },
            professional: { text: "That's an intriguing topic. Let's discuss it further.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            competitive: { text: "That's an interesting point. Let's explore it further.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            mysterious: { text: "That's an intriguing topic. Let's discuss it further.", mood: MOOD.NEUTRAL, effect: { relationship: 1 } },
            grumpy: { text: "Well, I suppose we could talk about that. What's on your mind?", mood: MOOD.ANNOYED, effect: { relationship: 0 } },
            generous: { text: "That's interesting! What would you like to talk about?", mood: MOOD.EXCITED, effect: { relationship: 2 } }
        };
        
        return responses[personality.name] || responses.friendly;
    }
}

// Constants for moods
const MOOD = {
    NEUTRAL: 'neutral',
    HAPPY: 'happy',
    ANNOYED: 'annoyed',
    EXCITED: 'excited',
    SUSPICIOUS: 'suspicious'
};

// Export the class for use in other modules
export default SimpleDialogueManager;