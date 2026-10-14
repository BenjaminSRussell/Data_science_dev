/**
 * Office System - Upgradeable office spaces and staff
 * Core tycoon mechanics for building your data science empire
 */

// Office spaces you can unlock
export const OFFICES = [
    {
        id: "bedroom",
        name: "Bedroom Corner",
        icon: "▫",
        price: 0,
        capacity: 1,
        clientBonus: 0,
        description: "Working from your bedroom. Humble beginnings.",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)"
    },
    {
        id: "home_office",
        name: "Home Office",
        icon: "⌂",
        price: 2000,
        capacity: 1,
        clientBonus: 0.1,
        description: "A dedicated room for work. Much better!",
        background: "linear-gradient(180deg, #1e3a5f 0%, #0d2137 100%)"
    },
    {
        id: "coworking",
        name: "Co-working Space",
        icon: "▤",
        price: 5000,
        capacity: 2,
        clientBonus: 0.2,
        description: "A desk at a co-working space. Network with others!",
        background: "linear-gradient(180deg, #2d3436 0%, #000000 100%)"
    },
    {
        id: "small_office",
        name: "Small Office",
        icon: "▥",
        price: 15000,
        capacity: 4,
        clientBonus: 0.35,
        description: "Your first real office! Room for a small team.",
        background: "linear-gradient(180deg, #1a1a3e 0%, #2d1b4e 100%)"
    },
    {
        id: "office_floor",
        name: "Office Floor",
        icon: "▦",
        price: 50000,
        capacity: 10,
        clientBonus: 0.5,
        description: "A whole floor in a commercial building.",
        background: "linear-gradient(180deg, #0f2027 0%, #203a43 100%)"
    },
    {
        id: "headquarters",
        name: "Company HQ",
        icon: "◆",
        price: 200000,
        capacity: 25,
        clientBonus: 0.75,
        description: "Your own building. You've made it!",
        background: "linear-gradient(180deg, #141e30 0%, #243b55 100%)"
    }
];

// Staff you can hire
// baseSalary is a daily rate. The live office screen does not hire from this table.
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
