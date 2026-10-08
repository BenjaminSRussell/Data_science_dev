/**
 * Gordon "The Broker" (The Insider) dialogue
 * Generated from story_line/the_broker.txt by scripts/generators/storyline_dialogue.py
 */

export default {
    "npcId": "the_broker",
    "personality": "greedy",
    "stages": {
        "stranger": {
            "greeting": [
                "Move along.",
                "Who sent you?",
                "Time is money."
            ],
            "topics": {},
            "topicHints": "Penny stocks, shell companies."
        },
        "friendly": {
            "greeting": [
                "Ah, the analyst.",
                "Gordon.",
                "Profitable day?"
            ],
            "topics": {
                "background": [
                    "I used to ring the opening bell. Now I make sure it stops ringing. The shadows are more profitable."
                ]
            },
            "topicHints": "Regulatory loopholes, offshore accounts."
        },
        "acquaintance": {
            "greeting": [
                "I have a tip.",
                "Listen close.",
                "Good to see you."
            ],
            "topics": {
                "background": [
                    "I used to ring the opening bell. Now I make sure it stops ringing. The shadows are more profitable."
                ],
                "philosophy": [
                    "Information isn't free. Alpha costs money. Or silence. Can you afford silence?"
                ],
                "secret": [
                    "They took my license. They thought that would stop me. It only made me invisible."
                ]
            },
            "topicHints": "The thrill of the gamble."
        },
        "friend": {
            "greeting": [
                "My partner in crime.",
                "Hey! Champagne?"
            ],
            "topics": {
                "background": [
                    "I used to ring the opening bell. Now I make sure it stops ringing. The shadows are more profitable."
                ],
                "philosophy": [
                    "Information isn't free. Alpha costs money. Or silence. Can you afford silence?"
                ],
                "secret": [
                    "They took my license. They thought that would stop me. It only made me invisible."
                ],
                "goal": [
                    "A flash crash. A momentary blip. Billions wiped out. And us? We catch the falling knives."
                ]
            },
            "topicHints": "The 2008 story, \"The Big Short\" (he was on the other side)."
        },
        "close_friend": {
            "greeting": [
                "We own this city.",
                "Hey! The yacht is ready."
            ],
            "topics": {
                "background": [
                    "I used to ring the opening bell. Now I make sure it stops ringing. The shadows are more profitable."
                ],
                "philosophy": [
                    "Information isn't free. Alpha costs money. Or silence. Can you afford silence?"
                ],
                "secret": [
                    "They took my license. They thought that would stop me. It only made me invisible."
                ],
                "goal": [
                    "A flash crash. A momentary blip. Billions wiped out. And us? We catch the falling knives."
                ],
                "hubris": [
                    "I am the market. The market is me. It breathes when I tell it to."
                ]
            },
            "topicHints": "Absolute power."
        }
    },
    "breakdowns": {},
    "emotionalTriggers": [],
    "actions": {
        "gift_insider_info": "Valuable. I'll remember this.",
        "gift_fine_wine": "Acceptable.",
        "compliment": "Of course I am."
    }
};
