/**
 * Career Ranks - Progression ladder for the game
 */

export const RANKS = [
    {
        id: 1,
        title: "Data Entry Clerk",
        salaryMultiplier: 1.0,
        repRequired: 0,
        description: "You're just starting out. Time to prove yourself!",
        perks: []
    },
    {
        id: 2,
        title: "Junior Analyst",
        salaryMultiplier: 1.5,
        repRequired: 100,
        description: "You've shown basic competence. Keep improving!",
        perks: ["Access to Line Charts"]
    },
    {
        id: 3,
        title: "Data Analyst",
        salaryMultiplier: 2.0,
        repRequired: 300,
        description: "A solid analyst who can handle most requests.",
        perks: ["Access to Scatter Plots"]
    },
    {
        id: 4,
        title: "Senior Analyst",
        salaryMultiplier: 3.0,
        repRequired: 600,
        description: "Your visualizations are trusted across departments.",
        perks: ["Access to Radar Charts", "Time bonus increased"]
    },
    {
        id: 5,
        title: "Lead Data Scientist",
        salaryMultiplier: 5.0,
        repRequired: 1200,
        description: "You lead visualization projects for the entire company.",
        perks: ["Access to Heatmaps", "Boss tolerance increased"]
    },
    {
        id: 6,
        title: "Principal Scientist",
        salaryMultiplier: 8.0,
        repRequired: 2500,
        description: "Your work influences major business decisions.",
        perks: ["Access to Sankey Diagrams", "Premium clients"]
    },
    {
        id: 7,
        title: "Chief Data Officer",
        salaryMultiplier: 15.0,
        repRequired: 5000,
        description: "You've reached the top. The data world is yours!",
        perks: ["All chart types unlocked", "Maximum bonuses"]
    }
];
