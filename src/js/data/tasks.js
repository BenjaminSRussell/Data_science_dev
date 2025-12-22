/**
 * Task Templates - Different visualization challenges
 * Wide variety of business scenarios for endless gameplay variety
 */

export const TASKS = [
    // Difficulty 1: Entry level tasks
    {
        id: "quarterly_sales_basic",
        name: "Quarterly Sales Report",
        description: "Create a chart showing our quarterly sales performance.",
        difficulty: 1,
        dataType: "quarterly_sales",
        requirements: [" Show comparison", " Display trends"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 300
    },
    {
        id: "category_breakdown_basic",
        name: "Sales by Category",
        description: "Visualize how sales are distributed across product categories.",
        difficulty: 1,
        dataType: "category_breakdown",
        requirements: [" Show proportions", " Compare categories"],
        optimalChartTypes: ["pie", "doughnut"],
        acceptableChartTypes: ["pie", "doughnut", "bar"],
        timeLimit: 300
    },
    {
        id: "monthly_trend_basic",
        name: "Monthly Revenue Trend",
        description: "Show how our revenue has changed over the past year.",
        difficulty: 1,
        dataType: "monthly_revenue",
        requirements: [" Show trend over time", " Highlight changes"],
        optimalChartTypes: ["line"],
        acceptableChartTypes: ["line", "bar", "area"],
        timeLimit: 300
    },
    {
        id: "website_traffic",
        name: "Website Traffic Overview",
        description: "Show our website visitor trends for the team meeting.",
        difficulty: 1,
        dataType: "trend_analysis",
        requirements: [" Show visitor counts", " Highlight growth"],
        optimalChartTypes: ["line"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 300
    },
    {
        id: "budget_breakdown",
        name: "Department Budget Allocation",
        description: "Visualize how our budget is split across departments.",
        difficulty: 1,
        dataType: "category_breakdown",
        requirements: [" Show budget split", " Clear comparison"],
        optimalChartTypes: ["pie", "doughnut"],
        acceptableChartTypes: ["pie", "doughnut", "bar"],
        timeLimit: 300
    },

    // Difficulty 2: Mid-level tasks
    {
        id: "product_comparison_mid",
        name: "Product Performance Analysis",
        description: "Compare our top products by sales and customer ratings.",
        difficulty: 2,
        dataType: "product_comparison",
        requirements: [" Compare multiple products", " Include ratings data"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 240
    },
    {
        id: "trend_analysis_mid",
        name: "User Growth Analysis",
        description: "Analyze user growth patterns over the past quarter.",
        difficulty: 2,
        dataType: "trend_analysis",
        requirements: [" Show growth trajectory", " Identify patterns"],
        optimalChartTypes: ["line", "area"],
        acceptableChartTypes: ["line", "bar"],
        timeLimit: 240
    },
    {
        id: "demographics_mid",
        name: "Customer Demographics",
        description: "Visualize our customer base by age group distribution.",
        difficulty: 2,
        dataType: "customer_demographics",
        requirements: [" Show age distribution", " Compare segments"],
        optimalChartTypes: ["pie", "bar"],
        acceptableChartTypes: ["pie", "doughnut", "bar"],
        timeLimit: 240
    },
    {
        id: "marketing_roi",
        name: "Marketing Campaign ROI",
        description: "Show the return on investment for our marketing channels.",
        difficulty: 2,
        dataType: "product_comparison",
        requirements: [" Show ROI", " Compare channels"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 240
    },
    {
        id: "employee_satisfaction",
        name: "Employee Satisfaction Survey",
        description: "Visualize results from the annual employee satisfaction survey.",
        difficulty: 2,
        dataType: "performance_metrics",
        requirements: [" Show satisfaction levels", " Compare departments"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 240
    },
    {
        id: "sales_regional",
        name: "Regional Sales Comparison",
        description: "Compare sales performance across different regions.",
        difficulty: 2,
        dataType: "product_comparison",
        requirements: [" Compare regions", " Show differences"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar", "pie"],
        timeLimit: 240
    },

    // Difficulty 3: Senior level tasks
    {
        id: "performance_radar",
        name: "Team Performance Metrics",
        description: "Create a comprehensive view of team performance across key metrics.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Multi-dimensional view", " Show strengths/weaknesses"],
        optimalChartTypes: ["radar"],
        acceptableChartTypes: ["radar", "bar"],
        timeLimit: 200
    },
    {
        id: "quarterly_detailed",
        name: "Executive Summary Chart",
        description: "Create a board-ready visualization of quarterly financial performance.",
        difficulty: 3,
        dataType: "quarterly_sales",
        requirements: [" Executive ready", " Clear insights", " Show profitability"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 200
    },
    {
        id: "trend_forecast",
        name: "Growth Trend Presentation",
        description: "Visualize user growth for investor presentation.",
        difficulty: 3,
        dataType: "trend_analysis",
        requirements: [" Investment grade", " Professional quality"],
        optimalChartTypes: ["line"],
        acceptableChartTypes: ["line", "area"],
        timeLimit: 180
    },
    {
        id: "competitor_analysis",
        name: "Competitive Landscape Analysis",
        description: "Compare our performance against key competitors.",
        difficulty: 3,
        dataType: "product_comparison",
        requirements: [" Competitor comparison", " Clear positioning"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 200
    },
    {
        id: "customer_journey",
        name: "Customer Conversion Funnel",
        description: "Visualize the customer journey from awareness to purchase.",
        difficulty: 3,
        dataType: "category_breakdown",
        requirements: [" Show funnel stages", " Display drop-off"],
        optimalChartTypes: ["bar"],
        acceptableChartTypes: ["bar"],
        timeLimit: 200
    },
    {
        id: "kpi_dashboard",
        name: "KPI Dashboard Overview",
        description: "Create a comprehensive view of our key performance indicators.",
        difficulty: 3,
        dataType: "performance_metrics",
        requirements: [" Show all KPIs", " Highlight targets vs actuals"],
        optimalChartTypes: ["bar", "radar"],
        acceptableChartTypes: ["bar", "radar"],
        timeLimit: 180
    },

    // Difficulty 4: Expert level tasks
    {
        id: "complex_multivar",
        name: "Comprehensive Market Analysis",
        description: "Create publication-quality visualization for the annual report.",
        difficulty: 4,
        dataType: "product_comparison",
        requirements: [" Multi-variable analysis", " Award-winning quality", " Clear narrative"],
        optimalChartTypes: ["bar", "scatter"],
        acceptableChartTypes: ["bar"],
        timeLimit: 180
    },
    {
        id: "executive_dashboard",
        name: "C-Suite Financial Dashboard",
        description: "Create a visualization for the CEO's quarterly business review.",
        difficulty: 4,
        dataType: "quarterly_sales",
        requirements: [" CEO level", " Perfect accuracy", " Actionable insights"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 150
    },
    {
        id: "investor_deck",
        name: "Series B Investor Pitch",
        description: "Create the key metrics visualization for our funding round.",
        difficulty: 4,
        dataType: "trend_analysis",
        requirements: [" Investor grade", " Growth story", " Compelling narrative"],
        optimalChartTypes: ["line"],
        acceptableChartTypes: ["line", "area"],
        timeLimit: 150
    },
    {
        id: "board_presentation",
        name: "Board of Directors Report",
        description: "Prepare the annual performance visualization for the board.",
        difficulty: 4,
        dataType: "quarterly_sales",
        requirements: [" Board level", " Strategic insights", " Professional quality"],
        optimalChartTypes: ["bar", "line"],
        acceptableChartTypes: ["bar", "line"],
        timeLimit: 150
    },
    {
        id: "strategic_planning",
        name: "5-Year Strategic Outlook",
        description: "Visualize our strategic roadmap for executive leadership.",
        difficulty: 4,
        dataType: "trend_analysis",
        requirements: [" Strategic clarity", " Long-term vision", " Executive quality"],
        optimalChartTypes: ["line", "area"],
        acceptableChartTypes: ["line", "area"],
        timeLimit: 150
    }
];

