/**
 * Vinnie Shark Dialogue
 * Individual dialogue file for Vinnie Shark
 * Relationship-stage based, with specific story reveals
 */

export default {
    npcId: 'vinnie_shark',
    age: 45,
    personality: 'mysterious',
    
    stages: {
        stranger: {
            greeting: [
                "Well, well, well. What brings you here?",
                "Business or pleasure?",
                "Good to see you."
            ],
            topics: {
                business: [
                    "I deal in a few things.",
                    "Never mind the details.",
                    "Let's just say it's... unique."
                ],
                weather: [
                    "The ocean is my home.",
                    "Waves are my constant companion.",
                    "Yes, quite refreshing."
                ]
            }
        },
        
        friendly: {
            greeting: [
                "Ah, hello again. What brings you here?",
                "Good to see you. How's it going?",
                "Hello, how are you?"
            ],
            topics: {
                business: [
                    "I'm always looking for new opportunities.",
                    "Sometimes it's a bit... shady.",
                    "But that's the game."
                ],
                background: [
                    "I grew up in a rough neighborhood.",
                    "Life taught me to be tough.",
                    "I'm used to the worst."
                ]
            }
        },
        
        acquaintance: {
            greeting: [
                "Hello! Good to see you.",
                "Hey there! How's it going?",
                "Hello, friend."
            ],
            topics: {
                business: [
                    "I have my fingers in many pies.",
                    "Sometimes it's about survival.",
                    "But I always come out on top."
                ],
                background: [
                    "I've been through a lot.",
                    "But I never gave up.",
                    "That's what makes me who I am."
                ],
                dream: [
                    "I want to leave a legacy.",
                    "Something that truly helps others.",
                    "Maybe a foundation."
                ]
            }
        },
        
        friend: {
            greeting: [
                "My friend! Good to see you.",
                "Hey! Always a pleasure.",
                "Hello! How have you been?"
            ],
            topics: {
                business: [
                    "I'm always thinking of new ventures.",
                    "Sometimes it's about taking risks.",
                    "But that's what makes life exciting."
                ],
                dream: [
                    "I want to start a foundation.",
                    "For those who need help.",
                    "Something that truly matters."
                ],
                philosophy: [
                    "Life is about the journey.",
                    "Not just the destination.",
                    "Every step counts."
                ]
            }
        },
        
        close_friend: {
            greeting: [
                "My dear friend! So good to see you.",
                "Hello! I was just thinking about you.",
                "Hey! Come, let's talk."
            ],
            topics: {
                secret: [
                    "I've been anonymously funding a bakery...",
                    "And an orphanage.",
                    "It's my way of giving back."
                ],
                fear: [
                    "Sometimes I wonder if I'm making a difference.",
                    "But then I see the smiles...",
                    "And I know it's worth it."
                ],
                philosophy: [
                    "After all these years, I've learned...",
                    "Helping others is the true reward.",
                    "Every little bit counts."
                ]
            }
        }
    },
    
    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'hurt',
            dialogue: [
                "I thought we had a connection.",
                "Perhaps I was wrong.",
                "..."
            ],
            quickTime: 'comfort'
        },
        relationship_drop: {
            trigger: { relationshipDrop: '>10' },
            emotion: 'crying',
            dialogue: [
                "I... I don't understand.",
                "What did I do wrong?",
                "I thought we were friends."
            ],
            quickTime: 'support'
        }
    },
    
    emotionalTriggers: [
        {
            condition: { playerSuccess: true, npcFailure: true },
            emotion: 'jealousy',
            dialogue: "You're doing so well... I'm happy for you.",
            subtext: 'They seem conflicted'
        },
        {
            condition: { betrayal: true },
            emotion: 'anger',
            dialogue: "I trusted you.",
            subtext: 'Their voice is strained'
        }
    ],
    
    actions: {
        gift_cash: "Thank you. I appreciate the gesture.",
        gift_fancy_cigar: "Ah, a fine cigar. That's the life.",
        compliment: "You're too kind.",
        ask_help: "Of course. What do you need?",
        rejection: "...I see.",
        betrayal: "I can't believe you'd do that."
    }
};