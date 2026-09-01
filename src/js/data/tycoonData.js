// Office spaces you can purchase
export const OFFICE_SPACES = [
    {
        id: "home",
        name: "Home",
        icon: "",
        price: 0,
        capacity: 1,
        clientBonus: 0.05,
        description: "Starting from your own home. Cheap and cozy!",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)"
    },
    {
        id: "home_office",
        name: "Home Office",
        icon: "",
        price: 2000,
        capacity: 1,
        clientBonus: 0.1,
        description: "A dedicated room for work. Much better!",
        background: "linear-gradient(180deg, #1e3a5f 0%, #0d2137 100%)"
    },
    {
        id: "coworking",
        name: "Co-working Space",
        icon: "",
        price: 5000,
        capacity: 2,
        clientBonus: 0.2,
        description: "A desk at a co-working space. Network with others!",
        background: "linear-gradient(180deg, #2d3436 0%, #000000 100%)"
    },
    {
        id: "small_office",
        name: "Small Office",
        icon: "",
        price: 15000,
        capacity: 4,
        clientBonus: 0.35,
        description: "Your first real office! Room for a small team.",
        background: "linear-gradient(180deg, #1a1a3e 0%, #2d1b4e 100%)"
    },
    {
        id: "office_floor",
        name: "Office Floor",
        icon: "",
        price: 50000,
        capacity: 10,
        clientBonus: 0.5,
        description: "A whole floor in a commercial building.",
        background: "linear-gradient(180deg, #0f2027 0%, #203a43 100%)"
    },
    {
        id: "headquarters",
        name: "Company HQ",
        icon: "",
        price: 200000,
        capacity: 25,
        clientBonus: 0.75,
        description: "Your own building. You've made it!",
        background: "linear-gradient(180deg, #141e30 0%, #243b55 100%)"
    }
];

// Staff you can hire
export const STAFF_TYPES = [
    {
        id: "intern",
        name: "Intern",
        icon: "",
        baseSalary: 50,
        efficiency: 0.5,
        description: "Eager to learn, needs supervision",
        skills: ["data_entry"]
    },
    {
        id: "junior_analyst",
        name: "Junior Analyst",
        icon: "",
        baseSalary: 150,
        efficiency: 0.8,
        description: "Can handle basic charts independently",
        skills: ["data_entry", "basic_charts"]
    },
    {
        id: "analyst",
        name: "Data Analyst",
        icon: "",
        baseSalary: 300,
        efficiency: 1.0,
        description: "Solid all-around performer",
        skills: ["data_entry", "basic_charts", "advanced_charts"]
    },
    {
        id: "senior_analyst",
        name: "Senior Analyst",
        icon: "",
        baseSalary: 500,
        efficiency: 1.5,
        description: "Expert-level work, can mentor others",
        skills: ["data_entry", "basic_charts", "advanced_charts", "mentoring"]
    },
    {
        id: "data_scientist",
        name: "Data Scientist",
        icon: "",
        baseSalary: 800,
        efficiency: 2.0,
        description: "ML, statistics, the works",
        skills: ["data_entry", "basic_charts", "advanced_charts", "ml", "stats"]
    },
    {
        id: "project_manager",
        name: "Project Manager",
        icon: "",
        baseSalary: 400,
        efficiency: 0,
        description: "Manages client relationships, +20% client satisfaction",
        skills: ["client_management"],
        bonus: { clientSatisfaction: 0.2 }
    },
    {
        id: "sales",
        name: "Sales Rep",
        icon: "",
        baseSalary: 350,
        efficiency: 0,
        description: "+1 client lead per day",
        skills: ["sales"],
        bonus: { clientLeadsPerDay: 1 }
    }
];

// Client types (they bring you data)
export const CLIENT_TYPES = [
    {
        id: "small_business",
        name: "Small Business",
        icon: "",
        minPay: 50,
        maxPay: 200,
        dataComplexity: 1,
        patience: 0.8,
        description: "Mom and pop shops need simple reports"
    },
    {
        id: "startup",
        name: "Startup",
        icon: "",
        minPay: 150,
        maxPay: 500,
        dataComplexity: 2,
        patience: 0.5,
        description: "Fast-moving, need quick turnaround"
    },
    {
        id: "agency",
        name: "Marketing Agency",
        icon: "",
        minPay: 200,
        maxPay: 600,
        dataComplexity: 2,
        patience: 0.7,
        description: "Regular work, fair pay"
    },
    {
        id: "enterprise",
        name: "Enterprise",
        icon: "",
        minPay: 500,
        maxPay: 2000,
        dataComplexity: 3,
        patience: 0.9,
        description: "Big contracts, complex requirements"
    },
    {
        id: "government",
        name: "Government",
        icon: "",
        minPay: 400,
        maxPay: 1500,
        dataComplexity: 3,
        patience: 1.0,
        description: "Slow but steady, lots of red tape"
    },
    {
        id: "fortune500",
        name: "Fortune 500",
        icon: "",
        minPay: 2000,
        maxPay: 10000,
        dataComplexity: 4,
        patience: 0.6,
        description: "The big leagues. Don't mess up."
    }
];

// Investments for client acquisition
export const MARKETING_CHANNELS = [
    {
        id: "word_of_mouth",
        name: "Word of Mouth",
        icon: "",
        costPerDay: 0,
        leadsPerDay: 0.5,
        description: "Free but slow - happy clients refer others"
    },
    {
        id: "linkedin",
        name: "LinkedIn Presence",
        icon: "",
        costPerDay: 20,
        leadsPerDay: 1,
        description: "Professional networking pays off"
    },
    {
        id: "website",
        name: "Company Website",
        icon: "",
        costPerDay: 50,
        leadsPerDay: 2,
        description: "SEO and content marketing"
    },
    {
        id: "ads",
        name: "Online Ads",
        icon: "",
        costPerDay: 100,
        leadsPerDay: 4,
        description: "Pay-per-click advertising"
    },
    {
        id: "conference",
        name: "Industry Events",
        icon: "",
        costPerDay: 200,
        leadsPerDay: 6,
        description: "Networking at conferences and meetups"
    },
    {
        id: "enterprise_sales",
        name: "Enterprise Sales Team",
        icon: "",
        costPerDay: 200,
        leadsPerDay: 3,
        description: "Fewer leads, but they're high value"
    }
];