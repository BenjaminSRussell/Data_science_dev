/**
 * Shop Items - Purchasable upgrades and unlocks
 */

export const SHOP_ITEMS = [
    // Note: Chart types are now free and unlocked by default. Strategy shifts to choosing the right chart for the task.

    // Tools
    {
        id: "tool_data_filter",
        name: "Data Filter",
        description: "Filter data before visualization",
        category: "tools",
        type: "tool",
        toolId: "data_filter",
        icon: "",
        price: 300
    },
    {
        id: "tool_data_sort",
        name: "Advanced Sort",
        description: "Sort data by any column",
        category: "tools",
        type: "tool",
        toolId: "data_sort",
        icon: "",
        price: 250
    },
    {
        id: "tool_aggregation",
        name: "Data Aggregation",
        description: "Combine and summarize data points",
        category: "tools",
        type: "tool",
        toolId: "aggregation",
        icon: "",
        price: 600
    },
    {
        id: "tool_annotations",
        name: "Chart Annotations",
        description: "Add notes and callouts to charts",
        category: "tools",
        type: "tool",
        toolId: "annotations",
        icon: "",
        price: 400
    },
    {
        id: "tool_export",
        name: "High-Res Export",
        description: "Export charts in various formats",
        category: "tools",
        type: "tool",
        toolId: "export",
        icon: "",
        price: 350
    },

    // Perks
    {
        id: "perk_time_bonus",
        name: "Time Extension",
        description: "+30 seconds on all tasks",
        category: "perks",
        type: "perk",
        perkId: "time_bonus",
        icon: "⏱",
        price: 700
    },
    {
        id: "perk_boss_favor",
        name: "Office Coffee",
        description: "Bosses are 10% more lenient",
        category: "perks",
        type: "perk",
        perkId: "boss_favor",
        icon: "/assets/icons/items/coffee.png",
        price: 500
    },
    {
        id: "perk_bonus_multiplier",
        name: "Negotiation Skills",
        description: "+15% money from all tasks",
        category: "perks",
        type: "perk",
        perkId: "bonus_multiplier",
        icon: "/assets/icons/ui/money.png",
        price: 1000
    },
    {
        id: "perk_rep_boost",
        name: "Networking",
        description: "+20% reputation from tasks",
        category: "perks",
        type: "perk",
        perkId: "rep_boost",
        icon: "",
        price: 800
    },
    {
        id: "perk_second_chance",
        name: "Second Chance",
        description: "Retry one task per day",
        category: "perks",
        type: "perk",
        perkId: "second_chance",
        icon: "",
        price: 1500
    },
    {
        id: "perk_insight",
        name: "Data Insight",
        description: "See hints for optimal chart type",
        category: "perks",
        type: "perk",
        perkId: "insight",
        icon: "",
        price: 600
    },

    // Software
    {
        id: "soft_ide_pro",
        name: "IDE Pro License",
        description: "Reduced bugs, faster coding. Essential.",
        category: "software",
        type: "software",
        softwareId: "ide_pro",
        icon: "",
        price: 250
    },
    {
        id: "soft_automl",
        name: "AutoML Suite",
        description: "Automate model selection. +Speed.",
        category: "software",
        type: "software",
        softwareId: "automl",
        icon: "",
        price: 800
    },
    {
        id: "soft_cloud_basic",
        name: "Cloud Compute Credits",
        description: "Offload training to the cloud.",
        category: "software",
        type: "software",
        softwareId: "cloud_basic",
        icon: "",
        price: 400
    },
    {
        id: "soft_enterprise_db",
        name: "Enterprise DB License",
        description: "Handle massive datasets with ease.",
        category: "software",
        type: "software",
        softwareId: "ent_db",
        icon: "",
        price: 1200
    },
    {
        id: "soft_neural_arch",
        name: "Neural Architecture Search",
        description: "AI designing AI. The future.",
        category: "software",
        type: "software",
        softwareId: "nas_tool",
        icon: "",
        price: 2500
    }
];
