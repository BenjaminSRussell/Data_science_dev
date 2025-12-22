#!/usr/bin/env python3
"""
Generate 1000+ Real-World Data Science Tasks
Creates comprehensive JavaScript file with specific tasks across domains and difficulties
"""

import json
import random

# Domain-specific task templates with real-world scenarios
DOMAINS = {
    'finance': {
        'subdomains': ['banking', 'investment', 'insurance', 'fintech', 'trading'],
        'entities': ['transactions', 'customers', 'accounts', 'loans', 'portfolios', 'trades'],
        'metrics': ['revenue', 'risk', 'fraud', 'default', 'volatility', 'returns']
    },
    'healthcare': {
        'subdomains': ['hospitals', 'pharmaceuticals', 'medical_devices', 'telemedicine'],
        'entities': ['patients', 'medications', 'treatments', 'clinical_trials', 'devices'],
        'metrics': ['outcomes', 'readmissions', 'adherence', 'efficacy', 'safety']
    },
    'ecommerce': {
        'subdomains': ['retail', 'marketplace', 'subscription', 'dropshipping'],
        'entities': ['products', 'orders', 'customers', 'inventory', 'reviews'],
        'metrics': ['sales', 'conversion', 'churn', 'lifetime_value', 'satisfaction']
    },
    'marketing': {
        'subdomains': ['digital', 'social_media', 'email', 'content', 'advertising'],
        'entities': ['campaigns', 'channels', 'audiences', 'content', 'conversions'],
        'metrics': ['engagement', 'roi', 'attribution', 'reach', 'ctr']
    },
    # Add more domains...
}

# Task types by difficulty
TASK_TYPES_BY_DIFFICULTY = {
    1.0: ['data_extraction', 'simple_aggregation', 'basic_visualization'],
    2.0: ['statistical_analysis', 'hypothesis_testing', 'correlation_analysis'],
    3.0: ['regression_modeling', 'classification', 'time_series'],
    4.0: ['advanced_ml', 'feature_engineering', 'model_optimization'],
    5.0: ['deep_learning', 'nlp', 'computer_vision'],
    6.0: ['production_ml', 'mlops', 'real_time_systems'],
    7.0: ['advanced_dl', 'reinforcement_learning', 'federated_learning'],
    8.0: ['research_ml', 'novel_architectures', 'cutting_edge'],
    9.0: ['leading_research', 'publication_quality', 'industry_leadership'],
    10.0: ['executive_strategy', 'ai_governance', 'transformational']
}

def generate_task(task_id, domain, difficulty):
    """Generate a specific task with real-world details"""
    domain_info = DOMAINS.get(domain, DOMAINS['finance'])
    subdomain = random.choice(domain_info['subdomains'])
    entity = random.choice(domain_info['entities'])
    metric = random.choice(domain_info['metrics'])
    
    # Determine task type based on difficulty
    task_type = None
    for d in sorted(TASK_TYPES_BY_DIFFICULTY.keys(), reverse=True):
        if difficulty >= d:
            task_type = random.choice(TASK_TYPES_BY_DIFFICULTY[d])
            break
    
    # Generate task details
    task = {
        'id': f'ds_{task_id:04d}',
        'name': generate_task_name(domain, entity, metric, difficulty),
        'description': generate_description(domain, subdomain, entity, metric, task_type, difficulty),
        'domain': domain,
        'difficulty': round(difficulty, 1),
        'dataType': get_data_type(task_type, difficulty),
        'requirements': generate_requirements(task_type, difficulty),
        'optimalChartTypes': get_chart_types(difficulty),
        'acceptableChartTypes': get_chart_types(difficulty, extended=True),
        'timeLimit': calculate_time_limit(difficulty),
        'skills': get_required_skills(difficulty, task_type),
        'tools': get_required_tools(difficulty),
        'deliverable': generate_deliverable(domain, entity, metric, difficulty),
        'realWorldContext': generate_real_world_context(domain, subdomain)
    }
    
    return task

def generate_task_name(domain, entity, metric, difficulty):
    """Generate realistic task name"""
    if difficulty < 2:
        return f'{entity.replace("_", " ").title()} {metric.replace("_", " ").title()} Report'
    elif difficulty < 4:
        return f'{metric.replace("_", " ").title()} Analysis for {entity.replace("_", " ").title()}'
    elif difficulty < 6:
        return f'{metric.replace("_", " ").title()} Prediction Model'
    else:
        return f'Advanced {metric.replace("_", " ").title()} System'

