/**
 * Vinnie "The Shark" (The Loan Consultant) dialogue
 * Generated from story_line/vinnie_shark.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "vinnie_shark",
    "personality": "aggressive",
    "stages": {
        "stranger": {
            "greeting": [
                "You lost?",
                "Need cash?",
                "Walk away."
            ],
            "topics": {},
            "topicHints": "Interest rates, kneecaps (implied)."
        },
        "friendly": {
            "greeting": [
                "Hey kid.",
                "Vinnie.",
                "Business is good."
            ],
            "topics": {
                "background": [
                    "I help people. People with... cash flow issues. Banks say no. Vinnie says yes."
                ]
            },
            "topicHints": "Reliable payers, loyalty."
        },
        "acquaintance": {
            "greeting": [
                "My favorite investment.",
                "Hey! Envelope ready?",
                "Good to see ya."
            ],
            "topics": {
                "background": [
                    "I help people. People with... cash flow issues. Banks say no. Vinnie says yes."
                ],
                "philosophy": [
                    "A contract is a promise. You break a promise, you break trust. I don't like broken trust."
                ],
                "secret": [
                    "My nonna... she makes the best cannoli. I send a box to the orphanage every Sunday. Don't tell no one."
                ]
            },
            "topicHints": "The legitimate dream, local gossip."
        },
        "friend": {
            "greeting": [
                "Come, eat.",
                "Hey! You're good people."
            ],
            "topics": {
                "background": [
                    "I help people. People with... cash flow issues. Banks say no. Vinnie says yes."
                ],
                "philosophy": [
                    "A contract is a promise. You break a promise, you break trust. I don't like broken trust."
                ],
                "secret": [
                    "My nonna... she makes the best cannoli. I send a box to the orphanage every Sunday. Don't tell no one."
                ],
                "goal": [
                    "One day, I wear a suit. A real suit. Board of Directors. No more back alleys."
                ]
            },
            "topicHints": "Nonna's recipes, protection."
        },
        "close_friend": {
            "greeting": [
                "Family.",
                "Hey! Anyone bothering you?"
            ],
            "topics": {
                "background": [
                    "I help people. People with... cash flow issues. Banks say no. Vinnie says yes."
                ],
                "philosophy": [
                    "A contract is a promise. You break a promise, you break trust. I don't like broken trust."
                ],
                "secret": [
                    "My nonna... she makes the best cannoli. I send a box to the orphanage every Sunday. Don't tell no one."
                ],
                "goal": [
                    "One day, I wear a suit. A real suit. Board of Directors. No more back alleys."
                ],
                "warning": [
                    "You're a good kid. Don't borrow what you can't earn. Keep it that way."
                ]
            },
            "topicHints": "True loyalty, the \"Family\" business."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_cash": "Back at ya.",
        "gift_fancy_cigar": "Now we're talking. Cuban?",
        "compliment": "Watch it."
    }
};
