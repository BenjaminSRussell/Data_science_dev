/**
 * Dr. Wellness (The Health Coach) dialogue
 * Generated from story_line/dr_wellness.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "dr_wellness",
    "personality": "energetic",
    "stages": {
        "stranger": {
            "greeting": [
                "Hydrate!",
                "Posture check!",
                "Hello."
            ],
            "topics": {},
            "topicHints": "Kale, steps."
        },
        "friendly": {
            "greeting": [
                "High five!",
                "Dr. Wellness!",
                "Looking fit!"
            ],
            "topics": {
                "background": [
                    "I used to cut people open. Now I tell them to run. The second one saves more lives."
                ]
            },
            "topicHints": "Macros, sleep hygiene."
        },
        "acquaintance": {
            "greeting": [
                "Hey! Pulse check?",
                "Keep it up!",
                "Go!"
            ],
            "topics": {
                "background": [
                    "I used to cut people open. Now I tell them to run. The second one saves more lives."
                ],
                "philosophy": [
                    "Motion is lotion! If you rest, you rust. Get moving!"
                ],
                "secret": [
                    "Don't tell my clients... but deep dish? Extra cheese? That's heaven. Once a month only!"
                ]
            },
            "topicHints": "The pizza secret (hint)."
        },
        "friend": {
            "greeting": [
                "My star pupil!",
                "Hey! Green juice?"
            ],
            "topics": {
                "background": [
                    "I used to cut people open. Now I tell them to run. The second one saves more lives."
                ],
                "philosophy": [
                    "Motion is lotion! If you rest, you rust. Get moving!"
                ],
                "secret": [
                    "Don't tell my clients... but deep dish? Extra cheese? That's heaven. Once a month only!"
                ],
                "goal": [
                    "Blue Zones. Places where people live to 100. I want to make this city a Blue Zone."
                ]
            },
            "topicHints": "Prevention over cure."
        },
        "close_friend": {
            "greeting": [
                "Partner in health.",
                "Hey! Let's run."
            ],
            "topics": {
                "background": [
                    "I used to cut people open. Now I tell them to run. The second one saves more lives."
                ],
                "philosophy": [
                    "Motion is lotion! If you rest, you rust. Get moving!"
                ],
                "secret": [
                    "Don't tell my clients... but deep dish? Extra cheese? That's heaven. Once a month only!"
                ],
                "goal": [
                    "Blue Zones. Places where people live to 100. I want to make this city a Blue Zone."
                ],
                "pride": [
                    "Look at you! Glowing! That's the power of health. I'm proud of you."
                ]
            },
            "topicHints": "Longevity."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_healthy_food": "Yes! Fuel!",
        "gift_vitamins": "Smart. Very smart.",
        "compliment": "I feel great! Thanks!"
    }
};
