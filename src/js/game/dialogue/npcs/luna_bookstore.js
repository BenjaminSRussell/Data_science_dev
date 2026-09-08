/**
 * Luna Bookstore Dialogue
 * Individual dialogue file for Luna, the Bookstore Owner
 * Generous, Dreamy, Bibliophile
 */

export default {
    npcId: 'luna_bookstore',
    age: 34,
    personality: 'dreamy',

    stages: {
        stranger: {
            greeting: [
                "Welcome, traveler.",
                "Looking for a story?",
                "Hello."
            ],
            topics: {
                fiction: [
                    "Fiction is where we live a thousand lives.",
                    "Every book is a door.",
                    "What kind of story are you in the mood for?"
                ],
                non_fiction: [
                    "Non-fiction grounds us.",
                    "Sometimes you need the truth, not the dream.",
                    "I keep a shelf for the real world."
                ],
                smell_of_books: [
                    "The smell of old paper... it's the smell of history.",
                    "Of thoughts preserved in time.",
                    "You can't get that from a screen."
                ]
            }
        },

        friendly: {
            greeting: [
                "Ah, a fellow reader.",
                "Luna here.",
                "Found anything good?"
            ],
            topics: {
                recommendations: [
                    "Let me find you something.",
                    "I have a feeling I know exactly what you need.",
                    "Trust me on this one."
                ],
                reading_nooks: [
                    "The corner by the window is my favorite.",
                    "Best spot in the shop for getting lost in a book.",
                    "Save me a seat there sometime."
                ]
            }
        },

        acquaintance: {
            greeting: [
                "Hello! The new arrivals are here.",
                "Good to see you.",
                "Read this!"
            ],
            topics: {
                secret_writing: [
                    "I live a thousand lives. One in this shop, and 999 others in the pages.",
                    "Some of those lives are ones I wrote.",
                    "You'd never guess who's behind some of the bestsellers out there."
                ],
                literary_debates: [
                    "Tell me you don't think the ending was rushed.",
                    "We should settle this over coffee.",
                    "A good debate is just a story with two authors."
                ]
            }
        },

        friend: {
            greeting: [
                "My favorite reader!",
                "Hey! I saved this for you."
            ],
            topics: {
                sanctuary: [
                    "I want this place to be a sanctuary.",
                    "Where the wifi is weak but the coffee is strong.",
                    "A place where people can just... be."
                ],
                soul_of_the_shop: [
                    "This shop has a soul.",
                    "Every book that's ever been read here left a little piece behind.",
                    "I'm just the keeper of it."
                ]
            }
        },

        close_friend: {
            greeting: [
                "Welcome home.",
                "Hey! Let's talk plot twists."
            ],
            topics: {
                own_writing: [
                    "I've been writing. Fantasy, actually.",
                    "Under a pen name. It's... surprisingly popular.",
                    "I've never told anyone. You're the first."
                ],
                trust: [
                    "Stories are real. Sometimes, I think they're more real than we are.",
                    "Thank you for believing in me. And in the stories.",
                    "You're the only person I've ever shared this with."
                ]
            }
        }
    },

    breakdowns: {
        low_relationship: {
            trigger: { relationship: '<20' },
            emotion: 'hurt',
            dialogue: [
                "I thought you'd come back.",
                "Books don't forget their readers.",
                "..."
            ],
            quickTime: 'comfort'
        },
        past_judgment: {
            trigger: { judgment: true },
            emotion: 'sadness',
            dialogue: [
                "You think I'm just a shopkeeper?",
                "There's more to me than the register.",
                "I'm more than this shop."
            ],
            quickTime: 'defuse'
        },
        betrayal: {
            trigger: { betrayal: true },
            emotion: 'hurt',
            dialogue: [
                "I trusted you with my stories.",
                "And you...",
                "I need some time."
            ],
            quickTime: 'apologize'
        }
    },

    emotionalTriggers: [
        {
            condition: { mentionPast: true, judgment: true },
            emotion: 'defensive',
            dialogue: "I'm more than what you see in this shop.",
            subtext: 'Her voice is quiet but firm'
        },
        {
            condition: { playerSupports: true, relationship: '>40' },
            emotion: 'gratitude',
            dialogue: "Thank you for seeing me. All of me.",
            subtext: 'A rare, genuine smile'
        }
    ],

    actions: {
        gift_coffee: "Perfect for reading. Thanks.",
        gift_bookmarks: "Oh, lovely! I lose mine constantly.",
        compliment: "You're very kind.",
        ask_help: "Of course. What do you need?",
        rejection: "I understand. The books will be here.",
        betrayal: "I can't believe you'd do that to me."
    }
};
