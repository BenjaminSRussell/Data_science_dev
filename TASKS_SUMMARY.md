# 1000 Data Science Tasks - Summary

## ✅ Task Generation Complete

**Total Tasks**: 1000  
**Difficulty Range**: 1.0 - 9.8 (steady progression)  
**Domains**: 9 industries

## Task Characteristics

Each task includes:

### ✅ Specific Details
- **Exact data volumes**: e.g., "189,018 credit card transactions"
- **Specific dollar amounts**: e.g., "$3,403", "$100,000 portfolio"
- **Precise metrics**: e.g., "fraud rate: 1.98%", "target accuracy: 89%"
- **Timeframes**: e.g., "last 2 years", "next 3 months"
- **Counts**: e.g., "15 merchant categories", "4 locations"

### ✅ Real-World Tools
- **Specific versions**: "Python 3.10", "PostgreSQL 14", "Scikit-learn 1.1"
- **Industry tools**: "Tableau", "SAS Enterprise Miner", "TensorFlow"
- **Deployment**: "REST API", "Kubernetes", "microservice"

### ✅ Business Context
- **Industry scenarios**: Banking fraud detection, hospital readmissions, e-commerce demand forecasting
- **Business metrics**: ROI targets, conversion rates, market share
- **Real constraints**: Latency requirements, accuracy targets, scale requirements

### ✅ Skills & Requirements
- **Technical skills**: SQL, Python, Machine Learning, Deep Learning, MLOps
- **Domain expertise**: Healthcare analytics, Financial risk modeling, Marketing attribution
- **Progressive complexity**: From basic SQL to advanced ML systems

## Example Tasks

### Difficulty 1.0 (Entry Level)
```
Name: Daily Credit Card Transaction Fraud Detection
Description: Analyze 189,018 credit card transactions from yesterday. 
Transactions span 15 merchant categories. Use Python 3.10 + Pandas to 
identify anomalous patterns. Flag transactions exceeding $3,403 or 
occurring in 4 locations within 1 hours. Expected fraud rate: 1.98%.
Tools: PostgreSQL 14, Python 3.10 + Pandas, Tableau
```

### Difficulty 2.0 (Data Analyst)
```
Name: Loan Default Risk Scoring Model
Description: Build binary classification model for loan default prediction. 
Dataset: 80,913 loan applications from last 2 years. Features: credit score 
(300-850), debt-to-income ratio, employment length (0-40 years), loan amount 
($1,000-$500,000), loan term (15 years). Target: 30-day default rate of 7.4%. 
Use XGBoost algorithm. Evaluate with ROC-AUC (target: >0.85).
Tools: Python 3.10, Scikit-learn 1.1, Pandas 1.5
```

### Difficulty 4.0+ (Data Scientist)
```
Name: Advanced Data Analysis System for Consumption Forecasting
Description: Develop production-ready ML system processing 5,170,381 records. 
Implement deep learning approach. Deploy via batch processing. Include 
monitoring, logging, and performance optimization. Target latency: <446ms 
per prediction.
Tools: Python 3.10, Pandas, Scikit-learn, TensorFlow
```

## Integration

Tasks are automatically integrated into the game:
- Selected based on player's current difficulty/rank
- Difficulty tolerance allows smooth progression
- Random selection from appropriate difficulty range
- Includes all metadata (tools, skills, deliverables)

## File Location

- **Generated Tasks**: `src/js/data/comprehensive_datascience_tasks.js`
- **Generator Script**: `scripts/build-specific-tasks.py`
- **Task System**: `src/js/game/TaskSystem.js`

## Regeneration

To regenerate tasks with different parameters:

```bash
cd scripts
python3 build-specific-tasks.py
```

This creates a new `comprehensive_datascience_tasks.js` with 1000 tasks.

