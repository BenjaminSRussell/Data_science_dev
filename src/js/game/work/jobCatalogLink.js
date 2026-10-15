/**
 * jobCatalogLink.js
 * One career ladder: JobSystem.JOB_CATEGORIES (#1827).
 * RealWorldTaskSystem task types are multi-step workflows for that ladder,
 * not a second catalog of jobs. Legacy role names (data_analyst,
 * data_engineer, ml_engineer, research_scientist) only filter workflows.
 * This module imports neither class, so the two files can both use it
 * without a cycle. RealWorldTaskSystem imports JOB_CATEGORIES itself.
 */

import { SKILL_TO_STAT } from '../ProjectSystem.js';

/** Career category id -> workflow role. Every JOB_CATEGORIES key must appear. */
export const JOB_CATEGORY_ROLES = {
    entry_level: 'data_analyst',
    junior_analyst: 'data_analyst',
    data_analyst: 'data_analyst',
    senior_analyst: 'ml_engineer',
    lead_scientist: 'research_scientist',
    principal_scientist: 'research_scientist',
    chief_data_officer: 'research_scientist'
};

/** Role names that are workflow filters. data_engineer is not a career tier. */
export const WORKFLOW_ROLES = ['data_analyst', 'data_engineer', 'ml_engineer', 'research_scientist'];

export const ROLE_WORKFLOWS = {
    data_analyst: [
        'data_cleaning', 'exploratory_analysis', 'github_bug_fix',
        'data_validation', 'ab_test_design', 'time_series_analysis',
        'feature_engineering', 'model_evaluation', 'clustering_analysis'
    ],
    data_engineer: [
        'etl_pipeline', 'data_cleaning', 'github_feature',
        'data_validation', 'database_optimization', 'api_development',
        'feature_engineering', 'pipeline_optimization'
    ],
    ml_engineer: [
        'model_training', 'data_cleaning', 'github_feature',
        'classification_model', 'regression_model', 'hyperparameter_tuning',
        'model_evaluation', 'model_deployment', 'feature_engineering',
        'nlp_text_analysis', 'clustering_analysis'
    ],
    research_scientist: [
        'ai_model_training', 'model_training', 'exploratory_analysis',
        'time_series_analysis', 'nlp_text_analysis', 'hyperparameter_tuning',
        'clustering_analysis', 'model_evaluation'
    ]
};

/**
 * Career assignment id -> workflow id. Pay and unlocks stay on the career
 * task; the workflow is how that assignment is played. Each id is in the
 * role list for that task's category, outside the university-lab filter.
 */
export const CAREER_TASK_WORKFLOW = {
    data_entry: 'data_cleaning',
    spreadsheet_cleanup: 'data_validation',
    customer_survey: 'exploratory_analysis',
    sales_report: 'exploratory_analysis',
    customer_segmentation: 'clustering_analysis',
    website_analytics: 'exploratory_analysis',
    churn_prediction: 'model_evaluation',
    pricing_optimization: 'exploratory_analysis',
    ab_test_analysis: 'ab_test_design',
    fraud_detection: 'classification_model',
    supply_chain_optimization: 'regression_model',
    market_research: 'clustering_analysis',
    ml_model_production: 'model_training',
    recommendation_engine: 'model_training',
    predictive_maintenance: 'time_series_analysis',
    research_agenda: 'exploratory_analysis',
    causal_inference_platform: 'model_evaluation',
    mentor_staff: 'exploratory_analysis',
    data_strategy: 'exploratory_analysis',
    ai_governance: 'model_evaluation',
    acquisition_due_diligence: 'model_evaluation'
};

const CHARACTER_STATS = new Set([
    'intelligence', 'charisma', 'focus', 'analytics', 'python_sql', 'statistics'
]);

// Tool skills that are not in ProjectSystem.SKILL_TO_STAT. Destinations match
// the map RealWorldTaskSystem used before this link existed.
const EXTRA_SKILL_TO_STAT = {
    pandas: 'analytics', matplotlib: 'analytics', data_processing: 'analytics',
    airflow: 'focus', git: 'focus', testing: 'focus', documentation: 'charisma',
    optimization: 'focus', performance: 'focus', database: 'analytics'
};

