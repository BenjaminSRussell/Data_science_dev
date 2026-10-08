/**
 * Rachel Green (The Product Visionary) dialogue
 * Generated from story_line/rachel_green.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "rachel_green",
    "personality": "friendly",
    "stages": {
        "stranger": {
            "greeting": [
                "Hi there.",
                "Do you have a minute?",
                "Hey."
            ],
            "topics": {},
            "topicHints": "Roadmaps, deadlines, user feedback."
        },
        "friendly": {
            "greeting": [
                "Hey! Good to see you.",
                "Hi! How's it going?",
                "Hey."
            ],
            "topics": {
                "background": [
                    "I used to be in marketing. But I got tired of spinning stories. I wanted to build the story."
                ]
            },
            "topicHints": "Recent user testing, \"feature creep\" (annoyance)."
        },
        "acquaintance": {
            "greeting": [
                "Hey! Always good to sync up.",
                "Hi! Catch up soon?",
                "What's new?"
            ],
            "topics": {
                "background": [
                    "I used to be in marketing. But I got tired of spinning stories. I wanted to build the story."
                ],
                "motivation": [
                    "It's not about the features. It's about the feeling. Does this make the user's life easier?"
                ],
                "secret_insecurity": [
                    "Sometimes... I sit in engineering meetings and feel like a fraud. But then I remember they don't know the user like I do."
                ]
            },
            "topicHints": "Balancing business needs vs user wants, startup chaos."
        },
        "friend": {
            "greeting": [
                "My favorite data person!",
                "Hey! Coffee?",
                "So glad you're here."
            ],
            "topics": {
                "background": [
                    "I used to be in marketing. But I got tired of spinning stories. I wanted to build the story."
                ],
                "motivation": [
                    "It's not about the features. It's about the feeling. Does this make the user's life easier?"
                ],
                "secret_insecurity": [
                    "Sometimes... I sit in engineering meetings and feel like a fraud. But then I remember they don't know the user like I do."
                ],
                "dream": [
                    "I want to walk down the street and see someone using my app. Just... naturally. That's the dream."
                ]
            },
            "topicHints": "Imposter syndrome, \"Relationship status: It's complicated.\""
        },
        "close_friend": {
            "greeting": [
                "Rachel here. What's the plan?",
                "Hey! Let's build something."
            ],
            "topics": {
                "background": [
                    "I used to be in marketing. But I got tired of spinning stories. I wanted to build the story."
                ],
                "motivation": [
                    "It's not about the features. It's about the feeling. Does this make the user's life easier?"
                ],
                "secret_insecurity": [
                    "Sometimes... I sit in engineering meetings and feel like a fraud. But then I remember they don't know the user like I do."
                ],
                "dream": [
                    "I want to walk down the street and see someone using my app. Just... naturally. That's the dream."
                ],
                "philosophy": [
                    "You can have all the data in the world. But if you don't have empathy, you're building in the dark."
                ]
            },
            "topicHints": "The joy of a successful launch, true product vision."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_coffee": "You're a lifesaver. Thanks.",
        "gift_notebooks": "Ooh, new stationery! Love it.",
        "compliment": "Thanks! I appreciate that."
    }
};
