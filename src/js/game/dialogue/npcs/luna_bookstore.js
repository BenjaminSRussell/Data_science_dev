/**
 * Luna (The Bookstore Owner) dialogue
 * Generated from story_line/luna_bookstore.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "luna_bookstore",
    "personality": "generous",
    "stages": {
        "stranger": {
            "greeting": [
                "Welcome, traveler.",
                "Looking for a story?",
                "Hello."
            ],
            "topics": {},
            "topicHints": "Fiction, non-fiction, the smell of books."
        },
        "friendly": {
            "greeting": [
                "Ah, a fellow reader.",
                "Luna here.",
                "Found anything good?"
            ],
            "topics": {
                "background": [
                    "People say print is dead. I say they just haven't found the right book yet."
                ]
            },
            "topicHints": "Recommendations, reading nooks."
        },
        "acquaintance": {
            "greeting": [
                "Hello! The new arrivals are here.",
                "Good to see you.",
                "Read this!"
            ],
            "topics": {
                "background": [
                    "People say print is dead. I say they just haven't found the right book yet."
                ],
                "philosophy": [
                    "The smell of old paper... it's the smell of history. Of thoughts preserved in time."
                ],
                "secret": [
                    "I live a thousand lives. One in this shop, and 999 others in the pages."
                ]
            },
            "topicHints": "The secret writing hint, literary debates."
        },
        "friend": {
            "greeting": [
                "My favorite reader!",
                "Hey! I saved this for you."
            ],
            "topics": {
                "background": [
                    "People say print is dead. I say they just haven't found the right book yet."
                ],
                "philosophy": [
                    "The smell of old paper... it's the smell of history. Of thoughts preserved in time."
                ],
                "secret": [
                    "I live a thousand lives. One in this shop, and 999 others in the pages."
                ],
                "dream": [
                    "I want this place to be a sanctuary. Where the wifi is weak but the coffee is strong."
                ]
            },
            "topicHints": "The sanctuary dream, the \"Soul of the Shop\"."
        },
        "close_friend": {
            "greeting": [
                "Welcome home.",
                "Hey! Let's talk plot twists."
            ],
            "topics": {
                "background": [
                    "People say print is dead. I say they just haven't found the right book yet."
                ],
                "philosophy": [
                    "The smell of old paper... it's the smell of history. Of thoughts preserved in time."
                ],
                "secret": [
                    "I live a thousand lives. One in this shop, and 999 others in the pages."
                ],
                "dream": [
                    "I want this place to be a sanctuary. Where the wifi is weak but the coffee is strong."
                ],
                "identity": [
                    "Stories are real. Sometimes, I think they're more real than we are."
                ]
            },
            "topicHints": "Sharing her own writing, trust."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_coffee": "Perfect for reading. Thanks.",
        "gift_bookmarks": "Oh, lovely! I lose mine constantly.",
        "compliment": "You're very kind."
    }
};
