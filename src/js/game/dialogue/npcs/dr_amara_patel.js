/**
 * Dr. Amara Patel (The Deep Learning Expert) dialogue
 * Generated from story_line/dr_amara_patel.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "dr_amara_patel",
    "personality": "professional",
    "stages": {
        "stranger": {
            "greeting": [
                "Hello.",
                "Are you here for the lecture?",
                "Yes?"
            ],
            "topics": {},
            "topicHints": "Machine Learning trends, Neural Networks."
        },
        "friendly": {
            "greeting": [
                "Good to see you.",
                "Hello, colleague.",
                "Ah, you again."
            ],
            "topics": {
                "background": [
                    "I've spent my life in labs. Some call it lonely. I call it focused. The data speaks if you listen."
                ]
            },
            "topicHints": "Recent papers, academic conferences."
        },
        "acquaintance": {
            "greeting": [
                "Hello! I have a new paper to show you.",
                "Excellent timing."
            ],
            "topics": {
                "background": [
                    "I've spent my life in labs. Some call it lonely. I call it focused. The data speaks if you listen."
                ],
                "research": [
                    "Neural networks aren't just code. They're a reflection of how we think. Or how we *should* think."
                ],
                "secret_fear": [
                    "Sometimes... I wonder if we're building something we can't control. It keeps me up at night."
                ]
            },
            "topicHints": "The responsibility of AI researchers, mentoring duties."
        },
        "friend": {
            "greeting": [
                "My friend! Join me.",
                "I was just running a simulation."
            ],
            "topics": {
                "background": [
                    "I've spent my life in labs. Some call it lonely. I call it focused. The data speaks if you listen."
                ],
                "research": [
                    "Neural networks aren't just code. They're a reflection of how we think. Or how we *should* think."
                ],
                "secret_fear": [
                    "Sometimes... I wonder if we're building something we can't control. It keeps me up at night."
                ],
                "dream": [
                    "Imagine an AI that doesn't just calculate, but *understands*. That solves climate change, disease. That's what I'm building."
                ]
            },
            "topicHints": "The beauty of complex systems, \"intellectual family.\""
        },
        "close_friend": {
            "greeting": [
                "Amara, at your service.",
                "It is always a pleasure."
            ],
            "topics": {
                "background": [
                    "I've spent my life in labs. Some call it lonely. I call it focused. The data speaks if you listen."
                ],
                "research": [
                    "Neural networks aren't just code. They're a reflection of how we think. Or how we *should* think."
                ],
                "secret_fear": [
                    "Sometimes... I wonder if we're building something we can't control. It keeps me up at night."
                ],
                "dream": [
                    "Imagine an AI that doesn't just calculate, but *understands*. That solves climate change, disease. That's what I'm building."
                ],
                "philosophy": [
                    "We are the architects of the future. Every line of code is a brick in the foundation of tomorrow."
                ]
            },
            "topicHints": "The risks of AI (\"Pandora's Box\"), hope for the future."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_research_papers": "Fascinating. Thank you.",
        "gift_coffee": "Fuel for the mind. Thanks.",
        "compliment": "I prefer peer review to flattery, but thank you."
    }
};