def generate_description(domain, subdomain, entity, metric, task_type, difficulty):
    """Generate detailed, realistic task description"""
    descriptions = {
        'data_extraction': f'Extract {entity} data from {subdomain} database. Expected volume: {random.randint(10000, 1000000)} records.',
        'statistical_analysis': f'Perform statistical analysis of {metric} across {entity} in {subdomain} context.',
        'regression_modeling': f'Build regression model to predict {metric} based on {entity} features.',
        'classification': f'Develop classification model to categorize {entity} by {metric} patterns.',
        'deep_learning': f'Implement deep learning solution for {metric} prediction using {entity} data.',
    }
    
    base_desc = descriptions.get(task_type, f'Analyze {metric} for {entity}')
    return f'{base_desc} Difficulty: {difficulty:.1f}. Real-world context: {subdomain} industry.'

def get_data_type(task_type, difficulty):
    """Determine data type based on task"""
    if 'time_series' in task_type or difficulty >= 3:
        return 'trend_analysis'
    elif 'classification' in task_type:
        return 'customer_demographics'
    elif 'regression' in task_type or difficulty >= 2:
        return 'performance_metrics'
    else:
        return 'category_breakdown'

def generate_requirements(task_type, difficulty):
    """Generate task requirements"""
    reqs = ['Data extraction', 'Analysis']
    if difficulty >= 2:
        reqs.append('Statistical validation')
    if difficulty >= 3:
        reqs.append('Model development')
    if difficulty >= 5:
        reqs.append('Advanced ML techniques')
    if difficulty >= 7:
        reqs.append('Production deployment')
    return reqs

def get_chart_types(difficulty, extended=False):
    """Get appropriate chart types"""
    if difficulty < 2:
        return ['bar', 'pie'] if not extended else ['bar', 'pie', 'table']
    elif difficulty < 4:
        return ['bar', 'line'] if not extended else ['bar', 'line', 'scatter']
    else:
        return ['line', 'scatter'] if not extended else ['line', 'scatter', 'heatmap', 'bar']

def calculate_time_limit(difficulty):
    """Calculate time limit based on difficulty"""
    return max(120, int(360 - (difficulty * 15)))

def get_required_skills(difficulty, task_type):
    """Get required skills"""
    skills = ['SQL', 'Data Analysis']
    if difficulty >= 2:
        skills.extend(['Python', 'Statistics'])
    if difficulty >= 3:
        skills.append('Machine Learning')
    if difficulty >= 5:
        skills.extend(['Deep Learning', 'TensorFlow'])
    if difficulty >= 7:
        skills.extend(['MLOps', 'Production Systems'])
    return skills

def get_required_tools(difficulty):
    """Get required tools"""
    tools = ['SQL Database']
    if difficulty >= 2:
        tools.extend(['Python', 'Pandas'])
    if difficulty >= 3:
        tools.append('Scikit-learn')
    if difficulty >= 5:
        tools.extend(['TensorFlow', 'PyTorch'])
    return tools

def generate_deliverable(domain, entity, metric, difficulty):
    """Generate deliverable description"""
    return f'{metric.replace("_", " ").title()} analysis report with recommendations'

def generate_real_world_context(domain, subdomain):
    """Generate real-world context"""
    return f'Industry: {subdomain}. Common task in {domain} sector.'

# Generate 1000 tasks
tasks = []
task_id = 1
domains = ['finance', 'healthcare', 'ecommerce', 'marketing', 'manufacturing',
           'telecommunications', 'transportation', 'energy', 'education', 'social_media']

for domain in domains:
    # Generate tasks across difficulty 1.0 to 10.0
    for difficulty in [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]:
        # Generate ~5-6 tasks per difficulty level per domain
        for _ in range(6):
            if task_id <= 1000:
                task = generate_task(task_id, domain, difficulty)
                tasks.append(task)
                task_id += 1

# Output as JavaScript file
js_content = f"""/**
 * Comprehensive Data Science Task Database
 * {len(tasks)} real-world tasks across multiple domains
 * Generated programmatically with specific real-world scenarios
 */

export const COMPREHENSIVE_DATA_SCIENCE_TASKS = {json.dumps(tasks, indent=2)};
"""

with open('../src/js/data/comprehensive_datascience_tasks.js', 'w') as f:
    f.write(js_content)

print(f"Generated {len(tasks)} data science tasks")
print(f"Difficulty range: {min(t['difficulty'] for t in tasks):.1f} - {max(t['difficulty'] for t in tasks):.1f}")
print(f"Domains: {len(set(t['domain'] for t in tasks))}")

