/**
 * Sam Taylor (The Freelance Designer) dialogue
 * Generated from story_line/sam_taylor.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "sam_taylor",
    "personality": "friendly",
    "stages": {
        "stranger": {
            "greeting": [
                "Hey.",
                "Cool shirt.",
                "Yo."
            ],
            "topics": {},
            "topicHints": "Color theory, fonts, freelance rates."
        },
        "friendly": {
            "greeting": [
                "Yo! Working hard?",
                "Hey Sam.",
                "What's the project?"
            ],
            "topics": {
                "background": [
                    "I went to art school. Everyone said I'd starve. Now I charge double because I know CSS."
                ]
            },
            "topicHints": "Client horror stories, design tools."
        },
        "acquaintance": {
            "greeting": [
                "Hey! Check this mock-up.",
                "Sam here.",
                "Good to see you."
            ],
            "topics": {
                "background": [
                    "I went to art school. Everyone said I'd starve. Now I charge double because I know CSS."
                ],
                "philosophy": [
                    "You can have the best model in the world, but if the chart is ugly, nobody listens."
                ],
                "secret": [
                    "Between us? I hate 'flat design'. Give me texture! Give me soul! But the client pays for flat."
                ]
            },
            "topicHints": "The hatred of minimalism, finding inspiration."
        },
        "friend": {
            "greeting": [
                "My dude!",
                "Hey! Coffee release?",
                "Look at these pixels."
            ],
            "topics": {
                "background": [
                    "I went to art school. Everyone said I'd starve. Now I charge double because I know CSS."
                ],
                "philosophy": [
                    "You can have the best model in the world, but if the chart is ugly, nobody listens."
                ],
                "secret": [
                    "Between us? I hate 'flat design'. Give me texture! Give me soul! But the client pays for flat."
                ],
                "fear": [
                    "These AI generators... they're getting good. Too good. I have to stay ahead."
                ]
            },
            "topicHints": "AI anxiety, the viral chart story."
        },
        "close_friend": {
            "greeting": [
                "You get it.",
                "Hey! Let's collab."
            ],
            "topics": {
                "background": [
                    "I went to art school. Everyone said I'd starve. Now I charge double because I know CSS."
                ],
                "philosophy": [
                    "You can have the best model in the world, but if the chart is ugly, nobody listens."
                ],
                "secret": [
                    "Between us? I hate 'flat design'. Give me texture! Give me soul! But the client pays for flat."
                ],
                "fear": [
                    "These AI generators... they're getting good. Too good. I have to stay ahead."
                ],
                "dream": [
                    "Data Art. That's the future. Not just charts, but emotion. Converting numbers into feelings."
                ]
            },
            "topicHints": "The Data Art dream, true creativity."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_art_supplies": "Dude, yes! Markers!",
        "gift_coffee": "Essential fuel. Thanks.",
        "compliment": "Thanks, I try."
    }
};
