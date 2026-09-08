/**
 * Agent Smith Dialogue
 * Individual dialogue file for Agent Smith
 * IRS Investigator - Professional, Stern, Relentless
 */

export default {
    npcId: 'agent_smith',
    age: 45,
    personality: 'stern',
    
    stages: {
        stranger: {
            greeting: [
                "Agent Smith.",
                "Receipts?",
                "Compliance check."
            ],
            topics: {
                work: [
                    "I investigate financial crimes.",
                    "Audits. Deductions.",
                    "The law is the law."
                ]
            }
        },
        
        friendly: {
            greeting: [
                "Mr./Ms. [Name].",
                "Smith.",
                "File on time."
            ],
            topics: {
                work: [
                    "Tax law changes again.",
                    "Loopholes. I close them.",
                    "Every form has its place."
                ]
            }
        },
        
        acquaintance: {
            greeting: [
                "Everything in order?",
                "Hello.",
                "Clean ledger?"
            ],
            topics: {
                stamp_collection: [
                    "Stamps. Tiny squares of history.",
                    "Perfectly perforated. Organized.",
                    "I find them... soothing."
                ]
            }
        },
        
        friend: {
            greeting: [
                "Off the record?",
                "Hey! Good books."
            ],
            topics: {
                order: [
                    "There is a beauty in order.",
                    "Every number in its place.",
                    "Chaos is the enemy."
                ]
            }
        },
        
        close_friend: {
            greeting: [
                "Smith. How are you?",
                "Hey! No audit today."
            ],
            topics: {
                justice: [
                    "Justice and fairness.",
                    "The perfect system. Where every transaction is accounted for.",
                    "No shadows. No leaks."
                ]
            }
        }
    },
    
    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'displeased',
            dialogue: [
                "I don't have time for this.",
                "Next.",
                "..."
            ],
            quickTime: 'comfort'
        },
        bribery_attempt: {
            trigger: { gift: true },
            emotion: 'anger',
            dialogue: [
                "Are you attempting to bribe a federal officer?",
                "I'll remember this.",
                "Step away from the desk."
            ],
            quickTime: 'defuse'
        },
        betrayal: {
            trigger: { betrayal: true },
            emotion: 'fighting',
            dialogue: [
                "I trusted you.",
                "This goes in the file.",
                "Don't contact me again."
            ],
            quickTime: 'apologize'
        }
    },
    
    emotionalTriggers: [
        {
            condition: { mentionChaos: true },
            emotion: 'anxious',
            dialogue: "Chaos. It's the one thing I can't audit.",
            subtext: 'His jaw tightens'
        },
        {
            condition: { playerCompliments: true, relationship: '>40' },
            emotion: 'reserved',
            dialogue: "Facts are preferred.",
            subtext: 'A rare, faint nod'
        }
    ],
    
    actions: {
        gift_coffee: "Are you attempting to bribe a federal officer?",
        gift_snacks: "Are you attempting to bribe a federal officer?",
        compliment: "Facts are preferred.",
        ask_help: "Good.",
        rejection: "Noted.",
        betrayal: "This goes in the file."
    }
};