/** Character-stat id for either a career skill or a workflow tool skill. */
export function resolveSkillStat(skill) {
    if (CHARACTER_STATS.has(skill)) return skill;
    return SKILL_TO_STAT[skill] || EXTRA_SKILL_TO_STAT[skill] || 'analytics';
}

/**
 * Reputation at full quality. Explicit reputationReward wins; otherwise
 * 5 per difficulty point. JobSystem.reputationFor delegates here.
 */
export function reputationForTask(task) {
    const explicit = Number(task?.reputationReward);
    if (Number.isFinite(explicit) && explicit >= 0) return explicit;
    return Math.max(1, (Number(task?.difficulty) || 1) * 5);
}

/**
 * Split a workflow's experience pool across its skills the way
 * RealWorldTaskSystem.completeTask does (remainder to the earliest skills).
 * @returns {Record<string, number>}
 */
export function splitExperience(skills, total) {
    const list = Array.isArray(skills) ? skills : Object.keys(skills || {});
    const xpByStat = {};
    const amount = Math.round(Number(total) || 0);
    if (!list.length || amount <= 0) return xpByStat;
    const per = Math.floor(amount / list.length);
    let remainder = amount - per * list.length;
    for (const skill of list) {
        const stat = resolveSkillStat(skill);
        const share = per + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        if (share > 0) xpByStat[stat] = (xpByStat[stat] || 0) + share;
    }
    return xpByStat;
}

/**
 * One reward view for either catalog. Does not rescale payouts.
 * Career task: basePay, xpReward, reputationForTask.
 * Workflow: reward.money / reputation / experience.
 */
export function describeWorkReward(entry) {
    const empty = { money: 0, reputation: 0, experience: 0, xpByStat: {} };
    if (!entry || typeof entry !== 'object') return empty;
    if (entry.reward && typeof entry.reward === 'object') {
        const experience = Math.round(Number(entry.reward.experience) || 0);
        return {
            money: Number(entry.reward.money) || 0,
            reputation: Number(entry.reward.reputation) || 0,
            experience,
            xpByStat: splitExperience(entry.skills, experience)
        };
    }
    const xpByStat = {};
    for (const [stat, raw] of Object.entries(entry.xpReward || {})) {
        const n = Number(raw);
        if (!Number.isFinite(n) || n === 0) continue;
        const id = resolveSkillStat(stat);
        xpByStat[id] = (xpByStat[id] || 0) + n;
    }
    const experience = Object.values(xpByStat).reduce((sum, n) => sum + n, 0);
    return {
        money: Number(entry.basePay) || 0,
        reputation: reputationForTask(entry),
        experience,
        xpByStat
    };
}

/** Workflow-role id for a career category or a legacy role name. */
export function resolveJobRole(jobId) {
    if (ROLE_WORKFLOWS[jobId]) return jobId;
    return JOB_CATEGORY_ROLES[jobId] || 'data_analyst';
}

/**
 * Workflow ids a job may offer. Unknown ids use the entry-level list, not
 * every workflow. The lab task replaces that list only when the role
 * actually has it (#1819).
 */
export function workflowsForJob(jobId, context = {}) {
    const role = resolveJobRole(jobId);
    let available = (ROLE_WORKFLOWS[role] || ROLE_WORKFLOWS.data_analyst).slice();
    if (context.inUniversityLab && available.includes('ai_model_training')) {
        return ['ai_model_training'];
    }
    if (!context.inUniversityLab) {
        available = available.filter(id => id !== 'ai_model_training');
    }
    return available;
}

export function workflowForCareerTask(taskId) {
    const id = typeof taskId === 'string' ? taskId : taskId?.id;
    return CAREER_TASK_WORKFLOW[id] || null;
}

/** Career category ids with no workflow role. */
export function unmappedCareerCategories(categoryIds) {
    return (categoryIds || []).filter(id => !JOB_CATEGORY_ROLES[id]);
}
