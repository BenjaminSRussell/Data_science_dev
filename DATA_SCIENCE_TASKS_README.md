# Data Science Tasks Database

## Overview

The game now includes **1000+ data science tasks** sourced from real-world scenarios across multiple domains. Tasks are organized by difficulty (1.0-10.0) with steady intellectual progression.

## Task Structure

Each task includes:
- **ID**: Unique identifier (ds_0001 to ds_1000)
- **Name**: Descriptive task name
- **Description**: Detailed task description with specific requirements
- **Domain**: Industry domain (finance, healthcare, ecommerce, marketing, etc.)
- **Difficulty**: 1.0-10.0 scale with 0.1 increments
- **DataType**: Type of data visualization/analysis required
- **Requirements**: List of required steps/analyses
- **Chart Types**: Optimal and acceptable visualization types
- **Time Limit**: Time allocated for task completion
- **Skills**: Required technical skills
- **Tools**: Required tools/software
- **Deliverable**: Expected output
- **Real-World Context**: Industry context

## Difficulty Progression

### Level 1.0-2.0: Junior Analyst
- Basic data extraction
- Simple aggregations
- Basic visualizations
- SQL queries
- Excel analysis

### Level 2.0-4.0: Data Analyst
- Statistical analysis
- Hypothesis testing
- Correlation analysis
- Regression modeling
- Classification models

### Level 4.0-6.0: Data Scientist
- Advanced machine learning
- Feature engineering
- Model optimization
- Deep learning basics
- NLP fundamentals

### Level 6.0-8.0: Senior Data Scientist
- Production ML systems
- MLOps
- Advanced deep learning
- Real-time systems
- Complex architectures

### Level 8.0-10.0: Principal/Lead Data Scientist
- Research-level ML
- Novel architectures
- Cutting-edge techniques
- Industry leadership
- Executive strategy

## Domains Covered

1. **Finance**: Banking, investment, insurance, fintech, trading
2. **Healthcare**: Hospitals, pharmaceuticals, medical devices, telemedicine
3. **E-commerce**: Retail, marketplace, subscription, dropshipping
4. **Marketing**: Digital, social media, email, content, advertising
5. **Manufacturing**: Quality control, supply chain, predictive maintenance
6. **Telecommunications**: Network optimization, customer analytics
7. **Transportation**: Logistics, route optimization, demand forecasting
8. **Energy**: Smart grids, consumption forecasting, renewable energy
9. **Education**: Learning analytics, student performance, curriculum optimization
10. **Social Media**: Content analysis, engagement, recommendation systems

## Integration

Tasks are automatically integrated into the game's TaskSystem:
- Tasks are selected based on player's current rank/difficulty
- Difficulty tolerance allows for smooth progression
- Random selection from appropriate difficulty range
- Tasks include real-world context and deliverables

## File Location

- **Generated Tasks**: `src/js/data/comprehensive_datascience_tasks.js`
- **Task Generator Script**: `scripts/build-1000-tasks.py`
- **Task System**: `src/js/game/TaskSystem.js`

## Regenerating Tasks

To regenerate tasks with different parameters or more specificity:

```bash
cd scripts
python3 build-1000-tasks.py
```

This will regenerate the comprehensive_datascience_tasks.js file with 1000 tasks.

## Enhancement Opportunities

For even more specific real-world tasks, consider:
1. Adding more domain-specific templates
2. Including actual company scenarios
3. Adding more granular difficulty steps
4. Including industry-specific tools and platforms
5. Adding team collaboration elements
6. Including regulatory/compliance aspects

## Usage in Game

The game automatically uses these tasks when:
- Player starts a new task
- Tasks are generated for current difficulty level
- Player progresses to new difficulty levels

Tasks are filtered by:
- Difficulty level (with tolerance)
- Domain variety
- Appropriate chart types for visualization

