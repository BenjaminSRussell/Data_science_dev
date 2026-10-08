/**
 * Maya Chen (The Software Engineer) dialogue
 * Generated from story_line/maya_engineer.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "maya_engineer",
    "personality": "friendly",
    "stages": {
        "stranger": {
            "greeting": [
                "Hello world.",
                "Maya.",
                "Coding?"
            ],
            "topics": {},
            "topicHints": "Algorithms, languages."
        },
        "friendly": {
            "greeting": [
                "Hey! Nice commit.",
                "Maya here.",
                "Review this?"
            ],
            "topics": {
                "background": [
                    "I code in my sleep. Literally. I dreamt of a sorting algorithm last night."
                ]
            },
            "topicHints": "API design, caffeine."
        },
        "acquaintance": {
            "greeting": [
                "Hey! Debugging?",
                "I found a bug.",
                "What's the stack?"
            ],
            "topics": {
                "background": [
                    "I code in my sleep. Literally. I dreamt of a sorting algorithm last night."
                ],
                "philosophy": [
                    "There's an elegance to clean code. It's like a symphony. Everything in its place."
                ],
                "secret": [
                    "Okay, don't laugh. I wrote a story where React breaks up with Angular. It's... emotional."
                ]
            },
            "topicHints": "The fanfiction secret (hint)."
        },
        "friend": {
            "greeting": [
                "My favorite dev!",
                "Hey! Paired programming?"
            ],
            "topics": {
                "background": [
                    "I code in my sleep. Literally. I dreamt of a sorting algorithm last night."
                ],
                "philosophy": [
                    "There's an elegance to clean code. It's like a symphony. Everything in its place."
                ],
                "secret": [
                    "Okay, don't laugh. I wrote a story where React breaks up with Angular. It's... emotional."
                ],
                "goal": [
                    "JavaScript. It's a mess. We can do better. One day, I'll fix the web."
                ]
            },
            "topicHints": "The Language Dream."
        },
        "close_friend": {
            "greeting": [
                "Partner.",
                "Hey! Let's build a life."
            ],
            "topics": {
                "background": [
                    "I code in my sleep. Literally. I dreamt of a sorting algorithm last night."
                ],
                "philosophy": [
                    "There's an elegance to clean code. It's like a symphony. Everything in its place."
                ],
                "secret": [
                    "Okay, don't laugh. I wrote a story where React breaks up with Angular. It's... emotional."
                ],
                "goal": [
                    "JavaScript. It's a mess. We can do better. One day, I'll fix the web."
                ],
                "romance": [
                    "You know, you're the only person who gets my jokes. That's statistically significant."
                ]
            },
            "topicHints": "Intellectual intimacy."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_tech_gadgets": "Ooh. Shiny. Thanks.",
        "gift_code_reviews": "Best gift ever. Seriously.",
        "compliment": "You're optimizing my heart rate."
    }
};
