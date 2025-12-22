/**
 * Boss Characters - Different personalities that give tasks
 */

export const BOSSES = [
    {
        id: "anderson",
        name: "Mr. Anderson",
        title: "Department Head",
        avatar: "",
        mood: "",
        personality: "traditional",
        strictness: 1.0,
        preferences: {
            likesChartTypes: ["bar", "line"],
            dislikesChartTypes: ["radar"],
            valuesClarity: true,
            valuesCreativity: false
        },
        taskIntro: "I need a clear, professional visualization for the board meeting.",
        successResponses: [
            "This is exactly what I needed. Well done.",
            "Clean and professional. The board will appreciate this.",
            "Good work. Keep this up."
        ],
        failResponses: [
            "This isn't what I asked for. Please review the requirements.",
            "I expected better. This needs work.",
            "The board won't accept this. Try again."
        ]
    },
    {
        id: "chen",
        name: "Dr. Sarah Chen",
        title: "Head of Analytics",
        avatar: "",
        mood: "",
        personality: "perfectionist",
        strictness: 1.3,
        preferences: {
            likesChartTypes: ["scatter", "line", "radar"],
            dislikesChartTypes: ["pie"],
            valuesClarity: true,
            valuesCreativity: true
        },
        taskIntro: "I need rigorous, scientifically sound visualizations. Precision matters.",
        successResponses: [
            "Excellent methodology. Your visualization tells the story perfectly.",
            "This meets my standards. I'm impressed.",
            "Statistically sound and visually clear. Outstanding."
        ],
        failResponses: [
            "This lacks rigor. The methodology is questionable.",
            "I see several issues with your approach. Let's discuss.",
            "This wouldn't survive peer review. Rethink your approach."
        ]
    },
    {
        id: "martinez",
        name: "Carlos Martinez",
        title: "Marketing Director",
        avatar: "",
        mood: "",
        personality: "creative",
        strictness: 0.8,
        preferences: {
            likesChartTypes: ["pie", "doughnut", "bar"],
            dislikesChartTypes: ["scatter"],
            valuesClarity: false,
            valuesCreativity: true
        },
        taskIntro: "Make it pop! I want something that grabs attention.",
        successResponses: [
            "Love it! This will look great in the campaign.",
            "Now THAT'S what I'm talking about! ",
            "Perfect for social media. Great work!"
        ],
        failResponses: [
            "It's a bit... boring? Can we make it more exciting?",
            "I was hoping for something with more pizzazz.",
            "My grandmother could make this more interesting."
        ]
    },
    {
        id: "johnson",
        name: "Patricia Johnson",
        title: "CFO",
        avatar: "",
        mood: "",
        personality: "numbers-focused",
        strictness: 1.2,
        preferences: {
            likesChartTypes: ["bar", "line"],
            dislikesChartTypes: ["doughnut", "radar"],
            valuesClarity: true,
            valuesCreativity: false
        },
        taskIntro: "I need accurate financial data visualization. Every number matters.",
        successResponses: [
            "The numbers check out. Good work.",
            "Clear and accurate. This is what I needed.",
            "Acceptable. Send it to my office."
        ],
        failResponses: [
            "I found discrepancies. Double-check your math.",
            "This doesn't match our records. Verify the data.",
            "Inaccurate. This could cost us millions if we present it."
        ]
    },
    {
        id: "kim",
        name: "Alex Kim",
        title: "Product Manager",
        avatar: "",
        mood: "",
        personality: "fast-paced",
        strictness: 0.9,
        preferences: {
            likesChartTypes: ["line", "bar"],
            dislikesChartTypes: [],
            valuesClarity: true,
            valuesCreativity: true
        },
        taskIntro: "I need this quick for the sprint review. Simple but effective!",
        successResponses: [
            "Ship it! This is exactly what we needed.",
            "Great turnaround time and quality. Nice!",
            "The stakeholders will love this. Thanks!"
        ],
        failResponses: [
            "We don't have time for revisions. This needs to be better.",
            "The team expected more from this. Let's iterate.",
            "Hmm, not quite there. Can you rush a fix?"
        ]
    },
    {
        id: "williams",
        name: "Dr. James Williams",
        title: "Research Director",
        avatar: "",
        mood: "",
        personality: "academic",
        strictness: 1.15,
        preferences: {
            likesChartTypes: ["scatter", "line", "radar", "bar"],
            dislikesChartTypes: ["pie"],
            valuesClarity: true,
            valuesCreativity: false
        },
        taskIntro: "I need publication-quality visualizations for our research paper.",
        successResponses: [
            "This meets academic standards. Excellent work.",
            "The peer reviewers will find no fault with this.",
            "Rigorous and well-presented. Impressive."
        ],
        failResponses: [
            "This wouldn't pass peer review in its current state.",
            "The visualization lacks academic rigor.",
            "I suggest reviewing best practices in data visualization."
        ]
    }
];
