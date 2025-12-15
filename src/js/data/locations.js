/**
 * Office Locations - Different work environments that change as you progress
 */

export const OFFICE_LOCATIONS = [
    {
        id: "home_office",
        name: "Home Office",
        description: "Your humble beginnings - a desk in your apartment",
        rankRequired: 0,
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
        ambiance: "🏠",
        elements: ["💻", "☕", "📚", "🪴"],
        unlockMessage: "Welcome to your home office! Time to start your data science journey."
    },
    {
        id: "startup_office",
        name: "Startup Bullpen",
        description: "An open floor plan at a fast-moving startup",
        rankRequired: 1,
        background: "linear-gradient(180deg, #1e3a5f 0%, #0d2137 50%, #0a1929 100%)",
        ambiance: "🚀",
        elements: ["💡", "🎯", "📊", "🍕"],
        unlockMessage: "You've joined a startup! The energy is electric."
    },
    {
        id: "corporate_floor",
        name: "Corporate Tower",
        description: "A sleek office in a downtown high-rise",
        rankRequired: 3,
        background: "linear-gradient(180deg, #1a1a3e 0%, #2d1b4e 50%, #1a0f2e 100%)",
        ambiance: "🏢",
        elements: ["🖥️", "📈", "☕", "🏆"],
        unlockMessage: "Welcome to the big leagues - corner office views await!"
    },
    {
        id: "innovation_lab",
        name: "Innovation Lab",
        description: "A cutting-edge R&D facility",
        rankRequired: 5,
        background: "linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        ambiance: "🔬",
        elements: ["🧪", "🔮", "💎", "⚡"],
        unlockMessage: "You've made it to the Innovation Lab - where data dreams come true!"
    },
    {
        id: "executive_suite",
        name: "Executive Suite",
        description: "The penthouse office with a view of the city",
        rankRequired: 6,
        background: "linear-gradient(180deg, #141e30 0%, #243b55 50%, #141e30 100%)",
        ambiance: "👔",
        elements: ["🌆", "🥂", "🏅", "💼"],
        unlockMessage: "You've reached the top! The C-Suite is yours."
    },
    {
        id: "donut_shop",
        name: "Donut Delights",
        description: "Fresh donuts and coffee available 24/7",
        rankRequired: 0,
        background: "linear-gradient(180deg, #ffeaa7 0%, #ff7675 100%)",
        ambiance: "🍩",
        elements: ["🍩", "☕", "🍰", "🥛"],
        unlockMessage: "",
        hidden: true // Not selectable in Office Upgrade menu
    },
    {
        id: "bagel_shop",
        name: "Bagel Bros",
        description: "New York style bagels",
        rankRequired: 0,
        background: "linear-gradient(180deg, #fab1a0 0%, #e17055 100%)",
        ambiance: "🥯",
        elements: ["🥯", "☕", "🥪", "🧀"],
        unlockMessage: "",
        hidden: true
    },
    {
        id: "flower_store",
        name: "Bloom & Grow",
        description: "A fragrant oasis in the city",
        rankRequired: 0,
        background: "linear-gradient(180deg, #55efc4 0%, #00b894 100%)",
        ambiance: "💐",
        elements: ["🌻", "🌹", "🌷", "🪴"],
        unlockMessage: "",
        hidden: true
    }
];

/**
 * Time of Day Settings - Visual changes based on in-game time
 */
export const TIME_OF_DAY = [
    {
        id: "morning",
        name: "Morning",
        hours: [6, 7, 8, 9, 10, 11],
        overlay: "rgba(255, 200, 150, 0.05)",
        icon: "🌅",
        greeting: "Good morning! Ready to tackle some data?"
    },
    {
        id: "afternoon",
        name: "Afternoon",
        hours: [12, 13, 14, 15, 16, 17],
        overlay: "rgba(255, 255, 255, 0.02)",
        icon: "☀️",
        greeting: "Afternoon productivity boost incoming!"
    },
    {
        id: "evening",
        name: "Evening",
        hours: [18, 19, 20, 21],
        overlay: "rgba(100, 100, 200, 0.08)",
        icon: "🌆",
        greeting: "Evening crunch time - let's finish strong!"
    },
    {
        id: "night",
        name: "Late Night",
        hours: [22, 23, 0, 1, 2, 3, 4, 5],
        overlay: "rgba(20, 20, 60, 0.15)",
        icon: "🌙",
        greeting: "Burning the midnight oil? Respect! ☕"
    }
];

/**
 * Weather Effects - Subtle visual variety
 */
export const WEATHER_EFFECTS = [
    {
        id: "clear",
        name: "Clear",
        weight: 50,
        cssClass: "weather-clear",
        icon: "☀️"
    },
    {
        id: "cloudy",
        name: "Cloudy",
        weight: 25,
        cssClass: "weather-cloudy",
        icon: "☁️"
    },
    {
        id: "rainy",
        name: "Rainy",
        weight: 15,
        cssClass: "weather-rainy",
        icon: "🌧️"
    },
    {
        id: "snowy",
        name: "Snowy",
        weight: 10,
        cssClass: "weather-snowy",
        icon: "❄️"
    }
];

/**
 * Desk Items - Collectible decorations that appear on your desk
 */
export const DESK_ITEMS = [
    { id: "coffee_mug", name: "Coffee Mug", icon: "☕", unlockedAfter: 0 },
    { id: "plant", name: "Desk Plant", icon: "🪴", unlockedAfter: 2 },
    { id: "trophy", name: "Small Trophy", icon: "🏆", unlockedAfter: 5 },
    { id: "photo_frame", name: "Photo Frame", icon: "🖼️", unlockedAfter: 3 },
    { id: "stress_ball", name: "Stress Ball", icon: "⚽", unlockedAfter: 1 },
    { id: "gold_trophy", name: "Gold Trophy", icon: "🥇", unlockedAfter: 10 },
    { id: "globe", name: "World Globe", icon: "🌍", unlockedAfter: 15 },
    { id: "diploma", name: "Framed Diploma", icon: "📜", unlockedAfter: 7 }
];

/**
 * Office Events - Random events that add variety
 */
export const OFFICE_EVENTS = [
    {
        id: "coffee_break",
        name: "Coffee Break",
        description: "Someone brought donuts! ☕🍩",
        effect: "mood_boost",
        icon: "🍩",
        duration: 60000
    },
    {
        id: "meeting",
        name: "Team Meeting",
        description: "Quick standup - stay focused!",
        effect: "time_pressure",
        icon: "👥",
        duration: 30000
    },
    {
        id: "praise",
        name: "Public Praise",
        description: "Your last chart was mentioned in the all-hands!",
        effect: "rep_boost",
        icon: "⭐",
        duration: 45000
    },
    {
        id: "deadline",
        name: "Urgent Deadline",
        description: "The CEO needs this ASAP!",
        effect: "bonus_reward",
        icon: "⏰",
        duration: 120000
    }
];
