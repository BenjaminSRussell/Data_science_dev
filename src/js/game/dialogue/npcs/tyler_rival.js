/**
 * Tyler Brooks (The Budget Rival) dialogue
 * Generated from story_line/tyler_brooks.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "tyler_rival",
    "personality": "scrappy",
    "stages": {
        "stranger": {
            "greeting": [
                "Yo.",
                "My rates are lower.",
                "Hey."
            ],
            "topics": {},
            "topicHints": "Upwork, Fiverr, the grind."
        },
        "friendly": {
            "greeting": [
                "Hustling?",
                "Tyler here.",
                "Got a gig for me?"
            ],
            "topics": {
                "background": [
                    "Why charge 500 when you can charge 50 and do ten times the volume? It's math, bro."
                ]
            },
            "topicHints": "Cutting corners, templates."
        },
        "acquaintance": {
            "greeting": [
                "Hey! Broke yet?",
                "I just closed 5 deals.",
                "Fast cash."
            ],
            "topics": {
                "background": [
                    "Why charge 500 when you can charge 50 and do ten times the volume? It's math, bro."
                ],
                "philosophy": [
                    "Clients don't read the code. They just want it to run. Usually."
                ],
                "secret": [
                    "I got a guy. A guy who knows a guy. We get it done."
                ]
            },
            "topicHints": "The Bali dream."
        },
        "friend": {
            "greeting": [
                "My dude!",
                "Hey! Teach me that trick?",
                "Let's outsource."
            ],
            "topics": {
                "background": [
                    "Why charge 500 when you can charge 50 and do ten times the volume? It's math, bro."
                ],
                "philosophy": [
                    "Clients don't read the code. They just want it to run. Usually."
                ],
                "secret": [
                    "I got a guy. A guy who knows a guy. We get it done."
                ],
                "goal": [
                    "Bali. Laptop on the beach. Piña Colada. That's the life."
                ]
            },
            "topicHints": "Avoiding lawsuits."
        },
        "close_friend": {
            "greeting": [
                "Partners?",
                "Hey! We could scale this."
            ],
            "topics": {
                "background": [
                    "Why charge 500 when you can charge 50 and do ten times the volume? It's math, bro."
                ],
                "philosophy": [
                    "Clients don't read the code. They just want it to run. Usually."
                ],
                "secret": [
                    "I got a guy. A guy who knows a guy. We get it done."
                ],
                "goal": [
                    "Bali. Laptop on the beach. Piña Colada. That's the life."
                ],
                "risk": [
                    "Liability? That's what LLCs are for, right? ...Right?"
                ]
            },
            "topicHints": "Passive income schemes."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_gifts": "Free stuff? I'll take it.",
        "gift_advice": "Yeah, whatever.",
        "compliment": "Thanks, bro."
    }
};
