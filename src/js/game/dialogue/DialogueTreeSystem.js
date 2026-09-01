import { DialogueTree } from './DialogueTree.js';
import { DialogueNode } from './DialogueNode.js';

class DialogueTreeSystem {
    buildTreeForNPC(npc) {
        const personality = npc.personality || 'friendly';
        
        if (personality === 'friendly') {
            return this.buildFriendlyTree(npc);
        } else if (personality === 'professional') {
            return this.buildProfessionalTree(npc);
        } else if (personality === 'competitive') {
            return this.buildCompetitiveTree(npc);
        } else if (personality === 'mysterious') {
            return this.buildMysteriousTree(npc);
        } else if (personality === 'grumpy') {
            return this.buildGrumpyTree(npc);
        } else if (personality === 'generous') {
            return this.buildGenerousTree(npc);
        } else {
            return this.buildDefaultTree(npc);
        }
    }
    
    buildFriendlyTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "Hello! How are you doing?",
                choices: [
                    { id: 'small_talk', text: 'Small talk' },
                    { id: 'ask_about_day', text: 'Ask about day' },
                    { id: 'compliment', text: 'Give a compliment' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'small_talk',
                text: "Just doing great! What about you?",
                choices: [
                    { id: 'root', text: 'I am good too' },
                    { id: 'small_talk_more', text: 'Tell me more' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'ask_about_day',
                text: "My day has been good. How about yours?",
                choices: [
                    { id: 'root', text: 'My day was good too' },
                    { id: 'ask_about_day_more', text: 'Tell me more' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'compliment',
                text: "Aww, thank you! That's so sweet of you to say. I really appreciate that!",
                choices: [
                    { id: 'root', text: 'You deserve it' },
                    { id: 'compliment_elaborate', text: 'I really mean it' }
                ],
                effects: { relationship: 3 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "See you later! Take care!",
                effects: { relationship: 0.5 }
            })
        ];
        
        return new DialogueTree(npc.id, nodes);
    }
    
    buildProfessionalTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "Hello. How can I assist you today?",
                choices: [
                    { id: 'ask_about_work', text: 'Discuss work' },
                    { id: 'ask_for_advice', text: 'Seek advice' },
                    { id: 'network', text: 'Network' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'ask_about_work',
                text: "I've been working on several high-priority projects. The industry is evolving rapidly, and staying current is essential.",
                choices: [
                    { id: 'work_ask_details', text: 'What projects?' },
                    { id: 'work_industry', text: 'How is the industry changing?' },
                    { id: 'root', text: 'That sounds important' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "Goodbye. Best of luck with your endeavors.",
                effects: { relationship: 0 }
            })
        ];
        
        return new DialogueTree(npc.id, nodes);
    }
    
    buildCompetitiveTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "Hey. What do you want?",
                choices: [
                    { id: 'challenge', text: 'Challenge them' },
                    { id: 'compliment', text: 'Give a compliment' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'challenge',
                text: "Oh, you think you can compete? Bring it on. I'm always up for a challenge.",
                choices: [
                    { id: 'challenge_accept', text: 'Accept the challenge' },
                    { id: 'root', text: 'Maybe another time' }
                ],
                effects: { relationship: 2 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "See you around. Don't fall behind.",
                effects: { relationship: 0 }
            })
        ];
        
        return new DialogueTree(npc.id, nodes);
    }
    
    buildMysteriousTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "...Hello. What brings you here?",
                choices: [
                    { id: 'ask_about_secrets', text: 'Ask about secrets' },
                    { id: 'observe', text: 'Just observe' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'ask_about_secrets',
                text: "Secrets? Everyone has them. The question is: are you ready to know?",
                choices: [
                    { id: 'secrets_yes', text: 'Yes, I am ready' },
                    { id: 'root', text: 'Maybe not' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "...Until we meet again.",
                effects: { relationship: 0 }
            })
        ];
        
        return new DialogueTree(npc.id, nodes);
    }
    
    buildGrumpyTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "What do you want? I'm busy.",
                choices: [
                    { id: 'apologize', text: 'Apologize' },
                    { id: 'persist', text: 'Persist' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'apologize',
                text: "Fine. What is it? Make it quick.",
                choices: [
                    { id: 'root', text: 'Thank you' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "Finally. Goodbye.",
                effects: { relationship: 0 }
            })
        ];
        
        return new DialogueTree(npc.id, nodes);
    }
    
    buildGenerousTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "Welcome! How can I help you today? I am always happy to assist!",
                choices: [
                    { id: 'ask_for_help', text: 'Ask for help' },
                    { id: 'ask_about_gifts', text: 'Ask about gifts' },
                    { id: 'compliment', text: 'Give a compliment' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'ask_for_help',
                text: "Of course! I would love to help! What do you need? I have resources, connections, advice... anything you need!",
                choices: [
                    { id: 'help_resources', text: 'Resources' },
                    { id: 'help_connections', text: 'Connections' },
                    { id: 'help_advice', text: 'Advice' },
                    { id: 'root', text: 'Actually, I am fine' }
                ],
                effects: { relationship: 3 }
            }),
            new DialogueNode({
                id: 'ask_about_gifts',
                text: "Gifts? Oh, I love giving gifts! I have something special for you. Here, take this. I hope it helps you on your journey!",
                choices: [
                    { id: 'gifts_thank', text: 'Thank you so much!' },
                    { id: 'gifts_why', text: 'Why are you so generous?' },
                    { id: 'root', text: 'I cannot accept this' }
                ],
                effects: { relationship: 5, item: 'gift' }
            }),
            new DialogueNode({
                id: 'compliment',
                text: "Oh, you are too kind! But really, I just want to help people. That is what makes me happy!",
                choices: [
                    { id: 'root', text: 'You are amazing' },
                    { id: 'compliment_elaborate', text: 'I really appreciate you' }
                ],
                effects: { relationship: 4 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "Take care! And remember, if you ever need anything, just ask! I am always here to help!",
                effects: { relationship: 1 }
            })
        ];
        
        return new DialogueTree(npc.id, nodes);
    }
    
    buildDefaultTree(npc) {
        const nodes = [
            new DialogueNode({
                id: 'root',
                text: "Hello! What would you like to talk about?",
                choices: [
                    { id: 'general', text: 'General conversation' },
                    { id: 'specific', text: 'Specific topic' },
                    { id: 'goodbye', text: 'Goodbye' }
                ]
            }),
            new DialogueNode({
                id: 'general',
                text: "Sure, what would you like to discuss?",
                choices: [
                    { id: 'root', text: 'Back to main menu' },
                    { id: 'general_more', text: 'Tell me more' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'specific',
                text: "What specific topic would you like to discuss?",
                choices: [
                    { id: 'root', text: 'Back to main menu' },
                    { id: 'specific_more', text: 'Tell me more' }
                ],
                effects: { relationship: 1 }
            }),
            new DialogueNode({
                id: 'goodbye',
                text: "Goodbye! Have a great day!",
                effects: { relationship: 0 }
            })
        ];
        
        return new DialogueTree(npc.id, nodes);
    }
}

export { DialogueTreeSystem };