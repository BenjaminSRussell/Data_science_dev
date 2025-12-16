/**
 * Alex Rivera Dialogue
 * Individual dialogue file for Alex Rivera
 * Age: 26, Former hacker, Redemption story
 */

export default {
    npcId: 'alex_rivera',
    age: 26,
    personality: 'friendly',
    
    stages: {
        stranger: {
            greeting: [
                "Hey.",
                "What's up?",
                "Hey there."
            ],
            topics: {
                work: [
                    "I'm a freelancer.",
                    "Security consultant.",
                    "Trying to make it work."
                ]
            }
        },
        
        friendly: {
            greeting: [
                "Hey! Good to see you.",
                "What's up?",
                "Hey there!"
            ],
            topics: {
                work: [
                    "Freelancing is tough.",
                    "But I'm making it work.",
                    "One project at a time."
                ],
                background: [
                    "I used to hack.",
                    "Got caught when I was 17.",
                    "But I got a second chance."
                ]
            }
        },
        
        acquaintance: {
            greeting: [
                "Hey! Always good to catch up.",
                "What's up? How's it going?",
                "Hey! Good to see you."
            ],
            topics: {
                background: [
                    "Instead of jail, a judge gave me community service.",
                    "At a tech company.",
                    "Changed my whole life."
                ],
                change: [
                    "People think you can't change.",
                    "But I did.",
                    "I use my skills for good now."
                ]
            }
        },
        
        friend: {
            greeting: [
                "My friend! Hey!",
                "What's up? Good to see you!",
                "Hey! Come here!"
            ],
            topics: {
                secret: [
                    "I still hack.",
                    "Legally, of course.",
                    "Bug bounties, security audits.",
                    "The thrill never left."
                ],
                fear: [
                    "I'm always afraid people will see me as a criminal.",
                    "That my past will follow me.",
                    "But I can't let that stop me."
                ]
            }
        },
        
        close_friend: {
            greeting: [
                "Bro! My friend!",
                "Hey! I needed to talk to you.",
                "What's up? Come here!"
            ],
            topics: {
                dream: [
                    "I want to start a program.",
                    "Teach at-risk youth to code.",
                    "To hack ethically.",
                    "Give them the second chance I got."
                ],
                philosophy: [
                    "Your past doesn't define you.",
                    "But it shapes you.",
                    "Use what you've learned to help others.",
                    "That's how you truly change."
                ]
            }
        }
    },
    
    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'hurt',
            dialogue: [
                "I thought we were cool.",
                "Guess not.",
                "..."
            ],
            quickTime: 'comfort'
        },
        past_judgment: {
            trigger: { judgment: true },
            emotion: 'anger',
            dialogue: [
                "You're judging me for my past?!",
                "I thought you understood!",
                "I'm not that person anymore!"
            ],
            quickTime: 'defuse'
        },
        betrayal: {
            trigger: { betrayal: true },
            emotion: 'fighting',
            dialogue: [
                "I trusted you.",
                "We're done.",
                "Don't talk to me."
            ],
            quickTime: 'apologize'
        }
    },
    
    emotionalTriggers: [
        {
            condition: { mentionPast: true, judgment: true },
            emotion: 'defensive',
            dialogue: "That's not who I am anymore.",
            subtext: 'His voice is tense'
        },
        {
            condition: { playerSupports: true, relationship: '>40' },
            emotion: 'gratitude',
            dialogue: "Thanks for believing in me.",
            subtext: 'Genuine relief in his voice'
        }
    ],
    
    actions: {
        gift_coffee: "Thanks, man. I needed this.",
        gift_snacks: "Appreciate it!",
        compliment: "Thanks. That means a lot.",
        ask_help: "Yeah, I got you.",
        rejection: "Okay. I get it.",
        betrayal: "I can't believe you'd do that to me."
    }
};

