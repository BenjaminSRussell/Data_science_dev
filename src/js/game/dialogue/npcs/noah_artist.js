/**
 * Noah Williams (The Visual Artist) dialogue
 * Generated from story_line/noah_artist.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "noah_artist",
    "personality": "friendly",
    "stages": {
        "stranger": {
            "greeting": [
                "Hello.",
                "Like the art?",
                "Noah."
            ],
            "topics": {},
            "topicHints": "Aesthetics, composition."
        },
        "friendly": {
            "greeting": [
                "Hey! Inspired?",
                "Noah here.",
                "Nice colors."
            ],
            "topics": {
                "background": [
                    "I see the world in shapes and flows. Data isn't just numbers. It's a landscape."
                ]
            },
            "topicHints": "Creative blocks, museums."
        },
        "acquaintance": {
            "greeting": [
                "Hey! Look at this.",
                "I made this.",
                "Beautiful day."
            ],
            "topics": {
                "background": [
                    "I see the world in shapes and flows. Data isn't just numbers. It's a landscape."
                ],
                "philosophy": [
                    "Art isn't about what you see. It's about what you make others see."
                ],
                "secret": [
                    "Colors... they're tricky for me. I memorize the codes. #FF0000 is red. I know it, even if I don't see it."
                ]
            },
            "topicHints": "The colorblind secret (hint)."
        },
        "friend": {
            "greeting": [
                "Muse!",
                "Hey! Portrait time?"
            ],
            "topics": {
                "background": [
                    "I see the world in shapes and flows. Data isn't just numbers. It's a landscape."
                ],
                "philosophy": [
                    "Art isn't about what you see. It's about what you make others see."
                ],
                "secret": [
                    "Colors... they're tricky for me. I memorize the codes. #FF0000 is red. I know it, even if I don't see it."
                ],
                "goal": [
                    "The moon. A blank canvas. Imagine the contrast. That's the ultimate installation."
                ]
            },
            "topicHints": "The Moon Mural."
        },
        "close_friend": {
            "greeting": [
                "My love.",
                "Hey! Let's create."
            ],
            "topics": {
                "background": [
                    "I see the world in shapes and flows. Data isn't just numbers. It's a landscape."
                ],
                "philosophy": [
                    "Art isn't about what you see. It's about what you make others see."
                ],
                "secret": [
                    "Colors... they're tricky for me. I memorize the codes. #FF0000 is red. I know it, even if I don't see it."
                ],
                "goal": [
                    "The moon. A blank canvas. Imagine the contrast. That's the ultimate installation."
                ],
                "romance": [
                    "You are my favorite subject. The one variable I can't predict."
                ]
            },
            "topicHints": "Emotional connection."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_art_supplies": "Perfect. I needed these.",
        "gift_coffee": "Warmth. Thanks.",
        "compliment": "You have a beautiful soul."
    }
};
