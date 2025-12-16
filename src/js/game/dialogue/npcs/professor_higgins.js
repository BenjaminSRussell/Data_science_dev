/**
 * Professor Higgins Dialogue
 * Individual dialogue file for Professor Higgins
 * Age-appropriate, relationship-stage based
 * Minimal dialogue - story tells itself
 */

export default {
    npcId: 'professor_higgins',
    age: 58,
    personality: 'generous',
    
    stages: {
        stranger: {
            greeting: [
                "Hello. Can I help you?",
                "Good day. What brings you here?",
                "Hello there."
            ],
            topics: {
                work: [
                    "I teach at the university.",
                    "Data science, mostly.",
                    "Academic work."
                ],
                weather: [
                    "It's a nice day.",
                    "Weather's been good lately.",
                    "Yes, quite pleasant."
                ]
            },
            ageGroups: {
                young: {
                    greeting: [
                        "Hello, young person.",
                        "Good to see students here.",
                        "Hello."
                    ]
                },
                adult: {
                    greeting: [
                        "Hello.",
                        "Good day.",
                        "Hello there."
                    ]
                }
            }
        },
        
        friendly: {
            greeting: [
                "Ah, hello again.",
                "Good to see you.",
                "Hello, how are you?"
            ],
            topics: {
                work: [
                    "Teaching keeps me busy.",
                    "The students are bright this semester.",
                    "Research is progressing well."
                ],
                background: [
                    "I grew up in a small town.",
                    "Education was important in my family.",
                    "I've been teaching for decades now."
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
                work: [
                    "I love what I do. Every day is different.",
                    "Teaching data science is rewarding.",
                    "The field is evolving so quickly."
                ],
                background: [
                    "I didn't have it easy growing up.",
                    "First in my family to attend college.",
                    "Worked three jobs to pay for school."
                ],
                father: [
                    "My father... he passed when I was young.",
                    "Cancer. That's part of why I do this.",
                    "I want to help find answers."
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
                work: [
                    "I've been working on something special.",
                    "A cancer detection algorithm.",
                    "Named it after my father."
                ],
                dream: [
                    "I want to start a scholarship fund.",
                    "For first-generation students.",
                    "Education shouldn't be a privilege."
                ],
                philosophy: [
                    "Data science isn't about numbers.",
                    "It's about the people behind them.",
                    "Every dataset tells a human story."
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
                    "I've been working on this algorithm...",
                    "I'm afraid it won't be good enough.",
                    "But I have to try."
                ],
                fear: [
                    "Sometimes I wonder if I'm making a difference.",
                    "But then a student succeeds...",
                    "And I know it's worth it."
                ],
                philosophy: [
                    "After all these years, I've learned...",
                    "Data science is about people.",
                    "Every number has a story."
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
    
    // Minimal dialogue - let actions speak
    actions: {
        gift_books: "Thank you. I appreciate this.",
        gift_coffee: "Ah, coffee. My fuel.",
        compliment: "You're too kind.",
        ask_help: "Of course. What do you need?",
        rejection: "...I see.",
        betrayal: "I can't believe you'd do that."
    }
};

