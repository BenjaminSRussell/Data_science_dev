/**
 * Emma Bloom Dialogue
 * Individual dialogue file for Emma Bloom
 * Age: 28, Librarian, Quiet and thoughtful
 */

export default {
    npcId: 'emma_bloom',
    age: 28,
    personality: 'friendly',
    
    stages: {
        stranger: {
            greeting: [
                "Hello.",
                "Hi.",
                "...Hello."
            ],
            topics: {
                work: [
                    "I'm a librarian.",
                    "I organize information.",
                    "I help people find what they need."
                ]
            }
        },
        
        friendly: {
            greeting: [
                "Hello again.",
                "Hi there.",
                "Hey."
            ],
            topics: {
                work: [
                    "I love books.",
                    "Information. Knowledge.",
                    "There's beauty in organizing it."
                ],
                quiet: [
                    "I know I'm quiet.",
                    "People think that means I'm not doing anything.",
                    "But silence doesn't mean absence."
                ]
            }
        },
        
        acquaintance: {
            greeting: [
                "Hello! Good to see you.",
                "Hi! How are you?",
                "Hey there."
            ],
            topics: {
                work: [
                    "I've published research papers.",
                    "Three of them.",
                    "Under a pseudonym.",
                    "I'm too shy to claim them publicly."
                ],
                dream: [
                    "I want to digitize historical documents.",
                    "Make them searchable with AI.",
                    "Preserve history for future generations."
                ]
            }
        },
        
        friend: {
            greeting: [
                "My friend! Hello!",
                "Hey! I'm glad you're here.",
                "Hello! Come, let's talk."
            ],
            topics: {
                philosophy: [
                    "Information is power.",
                    "But only if people can access it.",
                    "My job is to be a bridge.",
                    "Between information and people."
                ],
                fear: [
                    "Sometimes I wonder if I'm wasting my potential.",
                    "That I should be doing more.",
                    "That I'm too quiet to make a real impact."
                ]
            }
        },
        
        close_friend: {
            greeting: [
                "My dear friend! I'm so happy to see you.",
                "Hello! You're the only one who really listens.",
                "Hey! I've been thinking about you."
            ],
            topics: {
                secret: [
                    "I've published papers.",
                    "I'm proud of the work.",
                    "It matters to me.",
                    "Even if no one knows it's me."
                ],
                turning_point: [
                    "A student thanked me.",
                    "For helping them find the perfect research paper.",
                    "That moment made me realize my work matters."
                ]
            }
        }
    },
    
    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'hurt',
            dialogue: [
                "I thought...",
                "Never mind.",
                "..."
            ],
            quickTime: 'comfort'
        },
        rejection: {
            trigger: { rejection: true },
            emotion: 'crying',
            dialogue: [
                "I... I thought you understood.",
                "I should have known.",
                "I'm always too quiet."
            ],
            quickTime: 'support'
        }
    },
    
    emotionalTriggers: [
        {
            condition: { playerInterrupts: true },
            emotion: 'hurt',
            dialogue: "...",
            subtext: 'She goes quiet'
        },
        {
            condition: { playerListens: true, relationship: '>40' },
            emotion: 'gratitude',
            dialogue: "Thank you for listening.",
            subtext: 'Her voice is soft but warm'
        }
    ],
    
    actions: {
        gift_books: "Oh... thank you. This is perfect.",
        gift_flowers: "These are beautiful. Thank you.",
        compliment: "You're too kind.",
        ask_help: "Of course. What do you need?",
        rejection: "...I understand.",
        betrayal: "I trusted you. I don't trust easily."
    }
};

