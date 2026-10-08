/**
 * Chloe Martinez (The Rival Analyst) dialogue
 * Generated from story_line/chloe_martinez.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "chloe_competitor",
    "personality": "competitive",
    "stages": {
        "stranger": {
            "greeting": [
                "Oh. You.",
                "Still in business?",
                "Chloe."
            ],
            "topics": {},
            "topicHints": "Market share, your mistakes."
        },
        "friendly": {
            "greeting": [
                "Up for a challenge?",
                "Hello, rival.",
                "Nice suit."
            ],
            "topics": {
                "background": [
                    "I graduated Summa Cum Laude. You? Just checking the competition."
                ]
            },
            "topicHints": "\"Healthy\" competition, industry gossip."
        },
        "acquaintance": {
            "greeting": [
                "I saw your numbers.",
                "Trying to keep up?",
                "Hello."
            ],
            "topics": {
                "background": [
                    "I graduated Summa Cum Laude. You? Just checking the competition."
                ],
                "philosophy": [
                    "Clients don't want 'good'. They want the best. That's me."
                ],
                "secret_respect": [
                    "I saw your latest report. Not terrible. I would have used a different model, but... decent."
                ]
            },
            "topicHints": "Her academic records, standards."
        },
        "friend": {
            "greeting": [
                "You're decent opposition.",
                "Hey! Good fight.",
                "Let's compare notes."
            ],
            "topics": {
                "background": [
                    "I graduated Summa Cum Laude. You? Just checking the competition."
                ],
                "philosophy": [
                    "Clients don't want 'good'. They want the best. That's me."
                ],
                "secret_respect": [
                    "I saw your latest report. Not terrible. I would have used a different model, but... decent."
                ],
                "drive": [
                    "I don't sleep. I optimize. That's why I'll always be one step ahead."
                ]
            },
            "topicHints": "Admitting you're a worthy adversary."
        },
        "close_friend": {
            "greeting": [
                "Only the best.",
                "Hey! Watch your back (kidding)."
            ],
            "topics": {
                "background": [
                    "I graduated Summa Cum Laude. You? Just checking the competition."
                ],
                "philosophy": [
                    "Clients don't want 'good'. They want the best. That's me."
                ],
                "secret_respect": [
                    "I saw your latest report. Not terrible. I would have used a different model, but... decent."
                ],
                "drive": [
                    "I don't sleep. I optimize. That's why I'll always be one step ahead."
                ],
                "goal": [
                    "CEO. That's the title I want. And I'm not asking for permission."
                ]
            },
            "topicHints": "The shared drive for excellence."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_gifts": "Startled? I don't need charity.",
        "gift_challenge": "You're on.",
        "compliment": "I know."
    }
};
