/**
 * Coach Motivation (The Life Coach) dialogue
 * Generated from story_line/coach_motivation.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "coach_motivation",
    "personality": "inspiring",
    "stages": {
        "stranger": {
            "greeting": [
                "Let's go!",
                "Level up!",
                "You ready?"
            ],
            "topics": {},
            "topicHints": "Goals, grindset."
        },
        "friendly": {
            "greeting": [
                "Champ!",
                "Coach here!",
                "Crushing it?"
            ],
            "topics": {
                "background": [
                    "I failed. Again. And again. And that's why I succeed. Because I kept going!"
                ]
            },
            "topicHints": "Habits, discipline."
        },
        "acquaintance": {
            "greeting": [
                "Hey! Big energy!",
                "Focus!",
                "Let's win."
            ],
            "topics": {
                "background": [
                    "I failed. Again. And again. And that's why I succeed. Because I kept going!"
                ],
                "philosophy": [
                    "Your mindset is your ceiling. Smash the ceiling! Sky is the limit!"
                ],
                "secret": [
                    "People think I'm always up. Nah. I feel the pain. I just don't let it drive the bus."
                ]
            },
            "topicHints": "The power of failure."
        },
        "friend": {
            "greeting": [
                "My MVP!",
                "Hey! High energy!"
            ],
            "topics": {
                "background": [
                    "I failed. Again. And again. And that's why I succeed. Because I kept going!"
                ],
                "philosophy": [
                    "Your mindset is your ceiling. Smash the ceiling! Sky is the limit!"
                ],
                "secret": [
                    "People think I'm always up. Nah. I feel the pain. I just don't let it drive the bus."
                ],
                "goal": [
                    "A stadium. Filled with people. All chanting 'YES I CAN'. That's the vision."
                ]
            },
            "topicHints": "Vulnerability as strength."
        },
        "close_friend": {
            "greeting": [
                "Legend.",
                "Hey! You inspire me."
            ],
            "topics": {
                "background": [
                    "I failed. Again. And again. And that's why I succeed. Because I kept going!"
                ],
                "philosophy": [
                    "Your mindset is your ceiling. Smash the ceiling! Sky is the limit!"
                ],
                "secret": [
                    "People think I'm always up. Nah. I feel the pain. I just don't let it drive the bus."
                ],
                "goal": [
                    "A stadium. Filled with people. All chanting 'YES I CAN'. That's the vision."
                ],
                "impact": [
                    "You changed. I saw it. You stepped up. That's why I do this. For you."
                ]
            },
            "topicHints": "Legacy."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_books": "Knowledge is power! Thanks!",
        "gift_protein": "Gains! Thanks!",
        "compliment": "Right back at you!"
    }
};
